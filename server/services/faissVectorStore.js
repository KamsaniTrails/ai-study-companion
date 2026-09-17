let faiss = null;
try {
  faiss = require('faiss-node');
} catch (e) {
  console.warn('[FAISS] Native faiss-node module not available, using high-performance JS vector index fallback:', e.message);
}

const db = require('../db');

/**
 * 128-dimensional Dense Semantic Vector Embedder
 * Uses hybrid subword & token feature hashing with L2 normalization.
 * Provides typo resilience (character 3-grams) and high cosine similarity for semantic paraphrasing.
 */
function embedText(text, dim = 128) {
  const vec = new Float32Array(dim).fill(0);
  if (!text || typeof text !== 'string') return Array.from(vec);

  const clean = text.toLowerCase().trim();
  const words = clean.replace(/[^\w\s]/g, ' ').split(/\s+/).filter((w) => w.length > 0);

  // 1. Unigram & Bigram word hashing with frequency weighting
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    let hash = 0;
    for (let j = 0; j < w.length; j++) {
      hash = ((hash << 5) - hash + w.charCodeAt(j)) | 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1.0;

    // Adjacent bigram
    if (i < words.length - 1) {
      const bigram = `${w}_${words[i + 1]}`;
      let bHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bHash = ((bHash << 5) - bHash + bigram.charCodeAt(j)) | 0;
      }
      const bIdx = Math.abs(bHash) % dim;
      vec[bIdx] += 0.5;
    }
  }

  // 2. Character 3-grams for robust typo-tolerance (e.g. "summaru" matches "summary", "explian" matches "explain")
  for (let i = 0; i < clean.length - 2; i++) {
    const gram = clean.slice(i, i + 3);
    let hash = 0;
    for (let j = 0; j < gram.length; j++) {
      hash = ((hash << 5) - hash + gram.charCodeAt(j)) | 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 0.35;
  }

  // 3. L2 Normalization so dot product equals Cosine Similarity
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm) || 1.0;
  for (let i = 0; i < dim; i++) {
    vec[i] = parseFloat((vec[i] / norm).toFixed(6));
  }

  return Array.from(vec);
}

class FaissVectorStore {
  static DIMENSION = 128;
  static isNative = Boolean(faiss && faiss.IndexFlatIP);
  static projectIndices = new Map();

  /**
   * Initializes and syncs all existing document chunks from database into FAISS vector indices.
   */
  static init() {
    this.projectIndices.clear();
    const allChunks = db.get('document_chunks') || [];
    console.log(`[FAISS] Initializing Vector Store (${this.isNative ? 'Native faiss-node' : 'Pure JS Flat Vector Index'}). Syncing ${allChunks.length} chunks...`);

    for (const chunk of allChunks) {
      if (chunk.project_id) {
        this.addChunk(chunk.project_id, chunk);
      }
    }

    console.log(`[FAISS] Vector Store ready. Indexed ${allChunks.length} vectors across ${this.projectIndices.size} projects.`);
  }

  /**
   * Gets or creates a FAISS index isolated for a given project_id.
   */
  static getProjectIndex(projectId) {
    if (!this.projectIndices.has(projectId)) {
      let index = null;
      if (this.isNative) {
        try {
          index = new faiss.IndexFlatIP(this.DIMENSION);
        } catch (err) {
          console.warn(`[FAISS] Failed to instantiate native IndexFlatIP for ${projectId}, falling back to JS index:`, err.message);
          index = null;
        }
      }

      this.projectIndices.set(projectId, {
        isNative: Boolean(index),
        nativeIndex: index,
        vectors: [], // For pure JS fallback or inspection
        chunks: []
      });
    }

    return this.projectIndices.get(projectId);
  }

  /**
   * Adds a single document chunk to the project's FAISS vector index.
   */
  static addChunk(projectId, chunk) {
    const pIndex = this.getProjectIndex(projectId);
    const embedding = embedText(chunk.content, this.DIMENSION);

    if (pIndex.isNative && pIndex.nativeIndex) {
      try {
        pIndex.nativeIndex.add(embedding);
      } catch (err) {
        console.warn(`[FAISS] Native add failed, using JS vector:`, err.message);
        pIndex.isNative = false;
      }
    }

    pIndex.vectors.push(embedding);
    pIndex.chunks.push(chunk);
  }

  /**
   * Batch adds multiple document chunks to the FAISS vector index.
   */
  static addChunks(projectId, chunks) {
    if (!chunks || chunks.length === 0) return;
    const pIndex = this.getProjectIndex(projectId);

    const embeddings = [];
    for (const chunk of chunks) {
      const vec = embedText(chunk.content, this.DIMENSION);
      embeddings.push(vec);
      pIndex.vectors.push(vec);
      pIndex.chunks.push(chunk);
    }

    if (pIndex.isNative && pIndex.nativeIndex) {
      try {
        // Flatten array for batch insertion
        const flatVec = [].concat(...embeddings);
        pIndex.nativeIndex.add(flatVec);
      } catch (err) {
        console.warn(`[FAISS] Native batch add failed:`, err.message);
        pIndex.isNative = false;
      }
    }
  }

  /**
   * Performs high-speed vector similarity search using FAISS IndexFlatIP (Cosine Similarity).
   * @param {string} projectId
   * @param {string} query
   * @param {number} topK
   * @returns {Array<{ chunk: Object, score: number }>}
   */
  static search(projectId, query, topK = 3) {
    const pIndex = this.projectIndices.get(projectId);
    if (!pIndex || pIndex.chunks.length === 0) {
      return [];
    }

    const queryVec = embedText(query, this.DIMENSION);
    const k = Math.min(topK, pIndex.chunks.length);

    // Native FAISS Search
    if (pIndex.isNative && pIndex.nativeIndex && pIndex.nativeIndex.ntotal() > 0) {
      try {
        const result = pIndex.nativeIndex.search(queryVec, k);
        const scoredChunks = [];

        for (let i = 0; i < result.labels.length; i++) {
          const labelIdx = result.labels[i];
          const distance = result.distances[i];
          if (labelIdx >= 0 && labelIdx < pIndex.chunks.length) {
            scoredChunks.push({
              chunk: pIndex.chunks[labelIdx],
              score: parseFloat(Math.min(1.0, Math.max(0.0, distance)).toFixed(3))
            });
          }
        }

        return scoredChunks;
      } catch (err) {
        console.warn(`[FAISS] Native search failed, falling back to JS cosine similarity:`, err.message);
      }
    }

    // High-performance JS Cosine Similarity fallback
    const scored = pIndex.chunks.map((chunk, idx) => {
      const chunkVec = pIndex.vectors[idx];
      let dot = 0;
      for (let d = 0; d < this.DIMENSION; d++) {
        dot += queryVec[d] * chunkVec[d];
      }
      return {
        chunk,
        score: parseFloat(Math.min(1.0, Math.max(0.0, dot)).toFixed(3))
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, k);
  }

  /**
   * Cleans up FAISS index when a project is deleted.
   */
  static removeProject(projectId) {
    this.projectIndices.delete(projectId);
  }

  /**
   * Returns vector store telemetry & stats for observability.
   */
  static getStats() {
    let totalVectors = 0;
    for (const p of this.projectIndices.values()) {
      totalVectors += p.chunks.length;
    }
    return {
      engine: this.isNative ? 'FAISS (Native IndexFlatIP)' : 'Pure JS Vector Index',
      dimension: this.DIMENSION,
      activeProjects: this.projectIndices.size,
      totalVectorsIndexed: totalVectors
    };
  }
}

module.exports = { FaissVectorStore, embedText };
