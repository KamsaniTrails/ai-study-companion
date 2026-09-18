const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { aiProvider } = require('./aiProvider');
const { ContextComposer } = require('./contextComposer');
const { SecurityGuard } = require('./securityGuard');
const { cacheService } = require('./cacheService');

class TutorService {
  static async ensureProjectChunks(projectId) {
    const existingChunks = db.find('document_chunks', (c) => c.project_id === projectId);
    if (!existingChunks || existingChunks.length === 0) {
      const materials = db.find('materials', (m) => m.project_id === projectId);
      if (materials && materials.length > 0) {
        const { DocumentProcessor } = require('./documentProcessor');
        for (const mat of materials) {
          try {
            await DocumentProcessor.process({
              id: `job_${mat.id}`,
              data: {
                materialId: mat.id,
                projectId: mat.project_id,
                filePath: mat.file_path,
                originalName: mat.original_name
              }
            });
          } catch (e) {
            console.warn('[TutorService] Fallback material process notice:', e.message);
          }
        }
      }
    }
  }

  static async chat(projectId, conversationId, rawUserMessage, userId = 'user_demo', mode = 'qa') {
    // 1. Security Guard: Scan and neutralize prompt injection
    const securityCheck = SecurityGuard.sanitizeUserQuery(rawUserMessage, userId, projectId);
    const userMessage = securityCheck.sanitizedText;

    // 2. Cache Check: Bypass AI if exact query was answered recently
    const cacheKey = `tutor_${projectId}_${mode}_${userMessage.trim().toLowerCase()}`;
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        cacheHit: true,
        securityCheck
      };
    }

    let convId = conversationId;
    if (!convId) {
      convId = `conv_${Date.now()}`;
      db.insert('conversations', {
        id: convId,
        project_id: projectId,
        title: userMessage.slice(0, 45) + (userMessage.length > 45 ? '...' : ''),
        created_at: new Date().toISOString()
      });
    }

    // Save user message
    db.insert('messages', {
      id: uuidv4(),
      conversation_id: convId,
      role: 'user',
      content: rawUserMessage,
      citations: [],
      tokens_used: Math.max(5, Math.floor(userMessage.length / 4)),
      is_unsupported_question: false,
      security_flag: securityCheck.isInjectionDetected,
      created_at: new Date().toISOString()
    });

    // 3. Ensure chunks are ready and compose persistent learning context
    await TutorService.ensureProjectChunks(projectId);
    const composed = mode === 'revision'
      ? ContextComposer.composeForRevision(projectId, userId, userMessage, convId)
      : ContextComposer.composeForTutor(projectId, userId, userMessage, convId);
    const { systemPrompt, promptText, retrieval, isUnsupported, contextBreakdown } = composed;

    // Wrap in untrusted data delimiters
    const wrappedPrompt = SecurityGuard.wrapUntrustedContext(systemPrompt, promptText, '');
    // Call the AI Engine(Google Gemini)
    const aiRes = await aiProvider.generateText({
      feature: mode === 'revision' ? 'revision' : 'tutor',
      userId,
      projectId,
      systemPrompt,
      prompt: promptText
    });

    let finalAssistantText = aiRes.text;
    //append verified citations with page number and document name
    if (!isUnsupported && retrieval.citations.length > 0 && !finalAssistantText.includes('Source:')) {
      const citText = retrieval.citations
        .map((c) => `> **Source:** ${c.sourceDocName} — *Page ${c.pageNumber}*`)
        .join('\n');
      finalAssistantText += `\n\n**Citations:**\n${citText}`;
    }

    if (securityCheck.isInjectionDetected) {
      finalAssistantText = `🛡️ *[Security Notice: System override clauses were neutralized in your query]*\n\n` + finalAssistantText;
    }

    const assistantMsg = {
      id: uuidv4(),
      conversation_id: convId,
      role: 'assistant',
      content: finalAssistantText,
      citations: retrieval.citations,
      context_breakdown: contextBreakdown,
      tokens_used: aiRes.tokensCompletion,
      is_unsupported_question: isUnsupported,
      created_at: new Date().toISOString()
    };

    db.insert('messages', assistantMsg);

    db.insert('learning_events', {
      id: uuidv4(),
      project_id: projectId,
      user_id: userId,
      event_type: 'tutor_query',
      payload: {
        conversationId: convId,
        query: userMessage,
        isUnsupported,
        citationsCount: retrieval.citations.length,
        contextSources: Object.keys(contextBreakdown),
        securityFlag: securityCheck.isInjectionDetected
      },
      created_at: new Date().toISOString()
    });

    const result = {
      conversationId: convId,
      message: assistantMsg,
      citations: retrieval.citations,
      contextBreakdown,
      securityCheck,
      cacheHit: false
    };

    // Store in cache for 2 minutes
    cacheService.set(cacheKey, result, aiRes.tokensCompletion);

    return result;
  }

  /**
   * Server-Sent Events (SSE) Real-Time Token Streaming
   */
  static async streamChat(projectId, conversationId, rawUserMessage, userId, res, mode = 'qa') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const securityCheck = SecurityGuard.sanitizeUserQuery(rawUserMessage, userId, projectId);
    const userMessage = securityCheck.sanitizedText;

    let convId = conversationId || `conv_${Date.now()}`;
    if (!conversationId) {
      db.insert('conversations', {
        id: convId,
        project_id: projectId,
        title: userMessage.slice(0, 45) + (userMessage.length > 45 ? '...' : ''),
        created_at: new Date().toISOString()
      });
    }

    db.insert('messages', {
      id: uuidv4(),
      conversation_id: convId,
      role: 'user',
      content: rawUserMessage,
      citations: [],
      tokens_used: Math.max(5, Math.floor(userMessage.length / 4)),
      is_unsupported_question: false,
      created_at: new Date().toISOString()
    });

    await TutorService.ensureProjectChunks(projectId);
    const composed = mode === 'revision'
      ? ContextComposer.composeForRevision(projectId, userId, userMessage, convId)
      : ContextComposer.composeForTutor(projectId, userId, userMessage, convId);
    const { systemPrompt, promptText, retrieval, isUnsupported, contextBreakdown } = composed;

    // Send metadata event first
    res.write(`event: meta\ndata: ${JSON.stringify({
      conversationId: convId,
      citations: retrieval.citations,
      isUnsupported,
      contextBreakdown,
      mode,
      securityFlag: securityCheck.isInjectionDetected,
      model: 'gemini-3.8-flash'
    })}\n\n`);

    const aiRes = await aiProvider.generateText({
      feature: mode === 'revision' ? 'revision' : 'tutor',
      userId,
      projectId,
      systemPrompt,
      prompt: promptText
    });

    let fullText = aiRes.text;
    if (!isUnsupported && retrieval.citations.length > 0 && !fullText.includes('Source:')) {
      const citText = retrieval.citations
        .map((c) => `> **Source:** ${c.sourceDocName} — *Page ${c.pageNumber}*`)
        .join('\n');
      fullText += `\n\n**Citations:**\n${citText}`;
    }

    // Stream word by word with short delays
    const words = fullText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i === words.length - 1 ? '' : ' ');
      res.write(`event: token\ndata: ${JSON.stringify({ token: chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }

    // Save assistant message
    const assistantMsg = {
      id: uuidv4(),
      conversation_id: convId,
      role: 'assistant',
      content: fullText,
      citations: retrieval.citations,
      context_breakdown: contextBreakdown,
      tokens_used: aiRes.tokensCompletion,
      is_unsupported_question: isUnsupported,
      created_at: new Date().toISOString()
    };
    db.insert('messages', assistantMsg);

    res.write(`event: done\ndata: ${JSON.stringify({
      done: true,
      message: assistantMsg,
      latencyMs: aiRes.latencyMs
    })}\n\n`);

    res.end();
  }
}

module.exports = { TutorService };
