const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./db');
const { DocumentProcessor } = require('./services/documentProcessor');
const { WorkflowEngine } = require('./services/workflowEngine');
const { apiRouter } = require('./routes/api');

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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

const fs = require('fs');

const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Full-Stack Production Deployment: Serve frontend static assets if built
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

function start() {
  console.log('🚀 Booting AI Study Companion Backend (Pure JavaScript)...');
  db.init();
  DocumentProcessor.init();
  WorkflowEngine.init();

  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`Backend Server running on: http://localhost:${PORT}`);
    console.log(`Health Check:              http://localhost:${PORT}/health`);
    console.log(`Database format:           Readable JSON (server/data/db.json)`);
    console.log('====================================================');
  });
}

start();
