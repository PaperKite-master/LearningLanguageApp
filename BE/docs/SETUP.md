# Backend setup (Fastify + Prisma)

## Requirements

- Node.js 20+
- (Optional) Docker Desktop nếu bạn chạy Postgres local

## Install

Trong thư mục `BE/`:

```bash
npm i
```

## Environment variables

Copy file env mẫu:

```bash
cp .env.example .env
```

Sau đó chỉnh `DATABASE_URL` / `DIRECT_URL` theo môi trường bạn dùng:

- Local Postgres (Docker): chỉ cần `DATABASE_URL`
- Supabase: cần `DATABASE_URL` (pooler) + `DIRECT_URL` (direct) — xem `docs/SUPABASE.md`

## Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Nếu bạn dùng **DB đã có sẵn** (Supabase đã tạo bảng), dùng:

```bash
npx prisma db pull
npx prisma generate
```

## Run server

```bash
npm run dev
```

Mặc định chạy ở `PORT=4000` (xem `.env`).

## Swagger

- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /docs/json`

## Quick test

- `GET /health`
- `GET /lessons`

