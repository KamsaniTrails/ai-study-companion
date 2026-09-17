const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'db.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default initial state
const defaultDb = {
  users: [],
  spaces: [],
  projects: [],
  materials: [],
  document_chunks: [],
  concepts: [],
  concept_mastery: [],
  conversations: [],
  messages: [],
  quizzes: [],
  quiz_questions: [],
  quiz_attempts: [],
  quiz_answers: [],
  learning_events: [],
  recommendations: [],
  ai_logs: [],
  persistent_context: [],
  security_logs: []
};

function readDb() {
  if (!fs.existsSync(dbFilePath)) {
    saveDb(defaultDb);
    return JSON.parse(JSON.stringify(defaultDb));
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, attempting recovery from backup:', err);
    if (fs.existsSync(backupFilePath)) {
      try {
        const bakRaw = fs.readFileSync(backupFilePath, 'utf8');
        return JSON.parse(bakRaw);
      } catch (be) { }
    }
    return JSON.parse(JSON.stringify(defaultDb));
  }
}

const backupFilePath = path.join(dataDir, 'db.json.bak');
const tempFilePath = path.join(dataDir, 'db.json.tmp');

function saveDb(data) {
  const json = JSON.stringify(data, null, 2);
  try {
    // 1. Atomic write using temp file + rename
    fs.writeFileSync(tempFilePath, json, 'utf8');
    //backup existing database
    if (fs.existsSync(dbFilePath)) {
      try {
        fs.copyFileSync(dbFilePath, backupFilePath);
      } catch (e) { }
    }
    //automatic rename 
    fs.renameSync(tempFilePath, dbFilePath);
  } catch (err) {
    // Fallback direct write
    fs.writeFileSync(dbFilePath, json, 'utf8');
  }
}

const db = {
  get(collection) {
    const data = readDb();
    return data[collection] || [];
  },

  findOne(collection, filterFn) {
    const items = this.get(collection);
    return items.find(filterFn) || null;
  },

  find(collection, filterFn) {
    const items = this.get(collection);
    return filterFn ? items.filter(filterFn) : items;
  },
  //insert new record and saves to disk
  insert(collection, item) {
    const data = readDb();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    saveDb(data);
    return item;
  },
  //modifies a recor matching the filter
  update(collection, filterFn, updates) {
    const data = readDb();
    if (!data[collection]) return null;
    const index = data[collection].findIndex(filterFn);
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates };
      saveDb(data);
      return data[collection][index];
    }
    return null;
  },
  //deletes matching items
  remove(collection, filterFn) {
    const data = readDb();
    if (!data[collection]) return false;
    const initialLen = data[collection].length;
    data[collection] = data[collection].filter((item) => !filterFn(item));
    saveDb(data);
    return data[collection].length < initialLen;
  },

  // Seed default data if database is empty
  init() {
    const existing = this.findOne('users', (u) => u.id === 'user_demo');
    if (existing) return;

    console.log('🌱 Initializing easy JSON database with default study materials...');

    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();

    // 1. Users
    this.insert('users', { id: 'user_demo', email: 'alex@learning.ai', name: 'Alex Morgan', role: 'student', created_at: twoDaysAgo });
    this.insert('users', { id: 'user_admin', email: 'elena@learning.ai', name: 'Dr. Elena Vance', role: 'admin', created_at: twoDaysAgo });

    // 2. Spaces
    this.insert('spaces', {
      id: 'space_ai',
      user_id: 'user_demo',
      name: 'Artificial Intelligence & Deep Learning',
      description: 'Foundations of neural networks, optimization algorithms, and transformers.',
      icon: 'Brain',
      color: '#6366f1',
      created_at: twoDaysAgo
    });

    // 3. Projects
    this.insert('projects', {
      id: 'project_transformers',
      space_id: 'space_ai',
      user_id: 'user_demo',
      name: 'Transformers & Neural Attention Mechanisms',
      description: 'Comprehensive study of self-attention, residual skip connections, and gradient stability.',
      learning_goal: 'Master scaled dot-product attention mathematics and diagnose gradient degradation.',
      target_date: '2026-10-15',
      created_at: twoDaysAgo
    });

    // 4. Material
    this.insert('materials', {
      id: 'mat_dl_notes',
      project_id: 'project_transformers',
      filename: 'deep_learning_notes.pdf',
      original_name: 'Machine Learning & Neural Architecture Notes.pdf',
      file_path: 'uploads/deep_learning_notes.pdf',
      file_size: 428500,
      status: 'ready',
      stage: 'ready',
      page_count: 18,
      extracted_concepts_count: 5,
      created_at: twoDaysAgo
    });

    // 5. Chunks
    const chunks = [
      {
        id: 'chk_1',
        material_id: 'mat_dl_notes',
        project_id: 'project_transformers',
        page_number: 4,
        content: 'Gradient Descent Optimization: Standard gradient descent updates network weights using the rule: theta = theta - eta * grad_theta(L). When the loss surface contains saddle points or high curvature ravines, adaptive moment estimation (Adam) computes exponentially decaying averages of past gradients (first moment m_t) and past squared gradients (second moment v_t).',
        token_count: 85
      },
      {
        id: 'chk_2',
        material_id: 'mat_dl_notes',
        project_id: 'project_transformers',
        page_number: 8,
        content: 'Backpropagation Algorithm: In computational graphs, the chain rule of calculus is applied in reverse topological order. For node z = f(x, y), the gradient dL/dx equals (dL/dz) * (dz/dx). Accumulating partial derivatives backwards allows computing gradients of deep computational graphs efficiently.',
        token_count: 78
      },
      {
        id: 'chk_3',
        material_id: 'mat_dl_notes',
        project_id: 'project_transformers',
        page_number: 14,
        content: 'Scaled Dot-Product Attention: The fundamental attention mechanism computes Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. The dot products of queries and keys measure token affinity. The division by sqrt(d_k) prevents dot products from growing excessively large for high dimensions, which would otherwise push the softmax function into regions with extremely small gradients.',
        token_count: 110
      },
      {
        id: 'chk_4',
        material_id: 'mat_dl_notes',
        project_id: 'project_transformers',
        page_number: 16,
        content: 'Residual Connections (Skip Connections): A residual block defines the output mapping as H(x) = F(x) + x, where F(x) represents the stacked weight layers. During backpropagation, the gradient of the loss with respect to x includes an additive identity term dH/dx = dF/dx + 1. Because the gradient passes directly through the identity skip connection without attenuation, gradients can flow unimpeded through hundreds of network layers.',
        token_count: 105
      }
    ];
    chunks.forEach((c) => this.insert('document_chunks', c));

    // 6. Concepts & Mastery
    const concepts = [
      { id: 'c_attention', project_id: 'project_transformers', name: 'Scaled Dot-Product Attention', description: 'Query-Key affinity scaling by sqrt(d_k) and value projection.', score: 46, status: 'needs_attention' },
      { id: 'c_residual', project_id: 'project_transformers', name: 'Residual Connections (Skip Connections)', description: 'Identity bypass mitigating vanishing gradients in deep layers.', score: 79, status: 'stable' },
      { id: 'c_backprop', project_id: 'project_transformers', name: 'Backpropagation & Chain Rule', description: 'Reverse accumulation of partial derivatives through graphs.', score: 84, status: 'improving' },
      { id: 'c_grad_descent', project_id: 'project_transformers', name: 'Adaptive Gradient Optimization', description: 'First and second moment gradient tracking in Adam.', score: 91, status: 'improving' }
    ];

    concepts.forEach((c) => {
      this.insert('concepts', { id: c.id, project_id: c.project_id, name: c.name, description: c.description, importance_score: 9.0 });
      this.insert('concept_mastery', {
        id: `cm_${c.id}`,
        project_id: c.project_id,
        concept_id: c.id,
        concept_name: c.name,
        mastery_score: c.score,
        confidence: 0.85,
        status: c.status,
        history: [{ date: '2026-09-14', score: c.score - 5 }, { date: '2026-09-15', score: c.score }],
        last_tested_at: yesterday
      });
    });

    // 7. Tutor Conversation & Citations
    this.insert('conversations', { id: 'conv_1', project_id: 'project_transformers', title: 'Why do we divide by sqrt(d_k)?', created_at: yesterday });
    this.insert('messages', {
      id: 'msg_1',
      conversation_id: 'conv_1',
      role: 'user',
      content: 'Why do we divide by sqrt(d_k) in the transformer attention formula?',
      citations: [],
      tokens_used: 24,
      is_unsupported_question: false,
      created_at: yesterday
    });

    this.insert('messages', {
      id: 'msg_2',
      conversation_id: 'conv_1',
      role: 'assistant',
      content: `In Scaled Dot-Product Attention, dividing by $\\sqrt{d_k}$ normalizes the variance of the dot products back to 1. For large dimension $d_k$, the dot product values grow large, which pushes the $\\text{softmax}$ function into regions with extremely small gradients (vanishing gradients).

**Citations:**
> **Source:** Machine Learning & Neural Architecture Notes.pdf — *Page 14*`,
      citations: [
        {
          sourceDocId: 'mat_dl_notes',
          sourceDocName: 'Machine Learning & Neural Architecture Notes.pdf',
          pageNumber: 14,
          snippet: 'The division by sqrt(d_k) prevents dot products from growing excessively large for high dimensions, which would otherwise push the softmax function into regions with extremely small gradients.',
          relevanceScore: 0.96
        }
      ],
      tokens_used: 145,
      is_unsupported_question: false,
      created_at: yesterday
    });

    // 8. Recommendations
    this.insert('recommendations', {
      id: 'rec_1',
      project_id: 'project_transformers',
      user_id: 'user_demo',
      title: 'Targeted Review: Scaled Dot-Product Attention',
      description: 'Your estimated mastery is 46%. Review the mathematical derivations on Page 14 and take a practice drill.',
      action_type: 'review_material',
      priority: 'high',
      concept_id: 'c_attention',
      concept_name: 'Scaled Dot-Product Attention',
      target_page: 14,
      reason: 'Low mastery score (46%) and high-variance dot product calculations.',
      is_dismissed: false,
      created_at: now
    });

    // 9. AI Telemetry Logs
    this.insert('ai_logs', {
      id: 'log_1',
      user_id: 'user_demo',
      project_id: 'project_transformers',
      feature: 'tutor',
      model: 'companion-neural-js',
      prompt_preview: 'Why do we divide by sqrt(d_k) in the transformer attention formula?',
      response_preview: 'In Scaled Dot-Product Attention, dividing by sqrt(d_k) normalizes the variance...',
      latency_ms: 420,
      tokens_prompt: 310,
      tokens_completion: 145,
      estimated_cost: 0.000078,
      status: 'success',
      created_at: yesterday
    });

    // 10. Persistent Context
    this.insert('persistent_context', {
      id: 'ctx_1',
      project_id: 'project_transformers',
      user_id: 'user_demo',
      learningGoals: ['Master scaled dot-product attention mathematics', 'Diagnose gradient degradation'],
      knownStrengths: ['Gradient descent convergence', 'Backpropagation graph rules'],
      knownWeaknesses: ['High-variance softmax saturation mechanics'],
      repeatedMistakes: []
    });

    console.log('✅ Easy JSON database initialized successfully! (Stored at server/data/db.json)');
  }
};

module.exports = db;
