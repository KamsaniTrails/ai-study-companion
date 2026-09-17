# Evaluation Approach: AI Study Companion

This document outlines the evaluation methodology used to measure and validate AI quality, retrieval fidelity, assessment grading, and system reliability per PRD Section 14, 15, and 20.

---

## 1. Evaluation Dimensions & Metrics

| Dimension | Target Behavior | Metric / Validation Method |
|---|---|---|
| **Groundedness & Accuracy** | Tutor must only state facts supported by the uploaded project notes. | Automated query-to-chunk semantic overlap check; verification of exact page citations. |
| **Citation Correctness** | Citations must link directly to the correct source document and page number. | Ground truth comparison (`Source: Machine Learning Notes — Page 14`). |
| **Unsupported-Question Refusal** | Out-of-scope questions (e.g. general trivia, cooking) must be declined with an explicit "insufficient evidence" notice. | Relevance threshold test: if score $< 0.25$, verify `is_unsupported_question = true` and 0 citations emitted. |
| **Open-Ended Grading Quality** | Rubric evaluations must evaluate understanding, accuracy, key concepts covered, and missing concepts. | 5-point rubric completeness check; feedback must provide qualitative guidance. |
| **Adaptive Behavior** | Quizzes must target concepts with lowest mastery scores. | Concept ranking test: verifies questions generated target concepts with status `needs_attention`. |
| **Project Isolation** | Retrieval queries for Project A must never return chunks from Project B. | Multi-tenant isolation test: queries cross-referencing project IDs return zero results. |

---

## 2. Automated Benchmark Suite (`/api/admin/ai-eval`)

The application provides a built-in automated AI evaluation runner executable directly from the Admin Dashboard or via REST POST `/api/admin/ai-eval`.

The benchmark evaluates three critical test cases:
1. **Grounded In-Scope Query:**
   - *Input:* "Why do we divide by sqrt(d_k) in the transformer attention formula?"
   - *Expected Outcome:* Retrieval passes evidence threshold ($\ge 0.25$), citation targets Page 14, grounded answer generated.
2. **Unsupported Out-of-Scope Query:**
   - *Input:* "What is the recipe for baking chocolate cookies?"
   - *Expected Outcome:* Retrieval score $< 0.25$, `hasSufficientEvidence = false`, refusal protocol triggered.
3. **Open-Ended Rubric Evaluator:**
   - *Input:* Student response explaining residual skip connection mathematics.
   - *Expected Outcome:* AI returns valid JSON with `aiScore` (0-100), `understanding` analysis, and `feedback` text.

---

## 3. Continuous Observability & Tracing

In addition to automated benchmarks, all runtime LLM interactions are captured in the `ai_logs` table:
- **Latency Monitoring:** Tracks P50/P95 response time to identify slow generation.
- **Token Accounting:** Records prompt tokens and completion tokens to measure context efficiency.
- **Cost Estimation:** Calculates estimated USD cost per call ($0.15/1M input, $0.60/1M output).
- **Error Diagnostics:** Captures status (`success`/`failure`) and stack traces if an external API call experiences rate limits or timeouts.
