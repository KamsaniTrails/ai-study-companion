import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  XCircle,
  RotateCcw,
  AlertCircle,
  Target,
  FileCheck,
  Check,
  Compass
} from 'lucide-react';

export const QuizView = ({ projectId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/projects/' + projectId + '/quizzes');
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      if (data.quizzes?.length > 0 && !activeQuiz) {
        loadQuizDetails(data.quizzes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizDetails = async (id) => {
    try {
      const res = await fetch('/api/quizzes/' + id);
      const data = await res.json();
      setActiveQuiz(data.quiz);
      setUserAnswers({});
      setResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [projectId]);

  const handleGenerateAdaptiveQuiz = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/projects/' + projectId + '/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: selectedDifficulty,
          title: 'Adaptive Drill: ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' (' + selectedDifficulty.toUpperCase() + ')'
        })
      });
      const data = await res.json();
      if (data.quiz) {
        setActiveQuiz(data.quiz);
        setUserAnswers({});
        setResult(null);
        await fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);

    const answersPayload = activeQuiz.questions.map((q) => ({
      questionId: q.id,
      answer: userAnswers[q.id] || ''
    }));

    try {
      const res = await fetch('/api/quizzes/' + activeQuiz.id + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, answers: answersPayload })
      });

      const evalData = await res.json();
      setResult(evalData);
      await fetchQuizzes();
    } catch (err) {
      console.error('Quiz submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Card */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 24px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#4f46e5" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Adaptive Assessment Arena
            </h3>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
            Generates MCQs and open-ended problems targeting your weak concepts using a 5-point AI rubric.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Segmented Difficulty Selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 8, border: '1px solid #e2e8f0', gap: 2 }}>
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                disabled={generating}
                style={{
                  padding: '5px 11px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: selectedDifficulty === lvl ? 600 : 500,
                  border: 'none',
                  background: selectedDifficulty === lvl ? '#ffffff' : 'transparent',
                  color: selectedDifficulty === lvl ? '#0f172a' : '#64748b',
                  boxShadow: selectedDifficulty === lvl ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button onClick={handleGenerateAdaptiveQuiz} disabled={generating} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12 }}>
            {generating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Evaluating Mastery...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Generate Drill</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quiz Content */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading assessment arena...</div>
      ) : !activeQuiz ? (
        <div className="card-pro" style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          No quiz selected. Click "Generate Drill" to create one based on your course notes.
        </div>
      ) : (
        <div className="card-pro" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}>
          {/* Quiz Subheader */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>
                  {activeQuiz.difficulty || 'Intermediate'} Drill
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>Adaptive Engine Active</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginTop: 4, margin: '4px 0 0 0' }}>
                {activeQuiz.title}
              </h2>
            </div>

            <span className="badge badge-neutral">
              {activeQuiz.questions?.length || 0} Questions
            </span>
          </div>

          {/* Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {activeQuiz.questions?.map((q, idx) => {
              const evalItem = result?.answers?.find((a) => (a.questionId || a.question_id) === q.id);
              const isOpenEnded = q.type === 'open_ended';

              return (
                <div
                  key={q.id || idx}
                  style={{
                    padding: '18px 20px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#4f46e5', letterSpacing: '0.04em' }}>
                      QUESTION {idx + 1} &bull; {isOpenEnded ? 'OPEN-ENDED REASONING' : 'MULTIPLE CHOICE'}
                    </span>
                    <span className="badge badge-neutral">
                      Concept: {q.concept_name}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                    {q.prompt}
                  </p>

                  {/* MCQ Options */}
                  {!isOpenEnded && q.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[q.id] === opt;
                        return (
                          <label
                            key={oIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              borderRadius: 8,
                              background: isSelected ? '#ffffff' : '#ffffff',
                              border: '1px solid ' + (isSelected ? '#4f46e5' : '#e2e8f0'),
                              cursor: result ? 'default' : 'pointer',
                              boxShadow: isSelected ? '0 1px 3px rgba(79, 70, 229, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="radio"
                              name={'question_' + q.id}
                              value={opt}
                              checked={isSelected}
                              disabled={Boolean(result)}
                              onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                              style={{ accentColor: '#4f46e5', width: 15, height: 15 }}
                            />
                            <span style={{ fontSize: 13, color: isSelected ? '#0f172a' : '#334155', fontWeight: isSelected ? 600 : 400 }}>
                              {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Open-Ended Textarea */}
                  {isOpenEnded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <textarea
                        rows={3}
                        className="input-field"
                        disabled={Boolean(result)}
                        value={userAnswers[q.id] || ''}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                        placeholder="Type your reasoning and explanation here..."
                        style={{ resize: 'vertical', fontSize: 13, lineHeight: 1.5 }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                        <span>Hint: Reference core conceptual equations or mechanisms</span>
                        <span>{(userAnswers[q.id] || '').length} characters</span>
                      </div>
                    </div>
                  )}

                  {/* Immediate Evaluation Feedback */}
                  {evalItem && (
                    <div style={{
                      marginTop: 4,
                      padding: '12px 14px',
                      borderRadius: 8,
                      background: evalItem.isCorrect ? '#ecfdf5' : '#fff1f2',
                      border: '1px solid ' + (evalItem.isCorrect ? '#a7f3d0' : '#fecdd3'),
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {evalItem.isCorrect ? (
                            <CheckCircle2 size={16} color="#059669" />
                          ) : (
                            <XCircle size={16} color="#e11d48" />
                          )}
                          <span style={{ fontWeight: 600, fontSize: 12, color: evalItem.isCorrect ? '#065f46' : '#9f1239' }}>
                            {evalItem.isCorrect ? 'Correct & Mastered' : 'Needs Review'} (Score: {evalItem.ai_score ?? evalItem.evaluation?.aiScore ?? 0}%)
                          </span>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                          Rubric: {(evalItem.rubricScore != null ? evalItem.rubricScore : ((evalItem.ai_score ?? evalItem.evaluation?.aiScore ?? 0) / 20)).toFixed(1)} / 5.0
                        </span>
                      </div>

                      <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                        {evalItem.evaluation?.feedback || evalItem.feedback || 'Conceptual evaluation recorded in your mastery profile.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission / Results Footer */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            {result ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Final Score</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: result.score >= 70 ? '#059669' : '#e11d48' }}>
                    {result.score}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {result.passed ? 'Drill passed. Your concept mastery has been updated.' : 'Remediation suggested. Review notes or ask AI Tutor.'}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Answer all questions above, then submit for automated 5-point rubric grading.
              </div>
            )}

            {!result ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Grading with AI Rubric...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Submit for Evaluation</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleGenerateAdaptiveQuiz}
                disabled={generating}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                <RotateCcw size={13} />
                <span>Start Next Drill</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
