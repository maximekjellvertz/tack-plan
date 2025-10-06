-- Create storage bucket for rule PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rule-pdfs',
  'rule-pdfs',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
);

-- Create storage policies for rule PDFs
CREATE POLICY "Users can upload their own rule PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'rule-pdfs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own rule PDFs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'rule-pdfs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own rule PDFs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'rule-pdfs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table for PDF metadata
CREATE TABLE public.rule_pdfs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  category TEXT NOT NULL DEFAULT 'Allmänt',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rule_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policies for rule_pdfs table
CREATE POLICY "Users can view their own PDFs"
ON public.rule_pdfs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDFs"
ON public.rule_pdfs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDFs"
ON public.rule_pdfs
FOR DELETE
USING (auth.uid() = user_id);