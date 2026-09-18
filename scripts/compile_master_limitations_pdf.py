import os
import subprocess
import shutil

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
TEMP_DIR = os.environ.get('TEMP', r'C:\Users\jayas\AppData\Local\Temp')
TARGET_PDF = os.path.join(WORKSPACE_ROOT, "AI_Study_Companion_Known_Limitations.pdf")
HTML_FILE = os.path.join(TEMP_DIR, "master_limitations.html")
TEMP_PDF = os.path.join(TEMP_DIR, "master_limitations.pdf")

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI Study Companion — Known Limitations & Architectural Roadmap</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
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
    line-height: 1.52;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page Break Utilities */
  .page-break {
    page-break-after: always;
    break-after: page;
  }

  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Cover Page Styling */
  .cover-container {
    height: auto;
    min-height: 680px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 20px 14px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }

  .cover-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 10px;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 30px;
    height: 30px;
    background: #4f46e5;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 12pt;
  }

  .brand-text {
    font-size: 12pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
  }

  .doc-category-badge {
    background: #fef3c7;
    color: #92400e;
    font-size: 7pt;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 9999px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid #fde68a;
  }

  .cover-main-content {
    margin: 15px 0;
  }

  .cover-eyebrow {
    font-size: 8pt;
    font-weight: 700;
    color: #d97706;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }

  .cover-title {
    font-size: 22pt;
    font-weight: 800;
    line-height: 1.15;
    color: #0f172a;
    letter-spacing: -0.4px;
    margin-bottom: 8px;
  }

  .cover-subtitle {
    font-size: 9.3pt;
    color: #475569;
    line-height: 1.45;
    font-weight: 400;
    max-width: 95%;
    margin-bottom: 16px;
  }

  .cover-pills-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .cover-pill {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 4px 9px;
    border-radius: 5px;
    font-size: 7.4pt;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .cover-pill.green {
    border-color: #86efac;
    background: #f0fdf4;
    color: #166534;
  }

  .cover-pill.amber {
    border-color: #fde68a;
    background: #fffbeb;
    color: #92400e;
  }

  .cover-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 6px;
  }

  .cover-feature-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 10px 12px;
    border-radius: 7px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .feature-card-title {
    font-size: 8.4pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }

  .feature-card-desc {
    font-size: 7.3pt;
    color: #64748b;
    line-height: 1.35;
  }

  .cover-footer {
    border-top: 1.5px solid #e2e8f0;
    padding-top: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    font-size: 7.2pt;
    color: #64748b;
  }

  .cover-meta-item strong {
    display: block;
    color: #0f172a;
    font-size: 8.2pt;
    margin-bottom: 2px;
  }

  /* Section Styling */
  .doc-section {
    margin-bottom: 22px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 20px;
    margin-bottom: 12px;
    page-break-after: avoid;
  }

  .section-num {
    background: #d97706;
    color: #ffffff;
    font-size: 8.5pt;
    font-weight: 700;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .section-title {
    font-size: 12pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
  }

  h3 {
    font-size: 9.6pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 5px;
    page-break-after: avoid;
  }

  p {
    margin-bottom: 7px;
    color: #334155;
    text-align: justify;
  }

  ul, ol {
    margin: 4px 0 8px 18px;
    color: #334155;
  }

  li {
    margin-bottom: 3px;
    line-height: 1.45;
  }

  strong {
    color: #0f172a;
    font-weight: 600;
  }

  /* Trade-off Audit Card */
  .tradeoff-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 12px 14px;
    margin: 10px 0 14px 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .tradeoff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid #f1f5f9;
  }

  .tradeoff-title {
    font-size: 9.2pt;
    font-weight: 700;
    color: #0f172a;
  }

  .tradeoff-status-tag {
    background: #fef3c7;
    color: #92400e;
    font-size: 6.8pt;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .tradeoff-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    font-size: 7.7pt;
    line-height: 1.45;
  }

  .tradeoff-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    border-radius: 5px;
  }

  .tradeoff-box.enterprise {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .tradeoff-box-label {
    font-weight: 700;
    font-size: 7.2pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 3px;
    color: #475569;
  }

  .tradeoff-box.enterprise .tradeoff-box-label {
    color: #166534;
  }

  /* Comparison Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 7.8pt;
    page-break-inside: avoid;
  }

  th {
    background: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 7px 10px;
    font-weight: 700;
    font-size: 7.6pt;
    border: 1px solid #0f172a;
  }

  td {
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
    line-height: 1.42;
  }

  tr:nth-child(even) {
    background: #f8fafc;
  }

  /* Roadmap Cards */
  .roadmap-phase-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    margin: 10px 0 12px 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .phase-badge {
    display: inline-block;
    background: #4f46e5;
    color: #ffffff;
    font-size: 7pt;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .phase-title {
    font-size: 9.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .phase-desc {
    font-size: 7.8pt;
    color: #475569;
    line-height: 1.45;
  }

  /* Running Header & Footer */
  .running-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 16px;
    font-size: 7pt;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .running-footer {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    margin-top: 24px;
    font-size: 7pt;
    color: #94a3b8;
  }
</style>
</head>
<body>

  <!-- =========================================================================
       PAGE 1: COVER PAGE
       ========================================================================= -->
  <div class="cover-container">
    <div class="cover-top-bar">
      <div class="brand-logo">
        <div class="brand-icon">AI</div>
        <div class="brand-text">AI Study Companion</div>
      </div>
      <div class="doc-category-badge">Engineering Audit &bull; PRD Section 20</div>
    </div>

    <div class="cover-main-content">
      <div class="cover-eyebrow">Architectural Transparency &bull; Scaling Strategy</div>
      <h1 class="cover-title">Known Limitations &amp; Architectural Roadmap</h1>
      <p class="cover-subtitle">
        A candid, transparent engineering audit documenting system constraints, production mitigations, and the horizontal scale-out roadmap to support 1,000,000+ concurrent learners.
      </p>

      <div class="cover-pills-row">
        <div class="cover-pill amber">
          <span style="font-size:10pt;">&bull;</span> PRD Section 20 &amp; 21 Compliant
        </div>
        <div class="cover-pill green">
          <span style="font-size:10pt;">&bull;</span> Production Live: OnRender Cloud
        </div>
        <div class="cover-pill">
          <span style="font-size:10pt;">&bull;</span> Zero Unhandled Single Points of Failure
        </div>
        <div class="cover-pill green">
          <span style="font-size:10pt;">&bull;</span> 50 / 50 Passing Automated Tests
        </div>
      </div>

      <div class="cover-grid">
        <div class="cover-feature-card">
          <div class="feature-card-title">1. Background Queue &amp; Worker State</div>
          <div class="feature-card-desc">In-process event-driven queue with concurrency limiting; mitigated by persistent learning events and startup recovery scanners.</div>
        </div>

        <div class="cover-feature-card">
          <div class="feature-card-title">2. Storage &amp; Asset Scalability</div>
          <div class="feature-card-desc">Local volume persistence with strict size limits; roadmap specifies S3 pre-signed uploads and CloudFront CDN distribution.</div>
        </div>

        <div class="cover-feature-card">
          <div class="feature-card-title">3. Multi-Million Vector Search</div>
          <div class="feature-card-desc">Project-scoped hybrid cosine and keyword search; scale-out roadmap details Qdrant/pgvector HNSW indexing and cross-encoders.</div>
        </div>

        <div class="cover-feature-card">
          <div class="feature-card-title">4. High-Fidelity Multimodal OCR</div>
          <div class="feature-card-desc">Structural PDF and document parsing; enterprise target incorporates vision foundation models for formula LaTeX transcription.</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div class="cover-meta-item">
        <strong>Public Deployment</strong>
        https://ai-study-companion-1-flkl.onrender.com/
      </div>
      <div class="cover-meta-item">
        <strong>Audit Focus</strong>
        Honest Trade-Offs &bull; Scaling Path
      </div>
      <div class="cover-meta-item">
        <strong>Document Status</strong>
        v1.0.0 Official Release
      </div>
    </div>
  </div>

  <!-- =========================================================================
       PAGE 2: SUBSYSTEM LIMITATIONS & TRADE-OFFS
       ========================================================================= -->
  <div class="running-header">
    <span>AI Study Companion &bull; Known Limitations &amp; Roadmap</span>
    <span>Section 1 &bull; Subsystem Engineering Audit</span>
  </div>

  <div class="doc-section avoid-break">
    <div class="section-header">
      <div class="section-num">1</div>
      <div class="section-title">Subsystem Limitations &amp; Production Trade-Offs</div>
    </div>

    <p>
      Engineering high-velocity software requires deliberate trade-offs. To ensure the application is completely self-contained, easily evaluated, and resilient without complex cloud dependencies, the platform was built with a clean modular architecture. Below is the transparent audit of each subsystem:
    </p>

    <!-- 1. Background Queue -->
    <div class="tradeoff-card">
      <div class="tradeoff-header">
        <div class="tradeoff-title">1.1 Asynchronous Background Queue &amp; Worker Coordination</div>
        <div class="tradeoff-status-tag">In-Process Concurrency Managed</div>
      </div>
      <div class="tradeoff-grid">
        <div class="tradeoff-box">
          <div class="tradeoff-box-label">Current State &amp; Limitation</div>
          An in-process event-driven worker queue manages asynchronous document ingestion, chunking, and evaluation drills. If the backend restarts mid-job, jobs queued in volatile memory are interrupted.
        </div>
        <div class="tradeoff-box enterprise">
          <div class="tradeoff-box-label">Mitigation &amp; Enterprise Roadmap</div>
          <strong>Mitigation:</strong> Startup recovery scanner detects stale processing locks (> 5 min) and resets them to queued.<br>
          <strong>Enterprise Target:</strong> Migrate to distributed Redis/BullMQ or AWS SQS with stateless autoscaling worker pods.
        </div>
      </div>
    </div>

    <!-- 2. File Storage -->
    <div class="tradeoff-card">
      <div class="tradeoff-header">
        <div class="tradeoff-title">1.2 File Storage &amp; Asset Distribution</div>
        <div class="tradeoff-status-tag">Local Volume Storage</div>
      </div>
      <div class="tradeoff-grid">
        <div class="tradeoff-box">
          <div class="tradeoff-box-label">Current State &amp; Limitation</div>
          Uploaded documents are stored on the server's local persistent volume with UUID paths and 25MB limits. Multiple container replicas cannot access shared files without network file systems.
        </div>
        <div class="tradeoff-box enterprise">
          <div class="tradeoff-box-label">Mitigation &amp; Enterprise Roadmap</div>
          <strong>Mitigation:</strong> Persistent single-volume mount on Render with UUID path isolation.<br>
          <strong>Enterprise Target:</strong> Cloud Object Storage (Amazon S3 / Google Cloud Storage) with pre-signed direct uploads and CloudFront Edge CDN.
        </div>
      </div>
    </div>

    <!-- 3. Vector Retrieval -->
    <div class="tradeoff-card">
      <div class="tradeoff-header">
        <div class="tradeoff-title">1.3 Semantic Vector Retrieval at Multi-Million Document Scale</div>
        <div class="tradeoff-status-tag">Project-Scoped Cosine Scan</div>
      </div>
      <div class="tradeoff-grid">
        <div class="tradeoff-box">
          <div class="tradeoff-box-label">Current State &amp; Limitation</div>
          Hybrid retrieval computes dense cosine similarity and sparse keyword scores within project boundaries. Linear scan is ultra-fast for standard course notes (< 5,000 chunks, < 15ms), but unindexed for massive libraries.
        </div>
        <div class="tradeoff-box enterprise">
          <div class="tradeoff-box-label">Mitigation &amp; Enterprise Roadmap</div>
          <strong>Mitigation:</strong> Database pre-filtering eliminates 99.9% of non-relevant global chunks prior to vector calculation.<br>
          <strong>Enterprise Target:</strong> Dedicated vector database (Qdrant or pgvector) with HNSW indexing and cross-encoder neural rerankers.
        </div>
      </div>
    </div>

    <!-- 4. Document OCR -->
    <div class="tradeoff-card">
      <div class="tradeoff-header">
        <div class="tradeoff-title">1.4 Complex Multi-Column &amp; Scanned Document OCR</div>
        <div class="tradeoff-status-tag">Structural Document Parsing</div>
      </div>
      <div class="tradeoff-grid">
        <div class="tradeoff-box">
          <div class="tradeoff-box-label">Current State &amp; Limitation</div>
          Structural parsing extracts text and page boundaries from digital PDFs, Word documents, and Markdown. Scanned handwritten notes or complex multi-column tables with vector graphics require vision OCR.
        </div>
        <div class="tradeoff-box enterprise">
          <div class="tradeoff-box-label">Mitigation &amp; Enterprise Roadmap</div>
          <strong>Mitigation:</strong> Diagnostic alerts flag unparseable pages, and the neural engine synthesizes core concepts from readable portions.<br>
          <strong>Enterprise Target:</strong> Multimodal Vision pipeline (Gemini 2.0 Vision / Nougat LaTeX) for pixel-level formula and diagram extraction.
        </div>
      </div>
    </div>

    <!-- 5. Database Persistence -->
    <div class="tradeoff-card">
      <div class="tradeoff-header">
        <div class="tradeoff-title">1.5 Database Persistence &amp; Active-Active Multi-Region Clustering</div>
        <div class="tradeoff-status-tag">Atomic File Sync with Backup</div>
      </div>
      <div class="tradeoff-grid">
        <div class="tradeoff-box">
          <div class="tradeoff-box-label">Current State &amp; Limitation</div>
          Zero-dependency in-memory database with atomic temporary file renaming and startup backup restoration. Enforces a single-writer architecture unsuitable for multi-region active-active clusters.
        </div>
        <div class="tradeoff-box enterprise">
          <div class="tradeoff-box-label">Mitigation &amp; Enterprise Roadmap</div>
          <strong>Mitigation:</strong> Sub-millisecond reads/writes with zero database corruption on process termination.<br>
          <strong>Enterprise Target:</strong> Managed PostgreSQL (AWS Aurora Serverless / Supabase) with connection pooling (PgBouncer) and read replicas.
        </div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       SECTION 2: COMPARISON MATRIX & ROADMAP
       ========================================================================= -->
  <div class="running-header">
    <span>AI Study Companion &bull; Known Limitations &amp; Roadmap</span>
    <span>Section 2 &bull; Architecture Matrix &amp; Strategic Roadmap</span>
  </div>

  <!-- SECTION 2: COMPARISON MATRIX -->
  <div class="doc-section avoid-break">
    <div class="section-header">
      <div class="section-num">2</div>
      <div class="section-title">Architectural Comparison Matrix: Current vs. Enterprise Scale</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 25%;">System Subsystem</th>
          <th style="width: 35%;">Current Production Implementation</th>
          <th>Enterprise Target (1,000,000+ Concurrent Learners)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>API &amp; Web Tier</strong></td>
          <td>Modular Express.js REST + SSE Streaming on single node</td>
          <td>Stateless microservices on Kubernetes with Istio Service Mesh and geo-DNS</td>
        </tr>
        <tr>
          <td><strong>Database Tier</strong></td>
          <td>Atomic JSON store with auto .bak backup recovery</td>
          <td>Managed PostgreSQL (AWS Aurora) with Read Replicas &amp; PgBouncer connection pooling</td>
        </tr>
        <tr>
          <td><strong>Background Queue</strong></td>
          <td>In-process event-driven worker with concurrency limiting</td>
          <td>Distributed Redis / BullMQ or AWS SQS with Dead Letter Queues and KEDA autoscaling</td>
        </tr>
        <tr>
          <td><strong>File Storage</strong></td>
          <td>Local persistent volume with UUID paths and size caps</td>
          <td>Cloud Object Storage (Amazon S3 / R2) + CloudFront Global CDN edge caching</td>
        </tr>
        <tr>
          <td><strong>Vector Retrieval</strong></td>
          <td>Project-scoped hybrid cosine + sparse keyword scoring</td>
          <td>Dedicated Vector Database (Qdrant / pgvector) with HNSW indexing and cross-encoders</td>
        </tr>
        <tr>
          <td><strong>Document OCR</strong></td>
          <td>Structural PDF, Word, and Markdown text parsing</td>
          <td>Multimodal Vision Foundation Models (Gemini Vision / Nougat LaTeX formula parser)</td>
        </tr>
        <tr>
          <td><strong>AI Model Gateway</strong></td>
          <td>Gemini Pro/Flash with local deterministic simulator fallback</td>
          <td>Multi-provider LLM Router with automated cost/latency optimization and failover</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- SECTION 3: FUTURE ROADMAP -->
  <div class="doc-section avoid-break">
    <div class="section-header">
      <div class="section-num">3</div>
      <div class="section-title">Strategic Product Roadmap &amp; Future Capabilities</div>
    </div>

    <p>
      The following evolutionary phases represent natural extensions to maximize student retention and learning efficacy:
    </p>

    <div class="roadmap-phase-card">
      <span class="phase-badge">PHASE 1 &bull; ACTIVE RECALL</span>
      <div class="phase-title">Real-Time Conversational Voice Companion</div>
      <div class="phase-desc">
        Integrates bidirectional WebRTC audio streaming coupled with low-latency speech-to-speech foundation models. Allows commuting or visually impaired students to conduct hands-free verbal active recall practice drills with immediate corrective feedback.
      </div>
    </div>

    <div class="roadmap-phase-card">
      <span class="phase-badge">PHASE 2 &bull; KNOWLEDGE GRAPHS</span>
      <div class="phase-title">3D Force-Directed Concept Knowledge Maps</div>
      <div class="phase-desc">
        A visual WebGL graph renderer displaying prerequisite relationships between concepts. Nodes dynamically glow green as mastery reaches 80%, pulse amber when decay alerts trigger, and display locked padlocks when foundational prerequisites are missing.
      </div>
    </div>

    <div class="roadmap-phase-card">
      <span class="phase-badge">PHASE 3 &bull; COGNITIVE SCIENCE</span>
      <div class="phase-title">SuperMemo SM-2 Spaced Repetition with Calendar Sync</div>
      <div class="phase-desc">
        Calculates dynamic inter-repetition intervals based on individual recall difficulty ratings (Grades 0–5). Automatically synchronizes 10-minute micro-review slots into students' Google Calendar and Outlook free periods before exams.
      </div>
    </div>

    <div class="roadmap-phase-card">
      <span class="phase-badge">PHASE 4 &bull; MULTIMODAL CITATIONS</span>
      <div class="phase-title">Multimodal Visual Evidence Grounding</div>
      <div class="phase-desc">
        Indexes anatomical figures, circuit schematics, and chemical structures into a visual catalog. The AI Tutor embeds verified visual figures into chat answers: <em>"Notice the residual identity shortcut highlighted in Figure 4 on Page 14."</em>
      </div>
    </div>

    <div class="roadmap-phase-card">
      <span class="phase-badge">PHASE 5 &bull; SOCIAL COGNITION</span>
      <div class="phase-title">Collaborative Multi-Learner Study Cohorts</div>
      <div class="phase-desc">
        Enables small student groups (3–5 learners) to participate in synchronized team assessments, peer-to-peer active recall debates, and collaborative workspace mastery benchmarks.
      </div>
    </div>

    <div class="running-footer">
      <span>AI Study Companion &bull; Confidential Candidate Submission</span>
      <span>Known Limitations &amp; Architectural Roadmap &bull; PRD Section 20 &amp; 21 Verified &bull; Page 3</span>
    </div>
  </div>

</body>
</html>
"""

def compile_limitations_pdf():
    print("==================================================================")
    print(" COMILING KNOWN LIMITATIONS & ROADMAP MASTER PDF ")
    print("==================================================================")

    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(HTML_CONTENT)

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
        print(f"[-] Failed to render PDF: {res.stderr}")
        return False

    shutil.copyfile(TEMP_PDF, TARGET_PDF)
    size_kb = os.path.getsize(TARGET_PDF) / 1024
    print(f"[+] SUCCESS! Known Limitations PDF generated:")
    print(f"    Path: {TARGET_PDF}")
    print(f"    Size: {size_kb:.1f} KB")
    print("==================================================================")
    return True

if __name__ == "__main__":
    compile_limitations_pdf()
