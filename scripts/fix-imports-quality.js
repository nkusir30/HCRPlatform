/**
 * Auto-fixes import hygiene issues across the API source tree:
 *   - removes unused named-import specifiers (and empty import statements)
 *   - de-duplicates specifiers within an import statement
 *   - adds missing decorator imports (@IsXxx, @Min*, @Max*, PartialType, ...)
 *     by cross-referencing where each identifier is imported elsewhere in src.
 *
 * Usage: node scripts/fix-imports-quality.js        (dry run)
 *        node scripts/fix-imports-quality.js --write (apply)
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'apps', 'api', 'src');
const WRITE = process.argv.includes('--write');

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

// --- Pass A: identifier -> module map from every named import in src. ---
const provider = new Map();
const IMPORT_GLOBAL_RE = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  IMPORT_GLOBAL_RE.lastIndex = 0;
  while ((m = IMPORT_GLOBAL_RE.exec(text)) !== null) {
    for (const raw of m[1].split(',')) {
      const spec = raw.trim().replace(/\/\*.*?\*\//g, '');
      if (!spec) continue;
      const local = spec.includes(' as ') ? spec.split(' as ')[1].trim() : spec;
      if (!provider.has(local)) provider.set(local, new Map());
      const mods = provider.get(local);
      mods.set(m[2], (mods.get(m[2]) || 0) + 1);
    }
  }
}

function resolveModule(identifier) {
  const mods = provider.get(identifier);
  if (!mods) return null;
  const entries = [...mods.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length > 1 && entries[0][1] === entries[1][1]) return null; // ambiguous
  return entries[0][0];
}

// --- Pass B: rewrite each file. ---
const IMPORT_RE = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*(['"])([^'"]+)\3;?/g;

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const rel = path.relative(SRC, file);

  // Body with import statements blanked out (usage analysis).
  const spans = [];
  IMPORT_RE.lastIndex = 0;
  let m;
  while ((m = IMPORT_RE.exec(original)) !== null) spans.push([m.index, m.index + m[0].length]);
  let body = original;
  for (const [s, e] of [...spans].sort((a, b) => b[0] - a[0])) {
    body = body.slice(0, s) + ' '.repeat(e - s) + body.slice(e);
  }
  body = body.replace(/export\s+\{[^}]+\}\s+from\s*['"][^'"]+['"];?/g, '');

  // Candidate identifiers used in body but not imported in this file.
  const importedNow = new Set();
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(original)) !== null) {
    for (const raw of m[2].split(',')) {
      const spec = raw.trim();
      if (!spec) continue;
      importedNow.add(spec.includes(' as ') ? spec.split(' as ')[1].trim() : spec);
    }
  }
  const CANDIDATE_RE = /^(Is[A-Z]|Min$|Max$|MinLength$|MaxLength$|Matches$|Length$|PartialType$|OmitType$|PickType$|IntersectionType$)/;
  const missing = new Set();
  const decoRe = /@([A-Za-z_$][\w$]*)\s*\(/g;
  let d;
  while ((d = decoRe.exec(body)) !== null) {
    if (CANDIDATE_RE.test(d[1]) && !importedNow.has(d[1])) missing.add(d[1]);
  }
  for (const name of ['PartialType', 'OmitType', 'PickType', 'IntersectionType']) {
    if (!importedNow.has(name) && new RegExp(`\\b${name}\\b`).test(body)) missing.add(name);
  }

  const additions = new Map(); // modulePath -> [identifiers]
  for (const name of missing) {
    const mod = resolveModule(name);
    if (!mod) continue;
    if (!additions.has(mod)) additions.set(mod, []);
    additions.get(mod).push(name);
  }

  // Rewrite: remove unused / dedupe / append additions to matching imports.
  let text = original;
  IMPORT_RE.lastIndex = 0;
  text = text.replace(IMPORT_RE, (stmt, typeKw, specList, q, modPath) => {
    const specs = specList
      .split(',')
      .map((s) => s.trim().replace(/\/\*.*?\*\//g, ''))
      .filter(Boolean);

    const seen = new Set();
    const kept = [];
    let modified = false;
    for (const spec of specs) {
      const local = spec.includes(' as ') ? spec.split(' as ')[1].trim() : spec;
      if (seen.has(local)) {
        modified = true;
        continue; // duplicate
      }
      const used = new RegExp(`\\b${local.replace(/\$/g, '\\$')}\\b`).test(body);
      if (!used) {
        modified = true;
        continue; // unused
      }
      seen.add(local);
      kept.push(spec);
    }

    if (additions.has(modPath)) {
      for (const add of [...additions.get(modPath)]) {
        if (!seen.has(add)) {
          kept.push(add);
          seen.add(add);
          modified = true;
        }
        additions.delete(modPath);
      }
    }

    if (!modified) return stmt;
    if (kept.length === 0) return '';
    return `import ${typeKw || ''}{ ${kept.join(', ')} } from ${q}${modPath}${q};`;
  });

  // Create new import statements for modules not already imported in this file.
  for (const [modPath, names] of additions) {
    if (names.length === 0) continue;
    const line = `import { ${names.join(', ')} } from '${modPath}';`;
    const importMatches = [...text.matchAll(/^import[\s\S]*?;$/gm)];
    if (importMatches.length) {
      const last = importMatches[importMatches.length - 1];
      const insertAt = last.index + last[0].length;
      text = text.slice(0, insertAt) + '\n' + line + text.slice(insertAt);
    } else {
      text = line + '\n' + text;
    }
    console.log(`  + ${rel}: ${line}`);
  }

  text = text.replace(/\n{3,}/g, '\n\n');

  // Collapse leftover blank lines from fully removed imports.
  text = text.replace(/\n{3,}/g, '\n\n');

  if (text !== original) {
    changed++;
    if (WRITE) fs.writeFileSync(file, text);
    console.log(`${WRITE ? 'fixed' : 'would fix'}: ${path.relative(SRC, file)}`);
  }
}
console.log(`\n${changed} file(s) ${WRITE ? 'rewritten' : 'would change'}`);