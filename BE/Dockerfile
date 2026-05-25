# Multi-stage: generate Prisma Client, then lean runtime + prisma CLI for migrate when you add migrations
FROM node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
COPY src ./src/
RUN npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY src ./src/

# Needed for `prisma migrate deploy` / `db push` in container without keeping all devDependencies
RUN npm install prisma@6.16.1 --no-save

EXPOSE 4000

USER node

CMD ["node", "src/index.js"]
