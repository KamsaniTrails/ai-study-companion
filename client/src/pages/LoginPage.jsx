import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Brain, CheckCircle2, KeyRound, Mail, RefreshCw, Shield, Sparkles, User, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  
  // OTP States
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(60);
      setStep('otp');

      if (data.emailSent) {
        setInfoMessage(`Verification code sent to ${data.email}. Please check your inbox and spam folder.`);
      } else {
        setInfoMessage(`Verification code generated for ${data.email}. Please check your email.`);
      }

      // Auto focus first OTP input
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    } catch (err) {
      setError(err.message || 'Error communicating with authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
        const newDigits = pasted.split('');
        setOtpDigits(newDigits);
        inputRefs[5].current?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    // Auto focus next input
    if (digit && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: entered,
          name: name.trim(),
          role
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Successful verification
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
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
      padding: '24px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 26
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56,
            height: 56,
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              AI Study Companion
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, margin: 0 }}>
              Secure Academic Workspace & AI Tutor
            </p>
          </div>
        </div>

        {/* STEP 1: Enter Name, Email, and Choose Role */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Name
              </label>
              <div style={{ position: 'relative', marginTop: 6, display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Institutional Email
              </label>
              <div style={{ position: 'relative', marginTop: 6, display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g., student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Account Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    border: role === 'student' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: role === 'student' ? '#eef2ff' : '#ffffff',
                    color: role === 'student' ? '#4f46e5' : '#475569',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <User size={16} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    border: role === 'admin' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: role === 'admin' ? '#eef2ff' : '#ffffff',
                    color: role === 'admin' ? '#4f46e5' : '#475569',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Shield size={16} />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 10,
                color: '#e11d48',
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 14,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Send OTP Verification Code</span>
                </>
              )}
            </button>

            {/* Switch to Sign Up */}
            <div style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#64748b',
              borderTop: '1px solid #e2e8f0',
              paddingTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <span>New to the platform?</span>
              <button
                type="button"
                onClick={onSwitchToSignup}
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
                Register an Account
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button
              type="button"
              onClick={() => {
                setStep('input');
                setError('');
                setInfoMessage('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                alignSelf: 'flex-start'
              }}
            >
              <ArrowLeft size={16} />
              <span>Change details</span>
            </button>

            {/* Notification Notice: Code sent to email */}
            <div style={{
              padding: '16px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 14,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#16a34a'
              }}>
                <Mail size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 700 }}>
                  Verification Code Dispatched
                </span>
                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                  A 6-digit security code was sent to <strong>{email}</strong>. Please check your inbox (and spam/junk folder).
                </span>
              </div>
            </div>

            {/* 6 Digit Input Boxes */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', textAlign: 'center', marginBottom: 10 }}>
                Enter 6-Digit Code
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: 48,
                      height: 54,
                      textAlign: 'center',
                      fontSize: 22,
                      fontWeight: 800,
                      color: '#0f172a',
                      borderRadius: 12,
                      border: digit ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: digit ? '#eef2ff' : '#ffffff',
                      outline: 'none',
                      boxShadow: digit ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 10,
                color: '#e11d48',
                fontSize: 13,
                fontWeight: 500,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Verify Code & Enter Workspace</span>
                </>
              )}
            </button>

            {/* Resend Timer */}
            <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
              {countdown > 0 ? (
                <span>
                  Resend code in <strong style={{ color: '#0f172a' }}>00:{countdown < 10 ? `0${countdown}` : countdown}</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Security Trust Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 16
        }}>
          <Shield size={14} color="#4f46e5" />
          <span>Email Verification & Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
};
