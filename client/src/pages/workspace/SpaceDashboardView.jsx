import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  FileText,
  Award,
  Target
} from 'lucide-react';

export const SpaceDashboardView = ({
  spaceId,
  onSelectProject,
  onCreateProjectInSpace,
  onEditSpace,
  onDeleteSpace,
  onEditProject,
  onDeleteProject,
  currentUser
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSpaceData = () => {
    setLoading(true);
    fetch(`/api/spaces/${spaceId}/dashboard`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (spaceId) {
      fetchSpaceData();
    }
  }, [spaceId]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 13, fontWeight: 500 }}>Loading Space Dashboard & Telemetry...</p>
      </div>
    );
  }

  const space = data?.space || {};
  const projects = data?.projects || [];
  const stats = data?.stats || {};
  const attentionConcepts = data?.attentionConcepts || [];

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Header Banner */}
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
        <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: space.color || '#6366f1',
              boxShadow: '0 0 8px ' + (space.color || '#6366f1')
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: space.color || '#6366f1', letterSpacing: '0.04em' }}>
              Learning Space
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            {space.name}
          </h1>

          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
            {space.description || 'Dedicated domain space organizing focused study projects and course materials.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{projects.length} Study Projects</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{stats.materialsCount || 0} Documents</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{stats.averageMastery || 75}% Average Mastery</span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onCreateProjectInSpace && onCreateProjectInSpace(space.id)}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '8px 14px' }}
          >
            <Plus size={14} />
            <span>New Project in Space</span>
          </button>

          <button
            onClick={() => onEditSpace && onEditSpace(space)}
            className="btn btn-secondary"
            title="Edit Space details"
            style={{ fontSize: 12, padding: '8px 12px' }}
          >
            <Pencil size={13} />
            <span>Edit Space</span>
          </button>

          <button
            onClick={() => onDeleteSpace && onDeleteSpace(space)}
            className="btn btn-secondary"
            title="Delete Space"
            style={{ fontSize: 12, padding: '8px 12px', color: '#dc2626', borderColor: '#fca5a5' }}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="card-pro" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Total Projects</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{projects.length}</div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Active in this space</span>
        </div>

        <div className="card-pro" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Indexed Materials</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.materialsCount || 0}</div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Processed notes & PDFs</span>
        </div>

        <div className="card-pro" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Space Mastery</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{stats.averageMastery || 75}%</div>
          <div className="progress-bar-container" style={{ marginTop: 2 }}>
            <div className="progress-bar-fill" style={{ width: `${stats.averageMastery || 75}%` }} />
          </div>
        </div>

        <div className="card-pro" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Attention Needed</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: stats.attentionCount > 0 ? '#dc2626' : '#059669' }}>
            {stats.attentionCount || 0}
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Concepts below 70% target</span>
        </div>
      </div>

      {/* 3. Areas Requiring Attention (if any) */}
      {attentionConcepts.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #fee2e2',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={17} color="#e11d48" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Space Attention Areas
              </h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>— Concepts across this space needing review</span>
            </div>
            <span className="badge badge-needs_attention">
              {attentionConcepts.length} Weak Concepts
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {attentionConcepts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '12px 16px',
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

                {projects[0] && (
                  <button
                    onClick={() => onSelectProject(projects[0], 'quiz')}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '4px 8px', color: '#e11d48', borderColor: '#fca5a5' }}
                  >
                    <span>Practice</span>
                    <ArrowRight size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Projects in this Space */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Projects in {space.name}
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              Individual study units and curricula encapsulated within this space
            </p>
          </div>

          <button
            onClick={() => onCreateProjectInSpace && onCreateProjectInSpace(space.id)}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            <Plus size={13} />
            <span>Add Study Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <BookOpen size={32} color="#94a3b8" />
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              No projects in this space yet
            </h4>
            <p style={{ fontSize: 13, color: '#64748b', maxWidth: '420px', margin: 0 }}>
              Create your first focused learning project to upload PDFs, start AI tutoring dialogues, and generate adaptive quizzes.
            </p>
            <button
              onClick={() => onCreateProjectInSpace && onCreateProjectInSpace(space.id)}
              className="btn btn-primary"
              style={{ fontSize: 13, marginTop: 6 }}
            >
              <Plus size={14} />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="card-pro"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-indigo">
                    {proj.average_mastery || 75}% Mastery
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject && onEditProject(proj);
                      }}
                      title="Edit Project"
                      className="btn-ghost"
                      style={{ padding: '3px 6px', borderRadius: 4, cursor: 'pointer', border: 'none', background: 'none', color: '#64748b' }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject && onDeleteProject(proj);
                      }}
                      title="Delete Project"
                      className="btn-ghost"
                      style={{ padding: '3px 6px', borderRadius: 4, cursor: 'pointer', border: 'none', background: 'none', color: '#dc2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectProject(proj, 'dashboard')}
                >
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {proj.name}
                  </h4>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, margin: 0, lineHeight: 1.4 }}>
                    {proj.learning_goal || proj.description}
                  </p>
                </div>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid #f1f5f9',
                  fontSize: 11,
                  color: '#64748b'
                }}>
                  <span>{proj.material_count || 0} Notes Indexed</span>
                  <button
                    onClick={() => onSelectProject(proj, 'dashboard')}
                    className="btn btn-primary"
                    style={{ fontSize: 11, padding: '5px 10px' }}
                  >
                    <span>Enter Workspace</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
