# Deployment + Maintenance Guide
`docker compose up --build` → web:3000, api:4000, postgres:5432, redis:6379.
Migrate: `pnpm --filter api prisma migrate deploy`. Seed HCR tenant (company +
5 programs + 14-day periods + 3 shift templates). CI: lint→test(80%+)→build→
migrate→deploy staging→promote. Secrets via manager. Backups daily PITR 30d.
