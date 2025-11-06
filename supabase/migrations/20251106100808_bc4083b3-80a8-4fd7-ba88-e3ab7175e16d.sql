-- Add storage bucket for book PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-pdfs',
  'book-pdfs',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for book PDFs
CREATE POLICY "Authenticated users can view PDFs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'book-pdfs' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins and staff can upload PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'book-pdfs' AND
  is_admin_or_staff(auth.uid())
);

CREATE POLICY "Admins and staff can delete PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'book-pdfs' AND
  is_admin_or_staff(auth.uid())
);

-- Add new columns to books table for university-specific fields
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS semester INTEGER CHECK (semester >= 1 AND semester <= 8),
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS course_code TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_books_department ON public.books(department);
CREATE INDEX IF NOT EXISTS idx_books_semester ON public.books(semester);

-- Update categories to match MAJU faculties
INSERT INTO public.categories (id, name, description)
VALUES
  (gen_random_uuid(), 'Faculty of Computing', 'Computer Science, Software Engineering, Artificial Intelligence'),
  (gen_random_uuid(), 'Faculty of Business Administration', 'Business, Finance, Management Sciences'),
  (gen_random_uuid(), 'Faculty of Life Sciences', 'Biotechnology, Bioinformatics, Biosciences'),
  (gen_random_uuid(), 'Faculty of Social & Basic Sciences', 'Psychology, Social Sciences'),
  (gen_random_uuid(), 'Faculty of Engineering', 'Electrical and Computer Engineering')
ON CONFLICT DO NOTHING;

-- Add comment for clarity
COMMENT ON COLUMN public.books.department IS 'Academic department/program (e.g., BS Computer Science, BBA)';
COMMENT ON COLUMN public.books.semester IS 'Semester number (1-8 for undergraduate programs)';
COMMENT ON COLUMN public.books.pdf_url IS 'URL to the book PDF in storage';
COMMENT ON COLUMN public.books.course_code IS 'Course code (e.g., CS-101, MGT-201)';