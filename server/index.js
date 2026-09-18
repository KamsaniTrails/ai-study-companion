const { app } = require('./app');

const PORT = process.env.PORT || 4000;

function start() {
  console.log('🚀 Booting AI Study Companion Backend (Pure JavaScript)...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`Backend Server running on: http://0.0.0.0:${PORT}`);
    console.log(`Health Check:              http://0.0.0.0:${PORT}/health`);
    console.log(`Database format:           Readable JSON (server/data/db.json)`);
    console.log('====================================================');
  });
}

start();
