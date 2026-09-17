import React, { useState } from 'react';
import { X } from 'lucide-react';

export const CreateSpaceModal = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color })
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Create New Learning Space</h3>
          <button onClick={onClose} className="btn-ghost" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Space Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Quantum Computing & Cryptography"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="What broad area or domain does this space cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ marginTop: 6, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Accent Color</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    border: color === c ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: color === c ? '0 0 10px ' + c : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CreateProjectModal = ({ isOpen, spaces = [], defaultSpaceId, onClose, onCreated }) => {
  const [spaceId, setSpaceId] = useState(defaultSpaceId || spaces[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (defaultSpaceId) {
      setSpaceId(defaultSpaceId);
    } else if (spaces.length > 0 && !spaceId) {
      setSpaceId(spaces[0].id);
    }
  }, [defaultSpaceId, spaces]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !learningGoal.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: spaceId || spaces[0]?.id,
          name,
          description,
          learningGoal
        })
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Create Focused Learning Project</h3>
          <button onClick={onClose} className="btn-ghost" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Parent Space</label>
            <select
              className="input-field"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              style={{ marginTop: 6 }}
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Project Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Transformer Attention & LLM Architectures"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Core Learning Goal <span style={{ color: '#06b6d4' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Master mathematical formulation of self-attention and gradient flow"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              rows={2}
              className="input-field"
              placeholder="Optional overview or context for this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ marginTop: 6, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim() || !learningGoal.trim()} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditSpaceModal = ({ isOpen, space, onClose, onUpdated }) => {
  const [name, setName] = useState(space?.name || '');
  const [description, setDescription] = useState(space?.description || '');
  const [color, setColor] = useState(space?.color || '#6366f1');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (space) {
      setName(space.name || '');
      setDescription(space.description || '');
      setColor(space.color || '#6366f1');
    }
  }, [space]);

  if (!isOpen || !space) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color })
      });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Edit Learning Space</h3>
          <button onClick={onClose} className="btn-ghost" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Space Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              rows={3}
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ marginTop: 6, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Accent Color</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: c,
                    cursor: 'pointer',
                    border: color === c ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: color === c ? '0 0 10px ' + c : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditProjectModal = ({ isOpen, project, onClose, onUpdated }) => {
  const [name, setName] = useState(project?.name || '');
  const [learningGoal, setLearningGoal] = useState(project?.learning_goal || '');
  const [description, setDescription] = useState(project?.description || '');
  const [targetDate, setTargetDate] = useState(project?.target_date || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (project) {
      setName(project.name || '');
      setLearningGoal(project.learning_goal || '');
      setDescription(project.description || '');
      setTargetDate(project.target_date || '');
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !learningGoal.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, learningGoal, description, targetDate })
      });
      if (res.ok) {
        onUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Edit Learning Project</h3>
          <button onClick={onClose} className="btn-ghost" style={{ cursor: 'pointer', border: 'none', background: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Project Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Core Learning Goal <span style={{ color: '#06b6d4' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              rows={2}
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ marginTop: 6, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Target Completion Date</label>
            <input
              type="date"
              className="input-field"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ marginTop: 6 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim() || !learningGoal.trim()} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ConfirmDeleteModal = ({ isOpen, title, message, warningNote, onConfirm, onClose, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 150
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #fee2e2',
        borderRadius: 14,
        padding: '24px 28px',
        maxWidth: '460px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {title || 'Confirm Deletion'}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, marginTop: 3 }}>
              {message || 'Are you sure you want to delete this item?'}
            </p>
          </div>
        </div>

        {warningNote && (
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: '#be123c',
            lineHeight: 1.4
          }}>
            <strong>Warning:</strong> {warningNote}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="btn"
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};
