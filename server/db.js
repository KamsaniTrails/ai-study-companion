const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const isVercel = Boolean(process.env.VERCEL);
const originalDataDir = path.resolve(__dirname, 'data');
const originalDbFile = path.join(originalDataDir, 'db.json');

const dataDir = isVercel
  ? path.join('/tmp', 'data')
  : originalDataDir;

const dbFilePath = path.join(dataDir, 'db.json');
const backupFilePath = path.join(dataDir, 'db.json.bak');
const tempFilePath = path.join(dataDir, 'db.json.tmp');

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.warn('[DB] Could not create data directory:', e.message);
  }
}

// In Vercel serverless, copy bundled seed db.json to /tmp/data/db.json if not present
if (isVercel && !fs.existsSync(dbFilePath) && fs.existsSync(originalDbFile)) {
  try {
    fs.copyFileSync(originalDbFile, dbFilePath);
  } catch (e) {
    console.warn('[DB] Could not copy seed db.json to /tmp:', e.message);
  }
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

// In-memory cache for sub-millisecond synchronous reads
let memoryCache = null;

function readDb() {
  if (memoryCache) {
    return memoryCache;
  }

  if (!fs.existsSync(dbFilePath)) {
    saveDb(defaultDb);
    memoryCache = JSON.parse(JSON.stringify(defaultDb));
    return memoryCache;
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    memoryCache = JSON.parse(raw);
    return memoryCache;
  } catch (err) {
    console.error('Error reading db.json, attempting recovery from backup:', err);
    if (fs.existsSync(backupFilePath)) {
      try {
        const bakRaw = fs.readFileSync(backupFilePath, 'utf8');
        memoryCache = JSON.parse(bakRaw);
        return memoryCache;
      } catch (be) { }
    }
    memoryCache = JSON.parse(JSON.stringify(defaultDb));
    return memoryCache;
  }
}

function saveDb(data) {
  memoryCache = data;
  const json = JSON.stringify(data, null, 2);
  try {
    fs.writeFileSync(tempFilePath, json, 'utf8');
    if (fs.existsSync(dbFilePath)) {
      try {
        fs.copyFileSync(dbFilePath, backupFilePath);
      } catch (e) { }
    }
    fs.renameSync(tempFilePath, dbFilePath);
  } catch (err) {
    try {
      fs.writeFileSync(dbFilePath, json, 'utf8');
    } catch (writeErr) {
      console.warn('[DB] Disk write skipped (ephemeral memory cached):', writeErr.message);
    }
  }
}

// MongoDB Atlas Configuration
const DEFAULT_MONGO_URI = 'mongodb+srv://AI_Student_Compansion:mohana9441@cluster0.9sbxunn.mongodb.net/AI_Study_Companion?retryWrites=true&w=majority&appName=Cluster0';
const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;

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

  insert(collection, item) {
    const data = readDb();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    saveDb(data);

    // Asynchronously replicate to MongoDB Atlas
    if (isMongoConnected && mongoDb) {
      const doc = { ...item };
      if (doc.id && !doc._id) doc._id = doc.id;
      mongoDb.collection(collection).updateOne(
        { _id: doc._id || doc.id },
        { $set: doc },
        { upsert: true }
      ).catch((err) => {
        console.warn(`[MongoDB] Async insert error in ${collection}:`, err.message);
      });
    }

    return item;
  },

  update(collection, filterFn, updates) {
    const data = readDb();
    if (!data[collection]) return null;
    const index = data[collection].findIndex(filterFn);
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates };
      const updatedItem = data[collection][index];
      saveDb(data);

      // Asynchronously replicate update to MongoDB Atlas
      if (isMongoConnected && mongoDb && updatedItem) {
        const id = updatedItem._id || updatedItem.id;
        if (id) {
          mongoDb.collection(collection).updateOne(
            { _id: id },
            { $set: updates }
          ).catch((err) => {
            console.warn(`[MongoDB] Async update error in ${collection}:`, err.message);
          });
        }
      }

      return updatedItem;
    }
    return null;
  },

  remove(collection, filterFn) {
    const data = readDb();
    if (!data[collection]) return false;
    const initialLen = data[collection].length;
    const toRemove = data[collection].filter(filterFn);
    data[collection] = data[collection].filter((item) => !filterFn(item));
    saveDb(data);

    // Asynchronously replicate deletion to MongoDB Atlas
    if (isMongoConnected && mongoDb && toRemove.length > 0) {
      const ids = toRemove.map((i) => i._id || i.id).filter(Boolean);
      if (ids.length > 0) {
        mongoDb.collection(collection).deleteMany({
          _id: { $in: ids }
        }).catch((err) => {
          console.warn(`[MongoDB] Async delete error in ${collection}:`, err.message);
        });
      }
    }

    return data[collection].length < initialLen;
  },

  /**
   * Connects to MongoDB Atlas and synchronizes collection states.
   */
  async connectMongo() {
    if (isMongoConnected) return mongoDb;
    try {
      console.log('🍃 Connecting to MongoDB Atlas (Cluster0: AI_Study_Companion)...');
      mongoClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
      await mongoClient.connect();
      mongoDb = mongoClient.db('AI_Study_Companion');
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully!');

      // Synchronize existing collections
      const localData = readDb();
      for (const collName of Object.keys(localData)) {
        if (Array.isArray(localData[collName]) && localData[collName].length > 0) {
          const coll = mongoDb.collection(collName);
          const count = await coll.countDocuments();
          if (count === 0) {
            const docs = localData[collName].map((item) => {
              const doc = { ...item };
              if (doc.id && !doc._id) doc._id = doc.id;
              return doc;
            });
            await coll.insertMany(docs);
            console.log(`[MongoDB] Initialized ${docs.length} records in collection: ${collName}`);
          }
        }
      }
      return mongoDb;
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection notice (continuing with local atomic cache):', err.message);
      return null;
    }
  },

  getMongoDb() {
    return mongoDb;
  },

  isMongoConnected() {
    return isMongoConnected;
  },

  // Seed default data if database is empty
  init() {
    readDb();

    // Kick off MongoDB Atlas async connection
    this.connectMongo().catch(() => {});

    const existing = this.findOne('users', (u) => u.id === 'user_demo');
    if (existing) return;

    console.log('🌱 Initializing database with default study materials...');

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
        content: 'Scaled Dot-Product Attention: The fundamental attention mechanism computes Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. The dot products of queries and keys are scaled by 1/sqrt(d_k) to prevent variance inflation from pushing softmax into regions with vanishing gradients.',
        token_count: 92
      },
      {
        id: 'chk_4',
        material_id: 'mat_dl_notes',
        project_id: 'project_transformers',
        page_number: 16,
        content: 'Residual Connections (Skip Connections): A residual block defines the output mapping as H(x) = F(x) + x, where F(x) represents the stacked weight layers. During backpropagation, the gradient of the loss with respect to x includes an additive identity term +1, allowing gradients to flow unimpeded through hundreds of layers.',
        token_count: 88
      },
      {
        id: 'chk_5',
        material_id: 'mat_dl_notes',
        project_id: 'project_transformers',
        page_number: 18,
        content: 'Layer Normalization: Unlike Batch Normalization which computes statistics across the mini-batch dimension, Layer Normalization computes the mean and variance across the feature channels for each individual sample: LN(x) = (x - mu) / sqrt(sigma^2 + epsilon) * gamma + beta. This makes it invariant to batch size.',
        token_count: 82
      }
    ];

    for (const chk of chunks) {
      this.insert('document_chunks', chk);
    }

    // 6. Concepts
    const concepts = [
      { id: 'c_gradient', project_id: 'project_transformers', name: 'Gradient Descent Optimization', description: 'Optimization dynamics and momentum-based updates', category: 'Optimization', importance_score: 9 },
      { id: 'c_backprop', project_id: 'project_transformers', name: 'Backpropagation Algorithm', description: 'Reverse-mode automatic differentiation in computational graphs', category: 'Foundations', importance_score: 10 },
      { id: 'c_attention', project_id: 'project_transformers', name: 'Scaled Dot-Product Attention', description: 'Self-attention mechanism and variance scaling factor', category: 'Transformers', importance_score: 10 },
      { id: 'c_residual', project_id: 'project_transformers', name: 'Residual Connections', description: 'Identity skip connections preventing gradient degradation', category: 'Architecture', importance_score: 9 },
      { id: 'c_layernorm', project_id: 'project_transformers', name: 'Layer Normalization', description: 'Feature-wise normalization invariant to batch sizes', category: 'Regularization', importance_score: 8 }
    ];

    for (const c of concepts) {
      this.insert('concepts', c);
      this.insert('concept_mastery', {
        id: `cm_${c.id}`,
        project_id: 'project_transformers',
        concept_id: c.id,
        concept_name: c.name,
        mastery_score: c.id === 'c_attention' ? 88 : c.id === 'c_residual' ? 76 : c.id === 'c_gradient' ? 92 : 65,
        confidence: 0.85,
        status: c.id === 'c_attention' ? 'improving' : 'stable',
        history: [
          { date: twoDaysAgo, score: 70 },
          { date: new Date().toISOString(), score: c.id === 'c_attention' ? 88 : 76 }
        ]
      });
    }

    // 7. Seed Conversation & Messages
    this.insert('conversations', {
      id: 'conv_1',
      project_id: 'project_transformers',
      user_id: 'user_demo',
      title: 'Attention & Residual Connections Deep Dive',
      created_at: twoDaysAgo
    });

    this.insert('messages', {
      id: 'msg_1',
      conversation_id: 'conv_1',
      role: 'user',
      content: 'Can you explain why scaled dot-product attention divides by the square root of d_k?',
      citations: [],
      tokens_used: 16,
      is_unsupported_question: false,
      created_at: twoDaysAgo
    });

    this.insert('messages', {
      id: 'msg_2',
      conversation_id: 'conv_1',
      role: 'assistant',
      content: 'In Scaled Dot-Product Attention, dividing by $\\sqrt{d_k}$ counteracts variance inflation. When the key dimension $d_k$ is large, the dot products grow large in magnitude, which pushes the softmax function into regions where gradients are extremely small (vanishing gradients).\n\nDividing by $\\sqrt{d_k}$ normalizes the variance of the dot products back to 1, ensuring stable gradient flow during backpropagation.\n\n**Citations:**\n> **Source:** Machine Learning & Neural Architecture Notes.pdf — *Page 14*',
      citations: [
        {
          sourceDocId: 'mat_dl_notes',
          sourceDocName: 'Machine Learning & Neural Architecture Notes.pdf',
          pageNumber: 14,
          snippet: 'The dot products of queries and keys are scaled by 1/sqrt(d_k) to prevent variance inflation from pushing softmax into regions with vanishing gradients.',
          relevanceScore: 0.95
        }
      ],
      tokens_used: 110,
      is_unsupported_question: false,
      created_at: twoDaysAgo
    });

    // 8. Persistent Context
    this.insert('persistent_context', {
      id: 'pc_demo',
      project_id: 'project_transformers',
      user_id: 'user_demo',
      learningGoals: ['Master scaled dot-product attention mathematics', 'Diagnose gradient degradation'],
      knownStrengths: ['Gradient descent convergence', 'Backpropagation graph rules'],
      knownWeaknesses: ['High-variance softmax saturation mechanics'],
      repeatedMistakes: []
    });

    console.log('✅ Database initialized successfully with MongoDB Atlas synchronization!');
  }
};

module.exports = db;
