// Azure App Service Entry Point
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('[Homie Startup] Starting from:', __dirname);

const expressPath = path.join(__dirname, 'node_modules', 'express');
if (!fs.existsSync(expressPath)) {
  console.log('[Homie Startup] Express not found. Installing production dependencies on Azure...');
  try {
    execSync('npm install --omit=dev --no-audit --no-fund', { stdio: 'inherit', cwd: __dirname });
    console.log('[Homie Startup] Dependencies installed successfully!');
  } catch (err) {
    console.error('[Homie Startup] Error installing dependencies:', err);
  }
}

require('./dist/server.js');
