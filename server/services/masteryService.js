const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class MasteryService {
  static async recordAssessmentEvidence(projectId, userId, conceptId, conceptName, score, questionPrompt, userAnswer, isCorrect) {
    let concept = db.findOne('concepts', (c) => c.project_id === projectId && (c.id === conceptId || c.name === conceptName));
    const cId = concept ? concept.id : (conceptId || `c_${Date.now()}`);
    const cName = concept ? concept.name : (conceptName || 'Core Concept');

    if (!concept) {
      db.insert('concepts', {
        id: cId,
        project_id: projectId,
        name: cName,
        description: `Core concept in ${projectId}`,
        category: 'Course Topics',
        importance_score: 8.0
      });
    }

    let mastery = db.findOne('concept_mastery', (m) => m.project_id === projectId && (m.concept_id === cId || m.concept_name === cName));
    const todayStr = new Date().toISOString().split('T')[0];
    let history = mastery ? (mastery.history ? [...mastery.history] : []) : [];

    // True Grounded Mastery Calculation:
    // If first assessment for this concept, score is 100% of the new evidence.
    // If previously assessed, blend 60% prior mastery + 40% new evidence.
    const isFirstAssessment = !mastery || !mastery.last_tested_at || history.length === 0;
    const currentScore = (mastery && !isFirstAssessment) ? mastery.mastery_score : score;
    const updatedScore = isFirstAssessment
      ? Math.max(0, Math.min(100, Math.round(score)))
      : Math.max(0, Math.min(100, Math.round(currentScore * 0.6 + score * 0.4)));

    let status = 'stable';
    if (updatedScore >= 80) {
      status = 'improving';
    } else if (updatedScore < 60) {
      status = 'needs_attention';
    } else if (updatedScore >= currentScore) {
      status = 'improving';
    }

    history.push({ date: todayStr, score: updatedScore });
    if (history.length > 8) history = history.slice(-8);

    if (mastery) {
      db.update('concept_mastery', (m) => m.id === mastery.id, {
        concept_id: cId,
        concept_name: cName,
        mastery_score: updatedScore,
        confidence: 0.9,
        status,
        history,
        last_tested_at: new Date().toISOString()
      });
    } else {
      db.insert('concept_mastery', {
        id: uuidv4(),
        project_id: projectId,
        concept_id: cId,
        concept_name: cName,
        mastery_score: updatedScore,
        confidence: 0.9,
        status,
        history,
        last_tested_at: new Date().toISOString()
      });
    }

    // Sync computed average mastery to the project record so all dashboards match
    const allProjectMasteries = db.find('concept_mastery', (m) => m.project_id === projectId);
    const testedMasteries = allProjectMasteries.filter((m) => m.last_tested_at || (m.history && m.history.length > 0));
    const newProjectAvg = testedMasteries.length > 0
      ? Math.round(testedMasteries.reduce((a, b) => a + b.mastery_score, 0) / testedMasteries.length)
      : 0;
    db.update('projects', (p) => p.id === projectId, { average_mastery: newProjectAvg });

    // Repeated mistake workflow
    if (!isCorrect) {
      await this.handleMistake(projectId, userId, cName, questionPrompt || '', userAnswer || '');
    }

    // Regenerate recommendations with fresh evidence
    await this.generateProjectRecommendations(projectId, userId);

    return { updatedScore, status, projectAverageMastery: newProjectAvg };
  }

  static async handleMistake(projectId, userId, conceptName, questionPrompt, userAnswer) {
    let context = db.findOne('persistent_context', (c) => c.project_id === projectId);
    if (!context) {
      context = {
        id: uuidv4(),
        project_id: projectId,
        user_id: userId,
        learningGoals: [],
        knownStrengths: [],
        knownWeaknesses: [],
        repeatedMistakes: []
      };
      db.insert('persistent_context', context);
    }

    if (!context.repeatedMistakes) context.repeatedMistakes = [];
    const existing = context.repeatedMistakes.find((m) => m.conceptName === conceptName);
    if (existing) {
      existing.count += 1;
      existing.lastMadeAt = new Date().toISOString();
    } else {
      context.repeatedMistakes.push({
        conceptName,
        questionPrompt: (questionPrompt || '').slice(0, 100),
        mistakeSnippet: (userAnswer || '').slice(0, 80),
        count: 1,
        lastMadeAt: new Date().toISOString()
      });
    }

    if (!context.knownWeaknesses.includes(conceptName)) {
      context.knownWeaknesses.push(conceptName);
    }

    db.update('persistent_context', (c) => c.id === context.id, context);

    db.insert('learning_events', {
      id: uuidv4(),
      project_id: projectId,
      user_id: userId,
      event_type: 'mistake_detected',
      payload: { conceptName, count: existing ? existing.count : 1 },
      created_at: new Date().toISOString()
    });
  }

  // PRD Section 10 Recommendation Engine: Answers "What should I do next?"
  static async generateProjectRecommendations(projectId, userId = 'user_demo') {
    const masteries = db.find('concept_mastery', (m) => m.project_id === projectId);
    const context = db.findOne('persistent_context', (c) => c.project_id === projectId);
    const mistakes = context?.repeatedMistakes || [];

    // Clear obsolete recommendations that are not dismissed
    db.remove('recommendations', (r) => r.project_id === projectId && !r.is_dismissed);

    const firstChunk = db.findOne('document_chunks', (c) => c.project_id === projectId);
    const defaultPage = firstChunk ? (firstChunk.page_number || 1) : 1;

    for (const item of masteries) {
      const hasRecentMistake = mistakes.some((m) => m.conceptName === item.concept_name);
      const matchingChunk = db.findOne('document_chunks', (c) => c.project_id === projectId && c.content.toLowerCase().includes(item.concept_name.toLowerCase()));
      const targetPage = matchingChunk ? (matchingChunk.page_number || defaultPage) : defaultPage;

      // PRD Exemplar Case 1: Improving, but application questions remain difficult
      if (item.status === 'improving' && (hasRecentMistake || item.mastery_score < 75)) {
        db.insert('recommendations', {
          id: uuidv4(),
          project_id: projectId,
          user_id: userId,
          title: `Reinforce Concept: ${item.concept_name}`,
          action: `Review Notes on Page ${targetPage}`,
          description: `Your understanding of ${item.concept_name} has improved, but application-based questions remain difficult. Review the related material on Page ${targetPage} and complete another short assessment.`,
          action_type: 'review_material',
          target_tab: 'tutor',
          priority: 'medium',
          concept_id: item.concept_id,
          concept_name: item.concept_name,
          target_page: targetPage,
          reason: `Understanding improved to ${item.mastery_score}%, but recent mistakes indicate application difficulty`,
          is_dismissed: false,
          created_at: new Date().toISOString()
        });
      }
      // PRD Case 2: Requiring attention (< 60%)
      else if (item.status === 'needs_attention' || item.mastery_score < 60) {
        db.insert('recommendations', {
          id: uuidv4(),
          project_id: projectId,
          user_id: userId,
          title: `Priority Mastery Alert: ${item.concept_name}`,
          action: `Practice Adaptive Drill for ${item.concept_name}`,
          description: `${item.concept_name} currently requires attention (${item.mastery_score}% estimated mastery). Review core principles in your notes and practice with the AI Tutor.`,
          action_type: 'take_quiz',
          target_tab: 'quiz',
          priority: 'high',
          concept_id: item.concept_id,
          concept_name: item.concept_name,
          target_page: targetPage,
          reason: `Estimated mastery is in attention-requiring zone (${item.mastery_score}%)`,
          is_dismissed: false,
          created_at: new Date().toISOString()
        });
      }
      // PRD Case 3: Stable (> 80%)
      else if (item.mastery_score >= 85) {
        // High mastery: recommend testing advanced edge cases
      }
    }

    // Ensure at least one top recommendation exists answering "What should I do next?"
    const existingRecs = db.find('recommendations', (r) => r.project_id === projectId && !r.is_dismissed);
    if (existingRecs.length === 0) {
      db.insert('recommendations', {
        id: uuidv4(),
        project_id: projectId,
        user_id: userId,
        title: 'Complete Comprehensive Assessment Drill',
        action: 'Start Adaptive Drill',
        description: `Your understanding across foundational concepts is stable. Review related material on Page ${defaultPage} and complete another short assessment to maintain retention.`,
        action_type: 'take_quiz',
        target_tab: 'quiz',
        priority: 'medium',
        target_page: defaultPage,
        reason: 'Periodic review schedule per spaced repetition forecast',
        is_dismissed: false,
        created_at: new Date().toISOString()
      });
    }
  }
}

module.exports = { MasteryService };
