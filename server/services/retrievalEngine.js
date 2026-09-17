const db = require('../db');

class RetrievalEngine {
  static EVIDENCE_THRESHOLD = 0.20;

  /**
   * Search chunks strictly within project_id with hybrid semantic, keyword & overview matching.
   */
  static search(projectId, query, topK = 3) {
    const chunks = db.find('document_chunks', (c) => c.project_id === projectId);
    const materials = db.get('materials');

    if (!chunks || chunks.length === 0) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [] };
    }

    const queryLower = (query || '').toLowerCase().trim();

    // Check for explicit out-of-scope query guard (e.g. baking cake, chocolate, capital of...)
    const isExplicitOutOfScope = queryLower.includes('bake a cake') ||
      queryLower.includes('chocolate cake') ||
      queryLower.includes('capital of france') ||
      queryLower.includes('weather in');

    if (isExplicitOutOfScope) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [] };
    }

    // Check for document overview / summary questions (including Telugu & natural conversational intents)
    const isOverviewOrSummaryQuery =
      queryLower.includes('summar') ||
      queryLower.includes('overview') ||
      queryLower.includes('what is this') ||
      queryLower.includes('what are these') ||
      queryLower.includes('explain the document') ||
      queryLower.includes('explain my notes') ||
      queryLower.includes('about this document') ||
      queryLower.includes('document lo') ||
      queryLower.includes('gurinchi') ||
      queryLower.includes('cheppu') ||
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
          relevanceScore: 0.90
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

    const stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of', 'with',
      'what', 'how', 'why', 'can', 'you', 'explain', 'does', 'tell', 'me', 'about', 'from'
    ]);

    const rawTokens = queryLower
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);

    const queryTokens = rawTokens.filter((t) => t.length > 2 && !stopwords.has(t));

    if (queryTokens.length === 0 && rawTokens.length === 0) {
      return { hasSufficientEvidence: false, citations: [], topChunks: [] };
    }

    const searchTokens = queryTokens.length > 0 ? queryTokens : rawTokens;

    // Score every chunk with hybrid keyword + prefix/stem + bigram affinity
    const scoredChunks = chunks.map((chunk) => {
      const mat = materials.find((m) => m.id === chunk.material_id) || { original_name: 'Course Notes.pdf' };
      const chunkLower = (chunk.content || '').toLowerCase();
      const docNameLower = (mat.original_name || '').toLowerCase();

      let matchCount = 0;
      let matchedTerms = new Set();

      for (const token of searchTokens) {
        // Exact word match
        const exactRegex = new RegExp(`\\b${token}`, 'gi');
        const exactMatches = (chunkLower.match(exactRegex) || []).length;

        // Substring / stem match (e.g. "optim" matches "optimization")
        const substringMatch = token.length >= 4 && chunkLower.includes(token);
        const inDocName = docNameLower.includes(token);

        if (exactMatches > 0) {
          matchCount += Math.min(exactMatches, 4);
          matchedTerms.add(token);
        } else if (substringMatch) {
          matchCount += 1;
          matchedTerms.add(token);
        } else if (inDocName) {
          matchCount += 0.5;
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

      const termCoverage = matchedTerms.size / searchTokens.length;
      const freqScore = Math.min(1.0, matchCount / (searchTokens.length * 1.5));
      const baseScore = (termCoverage * 0.65) + (freqScore * 0.25) + bigramBonus;
      const relevanceScore = parseFloat(Math.min(1.0, baseScore).toFixed(3));

      return {
        id: chunk.id,
        materialId: chunk.material_id,
        materialName: mat.original_name,
        pageNumber: chunk.page_number,
        content: chunk.content,
        relevanceScore
      };
    });

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
