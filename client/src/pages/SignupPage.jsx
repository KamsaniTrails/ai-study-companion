import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Shield,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';

export const SignupPage = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [goal, setGoal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          goal: goal.trim() || 'Master Core Learning Concepts'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      onSignupSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Something went wrong during registration.');
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
      background: 'radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.12) 0%, rgba(248, 250, 252, 0.95) 60%), #f8fafc',
      padding: '24px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#ffffff',
        borderRadius: 24,
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0,0,0,0.02)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
              Create Your Account
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: 0 }}>
              Join the AI Study Companion learning & growth platform
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 12,
              color: '#e11d48',
              fontSize: 13,
              fontWeight: 500
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Full Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@learning.ai"
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: role === 'student' ? '2px solid #6366f1' : '1px solid #cbd5e1',
                  background: role === 'student' ? '#eef2ff' : '#ffffff',
                  color: role === 'student' ? '#4f46e5' : '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <GraduationCap size={16} />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: role === 'admin' ? '2px solid #e11d48' : '1px solid #cbd5e1',
                  background: role === 'admin' ? '#fff1f2' : '#ffffff',
                  color: role === 'admin' ? '#e11d48' : '#475569',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Shield size={16} />
                <span>Administrator</span>
              </button>
            </div>
          </div>

          {/* Primary Learning Goal (for Students) */}
          {role === 'student' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Primary Learning Goal (Optional)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <BookOpen size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Master Deep Learning & Transformers"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 14,
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Password & Confirm Password in Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 34px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 14,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Confirm
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 32px 10px 34px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 14,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: 14,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
            }}
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>Complete Registration & Launch Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login Link */}
        <div style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#64748b',
          borderTop: '1px solid #f1f5f9',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign In here
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 12,
          color: '#64748b',
          paddingTop: 4
        }}>
          <CheckCircle2 size={14} color="#059669" />
          <span>Strict Project Isolation & Persistent Learning Context</span>
        </div>
      </div>
    </div>
  );
};
