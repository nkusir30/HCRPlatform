/**
 * Checks for import hygiene issues across the API source tree (no tsc needed):
 *   1. Imported identifiers that are never used in the file body.
 *   2. Decorators that look like class-validator helpers (@IsXxx, @Min*, @Max*)
 *      that are used but never imported.
 *   3. Duplicate identifiers imported twice in the same statement/file.
 *
 * Usage: node scripts/check-imports-quality.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'apps', 'api', 'src');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const problems = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(SRC, file);

  // Collect named import bindings: import { A, B as C } from '...';
  const imported = new Map(); // localName -> [specifier]
  const importRe = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s*['"][^'"]+['"];?/g;
  let m;
  const importSpans = [];
  while ((m = importRe.exec(text)) !== null) {
    importSpans.push([m.index, m.index + m[0].length]);
    for (const raw of m[1].split(',')) {
      const spec = raw.trim().replace(/\/\*.*?\*\//g, '');
      if (!spec) continue;
      const local = spec.includes(' as ') ? spec.split(' as ')[1].trim() : spec;
      if (!imported.has(local)) imported.set(local, []);
      imported.get(local).push(spec);
    }
  }

  // Body = file with import statements blanked out (keep offsets simple).
  let body = text;
  for (const [start, end] of importSpans.sort((a, b) => b[0] - a[0])) {
    body = body.slice(0, start) + ' '.repeat(end - start) + body.slice(end);
  }
  // Also blank out `export { X } from '...'` re-exports.
  body = body.replace(/export\s+\{[^}]+\}\s+from\s*['"][^'"]+['"];?/g, '');

  // 1. Unused imports.
  for (const [local, specs] of imported) {
    if (specs.length > 1) {
      problems.push(`${rel}: duplicate import of "${local}"`);
    }
    const useRe = new RegExp(`\\b${local.replace(/[$]/g, '\\$')}\\b`);
    if (!useRe.test(body)) {
      problems.push(`${rel}: unused import "${local}"`);
    }
  }

  // 2. Used but not imported (class-validator-style decorators + PartialType etc.)
  const decoRe = /@([A-Za-z_$][\w$]*)\s*\(/g;
  const candidates = new Set(['PartialType', 'OmitType', 'PickType', 'IntersectionType']);
  let d;
  while ((d = decoRe.exec(body)) !== null) {
    const name = d[1];
    if (/^(Is[A-Z]|Min$|Max$|MinLength$|MaxLength$|Matches$|Length$)/.test(name) || candidates.has(name)) {
      if (!imported.has(name)) {
        problems.push(`${rel}: uses @${name}( but "${name}" is not imported`);
      }
    }
  }
}

if (problems.length === 0) {
  console.log('ALL IMPORTS CLEAN');
} else {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s)`);
}