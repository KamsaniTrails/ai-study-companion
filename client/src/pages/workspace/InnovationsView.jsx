import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Brain,
  Sliders,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Layers,
  Zap,
  Info,
  Activity
} from 'lucide-react';

export const InnovationsView = ({ projectId, currentUser }) => {
  const [subTab, setSubTab] = useState('feynman'); // 'feynman' | 'sandbox' | 'retention'

  // 1. Feynman Studio State
  const [targetConcept, setTargetConcept] = useState('Residual Connections');
  const [beginnerPrompt, setBeginnerPrompt] = useState(null);
  const [userExplanation, setUserExplanation] = useState('');
  const [evaluatingFeynman, setEvaluatingFeynman] = useState(false);
  const [feynmanResult, setFeynmanResult] = useState(null);

  // 2. Neural Sandbox State
  const [seqLen, setSeqLen] = useState(16);
  const [dModel, setDModel] = useState(128);
  const [numHeads, setNumHeads] = useState(4);
  const [temperature, setTemperature] = useState(1.0);

  // 3. Forgetting Curve State
  const [retentionCurves, setRetentionCurves] = useState([]);
  const [loadingCurves, setLoadingCurves] = useState(false);

  useEffect(() => {
    fetchFeynmanPrompt(targetConcept);
    fetchRetentionCurves();
  }, [projectId]);

  const fetchFeynmanPrompt = async (concept) => {
    try {
      const res = await fetch('/api/projects/' + projectId + '/feynman/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptName: concept })
      });
      const data = await res.json();
      setBeginnerPrompt(data);
      setFeynmanResult(null);
      setUserExplanation('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleEvaluateFeynman = async () => {
    if (!userExplanation.trim() || evaluatingFeynman) return;
    setEvaluatingFeynman(true);
    try {
      const res = await fetch('/api/projects/' + projectId + '/feynman/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptName: targetConcept,
          userExplanation,
          userId: currentUser?.id || 'user_demo'
        })
      });
      const data = await res.json();
      setFeynmanResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingFeynman(false);
    }
  };

  const fetchRetentionCurves = async () => {
    setLoadingCurves(true);
    try {
      const res = await fetch('/api/projects/' + projectId + '/forgetting-curve');
      const data = await res.json();
      setRetentionCurves(data.curves || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCurves(false);
    }
  };

  // Sandbox calculations
  const totalFlops = 2 * Math.pow(seqLen, 2) * dModel * numHeads;
  const memoryMb = parseFloat(((seqLen * dModel * 4 + Math.pow(seqLen, 2) * numHeads * 4) / (1024 * 1024)).toFixed(3));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', background: '#f1f5f9', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
            <Sparkles size={13} color="#4f46e5" />
            <span>Cognitive Science & Visual Lab</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Visual Studio & Interactive Sandbox
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
            Feynman active recall ("Teach the AI"), transformer matrix math simulations, and Ebbinghaus retention curves.
          </p>
        </div>

        {/* Sub-tabs Segmented Control */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '4px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'feynman', label: 'Feynman Studio', icon: Brain },
            { id: 'sandbox', label: 'Neural Matrix Sandbox', icon: Sliders },
            { id: 'retention', label: 'Retention Forecaster', icon: Activity }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 12,
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: Feynman Technique Studio */}
      {subTab === 'feynman' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>
                Select Concept to Teach:
              </label>
              <select
                value={targetConcept}
                onChange={(e) => {
                  setTargetConcept(e.target.value);
                  fetchFeynmanPrompt(e.target.value);
                }}
                className="input-field"
                style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}
              >
                <option value="Residual Connections">Residual Connections (Skip Connections)</option>
                <option value="Scaled Dot-Product Attention">Scaled Dot-Product Attention</option>
                <option value="Multi-Head Attention">Multi-Head Attention</option>
              </select>
            </div>

            {/* Beginner Persona Question Card */}
            {beginnerPrompt && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#4f46e5' }}>Curious Learner Prompt:</div>
                  <div style={{ fontSize: 12, color: '#334155', marginTop: 2, fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{beginnerPrompt.beginnerQuestion}"
                  </div>
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Simple Intuitive Explanation:</span>
                <span style={{ color: '#4f46e5' }}>Use analogies, avoid jargon</span>
              </label>
              <textarea
                value={userExplanation}
                onChange={(e) => setUserExplanation(e.target.value)}
                placeholder="Explain this concept in plain English using everyday metaphors (e.g. highways, bypasses, recipes)..."
                rows={5}
                className="input-field"
                style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5, resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleEvaluateFeynman}
              disabled={evaluatingFeynman || !userExplanation.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '9px', fontSize: 12, gap: 6 }}
            >
              {evaluatingFeynman ? <Sparkles size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Evaluate Clarity Protocol</span>
            </button>
          </div>

          {/* Feedback & Scoring Panel */}
          <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Feynman Evaluation Report
            </h3>

            {feynmanResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>CONCEPTUAL CLARITY</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#059669', marginTop: 2 }}>
                      {feynmanResult.clarityScore}%
                    </div>
                  </div>

                  <div style={{ padding: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>JARGON SIMPLICITY</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#4f46e5', marginTop: 2 }}>
                      {feynmanResult.jargonScore}%
                    </div>
                  </div>
                </div>

                <div style={{ padding: 12, background: feynmanResult.hasAnalogy ? '#ecfdf5' : '#fffbeb', border: '1px solid ' + (feynmanResult.hasAnalogy ? '#a7f3d0' : '#fde68a'), borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: feynmanResult.hasAnalogy ? '#065f46' : '#92400e', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {feynmanResult.hasAnalogy ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{feynmanResult.hasAnalogy ? 'Analogy Detected: Everyday intuition established' : 'No Metaphor Detected: Suggest adding an everyday analogy'}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#334155', margin: 0, marginTop: 4, lineHeight: 1.4 }}>
                    {feynmanResult.feedback}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>Identified Blindspots:</div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#64748b', marginTop: 3 }}>
                    {feynmanResult.blindspots.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9', fontSize: 11, color: '#334155', fontWeight: 500 }}>
                  {feynmanResult.recommendation}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', textAlign: 'center', gap: 8, padding: 24 }}>
                <Brain size={32} color="#cbd5e1" />
                <p style={{ fontSize: 12, margin: 0 }}>
                  Explain the concept on the left in simple words to test your understanding.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: Neural Matrix Visual Sandbox */}
      {subTab === 'sandbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Live Transformer Matrix Parameters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                  <span>Sequence Length (N tokens): {seqLen}</span>
                  <span style={{ color: '#4f46e5' }}>O(N²) quadratic</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  step="8"
                  value={seqLen}
                  onChange={(e) => setSeqLen(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                  <span>Model Dimension (d_model): {dModel}</span>
                  <span style={{ color: '#059669' }}>d_k = {Math.round(dModel / numHeads)} per head</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="512"
                  step="64"
                  value={dModel}
                  onChange={(e) => setDModel(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                  <span>Number of Heads (h): {numHeads}</span>
                  <span style={{ color: '#0284c7' }}>Parallel subspaces</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={numHeads}
                  onChange={(e) => setNumHeads(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                  <span>Softmax Temperature (τ): {temperature}</span>
                  <span style={{ color: '#d97706' }}>Scaling denominator</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>Compute FLOPs</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                  {totalFlops.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>Memory Footprint</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 2 }}>
                  {memoryMb} MB
                </div>
              </div>

              <div style={{ padding: 10, background: '#f8fafc', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>Gradient Highway</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', marginTop: 2 }}>
                  x + Sublayer(x)
                </div>
              </div>
            </div>
          </div>

          {/* Attention Heatmap Visualization */}
          <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Live Attention Weight Heatmap (Head 1)
            </h3>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
              Softmax(Q · Kᵀ / √d_k) distribution across sequence positions
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(' + Math.min(seqLen, 16) + ', 1fr)',
              gap: 2,
              background: '#f8fafc',
              padding: 6,
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              {Array.from({ length: Math.min(seqLen, 16) * Math.min(seqLen, 16) }).map((_, idx) => {
                const row = Math.floor(idx / Math.min(seqLen, 16));
                const col = idx % Math.min(seqLen, 16);
                const distance = Math.abs(row - col);
                const weight = Math.max(0.05, (1 / (1 + distance * temperature * 0.8)));
                return (
                  <div
                    key={idx}
                    title={'Token ' + row + ' -> Token ' + col + ': ' + weight.toFixed(2)}
                    style={{
                      aspectRatio: '1',
                      background: 'rgba(79, 70, 229, ' + weight + ')',
                      borderRadius: 2,
                      transition: 'all 0.15s ease'
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
              <span>Token 0</span>
              <span>Token {Math.min(seqLen, 16) - 1}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Ebbinghaus Forgetting Curve */}
      {subTab === 'retention' && (
        <div className="card-pro" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Ebbinghaus Retention Decay & Review Forecaster
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              Calculates projected memory retention over the next 14 days based on recent rubric scores and mistake frequency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {retentionCurves.map((curve) => (
              <div
                key={curve.conceptId}
                style={{
                  padding: '16px',
                  background: curve.needsReviewSoon ? '#fff1f2' : '#f8fafc',
                  border: '1px solid ' + (curve.needsReviewSoon ? '#fecdd3' : '#e2e8f0'),
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={curve.needsReviewSoon ? 'badge badge-needs_attention' : 'badge badge-indigo'}>
                    {curve.needsReviewSoon ? 'Review in ' + curve.optimalReviewDay + ' Days' : 'Retention Strong'}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {curve.currentMastery}%
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{curve.conceptName}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                    Memory Half-Life: {curve.halfLifeDays} days
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Projected Retention:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                    {curve.projections.map((p) => (
                      <span key={p.day} style={{ color: p.retention < 60 ? '#e11d48' : '#059669' }}>
                        D{p.day}: {p.retention}%
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{
                    marginTop: 'auto',
                    fontSize: 11,
                    padding: '5px 8px',
                    justifyContent: 'center'
                  }}
                >
                  <span>Schedule Review</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
