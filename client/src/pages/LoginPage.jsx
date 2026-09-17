import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Shield,
  User,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

export const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1-Click Fast Login
  const handleQuickLogin = async (presetEmail, presetRole, presetName) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: presetEmail,
          role: presetRole,
          name: presetName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || email.split('@')[0],
          role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Error connecting to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #eef2ff 0%, #f8fafc 70%)',
      padding: '16px 12px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0,0,0,0.02)',
        padding: 'clamp(24px, 5vw, 36px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.35)'
          }}>
            <Brain size={30} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              AI Study Companion
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: 0 }}>
              Direct Access &bull; Evidence-Grounded AI Tutor
            </p>
          </div>
        </div>

        {/* 1-Click Instant Demo Profiles */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ 1-Click Fast Profiles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('alex@learning.ai', 'student', 'Alex Morgan')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <GraduationCap size={16} color="#4f46e5" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div>Alex Morgan</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Student</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('elena@learning.ai', 'admin', 'Dr. Elena Vance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#334155',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
            >
              <Shield size={16} color="#0284c7" />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div>Dr. Elena Vance</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Administrator</div>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            or enter your details
          </span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* Direct Login Form */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your Name
            </label>
            <div style={{ position: 'relative', marginTop: 5, display: 'flex', alignItems: 'center' }}>
              <User size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="e.g., Jaya Sree"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: 36, fontSize: 13, height: 42, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', marginTop: 5, display: 'flex', alignItems: 'center' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: 36, fontSize: 13, height: 42, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 5 }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  padding: '9px',
                  borderRadius: 10,
                  border: role === 'student' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: role === 'student' ? '#eef2ff' : '#ffffff',
                  color: role === 'student' ? '#4f46e5' : '#475569',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <GraduationCap size={15} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  padding: '9px',
                  borderRadius: 10,
                  border: role === 'admin' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: role === 'admin' ? '#eef2ff' : '#ffffff',
                  color: role === 'admin' ? '#4f46e5' : '#475569',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Shield size={15} />
                <span>Administrator</span>
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '9px 12px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 8,
              color: '#e11d48',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 13,
              fontWeight: 700,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 16px -3px rgba(79, 70, 229, 0.3)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Accessing Workspace...</span>
              </>
            ) : (
              <>
                <span>Enter Learning Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
          🔒 Secure Evidence-Grounded Study Platform &bull; Data synced with MongoDB Atlas
        </div>
      </div>
    </div>
  );
};
