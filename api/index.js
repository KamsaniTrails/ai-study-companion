// Vercel Serverless Function Entrypoint
// Exports the decoupled Express app instance to handle serverless requests
const { app } = require('../server/app');

module.exports = app;
