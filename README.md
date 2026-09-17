# AI Study Companion — Full System Prototype

An enterprise-grade, evidence-grounded AI learning platform built according to rigorous AI engineering and observability standards.

## 📑 Documentation Index\n- [The AI Learning Partner — Vision & Manifesto](PARTNER_VISION.md)\n- [Final Submission Requirements Package](FINAL_SUBMISSION.md)\n- [System Architecture & Decisions](ARCHITECTURE.md)\n- [Engineering Decisions & Technical Trade-offs](ENGINEERING_DECISIONS.md)\n- [Development Prompts Log](PROMPTS.md)\n\n## 🚀 Live Services
- **Frontend Web Application**: `http://localhost:3000`
- **Backend API & Health**: `http://localhost:4000/health`
- **Database Schema**: `server/data/db.json` (Readable, atomic JSON with automated backup recovery)

---

## 🔑 Core Features & PRD Compliance

### 1. User Home Experience
Answers the three foundational questions instantly:
- **"Where was I?"**: **Continue Learning** hero banner showing last active study session and 1-click `[Resume Study Session]` button.
- **"How am I doing?"**: **Overall Progress** gauge with aggregated mastery and **Areas Requiring Attention** listing concepts with mastery < 70%.
- **"What should I do next?"**: High-priority targeted AI recommendation anchored to specific course notes.
- **Creative Extensions**: Spaced Repetition Flashcards modal, Visual Concept Map, and 7-Day Personalized Study Schedule.

### 2. Admin & Platform Dashboard
- **Platform-Level Overview**: Operational counters for Users, Spaces, Projects, Materials, Quizzes, AI Calls, Token spend, and Queue health.
- **User Journey Inspector**: Select any learner to inspect their complete learning history, timeline, quiz scores, weak concepts, and AI costs.
- **Platform Activity Feed**: Multi-filter live event stream (by user, space, project, event type, time period) with pagination.
- **AI Observability & 4-Pillar Evaluation**: Live benchmark runner (Tutor, Retrieval, Assessment, Recommendations) with 100% pass rate and regression protection.
- **Root-Cause Diagnostics**: Automated data-driven answers to the 6 core PRD diagnostic questions.
- **Security & Reliability Console**: Live interactive test buttons for prompt injection defense, cross-tenant isolation, and in-memory cache stats.

### 3. Grounded AI Tutor with Verified Citations
- Strict project-scoped retrieval preventing hallucinations.
- Source citations with document title and page numbers (e.g. *Source: Machine Learning Notes — Page 14*).
- **Unsupported-Question Refusal**: Refuses out-of-scope questions when insufficient evidence is found (`hasSufficientEvidence = false`).
- **Streaming Mode**: Server-Sent Events (SSE) token-by-token streaming typewriter response.

### 4. Adaptive Assessment & 5-Point AI Rubric
- Multiple-choice and open-ended questions adapted to learner mastery.
- Qualitative evaluation across 5 dimensions: `Understanding`, `Accuracy`, `Relevance`, `Key Concepts Covered`, and `Reasoning`.

### 5. Concept Mastery, Growth & Recommendations
- Quantitative mastery estimates (`█████████░ 88%`) with weighted evidence updates (70% prior + 30% new evidence).
- Growth trajectory tracking: `improving`, `stable`, and `needs_attention`.
- Actionable next-step recommendations answering *"What should I do next?"*.

### 6. Intelligent Background Workflows & Queue
- **Material Ingestion**: Upload → OCR → Chunking → Concept Extraction → Indexing.
- **Learning Workflow**: Quiz Completed → Rubric Grading → Mastery Recalculation → Weakness Detection → Recommendations.
- **Repeated-Mistake Workflow**: Pattern Identification → Context Update → Targeted Remediation.
- Queue features exponential backoff retries (`1200ms * attempts`) and idempotency deduplication.

### 7. Reliability, Security & Performance
- **Prompt Injection Defense**: Neutralizes jailbreaks, dev mode overrides, and system prompt leaks.
- **Multi-Tenant Data Isolation**: Cross-tenant access returns `HTTP 403 Forbidden`.
- **Rate Limiting**: 60 req/min with `HTTP 429 Too Many Requests` and `Retry-After`.
- **In-Memory Cache**: `< 5ms` latency on repeated queries, saving AI tokens.
- **Crash-Resilient Database**: Atomic file writes via temporary file rename + automated `.bak` backup recovery.

---

## 🧪 Automated Test Verification

Run all test suites:
```bash
# Run Core Business Logic Test Suite (17 Tests)
cd server
node test.js

# Run Security, Reliability & Performance Test Suite (22 Tests)
node test_security_reliability.js
```
**Total Tests: 39 / 39 Passing (100%)**
