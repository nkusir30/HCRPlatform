const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'apps', 'api', 'src');
const missing = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.ts')) {
      const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
      lines.forEach((line, i) => {
        const m = line.match(/from\s+'(\.[^']+)'/);
        if (!m) return;
        const base = path.resolve(dir, m[1]);
        const found =
          fs.existsSync(base + '.ts') ||
          fs.existsSync(base + '.tsx') ||
          fs.existsSync(path.join(base, 'index.ts'));
        if (!found) {
          missing.push(`${path.relative(src, full)}:${i + 1} -> ${m[1]}`);
        }
      });
    }
  }
}

walk(src);
if (missing.length === 0) console.log('ALL RELATIVE IMPORTS RESOLVE');
else missing.forEach((m) => console.log('MISSING: ' + m));
