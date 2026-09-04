const path = require('path');
const fs = require('fs');

console.log('Starting Homie Backend from:', __dirname);
if (fs.existsSync(path.join(__dirname, 'backend', 'dist', 'server.js'))) {
  console.log('Found backend/dist/server.js, switching directory to backend...');
  process.chdir(path.join(__dirname, 'backend'));
  require(path.join(__dirname, 'backend', 'dist', 'server.js'));
} else if (fs.existsSync(path.join(__dirname, 'dist', 'server.js'))) {
  console.log('Found dist/server.js, starting...');
  require(path.join(__dirname, 'dist', 'server.js'));
} else {
  console.error('ERROR: server.js could not locate backend/dist/server.js or dist/server.js');
  console.log('Files present in directory:', fs.readdirSync(__dirname));
}
