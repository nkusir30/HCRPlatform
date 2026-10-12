// CLI importer for HCR users/employees.
// Usage: IMPORT_SOURCE=./prisma/import-source.json npm run import:users
//        IMPORT_SOURCE=./dump.sql npm run import:users
// Reads a JSON array, NDJSON, plain lines, or simple INSERT..VALUES SQL and
// upserts Users + Employees through the Prisma client (idempotent by email /
// employeeCode). All writes hit the real schema — never hand-rolled SQL.
import { PrismaService } from '../database/prisma/prisma.service';
import { UsersEmployeesImportService } from './service';

const prisma = new PrismaService();

function parseRows(raw: string): any[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith('INSERT')) {
    const rows: any[] = [];
    const re = /INSERT\s+INTO\s+(?:public\.)?users\s+\([^)]*\)\s+VALUES\s*\(([^)]*)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
      const parts = m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, ''));
      rows.push({ email: parts[0], name: parts[2], firstName: parts[3], lastName: parts[4], phone: parts[5] });
    }
    return rows;
  }
  if (trimmed.startsWith('[')) return JSON.parse(trimmed);
  if (trimmed.includes('\n')) {
    // NDJSON if first line parses as JSON, otherwise treat each line as CSV-ish email.
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    try {
      return lines.map((l) => JSON.parse(l));
    } catch {
      return lines.map((l) => ({ email: l }));
    }
  }
  return JSON.parse(trimmed);
}

async function main() {
  const source = process.env.IMPORT_SOURCE;
  if (!source) {
    console.error('IMPORT_SOURCE env var is required (path to a JSON/NDJSON/SQL file).');
    process.exit(1);
  }
  const raw = require('fs').readFileSync(source, 'utf8');
  const rows = parseRows(raw);
  console.log(`Importing ${rows.length} row(s) from ${source}...`);

  const service = new UsersEmployeesImportService(prisma);
  const dryRun = process.argv.includes('--dry-run');
  const stats = dryRun ? await service.dryRun(rows) : await service.import(rows);
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
