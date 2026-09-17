# AI Study Companion — AI Tools Documentation

**Part A: As Stated in the PRD | Part B: Recommended Real-World Tools Stack**

---

## Part A — AI Tools As Stated in the PRD

### A1. Development-time AI (Used to Build the Product)
*(PRD Section 20.5)*
- **Coding Assistants:** GitHub Copilot / LLM coding assistants for rapid boilerplate generation, schema validation, and test scaffolding.
- **Debugging Tools:** Automated stack trace inspection, SSE token streaming diagnostics, and state desynchronization debugging.
- **Design Tools:** CSS Token formulation for dark/light themes, typography scales, glassmorphism visual hierarchy, and SVG vector illustrations.
- **Development Workflows:** Automated developer scripts for continuous test execution, static analysis, and multi-file refactoring.

### A2. Runtime AI (Used by the Final Product)
*(PRD Section 20.5)*
- **Tutor:** Interactive conversational partner executing project-grounded RAG with strict citation generation (`Source: Doc — Page N`).
- **Quiz Generation:** Adaptive generation of MCQs and open-ended questions targeting weakest concepts and spaced-review schedules.
- **Assessment:** Dual-mode evaluation—deterministic matching for MCQs and 5-point rubric grading for qualitative open-ended responses.
- **Recommendations:** Context-aware study action generator answering *"What should I do next?"* anchored to specific document pages.
- **Document Understanding:** Background ingestion pipeline executing OCR, structural chunking, keyword extraction, and vector embedding generation.
- **Evaluation Models:** LLM-as-judge benchmarks quantifying groundedness, citation precision, and recommendation relevance.

### A3. AI Operations to Abstract
*(PRD Section 14 & Codebase `server/services/aiProvider.js`)*
- **Text Generation:** Conversational completion with token-by-token streaming.
- **Structured Generation:** Strict JSON-schema validated outputs (quiz questions, rubric evaluations).
- **Embeddings / Retrieval:** Vector generation and cosine similarity matching scoped by `project_id`.
- **Evaluation:** Automated rubric grading and diagnostic test-case verification.
- **Document Understanding:** Multi-format document parsing (.pdf, .docx, .md, .txt) and concept graph extraction.

### A4. Development Prompts — Required Organization
*(PRD Section 20.6 & `PROMPTS.md`)*
All development prompts are cataloged in [`PROMPTS.md`](../PROMPTS.md) categorized across the 8 disciplines:
1. Architecture
2. Frontend
3. Backend
4. Database
5. AI & RAG
6. Debugging
7. Testing
8. Documentation

### A5. Key PRD Statement
> *"The exact models and providers are left to the candidate."* — Section 14  
> *"The exact architecture and technology stack are intentionally open."* — Section 17  
> *Note: The PRD does not mandate any single proprietary vendor. Model and tool selection is flexible, encouraging modular design.*

---

## Part B — Recommended AI Tools Stack (Gemini-Based Implementation)

### B1. Core LLM (Tutor, Quiz, Grading, Recommendations)
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **Gemini 1.5 / 2.0 Pro** | 1M–2M token context window holds large course materials, full conversation history, and learner profiles without aggressive compression; superior reasoning for grounded citations and nuanced grading. |
| **Gemini Flash** | High throughput, sub-200ms latency, and ultra-low cost; ideal for background concept tagging, classification, and summarization. |

### B2. Multimodal Document Understanding
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **Gemini Native Multimodal** | Natively understands diagrams, formulas, tables, and images directly from PDF pages without separate OCR fragmentation. |
| **PyMuPDF / pdf-parse** | Fast, lightweight text/metadata extraction feeding into structure-aware semantic chunking. |
| **Unstructured.io (Fallback)** | Clean layout-aware table and columnar extraction for complex academic papers. |

### B3. Embeddings & Retrieval
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **Google text-embedding-004** | High retrieval quality, dense semantic embeddings aligned with Gemini models. |
| **pgvector / In-Memory Vector Store** | Fast cosine-similarity vector queries strictly scoped by `project_id` without external service overhead. |
| **Qdrant (Scale Alternative)** | Dedicated vector database option for enterprise-scale multi-million document deployments. |

### B4. AI Observability & Tracing
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **Langfuse / Built-in AI Trace Inspector** | Complete request tracing (Trace ID, Model, Latency ms, Token in/out, Cost USD, Prompts, Completions). |
| **Google Cloud Trace / Vertex AI Monitoring** | Native cloud metrics for latency percentiles (p50, p95, p99) and token spend quotas. |

### B5. AI Evaluation
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **Gemini (as LLM-Judge)** | Automated 4-pillar benchmark evaluation for groundedness, citation accuracy, and rubric grading consistency. |
| **Promptfoo** | Automated CLI regression testing runner across prompt iterations and model updates. |
| **Ragas** | RAG-specific evaluation metrics (faithfulness, answer relevance, context recall). |

### B6. Background Job / Async AI Orchestration
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **BackgroundQueue / Celery + Redis** | Asynchronous material processing, non-blocking mastery recalculation, and idempotent retry loops. |
| **WorkflowEngine / Inngest** | Event-driven workflow engine with automatic exponential backoff (max 3 retries) and dead-letter safety. |

### B7. Structured Output Validation
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **JSON Schema Validator / Pydantic** | Validates structured AI payloads (quiz options, correct index, concept weights) before writing to the database. |
| **Instructor** | Schema enforcement and automated self-correction retries for AI structured completions. |

### B8. Security & Prompt-Injection Testing
| Tool | Rationale & Capabilities |
| :--- | :--- |
| **SecurityGuard / Rebuff** | Pattern detection neutralizing prompt injections (`ignore instructions`, `reveal system prompt`), XML delimiter isolation. |
| **Garak / SAST Security Linter** | Automated vulnerability scanner verifying prompt boundary integrity and zero hardcoded secrets. |

---

### B9. Recommended Final Stack Summary

| Component | Production Stack Choice | Current Workspace Implementation |
| :--- | :--- | :--- |
| **Primary LLM** | Gemini 1.5/2.0 Pro + Gemini Flash | `aiProvider.js` (Gemini API + Neural Engine fallback) |
| **Document Understanding** | Gemini Multimodal + PDF parser | `documentProcessor.js` (Multi-format + PDF text extractor) |
| **Embeddings** | Google text-embedding-004 + pgvector | `vectorStore.js` (Project-scoped cosine similarity) |
| **Observability** | Langfuse / Cloud Trace | `observabilityService.js` + `AiTraceModal.jsx` |
| **Evaluation** | Gemini-as-judge + Promptfoo | `evaluationSuite.js` (4-pillar benchmarks) |
| **Queue** | Celery + Redis | `backgroundQueue.js` (In-memory event-driven queue) |
| **Output Validation** | Pydantic / Instructor | `aiProvider.js` (`generateStructured` schema validator) |
| **Security Testing** | Garak + SAST Linter | `securityGuard.js` + `scripts/security_linter.js` |

---

### B10. Model Selection Rationale

| Task | Selected Model | Technical Rationale |
| :--- | :--- | :--- |
| **Tutor Conversation** | **Gemini Pro** | Long context enables full document reference; complex multi-hop reasoning ensures factual answers. |
| **Document Understanding** | **Gemini Pro (Multimodal)** | Directly perceives diagrams, flowcharts, and math notations without OCR distortion. |
| **Quiz Generation** | **Gemini Pro (Structured)** | High reliability adhering to strict JSON schemas with 4 distinct options and explanations. |
| **Open-Ended Grading** | **Gemini Pro** | Nuanced semantic evaluation across 5 rubric dimensions (accuracy, reasoning, gaps, feedback). |
| **Concept Tagging & Keywords** | **Gemini Flash** | High-speed, cost-optimized token consumption for low-complexity metadata extraction. |
