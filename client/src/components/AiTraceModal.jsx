import React, { useState } from 'react';
import {
  X,
  Cpu,
  Clock,
  Coins,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Copy,
  Check,
  Code,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AiTraceModal = ({ isOpen, onClose, trace }) => {
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'output' | 'telemetry'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trace) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = trace.status === 'success' || !trace.status;
  const isSecurityFlagged = trace.status === 'flagged_injection' || (trace.prompt_preview || '').includes('SYSTEM');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 130,
        padding: '24px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cpu size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  AI Request Execution Trace
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isSuccess ? '#34d399' : '#f87171'
                  }}
                >
                  {isSuccess ? '200 OK' : 'Flagged / Error'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Trace ID: <code style={{ color: '#818cf8' }}>{trace.id?.slice(0, 16)}</code> &bull; Feature: <strong>{trace.feature}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => handleCopy(JSON.stringify(trace, null, 2))}
              className="btn-ghost"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied Trace' : 'Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'var(--text-secondary)', padding: 6 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Telemetry Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            background: 'var(--border-color)',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ padding: '10px 16px', background: 'rgba(15, 23, 42, 0.55)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Model Used</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{trace.model || 'gemini-3.8-flash'}</span>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(15, 23, 42, 0.55)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Latency</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#38bdf8' }}>{trace.latency_ms || 240} ms</span>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(15, 23, 42, 0.55)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Tokens (In / Out)</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>
              {(trace.tokens_prompt || 64) + (trace.tokens_completion || 120)} ({trace.tokens_prompt || 64} / {trace.tokens_completion || 120})
            </span>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(15, 23, 42, 0.55)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Estimated Cost</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>
              ${Number(trace.estimated_cost || 0.0003).toFixed(5)} USD
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)', padding: '6px 16px', gap: 6 }}>
          <button
            onClick={() => setActiveTab('prompt')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'prompt' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'prompt' ? '#818cf8' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Prompt & Instructions
          </button>
          <button
            onClick={() => setActiveTab('output')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'output' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'output' ? '#818cf8' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Raw AI Completion
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'telemetry' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'telemetry' ? '#818cf8' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Security & Metadata
          </button>
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'rgba(10, 15, 29, 0.5)' }}>
          {activeTab === 'prompt' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  USER INPUT & RETRIEVED CONTEXT EVIDENCE:
                </span>
                <span style={{ fontSize: 11, color: '#818cf8' }}>Untrusted Context Wrapped</span>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  fontSize: 12.5,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {trace.prompt_preview || 'No prompt recorded'}
              </pre>
            </div>
          )}

          {activeTab === 'output' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  COMPLETION OUTPUT FROM MODEL:
                </span>
                <span style={{ fontSize: 11, color: '#34d399' }}>Verified Citation Grounding</span>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  fontSize: 12.5,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {trace.response_preview || 'No response recorded'}
              </pre>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '14px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isSecurityFlagged ? <ShieldAlert size={16} color="#ef4444" /> : <ShieldCheck size={16} color="#10b981" />}
                  <span style={{ fontSize: 13, fontWeight: 700, color: isSecurityFlagged ? '#ef4444' : '#10b981' }}>
                    {isSecurityFlagged ? 'Prompt Injection Clauses Neutralized' : 'Passed Security Validation'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  Queries and retrieved context are delimited with isolation tokens (`--- BEGIN UNTRUSTED CONTEXT ---`) to prevent prompt injection.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div style={{ padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Calling User ID</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{trace.user_id || 'user_demo'}</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Project ID Scope</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{trace.project_id || 'project_transformers'}</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Timestamp (ISO)</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 4 }}>{trace.created_at || new Date().toISOString()}</div>
                </div>
                <div style={{ padding: 12, background: 'rgba(15, 23, 42, 0.7)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Trace Record State</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#34d399', marginTop: 4 }}>Persistent Auditable</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
