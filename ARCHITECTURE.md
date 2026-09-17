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
│   │ - Atomic writes │ - Uploads/      │ - Project-scoped│ - In-memory TTL│  │
│   │ - Auto-backup   │ - Path sanitize │ - Cosine/TF-IDF │ - < 5ms hits   │  │
│   └─────────────────┴─────────────────┴─────────────────┴────────────────┘  │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
┌───────────────────▼─────────────────┐ ┌─────────────────▼───────────────────┐
│        BACKGROUND PROCESSING        │ │       AI & EXTERNAL SERVICES        │
│   - Material Processing Pipeline    │ │   - Tiered: Gemini-3.1-pro / Flash  │
│   - Learning Workflow               │ │   - Auto-fallback to Neural Sim     │
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

| Technology | Layer | Justification |
| :--- | :--- | :--- |
| **React 18 + Vite** | Frontend SPA | Sub-second HMR, modular component structure, clean luxury glassmorphism design tokens. |
| **Node.js + Express** | API & Application | Asynchronous non-blocking event loop ideal for concurrent background workers and Server-Sent Events (SSE) streaming. |
| **Atomic JSON Database** | Data Layer | Portable, zero-external-dependency, human-auditable relational JSON store with temp-file rename (`db.json.tmp` → `db.json`) and automated backup recovery (`db.json.bak`). |
| **In-Memory LRU/TTL Cache** | Performance Layer | Eliminates redundant AI calls on frequent queries and vector embeddings, reducing latency from ~400ms to `< 5ms`. |
| **Security Guard & Prompt Injection Sanitizer** | Security Layer | Explicit XML delimiting (`<system_instructions>`, `<untrusted_user_query>`), heuristic injection signature scanning, and path traversal sanitization. |
| **Role-Based Auth Middleware** | Security Layer | Strict tenant boundary enforcement: cross-tenant project or retrieval access returns `HTTP 403 Forbidden`. |
| **Event-Driven Background Queue** | Asynchronous Processing | Concurrency control, exponential backoff retries (`1200ms * attempts`), stage events, and idempotency deduplication. |

---

## 3. Database Entity Relationship Model

The schema in `server/db.js` models the complete learning lifecycle:
- `users`: `id`, `name`, `email`, `role` ('student' | 'admin'), `goal`, `created_at`
- `spaces`: `id`, `user_id`, `name`, `description`, `color`, `icon`, `created_at`
- `projects`: `id`, `space_id`, `user_id`, `name`, `learning_goal`, `target_date`, `created_at`
- `materials`: `id`, `project_id`, `user_id`, `filename`, `file_size`, `status`, `stage`, `page_count`
- `document_chunks`: `id`, `project_id`, `material_id`, `page_number`, `content`
- `concepts`: `id`, `project_id`, `name`, `description`, `importance`
- `concept_mastery`: `id`, `project_id`, `concept_id`, `mastery_score`, `status` ('improving'|'stable'|'needs_attention')
- `conversations`: `id`, `project_id`, `title`, `created_at`
- `messages`: `id`, `conversation_id`, `role`, `content`, `citations`, `context_breakdown`
- `quizzes`: `id`, `project_id`, `title`, `difficulty`, `status`
- `quiz_questions`: `id`, `quiz_id`, `type`, `question_prompt`, `concept_name`, `rubric`
- `quiz_attempts`: `id`, `quiz_id`, `user_id`, `score`, `rubric_breakdown`
- `learning_events`: `id`, `project_id`, `user_id`, `event_type`, `payload`, `idempotency_key`
- `recommendations`: `id`, `project_id`, `title`, `description`, `priority`, `action_type`, `target_page`
- `persistent_context`: `project_id`, `learningGoals`, `knownStrengths`, `knownWeaknesses`, `repeatedMistakes`
- `ai_logs`: `id`, `model`, `feature`, `latency_ms`, `tokens_prompt`, `tokens_completion`, `estimated_cost`, `status`
- `security_logs`: `id`, `event_type`, `user_id`, `severity`, `payload`, `action_taken`
