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

Sau đó chỉnh biến môi trường:

- **CORS:** `CORS_ORIGIN` — URL FE (Vercel), ví dụ `https://hina-japanese-app.vercel.app` (phân tách bằng dấu phẩy nếu nhiều origin)
- **Supabase Auth:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **Database:** `DATABASE_URL` / `DIRECT_URL`
  - Local Postgres (Docker): chỉ cần `DATABASE_URL`
  - Supabase: pooler + direct — xem `docs/SUPABASE.md`

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

