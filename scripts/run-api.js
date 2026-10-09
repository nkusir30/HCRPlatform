// Start the HCR API in the background (detached, redirected to a log).
// Usage: node scripts/run-api.js <repo-root> [log-file]
// Resolves the API root from the repo root so it never doubles.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'hcr-platform');
const apiRoot = path.join(root, 'apps', 'api');
const logFile = process.argv[3] || path.join(root, 'tmp', 'api.log');

// Ensure the log directory exists.
const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const child = spawn(process.platform === 'win32' ? 'node.exe' : 'node', [path.join(apiRoot, 'dist', 'main')], {
  cwd: apiRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true,
  shell: false,
});

const log = fs.createWriteStream(logFile, { flags: 'a' });
child.stdout.on('data', (d) => log.write(d));
child.stderr.on('data', (d) => log.write(d));

child.on('error', (err) => {
  console.error('Failed to start API:', err.message);
  process.exit(1);
});

child.on('close', (code) => {
  console.error('API process exited with code', code);
  process.exit(code ?? 0);
});

console.log('Started API (pid ' + child.pid + ') writing to ' + logFile);
