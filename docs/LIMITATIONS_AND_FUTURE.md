# Known Limitations & Technical Audit

This document provides a candid engineering audit of the technical constraints and trade-offs present in the **AI Study Companion** codebase, in direct compliance with PRD Section 20.

---

### 1. In-Process Background Job Queue (`server/services/backgroundQueue.js`)
- **Real Constraint:** Background jobs run on an in-memory Node.js `EventEmitter` capped at 2 concurrent tasks.
- **Current Workaround:** Job state is written to `db.json` and `learning_events`, allowing manual re-queueing via `/api/queue/:id/retry`.
- **Production Failure Mode:** A container restart or crash drops all in-flight and pending queue items from volatile RAM.

---

### 2. Single-Process JSON File Database (`server/db.js`)
- **Real Constraint:** Data is held in a Node.js memory cache and flushed synchronously to a single `db.json` file on disk.
- **Current Workaround:** Writes use an atomic temporary file rename (`db.json.tmp` → `db.json`) with `.bak` recovery on startup, alongside optional fire-and-forget MongoDB replication.
- **Production Failure Mode:** Multiple container replicas behind a load balancer will overwrite each other's files and diverge without a shared distributed database.

---

### 3. Lexical Subword Feature Hashing Vector Store (`server/services/faissVectorStore.js`)
- **Real Constraint:** Embeddings are generated using 128-dimensional character n-gram polynomial hashing rather than a deep dense transformer model.
- **Current Workaround:** Chunks are pre-filtered strictly by project ID and searched via linear cosine similarity scan with typo-tolerant character 3-grams.
- **Production Failure Mode:** The vectorizer cannot detect cross-lingual semantics or abstract conceptual paraphrasing across large multi-thousand document libraries without an Approximate Nearest Neighbor (ANN) index.

---

### 4. Heuristic Document & PDF Parsing (`server/services/documentProcessor.js`)
- **Real Constraint:** Document extraction relies on `pdf-parse` and regular expressions without an embedded native OCR engine.
- **Current Workaround:** Unparseable PDF streams fall back to latin1 string extraction, and dynamic concept heuristics generate baseline topics if headers are missing.
- **Production Failure Mode:** Scanned image PDFs, photographed pages, and complex mathematical formulas cannot be extracted and result in blank or fragmented chunks.

---

### 5. Local Container File Storage (`server/routes/api.js` & `server/uploads/`)
- **Real Constraint:** Uploaded student files are stored on the local container filesystem under `uploads/`.
- **Current Workaround:** File sizes are restricted to 25MB with sanitized timestamps and path traversal checks.
- **Production Failure Mode:** Deploying to ephemeral cloud container tiers (e.g. Render free tier or serverless hosts) wipes uploaded documents on every restart or rebuild.

---

### 6. In-Memory Session & OTP Store (`server/middleware/authMiddleware.js`, `server/services/emailService.js`)
- **Real Constraint:** OTP verification codes and user sessions are stored in process RAM (`this.otpStore = new Map()`) and header bearer tokens.
- **Current Workaround:** Codes expire after 10 minutes with brute-force lockouts after 5 failed attempts, while cross-tenant checks block unauthorized project access with HTTP 403.
- **Production Failure Mode:** Server restarts invalidate all pending login OTPs, and the absence of signed asymmetric JWTs (RS256) prevents stateless multi-server session validation.

---

### 7. Process-Local Rate Limiting & Response Cache (`server/middleware/rateLimiter.js`, `server/services/cacheService.js`)
- **Real Constraint:** Rate-limiting token buckets (150 req/min) and the 200-entry AI response cache reside in Node.js process memory.
- **Current Workaround:** An in-memory sliding window throttles requests with HTTP 429 Retry-After headers, and an LRU eviction policy tracks token savings.
- **Production Failure Mode:** Restarting the process wipes cached responses and resets client request quotas, and multiple server instances cannot coordinate rate limits without Redis.

---

### 8. Algorithmic Fallback Simulator vs. Local Model Execution (`server/services/aiProvider.js`, `server/services/quizEngine.js`)
- **Real Constraint:** When external Gemini API quotas are exhausted or offline, the fallback engine uses deterministic pedagogical algorithms and regex heuristics rather than running a local quantized LLM.
- **Current Workaround:** Fallback logic derives questions and distractors directly from document chunk sentences and parses structured JSON with self-healing retries.
- **Production Failure Mode:** Complex open-ended explanations cannot generate creative pedagogical analogies beyond the explicit sentences present in the retrieved text.

---

## Technical Audit Summary Matrix

| Subsystem | Source Location | Core Architectural Limitation | Production Scaling Bottleneck |
| :--- | :--- | :--- | :--- |
| **Queue** | `server/services/backgroundQueue.js` | In-process `EventEmitter` (concurrency 2) | Process crash loses queued jobs |
| **Database** | `server/db.js` | Single-writer in-memory `db.json` | Multi-instance deployment diverges data |
| **Vector Engine** | `server/services/faissVectorStore.js` | 128-dim statistical n-gram hashing | Linear scan slows on >50k chunks |
| **Document OCR** | `server/services/documentProcessor.js` | Text extraction without native vision OCR | Scanned/photographed PDFs fail extraction |
| **File Storage** | `server/uploads/` | Local server disk directory | Ephemeral container rebuilds wipe files |
| **Auth & OTP** | `server/services/emailService.js` | In-memory `Map` OTP storage | Server restart resets pending verification |
| **Rate Limiter** | `server/middleware/rateLimiter.js` | Process-local memory token bucket | Multiple replicas do not share limits |
| **AI Fallback** | `server/services/aiProvider.js` | Heuristic algorithmic simulator | Cannot generate novel synthetic analogies |

---
*Engineering Audit Record — AI Study Companion*
