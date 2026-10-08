const fs = require('fs');
const path = require('path');

// Helper to write a JSON file safely
function writeJson(relPath, obj) {
  const full = path.join(__dirname, relPath);
  fs.writeFileSync(full, JSON.stringify(obj, null, 2) + '\n');
  console.log(`Wrote ${relPath}`);
}

// ============ ROOT ============
const root = {
  name: 'hcr-platform',
  version: '0.1.0',
  private: true,
  description: 'Home Care Residential - Payroll & HR SaaS rebuild (PAYWEBSERV modernization)',
  license: 'UNLICENSED',
  workspaces: {
    packages: ['apps/*', 'packages/*']
  },
  scripts: {
    dev: 'concurrently -n api,web "pnpm --filter api dev" "pnpm --filter web dev"',
    install_all: 'pnpm install --frozen-lockfile',
    prisma_generate: 'pnpm --filter api prisma:generate',
    prisma_migrate: 'pnpm --filter api prisma:migrate',
    db_push: 'pnpm --filter api prisma db push',
    db_seed: 'pnpm --filter api db:seed',
    build: 'pnpm --filter api build && pnpm --filter web build',
    typecheck: 'pnpm --filter api typecheck && pnpm --filter web typecheck',
    lint: 'eslint . --ext ts,tsx,js,jsx --report-unused-disable-directives --max-warnings 0',
    format: 'prettier --write "apps/**/*.{ts,tsx,js,jsx,json,md}"'
  },
  devDependencies: {
    '@types/node': '^20.12.0',
    '@types/prettier': '^3.0.0',
    concurrently: '^8.2.2',
    eslint: '^8.57.0',
    'eslint-plugin-react': '^7.34.1',
    'eslint-plugin-react-hooks': '^4.6.0',
    husky: '^8.0.0',
    lint_staged: '^15.2.0',
    prettier: '^3.2.5',
    typescript: '^5.4.0'
  },
  engines: { node: '>=20.0.0' },
  pnpm: {
    overrides: {
      prisma: '5.14.0',
      '@types/bcrypt': '^5.0.0'
    }
  }
};
writeJson('package.json', root);
