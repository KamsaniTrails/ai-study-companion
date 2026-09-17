const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { aiProvider } = require('./aiProvider');

class FeynmanService {
  /**
   * Start a Feynman drill where AI poses a question as a curious beginner
   */
  static getPersonaPrompt(conceptName) {
    const prompts = {
      'Residual Connections': {
        beginnerQuestion: "I'm new to deep neural networks. Why do we need to add the input 'x' back to the output of a layer? Why can't the network just learn the right representation by itself?",
        targetConcept: 'Residual Connections',
        keyIntuitionNeeded: 'Vanishing gradient problem in deep networks; skip connections allow gradient flow directly backwards like an express highway.'
      },
      'Scaled Dot-Product Attention': {
        beginnerQuestion: "Everyone keeps talking about 'attention' in transformers. Why do they divide the numbers by the square root of the dimension? What happens if you don't divide it?",
        targetConcept: 'Scaled Dot-Product Attention',
        keyIntuitionNeeded: 'Large dimensions push dot products high, causing softmax gradients to vanish; dividing scales the variance back to 1.'
      },
      'Multi-Head Attention': {
        beginnerQuestion: "Why do we use multiple attention heads instead of just one really big attention mechanism? What can multiple heads do that one head can't?",
        targetConcept: 'Multi-Head Attention',
        keyIntuitionNeeded: 'Different heads learn different relationships simultaneously (e.g., syntax vs semantics vs long-range references) in parallel subspaces.'
      }
    };

    return prompts[conceptName] || {
      beginnerQuestion: `I'm trying to understand ${conceptName}. Can you explain what problem it solves and give me an everyday real-world analogy?`,
      targetConcept: conceptName,
      keyIntuitionNeeded: `Core practical intuition behind ${conceptName}`
    };
  }

  /**
   * Evaluate the learner's explanation using the Feynman Protocol
   */
  static async evaluateExplanation(projectId, userId, conceptName, userExplanation) {
    const lower = userExplanation.toLowerCase();

    // 1. Analyze Jargon vs Intuitive Language
    const jargonWords = [
      'gradient', 'backpropagation', 'hyperparameter', 'eigenvector', 'stochastic',
      'regularization', 'non-linearity', 'activation', 'orthogonality', 'manifold',
      'subspace', 'tensor', 'affine', 'convolutional'
    ];

    const foundJargon = jargonWords.filter((j) => lower.includes(j));
    const wordsCount = userExplanation.split(/\s+/).length;
    const jargonRatio = wordsCount > 0 ? (foundJargon.length / wordsCount) : 0;
    const jargonScore = Math.max(10, Math.round((1 - jargonRatio * 4) * 100));

    // 2. Check for Real-World Analogies
    const analogyKeywords = ['like a', 'similar to', 'think of', 'imagine', 'highway', 'bypass', 'filter', 'traffic', 'dictionary', 'search engine', 'recipe'];
    const hasAnalogy = analogyKeywords.some((k) => lower.includes(k));

    // 3. Conceptual Depth Check
    const hasCoreMechanism =
      lower.includes('add') ||
      lower.includes('skip') ||
      lower.includes('scale') ||
      lower.includes('vanish') ||
      lower.includes('divide') ||
      lower.includes('subspace') ||
      lower.includes('head') ||
      lower.includes('parallel');

    let clarityScore = 70;
    if (hasAnalogy) clarityScore += 15;
    if (hasCoreMechanism) clarityScore += 10;
    if (jargonScore > 80) clarityScore += 5;
    clarityScore = Math.min(98, clarityScore);

    // 4. Synthesize Qualitative Feynman Feedback
    let feedback = '';
    if (hasAnalogy) {
      feedback = 'Outstanding use of an intuitive real-world analogy! Grounding abstract mathematical equations into tangible physical models demonstrates deep cognitive retention.';
    } else {
      feedback = 'Good factual breakdown, but try to incorporate an everyday analogy (e.g. comparing skip connections to an express highway bypass). This reinforces the mental model.';
    }

    const blindspots = [];
    if (!lower.includes('gradient') && !lower.includes('signal') && !lower.includes('flow')) {
      blindspots.push('Gradient flow preservation during backpropagation');
    }
    if (!lower.includes('variance') && !lower.includes('magnitude') && conceptName.includes('Scaled')) {
      blindspots.push('Explaining why dot-product magnitude explodes in high dimensions');
    }

    const result = {
      conceptName,
      clarityScore,
      jargonScore,
      hasAnalogy,
      foundJargon,
      blindspots: blindspots.length > 0 ? blindspots : ['None! Thorough intuitive grasp demonstrated.'],
      feedback,
      recommendation: clarityScore >= 85
        ? 'Mastery Level Achieved! You can explain this to a non-technical peer effortlessly.'
        : 'Good effort. Rephrase without technical jargon to reach master-level explanation.'
    };

    // Record learning event
    try {
      db.insert('learning_events', {
        id: uuidv4(),
        project_id: projectId,
        user_id: userId,
        event_type: 'feynman_explanation_evaluated',
        payload: {
          conceptName,
          clarityScore,
          jargonScore,
          hasAnalogy
        },
        created_at: new Date().toISOString()
      });
    } catch (e) {}

    return result;
  }

  /**
   * Calculate Ebbinghaus Forgetting Curve Retention for Project Concepts
   */
  static getForgettingCurve(projectId) {
    const masteries = db.find('concept_mastery', (m) => m.project_id === projectId);
    const now = Date.now();

    return masteries.map((m) => {
      // Estimated half-life based on mastery score (higher mastery = slower decay)
      const halfLifeDays = Math.max(2, Math.round((m.mastery_score / 100) * 14));
      
      // Calculate projected retention over days 1 to 14
      const projections = [1, 3, 7, 14].map((day) => {
        const retention = Math.round(m.mastery_score * Math.exp(-day / halfLifeDays));
        return { day, retention: Math.max(15, retention) };
      });

      const daysUntilCritical = Math.max(1, Math.round(halfLifeDays * Math.log(m.mastery_score / 60)));

      return {
        conceptId: m.concept_id,
        conceptName: m.concept_name,
        currentMastery: m.mastery_score,
        halfLifeDays,
        optimalReviewDay: Math.max(1, daysUntilCritical),
        needsReviewSoon: daysUntilCritical <= 3,
        projections
      };
    });
  }
}

module.exports = { FeynmanService };
