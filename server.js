const path = require('path');
const fs = require('fs');

console.log('[Homie Startup] Starting from:', __dirname);

let targetDir = __dirname;
let entryFile = path.join(__dirname, 'dist', 'server.js');

if (fs.existsSync(path.join(__dirname, 'backend', 'dist', 'server.js'))) {
  targetDir = path.join(__dirname, 'backend');
  entryFile = path.join(targetDir, 'dist', 'server.js');
}

process.chdir(targetDir);
try {
  require(entryFile);
} catch (err) {
  console.error('[Homie Startup] Fatal error during startup:', err);
  process.exit(1);
}
