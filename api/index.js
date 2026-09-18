// Vercel Serverless Function Entrypoint
// Polyfill browser globals if running in headless serverless Node.js
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData {};
}
if (typeof global.Path2D === 'undefined') {
  global.Path2D = class Path2D {};
}

const { app } = require('../server/app');

module.exports = app;
