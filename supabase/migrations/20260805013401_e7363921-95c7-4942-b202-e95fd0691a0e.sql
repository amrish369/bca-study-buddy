ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS programme_code text NOT NULL DEFAULT 'BCA_NEWOL';

CREATE TABLE public.grade_card_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  programme text NOT NULL,
  course_code text NOT NULL,
  assignment_marks numeric,
  theory_marks numeric,
  practical_marks numeric,
  total numeric,
  status text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, programme, course_code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.grade_card_records TO authenticated;
GRANT ALL ON public.grade_card_records TO service_role;

ALTER TABLE public.grade_card_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own grade card" ON public.grade_card_records
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_grade_card_records_updated_at
  BEFORE UPDATE ON public.grade_card_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();