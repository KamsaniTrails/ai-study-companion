import React, { useState, useEffect } from 'react';
import {
  Award,
  Bot,
  FileText,
  LineChart,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Zap,
  Target,
  Layers,
  Compass
} from 'lucide-react';

export const ProjectDashboardView = ({ projectId, onSelectTab, currentUser }) => {
  const [data, setData] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGoalData = () => {
    fetch('/api/projects/' + projectId + '/goals')
      .then((r) => r.json())
      .then((d) => setGoalData(d.goal))
      .catch(console.error);
  };

  useEffect(() => {
    fetchGoalData();
    fetch('/api/projects/' + projectId + '/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleToggleMilestone = async (milestoneId) => {
    if (!goalData) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/goals/${goalData.id}/milestones/${milestoneId}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) fetchGoalData();
    } catch (e) {
      console.error('Milestone toggle failed:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 13, fontWeight: 500 }}>Loading project dashboard & telemetry...</p>
      </div>
    );
  }

  const project = data?.project || {};
  const stats = data?.stats || {};
  const masteries = data?.masteries || [];
  const recentEvents = data?.recentEvents || [];
  const recommendations = data?.recommendations || [];

  const topRecommendation = recommendations[0] || {
    title: 'Ask AI Tutor to clarify weak concepts',
    action: 'Ask AI Tutor to clarify weak concepts',
    target_tab: 'tutor',
    description: 'Grounded dialogue with page citations reinforces conceptual gaps.',
    reason: 'Grounded dialogue with page citations reinforces conceptual gaps.'
  };

  const weakConcepts = masteries.filter((m) => m.status === 'needs_attention' || m.mastery_score < 70);

  const flowSteps = [
    {
      id: 'materials',
      num: '1',
      title: 'Materials & Knowledge',
      subtitle: (stats.materialsCount || 1) + ' Document Indexed',
      desc: 'PDFs parsed with OCR, semantic chunks, and vector index.',
      icon: FileText
    },
    {
      id: 'tutor',
      num: '2',
      title: 'AI Tutor & Citations',
      subtitle: 'Grounded Dialogue',
      desc: 'Ask questions with strict page citations & refusal guardrails.',
      icon: Bot
    },
    {
      id: 'quiz',
      num: '3',
      title: 'Adaptive Drill Arena',
      subtitle: (stats.quizzesCompleted || 0) + ' Drills Taken',
      desc: 'MCQ & Open-ended drills with 5-point AI rubric grading.',
      icon: Award
    },
    {
      id: 'growth',
      num: '4',
      title: 'Mastery & Growth',
      subtitle: (stats.averageMastery || 75) + '% Average',
      desc: 'Track concept mastery velocities & targeted remediation.',
      icon: TrendingUp
    },
    {
      id: 'analytics',
      num: '5',
      title: 'Analytics & Telemetry',
      subtitle: recentEvents.length + ' Events Tracked',
      desc: 'Audit trail, event replay, and learning velocity metrics.',
      icon: LineChart
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Executive Hero: Recommended Next Step (PRD Section 1 & 10) */}
      <div style={{
        background: '#0f172a',
        borderRadius: 12,
        padding: '22px 26px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            fontSize: 11,
            fontWeight: 600,
            color: '#cbd5e1',
            width: 'fit-content'
          }}>
            <Compass size={12} color="#818cf8" />
            <span>Recommended Next Action</span>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            {topRecommendation.title || topRecommendation.action}
          </h2>

          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
            {topRecommendation.description || topRecommendation.reason}
          </p>
        </div>

        <button
          onClick={() => onSelectTab(topRecommendation.target_tab || (topRecommendation.action_type === 'take_quiz' ? 'quiz' : 'tutor'))}
          className="btn btn-primary"
          style={{ padding: '9px 16px', fontSize: 13 }}
        >
          <span>{topRecommendation.action_type === 'take_quiz' ? 'Start Adaptive Drill' : 'Continue Learning'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <div className="card-pro" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            Materials Indexed
          </span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
            {stats.materialsCount || 1}
          </div>
          <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>Vector Indexed & Active</span>
        </div>

        <div className="card-pro" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            Average Mastery
          </span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#059669' }}>
            {stats.averageMastery || 75}%
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Across all tracked concepts</span>
        </div>

        <div className="card-pro" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            Quizzes Completed
          </span>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
            {stats.quizzesCompleted || 0}
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Adaptive Drills & Assessments</span>
        </div>

        <div className="card-pro" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            Needs Attention
          </span>
          <div style={{ fontSize: 22, fontWeight: 700, color: weakConcepts.length > 0 ? '#e11d48' : '#059669' }}>
            {weakConcepts.length}
          </div>
          <span style={{ fontSize: 11, color: weakConcepts.length > 0 ? '#e11d48' : '#059669' }}>
            {weakConcepts.length > 0 ? 'Concepts below 70% threshold' : 'All concepts above threshold'}
          </span>
        </div>
      </div>

      {/* Target Learning Goal Progress Tracker (PRD Feature 3) */}
      {goalData && (
        <div className="card-pro" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="#4f46e5" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Target Learning Goal: {goalData.title}
                </h3>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                Tracks explicit milestone completion toward your target date, independent of general knowledge mastery.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={'badge ' + (goalData.status === 'achieved' ? 'badge-improving' : goalData.status === 'on_track' ? 'badge-indigo' : 'badge-attention')}>
                <Clock size={11} />
                <span>Target: {goalData.target_date} &bull; {goalData.daysRemaining} Days Left &bull; {goalData.status.replace('_', ' ').toUpperCase()}</span>
              </span>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Goal Milestone Progress</span>
              <span style={{ fontWeight: 700, color: goalData.progressPercent >= 75 ? '#059669' : '#4f46e5' }}>
                {goalData.progressPercent}% Completed
              </span>
            </div>
            <div className="progress-bar-container" style={{ width: '100%', height: 8 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: goalData.progressPercent + '%',
                  background: goalData.progressPercent >= 100 ? '#059669' : 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
                }}
              />
            </div>
          </div>

          {/* Milestones Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Milestone Requirements:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {(goalData.milestones || []).map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleToggleMilestone(m.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid ' + (m.completed ? '#c7d2fe' : '#e2e8f0'),
                    background: m.completed ? '#f5f3ff' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Click to toggle milestone"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: m.completed ? 'none' : '2px solid #cbd5e1',
                      background: m.completed ? '#4f46e5' : 'transparent',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {m.completed && '✓'}
                    </div>
                    <span style={{
                      fontSize: 12,
                      color: m.completed ? '#3730a3' : '#334155',
                      textDecoration: m.completed ? 'line-through' : 'none',
                      fontWeight: m.completed ? 600 : 500
                    }}>
                      {m.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>
                    {m.weight || 25}% weight
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. The 5-Step Learning Loop Sequence (PRD Section 1) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              End-to-End Learning Loop
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              Move through each stage without losing context: Space &rarr; Material &rarr; Tutor &rarr; Quiz &rarr; Mastery.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {flowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                onClick={() => onSelectTab(step.id)}
                className="card-interactive"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  borderRadius: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: '#f1f5f9',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={15} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>#{step.num}</span>
                </div>

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{step.title}</h4>
                  <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 500, marginTop: 2 }}>{step.subtitle}</div>
                </div>

                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                  {step.desc}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#4f46e5', fontSize: 11, fontWeight: 600 }}>
                  <span>Open stage</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
