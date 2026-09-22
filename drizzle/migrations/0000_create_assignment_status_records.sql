CREATE TABLE public.assignment_status_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  programme text NOT NULL,
  course_code text NOT NULL,
  session text,
  status text,
  marks text,
  remarks text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, programme, course_code, session)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_status_records TO authenticated;
GRANT ALL ON public.assignment_status_records TO service_role;

ALTER TABLE public.assignment_status_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own assignment status"
ON public.assignment_status_records FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own assignment status"
ON public.assignment_status_records FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own assignment status"
ON public.assignment_status_records FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own assignment status"
ON public.assignment_status_records FOR DELETE TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ignou_summary jsonb;

CREATE INDEX IF NOT EXISTS assignment_status_records_user_idx
ON public.assignment_status_records (user_id, programme);