const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const db = require('./db');
const { FaissVectorStore } = require('./services/faissVectorStore');
const { DocumentProcessor } = require('./services/documentProcessor');
const { WorkflowEngine } = require('./services/workflowEngine');
const { apiRouter } = require('./routes/api');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Security Hardening Headers (PRD Section 15 & Security Guide Section 7)
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;");
  next();
});

// Uploads Static Directory (local or /tmp fallback)
const isVercel = Boolean(process.env.VERCEL);
const uploadsPath = isVercel
  ? path.join('/tmp', 'uploads')
  : path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsPath)) {
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
  } catch (e) {
    console.warn('[Storage] Could not create uploads directory:', e.message);
  }
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api', apiRouter);

// Health Endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    environment: isVercel ? 'vercel-serverless' : 'node-container',
    timestamp: new Date().toISOString()
  });
});

// Full-Stack Production Deployment: Serve frontend static assets if built locally
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global initialization flag to ensure single init across serverless invocations
let isInitialized = false;
function initApp() {
  if (!isInitialized) {
    try {
      db.init();
      FaissVectorStore.init();
      DocumentProcessor.init();
      WorkflowEngine.init();
      isInitialized = true;
    } catch (err) {
      console.error('[Init] Error initializing background services:', err.message);
    }
  }
}

initApp();

module.exports = { app, initApp };
