-- Chạy trên Supabase SQL Editor nếu chưa dùng `prisma db push`

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_level text DEFAULT 'N3',
  ADD COLUMN IF NOT EXISTS total_study_minutes integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_created
  ON public.user_activity_log (user_id, created_at DESC);
