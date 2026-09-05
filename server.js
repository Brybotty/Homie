const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('[Homie Startup] Starting from:', __dirname);

let targetDir = __dirname;
let entryFile = path.join(__dirname, 'dist', 'server.js');

if (fs.existsSync(path.join(__dirname, 'backend', 'dist', 'server.js'))) {
  targetDir = path.join(__dirname, 'backend');
  entryFile = path.join(targetDir, 'dist', 'server.js');
}

const expressPath = path.join(targetDir, 'node_modules', 'express');
if (!fs.existsSync(expressPath)) {
  console.log(`[Homie Startup] Express not found in ${targetDir}. Installing production dependencies...`);
  try {
    execSync('npm install --omit=dev --no-audit --no-fund', { stdio: 'inherit', cwd: targetDir });
    console.log('[Homie Startup] Dependencies installed successfully!');
  } catch (err) {
    console.error('[Homie Startup] Error installing dependencies:', err);
  }
}

process.chdir(targetDir);
require(entryFile);
