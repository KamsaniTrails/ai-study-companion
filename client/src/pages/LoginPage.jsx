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
  const [devOtp, setDevOtp] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
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
    setDevOtp(null);
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
      setEmailSent(Boolean(data.emailSent));

      if (data.dev_otp) {
        setDevOtp(data.dev_otp);
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

  const executeVerification = async (enteredCode) => {
    const entered = (enteredCode || otpDigits.join('')).trim();
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

      // Successful auto-verification -> launch workspace!
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
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
        // Instant auto-submit on paste!
        executeVerification(pasted);
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

    // INSTANT AUTO-SUBMIT: When the 6th digit is typed, submit automatically!
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      executeVerification(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
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
        maxWidth: '450px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
        padding: 'clamp(20px, 5vw, 36px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 18px -4px rgba(79, 70, 229, 0.3)'
          }}>
            <Brain size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              AI Study Companion
            </h1>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, margin: 0 }}>
              Secure Academic Workspace & AI Tutor
            </p>
          </div>
        </div>

        {/* STEP 1: Enter Name, Email, and Choose Role */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Name
              </label>
              <div style={{ position: 'relative', marginTop: 5, display: 'flex', alignItems: 'center' }}>
                <User size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 36, fontSize: 13, height: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative', marginTop: 5, display: 'flex', alignItems: 'center' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g., student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 36, fontSize: 13, height: 42 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Account Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 5 }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    padding: '10px',
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
                  <User size={15} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    padding: '10px',
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 13,
                marginTop: 4,
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
                  <Loader2 size={15} className="animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Send OTP Verification Code</span>
                </>
              )}
            </button>

            {/* Switch to Sign Up */}
            <div style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#64748b',
              borderTop: '1px solid #e2e8f0',
              paddingTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5
            }}>
              <span>New to the platform?</span>
              <button
                type="button"
                onClick={onSwitchToSignup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  fontSize: 12,
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
          <form onSubmit={(e) => { e.preventDefault(); executeVerification(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              type="button"
              onClick={() => {
                setStep('input');
                setError('');
                setDevOtp(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                alignSelf: 'flex-start',
                padding: 0
              }}
            >
              <ArrowLeft size={15} />
              <span>Change email / details</span>
            </button>

            {/* Notification Notice */}
            <div style={{
              padding: '12px 14px',
              background: emailSent ? '#f0fdf4' : '#eff6ff',
              border: emailSent ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
              borderRadius: 12,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start'
            }}>
              <Mail size={18} color={emailSent ? '#16a34a' : '#2563eb'} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 12, color: emailSent ? '#166534' : '#1e40af', fontWeight: 700 }}>
                  {emailSent ? 'Security Code Dispatched' : 'Verification Code Ready'}
                </span>
                <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                  Code sent for <strong>{email}</strong>. Entering the 6th digit will <strong>automatically log you in</strong>!
                </span>
              </div>
            </div>

            {/* If SMTP is not yet configured, show the dev code notice */}
            {devOtp && (
              <div style={{
                padding: '10px 14px',
                background: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 10,
                fontSize: 12,
                color: '#854d0e',
                textAlign: 'center',
                lineHeight: 1.5
              }}>
                <div>Render SMTP credentials not set yet. Your code is:</div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.2em', color: '#b45309', marginTop: 3 }}>
                  {devOtp}
                </div>
              </div>
            )}

            {/* 6 Digit Input Boxes (Mobile Responsive Clamped) */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', textAlign: 'center', marginBottom: 8 }}>
                Enter 6-Digit Code
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(4px, 1.5vw, 8px)' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: 'clamp(36px, 11vw, 48px)',
                      height: 'clamp(44px, 13vw, 54px)',
                      textAlign: 'center',
                      fontSize: 'clamp(18px, 5vw, 22px)',
                      fontWeight: 800,
                      color: '#0f172a',
                      borderRadius: 10,
                      border: digit ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: digit ? '#eef2ff' : '#ffffff',
                      outline: 'none',
                      boxShadow: digit ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : 'none',
                      transition: 'all 0.12s ease'
                    }}
                  />
                ))}
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
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 13,
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
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying & Entering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Verify Code & Enter</span>
                </>
              )}
            </button>

            {/* Resend Timer */}
            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
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
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Trust Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 12
        }}>
          <Shield size={13} color="#4f46e5" />
          <span>Auto-Verifying & Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
};
