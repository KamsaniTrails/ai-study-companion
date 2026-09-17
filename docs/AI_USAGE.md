# AI Usage Documentation: AI Study Companion

This document clearly distinguishes between the AI used to build the product and the AI used by the final product in runtime, as required by PRD Section 20.

---

## 1. AI Used to Build the Product

| Area | Tool / Model | Description of Usage |
|---|---|---|
| **System Architecture Design** | Antigravity AI Assistant | Formulating the decoupled full-stack architecture, relational database schema, and project isolation patterns. |
| **Backend Implementation** | Antigravity AI Assistant | Generating TypeScript types, Express REST routes, SQLite database migrations, and in-memory background worker queue. |
| **Frontend Implementation** | Antigravity AI Assistant | Crafting the modern React UI with glassmorphism, responsive navigation, citation split-screen viewer, and CSS design system. |
| **Automated Testing Suite** | Antigravity AI Assistant | Implementing 19 automated integration and unit tests verifying project isolation, grounded citations, rubric grading, and retry queues. |
| **Technical Documentation** | Antigravity AI Assistant | Synthesizing architecture diagrams, prompt catalogs, evaluation benchmarks, and deployment documentation. |

---

## 2. AI Used by the Final Product (Runtime AI Engine)

The final application operates an AI layer that powers 5 core experiences:

### A. AI Tutor (Interactive Learning Partner)
- **Role:** Answers student questions strictly grounded in the project's uploaded materials.
- **Features:**
  - Multi-context assembly (Current Conversation + Project Knowledge + Learner Context).
  - Grounded citation generation (`Source: [Doc Name] — Page X`).
  - Unsupported Question Refusal: Detects when questions fall below the retrieval threshold ($0.25$) and communicates insufficient evidence rather than hallucinating.
- **Models Supported:** `gemini-2.5-flash`, `gpt-4o-mini`, `companion-neural-v3` (Local High-Fidelity Engine).

### B. Adaptive Assessment Generator
- **Role:** Generates tailored practice drills based on student mastery gaps.
- **Features:**
  - Selects concepts marked as `needs_attention` or having lowest mastery.
  - Dynamically synthesizes Multiple-Choice Questions (MCQ) and Open-Ended Reasoning Questions.
  - Formulates plausible distractors and thorough explanations.

### C. Open-Ended Rubric Evaluator
- **Role:** Evaluates open-ended student explanations against model solutions and domain concepts.
- **5-Point Rubric:**
  - *Understanding:* Conceptual depth and grasp of mechanics.
  - *Accuracy:* Statement correctness and absence of false claims.
  - *Relevance:* Direct alignment with the prompt.
  - *Key Concepts Covered:* Extracted list of correctly applied concepts.
  - *Missing Concepts:* Nuances or mathematical terms to review.
  - *Actionable Feedback:* Constructive explanation of strengths and improvement areas.

### D. Concept & Knowledge Extractor
- **Role:** Analyzes uploaded PDFs during background ingestion.
- **Features:** Extracts key domain concepts, definitions, categories, and assigns initial importance weights (1-10).

### E. Next-Step Recommendation Engine
- **Role:** Answers "What should I do next?"
- **Features:** Analyzes student weaknesses, repeated mistakes, and quiz performances to formulate prioritized study actions linking to specific document page numbers.
