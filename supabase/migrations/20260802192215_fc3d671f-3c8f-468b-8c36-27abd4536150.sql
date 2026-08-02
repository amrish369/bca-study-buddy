CREATE TABLE public.question_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  session TEXT NOT NULL CHECK (session IN ('June','December')),
  title TEXT,
  pdf_url TEXT,
  source_url TEXT,
  has_solution BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'found' CHECK (status IN ('found','not_found')),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (course_code, year, session)
);

CREATE INDEX question_papers_course_idx ON public.question_papers (course_code);

GRANT SELECT ON public.question_papers TO anon;
GRANT SELECT ON public.question_papers TO authenticated;
GRANT ALL ON public.question_papers TO service_role;

ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view question papers"
  ON public.question_papers FOR SELECT
  TO anon, authenticated
  USING (true);