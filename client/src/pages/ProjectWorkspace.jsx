import React, { useState } from 'react';
import {
  Award,
  Bot,
  ChevronRight,
  FileText,
  LineChart,
  Target,
  TrendingUp,
  LayoutDashboard,
  Sparkles,
  Pencil,
  Trash2,
  Download
} from 'lucide-react';
import { ProjectDashboardView } from './workspace/ProjectDashboardView';
import { MaterialsView } from './workspace/MaterialsView';
import { TutorView } from './workspace/TutorView';
import { QuizView } from './workspace/QuizView';
import { GrowthView } from './workspace/GrowthView';
import { AnalyticsView } from './workspace/AnalyticsView';
import { InnovationsView } from './workspace/InnovationsView';

export const ProjectWorkspace = ({
  project,
  activeTab: externalTab,
  initialTab = 'dashboard',
  onTabChange,
  onBackToHome,
  onEditProject,
  onDeleteProject,
  currentUser
}) => {
  const [internalTab, setInternalTab] = useState(externalTab || initialTab || 'dashboard');
  const [currentProject, setCurrentProject] = useState(project);

  React.useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  React.useEffect(() => {
    const handleQuizSubmitted = async (e) => {
      if (e.detail?.projectId === project.id) {
        try {
          const res = await fetch(`/api/projects/${project.id}/dashboard`);
          if (res.ok) {
            const data = await res.json();
            if (data.project) {
              setCurrentProject((prev) => ({
                ...prev,
                average_mastery: data.stats?.averageMastery ?? prev.average_mastery
              }));
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener('quiz_submitted', handleQuizSubmitted);
    return () => window.removeEventListener('quiz_submitted', handleQuizSubmitted);
  }, [project.id]);

  React.useEffect(() => {
    if (externalTab) {
      setInternalTab(externalTab);
    }
  }, [externalTab]);

  const activeTab = externalTab || internalTab;

  const handleTabSelect = (tabId) => {
    setInternalTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'materials', label: '1. Materials', icon: FileText },
    { id: 'tutor', label: '2. AI Tutor', icon: Bot },
    { id: 'quiz', label: '3. Adaptive Drill', icon: Award },
    { id: 'growth', label: '4. Mastery Growth', icon: TrendingUp },
    { id: 'analytics', label: '5. Analytics', icon: LineChart },
    { id: 'innovations', label: '6. Studio Lab', icon: Sparkles }
  ];

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumbs & Project Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
          <button
            onClick={onBackToHome}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500, padding: 0 }}
          >
            Spaces
          </button>
          <ChevronRight size={13} color="#94a3b8" />
          <span style={{ color: '#475569', fontWeight: 500 }}>{project.space_name || 'AI Space'}</span>
          <ChevronRight size={13} color="#94a3b8" />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{project.name}</span>
        </div>

        {/* Clean Executive Project Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '750px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {project.name}
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: 12,
              width: 'fit-content'
            }}>
              <Target size={13} color="#6366f1" />
              <span>Goal: {project.learning_goal}</span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '10px 16px',
              borderRadius: 8
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 10, textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
                  Project Mastery
                </span>
                <div style={{ fontSize: 20, fontWeight: 700, color: (currentProject.average_mastery && currentProject.average_mastery > 0) ? '#059669' : '#64748b', lineHeight: 1.2 }}>
                  {currentProject.average_mastery !== undefined && currentProject.average_mastery > 0 ? `${currentProject.average_mastery}%` : '0%'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onEditProject && onEditProject(project)}
                  title="Edit Project"
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>
                <a
                  href={`/api/projects/${project.id}/export`}
                  download
                  title="Export Project Learning Data (JSON)"
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', color: 'inherit' }}
                >
                  <Download size={12} />
                  <span>Export</span>
                </a>
              </div>
              <button
                onClick={() => onDeleteProject && onDeleteProject(project)}
                title="Delete Project"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: '#e11d48', borderColor: '#fecdd3' }}
              >
                <Trash2 size={12} />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Modern Segmented Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: '#f1f5f9',
        padding: '4px',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSelect(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 7,
                background: isActive ? '#0f172a' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: 12,
                border: 'none',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px 0 rgba(15, 23, 42, 0.15)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panes */}
      <div>
        {activeTab === 'dashboard' && (
          <ProjectDashboardView
            projectId={project.id}
            onSelectTab={handleTabSelect}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'materials' && (
          <MaterialsView projectId={project.id} currentUser={currentUser} />
        )}
        {activeTab === 'tutor' && (
          <TutorView projectId={project.id} currentUser={currentUser} />
        )}
        {activeTab === 'quiz' && (
          <QuizView projectId={project.id} currentUser={currentUser} />
        )}
        {activeTab === 'growth' && (
          <GrowthView projectId={project.id} onSelectTab={handleTabSelect} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView projectId={project.id} />
        )}
        {activeTab === 'innovations' && (
          <InnovationsView projectId={project.id} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
};
