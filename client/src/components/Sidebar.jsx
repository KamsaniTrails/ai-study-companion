import React, { useState, useEffect } from 'react';
import {
  Brain,
  Compass,
  Shield,
  Folder,
  FolderOpen,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  LogOut,
  Sparkles,
  Layers,
  Pencil,
  Trash2,
  Layout,
  X
} from 'lucide-react';

export const Sidebar = ({
  currentView,
  setCurrentView,
  spaces = [],
  projects = [],
  selectedProject,
  onSelectProject,
  selectedSpaceId,
  onSelectSpace,
  onEditSpace,
  onDeleteSpace,
  onEditProject,
  onDeleteProject,
  currentUser,
  onLogout,
  onCreateSpace,
  onCreateProject,
  mobileMenuOpen,
  onCloseMobile
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [expandedSpaceId, setExpandedSpaceId] = useState(() => {
    return selectedProject?.space_id || (spaces.length > 0 ? spaces[0].id : null);
  });

  useEffect(() => {
    if (selectedProject?.space_id) {
      setExpandedSpaceId(selectedProject.space_id);
    } else if (spaces.length > 0 && !expandedSpaceId) {
      setExpandedSpaceId(spaces[0].id);
    }
  }, [selectedProject, spaces]);

  const toggleSpace = (spaceId, e) => {
    e?.stopPropagation();
    setExpandedSpaceId((prev) => (prev === spaceId ? null : spaceId));
  };

  return (
    <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header & Mobile Close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}>
            <Brain size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
              Study Companion
            </h2>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              AI Learning Workspace
            </span>
          </div>
        </div>

        <button
          className="mobile-close-btn"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <button
          onClick={() => setCurrentView('home')}
          className="btn"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            fontSize: 13,
            gap: 10,
            background: currentView === 'home' ? '#0f172a' : 'transparent',
            color: currentView === 'home' ? '#ffffff' : '#334155',
            fontWeight: currentView === 'home' ? 600 : 500,
            borderRadius: 8
          }}
        >
          <Compass size={16} />
          <span>Home Dashboard</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setCurrentView('admin')}
            className="btn"
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              fontSize: 13,
              gap: 10,
              background: currentView === 'admin' ? '#0f172a' : 'transparent',
              color: currentView === 'admin' ? '#ffffff' : '#334155',
              fontWeight: currentView === 'admin' ? 600 : 500,
              borderRadius: 8
            }}
          >
            <Shield size={16} />
            <span>Admin Observability</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 9,
              padding: '1px 5px',
              borderRadius: 4,
              background: currentView === 'admin' ? 'rgba(255, 255, 255, 0.2)' : '#fee2e2',
              color: currentView === 'admin' ? '#ffffff' : '#b91c1c',
              fontWeight: 700
            }}>ADMIN</span>
          </button>
        )}
      </nav>

      {/* Spaces & Projects Accordion Tree */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        paddingRight: 2
      }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            Spaces & Projects
          </span>
          {onCreateSpace && (
            <button
              onClick={onCreateSpace}
              title="Create New Space"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: 4
              }}
            >
              <Plus size={12} />
              <span>New Space</span>
            </button>
          )}
        </div>

        {/* Clean Accordion for Spaces */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {spaces.length === 0 ? (
            <div style={{ padding: '16px 8px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
              No spaces yet. Create one to get started!
            </div>
          ) : (
            spaces.map((space) => {
              const spaceProjects = projects.filter((p) => p.space_id === space.id);
              const isExpanded = expandedSpaceId === space.id;
              const isSpaceActive = currentView === 'space' && selectedSpaceId === space.id;

              return (
                <div
                  key={space.id}
                  style={{
                    borderRadius: 8,
                    border: '1px solid ' + (isSpaceActive ? '#4f46e5' : isExpanded ? '#e2e8f0' : 'transparent'),
                    background: isSpaceActive ? '#f5f3ff' : isExpanded ? '#fafbfc' : 'transparent',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Space Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 9px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRadius: 6,
                      background: isSpaceActive ? '#ede9fe' : isExpanded ? '#f1f5f9' : 'transparent'
                    }}
                    onClick={() => {
                      if (onSelectSpace) onSelectSpace(space);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', flex: 1 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: space.color || '#4f46e5',
                        flexShrink: 0
                      }} />
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isSpaceActive ? '#4338ca' : isExpanded ? '#0f172a' : '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {space.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {/* Edit Space Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditSpace) onEditSpace(space);
                        }}
                        title="Edit Space"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px 3px',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: 3
                        }}
                      >
                        <Pencil size={11} />
                      </button>

                      {/* Delete Space Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteSpace) onDeleteSpace(space);
                        }}
                        title="Delete Space"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '2px 3px',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: 3
                        }}
                      >
                        <Trash2 size={11} />
                      </button>

                      {/* Accordion Toggle */}
                      <div
                        onClick={(e) => toggleSpace(space.id, e)}
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '1px 2px' }}
                      >
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#64748b',
                          background: '#e2e8f0',
                          padding: '1px 5px',
                          borderRadius: 8,
                          marginRight: 4
                        }}>
                          {spaceProjects.length}
                        </span>
                        {isExpanded ? (
                          <ChevronDown size={13} color="#64748b" />
                        ) : (
                          <ChevronRight size={13} color="#94a3b8" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Projects List */}
                  {isExpanded && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      padding: '5px 6px 6px 12px',
                      borderLeft: '2px solid #e2e8f0',
                      marginLeft: 12,
                      marginTop: 2
                    }}>
                      {spaceProjects.length === 0 ? (
                        <div style={{ fontSize: 11, color: '#94a3b8', padding: '4px 6px' }}>
                          No projects in this space.
                        </div>
                      ) : (
                        spaceProjects.map((proj) => {
                          const isSelected = selectedProject?.id === proj.id && currentView === 'project';
                          return (
                            <div
                              key={proj.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '5px 7px',
                                borderRadius: 6,
                                background: isSelected ? '#0f172a' : 'transparent',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <button
                                onClick={() => {
                                  onSelectProject(proj);
                                  setCurrentView('project');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 7,
                                  background: 'none',
                                  color: isSelected ? '#ffffff' : '#334155',
                                  border: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  fontWeight: isSelected ? 600 : 400,
                                  flex: 1,
                                  overflow: 'hidden'
                                }}
                              >
                                <BookOpen size={13} style={{ flexShrink: 0, color: isSelected ? '#ffffff' : '#94a3b8' }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {proj.name}
                                </span>
                              </button>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEditProject) onEditProject(proj);
                                  }}
                                  title="Edit Project"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    color: isSelected ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDeleteProject) onDeleteProject(proj);
                                  }}
                                  title="Delete Project"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    color: isSelected ? '#fca5a5' : '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* '+ Add Project' button */}
                      {onCreateProject && (
                        <button
                          onClick={onCreateProject}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 7px',
                            background: 'none',
                            border: '1px dashed #cbd5e1',
                            borderRadius: 5,
                            color: '#4f46e5',
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginTop: 3
                          }}
                        >
                          <Plus size={11} />
                          <span>Add Project</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User Profile & Logout */}
      <div style={{
        padding: '10px 12px',
        background: '#f8fafc',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: isAdmin ? '#0f172a' : '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0
          }}>
            {currentUser?.name?.slice(0, 2)?.toUpperCase() || 'US'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize' }}>
              {isAdmin ? 'Administrator' : 'Learner'}
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
