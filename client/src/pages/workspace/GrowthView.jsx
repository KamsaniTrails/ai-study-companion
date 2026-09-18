import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Award,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  HelpCircle,
  FileText,
  Compass,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  GitFork,
  Network
} from 'lucide-react';

export const GrowthView = ({ projectId, onSelectTab }) => {
  const [masteries, setMasteries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [conceptGraph, setConceptGraph] = useState(null);
  const [viewMode, setViewMode] = useState('trajectory'); // 'trajectory' | 'dependency_graph'
  const [selectedConceptNode, setSelectedConceptNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      const [mRes, rRes, gRes] = await Promise.all([
        fetch('/api/projects/' + projectId + '/mastery').then((r) => r.json()).catch(() => ({ masteries: [] })),
        fetch('/api/projects/' + projectId + '/recommendations').then((r) => r.json()).catch(() => ({ recommendations: [] })),
        fetch('/api/projects/' + projectId + '/concept-graph').then((r) => r.json()).catch(() => null)
      ]);
      setMasteries(mRes?.masteries || []);
      setRecommendations(rRes?.recommendations || []);
      setConceptGraph(gRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleUpdateEvidence = async (conceptId, conceptName, isCorrect) => {
    setUpdatingId(conceptId);
    try {
      const score = isCorrect ? 90 : 35;
      const res = await fetch('/api/projects/' + projectId + '/mastery/update-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId,
          conceptName,
          score,
          isCorrect,
          questionPrompt: 'Application problem on ' + conceptName,
          userAnswer: isCorrect ? 'Correct conceptual derivation' : 'Incomplete application reasoning'
        })
      });
      const data = await res.json();
      if (data.masteries) {
        setMasteries(data.masteries);
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Evidence update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const improvingList = masteries.filter((m) => m.status === 'improving');
  const stableList = masteries.filter((m) => m.status === 'stable');
  const needsAttentionList = masteries.filter((m) => m.status === 'needs_attention' || m.mastery_score < 65);

  const testedMasteries = masteries.filter((m) => m.last_tested_at || (m.history && m.history.length > 0));
  const avgMastery = testedMasteries.length > 0
    ? Math.round(testedMasteries.reduce((a, b) => a + b.mastery_score, 0) / testedMasteries.length)
    : 0;

  const filteredMasteries = activeFilter === 'improving'
    ? improvingList
    : activeFilter === 'stable'
    ? stableList
    : activeFilter === 'needs_attention'
    ? needsAttentionList
    : masteries;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ maxWidth: '750px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="#4f46e5" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Mastery, Growth & Targeted Remediation
            </h2>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.5, margin: '4px 0 0 0' }}>
            Mastery estimates evolve continuously as new evidence emerges from quizzes, dialogue, and drills.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* View Mode Switcher (PRD Feature 1) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            gap: 3
          }}>
            <button
              onClick={() => setViewMode('trajectory')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'trajectory' ? '#ffffff' : 'transparent',
                color: viewMode === 'trajectory' ? '#0f172a' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: viewMode === 'trajectory' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              📈 Growth Trajectories
            </button>
            <button
              onClick={() => setViewMode('dependency_graph')}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'dependency_graph' ? '#4f46e5' : 'transparent',
                color: viewMode === 'dependency_graph' ? '#ffffff' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: viewMode === 'dependency_graph' ? '0 1px 3px rgba(79,70,229,0.25)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Network size={13} />
              <span>Dependency Graph</span>
              <span style={{
                fontSize: 9,
                background: viewMode === 'dependency_graph' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: viewMode === 'dependency_graph' ? '#ffffff' : '#475569',
                padding: '1px 5px',
                borderRadius: 4,
                fontWeight: 700
              }}>
                PRD 1
              </span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: '#f8fafc',
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Average Mastery</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: avgMastery >= 75 ? '#059669' : '#0284c7', lineHeight: 1.2 }}>
                {avgMastery}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'dependency_graph' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Graph Header Overview */}
          <div className="card-pro" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Network size={16} color="#4f46e5" />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Prerequisite & Concept Dependency Map (PRD Feature 1)
                </h3>
                <span className="badge badge-indigo">DAG Flow</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                Concepts build systematically from foundational calculus/vectors to intermediate mechanisms and advanced architectures.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} /> Mastered (&gt;75%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }} /> Learning (60-74%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48' }} /> Needs Remediation (&lt;60%)
              </span>
            </div>
          </div>

          {/* 3-Tier Dependency Hierarchy Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, alignItems: 'start' }}>
            {/* TIER 1: Foundations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>TIER 1: FOUNDATIONAL CORE</span>
                <span className="badge badge-neutral">Prerequisites</span>
              </div>

              {(conceptGraph?.nodes?.filter((n) => n.tier === 1) || []).map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedConceptNode(node)}
                  className="card-pro card-interactive"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    border: selectedConceptNode?.id === node.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: selectedConceptNode?.id === node.id ? '#f5f3ff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{node.name}</h4>
                    <span className={'badge ' + (node.masteryScore >= 75 ? 'badge-improving' : node.masteryScore >= 60 ? 'badge-stable' : 'badge-attention')}>
                      {node.masteryScore}%
                    </span>
                  </div>

                  <div className="progress-bar-container" style={{ width: '100%', height: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: node.masteryScore + '%',
                        background: node.masteryScore >= 75 ? '#059669' : node.masteryScore >= 60 ? '#0284c7' : '#e11d48'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    <strong style={{ color: '#0f172a' }}>Builds toward:</strong>{' '}
                    {node.leadsTo?.length > 0 ? node.leadsTo.join(', ') : 'Higher mechanisms'}
                  </div>
                </div>
              ))}
            </div>

            {/* TIER 2: Intermediate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>TIER 2: INTERMEDIATE MECHANICS</span>
                <span className="badge badge-neutral">Core Logic</span>
              </div>

              {(conceptGraph?.nodes?.filter((n) => n.tier === 2) || []).map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedConceptNode(node)}
                  className="card-pro card-interactive"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    border: selectedConceptNode?.id === node.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: selectedConceptNode?.id === node.id ? '#f5f3ff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{node.name}</h4>
                    <span className={'badge ' + (node.masteryScore >= 75 ? 'badge-improving' : node.masteryScore >= 60 ? 'badge-stable' : 'badge-attention')}>
                      {node.masteryScore}%
                    </span>
                  </div>

                  <div className="progress-bar-container" style={{ width: '100%', height: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: node.masteryScore + '%',
                        background: node.masteryScore >= 75 ? '#059669' : node.masteryScore >= 60 ? '#0284c7' : '#e11d48'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    <strong style={{ color: '#0f172a' }}>Requires:</strong>{' '}
                    {node.prerequisites?.length > 0 ? node.prerequisites.join(', ') : 'Tier 1 foundations'}
                  </div>
                </div>
              ))}
            </div>

            {/* TIER 3: Advanced */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>TIER 3: ADVANCED ARCHITECTURES</span>
                <span className="badge badge-neutral">Synthesis</span>
              </div>

              {(conceptGraph?.nodes?.filter((n) => n.tier === 3) || []).map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedConceptNode(node)}
                  className="card-pro card-interactive"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    border: selectedConceptNode?.id === node.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: selectedConceptNode?.id === node.id ? '#f5f3ff' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{node.name}</h4>
                    <span className={'badge ' + (node.masteryScore >= 75 ? 'badge-improving' : node.masteryScore >= 60 ? 'badge-stable' : 'badge-attention')}>
                      {node.masteryScore}%
                    </span>
                  </div>

                  <div className="progress-bar-container" style={{ width: '100%', height: 6 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: node.masteryScore + '%',
                        background: node.masteryScore >= 75 ? '#059669' : node.masteryScore >= 60 ? '#0284c7' : '#e11d48'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    <strong style={{ color: '#0f172a' }}>Synthesizes:</strong>{' '}
                    Tier 2 intermediate mechanisms into complete models
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Concept Inspector Drawer */}
          {selectedConceptNode && (
            <div className="card-pro" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #c7d2fe' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>
                    {selectedConceptNode.name}
                  </h4>
                  <span className="badge badge-indigo">{selectedConceptNode.tierLabel}</span>
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Mastery: <strong>{selectedConceptNode.masteryScore}%</strong> &bull; Status: <span style={{ textTransform: 'capitalize' }}>{selectedConceptNode.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onSelectTab && onSelectTab('tutor')}
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  Discuss with AI Tutor ➔
                </button>
                <button
                  onClick={() => setSelectedConceptNode(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '6px 10px' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* KPI Overview Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div
          onClick={() => setActiveFilter('all')}
          className="card-interactive"
          style={{
            padding: '14px 16px',
            border: '1px solid ' + (activeFilter === 'all' ? '#0f172a' : '#e2e8f0'),
            background: activeFilter === 'all' ? '#fafbfc' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>All Concepts</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{masteries.length}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Complete concept scope</div>
        </div>

        <div
          onClick={() => setActiveFilter('improving')}
          className="card-interactive"
          style={{
            padding: '14px 16px',
            border: '1px solid ' + (activeFilter === 'improving' ? '#059669' : '#e2e8f0'),
            background: activeFilter === 'improving' ? '#fafbfc' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 11, color: '#059669', textTransform: 'uppercase', fontWeight: 600 }}>Improving</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#059669', marginTop: 2 }}>{improvingList.length}</div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> Positive trajectory
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('stable')}
          className="card-interactive"
          style={{
            padding: '14px 16px',
            border: '1px solid ' + (activeFilter === 'stable' ? '#0284c7' : '#e2e8f0'),
            background: activeFilter === 'stable' ? '#fafbfc' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 11, color: '#0284c7', textTransform: 'uppercase', fontWeight: 600 }}>Stable</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0284c7', marginTop: 2 }}>{stableList.length}</div>
          <div style={{ fontSize: 11, color: '#0284c7', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Activity size={12} /> Consistent accuracy
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('needs_attention')}
          className="card-interactive"
          style={{
            padding: '14px 16px',
            border: '1px solid ' + (activeFilter === 'needs_attention' ? '#e11d48' : '#e2e8f0'),
            background: activeFilter === 'needs_attention' ? '#fafbfc' : '#ffffff'
          }}
        >
          <div style={{ fontSize: 11, color: '#e11d48', textTransform: 'uppercase', fontWeight: 600 }}>Requiring Attention</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#e11d48', marginTop: 2 }}>{needsAttentionList.length}</div>
          <div style={{ fontSize: 11, color: '#e11d48', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} /> Targeted for drill
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="card-pro" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Actionable Recommendations
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              Synthesized from weak concepts, quiz mistakes, learning goals, and course notes.
            </p>
          </div>
          <span className="badge badge-indigo">
            {recommendations.length} Recommended Actions
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {recommendations.length === 0 ? (
            <div style={{ padding: 24, gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', fontSize: 12 }}>
              Your understanding across all concepts is solid. Take another drill to maintain retention!
            </div>
          ) : (
            recommendations.map((rec) => {
              const isHigh = rec.priority === 'high';
              return (
                <div
                  key={rec.id}
                  style={{
                    padding: '16px',
                    borderRadius: 10,
                    background: isHigh ? '#fff1f2' : '#f8fafc',
                    border: '1px solid ' + (isHigh ? '#fecdd3' : '#e2e8f0'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={'badge ' + (isHigh ? 'badge-needs_attention' : 'badge-stable')}>
                      {rec.priority.toUpperCase()} PRIORITY
                    </span>
                    {rec.target_page && (
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
                        Notes Page {rec.target_page}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{rec.title}</h4>
                    <p style={{ fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 1.5, margin: '4px 0 0 0' }}>
                      {rec.description}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      Action: {rec.action || (rec.action_type === 'take_quiz' ? 'Practice Adaptive Drill' : 'Review Notes in AI Tutor')}
                    </span>
                    <button
                      onClick={() => onSelectTab && onSelectTab(rec.target_tab || (rec.action_type === 'take_quiz' ? 'quiz' : 'tutor'))}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      <span>Launch</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Concept Mastery List with Evidence Simulation */}
      <div className="card-pro" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Tracked Concepts ({filteredMasteries.length})
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              Verify how new evidence updates concept mastery scores and trajectories.
            </p>
          </div>
          <span className="badge badge-neutral">
            Showing: {activeFilter.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredMasteries.map((m) => {
            const isUpdating = updatingId === m.id;
            return (
              <div
                key={m.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: 240, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {m.concept_name}
                    </span>
                    <span className={'badge ' + (m.status === 'improving' ? 'badge-improving' : m.status === 'stable' ? 'badge-stable' : 'badge-needs_attention')}>
                      {m.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div className="progress-bar-container" style={{ width: 140 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: m.mastery_score + '%',
                          background: m.mastery_score >= 75 ? '#059669' : m.mastery_score >= 60 ? '#0284c7' : '#e11d48'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                      {m.mastery_score}%
                    </span>
                  </div>
                </div>

                {/* Interactive Evidence Simulator Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Simulate Evidence:</span>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateEvidence(m.id, m.concept_name, true)}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '4px 8px', color: '#059669' }}
                    title="Simulate correct response (+ Evidence)"
                  >
                    + Correct (+15%)
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateEvidence(m.id, m.concept_name, false)}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '4px 8px', color: '#e11d48' }}
                    title="Simulate mistake (- Evidence)"
                  >
                    - Mistake (-20%)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
    )}
  </div>
  );
};
