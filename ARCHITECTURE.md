# System Architecture & Technology Justification

## 1. High-Level Conceptual Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React 18 + Vite)                       │
│   User Home  │  Workspace (Tabs: Dash, Materials, Tutor, Quiz, Growth, Analytics) │ Admin Hub │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / SSE (Streaming) / REST
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        API & APPLICATION LAYER (Express)                    │
│   Rate Limiter (429)  │  Auth Middleware (403)  │  Security Guard (Injection)│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                               BUSINESS LOGIC                                │
│   ┌───────────────┬─────────────────┬─────────────────┬──────────────────┐  │
│   │ Learning      │ AI Services     │ Assessment      │ Analytics & Admin│  │
│   │ - Mastery     │ - Tutor Service │ - Adaptive Quiz │ - Event Bus      │  │
│   │ - Context     │ - AI Provider   │ - 5-Point Rubric│ - Evaluation     │  │
│   │ - Workflows   │ - Guardrails    │ - Remediation   │ - Diagnostics    │  │
│   └───────────────┴─────────────────┴─────────────────┴──────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                          DATA, STORAGE & KNOWLEDGE                          │
│   ┌─────────────────┬─────────────────┬─────────────────┬────────────────┐  │
│   │ Database (JSON) │ Document Storage│ Search / Vector │ Cache Service  │  │
│   │ - Atomic writes │ - Uploads/      │ - 128-dim Hashing│ - In-memory TTL│  │
│   │ - Auto-backup   │ - Path sanitize │ - Project-scoped│ - < 5ms hits   │  │
│   │ - MongoDB sync  │                 │ - Cosine/FAISS  │                │  │
│   └─────────────────┴─────────────────┴─────────────────┴────────────────┘  │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
┌───────────────────▼─────────────────┐ ┌─────────────────▼───────────────────┐
│        BACKGROUND PROCESSING        │ │       AI & EXTERNAL SERVICES        │
│   - Material Processing Pipeline    │ │   - Tiered: Gemini 1.5 Pro / Flash  │
│   - Learning Workflow               │ │   - Auto-fallback to Local Simulator│
│   - Repeated-Mistake Workflow       │ │   - Timeout Controller (8000ms)     │
└─────────────────────────────────────┘ └─────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                                OBSERVABILITY                                │
│   - Granular Telemetry (ai_logs) │ Security Audit Logs │ Diagnostics API   │
│   - 4-Pillar Evaluation Suite (8 Passing Benchmarks) │ Regression Badging   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Justifications

| Technology | Layer | Justification | Code Location |
| :--- | :--- | :--- | :--- |
| **React 18 + Vite** | Frontend SPA | Sub-second HMR, modular component structure, clean luxury glassmorphism design tokens. | `client/` |
| **Node.js + Express** | API & Application | Asynchronous non-blocking event loop ideal for concurrent background workers and Server-Sent Events (SSE) streaming. | `server/app.js` |
| **Atomic JSON Database + MongoDB Sync** | Data Layer | Portable, zero-external-dependency, human-auditable relational JSON store with temp-file rename (`db.json.tmp` → `db.json`) and automated backup recovery (`db.json.bak`), with optional asynchronous replication to MongoDB Atlas. | `server/db.js` |
| **128-Dim N-Gram Vector Engine** | Retrieval Layer | High-speed, zero-cost 128-dimensional dense subword & token feature hashing with L2-normalized Cosine Similarity (supporting native `faiss-node` IndexFlatIP and pure JS fallback) with strict project-partitioned isolation. | `server/services/faissVectorStore.js` |
| **In-Memory LRU/TTL Cache** | Performance Layer | Eliminates redundant AI calls on frequent queries and vector embeddings, reducing latency from ~400ms to `< 5ms`. | `server/services/cacheService.js` |
| **Security Guard & Prompt Injection Sanitizer** | Security Layer | Explicit XML delimiting (`<system_instructions>`, `<untrusted_user_query>`), heuristic injection signature scanning, and path traversal sanitization. | `server/services/securityGuard.js` |
| **Role-Based Auth Middleware** | Security Layer | Strict tenant boundary enforcement: cross-tenant project or retrieval access returns `HTTP 403 Forbidden` and logs to `security_logs`. | `server/middleware/authMiddleware.js` |
| **Event-Driven Background Queue** | Asynchronous Processing | Concurrency control (cap = 2), exponential backoff retries (`1200ms * attempts`), stage events, and idempotency deduplication. | `server/services/backgroundQueue.js` |

---

## 3. Vector Retrieval & Embedding Architecture

The retrieval subsystem (`server/services/faissVectorStore.js` & `server/services/retrievalEngine.js`) is architected for zero-cost, high-speed execution without external embedding API quota bottlenecks:

1. **Embedding Generator (`embedText`):**
   - Generates 128-dimensional dense vectors using polynomial feature hashing.
   - Combines unigram word frequencies, adjacent bigrams (word pairs for phrasal continuity), and character 3-grams (providing typo tolerance e.g. "summaru" &rarr; "summary").
   - Applies L2 normalization so dot product computation directly equals Cosine Similarity.
2. **Project Partitioning:**
   - Vector indices are strictly isolated per project (`projectIndices.get(projectId)`).
   - Pre-filters eliminate 99.9% of non-relevant global chunks before vector math occurs.
3. **Execution Engine:**
   - Uses native C++ bindings via `faiss-node` (IndexFlatIP) when available in the environment.
   - Seamlessly falls back to pure JavaScript vector dot-product computation on platforms without precompiled binaries.

---

## 4. Database Entity Relationship Model

The schema in `server/db.js` models the complete learning lifecycle:
- `users`: `id`, `name`, `email`, `role` ('student' | 'admin'), `goal`, `created_at`
- `spaces`: `id`, `user_id`, `name`, `description`, `color`, `icon`, `created_at`
- `projects`: `id`, `space_id`, `user_id`, `name`, `learning_goal`, `average_mastery`, `target_date`, `created_at`
- `materials`: `id`, `project_id`, `user_id`, `filename`, `file_size`, `status`, `stage`, `page_count`
- `document_chunks`: `id`, `project_id`, `material_id`, `page_number`, `content`, `token_count`
- `concepts`: `id`, `project_id`, `name`, `description`, `importance_score`
- `concept_mastery`: `id`, `project_id`, `concept_id`, `concept_name`, `mastery_score`, `confidence`, `status`, `history`, `last_tested_at`
- `conversations`: `id`, `project_id`, `title`, `created_at`
- `messages`: `id`, `conversation_id`, `role`, `content`, `citations`, `context_breakdown`
- `quizzes`: `id`, `project_id`, `title`, `difficulty`, `status`, `score`
- `quiz_questions`: `id`, `quiz_id`, `concept_id`, `concept_name`, `type`, `prompt`, `options`, `correct_answer`, `explanation`
- `quiz_attempts`: `id`, `quiz_id`, `project_id`, `user_id`, `score`, `total_questions`, `completed_at`
- `quiz_answers`: `id`, `attempt_id`, `question_id`, `question_prompt`, `user_answer`, `is_correct`, `ai_score`, `evaluation`
- `learning_events`: `id`, `project_id`, `user_id`, `event_type`, `payload`, `created_at`
- `recommendations`: `id`, `project_id`, `title`, `description`, `priority`, `action_type`, `target_page`
- `persistent_context`: `project_id`, `user_id`, `learningGoals`, `knownStrengths`, `knownWeaknesses`, `repeatedMistakes`
- `ai_logs`: `id`, `model`, `feature`, `latency_ms`, `tokens_prompt`, `tokens_completion`, `estimated_cost`, `status`
- `security_logs`: `id`, `event_type`, `user_id`, `severity`, `payload`, `action_taken`
