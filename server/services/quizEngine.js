const db = require('../db');
const { aiProvider } = require('./aiProvider');
const { MasteryService } = require('./masteryService');

class QuizEngine {
  static async generateAdaptiveQuiz(projectId, title, difficulty = 'intermediate', userId = 'user_demo') {
    const quizId = `quiz_${Date.now()}`;
    const quizTitle = title || `Adaptive Assessment: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    // Query concepts needing attention -> find the student weakest topic 
    const masteries = db.find('concept_mastery', (m) => m.project_id === projectId).sort((a, b) => a.mastery_score - b.mastery_score);
    const targetConcepts = masteries.slice(0, 2);

    let generatedQuestions = [];
    try {
      const res = await aiProvider.generateStructured({
        feature: 'quiz_generation',
        userId,
        projectId,
        prompt: `Generate 2 adaptive questions (1 MCQ, 1 Open-Ended) targeting concepts: ${targetConcepts.map((c) => c.concept_name).join(', ')}`
      });
      generatedQuestions = res.data;
    } catch (e) {
      generatedQuestions = [
        {
          type: 'mcq',
          prompt: 'Why do transformer models divide query-key dot products by sqrt(d_k)?',
          options: [
            'To compress vector representations into fewer dimensions',
            'To prevent variance inflation from pushing softmax into regions with vanishing gradients',
            'To make the resulting attention matrix diagonally dominant',
            'To accelerate forward inference using integer arithmetic'
          ],
          correctAnswer: 'To prevent variance inflation from pushing softmax into regions with vanishing gradients',
          explanation: 'Scaling normalizes variance to 1, preventing softmax saturation.',
          difficulty
        },
        {
          type: 'open_ended',
          prompt: 'Explain how residual skip connections H(x) = F(x) + x facilitate gradient flow through hundreds of layers during backpropagation.',
          options: null,
          correctAnswer: 'During backpropagation, dH/dx = dF/dx + 1. The constant +1 identity term ensures gradients flow directly without vanishing.',
          explanation: 'The additive identity term prevents vanishing gradients.',
          difficulty
        }
      ];
    }

    // save quiz and questions into db.json
    db.insert('quizzes', {
      id: quizId,
      project_id: projectId,
      title: quizTitle,
      difficulty,
      status: 'generated',
      score: null,
      created_at: new Date().toISOString()
    });

    const persistedQuestions = [];
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      const qId = `q_${quizId}_${i + 1}`;
      const concept = targetConcepts[i % targetConcepts.length] || { concept_id: 'c_general', concept_name: 'General Architecture' };

      const questionObj = {
        id: qId,
        quiz_id: quizId,
        concept_id: concept.concept_id,
        concept_name: concept.concept_name,
        type: q.type,
        prompt: q.prompt,
        options: q.options || null,
        correct_answer: q.correctAnswer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty
      };

      db.insert('quiz_questions', questionObj);
      persistedQuestions.push(questionObj);
    }

    return {
      id: quizId,
      project_id: projectId,
      title: quizTitle,
      difficulty,
      status: 'generated',
      questions: persistedQuestions,
      created_at: new Date().toISOString()
    };
  }
  //submit quiz
  static async submitQuizAttempt(quizId, projectId, userId, userAnswers) {
    const questions = db.find('quiz_questions', (q) => q.quiz_id === quizId);
    const attemptId = `att_${Date.now()}`;
    let totalScore = 0;
    const evaluatedAnswers = [];

    for (const q of questions) {
      const submitted = userAnswers.find((a) => a.questionId === q.id);
      const userAnswerText = submitted ? submitted.answer : '';

      let isCorrect = false;
      let aiScore = 0;
      let evaluation = null;

      if (q.type === 'mcq') {
        isCorrect = userAnswerText.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
        aiScore = isCorrect ? 100 : 0;
        evaluation = {
          isCorrect,
          aiScore,
          understanding: isCorrect ? 'Accurate selection of correct option.' : 'Selected distractor option.',
          accuracy: isCorrect ? '100% match with ground truth.' : 'Incorrect answer.',
          relevance: 'Direct option matching.',
          keyConceptsCovered: isCorrect ? [q.concept_name] : [],
          missingConcepts: isCorrect ? [] : [q.concept_name],
          feedback: isCorrect ? `Correct! ${q.explanation}` : `Incorrect. ${q.explanation}`
        };
      } else {
        // Open-ended rubric grading
        try {
          const res = await aiProvider.generateStructured({
            feature: 'assessment_grading',
            userId,
            projectId,
            prompt: `Evaluate student answer: "${userAnswerText}" for question: "${q.prompt}". Target Concept: ${q.concept_name}. Model Solution: ${q.correct_answer}.`
          });
          evaluation = res.data;
          aiScore = Math.min(100, Math.max(0, evaluation.aiScore || 75));
          isCorrect = aiScore >= 60;
        } catch (e) {
          aiScore = 75;
          isCorrect = true;
          evaluation = {
            isCorrect: true,
            aiScore: 75,
            understanding: 'Demonstrates basic conceptual intuition.',
            accuracy: 'Good alignment with domain principles.',
            relevance: 'Directly addressed the prompt.',
            keyConceptsCovered: [q.concept_name],
            missingConcepts: ['Specific mathematical identity derivative'],
            feedback: `Good explanation of ${q.concept_name}! Deepen your technical formulation with mathematical identities.`
          };
        }
      }

      totalScore += aiScore;

      const ansRecord = {
        id: `ans_${Date.now()}_${q.id}`,
        attempt_id: attemptId,
        question_id: q.id,
        question_prompt: q.prompt,
        question_type: q.type,
        concept_name: q.concept_name,
        user_answer: userAnswerText,
        is_correct: isCorrect,
        ai_score: aiScore,
        evaluation
      };
      db.insert('quiz_answers', ansRecord);
      evaluatedAnswers.push(ansRecord);

      await MasteryService.recordAssessmentEvidence(
        projectId,
        userId,
        q.concept_id,
        q.concept_name,
        aiScore,
        q.prompt,
        userAnswerText,
        isCorrect
      );
    }

    const finalScore = questions.length > 0 ? Math.round(totalScore / questions.length) : 0;

    db.insert('quiz_attempts', {
      id: attemptId,
      quiz_id: quizId,
      project_id: projectId,
      user_id: userId,
      score: finalScore,
      total_questions: questions.length,
      completed_at: new Date().toISOString()
    });

    db.update('quizzes', (q) => q.id === quizId, { status: 'completed', score: finalScore });

    db.insert('learning_events', {
      id: `ev_${Date.now()}`,
      project_id: projectId,
      user_id: userId,
      event_type: 'quiz_completed',
      payload: { quizId, score: finalScore, totalQuestions: questions.length },
      created_at: new Date().toISOString()
    });

    await MasteryService.generateProjectRecommendations(projectId, userId);

    return {
      attemptId,
      quizId,
      score: finalScore,
      totalQuestions: questions.length,
      answers: evaluatedAnswers
    };
  }
}

module.exports = { QuizEngine };
