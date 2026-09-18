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
<title>AI Study Companion — Known Limitations &amp; Technical Audit</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

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

  /* Header */
  .page-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
    margin-bottom: 14px;
  }

  .page-top-title {
    font-size: 8pt;
    font-weight: 700;
    color: #b45309;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .page-top-meta {
    font-size: 7.2pt;
    color: #64748b;
  }

  /* Cover */
  .cover-container {
    height: 960px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 32px 28px 24px 28px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
  }

  .brand-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 16px;
  }

  .brand-title {
    font-size: 15pt;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .audit-badge {
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #92400e;
    font-size: 7.6pt;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .cover-title {
    font-size: 26pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin: 20px 0 10px 0;
    letter-spacing: -0.6px;
  }

  .cover-desc {
    font-size: 10pt;
    color: #475569;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .audit-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 3.5px solid #d97706;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 10px;
    page-break-inside: avoid;
  }

  .audit-card-title {
    font-size: 8.8pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .audit-card-title code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.2pt;
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 3px;
    color: #475569;
    font-weight: 500;
  }

  .audit-item {
    font-size: 7.8pt;
    color: #334155;
    line-height: 1.45;
    margin-bottom: 3px;
  }

  .audit-label {
    font-weight: 700;
    color: #0f172a;
  }

  .audit-item.failure {
    color: #991b1b;
  }

  .audit-item.failure .audit-label {
    color: #b91c1c;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 7.8pt;
    page-break-inside: avoid;
  }

  th {
    background: #f1f5f9;
    color: #0f172a;
    text-align: left;
    padding: 7px 10px;
    font-weight: 700;
    border: 1px solid #cbd5e1;
    border-bottom: 2px solid #d97706;
  }

  td {
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
    line-height: 1.4;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  .section-heading {
    font-size: 11pt;
    font-weight: 800;
    color: #0f172a;
    margin: 8px 0 10px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
</head>
<body>

<!-- PAGE 1: COVER & EXECUTIVE AUDIT STATEMENT -->
<div class="page cover-container">
  <div>
    <div class="brand-bar">
      <div class="brand-title">
        <span>AI Study Companion</span>
      </div>
      <div class="audit-badge">PRD Section 20 &bull; Engineering Audit</div>
    </div>

    <div class="cover-title">Known Limitations &amp; Technical Audit</div>
    <div class="cover-desc">
      A candid, unvarnished technical assessment of real architectural constraints, in-memory trade-offs, and failure modes present in the prototype codebase, prepared strictly in accordance with PRD Section 20 (Trade-Offs &amp; Limitations).
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
      <div class="audit-card">
        <div class="audit-card-title">1. Queue Persistence</div>
        <div class="audit-item"><span class="audit-label">Constraint:</span> In-process EventEmitter capped at 2 concurrent jobs.</div>
        <div class="audit-item failure"><span class="audit-label">Failure Mode:</span> Process crash drops all queued jobs from RAM.</div>
      </div>

      <div class="audit-card">
        <div class="audit-card-title">2. Database Concurrency</div>
        <div class="audit-item"><span class="audit-label">Constraint:</span> Single-writer in-memory cache flushed to local db.json.</div>
        <div class="audit-item failure"><span class="audit-label">Failure Mode:</span> Horizontal multi-container scaling causes file divergence.</div>
      </div>

      <div class="audit-card">
        <div class="audit-card-title">3. Vector Dimension</div>
        <div class="audit-item"><span class="audit-label">Constraint:</span> 128-dim subword polynomial hashing with linear project scan.</div>
        <div class="audit-item failure"><span class="audit-label">Failure Mode:</span> Missing deep cross-lingual semantic transfer.</div>
      </div>

      <div class="audit-card">
        <div class="audit-card-title">4. Document Parsing</div>
        <div class="audit-item"><span class="audit-label">Constraint:</span> Standard pdf-parse text stream without native OCR binary.</div>
        <div class="audit-item failure"><span class="audit-label">Failure Mode:</span> Scanned image pages and photographed notes produce empty text.</div>
      </div>
    </div>
  </div>

  <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; font-size: 8pt; color: #475569; line-height: 1.5;">
    <strong>Self-Assessment Philosophy:</strong> Rather than framing prototype constraints as production achievements, this audit documents the exact line-of-code trade-offs made during a rapid development sprint to guarantee zero-installation portability across local developer laptops.
  </div>
</div>

<!-- PAGE 2: SUBSYSTEM DETAILED AUDIT -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; Technical Audit</div>
    <div class="page-top-meta">Section 01 &bull; Subsystems 1.1 to 1.6</div>
  </div>

  <div class="section-heading">Subsystem-by-Subsystem Engineering Audit</div>

  <!-- 1. Queue -->
  <div class="audit-card">
    <div class="audit-card-title">
      <span>1. Asynchronous Background Queue</span>
      <code>server/services/backgroundQueue.js</code>
    </div>
    <div class="audit-item"><span class="audit-label">Real Constraint:</span> Background tasks execute via an in-memory Node.js <code>EventEmitter</code> with concurrency limited strictly to 2 active jobs.</div>
    <div class="audit-item"><span class="audit-label">Current Workaround:</span> Pipeline stage transitions persist to <code>db.json</code>, enabling manual re-queueing via the <code>/api/queue/:id/retry</code> REST endpoint.</div>
    <div class="audit-item failure"><span class="audit-label">Production Failure Mode:</span> Server restarts or container sleep cycles drop all in-flight and pending jobs from volatile RAM.</div>
  </div>

  <!-- 2. Database -->
  <div class="audit-card">
    <div class="audit-card-title">
      <span>2. Single-Process JSON Database</span>
      <code>server/db.js</code>
    </div>
    <div class="audit-item"><span class="audit-label">Real Constraint:</span> State is held in Node.js process memory and flushed synchronously to a single <code>db.json</code> file on the local filesystem.</div>
    <div class="audit-item"><span class="audit-label">Current Workaround:</span> Writes use an atomic temporary file rename (<code>db.json.tmp</code> &rarr; <code>db.json</code>) with <code>.bak</code> recovery on startup, plus fire-and-forget MongoDB Atlas sync.</div>
    <div class="audit-item failure"><span class="audit-label">Production Failure Mode:</span> Deploying multiple container replicas behind a load balancer will result in split-brain data divergence without distributed locks.</div>
  </div>

  <!-- 3. Vector Engine -->
  <div class="audit-card">
    <div class="audit-card-title">
      <span>3. Lexical Subword Feature Hashing Vector Store</span>
      <code>server/services/faissVectorStore.js</code>
    </div>
    <div class="audit-item"><span class="audit-label">Real Constraint:</span> Embeddings are generated using 128-dimensional character n-gram polynomial feature hashing rather than a deep dense transformer model.</div>
    <div class="audit-item"><span class="audit-label">Current Workaround:</span> Vectors are strictly partitioned by project ID and searched via linear cosine similarity scan with typo-tolerant character 3-grams.</div>
    <div class="audit-item failure"><span class="audit-label">Production Failure Mode:</span> The vectorizer cannot detect cross-lingual semantics or abstract conceptual paraphrasing across large multi-thousand document libraries without an HNSW index.</div>
  </div>

  <!-- 4. Document OCR -->
  <div class="audit-card">
    <div class="audit-card-title">
      <span>4. Heuristic Document &amp; PDF Parsing</span>
      <code>server/services/documentProcessor.js</code>
    </div>
    <div class="audit-item"><span class="audit-label">Real Constraint:</span> Document ingestion relies on <code>pdf-parse</code> and regular expressions without an embedded native vision OCR engine.</div>
    <div class="audit-item"><span class="audit-label">Current Workaround:</span> Corrupted PDF streams fall back to latin1 string decoding, and dynamic concept heuristics generate baseline topics if headers are missing.</div>
    <div class="audit-item failure"><span class="audit-label">Production Failure Mode:</span> Scanned image PDFs, camera photos of textbook pages, and complex LaTeX equations cannot be extracted and produce empty chunks.</div>
  </div>

  <!-- 5. File Storage -->
  <div class="audit-card">
    <div class="audit-card-title">
      <span>5. Local Container File Storage</span>
      <code>server/uploads/</code>
    </div>
    <div class="audit-item"><span class="audit-label">Real Constraint:</span> Uploaded student files are stored on the server's local container hard disk under <code>uploads/</code>.</div>
    <div class="audit-item"><span class="audit-label">Current Workaround:</span> File uploads are restricted to 25MB with sanitized timestamp filenames and path traversal validation.</div>
    <div class="audit-item failure"><span class="audit-label">Production Failure Mode:</span> Deploying to ephemeral container tiers (Render free tier or serverless hosts) wipes uploaded documents on every container restart or rebuild.</div>
  </div>

  <!-- 6. Auth & OTP -->
  <div class="audit-card">
    <div class="audit-card-title">
      <span>6. In-Memory Session &amp; OTP Store</span>
      <code>server/middleware/authMiddleware.js</code>
    </div>
    <div class="audit-item"><span class="audit-label">Real Constraint:</span> OTP verification codes and user sessions are held in process memory (<code>this.otpStore = new Map()</code>) and header bearer tokens.</div>
    <div class="audit-item"><span class="audit-label">Current Workaround:</span> OTPs expire after 10 minutes with brute-force lockouts after 5 failed attempts, while project access checks block cross-tenant breaches with HTTP 403.</div>
    <div class="audit-item failure"><span class="audit-label">Production Failure Mode:</span> Server restarts invalidate all pending login OTPs, and the absence of asymmetric RS256 JWTs prevents stateless multi-node session validation.</div>
  </div>
</div>

<!-- PAGE 3: SUMMARY AUDIT MATRIX -->
<div class="page">
  <div class="page-top-bar">
    <div class="page-top-title">AI Study Companion &bull; Technical Audit</div>
    <div class="page-top-meta">Section 02 &bull; Audit Matrix &amp; Runtime Constraints</div>
  </div>

  <div class="section-heading">Subsystem Audit Matrix</div>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Subsystem &amp; Location</th>
        <th style="width: 38%;">Exact Code Constraint</th>
        <th>Production Scaling Failure Mode</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Background Queue</strong><br><span style="font-size: 7pt; color: #64748b;">backgroundQueue.js</span></td>
        <td>In-process Node.js <code>EventEmitter</code> with concurrency cap of 2</td>
        <td>Process restart or crash drops all in-flight and pending queue jobs from RAM</td>
      </tr>
      <tr>
        <td><strong>Database Persistence</strong><br><span style="font-size: 7pt; color: #64748b;">server/db.js</span></td>
        <td>Single-writer in-memory JSON cache synchronously written to <code>db.json</code></td>
        <td>Multi-container deployments overwrite local files and cause database split-brain</td>
      </tr>
      <tr>
        <td><strong>Vector Retrieval</strong><br><span style="font-size: 7pt; color: #64748b;">faissVectorStore.js</span></td>
        <td>128-dimensional dense n-gram polynomial subword feature hashing</td>
        <td>Linear scan scales $O(N)$ across chunks; misses deep cross-lingual semantic transfer</td>
      </tr>
      <tr>
        <td><strong>Document Parsing</strong><br><span style="font-size: 7pt; color: #64748b;">documentProcessor.js</span></td>
        <td>Standard <code>pdf-parse</code> and Word regex without native OCR binary</td>
        <td>Scanned image PDFs and camera-captured notes fail extraction and produce blank text</td>
      </tr>
      <tr>
        <td><strong>File Storage</strong><br><span style="font-size: 7pt; color: #64748b;">server/uploads/</span></td>
        <td>Local container filesystem volume with 25MB upload limit</td>
        <td>Ephemeral cloud container rebuilds wipe uploaded course documents</td>
      </tr>
      <tr>
        <td><strong>Authentication</strong><br><span style="font-size: 7pt; color: #64748b;">authMiddleware.js</span></td>
        <td>Header bearer tokens + in-memory OTP <code>Map</code> without signed RS256 JWTs</td>
        <td>Process restart invalidates pending OTPs; cannot coordinate across API replicas</td>
      </tr>
      <tr>
        <td><strong>Rate Limiter &amp; Cache</strong><br><span style="font-size: 7pt; color: #64748b;">rateLimiter.js / cache</span></td>
        <td>Process RAM sliding window (150 req/min) and 200-entry response cache</td>
        <td>Process restart resets client request quotas and clears cached AI responses</td>
      </tr>
      <tr>
        <td><strong>AI Fallback Simulator</strong><br><span style="font-size: 7pt; color: #64748b;">aiProvider.js</span></td>
        <td>Rule-based pedagogical algorithms and regex heuristics (no local LLM)</td>
        <td>Cannot synthesize novel explanatory analogies beyond retrieved document sentences</td>
      </tr>
    </tbody>
  </table>

  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-top: 14px;">
    <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-bottom: 4px;">Auditor Evaluation Summary:</div>
    <p style="font-size: 7.9pt; color: #475569; line-height: 1.45;">
      Every architectural trade-off was selected deliberately to eliminate external infrastructure friction (such as managed Redis clusters, paid vector DB subscriptions, and distributed file stores) while enabling full evaluation of all PRD-mandated user journeys, cross-tenant isolation checks, and RAG retrieval pipelines within a self-contained environment.
    </p>
  </div>
</div>

</body>
</html>
"""

def compile_limitations_pdf():
    print("==================================================================")
    print(" COMPILING HONEST AUDIT KNOWN LIMITATIONS PDF (3-PAGE AUDIT FORMAT)")
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
    print(f"[+] SUCCESS! Known Limitations Audit PDF generated:")
    print(f"    Path: {TARGET_PDF}")
    print(f"    Size: {size_kb:.1f} KB")
    print("==================================================================")
    return True

if __name__ == "__main__":
    compile_limitations_pdf()
