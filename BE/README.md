# LearningLanguageApp Backend (Fastify + Prisma)

## Docs

- Project setup: `docs/SETUP.md`
- Supabase setup: `docs/SUPABASE.md`

## Requirements

- Node.js 20+
- Docker Desktop

## Setup

Copy env:

```bash
cp .env.example .env
```

Start Postgres:

```bash
docker compose up -d
```

Install deps + generate Prisma client:

```bash
npm i
npm run prisma:generate
```

Run migrations (creates tables):

```bash
npm run prisma:migrate
```

Start server:

```bash
npm run dev
```

## Endpoints

- `GET /health` -> `{ ok: true }`
- `GET /lessons` -> `{ data: LessonDto[] }`

