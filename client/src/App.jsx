import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { UserHome } from './pages/UserHome';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { SpaceDashboardView } from './pages/workspace/SpaceDashboardView';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import {
  CreateSpaceModal,
  CreateProjectModal,
  EditSpaceModal,
  EditProjectModal,
  ConfirmDeleteModal
} from './components/CreateModal';
import { Shield, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export const App = () => {
  // Authentication State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('study_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'project' | 'space' | 'admin'
  const [spaces, setSpaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [targetWorkspaceTab, setTargetWorkspaceTab] = useState('materials');
  const [recommendations, setRecommendations] = useState([]);

  // Create Modals
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [createProjectDefaultSpaceId, setCreateProjectDefaultSpaceId] = useState(null);

  // Edit Modals
  const [isEditSpaceModalOpen, setIsEditSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'space' | 'project', item: any }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/spaces').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json())
      ]);

      const loadedSpaces = sRes.spaces || [];
      const loadedProjects = pRes.projects || [];
      setSpaces(loadedSpaces);
      setProjects(loadedProjects);

      if (loadedProjects.length > 0 && !selectedProject) {
        setSelectedProject(loadedProjects[0]);
        const rRes = await fetch('/api/projects/' + loadedProjects[0].id + '/recommendations').then((r) => r.json());
        setRecommendations(rRes.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('study_user', JSON.stringify(user));
    } catch (e) {}
    setCurrentView(user.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('study_user');
    } catch (e) {}
  };

  const handleSelectProject = async (project, targetTab) => {
    setSelectedProject(project);
    if (targetTab) setTargetWorkspaceTab(targetTab);
    setCurrentView('project');

    try {
      const rRes = await fetch('/api/projects/' + project.id + '/recommendations').then((r) => r.json());
      setRecommendations(rRes.recommendations || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSpace = (space) => {
    setSelectedSpaceId(space.id);
    setCurrentView('space');
  };

  const handleEditSpace = (space) => {
    setEditingSpace(space);
    setIsEditSpaceModalOpen(true);
  };

  const handleDeleteSpacePrompt = (space) => {
    setDeleteTarget({ type: 'space', item: space });
    setIsDeleteModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsEditProjectModalOpen(true);
  };

  const handleDeleteProjectPrompt = (project) => {
    setDeleteTarget({ type: 'project', item: project });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'space') {
        await fetch(`/api/spaces/${deleteTarget.item.id}`, { method: 'DELETE' });
        if (selectedSpaceId === deleteTarget.item.id) {
          setSelectedSpaceId(null);
          setCurrentView('home');
        }
      } else if (deleteTarget.type === 'project') {
        await fetch(`/api/projects/${deleteTarget.item.id}`, { method: 'DELETE' });
        if (selectedProject?.id === deleteTarget.item.id) {
          setSelectedProject(null);
          setCurrentView('home');
        }
      }
      await loadData();
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (e) {
      console.error('Delete operation failed:', e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateProjectInSpace = (spaceId) => {
    setCreateProjectDefaultSpaceId(spaceId);
    setIsProjectModalOpen(true);
  };

  // If user is not logged in, show clean SaaS Auth (Login / Signup)
  if (!currentUser) {
    if (authMode === 'signup') {
      return (
        <SignupPage
          onSignupSuccess={handleLogin}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthMode('signup')}
      />
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        spaces={spaces}
        projects={projects}
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={handleSelectSpace}
        onEditSpace={handleEditSpace}
        onDeleteSpace={handleDeleteSpacePrompt}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProjectPrompt}
        currentUser={currentUser}
        onLogout={handleLogout}
        onCreateSpace={() => setIsSpaceModalOpen(true)}
        onCreateProject={() => {
          setCreateProjectDefaultSpaceId(null);
          setIsProjectModalOpen(true);
        }}
      />

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Minimalist Live Status */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: '#334155'
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981'
              }} />
              <span>System Live</span>
            </div>

            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} color="#94a3b8" />
              <span>Project-Level Data Isolation Enforced</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              fontSize: 12
            }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: currentUser.role === 'admin' ? '#0f172a' : '#4f46e5',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700
              }}>
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{currentUser.name}</span>
              <span style={{
                fontSize: 10,
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 4,
                background: currentUser.role === 'admin' ? '#fee2e2' : '#f1f5f9',
                color: currentUser.role === 'admin' ? '#b91c1c' : '#475569'
              }}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {currentView === 'home' && (
          <UserHome
            spaces={spaces}
            projects={projects}
            recommendations={recommendations}
            onSelectProject={handleSelectProject}
            onSelectSpace={handleSelectSpace}
            onCreateSpace={() => setIsSpaceModalOpen(true)}
            onCreateProject={() => {
              setCreateProjectDefaultSpaceId(null);
              setIsProjectModalOpen(true);
            }}
            currentUser={currentUser}
          />
        )}

        {currentView === 'space' && selectedSpaceId && (
          <SpaceDashboardView
            key={selectedSpaceId}
            spaceId={selectedSpaceId}
            onSelectProject={handleSelectProject}
            onCreateProjectInSpace={handleCreateProjectInSpace}
            onEditSpace={handleEditSpace}
            onDeleteSpace={handleDeleteSpacePrompt}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProjectPrompt}
            currentUser={currentUser}
          />
        )}

        {currentView === 'project' && selectedProject && (
          <ProjectWorkspace
            key={selectedProject.id}
            project={selectedProject}
            activeTab={targetWorkspaceTab}
            onTabChange={(newTab) => setTargetWorkspaceTab(newTab)}
            onBackToHome={() => setCurrentView('home')}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProjectPrompt}
            currentUser={currentUser}
          />
        )}

        {currentView === 'admin' && currentUser?.role === 'admin' && <AdminDashboard />}
        {currentView === 'admin' && currentUser?.role !== 'admin' && (
          <UserHome
            spaces={spaces}
            projects={projects}
            recommendations={recommendations}
            onSelectProject={handleSelectProject}
            onSelectSpace={handleSelectSpace}
            onCreateSpace={() => setIsSpaceModalOpen(true)}
            onCreateProject={() => {
              setCreateProjectDefaultSpaceId(null);
              setIsProjectModalOpen(true);
            }}
            currentUser={currentUser}
          />
        )}
      </main>

      <CreateSpaceModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        onCreated={loadData}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        spaces={spaces}
        defaultSpaceId={createProjectDefaultSpaceId}
        onClose={() => {
          setIsProjectModalOpen(false);
          setCreateProjectDefaultSpaceId(null);
        }}
        onCreated={loadData}
      />

      <EditSpaceModal
        isOpen={isEditSpaceModalOpen}
        space={editingSpace}
        onClose={() => {
          setIsEditSpaceModalOpen(false);
          setEditingSpace(null);
        }}
        onUpdated={loadData}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        project={editingProject}
        onClose={() => {
          setIsEditProjectModalOpen(false);
          setEditingProject(null);
        }}
        onUpdated={async () => {
          await loadData();
          if (editingProject && selectedProject?.id === editingProject.id) {
            const updated = await fetch(`/api/projects/${editingProject.id}/dashboard`)
              .then((r) => r.json())
              .catch(() => null);
            if (updated?.project) setSelectedProject(updated.project);
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title={deleteTarget?.type === 'space' ? `Delete Space: ${deleteTarget?.item?.name}` : `Delete Project: ${deleteTarget?.item?.name}`}
        message={
          deleteTarget?.type === 'space'
            ? 'Deleting this space will permanently remove the space and ALL enclosed study projects and learning history.'
            : 'Deleting this project will permanently remove all uploaded notes, document embeddings, generated quizzes, and concept mastery logs.'
        }
        warningNote="This action is irreversible and cannot be undone."
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
