// Azure App Service Entry Point
console.log('[Homie Startup] Starting backend from:', __dirname);
try {
  require('./dist/server.js');
} catch (err) {
  console.error('[Homie Startup] Fatal error during startup:', err);
  process.exit(1);
}
