#!/usr/bin/env node
// Deploy pending Prisma migrations against a Docker Postgres.
// Run from the repo root: node scripts/migrate-deploy.js <repo-root>
const { execSync } = require('child_process');

const root = process.argv[2] || 'hcr-platform';
const url = process.env.DATABASE_URL || 'postgresql://hcr:hcrpassword@localhost:5432/hcr?schema=public';
process.env.DATABASE_URL = url;

const cmd = `npx prisma migrate deploy --schema "${root}/prisma/schema.prisma"`;
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

console.log('OK: migration deployed');
