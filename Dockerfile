// HCRPlatform web service — Render Docker build.
// dockerContext = repo root (contents of hcr-platform/), so paths are relative
// to that root: apps/web/*, etc.
FROM node:20-alpine AS base
WORKDIR /app/apps/web

# Install deps first for layer caching.
COPY apps/web/package.json ./package.json
RUN npm install

# Copy the whole web app (robust: avoids per-file COPY misses like public/).
COPY apps/web ./

# NEXT_PUBLIC_API_URL is baked in at build time; override with Render build arg.
ARG NEXT_PUBLIC_API_URL=https://hcr-api.onrender.com/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Preview build: don't let stray type/lint issues (e.g. an unused sonner import
# in a non-routed file) block the deploy. Webpack still only bundles reachable
# modules, so runtime is unaffected.
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "npx --no-install next start -p ${PORT:-3000}"]
