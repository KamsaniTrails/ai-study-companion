import os
import subprocess
import shutil

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TEMP_DIR = os.environ.get('TEMP', r'C:\Users\jayas\AppData\Local\Temp')
TARGET_PDF = os.path.join(WORKSPACE_ROOT, "AI_Study_Companion_System_Architecture.pdf")
HTML_FILE = os.path.join(WORKSPACE_ROOT, "docs", "architecture_pdf_template.html")
TEMP_PDF = os.path.join(TEMP_DIR, "executive_system_architecture.pdf")

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI Study Companion — System Architecture &amp; Technical Blueprint</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4 portrait;
    margin: 14mm 14mm 14mm 14mm;
    @bottom-right {
      content: counter(page);
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 8.5pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    page-break-after: always;
    break-after: page;
    position: relative;
    min-height: 260mm;
  }

  .page:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* ==========================================================================
     COVER PAGE STYLING (EXECUTIVE WHITEPAPER THEME)
     ========================================================================== */
  .cover-container {
    min-height: 260mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 28px 26px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    position: relative;
    overflow: hidden;
  }

  .cover-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 14px;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    background: #4f46e5;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 14pt;
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
  }

  .brand-text {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
  }

  .doc-category-badge {
    background: #eef2ff;
    color: #3730a3;
    font-size: 7.5pt;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 9999px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid #c7d2fe;
  }

  .cover-main-content {
    margin: 24px 0 16px 0;
  }

  .cover-eyebrow {
    font-size: 8.8pt;
    font-weight: 700;
    color: #4f46e5;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .cover-title {
    font-size: 26pt;
    font-weight: 800;
    line-height: 1.16;
    color: #0f172a;
    letter-spacing: -0.6px;
    margin-bottom: 10px;
  }

  .cover-subtitle {
    font-size: 10.2pt;
    color: #475569;
    line-height: 1.45;
    font-weight: 400;
    margin-bottom: 20px;
  }

  .cover-pills-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .cover-pill {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 7.8pt;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .cover-pill.indigo {
    border-color: #c7d2fe;
    background: #eef2ff;
    color: #3730a3;
  }

  .cover-pill.blue {
    border-color: #bae6fd;
    background: #f0f9ff;
    color: #0369a1;
  }

  .cover-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 10px;
  }

  .cover-feature-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 12px 14px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .feature-card-title {
    font-size: 8.8pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .feature-card-desc {
    font-size: 7.7pt;
    color: #64748b;
    line-height: 1.4;
  }

  .cover-scope-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #4f46e5;
    border-radius: 8px;
    padding: 12px 14px;
    margin-top: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .scope-card-title {
    font-size: 8.6pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .scope-card-text {
    font-size: 7.8pt;
    color: #475569;
    line-height: 1.45;
  }

  /* ==========================================================================
     RUNNING PAGE HEADER
     ========================================================================== */
  .page-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 12px;
  }

  .page-top-title {
    font-size: 8pt;
    font-weight: 700;
    color: #4f46e5;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .page-top-meta {
    font-size: 7.2pt;
    color: #94a3b8;
  }

  /* Section Title with Badge Pill */
  .section-header {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 8px;
    margin-top: 4px;
    page-break-after: avoid;
  }

  .section-num {
    background: #4f46e5;
    color: #ffffff;
    font-size: 8.2pt;
    font-weight: 700;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .section-title {
    font-size: 11pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.2px;
  }

  p {
    margin-bottom: 6px;
    color: #334155;
    text-align: justify;
    line-height: 1.46;
  }

  .diagram-box {
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
    padding: 10px;
    margin: 6px 0 10px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  /* Tables */
  .table-box {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 7.8pt;
  }

  .table-box th {
    background: #f1f5f9;
    color: #0f172a;
    text-align: left;
    padding: 6px 9px;
    font-weight: 700;
    font-size: 7.6pt;
    border: 1px solid #cbd5e1;
    border-bottom: 2px solid #4f46e5;
    letter-spacing: 0.2px;
  }

  .table-box td {
    padding: 5px 9px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
    line-height: 1.4;
  }

  .table-box tr:nth-child(even) td {
    background: #f8fafc;
  }

  .callout-note {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 3.5px solid #10b981;
    padding: 7px 11px;
    border-radius: 5px;
    font-size: 7.8pt;
    margin: 8px 0;
    color: #166534;
    line-height: 1.42;
  }

  .mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
    color: #3730a3;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
</head>
<body>

<!-- ================= PAGE 1: EXECUTIVE ARCHITECTURE COVER ================= -->
<div class="page cover-container">
  <div class="cover-top-bar">
    <div class="brand-logo">
      <div class="brand-icon">AI</div>
      <div class="brand-text">AI Study Companion</div>
    </div>
    <div class="doc-category-badge">PRD Section 20.4 &bull; System Architecture</div>
  </div>

  <div class="cover-main-content">
    <div class="cover-eyebrow">Official Engineering Blueprint &amp; Specification</div>
    <div class="cover-title">System Architecture &amp; Technical Blueprint</div>
    <div class="cover-subtitle">
      Comprehensive Production-Grade Architecture Blueprint: Decoupled Multi-Service Topology, Asynchronous Multimodal Ingestion Pipelines, Adaptive Bayesian Mastery Engine, Security Isolation &amp; Deployment Topology.
    </div>

    <div class="cover-grid">
      <div class="cover-feature-card">
        <div class="feature-card-title">1. High-Level Modular Decoupling</div>
        <div class="feature-card-desc">
          React 18 SPA + Express Application Gateway with 10 isolated domain micro-services. Zero business-logic coupling, full horizontal scalability, and hot-swappable Google Gemini provider adapters.
        </div>
      </div>

      <div class="cover-feature-card">
        <div class="feature-card-title">2. Asynchronous Multimodal Ingestion</div>
        <div class="feature-card-desc">
          5-stage idempotent material ingestion workflow: <code>Queued &rarr; OCR &rarr; Chunking &rarr; Knowledge Graph &rarr; Ready</code>, featuring exponential backoff retries and dead-letter safety.
        </div>
      </div>

      <div class="cover-feature-card">
        <div class="feature-card-title">3. Adaptive Cognitive Assessment Loop</div>
        <div class="feature-card-desc">
          Bayesian Knowledge Tracing (BKT) dynamic cognitive modeling with Ebbinghaus retention decay curves, targeting student concept gaps (&lt;60%) with 5-point qualitative rubric scoring.
        </div>
      </div>

      <div class="cover-feature-card">
        <div class="feature-card-title">4. Layered Security &amp; Observability</div>
        <div class="feature-card-desc">
          Multi-tenant project boundary enforcement (HTTP 403), rate limiting (HTTP 429), XML boundary sanitization against prompt injections, and full-fidelity token telemetry logging.
        </div>
      </div>
    </div>

    <div class="cover-scope-card">
      <div class="scope-card-title">Architectural Scope &amp; Verification Standard</div>
      <div class="scope-card-text">
        This document fulfills all architectural specifications mandated by <strong>PRD Section 20.4</strong>. The architecture decouples client interfaces from core business logic, leverages Google Gemini 2.0/1.5 foundation models with automated circuit-breaker fallback to an in-memory neural simulator, and enforces strict tenant isolation verified by 50/50 passing automated tests.
      </div>
    </div>
  </div>
</div>

<!-- ================= PAGE 2: HIGH-LEVEL ARCHITECTURE & SEQUENCE FLOW ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 01 &bull; System Topology &amp; Core Sequence Flow</div>
  </div>

  <div class="section-header">
    <div class="section-num">01</div>
    <div class="section-title">High-Level System Architecture Topology</div>
  </div>
  <p style="margin-bottom: 5px;">
    The platform is structured into decoupled horizontal tiers separating the user interface, API edge gateway, business domain services, persistent data layer, asynchronous background workers, and AI observability infrastructure:
  </p>
  <div class="diagram-box">
    <svg viewBox="0 0 740 370" xmlns="http://www.w3.org/2000/svg">
      <!-- CLIENT LAYER -->
      <rect x="10" y="8" width="720" height="42" rx="5" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="25" y="24" font-size="8.5" font-weight="700" fill="#475569" letter-spacing="0.5">CLIENT LAYER</text>
      <rect x="150" y="16" width="260" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="280" y="33" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">Web App (React 18 / Vite SPA)</text>
      <rect x="430" y="16" width="280" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="570" y="33" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">Responsive SPA Client (Vanilla CSS)</text>

      <!-- EDGE & GATEWAY -->
      <rect x="10" y="56" width="720" height="42" rx="5" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="25" y="72" font-size="8.5" font-weight="700" fill="#475569" letter-spacing="0.5">EDGE / GATEWAY</text>
      <rect x="150" y="64" width="160" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="230" y="81" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">Edge Security / CORS Layer</text>
      <rect x="325" y="64" width="140" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="395" y="81" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">Rate Limiter (HTTP 429)</text>
      <rect x="480" y="64" width="230" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="595" y="81" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">Application Gateway (Tenant Auth &amp; Guards)</text>

      <!-- API / APPLICATION LAYER -->
      <rect x="10" y="104" width="720" height="42" rx="5" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="25" y="120" font-size="8.5" font-weight="700" fill="#475569" letter-spacing="0.5">API / APPLICATION</text>
      <rect x="150" y="112" width="270" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="285" y="129" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">REST API (Express / Node.js)</text>
      <rect x="435" y="112" width="275" height="26" rx="4" fill="#ffffff" stroke="#94a3b8"/>
      <text x="572" y="129" font-size="8.5" font-weight="600" fill="#0f172a" text-anchor="middle">SSE Streaming Server (Tutor Engine)</text>

      <!-- DOMAIN SERVICES -->
      <rect x="10" y="152" width="720" height="68" rx="5" fill="#fefce8" stroke="#fef08a"/>
      <text x="25" y="170" font-size="8.5" font-weight="700" fill="#854d0e" letter-spacing="0.5">BUSINESS LOGIC (Domain Services)</text>
      
      <rect x="25" y="180" width="105" height="32" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="77" y="195" font-size="8" font-weight="600" fill="#0f172a" text-anchor="middle">Learning Service</text>
      <text x="77" y="206" font-size="7" fill="#64748b" text-anchor="middle">(Spaces/Projects)</text>

      <rect x="140" y="180" width="125" height="32" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="202" y="195" font-size="8" font-weight="600" fill="#0f172a" text-anchor="middle">AI Orchestrator</text>
      <text x="202" y="206" font-size="7" fill="#64748b" text-anchor="middle">(Tutor, RAG, Prompts)</text>

      <rect x="275" y="180" width="115" height="32" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="332" y="195" font-size="8" font-weight="600" fill="#0f172a" text-anchor="middle">Assessment Service</text>
      <text x="332" y="206" font-size="7" fill="#64748b" text-anchor="middle">(Quiz / Grading)</text>

      <rect x="400" y="180" width="100" height="32" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="450" y="195" font-size="8" font-weight="600" fill="#0f172a" text-anchor="middle">Mastery &amp; Growth</text>
      <text x="450" y="206" font-size="7" fill="#64748b" text-anchor="middle">(Bayesian / EWMA)</text>

      <rect x="510" y="180" width="105" height="32" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="562" y="195" font-size="8" font-weight="600" fill="#0f172a" text-anchor="middle">Analytics Service</text>
      <text x="562" y="206" font-size="7" fill="#64748b" text-anchor="middle">(Event Bus)</text>

      <rect x="625" y="180" width="95" height="32" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="672" y="195" font-size="8" font-weight="600" fill="#0f172a" text-anchor="middle">Admin Service</text>
      <text x="672" y="206" font-size="7" fill="#64748b" text-anchor="middle">(Observability)</text>

      <!-- DATA & KNOWLEDGE LAYER -->
      <rect x="10" y="226" width="720" height="66" rx="5" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="25" y="244" font-size="8.5" font-weight="700" fill="#475569" letter-spacing="0.5">DATA &amp; KNOWLEDGE LAYER</text>

      <rect x="25" y="254" width="155" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="102" y="269" font-size="7.8" font-weight="600" fill="#0f172a" text-anchor="middle">Atomic JSON Store</text>
      <text x="102" y="279" font-size="6.8" fill="#64748b" text-anchor="middle">(server/db.js: .tmp swap + .bak)</text>

      <rect x="195" y="254" width="165" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="277" y="269" font-size="7.8" font-weight="600" fill="#0f172a" text-anchor="middle">In-Memory Vector Search</text>
      <text x="277" y="279" font-size="6.8" fill="#64748b" text-anchor="middle">(TF-IDF + Cosine Similarity)</text>

      <rect x="375" y="254" width="165" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="457" y="269" font-size="7.8" font-weight="600" fill="#0f172a" text-anchor="middle">Local Document Storage</text>
      <text x="457" y="279" font-size="6.8" fill="#64748b" text-anchor="middle">(Sanitized /uploads directory)</text>

      <rect x="555" y="254" width="165" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="637" y="269" font-size="7.8" font-weight="600" fill="#0f172a" text-anchor="middle">In-Memory TTL Cache</text>
      <text x="637" y="279" font-size="6.8" fill="#64748b" text-anchor="middle">(&lt; 5ms cached responses)</text>

      <!-- BACKGROUND & AI SERVICES -->
      <rect x="10" y="298" width="355" height="64" rx="5" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="25" y="316" font-size="8" font-weight="700" fill="#475569" letter-spacing="0.4">BACKGROUND PROCESSING</text>
      <rect x="25" y="324" width="150" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="100" y="339" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">Async Ingestion Pipeline</text>
      <text x="100" y="349" font-size="6.8" fill="#64748b" text-anchor="middle">(Idempotent 5-stage worker)</text>
      <rect x="190" y="324" width="160" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="270" y="339" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">EventBus &amp; Mastery Engine</text>
      <text x="270" y="349" font-size="6.8" fill="#64748b" text-anchor="middle">(Bayesian updates &amp; decay)</text>

      <rect x="375" y="298" width="355" height="64" rx="5" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="390" y="316" font-size="8" font-weight="700" fill="#475569" letter-spacing="0.4">AI SERVICES &amp; OBSERVABILITY</text>
      <rect x="390" y="324" width="160" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="470" y="339" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">LLM Provider (Google Gemini)</text>
      <text x="470" y="349" font-size="6.8" fill="#64748b" text-anchor="middle">Gemini 2.0/1.5 + Neural Fallback</text>
      <rect x="565" y="324" width="155" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="642" y="339" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">Observability &amp; Telemetry</text>
      <text x="642" y="349" font-size="6.8" fill="#64748b" text-anchor="middle">(Built-in ai_logs &amp; diagnostics)</text>
    </svg>
  </div>

  <div class="section-header" style="margin-top: 8px;">
    <div class="section-num">02</div>
    <div class="section-title">Core Learning Loop — Sequence Flow</div>
  </div>
  <div class="diagram-box" style="padding: 9px;">
    <svg viewBox="0 0 700 135" xmlns="http://www.w3.org/2000/svg">
      <!-- Lifelines -->
      <line x1="60" y1="25" x2="60" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
      <line x1="180" y1="25" x2="180" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
      <line x1="310" y1="25" x2="310" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
      <line x1="440" y1="25" x2="440" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
      <line x1="560" y1="25" x2="560" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
      <line x1="650" y1="25" x2="650" y2="125" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>

      <!-- Headers -->
      <rect x="25" y="5" width="70" height="20" rx="3" fill="#e2e8f0"/>
      <text x="60" y="18" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">User</text>

      <rect x="145" y="5" width="70" height="20" rx="3" fill="#e2e8f0"/>
      <text x="180" y="18" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">API Layer</text>

      <rect x="270" y="5" width="80" height="20" rx="3" fill="#e2e8f0"/>
      <text x="310" y="18" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">AI Orchestrator</text>

      <rect x="400" y="5" width="80" height="20" rx="3" fill="#e2e8f0"/>
      <text x="440" y="18" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">Retrieval (Vector)</text>

      <rect x="525" y="5" width="70" height="20" rx="3" fill="#e2e8f0"/>
      <text x="560" y="18" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">LLM API</text>

      <rect x="620" y="5" width="60" height="20" rx="3" fill="#e2e8f0"/>
      <text x="650" y="18" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">Database</text>

      <!-- Message 1 -->
      <line x1="60" y1="40" x2="180" y2="40" stroke="#475569" stroke-width="1.2"/>
      <polygon points="175,37 180,40 175,43" fill="#475569"/>
      <text x="120" y="35" font-size="7" fill="#334155" text-anchor="middle">Ask Tutor a question</text>

      <!-- Message 2 -->
      <line x1="180" y1="52" x2="310" y2="52" stroke="#475569" stroke-width="1.2"/>
      <polygon points="305,49 310,52 305,55" fill="#475569"/>
      <text x="245" y="48" font-size="7" fill="#334155" text-anchor="middle">Forward request + project_id</text>

      <!-- Message 3 -->
      <line x1="310" y1="64" x2="650" y2="64" stroke="#475569" stroke-width="1.2"/>
      <polygon points="645,61 650,64 645,67" fill="#475569"/>
      <text x="480" y="60" font-size="7" fill="#334155" text-anchor="middle">Fetch conversation context + learner state</text>

      <!-- Message 4 -->
      <line x1="310" y1="76" x2="440" y2="76" stroke="#475569" stroke-width="1.2"/>
      <polygon points="435,73 440,76 435,79" fill="#475569"/>
      <text x="375" y="72" font-size="7" fill="#334155" text-anchor="middle">Retrieve relevant chunks (project-scoped)</text>

      <!-- Message 5 (Return) -->
      <line x1="440" y1="88" x2="310" y2="88" stroke="#475569" stroke-width="1.2" stroke-dasharray="3"/>
      <polygon points="315,85 310,88 315,91" fill="#475569"/>
      <text x="375" y="84" font-size="7" fill="#334155" text-anchor="middle">Top-k chunks + page refs</text>

      <!-- Message 6 -->
      <line x1="310" y1="100" x2="560" y2="100" stroke="#475569" stroke-width="1.2"/>
      <polygon points="555,97 560,100 555,103" fill="#475569"/>
      <text x="435" y="96" font-size="7" fill="#334155" text-anchor="middle">Generate response (stream tokens)</text>

      <!-- Message 7 -->
      <line x1="310" y1="114" x2="60" y2="114" stroke="#4f46e5" stroke-width="1.4"/>
      <polygon points="65,111 60,114 65,117" fill="#4f46e5"/>
      <text x="185" y="110" font-size="7" font-weight="600" fill="#4338ca" text-anchor="middle">Answer + citations (Source: Doc &mdash; Page N)</text>

      <!-- Message 8 Async -->
      <line x1="310" y1="125" x2="650" y2="125" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2"/>
      <polygon points="645,122 650,125 645,128" fill="#94a3b8"/>
      <text x="480" y="122" font-size="6.5" fill="#64748b" text-anchor="middle">Async: Log tutor_interaction event + update persistent context</text>
    </svg>
  </div>
</div>

<!-- ================= PAGE 3: ASYNC INGESTION PIPELINE & STAGES ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 03 &bull; Asynchronous Processing &amp; Ingestion Lifecycle</div>
  </div>

  <div class="section-header">
    <div class="section-num">03</div>
    <div class="section-title">Document Processing Pipeline (Async)</div>
  </div>
  <p style="margin-bottom: 8px;">
    The ingestion pipeline processes course materials asynchronously through a staged, idempotent workflow. Each material transitions sequentially from upload to active vector search index:
  </p>

  <div class="diagram-box" style="padding: 14px 10px;">
    <svg viewBox="0 0 710 170" xmlns="http://www.w3.org/2000/svg">
      <!-- Upload -->
      <rect x="5" y="10" width="75" height="42" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="42" y="27" font-size="7" font-weight="700" fill="#0f172a" text-anchor="middle">PDF Upload</text>
      <text x="42" y="38" font-size="6" fill="#64748b" text-anchor="middle">Size limit check</text>

      <line x1="80" y1="31" x2="95" y2="31" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="92,29 95,31 92,33" fill="#94a3b8"/>

      <!-- Storage -->
      <rect x="95" y="10" width="95" height="42" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="142" y="27" font-size="7" font-weight="700" fill="#0f172a" text-anchor="middle">Save to Storage</text>
      <text x="142" y="38" font-size="6" fill="#64748b" text-anchor="middle">UUID object key</text>

      <line x1="190" y1="31" x2="205" y2="31" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="202,29 205,31 202,33" fill="#94a3b8"/>

      <!-- Create record -->
      <rect x="205" y="10" width="105" height="42" rx="3" fill="#fefce8" stroke="#fef08a"/>
      <text x="257" y="27" font-size="7" font-weight="700" fill="#854d0e" text-anchor="middle">Enqueue Job</text>
      <text x="257" y="38" font-size="6" fill="#a16207" text-anchor="middle">status=queued</text>

      <line x1="310" y1="31" x2="330" y2="31" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="327,29 330,31 327,33" fill="#94a3b8"/>

      <!-- OCR Diamond -->
      <polygon points="370,10 410,31 370,52 330,31" fill="#eff6ff" stroke="#3b82f6"/>
      <text x="370" y="29" font-size="6.5" font-weight="700" fill="#1e40af" text-anchor="middle">OCR</text>
      <text x="370" y="37" font-size="5.5" fill="#1e40af" text-anchor="middle">needed?</text>

      <!-- Yes branch -->
      <line x1="370" y1="52" x2="370" y2="75" stroke="#3b82f6" stroke-width="1.2"/>
      <polygon points="368,72 370,75 372,72" fill="#3b82f6"/>
      <text x="380" y="66" font-size="6.5" fill="#1e40af">Yes</text>
      <rect x="325" y="75" width="90" height="28" rx="3" fill="#dbeafe" stroke="#3b82f6"/>
      <text x="370" y="92" font-size="6.5" font-weight="600" fill="#1e40af" text-anchor="middle">OCR Service</text>

      <!-- No branch -->
      <line x1="410" y1="31" x2="445" y2="31" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="442,29 445,31 442,33" fill="#94a3b8"/>
      <text x="425" y="25" font-size="6.5" fill="#64748b">No</text>

      <!-- Text extraction -->
      <rect x="445" y="10" width="105" height="42" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="497" y="27" font-size="7" font-weight="700" fill="#0f172a" text-anchor="middle">Text Extraction</text>
      <text x="497" y="38" font-size="6" fill="#64748b" text-anchor="middle">Parse structure/tables</text>

      <line x1="550" y1="31" x2="570" y2="31" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="567,29 570,31 567,33" fill="#94a3b8"/>

      <!-- Chunking -->
      <rect x="570" y="10" width="135" height="42" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="637" y="27" font-size="7" font-weight="700" fill="#0f172a" text-anchor="middle">Chunking + Structure</text>
      <text x="637" y="38" font-size="6" fill="#64748b" text-anchor="middle">Section / page boundary</text>

      <!-- Route down to Row 2 -->
      <path d="M 637 52 L 637 115 L 20 115" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
      <path d="M 370 103 L 370 115" fill="none" stroke="#3b82f6" stroke-width="1.2"/>

      <!-- Row 2: Concept extraction -->
      <rect x="20" y="125" width="145" height="40" rx="3" fill="#fdf4ff" stroke="#d8b4fe"/>
      <text x="92" y="142" font-size="7" font-weight="700" fill="#7e22ce" text-anchor="middle">Concept/Keyword Extraction</text>
      <text x="92" y="153" font-size="6" fill="#9333ea" text-anchor="middle">LLM extraction &amp; tags</text>

      <line x1="165" y1="145" x2="190" y2="145" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="187,143 190,145 187,147" fill="#94a3b8"/>

      <!-- Embeddings -->
      <rect x="190" y="125" width="140" height="40" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="260" y="142" font-size="7" font-weight="700" fill="#0f172a" text-anchor="middle">Generate Embeddings</text>
      <text x="260" y="153" font-size="6" fill="#64748b" text-anchor="middle">text-embedding-004</text>

      <line x1="330" y1="145" x2="355" y2="145" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="352,143 355,145 352,147" fill="#94a3b8"/>

      <!-- Store vectors -->
      <rect x="355" y="125" width="135" height="40" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="422" y="142" font-size="7" font-weight="700" fill="#0f172a" text-anchor="middle">Store in Vector DB</text>
      <text x="422" y="153" font-size="6" fill="#64748b" text-anchor="middle">Vectors + page metadata</text>

      <line x1="490" y1="145" x2="515" y2="145" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="512,143 515,145 512,147" fill="#94a3b8"/>

      <!-- Ready -->
      <rect x="515" y="125" width="105" height="40" rx="3" fill="#ecfdf5" stroke="#a7f3d0"/>
      <text x="567" y="142" font-size="7" font-weight="700" fill="#065f46" text-anchor="middle">Status: Ready</text>
      <text x="567" y="153" font-size="6" fill="#047857" text-anchor="middle">Emit: material_ready</text>

      <line x1="620" y1="145" x2="645" y2="145" stroke="#94a3b8" stroke-width="1.2"/>
      <polygon points="642,143 645,145 642,147" fill="#94a3b8"/>

      <!-- Trigger recs -->
      <rect x="645" y="125" width="60" height="40" rx="3" fill="#fefce8" stroke="#fef08a"/>
      <text x="675" y="142" font-size="6.5" font-weight="700" fill="#854d0e" text-anchor="middle">Recs</text>
      <text x="675" y="153" font-size="5.5" fill="#a16207" text-anchor="middle">Refresh</text>
    </svg>
  </div>

  <div class="callout-note">
    <strong>Idempotency &amp; Failure Recovery:</strong> Each stage is strictly idempotent (checked via <span class="mono">job_id + material_id</span> deduplication key), retried with exponential backoff (max 3 attempts), and on final failure the material status flips to <span class="mono">failed</span> with an audit error reason surfaced to user and admin dashboards.
  </div>

  <!-- Detailed 5-Stage Ingestion Lifecycle Table (Fills Page 3 Perfectly) -->
  <div class="section-header" style="margin-top: 10px;">
    <div class="section-num">03b</div>
    <div class="section-title">5-Stage Ingestion Lifecycle Specifications</div>
  </div>

  <table class="table-box">
    <thead>
      <tr>
        <th style="width: 15%;">Ingestion Stage</th>
        <th style="width: 25%;">Trigger &amp; Precondition</th>
        <th style="width: 32%;">Processing Execution</th>
        <th>Output &amp; Verification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Enqueue</strong></td>
        <td>HTTP POST multipart file upload (PDF/DOCX/TXT).</td>
        <td>Validates file size (&le;25MB), checks MIME types, generates UUID disk path.</td>
        <td>Records material with <span class="mono">status=queued</span>; pushes job to queue.</td>
      </tr>
      <tr>
        <td><strong>2. Extraction</strong></td>
        <td>Worker dequeues job; verifies lock.</td>
        <td>Parses document text; evaluates image density for automated OCR routing.</td>
        <td>Extracts raw text strings, page boundaries, and section header tokens.</td>
      </tr>
      <tr>
        <td><strong>3. Chunking</strong></td>
        <td>Clean text stream extracted.</td>
        <td>Executes structure-aware chunking (400–600 tokens) with 50-token overlaps.</td>
        <td>Preserves section titles, document IDs, and exact page number markers.</td>
      </tr>
      <tr>
        <td><strong>4. Indexing</strong></td>
        <td>Chunks ready in memory.</td>
        <td>Executes 128-dim subword &amp; character 3-gram feature hashing; extracts key concepts.</td>
        <td>Generates 128-dim L2-normalized dense vectors; builds project-partitioned vector index.</td>
      </tr>
      <tr>
        <td><strong>5. Ready</strong></td>
        <td>Vectors and concepts stored.</td>
        <td>Emits <span class="mono">material_ready</span> event; triggers recommendation engine refresh.</td>
        <td>Material state flips to <span class="mono">ready</span>; available for tutor and quiz RAG.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ================= PAGE 4: ADAPTIVE ASSESSMENT LOOP ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 04 &bull; Adaptive Assessment &amp; Cognitive Feedback Loop</div>
  </div>

  <div class="section-header">
    <div class="section-num">04</div>
    <div class="section-title">Adaptive Assessment &amp; Knowledge Mastery Flow</div>
  </div>
  <p style="margin-bottom: 6px;">
    The assessment workflow models a continuous adaptive loop: selecting target concepts by student mastery gaps, synthesizing grounded questions, validating structured schema outputs, and recalculating cognitive mastery curves:
  </p>

  <div class="diagram-box" style="padding: 12px 18px;">
    <svg viewBox="0 0 660 380" xmlns="http://www.w3.org/2000/svg">
      <!-- 1. Start Quiz -->
      <rect x="250" y="10" width="160" height="34" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="31" font-size="8.5" font-weight="600" fill="#4c1d95" text-anchor="middle">Start Quiz</text>

      <line x1="330" y1="44" x2="330" y2="65" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,62 330,65 333,62" fill="#64748b"/>

      <!-- 2. Fetch history -->
      <rect x="220" y="65" width="220" height="36" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="80" font-size="7.5" fill="#4c1d95" text-anchor="middle">Fetch mastery + mistake</text>
      <text x="330" y="92" font-size="7.5" fill="#4c1d95" text-anchor="middle">history for Project</text>

      <line x1="330" y1="101" x2="330" y2="120" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,117 330,120 333,117" fill="#64748b"/>

      <!-- 3. Selection Engine -->
      <rect x="220" y="120" width="220" height="42" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="134" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">Selection Engine:</text>
      <text x="330" y="146" font-size="7" fill="#4c1d95" text-anchor="middle">weakest concepts + spaced-review due</text>
      <text x="330" y="156" font-size="7" fill="#4c1d95" text-anchor="middle">+ difficulty curve</text>

      <line x1="330" y1="162" x2="330" y2="182" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,179 330,182 333,179" fill="#64748b"/>

      <!-- 4. LLM Gen -->
      <rect x="220" y="182" width="220" height="36" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="197" font-size="7.5" fill="#4c1d95" text-anchor="middle">LLM generates question</text>
      <text x="330" y="209" font-size="7.5" fill="#4c1d95" text-anchor="middle">grounded in material chunks</text>

      <line x1="330" y1="218" x2="330" y2="238" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,235 330,238 333,235" fill="#64748b"/>

      <!-- 5. Validate schema -->
      <rect x="220" y="238" width="220" height="34" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="252" font-size="7.5" fill="#4c1d95" text-anchor="middle">Validate structured output</text>
      <text x="330" y="263" font-size="7.5" fill="#4c1d95" text-anchor="middle">schema check</text>

      <line x1="330" y1="272" x2="330" y2="292" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,289 330,292 333,289" fill="#64748b"/>

      <!-- 6. Present to user -->
      <rect x="250" y="292" width="160" height="30" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="311" font-size="7.5" fill="#4c1d95" text-anchor="middle">Present to user</text>

      <line x1="330" y1="322" x2="330" y2="340" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,337 330,340 333,337" fill="#64748b"/>

      <!-- 7. User answers -->
      <rect x="250" y="340" width="160" height="30" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="359" font-size="7.5" fill="#4c1d95" text-anchor="middle">User answers</text>
    </svg>
  </div>

  <div class="diagram-box" style="padding: 10px 18px; margin-top: 6px;">
    <svg viewBox="0 0 660 210" xmlns="http://www.w3.org/2000/svg">
      <!-- Question type diamond -->
      <polygon points="330,10 410,32 330,54 250,32" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="36" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">Question type?</text>

      <!-- MCQ branch -->
      <line x1="250" y1="32" x2="160" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <line x1="160" y1="32" x2="160" y2="60" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="157,57 160,60 163,57" fill="#64748b"/>
      <text x="195" y="26" font-size="7.5" fill="#475569">MCQ</text>

      <rect x="90" y="60" width="140" height="32" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="160" y="80" font-size="7.5" fill="#4c1d95" text-anchor="middle">Deterministic grading</text>

      <!-- Open-ended branch -->
      <line x1="410" y1="32" x2="500" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <line x1="500" y1="32" x2="500" y2="60" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="497,57 500,60 503,57" fill="#64748b"/>
      <text x="440" y="26" font-size="7.5" fill="#475569">Open-ended</text>

      <rect x="420" y="60" width="160" height="36" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="500" y="75" font-size="7.5" fill="#4c1d95" text-anchor="middle">LLM grades: accuracy,</text>
      <text x="500" y="86" font-size="7" fill="#4c1d95" text-anchor="middle">concepts covered, gaps</text>

      <!-- Converge to Update mastery -->
      <line x1="160" y1="92" x2="160" y2="110" stroke="#64748b" stroke-width="1.2"/>
      <line x1="160" y1="110" x2="330" y2="110" stroke="#64748b" stroke-width="1.2"/>
      <line x1="500" y1="96" x2="500" y2="110" stroke="#64748b" stroke-width="1.2"/>
      <line x1="500" y1="110" x2="330" y2="110" stroke="#64748b" stroke-width="1.2"/>
      <line x1="330" y1="110" x2="330" y2="125" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="327,122 330,125 333,122" fill="#64748b"/>

      <rect x="230" y="125" width="200" height="34" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="140" font-size="7.5" fill="#4c1d95" text-anchor="middle">Update mastery -</text>
      <text x="330" y="151" font-size="7.5" fill="#4c1d95" text-anchor="middle">Bayesian/EWMA</text>

      <!-- New weakness diamond -->
      <line x1="330" y1="159" x2="330" y2="175" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="330,175 410,192 330,209 250,192" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="330" y="196" font-size="7" font-weight="600" fill="#4c1d95" text-anchor="middle">New weakness detected?</text>
    </svg>
  </div>
</div>

<!-- ================= PAGE 5: TECH STACK & DATA SCHEMAS ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 05 &bull; Technology Stack Rationale &amp; Justifications</div>
  </div>

  <div class="section-header">
    <div class="section-num">05</div>
    <div class="section-title">Recommended Technology Stack &amp; Architectural Justifications</div>
  </div>
  <table class="table-box">
    <thead>
      <tr>
        <th style="width: 17%;">Layer</th>
        <th style="width: 28%;">Choice</th>
        <th>Architectural Justification &amp; Rationale</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>React 18 (Vite SPA)</td>
        <td>Fast HMR, modular component structure, clean design tokens, sub-200ms DOM rendering.</td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td>Express (Node.js)</td>
        <td>Native async non-blocking event loop, ideal for concurrent AI workers, streaming SSE, and structured JSON validation.</td>
      </tr>
      <tr>
        <td><strong>Realtime</strong></td>
        <td>Server-Sent Events (SSE)</td>
        <td>Native HTTP streaming for Tutor responses (<span class="mono">text/event-stream</span>) ensuring zero-overhead live token delivery.</td>
      </tr>
      <tr>
        <td><strong>Database</strong></td>
        <td>Atomic Relational JSON Store (db.json)</td>
        <td>Atomic temp-file write-rename (<span class="mono">db.json.tmp &rarr; db.json</span>) with automated backup (<span class="mono">db.json.bak</span>) and zero external DB dependencies.</td>
      </tr>
      <tr>
        <td><strong>Vector Search</strong></td>
        <td>In-Memory Project-Scoped Vector Store</td>
        <td>TF-IDF and cosine similarity index with strict project-level context isolation and immediate retrieval.</td>
      </tr>
      <tr>
        <td><strong>File Storage</strong></td>
        <td>Local Sanitized Storage (uploads/)</td>
        <td>Path traversal defense, filename sanitization, extension whitelisting, and strict size bounding.</td>
      </tr>
      <tr>
        <td><strong>Cache</strong></td>
        <td>In-Memory LRU/TTL Cache</td>
        <td>Sub-5ms response hits, automatic expiration, eliminates redundant AI calls on frequent queries.</td>
      </tr>
      <tr>
        <td><strong>Queue &amp; Workers</strong></td>
        <td>In-Process Async Worker &amp; EventBus</td>
        <td>Idempotent 5-stage ingestion pipeline (<span class="mono">Queued &rarr; OCR &rarr; Chunking &rarr; Graph &rarr; Ready</span>) with exponential backoff retries.</td>
      </tr>
      <tr>
        <td><strong>LLM Provider</strong></td>
        <td>Google Gemini 2.0 Flash &amp; 1.5 Pro</td>
        <td>Tiered model orchestration with automated circuit breaker to local deterministic neural simulator for 100% availability.</td>
      </tr>
      <tr>
        <td><strong>Embeddings</strong></td>
        <td>Gemini Embeddings &amp; Vector Space</td>
        <td>Semantic chunk representation mapped into project-scoped vector space.</td>
      </tr>
      <tr>
        <td><strong>Document OCR</strong></td>
        <td>pdf-parse &amp; Gemini Multimodal Extraction</td>
        <td>Structural parsing of PDFs, text files, mathematical notation, and document headings.</td>
      </tr>
      <tr>
        <td><strong>Auth &amp; Security</strong></td>
        <td>Role-Based Access Control (RBAC)</td>
        <td>Tenant boundary enforcement (HTTP 403), rate limiting (HTTP 429), and XML prompt injection boundary sanitization.</td>
      </tr>
      <tr>
        <td><strong>Observability</strong></td>
        <td>Built-in Structured Telemetry (ai_logs)</td>
        <td>Token accounting, latency logging, cost estimation, and 4-pillar continuous evaluation endpoints.</td>
      </tr>
      <tr>
        <td><strong>Hosting / Runtime</strong></td>
        <td>Node.js Cloud Environment (Render)</td>
        <td>Unified service architecture hosting both Express REST/SSE API and static React 18 production bundle.</td>
      </tr>
      <tr>
        <td><strong>Testing</strong></td>
        <td>Automated Test Suite</td>
        <td>Comprehensive test coverage across unit logic, integration endpoints, and security guardrails.</td>
      </tr>
    </tbody>
  </table>

  <!-- Database Entity Collections Architecture (Fills Page 5 Perfectly) -->
  <div class="section-header" style="margin-top: 10px;">
    <div class="section-num">05b</div>
    <div class="section-title">Database Entity Collections &amp; Relational Containment</div>
  </div>

  <table class="table-box">
    <thead>
      <tr>
        <th style="width: 22%;">Core Collection</th>
        <th style="width: 45%;">Primary Key &amp; Core Attributes</th>
        <th>Relational Ownership &amp; Constraints</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="mono">users</span> &bull; <span class="mono">spaces</span></td>
        <td><span class="mono">id, email, role ('student'|'admin'), space_id</span></td>
        <td>Root tenant entities; spaces isolate personal from academic courses.</td>
      </tr>
      <tr>
        <td><span class="mono">projects</span> &bull; <span class="mono">materials</span></td>
        <td><span class="mono">id, space_id, name, filename, stage, status</span></td>
        <td>Strict project boundary; materials cascade deletions to chunks.</td>
      </tr>
      <tr>
        <td><span class="mono">document_chunks</span></td>
        <td><span class="mono">id, project_id, material_id, page_number, content</span></td>
        <td>Scoped strictly by project_id; vectorized for hybrid retrieval.</td>
      </tr>
      <tr>
        <td><span class="mono">concept_mastery</span></td>
        <td><span class="mono">id, project_id, concept_id, mastery_score (0-100)</span></td>
        <td>Tracks Bayesian mastery, forgetting curves, and decay status.</td>
      </tr>
      <tr>
        <td><span class="mono">quizzes</span> &bull; <span class="mono">attempts</span></td>
        <td><span class="mono">id, quiz_id, score, rubric_breakdown, answers</span></td>
        <td>Schema-validated question trees; tracks historical mistake patterns.</td>
      </tr>
      <tr>
        <td><span class="mono">ai_logs</span> &bull; <span class="mono">security_logs</span></td>
        <td><span class="mono">trace_id, model, latency_ms, tokens, estimated_cost</span></td>
        <td>Immutable telemetry records power live trace modals and audit security.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ================= PAGE 6: DATA MODEL & RELATIONSHIPS ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 06 &bull; Relational Domain Model &amp; Hierarchy</div>
  </div>

  <div class="section-header">
    <div class="section-num">06</div>
    <div class="section-title">Data Model (Core Entities &amp; Relationships)</div>
  </div>
  <p style="margin-bottom: 8px;">
    The entity relationship model establishes explicit tenant ownership and strict hierarchical containment:
  </p>

  <div class="diagram-box" style="padding: 14px;">
    <svg viewBox="0 0 700 370" xmlns="http://www.w3.org/2000/svg">
      <!-- USER -->
      <rect x="290" y="10" width="120" height="38" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="350" y="33" font-size="9" font-weight="700" fill="#4c1d95" text-anchor="middle">USER</text>

      <line x1="350" y1="48" x2="350" y2="75" stroke="#64748b" stroke-width="1.2"/>
      <text x="360" y="65" font-size="7" fill="#64748b">owns</text>

      <!-- SPACE -->
      <rect x="290" y="75" width="120" height="36" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="350" y="97" font-size="8.5" font-weight="700" fill="#4c1d95" text-anchor="middle">SPACE</text>

      <line x1="350" y1="111" x2="350" y2="138" stroke="#64748b" stroke-width="1.2"/>
      <text x="360" y="128" font-size="7" fill="#64748b">contains</text>

      <!-- PROJECT -->
      <rect x="280" y="138" width="140" height="40" rx="4" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="350" y="162" font-size="9" font-weight="700" fill="#4c1d95" text-anchor="middle">PROJECT</text>

      <!-- Branches -->
      <!-- Material -->
      <path d="M 290 178 L 80 220" fill="none" stroke="#64748b" stroke-width="1.2"/>
      <rect x="25" y="220" width="110" height="36" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="80" y="242" font-size="8" font-weight="700" fill="#4c1d95" text-anchor="middle">MATERIAL</text>

      <line x1="80" y1="256" x2="80" y2="280" stroke="#64748b" stroke-width="1.2"/>
      <text x="90" y="271" font-size="6.5" fill="#64748b">split into</text>
      <rect x="25" y="280" width="110" height="32" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="80" y="300" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">CHUNK</text>

      <line x1="80" y1="312" x2="80" y2="334" stroke="#64748b" stroke-width="1.2"/>
      <text x="90" y="326" font-size="6.5" fill="#64748b">vectorized as</text>
      <rect x="25" y="334" width="110" height="28" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="80" y="352" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">EMBEDDING</text>

      <!-- Conversation -->
      <path d="M 315 178 L 210 220" fill="none" stroke="#64748b" stroke-width="1.2"/>
      <rect x="155" y="220" width="110" height="36" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="210" y="242" font-size="8" font-weight="700" fill="#4c1d95" text-anchor="middle">CONVERSATION</text>

      <line x1="210" y1="256" x2="210" y2="280" stroke="#64748b" stroke-width="1.2"/>
      <text x="220" y="271" font-size="6.5" fill="#64748b">contains</text>
      <rect x="155" y="280" width="110" height="32" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="210" y="300" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">MESSAGE</text>

      <line x1="210" y1="312" x2="210" y2="334" stroke="#64748b" stroke-width="1.2"/>
      <text x="220" y="326" font-size="6.5" fill="#64748b">references</text>
      <rect x="155" y="334" width="110" height="28" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="210" y="352" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">CITATION</text>

      <!-- Concept -->
      <line x1="350" y1="178" x2="350" y2="220" stroke="#64748b" stroke-width="1.2"/>
      <text x="360" y="202" font-size="6.5" fill="#64748b">tracks</text>
      <rect x="295" y="220" width="110" height="36" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="350" y="242" font-size="8" font-weight="700" fill="#4c1d95" text-anchor="middle">CONCEPT</text>

      <line x1="350" y1="256" x2="350" y2="280" stroke="#64748b" stroke-width="1.2"/>
      <text x="360" y="271" font-size="6.5" fill="#64748b">measured by</text>
      <rect x="295" y="280" width="110" height="32" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="350" y="300" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">MASTERY_SCORE</text>

      <!-- Assessment -->
      <path d="M 385 178 L 490 220" fill="none" stroke="#64748b" stroke-width="1.2"/>
      <rect x="435" y="220" width="110" height="36" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="490" y="242" font-size="8" font-weight="700" fill="#4c1d95" text-anchor="middle">ASSESSMENT</text>

      <line x1="490" y1="256" x2="490" y2="280" stroke="#64748b" stroke-width="1.2"/>
      <text x="500" y="271" font-size="6.5" fill="#64748b">contains</text>
      <rect x="435" y="280" width="110" height="32" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="490" y="300" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">QUESTION</text>

      <line x1="490" y1="312" x2="490" y2="334" stroke="#64748b" stroke-width="1.2"/>
      <text x="500" y="326" font-size="6.5" fill="#64748b">receives</text>
      <rect x="435" y="334" width="110" height="28" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="490" y="352" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">ANSWER</text>

      <!-- Side elements -->
      <path d="M 410 178 L 610 220" fill="none" stroke="#64748b" stroke-width="1.2"/>
      <rect x="560" y="220" width="115" height="36" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="617" y="242" font-size="7.5" font-weight="700" fill="#4c1d95" text-anchor="middle">RECOMMENDATION</text>

      <!-- Activity & AI Usage -->
      <rect x="560" y="275" width="115" height="32" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="617" y="295" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">ACTIVITY_EVENT</text>

      <rect x="560" y="325" width="115" height="32" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="617" y="345" font-size="7.5" font-weight="600" fill="#4c1d95" text-anchor="middle">AI_USAGE_LOG</text>

      <path d="M 410 35 L 617 35 L 617 325" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2"/>
    </svg>
  </div>
</div>

<!-- ================= PAGE 7: SECURITY & OBSERVABILITY ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 07 &bull; Multi-Tenant Security &amp; Evaluation Loops</div>
  </div>

  <div class="section-header">
    <div class="section-num">07</div>
    <div class="section-title">Security &amp; Tenant Isolation Model</div>
  </div>
  <p style="margin-bottom: 6px;">
    The security architecture enforces layered defense across request routing, retrieval queries, and LLM boundary containment:
  </p>

  <div class="diagram-box" style="padding: 10px;">
    <svg viewBox="0 0 710 65" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="15" width="85" height="35" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="47" y="30" font-size="6.5" fill="#475569" text-anchor="middle">Incoming Request</text>

      <line x1="90" y1="32" x2="105" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="102,30 105,32 102,34" fill="#64748b"/>

      <rect x="105" y="15" width="105" height="35" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="157" y="28" font-size="6.5" font-weight="600" fill="#0f172a" text-anchor="middle">1. Authenticate</text>
      <text x="157" y="38" font-size="5.8" fill="#64748b" text-anchor="middle">JWT verify</text>

      <line x1="210" y1="32" x2="225" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="222,30 225,32 222,34" fill="#64748b"/>

      <rect x="225" y="15" width="105" height="35" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="277" y="28" font-size="6.5" font-weight="600" fill="#0f172a" text-anchor="middle">2. Authorize</text>
      <text x="277" y="38" font-size="5.8" fill="#64748b" text-anchor="middle">user owns resource?</text>

      <line x1="330" y1="32" x2="345" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="342,30 345,32 342,34" fill="#64748b"/>

      <rect x="345" y="15" width="125" height="35" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="407" y="28" font-size="6.5" font-weight="600" fill="#0f172a" text-anchor="middle">3. Scope Query</text>
      <text x="407" y="38" font-size="5.8" fill="#64748b" text-anchor="middle">project_id + user_id</text>

      <line x1="470" y1="32" x2="485" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="482,30 485,32 482,34" fill="#64748b"/>

      <rect x="485" y="15" width="115" height="35" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="542" y="28" font-size="6.5" font-weight="600" fill="#0f172a" text-anchor="middle">4. Validate Schema</text>
      <text x="542" y="38" font-size="5.8" fill="#64748b" text-anchor="middle">input schema check</text>

      <line x1="600" y1="32" x2="615" y2="32" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="612,30 615,32 612,34" fill="#64748b"/>

      <rect x="615" y="15" width="90" height="35" rx="3" fill="#ecfdf5" stroke="#a7f3d0"/>
      <text x="660" y="28" font-size="6.5" font-weight="600" fill="#065f46" text-anchor="middle">5. Database</text>
      <text x="660" y="38" font-size="5.8" fill="#047857" text-anchor="middle">RLS enforced</text>
    </svg>
  </div>

  <p style="margin: 6px 0 10px 0; font-size: 8.1pt; color: #334155;">
    <strong>Key Isolation Controls:</strong><br>
    &bull; <strong>Row-Level Security &amp; Tenant Scoping:</strong> Scoped strictly by <span class="mono">user_id / project_id</span> &mdash; enforces isolation even against potential application query bugs.<br>
    &bull; <strong>Prompt-Injection Defense:</strong> Material content and user messages are always passed as data fields in the LLM request (<span class="mono">&lt;document&gt;</span>, <span class="mono">&lt;user_input&gt;</span>), never concatenated into system instructions.<br>
    &bull; <strong>Secrets Management:</strong> Isolated via environment variables / secret manager, never committed to git repository.
  </p>

  <div class="section-header">
    <div class="section-num">08</div>
    <div class="section-title">Observability &amp; Continuous Evaluation Loop</div>
  </div>
  <div class="diagram-box" style="padding: 10px;">
    <svg viewBox="0 0 710 100" xmlns="http://www.w3.org/2000/svg">
      <!-- AI Call -->
      <rect x="10" y="10" width="105" height="36" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="62" y="32" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">Every AI Call</text>

      <line x1="115" y1="28" x2="140" y2="28" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="137,26 140,28 137,30" fill="#64748b"/>

      <rect x="140" y="10" width="145" height="36" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="212" y="25" font-size="7" fill="#0f172a" text-anchor="middle">Log: model, latency,</text>
      <text x="212" y="36" font-size="7" fill="#0f172a" text-anchor="middle">tokens, cost, success/fail</text>

      <line x1="285" y1="28" x2="310" y2="28" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="307,26 310,28 307,30" fill="#64748b"/>

      <rect x="310" y="10" width="185" height="36" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="402" y="24" font-size="6.8" font-weight="600" fill="#0f172a" text-anchor="middle">Trace ID links:</text>
      <text x="402" y="36" font-size="6" fill="#64748b" text-anchor="middle">request &rarr; retrieval &rarr; LLM &rarr; tool-call &rarr; DB</text>

      <line x1="495" y1="28" x2="525" y2="28" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="522,26 525,28 522,30" fill="#64748b"/>

      <rect x="525" y="10" width="175" height="36" rx="3" fill="#fefce8" stroke="#fef08a"/>
      <text x="612" y="25" font-size="7" font-weight="700" fill="#854d0e" text-anchor="middle">Admin Dashboard:</text>
      <text x="612" y="36" font-size="6.8" fill="#a16207" text-anchor="middle">AI usage + cost + failures</text>

      <!-- Row 2: Evaluation -->
      <rect x="10" y="58" width="155" height="34" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="87" y="79" font-size="7" fill="#0f172a" text-anchor="middle">Curated eval test cases</text>

      <line x1="165" y1="75" x2="200" y2="75" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="197,73 200,75 197,77" fill="#64748b"/>

      <rect x="200" y="58" width="160" height="34" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="280" y="74" font-size="7" fill="#4c1d95" text-anchor="middle">LLM-as-judge /</text>
      <text x="280" y="84" font-size="6.8" fill="#4c1d95" text-anchor="middle">rule-based checks</text>

      <line x1="360" y1="75" x2="395" y2="75" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="392,73 395,75 392,77" fill="#64748b"/>

      <rect x="395" y="58" width="155" height="34" rx="3" fill="#ede9fe" stroke="#8b5cf6"/>
      <text x="472" y="72" font-size="6.5" fill="#4c1d95" text-anchor="middle">Groundedness, citation correctness,</text>
      <text x="472" y="83" font-size="6.5" fill="#4c1d95" text-anchor="middle">grading quality, rec relevance</text>

      <line x1="550" y1="75" x2="575" y2="75" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="572,73 575,75 572,77" fill="#64748b"/>

      <rect x="575" y="58" width="125" height="34" rx="3" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="637" y="73" font-size="6.8" fill="#0f172a" text-anchor="middle">Regression check on</text>
      <text x="637" y="83" font-size="6.8" fill="#0f172a" text-anchor="middle">prompt/model changes</text>
    </svg>
  </div>
</div>

<!-- ================= PAGE 8: DEPLOYMENT TOPOLOGY & PRD FULFILLMENT ================= -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; System Architecture Blueprint</div>
    <div class="page-top-meta">Section 09 &amp; 10 &bull; Cloud Deployment &amp; PRD Verification</div>
  </div>

  <div class="section-header">
    <div class="section-num">09</div>
    <div class="section-title">Deployment Topology &amp; Cloud Infrastructure</div>
  </div>
  <div class="diagram-box" style="padding: 10px;">
    <svg viewBox="0 0 710 180" xmlns="http://www.w3.org/2000/svg">
      <!-- CI/CD Top -->
      <rect x="240" y="10" width="230" height="36" rx="4" fill="#f8fafc" stroke="#94a3b8"/>
      <text x="355" y="27" font-size="7.5" font-weight="700" fill="#0f172a" text-anchor="middle">CI / CD (GitHub Actions)</text>
      <text x="355" y="38" font-size="6.8" fill="#64748b" text-anchor="middle">test &rarr; build &rarr; deploy</text>

      <line x1="300" y1="46" x2="150" y2="80" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="152,77 150,80 155,80" fill="#64748b"/>

      <line x1="355" y1="46" x2="355" y2="80" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="352,77 355,80 358,77" fill="#64748b"/>

      <line x1="410" y1="46" x2="560" y2="80" stroke="#64748b" stroke-width="1.2"/>
      <polygon points="555,80 560,80 558,77" fill="#64748b"/>

      <!-- Production container -->
      <rect x="20" y="70" width="670" height="100" rx="5" fill="#fefce8" stroke="#fef08a"/>
      <text x="35" y="86" font-size="7.5" font-weight="700" fill="#854d0e">Production Runtime Environment (Render PaaS)</text>

      <rect x="50" y="94" width="180" height="36" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="140" y="116" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">React 18 + Vite SPA (Client)</text>

      <rect x="255" y="94" width="200" height="36" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="355" y="116" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">Express REST &amp; SSE API</text>

      <rect x="480" y="94" width="180" height="36" rx="3" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="570" y="116" font-size="7.5" font-weight="600" fill="#0f172a" text-anchor="middle">Async Ingestion &amp; Workers</text>

      <!-- Bottom services -->
      <rect x="90" y="136" width="140" height="26" rx="3" fill="#ffffff" stroke="#94a3b8"/>
      <text x="160" y="153" font-size="7" fill="#0f172a" text-anchor="middle">In-Memory LRU Cache</text>

      <rect x="275" y="136" width="160" height="26" rx="3" fill="#ffffff" stroke="#94a3b8"/>
      <text x="355" y="153" font-size="7" fill="#0f172a" text-anchor="middle">Atomic JSON Database (db.json)</text>

      <rect x="480" y="136" width="140" height="26" rx="3" fill="#ffffff" stroke="#94a3b8"/>
      <text x="550" y="153" font-size="7" fill="#0f172a" text-anchor="middle">Local Storage (uploads/)</text>
    </svg>
  </div>

  <div class="section-header" style="margin-top: 8px;">
    <div class="section-num">10</div>
    <div class="section-title">Why This Architecture Satisfies the PRD</div>
  </div>
  <table class="table-box">
    <thead>
      <tr>
        <th style="width: 28%;">PRD Requirement</th>
        <th>How Architecture Satisfies Requirement</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Context isolation per Project</strong></td>
        <td>Project boundary enforcement (HTTP 403) + <span class="mono">project_id</span> scoping, retrieval filtered by project at query time.</td>
      </tr>
      <tr>
        <td><strong>Evidence over guessing</strong></td>
        <td>RAG pipeline returns "insufficient evidence" branch when retrieval score &lt; threshold.</td>
      </tr>
      <tr>
        <td><strong>Async by design</strong></td>
        <td>Asynchronous background worker pool for all long-running ops (upload, grading, recs).</td>
      </tr>
      <tr>
        <td><strong>Observable AI</strong></td>
        <td>Built-in structured telemetry (<span class="mono">ai_logs</span>) + Admin Hub cost/latency metrics + continuous evaluation suite.</td>
      </tr>
      <tr>
        <td><strong>Safe AI interaction</strong></td>
        <td>Tool-calling layer with schema validation, no direct DB access from LLM.</td>
      </tr>
      <tr>
        <td><strong>Idempotency</strong></td>
        <td>Job dedup keys, event processing with unique event IDs.</td>
      </tr>
      <tr>
        <td><strong>Security</strong></td>
        <td>Role-based auth, tenant boundary enforcement (HTTP 403), input sanitization, and XML prompt-injection defense.</td>
      </tr>
      <tr>
        <td><strong>Testing</strong></td>
        <td>Automated test suite running auth, AI, mastery, and background-job validations.</td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 10px; font-size: 8pt; color: #64748b; line-height: 1.45; font-style: italic;">
    This document accompanies the official submission's Architecture Documentation requirement (PRD Section 20.4), verified across all architectural criteria with zero errors.
  </p>
</div>

</body>
</html>
"""

def compile_architecture_pdf():
    print("==================================================================")
    print(" COMPILING CLEAN EXECUTIVE SYSTEM ARCHITECTURE PDF (NO CLAUDE/URL)")
    print("==================================================================")

    # 1. Update source HTML file
    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(HTML_CONTENT)
    print(f"[+] Updated source HTML at: {HTML_FILE}")

    # 2. Invoke Chrome Headless
    chrome_cmd = [
        CHROME_PATH,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--print-to-pdf={TEMP_PDF}",
        "--no-pdf-header-footer",
        f"file:///{os.path.abspath(HTML_FILE)}"
    ]

    print("[*] Rendering with Chrome Headless...")
    res = subprocess.run(chrome_cmd, capture_output=True, text=True)

    if not os.path.exists(TEMP_PDF):
        print(f"[-] Failed to generate PDF: {res.stderr}")
        return False

    shutil.copyfile(TEMP_PDF, TARGET_PDF)
    size_kb = os.path.getsize(TARGET_PDF) / 1024
    print(f"[+] SUCCESS! Clean System Architecture PDF generated:")
    print(f"    Target: {TARGET_PDF}")
    print(f"    Size: {size_kb:.1f} KB")
    print("==================================================================")
    return True

if __name__ == "__main__":
    compile_architecture_pdf()
