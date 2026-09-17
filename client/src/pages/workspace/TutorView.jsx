import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  FileText,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Zap,
  RotateCcw,
  Check,
  Brain,
  Layers,
  Target,
  AlertTriangle,
  History,
  Compass,
  BookOpen
} from 'lucide-react';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';

export const TutorView = ({ projectId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [rightTab, setRightTab] = useState('citations'); // 'citations' | 'context'
  const [persistentContext, setPersistentContext] = useState(null);
  const [activeContextBreakdown, setActiveContextBreakdown] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [tutorMode, setTutorMode] = useState('qa'); // 'qa' | 'revision'
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    materialId: null,
    initialPage: 1,
    highlightSnippet: '',
    docTitle: ''
  });
  const messagesEndRef = useRef(null);

  const fetchPersistentContext = async () => {
    try {
      const res = await fetch('/api/projects/' + projectId + '/persistent-context?userId=' + (currentUser?.id || 'user_demo'));
      const data = await res.json();
      setPersistentContext(data.context);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPersistentContext();

    fetch('/api/projects/' + projectId + '/tutor/conversations')
      .then((r) => r.json())
      .then((data) => {
        if (data.conversations?.length > 0) {
          const latest = data.conversations[0];
          setConversationId(latest.id);
          fetch('/api/tutor/conversations/' + latest.id)
            .then((r) => r.json())
            .then((cd) => {
              setMessages(cd.messages || []);
              const firstWithCit = cd.messages?.find((m) => m.citations?.length > 0);
              if (firstWithCit) setActiveCitation(firstWithCit.citations[0]);
              const lastAssistant = [...(cd.messages || [])].reverse().find((m) => m.role === 'assistant');
              if (lastAssistant?.context_breakdown) {
                setActiveContextBreakdown(lastAssistant.context_breakdown);
              }
            });
        }
      })
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend, sendMode) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;
    const modeToUse = sendMode || tutorMode;

    const tempUserMsg = {
      id: 'temp_' + Date.now(),
      conversation_id: conversationId || '',
      role: 'user',
      content: query,
      citations: [],
      tokens_used: 0,
      mode: modeToUse,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);

    try {
      if (isStreaming) {
        const res = await fetch('/api/projects/' + projectId + '/tutor/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            conversationId,
            userId: currentUser?.id || 'user_demo',
            mode: modeToUse
          })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let assistantText = '';
        const tempAssistantId = 'stream_' + Date.now();

        setMessages((prev) => [
          ...prev,
          {
            id: tempAssistantId,
            conversation_id: conversationId || '',
            role: 'assistant',
            content: '',
            citations: [],
            created_at: new Date().toISOString()
          }
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.conversationId) setConversationId(payload.conversationId);
                if (payload.citations?.length > 0) setActiveCitation(payload.citations[0]);
                if (payload.contextBreakdown) setActiveContextBreakdown(payload.contextBreakdown);
                if (payload.token) {
                  assistantText += payload.token;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === tempAssistantId ? { ...m, content: assistantText } : m))
                  );
                }
                if (payload.done && payload.message) {
                  setMessages((prev) =>
                    prev.map((m) => (m.id === tempAssistantId ? payload.message : m))
                  );
                  fetchPersistentContext();
                }
              } catch (parseErr) {}
            }
          }
        }
      } else {
        const res = await fetch('/api/projects/' + projectId + '/tutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            conversationId,
            userId: currentUser?.id || 'user_demo',
            mode: modeToUse
          })
        });

        const data = await res.json();
        if (data.answer) {
          setConversationId(data.conversationId);
          setMessages((prev) => [...prev, data.answer]);
          if (data.answer.citations?.length > 0) {
            setActiveCitation(data.answer.citations[0]);
          }
          if (data.answer.context_breakdown) {
            setActiveContextBreakdown(data.answer.context_breakdown);
          }
          fetchPersistentContext();
        }
      }
    } catch (err) {
      console.error('Tutor chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, height: 'calc(100vh - 160px)', minHeight: 600 }}>
      {/* Left Pane: Tutor Chat Stream */}
      <div className="card-pro" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Chat Stream Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={15} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>AI Study Partner</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Grounded in your course materials with citations</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mode Switcher (PRD Item 93) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              gap: 3
            }}>
              <button
                onClick={() => setTutorMode('qa')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: tutorMode === 'qa' ? '#ffffff' : 'transparent',
                  color: tutorMode === 'qa' ? '#0f172a' : '#64748b',
                  fontSize: 12,
                  fontWeight: tutorMode === 'qa' ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: tutorMode === 'qa' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <Bot size={13} />
                <span>Q&A Chat</span>
              </button>
              <button
                onClick={() => setTutorMode('revision')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: tutorMode === 'revision' ? '#4f46e5' : 'transparent',
                  color: tutorMode === 'revision' ? '#ffffff' : '#64748b',
                  fontSize: 12,
                  fontWeight: tutorMode === 'revision' ? 600 : 500,
                  cursor: 'pointer',
                  boxShadow: tutorMode === 'revision' ? '0 1px 3px rgba(79,70,229,0.25)' : 'none'
                }}
              >
                <Target size={13} />
                <span>Pre-Quiz Revision</span>
                <span style={{
                  fontSize: 9,
                  background: tutorMode === 'revision' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: tutorMode === 'revision' ? '#ffffff' : '#475569',
                  padding: '1px 5px',
                  borderRadius: 4,
                  fontWeight: 700
                }}>
                  PRD 93
                </span>
              </button>
            </div>

            <span className="badge badge-improving" style={{ fontSize: 11 }}>
              <CheckCircle size={10} />
              <span>Grounded</span>
            </span>
          </div>
        </div>

        {/* Pre-Quiz Revision Guidance Banner (PRD Item 93) */}
        {tutorMode === 'revision' && (
          <div style={{
            padding: '10px 18px',
            background: 'linear-gradient(90deg, #eef2ff 0%, #faf5ff 100%)',
            borderBottom: '1px solid #c7d2fe',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} style={{ color: '#4f46e5' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3730a3' }}>
                  Pre-Quiz Rapid Revision Mode Active
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                High-Yield 3-Bullet Recap + Diagnostic Check
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
              Focusing on weak concepts (<span style={{ color: '#e11d48', fontWeight: 600 }}>&lt;70% mastery</span>):{' '}
              <strong style={{ color: '#1e1b4b' }}>
                {persistentContext?.weakConcepts?.join(', ') || 'Skip Connections, Softmax Variance Scaling'}
              </strong>
            </div>
          </div>
        )}

        {/* Message History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 440, padding: 24 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Bot size={22} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Start your study session</h3>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                Ask any question from your course materials. The tutor answers using strict evidence and points you to the exact page.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: '#f1f5f9',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Bot size={14} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{
                    padding: '11px 15px',
                    borderRadius: isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    background: isUser ? '#0f172a' : m.is_unsupported_question ? '#fff1f2' : '#ffffff',
                    border: isUser ? 'none' : m.is_unsupported_question ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                    boxShadow: isUser ? '0 1px 2px rgba(15, 23, 42, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
                    color: isUser ? '#ffffff' : m.is_unsupported_question ? '#9f1239' : '#0f172a',
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {m.is_unsupported_question && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e11d48', fontWeight: 600, fontSize: 11, marginBottom: 6 }}>
                        <ShieldAlert size={14} />
                        <span>Insufficient Evidence (Unsupported Question)</span>
                      </div>
                    )}
                    {m.content}
                  </div>

                  {/* Citation Buttons with Document Viewer Trigger (PRD Item 91 & 97) */}
                  {m.citations && m.citations.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {m.citations.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveCitation(c);
                            setRightTab('citations');
                            setViewerModal({
                              isOpen: true,
                              materialId: c.sourceDocId || c.materialId || 'material_1',
                              initialPage: c.pageNumber || 1,
                              highlightSnippet: c.snippet || c.chunkExcerpt || c.text || '',
                              docTitle: c.sourceDocName || c.materialName || 'Course Document'
                            });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 9px',
                            borderRadius: 6,
                            background: activeCitation === c ? '#e0e7ff' : '#f8fafc',
                            border: activeCitation === c ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                            color: activeCitation === c ? '#3730a3' : '#334155',
                            fontSize: 11,
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                          title="Click to jump directly to page in Document Viewer"
                        >
                          <BookOpen size={11} style={{ color: '#4f46e5' }} />
                          <span>Page {c.pageNumber}</span>
                          <span style={{ color: '#6366f1', fontSize: 10, fontWeight: 700 }}>Jump ↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: '#e2e8f0',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <User size={14} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: 8, color: '#4f46e5', fontSize: 12, alignItems: 'center', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, width: 'fit-content' }}>
              <Bot size={14} />
              <span>Synthesizing grounded response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 6, overflowX: 'auto', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          {tutorMode === 'revision' ? (
            <>
              <button
                onClick={() => handleSend('Provide a structured 2-minute pre-quiz revision recap for my weakest concepts.', 'revision')}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap', color: '#4338ca', borderColor: '#c7d2fe', background: '#eef2ff' }}
              >
                ⚡ 2-Min Concept Refresher
              </button>
              <button
                onClick={() => handleSend('Highlight critical formulas and common exam pitfalls I must avoid in this quiz.', 'revision')}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap', color: '#4338ca', borderColor: '#c7d2fe', background: '#eef2ff' }}
              >
                🎯 Formula & Pitfall Review
              </button>
              <button
                onClick={() => handleSend('Give me one rapid diagnostic check question on my weakest area to verify retention.', 'revision')}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px', whiteSpace: 'nowrap', color: '#4338ca', borderColor: '#c7d2fe', background: '#eef2ff' }}
              >
                📝 Rapid Diagnostic Check
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSend('Why do we divide by sqrt(d_k) in the transformer attention formula?')}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 9px', whiteSpace: 'nowrap' }}
              >
                "Why divide by sqrt(d_k)?"
              </button>
              <button
                onClick={() => handleSend('Explain Multi-Head Attention step by step')}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 9px', whiteSpace: 'nowrap' }}
              >
                "Explain Multi-Head Attention"
              </button>
              <button
                onClick={() => handleSend('What is the capital of Mars?')}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 9px', whiteSpace: 'nowrap', color: '#be123c' }}
              >
                Test Refusal: "Capital of Mars?"
              </button>
            </>
          )}
        </div>

        {/* Chat Input Bar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: 8 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tutorMode === 'revision' ? 'Ask for a quick pre-quiz refresher, formula breakdown, or concept recap...' : 'Ask anything from your course materials...'}
            className="input-field"
            rows={1}
            style={{ resize: 'none', minHeight: 38, maxHeight: 100 }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn btn-primary"
            style={{ padding: '0 14px' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Right Pane: Citation Inspector & Context Drawer */}
      <div className="card-pro" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Segmented Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: 4, gap: 4 }}>
          <button
            onClick={() => setRightTab('citations')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: rightTab === 'citations' ? '#ffffff' : 'transparent',
              color: rightTab === 'citations' ? '#0f172a' : '#64748b',
              fontWeight: rightTab === 'citations' ? 600 : 500,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: rightTab === 'citations' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Page Citations
          </button>
          <button
            onClick={() => setRightTab('context')}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: rightTab === 'context' ? '#ffffff' : 'transparent',
              color: rightTab === 'context' ? '#0f172a' : '#64748b',
              fontWeight: rightTab === 'context' ? 600 : 500,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: rightTab === 'context' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Context Breakdown
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {rightTab === 'citations' ? (
            activeCitation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-indigo">
                    Page {activeCitation.pageNumber}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Relevance: {activeCitation.relevanceScore != null ? Math.round(activeCitation.relevanceScore > 1 ? activeCitation.relevanceScore : activeCitation.relevanceScore * 100) : 0}%
                  </span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                  {activeCitation.materialName || 'Course Notes'}
                </div>

                <div style={{
                  padding: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#334155',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-mono)'
                }}>
                  "{activeCitation.chunkExcerpt || activeCitation.text || activeCitation.snippet || 'Excerpt from source material.'}"
                </div>

                <button
                  onClick={() => setViewerModal({
                    isOpen: true,
                    materialId: activeCitation.sourceDocId || activeCitation.materialId || 'material_1',
                    initialPage: activeCitation.pageNumber || 1,
                    highlightSnippet: activeCitation.snippet || activeCitation.chunkExcerpt || activeCitation.text || '',
                    docTitle: activeCitation.sourceDocName || activeCitation.materialName || 'Course Document'
                  })}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    fontSize: 12,
                    marginTop: 4
                  }}
                >
                  <BookOpen size={14} />
                  <span>Open Page {activeCitation.pageNumber} in Document Viewer (PRD 91)</span>
                </button>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                Click on any citation chip in a message to inspect the exact source chunk.
              </div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                Active Multi-Factor Context
              </div>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                Persistent memory composed for this session:
              </p>

              <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>Weak Areas Monitored:</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {persistentContext?.weakConcepts?.join(', ') || 'Attention & Normalization layers'}
                </span>
              </div>

              <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>Recent Quiz Score:</span>
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                  {persistentContext?.recentQuizScore || 78}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal (PRD Items 91 & 97) */}
      <DocumentViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal((prev) => ({ ...prev, isOpen: false }))}
        materialId={viewerModal.materialId}
        initialPage={viewerModal.initialPage}
        highlightSnippet={viewerModal.highlightSnippet}
        docTitle={viewerModal.docTitle}
      />
    </div>
  );
};
