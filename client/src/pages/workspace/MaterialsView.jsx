import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
  Search,
  Check,
  Clock,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { DocumentViewerModal } from '../../components/DocumentViewerModal';

export const MaterialsView = ({ projectId, currentUser }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [chunkSearch, setChunkSearch] = useState('');
  const [viewerDoc, setViewerDoc] = useState({
    isOpen: false,
    materialId: null,
    initialPage: 1,
    docTitle: ''
  });

  const fetchMaterials = async () => {
    try {
      const query = new URLSearchParams();
      if (currentUser?.id) query.append('userId', currentUser.id);
      if (currentUser?.role) query.append('role', currentUser.role);

      const res = await fetch('/api/projects/' + projectId + '/materials?' + query.toString());
      const data = await res.json();
      const list = data.materials || [];
      setMaterials(list);

      if (list.length > 0) {
        if (!selectedMaterial || !list.some((m) => m.id === selectedMaterial.id)) {
          setSelectedMaterial(list[0]);
        }
      } else {
        setSelectedMaterial(null);
        setChunks([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    const interval = setInterval(fetchMaterials, 3000);
    return () => clearInterval(interval);
  }, [projectId, currentUser?.id]);

  useEffect(() => {
    if (selectedMaterial) {
      setLoadingChunks(true);
      fetch('/api/materials/' + selectedMaterial.id + '/chunks')
        .then((r) => r.json())
        .then((d) => setChunks(d.chunks || []))
        .catch(console.error)
        .finally(() => setLoadingChunks(false));
    }
  }, [selectedMaterial?.id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser?.id || 'user_demo');
    formData.append('userName', currentUser?.name || 'Student');

    try {
      const res = await fetch('/api/projects/' + projectId + '/materials/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) await fetchMaterials();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteMaterial = async (materialId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this document? This will also remove its indexed knowledge chunks and embeddings.')) {
      return;
    }

    try {
      const res = await fetch('/api/materials/' + materialId, { method: 'DELETE' });
      if (res.ok) {
        if (selectedMaterial?.id === materialId) {
          setSelectedMaterial(null);
          setChunks([]);
        }
        await fetchMaterials();
      }
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const getStageLabel = (stage) => {
    switch (stage) {
      case 'queued': return 'Queued for Ingestion';
      case 'ocr_extract': return 'Processing & OCR Extraction';
      case 'structure': return 'Content & Structure Extraction';
      case 'knowledge': return 'Knowledge & Concept Extraction';
      case 'indexing': return 'Building Vector & Search Representation';
      case 'ready': return 'Indexed & Ready for Tutor Retrieval';
      case 'failed': return 'Processing Error';
      default: return stage;
    }
  };

  const filteredChunks = chunks.filter((c) =>
    !chunkSearch || c.content.toLowerCase().includes(chunkSearch.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Upload Zone */}
      <div style={{
        border: '1px dashed #cbd5e1',
        borderRadius: 12,
        padding: '28px',
        textAlign: 'center',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#f1f5f9',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UploadCloud size={22} />
        </div>

        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Upload Course Materials & Notes (Multi-Format Support)
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
            Supports PDF, Word (.docx), Markdown (.md), Plain Text (.txt), CSV, and Code files with automatic chunking & OCR.
          </p>
        </div>

        <label className="btn btn-primary" style={{ cursor: 'pointer', marginTop: 4, padding: '8px 18px', fontSize: 13 }}>
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Processing Ingestion...</span>
            </>
          ) : (
            <>
              <UploadCloud size={14} />
              <span>Select File (PDF / DOCX / MD / TXT)</span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Materials List & Pipeline Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
        {/* Left: Document List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Your Documents ({materials.length})
            </h3>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {currentUser?.role === 'admin' ? 'Viewing All Documents (Admin)' : 'Private to your account'}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading documents...</div>
          ) : materials.length === 0 ? (
            <div className="card-pro" style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No documents uploaded yet. Upload a PDF above to ground your AI Tutor in your course notes.
            </div>
          ) : (
            materials.map((mat) => {
              const isSelected = selectedMaterial?.id === mat.id;
              const isReady = mat.status === 'ready';
              return (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat)}
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    borderRadius: 10,
                    border: '1px solid ' + (isSelected ? '#4f46e5' : '#e2e8f0'),
                    background: isSelected ? '#fafbfc' : '#ffffff',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: isReady ? '#ecfdf5' : '#fef3c7',
                        color: isReady ? '#059669' : '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mat.original_name}
                          </span>
                          <span className="badge badge-neutral" style={{ fontSize: 9, padding: '1px 5px', textTransform: 'uppercase', fontWeight: 700 }}>
                            {mat.file_format || (mat.original_name.endsWith('.pdf') ? 'PDF' : mat.original_name.endsWith('.docx') ? 'DOCX' : mat.original_name.endsWith('.md') ? 'MD' : 'TXT')}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                          {(mat.file_size / 1024).toFixed(1)} KB &bull; {mat.page_count || 1} Pages
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {isReady && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMaterial(mat);
                            setViewerDoc({
                              isOpen: true,
                              materialId: mat.id,
                              initialPage: 1,
                              docTitle: mat.original_name
                            });
                          }}
                          className="btn btn-secondary"
                          title="Open inline document reader"
                          style={{
                            padding: '3px 8px',
                            fontSize: 11,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <BookOpen size={12} />
                          <span>Read</span>
                        </button>
                      )}
                      <span className={'badge ' + (isReady ? 'badge-improving' : 'badge-stable')}>
                        {mat.status}
                      </span>
                      <button
                        onClick={(e) => handleDeleteMaterial(mat.id, e)}
                        title="Remove document"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: 4,
                          borderRadius: 4
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Stage Progress */}
                  <div style={{
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #f1f5f9',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>
                      {getStageLabel(mat.processing_stage || mat.status)}
                    </span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>
                      {isReady ? '100% Ready' : 'Processing'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Chunks & Vector Representation Inspector */}
        <div className="card-pro" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, height: 'fit-content', maxHeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Vector Representation & Chunks
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {selectedMaterial && (
                <button
                  onClick={() => setViewerDoc({
                    isOpen: true,
                    materialId: selectedMaterial.id,
                    initialPage: 1,
                    docTitle: selectedMaterial.original_name
                  })}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    fontSize: 11,
                    borderRadius: 6
                  }}
                  title="Open full page document viewer"
                >
                  <BookOpen size={12} />
                  <span>Reader (PRD 97)</span>
                </button>
              )}
              <span className="badge badge-neutral">
                {chunks.length} Chunks
              </span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search chunks in this document..."
            value={chunkSearch}
            onChange={(e) => setChunkSearch(e.target.value)}
            className="input-field"
            style={{ fontSize: 12 }}
          />

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 450 }}>
            {loadingChunks ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>Loading chunks...</div>
            ) : filteredChunks.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                {chunks.length === 0 ? 'Select a document to inspect chunks.' : 'No chunks match your search.'}
              </div>
            ) : (
              filteredChunks.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                    <span style={{ fontWeight: 600 }}>Page {c.page_number} &bull; Chunk #{c.chunk_index}</span>
                    <span>{c.token_count || 120} Tokens</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4, fontFamily: 'var(--font-mono)' }}>
                    {c.content.slice(0, 200)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal (PRD Item 97) */}
      <DocumentViewerModal
        isOpen={viewerDoc.isOpen}
        onClose={() => setViewerDoc((prev) => ({ ...prev, isOpen: false }))}
        materialId={viewerDoc.materialId}
        initialPage={viewerDoc.initialPage}
        docTitle={viewerDoc.docTitle}
      />
    </div>
  );
};
