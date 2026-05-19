# Docker

## Chạy full stack (Postgres + API + giao diện)

Từ thư mục gốc của repo (`LearningLanguageApp` chứa `BE/` và `FE/`):

```bash
docker compose up --build
```

- **Web (nginx + React build):** http://localhost:3000 — request tới `/api` được chuyển tới container API.
- **API (Fastify):** http://localhost:4000
- **Postgres:** `localhost:5432` (user/password/db giống `BE/docker-compose.yml`)

## Chỉ chạy database

```bash
cd BE
docker compose up -d
```

Hoặc từ gốc repo: `docker compose up -d db`.

## Schema cơ sở dữ liệu (Prisma)

Trong `BE/prisma` hiện **chưa có** thư mục `migrations`. Với Postgres trống trong Docker:

- Nếu bạn dùng **Supabase** (hoặc DB đã có schema): set `DATABASE_URL` / `DIRECT_URL` trỏ tới DB đó (ví dụ qua file `.env` khi chạy API ngoài Docker, hoặc sửa `environment` của service `api` trong `docker-compose.yml`).
- Nếu muốn **đồng bộ schema từ `schema.prisma` lên Postgres local trong Docker** (phù hợp môi trường dev, cẩn thận với dữ liệu):

  ```bash
  docker compose exec api npx prisma db push
  ```

Khi đã có migration, có thể dùng:

```bash
docker compose exec api npx prisma migrate deploy
```

## Build riêng từng image (ví dụ chuẩn bị deploy Render)

```bash
docker build -t learning-language-api ./BE
docker build -t learning-language-web ./FE
```

Trên Render, chọn **Docker** và đặt **Dockerfile path** lần lượt là `BE/Dockerfile` và `FE/Dockerfile` (root repo trùng với context chứa `BE` / `FE`).

## Ghi chú FE

- Mặc định axios dùng prefix `/api`. Trong Docker, nginx trên container `web` proxy `/api/` sang service `api:4000`, giống proxy trong `vite.config.js` khi dev.
- Xem `FE/.env.example`: `VITE_DEV_API_PROXY` (dev), `VITE_API_BASE_URL` (build khi FE và BE khác domain). Build image Docker với API tách host: `docker build -f FE/Dockerfile --build-arg VITE_API_BASE_URL=https://your-api.example.com ./FE`.
