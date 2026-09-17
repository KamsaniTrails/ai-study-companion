# Known Limitations & Future Improvements: AI Study Companion

This document provides transparent documentation of known engineering tradeoffs and outlines planned architectural improvements per PRD Section 20.

---

## 1. Known Limitations

### A. Document Parsing & Layout Understanding
- **Current State:** The system parses text and structural page boundaries using `pdf-parse`.
- **Limitation:** Complex multi-column tables, mathematical equations formatted as vector graphics, and handwritten scanned notes require OCR vision models (e.g. Gemini 2.5 Flash Multimodal or Tesseract) for pixel-level accuracy.

### B. In-Memory Job Queue Scalability
- **Current State:** An in-process event-driven background worker (`BackgroundQueueService`) manages asynchronous document ingestion and assessment evaluations with retries.
- **Limitation:** In a multi-instance, clustered production deployment, jobs must be coordinated via a distributed broker (such as Redis with BullMQ or AWS SQS) so jobs persist across server restarts.

### C. Vector Retrieval Scalability
- **Current State:** The hybrid retrieval engine performs lexical token scoring combined with cosine affinity across document chunks stored in SQLite.
- **Limitation:** For libraries containing thousands of documents, an Approximate Nearest Neighbor (ANN) index (e.g. `sqlite-vss`, `pgvector`, or Qdrant) is recommended for sub-millisecond retrieval.

---

## 2. Future Improvements (Creative Differentiation)

Per PRD Section 20 and Section 21, the following features represent natural evolutions for the learning companion:

1. **Interactive Concept Maps (Graph Visualization):**
   - Visual dependency graph connecting concepts (e.g. *Gradient Descent* $\to$ *Backpropagation* $\to$ *Residual Connections*), with nodes colored by current mastery score.
2. **Audio & Voice Learning Companion:**
   - Real-time conversational tutor utilizing WebRTC and low-latency speech-to-speech models, enabling hands-free study drills while commuting.
3. **Spaced Repetition & Flashcard Decks:**
   - Automated flashcard generation using the SuperMemo SM-2 algorithm to schedule concept reviews right before memory decay occurs.
4. **Multi-Modal Document Understanding:**
   - Direct image ingestion of architectural diagrams and plots, allowing the AI Tutor to reference visual diagrams (`"See diagram on Page 14"`).
5. **Personalized Learning Schedules:**
   - Integration with calendar providers to automatically distribute target concept reviews across exam preparation timelines.
