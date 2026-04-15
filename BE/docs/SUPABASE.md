# Supabase setup & connection (Prisma)

Backend này kết nối Supabase Postgres theo best-practice của Prisma:

- **`DATABASE_URL`**: dùng **pooler/transaction** (PgBouncer) cho runtime
- **`DIRECT_URL`**: dùng **direct connection** cho `db pull`, `migrate`, `introspect`

## 1) Lấy connection strings trên Supabase

Supabase Dashboard → Project → **Project Settings** → **Database** → **Connection string**

Bạn sẽ thấy 2 loại:

- **Transaction pooler** (port thường `6543`, host dạng `*.pooler.supabase.com`)
- **Direct connection** (port `5432`, host dạng `db.<project_ref>.supabase.co`)

## 2) Cấu hình `.env`

Trong `BE/.env`:

```env
# Transaction pooler (runtime)
DATABASE_URL="postgresql://<pooler_user>:<URL_ENCODED_PASSWORD>@<pooler_host>:6543/postgres?pgbouncer=true&sslmode=require"

# Direct connection (migrations / db pull)
DIRECT_URL="postgresql://postgres:<URL_ENCODED_PASSWORD>@db.<project_ref>.supabase.co:5432/postgres?sslmode=require"
```

### URL-encode password (rất quan trọng)

Nếu password có ký tự đặc biệt (ví dụ `?`, `@`, `#`, `/`, `:`), bạn phải URL-encode trong connection string.

Ví dụ:

- `?` → `%3F`
- `@` → `%40`
- `#` → `%23`
- `/` → `%2F`
- `:` → `%3A`

## 3) Prisma schema cho Supabase (multi-schema)

Vì nhiều bảng app (`public.*`) có FK sang `auth.users`, Prisma datasource cần multi-schema:

- `schemas = ["auth", "public"]`
- `directUrl = env("DIRECT_URL")`

## 4) DB đã tạo bảng sẵn trên Supabase (khuyến nghị)

Nếu bạn đã chạy SQL và tạo sẵn tables trên Supabase, thì **không dùng** `prisma migrate dev` để tạo bảng nữa.

Thay vào đó, pull schema:

```bash
npx prisma db pull
npx prisma generate
```

Khi DB thay đổi, chạy lại 2 lệnh trên để Prisma cập nhật models.

## 5) RLS (Row Level Security)

Supabase thường bật RLS. Prisma/BE kết nối bằng DB password thường sẽ truy cập được,
nhưng bạn vẫn cần cấu hình policies đúng theo yêu cầu sản phẩm.

Nếu một endpoint trả về rỗng hoặc bị `permission denied`, kiểm tra policies của bảng đó trên Supabase.

