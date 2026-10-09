FROM node:20-alpine AS base
WORKDIR /app

# API package manifest first (better layer cache)
# NOTE: build context is the hcr-platform/ directory (Render: dockerContext hcr-platform
# in ECC repo, or repo root in HCRPlatform repo) — so paths are relative, no hcr-platform/ prefix.
COPY apps/api/package.json ./apps/api/package.json
# Full install: devDeps (typescript, @nestjs/cli, prisma) are needed to build
WORKDIR /app/apps/api
RUN npm install

# Copy API source + shared prisma schema + scripts
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/nest-cli.json ./nest-cli.json
COPY prisma /app/prisma

# Generate Prisma client against the shared schema
RUN npx prisma generate --schema /app/prisma/schema.prisma

# Build (needs @nestjs/cli + typescript from devDeps)
RUN npm run build

EXPOSE 4000
ENV NODE_ENV=production
ENV APP_PORT=4000

# Render provides $PORT and $DATABASE_URL; migrate then start
CMD ["sh", "-c", "npx prisma migrate deploy --schema /app/prisma/schema.prisma || true; NODE_ENV=production node dist/main"]
