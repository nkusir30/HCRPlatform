FROM node:20-alpine AS base
WORKDIR /app/apps/web

COPY hcr-platform/apps/web/package.json ./package.json
# Full install: devDeps (typescript, tailwind, postcss) are needed to build
RUN npm install

COPY hcr-platform/apps/web/app ./app
COPY hcr-platform/apps/web/components ./components
COPY hcr-platform/apps/web/lib ./lib
COPY hcr-platform/apps/web/providers ./providers
COPY hcr-platform/apps/web/styles ./styles
COPY hcr-platform/apps/web/public ./public
COPY hcr-platform/apps/web/tailwind.config.ts ./tailwind.config.ts
COPY hcr-platform/apps/web/postcss.config.* ./
COPY hcr-platform/apps/web/tsconfig.json ./tsconfig.json
COPY hcr-platform/apps/web/next.config.js ./next.config.js

# NEXT_PUBLIC_API_URL is baked at build time; default points at the Render API
ARG NEXT_PUBLIC_API_URL=https://hcr-api.onrender.com/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
