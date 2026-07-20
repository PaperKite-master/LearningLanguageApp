-- Chạy trên Supabase SQL Editor (Dashboard → SQL → New query)
-- Không dùng `prisma db push` trên repo này vì schema gồm cả `auth.*` (Supabase quản lý, không có quyền owner).

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS subtitles jsonb;
