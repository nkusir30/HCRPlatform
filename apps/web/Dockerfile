FROM node:20-alpine AS base
WORKDIR /app/apps/web

COPY apps/web/package.json ./package.json
# Full install: devDeps (typescript, tailwind, postcss) are needed to build
RUN npm install

COPY apps/web/app ./app
COPY apps/web/components ./components
COPY apps/web/lib ./lib
COPY apps/web/providers ./providers
COPY apps/web/styles ./styles
COPY apps/web/public ./public
COPY apps/web/tailwind.config.ts ./tailwind.config.ts
COPY apps/web/postcss.config.* ./
COPY apps/web/tsconfig.json ./tsconfig.json
COPY apps/web/next.config.js ./next.config.js

# NEXT_PUBLIC_API_URL is baked at build time; default points at the Render API
ARG NEXT_PUBLIC_API_URL=https://hcr-api.onrender.com/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
