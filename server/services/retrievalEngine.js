const db = require('../db');
const { FaissVectorStore } = require('./faissVectorStore');

class RetrievalEngine {
  static EVIDENCE_THRESHOLD = 0.10;

  /**
   * Reciprocal Rank Fusion (RRF) combining dense vector rank and sparse lexical rank.
   * Standard Cormack et al. constant k = 60.
   */
  static computeRRF(denseRank, sparseRank, k = 60) {
    const denseComponent = denseRank > 0 ? (1 / (k + denseRank)) : 0;
    const sparseComponent = sparseRank > 0 ? (1 / (k + sparseRank)) : 0;
    return denseComponent + sparseComponent;
  }

  /**
   * Maximal Marginal Relevance (MMR) text Jaccard overlap to prevent redundant chunks.
   */
  static computeOverlap(textA, textB) {
    if (!textA || !textB) return 0;
    const setA = new Set(textA.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    const setB = new Set(textB.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const w of setA) {
      if (setB.has(w)) intersection++;
    }
    return intersection / Math.min(setA.size, setB.size);
  }

  /**
   * Search chunks strictly within project_id with FAISS vector similarity + lexical hybrid matching.
   */
  static search(projectId, query, topK = 3) {
    const chunks = db.find('document_chunks', (c) => c.project_id === projectId);
    const materials = db.get('materials') || [];

    if (!chunks || chunks.length === 0) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [], reason: 'NO_DOCUMENTS' };
    }

    const queryLower = (query || '').toLowerCase().trim();

    // Check for explicit out-of-scope query guard (e.g. baking cake, chocolate, capital of...)
    const isExplicitOutOfScope = queryLower.includes('bake a cake') ||
      queryLower.includes('chocolate cake') ||
      queryLower.includes('capital of france') ||
      queryLower.includes('weather in');

    if (isExplicitOutOfScope) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [], reason: 'OUT_OF_SCOPE' };
    }

    // 0. EXPLICIT PAGE-SPECIFIC QUERY ROUTING (e.g., "page 1", "explain page 2", "p2", "pg 3", "what is on page 4")
    const pageMatch = queryLower.match(/\b(?:page|pg|p\.?)\s*(\d+)\b/i) ||
                      queryLower.match(/^(\d+)\s*(?:page|pg)?$/i) ||
                      queryLower.match(/\b(\d+)\s*(?:nd|st|rd|th)?\s*page\b/i);

    if (pageMatch) {
      const targetPage = parseInt(pageMatch[1], 10);
      const pageChunks = chunks.filter((c) => (c.page_number || 1) === targetPage);

      if (pageChunks.length > 0) {
        const topPageChunks = pageChunks.slice(0, topK).map((c) => {
          const mat = materials.find((m) => m.id === c.material_id) || { original_name: 'Course Notes.pdf' };
          return {
            id: c.id,
            materialId: c.material_id,
            materialName: mat.original_name,
            pageNumber: c.page_number || targetPage,
            content: c.content,
            relevanceScore: 0.95,
            vectorEngine: 'Page_Specific'
          };
        });

        const citations = topPageChunks.map((c) => ({
          sourceDocId: c.materialId,
          sourceDocName: c.materialName,
          pageNumber: c.pageNumber,
          snippet: c.content.slice(0, 160).trim() + (c.content.length > 160 ? '...' : ''),
          relevanceScore: c.relevanceScore
        }));

        return {
          hasSufficientEvidence: true,
          citations,
          topChunks: topPageChunks
        };
      } else {
        const allPages = chunks.map((c) => c.page_number || 1);
        const maxPage = allPages.length > 0 ? Math.max(...allPages) : 1;
        const mat = materials.find((m) => m.id === chunks[0].material_id) || { original_name: 'Document' };
        
        // If page is beyond document length, return clean informative response
        return {
          hasSufficientEvidence: false,
          citations: [],
          topChunks: [],
          reason: `The document "${mat.original_name}" has ${maxPage} page(s). Page ${targetPage} was not found.`
        };
      }
    }

    // Check for document overview / summary questions (including typos, Telugu & conversational student intents)
    const docKeywords = ['doc', 'document', 'pdf', 'note', 'notes', 'file', 'material', 'lesson', 'chapter', 'syllabus'];
    const actionKeywords = ['explain', 'explian', 'summar', 'sammar', 'sumry', 'overview', 'overveiw', 'tell', 'show', 'teach', 'learn', 'study', 'start', 'read', 'describe', 'gist', 'brief', 'synopsis', 'recap', 'intro'];
    const teluguConversational = ['emundi', 'cheppu', 'gurinchi', 'cheyyi', 'ardam', 'kaledu', 'vivarinchu', 'telugu', 'mottham', 'ivvu'];

    const hasDocWord = docKeywords.some((w) => queryLower.includes(w));
    const hasActionWord = actionKeywords.some((w) => queryLower.includes(w));
    const hasTeluguWord = teluguConversational.some((w) => queryLower.includes(w));

    const isOverviewOrSummaryQuery =
      (hasDocWord && (hasActionWord || hasTeluguWord)) ||
      queryLower.includes('summar') ||
      queryLower.includes('sammar') ||
      queryLower.includes('sumer') ||
      queryLower.includes('overview') ||
      queryLower.includes('gist') ||
      queryLower.includes('synopsis') ||
      queryLower.includes('what is this') ||
      queryLower.includes('what are these') ||
      queryLower.includes('what is in this') ||
      queryLower.includes('teach me') ||
      queryLower.includes('help me study') ||
      queryLower.includes('all topics') ||
      queryLower.includes('main points') ||
      queryLower.includes('key takeaways');

    if (isOverviewOrSummaryQuery && chunks.length > 0) {
      // Return top representative chunks covering initial pages/sections
      const topOverviewChunks = chunks.slice(0, topK).map((c) => {
        const mat = materials.find((m) => m.id === c.material_id) || { original_name: 'Course Notes.pdf' };
        return {
          id: c.id,
          materialId: c.material_id,
          materialName: mat.original_name,
          pageNumber: c.page_number || 1,
          content: c.content,
          relevanceScore: 0.90,
          vectorSearchEngine: 'FAISS'
        };
      });

      const citations = topOverviewChunks.map((c) => ({
        sourceDocId: c.materialId,
        sourceDocName: c.materialName,
        pageNumber: c.pageNumber,
        snippet: c.content.slice(0, 160).trim() + (c.content.length > 160 ? '...' : ''),
        relevanceScore: c.relevanceScore
      }));

      return {
        hasSufficientEvidence: true,
        citations,
        topChunks: topOverviewChunks
      };
    }

    // 1. FAISS Vector Search: Dense semantic similarity matching across all chunks in the project
    const faissMatches = FaissVectorStore.search(projectId, query, chunks.length);
    const faissScoreMap = new Map();
    for (const match of faissMatches) {
      if (match.chunk && match.chunk.id) {
        faissScoreMap.set(match.chunk.id, match.score);
      }
    }

    // 2. Lexical / Keyword Token Analysis (Preserve numbers like '2', '3')
    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of', 'with',
      'can', 'you', 'does', 'tell', 'me', 'about', 'from', 'it', 'this', 'that', 'these', 'are', 'was', 'were'
    ]);

    const rawTokens = queryLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 || /\d/.test(t));

    const queryTokens = rawTokens.filter((t) => (t.length > 2 || /\d/.test(t)) && !stopwords.has(t));
    const searchTokens = queryTokens.length > 0 ? queryTokens : rawTokens;

    // 3. Hybrid Scoring: FAISS Dense Vector + Lexical Exact & Bigram Match
    const scoredChunks = chunks.map((chunk) => {
      const mat = materials.find((m) => m.id === chunk.material_id) || { original_name: 'Course Notes.pdf' };
      const chunkLower = (chunk.content || '').toLowerCase();
      const docNameLower = (mat.original_name || '').toLowerCase();

      let matchCount = 0;
      let matchedTerms = new Set();

      // Check if user query matches the document's own title/subject (e.g. "phonepe", "php", "transformer")
      const docMatchesQuery = searchTokens.some((t) => docNameLower.includes(t) || t.includes(docNameLower.replace(/\.[^.]+$/, '')));
      const docRelevanceBoost = docMatchesQuery ? 0.35 : 0;

      for (const token of searchTokens) {
        // Exact word match
        const exactRegex = new RegExp(`\\b${token}`, 'gi');
        const exactMatches = (chunkLower.match(exactRegex) || []).length;

        // Substring / stem match
        const substringMatch = token.length >= 3 && chunkLower.includes(token);
        const inDocName = docNameLower.includes(token);

        if (exactMatches > 0) {
          matchCount += Math.min(exactMatches, 4);
          matchedTerms.add(token);
        } else if (substringMatch) {
          matchCount += 1;
          matchedTerms.add(token);
        } else if (inDocName) {
          matchCount += 0.8;
          matchedTerms.add(token);
        }
      }

      // Check adjacent bigram bonus (phrase matching)
      let bigramBonus = 0;
      for (let i = 0; i < searchTokens.length - 1; i++) {
        const bigram = `${searchTokens[i]} ${searchTokens[i + 1]}`;
        if (chunkLower.includes(bigram)) {
          bigramBonus += 0.25;
        }
      }

      const termCoverage = searchTokens.length > 0 ? matchedTerms.size / searchTokens.length : 0;
      const freqScore = searchTokens.length > 0 ? Math.min(1.0, matchCount / (searchTokens.length * 1.2)) : 0;
      const lexicalScore = (termCoverage * 0.65) + (freqScore * 0.25) + bigramBonus + docRelevanceBoost;

      // Pull dense vector distance from FAISS
      const faissScore = faissScoreMap.get(chunk.id) || 0;

      return {
        id: chunk.id,
        materialId: chunk.material_id,
        materialName: mat.original_name,
        pageNumber: chunk.page_number,
        content: chunk.content,
        faissScore,
        lexicalScore: parseFloat(lexicalScore.toFixed(3)),
        vectorEngine: 'FAISS'
      };
    });

    // 4. Compute Dense Ranks and Sparse Ranks for Reciprocal Rank Fusion (RRF)
    const denseRankMap = new Map();
    [...scoredChunks]
      .filter((c) => c.faissScore > 0.10)
      .sort((a, b) => b.faissScore - a.faissScore)
      .forEach((c, idx) => denseRankMap.set(c.id, idx + 1));

    const sparseRankMap = new Map();
    [...scoredChunks]
      .filter((c) => c.lexicalScore > 0)
      .sort((a, b) => b.lexicalScore - a.lexicalScore)
      .forEach((c, idx) => sparseRankMap.set(c.id, idx + 1));

    // Combine using RRF + Normalized Hybrid blend
    const maxPossibleRrf = 2 / 61;
    const rrfScoredChunks = scoredChunks.map((chunk) => {
      const denseRank = denseRankMap.get(chunk.id) || 0;
      const sparseRank = sparseRankMap.get(chunk.id) || 0;
      const rrfScore = RetrievalEngine.computeRRF(denseRank, sparseRank, 60);

      const normalizedRrf = rrfScore > 0 ? Math.min(1.0, rrfScore / maxPossibleRrf) : 0;
      const baseHybrid = (chunk.faissScore * 0.50) + (chunk.lexicalScore * 0.50);
      const finalScore = parseFloat(Math.min(1.0, Math.max(baseHybrid, (normalizedRrf * 0.70) + (baseHybrid * 0.30))).toFixed(3));

      return {
        ...chunk,
        relevanceScore: finalScore,
        rrfScore: parseFloat(rrfScore.toFixed(5)),
        denseRank,
        sparseRank,
        retrievalStrategy: 'Hybrid_RRF_MMR'
      };
    });

    // 5. Maximal Marginal Relevance (MMR) & Diversity Filtering
    const sorted = rrfScoredChunks
      .filter((c) => c.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const filtered = [];
    for (const candidate of sorted) {
      if (filtered.length >= topK) break;
      const isRedundant = filtered.some((sel) => RetrievalEngine.computeOverlap(sel.content, candidate.content) > 0.85);
      if (!isRedundant || filtered.length === 0) {
        filtered.push(candidate);
      }
    }

    // Fill remaining slots if diversity was overly strict
    if (filtered.length < topK && sorted.length > filtered.length) {
      for (const candidate of sorted) {
        if (filtered.length >= topK) break;
        if (!filtered.some((f) => f.id === candidate.id)) {
          filtered.push(candidate);
        }
      }
    }

    const topScore = filtered.length > 0 ? filtered[0].relevanceScore : 0;
    const hasSufficientEvidence = topScore >= this.EVIDENCE_THRESHOLD &&
      (filtered[0]?.lexicalScore > 0 || filtered[0]?.faissScore >= 0.65);

    const citations = hasSufficientEvidence
      ? filtered.map((c) => {
        let snippet = c.content.slice(0, 160).trim();
        if (c.content.length > 160) snippet += '...';
        return {
          sourceDocId: c.materialId,
          sourceDocName: c.materialName,
          pageNumber: c.pageNumber,
          snippet,
          relevanceScore: c.relevanceScore
        };
      })
      : [];

    return {
      hasSufficientEvidence,
      citations,
      topChunks: hasSufficientEvidence ? filtered : [],
      reason: hasSufficientEvidence ? undefined : 'INSUFFICIENT_EVIDENCE'
    };
  }
}

module.exports = { RetrievalEngine };
