const db = require('../db');

class RetrievalEngine {
  static EVIDENCE_THRESHOLD = 0.25;

  /**
   * Search chunks strictly within project_id. No SQL required!
   */
  static search(projectId, query, topK = 3) {
    //It searches only within the project
    const chunks = db.find('document_chunks', (c) => c.project_id === projectId);
    const materials = db.get('materials');

    if (!chunks || chunks.length === 0) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [] };
    }

    const stopwords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of', 'with', 'what', 'how', 'why', 'can', 'you', 'explain', 'does']);
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !stopwords.has(t));

    if (queryTokens.length === 0) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [] };
    }
    // score every chunk based on relevance
    const scoredChunks = chunks.map((chunk) => {
      const mat = materials.find((m) => m.id === chunk.material_id) || { original_name: 'Course Notes.pdf' };
      let matchCount = 0;
      let matchedTerms = [];

      for (const token of queryTokens) {
        const regex = new RegExp(`\\b${token}`, 'gi');
        const matches = (chunk.content.match(regex) || []).length;
        if (matches > 0) {
          matchCount += Math.min(matches, 4);
          matchedTerms.push(token);
        }
      }

      const termCoverage = matchedTerms.length / queryTokens.length;
      const freqScore = Math.min(1.0, matchCount / (queryTokens.length * 2));
      const relevanceScore = parseFloat(((termCoverage * 0.7) + (freqScore * 0.3)).toFixed(3));

      return {
        id: chunk.id,
        materialId: chunk.material_id,
        materialName: mat.original_name,
        pageNumber: chunk.page_number, // page numbers
        content: chunk.content,
        relevanceScore
      };
    });
    // sort by highest score and take top 3
    const filtered = scoredChunks
      .filter((c) => c.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);

    const topScore = filtered.length > 0 ? filtered[0].relevanceScore : 0;
    const hasSufficientEvidence = topScore >= this.EVIDENCE_THRESHOLD;

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
      topChunks: filtered
    };
  }
}

module.exports = { RetrievalEngine };
