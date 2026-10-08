const fs = require('fs');
const path = require('path');

function writeJson(relPath, obj) {
  // __dirname is scripts/, so go up one level for the monorepo root
  const rootDir = path.resolve(__dirname, '..');
  const full = path.join(rootDir, relPath);
  fs.writeFileSync(full, JSON.stringify(obj, null, 2) + '\n');
  console.log(`Wrote ${relPath}`);
}

// ============ API ============
const api = {
  name: 'api',
  version: '0.1.0',
  private: true,
  description: 'NestJS API for HCR Payroll & HR SaaS',
  license: 'UNLICENSED',
  scripts: {
    dev: 'NODE_ENV=development nest start --watch',
    dev_debug: 'NODE_ENV=development nest start --debug --watch',
    build: 'nest build',
    start: 'NODE_ENV=production node dist/main',
    prisma_generate: 'prisma generate',
    prisma_migrate: 'prisma migrate dev',
    prisma_reset: 'prisma migrate reset --force',
    db_seed: 'ts-node -r tsconfig-paths/register prisma/seed.ts',
    typecheck: 'tsc --noEmit',
    lint: 'eslint src --ext ts --report-unused-disable-directives --max-warnings 0'
  },
  dependencies: {
    '@nestjs/common': '^10.0.0',
    '@nestjs/core': '^10.0.0',
    '@nestjs/platform-express': '^10.0.0',
    '@nestjs/jwt': '^10.2.0',
    '@nestjs/passport': '^10.0.3',
    '@nestjs/mapped-types': '^1.0.0',
    '@prisma/client': '^5.14.0',
    bcrypt: '^5.1.1',
    'class-transformer': '^0.5.1',
    'class-validator': '^0.14.1',
    'cookie-parser': '^1.4.6',
    cuid: '^2.1.1',
    dotenv: '^16.4.5',
    passport: '^0.7.0',
    'passport-jwt': '^4.0.1',
    'passport-local': '^1.0.0',
    reflect_metadata: '^0.2.0',
    rxjs: '^7.8.1',
    zod: '^3.23.8'
  },
  devDependencies: {
    '@nestjs/cli': '^10.0.0',
    '@nestjs/schematics': '^10.0.0',
    '@types/bcrypt': '^5.0.2',
    '@types/cookie-parser': '^1.4.7',
    '@types/passport-jwt': '^4.0.1',
    '@types/passport-local': '^1.0.38',
    '@types/validator': '^13.12.0',
    prisma: '^5.14.0',
    'ts-node': '^10.9.2',
    tsconfig_paths: '^4.2.0'
  }
};
writeJson('apps/api/package.json', api);

// ============ WEB ============
const web = {
  name: 'web',
  version: '0.1.0',
  private: true,
  description: 'Next.js 15 web app for HCR Payroll & HR SaaS',
  license: 'UNLICENSED',
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    typecheck: 'tsc --noEmit',
    lint: 'next lint',
    format: 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"'
  },
  dependencies: {
    '@hookform/resolvers': '^3.9.0',
    '@prisma/client': '^5.14.0',
    '@tanstack/react-query': '^5.59.0',
    '@tanstack/react-query-devtools': '^5.59.0',
    bcryptjs: '^2.4.3',
    'class-variance-authority': '^0.7.0',
    clsx: '^2.1.1',
    'date-fns': '^3.6.0',
    jsonwebtoken: '^9.0.2',
    'lucide-react': '^0.453.0',
    next: '^15.0.3',
    next_auth: '^4.24.10',
    passport: '^0.7.0',
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    'react-hook-form': '^7.52.0',
    'tailwind-merge': '^2.5.0',
    zod: '^3.23.8',
    zustand: '^5.0.1'
  },
  devDependencies: {
    '@types/bcryptjs': '^2.4.6',
    '@types/jsonwebtoken': '^9.0.7',
    '@types/node': '^20.14.0',
    '@types/react': '^19.0.0',
    '@types/react-dom': '^19.0.0',
    eslint: '^8.57.0',
    'eslint-config-next': '^15.0.3',
    postcss: '^8.4.39',
    prettier: '^3.2.5',
    tailwindcss: '^3.4.3',
    twan: '^3.4.3',
    typescript: '^5.4.0'
  }
};
writeJson('apps/web/package.json', web);

console.log('DONE');
