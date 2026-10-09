// Compile the HCR API (NestJS).
// Usage: node scripts/build-api.js <repo-root>
// Runs the TypeScript compiler from the API's node_modules, so no npx wrapper is
// needed (this Windows shell blocks npx.ps1 / Powershell script execution).
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.argv[2] || 'hcr-platform';
const apiRoot = path.join(root, 'apps', 'api');
process.chdir(apiRoot);

const cmd = 'node ' + path.join('node_modules', 'typescript', 'bin', 'tsc') + ' --pretty false';
console.log('$', cmd);

let out;
try {
  out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  console.log(out);
} catch (e) {
  const s = (x) => (x && x.toString ? x.toString('utf8') : x);
  console.error('STDOUT:', s(e.stdout));
  console.error('STDERR:', s(e.stderr));
  console.error('exit', e.status);
  process.exit(e.status ?? 1);
}

// Write the log to the repo root (NOT the API's CWD, which we chdir'd into).
const rootTmp = path.join(root, 'tmp');
if (!fs.existsSync(rootTmp)) fs.mkdirSync(rootTmp, { recursive: true });
fs.writeFileSync(path.join(rootTmp, 'tsc-build.log'), out);
console.log('OK: API compiled');
