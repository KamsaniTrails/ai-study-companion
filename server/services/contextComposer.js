const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { RetrievalEngine } = require('./retrievalEngine');

/**
 * ContextComposer (PRD: Persistent Learning Context)
 * 
 * Pipeline:
 * Current Request
 *       ↓
 * Identify Required Context
 *       ↓
 * ┌───────────────┐
 * │ Project       │
 * │ Knowledge     │
 * │ Conversation  │
 * │ Learning      │
 * │ Assessment    │
 * └───────────────┘
 *       ↓
 * Compose AI Context
 *       ↓
 * Generate Response
 */
class ContextComposer {
  /**
   * Retrieves or initializes persistent context for project and learner
   */
  static getPersistentContext(projectId, userId = 'user_demo') {
    let ctx = db.findOne('persistent_context', (c) => c.project_id === projectId);
    if (!ctx) {
      const project = db.findOne('projects', (p) => p.id === projectId);
      ctx = {
        id: uuidv4(),
        project_id: projectId,
        user_id: userId,
        learningGoals: project?.learning_goal ? [project.learning_goal] : ['Master Core Concepts'],
        preferences: {
          explanationStyle: 'concept-first', // 'concept-first' | 'formula-first' | 'practical-code'
          detailLevel: 'balanced'            // 'concise' | 'balanced' | 'deep-dive'
        },
        knownStrengths: ['Gradient descent convergence', 'Backpropagation graph rules'],
        knownWeaknesses: ['High-variance softmax saturation mechanics', 'Optimization Dynamics'],
        repeatedMistakes: []
      };
      db.insert('persistent_context', ctx);
    }
    return ctx;
  }

  /**
   * Composes task-relevant context for AI Tutor interactions
   */
  static composeForTutor(projectId, userId, userMessage, conversationId) {
    // 1. PROJECT CONTEXT
    const project = db.findOne('projects', (p) => p.id === projectId) || {
      name: 'AI Study Workspace',
      learning_goal: 'Master core foundational concepts'
    };

    // 2. KNOWLEDGE CONTEXT (Retrieves only relevant materials & citations)
    const retrieval = RetrievalEngine.search(projectId, userMessage, 3);
    const isUnsupported = !retrieval.hasSufficientEvidence;

    // 3. CONVERSATION CONTEXT (Last 4 messages for continuity without prompt bloat)
    let recentTurns = [];
    if (conversationId) {
      const allMessages = db.find('messages', (m) => m.conversation_id === conversationId);
      recentTurns = allMessages.slice(-4);
    }

    // 4. LEARNING CONTEXT (Persistent representation: goals, strengths, weaknesses, mistakes)
    const persistentCtx = this.getPersistentContext(projectId, userId);
    const lowerQuery = userMessage.toLowerCase();

    // Select ONLY relevant learning context elements (PRD: "prioritize relevance rather than storing everything")
    const relevantWeaknesses = persistentCtx.knownWeaknesses.filter((w) =>
      lowerQuery.includes(w.toLowerCase().split(' ')[0]) || lowerQuery.includes('gradient') || lowerQuery.includes('attention')
    );
    const relevantMistakes = (persistentCtx.repeatedMistakes || []).filter((m) =>
      lowerQuery.includes((m.conceptName || '').toLowerCase().split(' ')[0])
    );

    // 5. ASSESSMENT CONTEXT (Concept mastery state for relevant topics)
    const masteries = db.find('concept_mastery', (m) => m.project_id === projectId);
    const relevantMasteries = masteries.filter((m) =>
      lowerQuery.includes(m.concept_name.toLowerCase().split(' ')[0])
    );

    // System prompt with persistent learner role guidelines
    const systemPrompt = `You are the AI Study Companion Tutor.
Core Operational Rules:
1. Ground your answers strictly in the provided Project Knowledge.
2. If Project Knowledge contains insufficient evidence to answer reliably, refuse to fabricate and clearly state insufficient evidence (PRD Section 7).
3. Be attentive to the learner's persistent goals, known weaknesses, and previous mistakes. Formulate explanations to address conceptual stumbling blocks constructively.`;

    // Composed context text
    let promptText = '';

    if (isUnsupported) {
      if (retrieval.reason === 'NO_DOCUMENTS') {
        promptText = `[UNSUPPORTED_QUESTION_FLAG:NO_DOCUMENTS_IN_PROJECT]
User Question: "${userMessage}"
Available Evidence: No study materials or notes have been uploaded to this Project yet.`;
      } else {
        promptText = `[UNSUPPORTED_QUESTION_FLAG]
User Question: "${userMessage}"
Available Evidence: No relevant notes or evidence found in project materials.`;
      }
    } else {
      const knowledgeSection = retrieval.topChunks
        .map((c) => `[Source: ${c.materialName} — Page ${c.pageNumber}]
${c.content}`)
        .join('\n\n');

      let learnerSection = `Project: ${project.name}
Learning Goal: ${project.learning_goal || 'Master Core Concepts'}`;

      if (relevantWeaknesses.length > 0) {
        learnerSection += `\nLearner Known Weakness to Address: ${relevantWeaknesses.join(', ')}`;
      }
      if (relevantMistakes.length > 0) {
        learnerSection += `\nPrevious Mistake on Record: Concept ${relevantMistakes[0].conceptName} ("${relevantMistakes[0].mistakeSnippet}")`;
      }
      if (relevantMasteries.length > 0) {
        learnerSection += `\nCurrent Mastery on Topic: ${relevantMasteries.map((m) => `${m.concept_name} (${m.mastery_score}%, ${m.status})`).join(', ')}`;
      }

      let convoSection = '';
      if (recentTurns.length > 0) {
        convoSection = '\n\n=== RECENT CONVERSATION CONTINUITY ===\n' +
          recentTurns.map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 200)}`).join('\n');
      }

      promptText = `=== 1. PROJECT & LEARNER CONTEXT ===
${learnerSection}

=== 2. GROUNDED PROJECT KNOWLEDGE ===
${knowledgeSection}${convoSection}

=== 3. CURRENT LEARNER REQUEST ===
${userMessage}`;
    }

    // Context composition metadata breakdown for UI transparency
    const contextBreakdown = {
      project: {
        name: project.name,
        goal: project.learning_goal || 'Master core foundational concepts'
      },
      knowledge: {
        hasSufficientEvidence: retrieval.hasSufficientEvidence,
        chunkCount: retrieval.topChunks.length,
        citations: retrieval.citations
      },
      conversation: {
        rememberedTurns: recentTurns.length
      },
      learning: {
        activeGoals: persistentCtx.learningGoals || [],
        knownStrengths: persistentCtx.knownStrengths || [],
        knownWeaknesses: persistentCtx.knownWeaknesses || [],
        relevantWeaknesses,
        repeatedMistakesCount: (persistentCtx.repeatedMistakes || []).length,
        relevantMistakes
      },
      assessment: {
        relevantConceptsCount: relevantMasteries.length,
        concepts: relevantMasteries.map((m) => ({ name: m.concept_name, score: m.mastery_score, status: m.status }))
      }
    };

    return {
      systemPrompt,
      promptText,
      retrieval,
      isUnsupported,
      contextBreakdown
    };
  }

  /**
   * Updates persistent context entries
   */
  static updateContext(projectId, updates) {
    const existing = db.findOne('persistent_context', (c) => c.project_id === projectId);
    if (existing) {
      db.update('persistent_context', (c) => c.id === existing.id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      return db.findOne('persistent_context', (c) => c.id === existing.id);
    }
    return null;
  }

  /**
   * Composes specialized Pre-Quiz Revision Context (PRD Item 93)
   */
  static composeForRevision(projectId, userId, userMessage, conversationId) {
    const project = db.findOne('projects', (p) => p.id === projectId) || {
      name: 'AI Study Workspace',
      learning_goal: 'Master core foundational concepts'
    };

    const persistentCtx = this.getPersistentContext(projectId, userId);
    const masteries = db.find('concept_mastery', (m) => m.project_id === projectId);
    const weakMasteries = masteries.filter((m) => m.status === 'needs_attention' || m.mastery_score < 70);

    const targetQuery = userMessage || weakMasteries.map((w) => w.concept_name).join(' ') || 'core principles';
    const retrieval = RetrievalEngine.search(projectId, targetQuery, 3);

    const systemPrompt = `You are the AI Study Companion in PRE-QUIZ REVISION GUIDANCE MODE (PRD Item 93).
Your Goal: Provide structured, high-yield revision help before the student attempts their adaptive quiz.

Operational Revision Protocol:
1. Focus directly on the learner's identified weak concepts and previous mistakes.
2. Present a structured 3-bullet high-yield recap containing core intuition, exact formulas, and common exam pitfalls.
3. Conclude with exactly ONE rapid diagnostic recall question ("Quick Check:") to test retention before the quiz.
4. Ground your recap strictly in the project notes with page citations.`;

    const weakList = weakMasteries.map((w) => `• ${w.concept_name} (Current Mastery: ${w.mastery_score}%, Status: ${w.status})`).join('\n');
    const mistakeList = (persistentCtx.repeatedMistakes || []).map((m) => `• ${m.conceptName}: "${m.mistakeSnippet}"`).join('\n');

    const knowledgeSection = retrieval.topChunks
      .map((c) => `[Source: ${c.materialName} — Page ${c.pageNumber}]\n${c.content}`)
      .join('\n\n');

    const promptText = `=== PRE-QUIZ REVISION CONTEXT ===
Project: ${project.name}
Learning Goal: ${project.learning_goal}

Learner Weak Concepts Needing Revision:
${weakList || 'General concept reinforcement'}

Previous Mistakes to Remediate:
${mistakeList || 'None recorded yet'}

=== GROUNDED SOURCE EVIDENCE ===
${knowledgeSection || 'Rely on course notes.'}

=== STUDENT REVISION REQUEST ===
${userMessage || 'Provide a structured 2-minute pre-quiz revision recap for my weakest concepts.'}`;

    const contextBreakdown = {
      project: { name: project.name, goal: project.learning_goal },
      knowledge: { hasSufficientEvidence: retrieval.hasSufficientEvidence, citations: retrieval.citations },
      mode: 'pre_quiz_revision',
      weakConceptsTargeted: weakMasteries.map((w) => w.concept_name)
    };

    return {
      systemPrompt,
      promptText,
      retrieval,
      isUnsupported: false,
      contextBreakdown,
      mode: 'revision'
    };
  }
}

module.exports = { ContextComposer };
