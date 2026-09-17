import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Lightbulb,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  AlertCircle,
  RotateCw,
  Share2,
  Calendar,
  Check,
  Zap,
  Play,
  Download
} from 'lucide-react';

export const UserHome = ({
  spaces = [],
  projects = [],
  recommendations = [],
  onSelectProject,
  onSelectSpace,
  onEditSpace,
  onDeleteSpace,
  onEditProject,
  onDeleteProject,
  onCreateSpace,
  onCreateProject,
  currentUser
}) => {
  const [masteries, setMasteries] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [showConceptMap, setShowConceptMap] = useState(false);
  const [showLearningPlan, setShowLearningPlan] = useState(false);

  const primaryProject = projects[0];
  const userName = currentUser?.name || 'Alex Morgan';

  useEffect(() => {
    if (primaryProject) {
      fetch('/api/projects/' + primaryProject.id + '/mastery')
        .then((r) => r.json())
        .then((data) => {
          if (data.masteries) setMasteries(data.masteries);
        })
        .catch(console.error);
    }
  }, [primaryProject]);

  const totalMaterials = projects.reduce((acc, p) => acc + (p.material_count || 0), 0);
  const avgMastery = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.average_mastery || 70), 0) / projects.length)
    : 78;

  const attentionConcepts = masteries.filter(
    (m) => m.status === 'needs_attention' || m.mastery_score < 70
  );

  const defaultAttentionConcepts = attentionConcepts.length > 0 ? attentionConcepts : [
    { id: 'c_attn_1', concept_name: 'Scaled Dot-Product Attention', mastery_score: 51, status: 'needs_attention' },
    { id: 'c_attn_2', concept_name: 'Layer Normalization Variance', mastery_score: 64, status: 'needs_attention' }
  ];

  const flashcards = [
    {
      q: 'Why do Transformers divide the query-key dot product by sqrt(d_k)?',
      a: 'To counter the effect of dot products growing large in magnitude for large dimensions, which pushes the softmax function into regions with extremely small gradients.'
    },
    {
      q: 'What is the exact mathematical formulation of a Residual Connection?',
      a: 'Output = LayerNorm(x + Sublayer(x)), allowing unimpeded gradient flow back through deep layers.'
    },
    {
      q: 'What distinguishes Multi-Head Attention from single-head attention?',
      a: 'It linearly projects queries, keys, and values h times with learned parameter matrices, attending to information from different representation subspaces jointly.'
    }
  ];

  const studyPlanDays = [
    { day: 'Day 1', focus: 'Self-Attention Foundations', task: 'Review Notes Page 14 equations & verify attention formula', done: true },
    { day: 'Day 2', focus: 'Multi-Head Attention Projections', task: 'Complete 5-question adaptive quiz drill', done: true },
    { day: 'Day 3', focus: 'Residual Connections & LayerNorm', task: 'Open-ended rubric assessment & remediation', done: false },
    { day: 'Day 4', focus: 'Positional Encoding Analysis', task: 'Upload supplementary lecture slides & index chunks', done: false },
    { day: 'Day 5', focus: 'Feed-Forward Sublayer Mechanics', task: 'Tutor Q&A session with grounded citations', done: false }
  ];

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Clean Executive Header & Continue Learning */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 9px',
            background: '#f1f5f9',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            color: '#475569',
            width: 'fit-content'
          }}>
            <Sparkles size={12} color="#6366f1" />
            <span>AI Learning Companion</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back, {userName}
          </h1>

          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            Your learning partner is actively tracking your study materials, concept mastery estimates, and targeted next steps.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
            <span
              style={{ fontSize: 12, color: '#4f46e5', fontWeight: 600, cursor: spaces.length > 0 && onSelectSpace ? 'pointer' : 'default' }}
              onClick={() => {
                if (spaces.length > 0 && onSelectSpace) onSelectSpace(spaces[0]);
              }}
            >
              {spaces.length} Spaces
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{projects.length} Projects</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{avgMastery}% Overall Mastery</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <a
              href={`/api/users/${currentUser?.id || 'user_demo'}/export`}
              download
              className="btn btn-secondary"
              style={{
                fontSize: 11,
                padding: '3px 9px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                color: '#4338ca',
                background: '#eef2ff',
                borderColor: '#c7d2fe',
                borderRadius: 6
              }}
              title="Download your complete study history, chat transcripts, quizzes, and mastery data (GDPR / Data Portability)"
            >
              <Download size={11} />
              <span>Export History (PRD 5)</span>
            </a>
          </div>
        </div>

        {primaryProject && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: '1 1 280px',
            maxWidth: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                Continue Learning
              </span>
              <span className="badge badge-indigo">
                {primaryProject.average_mastery || 78}% Mastery
              </span>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{primaryProject.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{primaryProject.space_name}</div>
            </div>

            <button
              onClick={() => onSelectProject(primaryProject, 'tutor')}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
            >
              <span>Resume Study Session</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Core Triad: Where was I? How am I doing? What should I do next? */}
      <div className="home-triad-grid">
        {/* Card 1: Where was I? */}
        <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: 6, borderRadius: 6, background: '#f1f5f9', color: '#475569' }}>
                <Clock size={16} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Where was I?</h3>
            </div>
            <span className="badge badge-neutral">Active Focus</span>
          </div>

          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {primaryProject ? primaryProject.learning_goal : 'Set a focused learning goal to get started.'}
          </p>

          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => onSelectProject(primaryProject, 'tutor')}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: 12, padding: '7px 10px' }}
            >
              <span>Open Project Workspace</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 2: How am I doing? */}
        <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: 6, borderRadius: 6, background: '#ecfdf5', color: '#059669' }}>
                <TrendingUp size={16} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>How am I doing?</h3>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{avgMastery}% Avg</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
              <span>Overall Concept Mastery</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{avgMastery}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: avgMastery + '%' }} />
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <span className="badge badge-improving">● 4 Improving</span>
            <span className="badge badge-stable">● 2 Stable</span>
            <span className="badge badge-needs_attention">● {defaultAttentionConcepts.length} Attention</span>
          </div>
        </div>

        {/* Card 3: What should I do next? */}
        <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: 6, borderRadius: 6, background: '#fffbeb', color: '#d97706' }}>
                <Lightbulb size={16} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>What should I do next?</h3>
            </div>
            <span className="badge badge-amber">Action Ready</span>
          </div>

          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {recommendations[0]?.title || 'Review scaled dot-product attention equations on Page 14 and complete a practice drill.'}
          </p>

          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            {primaryProject && (
              <button
                onClick={() => onSelectProject(primaryProject, 'quiz')}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: 12, padding: '7px 10px' }}
              >
                <span>Launch Adaptive Practice Drill</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Areas Requiring Attention */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #fee2e2',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <AlertCircle size={17} color="#e11d48" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Areas Requiring Attention
            </h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>— Concepts identified from recent assessment errors</span>
          </div>
          <span className="badge badge-needs_attention">
            {defaultAttentionConcepts.length} Flagged Concepts
          </span>
        </div>

        <div className="home-attention-grid">
          {defaultAttentionConcepts.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '14px 16px',
                background: '#fffcfc',
                border: '1px solid #fee2e2',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#9f1239' }}>{c.concept_name}</div>
                <div style={{ fontSize: 11, color: '#be123c', marginTop: 2 }}>
                  Estimated Mastery: <strong>{c.mastery_score}%</strong> (Below Target)
                </div>
              </div>

              {primaryProject && (
                <button
                  onClick={() => onSelectProject(primaryProject, 'quiz')}
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '5px 10px', color: '#e11d48', borderColor: '#fca5a5' }}
                >
                  <span>Practice Concept</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Projects */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Projects
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              Your active study projects with isolated course materials
            </p>
          </div>

          <button onClick={onCreateProject} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
            <Plus size={13} />
            <span>New Study Project</span>
          </button>
        </div>

        <div className="home-projects-grid">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="card-pro"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                cursor: 'pointer'
              }}
              onClick={() => onSelectProject(proj, 'dashboard')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  className="badge badge-neutral"
                  style={{ cursor: onSelectSpace ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    if (onSelectSpace) {
                      e.stopPropagation();
                      const sp = spaces.find((s) => s.id === proj.space_id);
                      if (sp) onSelectSpace(sp);
                    }
                  }}
                  title="View Space Dashboard"
                >
                  {proj.space_name || 'AI Space'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>
                  {proj.average_mastery || 75}%
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {proj.name}
                </h4>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, margin: 0, lineHeight: 1.4 }}>
                  {proj.description || proj.learning_goal}
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid #f1f5f9',
                fontSize: 11,
                color: '#64748b'
              }}>
                <span>{proj.material_count || 1} Notes Uploaded</span>
                <span style={{ color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  Enter <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Cognitive Science Studio Auxiliary Toolbar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Interactive Learning Tools:</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowFlashcards(true)}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            <RotateCw size={13} />
            <span>Spaced Flashcards</span>
          </button>

          <button
            onClick={() => setShowConceptMap(true)}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            <Share2 size={13} />
            <span>Concept Map</span>
          </button>

          <button
            onClick={() => setShowLearningPlan(true)}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            <Calendar size={13} />
            <span>Study Plan</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: Spaced Repetition Flashcards */}
      {showFlashcards && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCw size={16} color="#4f46e5" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Spaced Repetition Flashcards
                </h3>
              </div>
              <span className="badge badge-neutral">Card {flashcardIndex + 1} of {flashcards.length}</span>
            </div>

            <div
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              style={{
                minHeight: '150px',
                background: flashcardFlipped ? '#f0fdf4' : '#f8fafc',
                border: flashcardFlipped ? '1px solid #86efac' : '1px dashed #cbd5e1',
                borderRadius: 10,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 10, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: 6 }}>
                {flashcardFlipped ? 'ANSWER' : 'QUESTION (Click to flip)'}
              </span>
              <div style={{ fontSize: 14, fontWeight: 600, color: flashcardFlipped ? '#166534' : '#0f172a', lineHeight: 1.5 }}>
                {flashcardFlipped ? flashcards[flashcardIndex].a : flashcards[flashcardIndex].q}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setFlashcardFlipped(false);
                  setFlashcardIndex((flashcardIndex + 1) % flashcards.length);
                }}
                className="btn btn-secondary"
                style={{ fontSize: 12 }}
              >
                Skip Card
              </button>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    setFlashcardIndex((flashcardIndex + 1) % flashcards.length);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: 12 }}
                >
                  <Check size={13} />
                  <span>I Know This</span>
                </button>
                <button
                  onClick={() => setShowFlashcards(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: 12 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Concept Map */}
      {showConceptMap && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '24px',
            maxWidth: '560px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Concept Dependency Graph
              </h3>
              <button onClick={() => setShowConceptMap(false)} className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ textAlign: 'center' }}>
                <span className="badge badge-indigo" style={{ padding: '6px 12px', fontSize: 13 }}>
                  Deep Learning & Neural Architectures
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ padding: 10, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Self-Attention</div>
                  <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>94% Mastery</div>
                </div>
                <div style={{ padding: 10, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Residual Skips</div>
                  <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>88% Mastery</div>
                </div>
                <div style={{ padding: 10, background: '#ffffff', border: '1px solid #fee2e2', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#be123c' }}>Dot Scaling</div>
                  <div style={{ fontSize: 11, color: '#be123c', marginTop: 2 }}>51% Review</div>
                </div>
              </div>
            </div>

            <button onClick={() => setShowConceptMap(false)} className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }}>
              Close Concept Map
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Study Plan */}
      {showLearningPlan && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '24px',
            maxWidth: '520px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Personalized 7-Day Study Schedule
              </h3>
              <button onClick={() => setShowLearningPlan(false)} className="btn btn-ghost" style={{ fontSize: 13, padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {studyPlanDays.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    background: step.done ? '#f0fdf4' : '#f8fafc',
                    border: step.done ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 10,
                      background: step.done ? '#16a34a' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700
                    }}>
                      {step.done ? <Check size={11} /> : idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{step.day}: {step.focus}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{step.task}</div>
                    </div>
                  </div>
                  <span className={step.done ? 'badge badge-improving' : 'badge badge-neutral'}>
                    {step.done ? 'Done' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => setShowLearningPlan(false)} className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }}>
              Close Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
