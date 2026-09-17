import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Brain, CheckCircle2, KeyRound, Mail, RefreshCw, Shield, Sparkles, User } from 'lucide-react';

export const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  
  // OTP States
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = (e) => {
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
    // Generate a random 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '']);
    setCountdown(30);
    setStep('otp');

    // Auto focus first OTP input after render
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 150);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of 4 digits
      const pasted = value.replace(/\D/g, '').slice(0, 4);
      if (pasted.length === 4) {
        const newDigits = pasted.split('');
        setOtpDigits(newDigits);
        inputRefs[3].current?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    // Auto focus next input
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    const entered = otpDigits.join('');
    if (entered.length < 4) {
      setError('Please enter all 4 digits of the OTP code');
      return;
    }

    if (entered !== generatedOtp) {
      setError('Invalid OTP code. Please enter the code shown above.');
      return;
    }

    // Success login
    onLogin({
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role
    });
  };

  const handleAutoFill = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
      setError('');
    }
  };

  const fillQuickStudent = () => {
    setName('Rajesh Reddy');
    setEmail('rajesh.student@university.edu');
    setRole('student');
    setError('');
  };

  const fillQuickAdmin = () => {
    setName('Dr. Ramesh Kumar');
    setEmail('ramesh.admin@university.edu');
    setRole('admin');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.06), 0 10px 15px -5px rgba(0, 0, 0, 0.02)',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
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
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)'
          }}>
            <Brain size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>AI Study Companion</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
              Secure Academic Workspace & AI Tutor
            </p>
          </div>
        </div>

        {/* STEP 1: Enter Name, Email, and Choose Role */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Full Name</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rajesh Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Email Address</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <input
                  type="email"
                  required
                  placeholder="e.g., yourname@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Select Account Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    padding: '11px',
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
                    padding: '11px',
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
              <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, color: '#e11d48', fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <KeyRound size={16} />
              <span>Send OTP Verification Code</span>
            </button>

            {/* Quick Fill Shortcuts for presentation */}
            <div style={{ paddingTop: 8, borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>Quick Pre-fill (Optional)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={fillQuickStudent}
                  style={{
                    padding: '6px 8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Fill as Student
                </button>
                <button
                  type="button"
                  onClick={fillQuickAdmin}
                  style={{
                    padding: '6px 8px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Fill as Admin
                </button>
              </div>
            </div>

            {/* Switch to Sign Up */}
            <div style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#64748b',
              borderTop: '1px solid #e2e8f0',
              paddingTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <span>New to AI Study Companion?</span>
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
                Create an Account (Sign Up)
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button
              type="button"
              onClick={() => setStep('input')}
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

            {/* OTP Alert Notification Banner */}
            <div style={{
              padding: '14px 16px',
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#4338ca', fontWeight: 700 }}>
                  SECURE OTP DISPATCHED
                </span>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  style={{
                    padding: '3px 8px',
                    background: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Auto-fill
                </button>
              </div>
              <div style={{ fontSize: 13, color: '#1e293b' }}>
                Your verification code is: <strong style={{ fontSize: 18, color: '#4f46e5', letterSpacing: '0.15em', marginLeft: 6 }}>{generatedOtp}</strong>
              </div>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Sent to: <strong>{email}</strong> ({role})
              </span>
            </div>

            {/* 4 Digit Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
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
                    width: 54,
                    height: 58,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#0f172a',
                    borderRadius: 14,
                    border: digit ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: digit ? '#eef2ff' : '#ffffff',
                    outline: 'none',
                    boxShadow: digit ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, color: '#e11d48', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <CheckCircle2 size={16} />
              <span>Verify OTP & Enter Workspace</span>
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              {countdown > 0 ? (
                <span>Resend OTP code in <strong>00:{countdown < 10 ? `0${countdown}` : countdown}</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Resend OTP Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Trust Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 14
        }}>
          <CheckCircle2 size={14} color="#059669" />
          <span>Role-Based Secure Academic Access Control</span>
        </div>
      </div>
    </div>
  );
};
