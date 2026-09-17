import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Search,
  Highlighter,
  FileText,
  Download,
  Maximize2,
  Copy,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const DocumentViewerModal = ({
  isOpen,
  onClose,
  materialId,
  initialPage = 1,
  highlightSnippet = '',
  docTitle = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [docData, setDocData] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !materialId) return;

    setLoading(true);
    setCurrentPage(initialPage || 1);

    fetch(`/api/materials/${materialId}/pages`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document');
        return res.json();
      })
      .then((data) => {
        setDocData(data);
        const validPage = Math.min(Math.max(1, initialPage || 1), data.totalPages || 1);
        setCurrentPage(validPage);
      })
      .catch((err) => {
        console.error('Document fetch error:', err);
        // Fallback placeholder
        setDocData({
          material: {
            id: materialId,
            name: docTitle || 'Document Viewer',
            pageCount: 1,
            status: 'ready'
          },
          totalPages: 1,
          pages: [
            {
              pageNumber: 1,
              text: highlightSnippet
                ? `Cited Passage Preview:\n\n${highlightSnippet}\n\n(Full document content is currently processing or offline.)`
                : 'Document text is being indexed or unavailable.'
            }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, materialId, initialPage]);

  // Auto-scroll to highlighted snippet when page changes
  useEffect(() => {
    if (contentRef.current) {
      const mark = contentRef.current.querySelector('mark');
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentPage, highlightSnippet, loading]);

  if (!isOpen) return null;

  const totalPages = docData?.totalPages || 1;
  const currentPageObj = docData?.pages?.find((p) => p.pageNumber === currentPage) || docData?.pages?.[0];
  const pageText = currentPageObj?.text || 'No text extracted for this page.';

  const handleCopyPage = () => {
    navigator.clipboard.writeText(pageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to highlight terms (snippet or search query)
  const renderHighlightedText = (text) => {
    const targetTerms = [];
    if (searchQuery.trim()) {
      targetTerms.push(searchQuery.trim());
    }
    if (highlightSnippet && highlightSnippet.trim().length > 15) {
      // Use clean phrases from snippet
      const cleanSnippet = highlightSnippet.trim().slice(0, 100);
      targetTerms.push(cleanSnippet);
    }

    if (targetTerms.length === 0) {
      return text;
    }

    // Try finding exact snippet match first
    if (highlightSnippet && text.includes(highlightSnippet.trim())) {
      const parts = text.split(highlightSnippet.trim());
      return parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark
              style={{
                background: 'rgba(245, 158, 11, 0.28)',
                color: '#fef08a',
                padding: '2px 6px',
                borderRadius: 4,
                borderLeft: '3px solid #f59e0b',
                fontWeight: 600
              }}
            >
              {highlightSnippet.trim()}
            </mark>
          )}
        </React.Fragment>
      ));
    }

    // Otherwise regex match search query
    if (searchQuery.trim()) {
      try {
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              style={{
                background: 'rgba(99, 102, 241, 0.35)',
                color: '#c7d2fe',
                padding: '1px 4px',
                borderRadius: 3,
                fontWeight: 600
              }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        );
      } catch (e) {
        return text;
      }
    }

    return text;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 15, 29, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 120,
        padding: '24px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: 'rgba(15, 23, 42, 0.65)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <BookOpen size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '420px'
                  }}
                >
                  {docData?.material?.name || docTitle || 'Course Document'}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    fontWeight: 600
                  }}
                >
                  Grounded Source
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                PRD Verified Document Reader • {totalPages} Pages Indexed
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Quick in-document search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '4px 10px',
                gap: 6
              }}
            >
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Find in document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  width: '130px'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={handleCopyPage}
              className="btn-ghost"
              title="Copy page text"
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={onClose}
              className="btn-ghost"
              style={{
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                color: 'var(--text-secondary)',
                padding: 6
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Citation Banner if targeted from citation click */}
        {highlightSnippet && (
          <div
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
              <Sparkles size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 12, minWidth: 0 }}>
                <span style={{ fontWeight: 700, color: '#fbbf24', marginRight: 6 }}>
                  Citation Jump Target (Page {initialPage}):
                </span>
                <span
                  style={{
                    color: 'var(--text-primary)',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    maxWidth: '650px',
                    verticalAlign: 'bottom'
                  }}
                >
                  "{highlightSnippet}"
                </span>
              </div>
            </div>
            {currentPage !== initialPage && (
              <button
                onClick={() => setCurrentPage(initialPage)}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: '#f59e0b',
                  color: '#000',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Jump to Citation Page {initialPage}
              </button>
            )}
          </div>
        )}

        {/* Document Body / Reader View */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 48px',
            background: 'rgba(10, 15, 29, 0.45)',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: 14.5,
            lineHeight: 1.75,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <div className="spinner" />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading verified document pages...</p>
            </div>
          ) : (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-secondary)',
                  fontSize: 12
                }}
              >
                <span>SECTION PAGE {currentPage}</span>
                <span>{currentPageObj?.chunks?.length || 1} Document Chunks Indexed</span>
              </div>

              <div style={{ minHeight: '380px' }}>
                {renderHighlightedText(pageText)}
              </div>
            </div>
          )}
        </div>

        {/* Footer Page Navigation Bar */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.75)'
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Document ID: <code style={{ color: '#818cf8' }}>{materialId?.slice(0, 14)}...</code>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                fontSize: 13,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.4 : 1
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span>Page</span>
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  padding: '4px 8px',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <option key={pNum} value={pNum} style={{ background: '#0f172a', color: '#fff' }}>
                    {pNum}
                  </option>
                ))}
              </select>
              <span>of {totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                fontSize: 13,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.4 : 1
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Strict Citation Grounding (PRD 91 & 97)
          </div>
        </div>
      </div>
    </div>
  );
};
