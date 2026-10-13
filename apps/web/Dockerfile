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

# NEXT_PUBLIC_* are baked at build time; the org/company ids must match the
# Postgres rows created by prisma/seed.ts, otherwise every write FK-fails.
ARG NEXT_PUBLIC_API_URL=https://hcr-api.onrender.com/api
ARG NEXT_PUBLIC_ORG_ID=clxorg0001hcrplatformdemo
ARG NEXT_PUBLIC_COMPANY_ID=clxco00001hcrplatformdemo
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ORG_ID=${NEXT_PUBLIC_ORG_ID}
ENV NEXT_PUBLIC_COMPANY_ID=${NEXT_PUBLIC_COMPANY_ID}

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
