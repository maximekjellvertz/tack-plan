-- Create enum for document types
CREATE TYPE document_type AS ENUM (
  'vaccination_certificate',
  'passport',
  'insurance',
  'xray',
  'veterinary_report',
  'registration',
  'other'
);

-- Create horse_documents table
CREATE TABLE public.horse_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  expires_at DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_name TEXT,
  updated_by_name TEXT
);

-- Enable RLS
ALTER TABLE public.horse_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for horse_documents
CREATE POLICY "Users can view accessible documents"
ON public.horse_documents
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_horse_access(auth.uid(), horse_id)
);

CREATE POLICY "Users can insert documents for accessible horses"
ON public.horse_documents
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND has_horse_access(auth.uid(), horse_id)
);

CREATE POLICY "Users can update accessible documents"
ON public.horse_documents
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM shared_access sa
      WHERE sa.collaborator_id = auth.uid()
        AND sa.status = 'active'
        AND sa.role IN ('editor', 'manager')
        AND (
          sa.access_type = 'full_account'
          OR (sa.access_type = 'specific_horses' AND horse_documents.horse_id = ANY(sa.horse_ids))
        )
    )
  )
);

CREATE POLICY "Users can delete accessible documents"
ON public.horse_documents
FOR DELETE
USING (
  auth.uid() = user_id 
  OR (
    EXISTS (
      SELECT 1 FROM shared_access sa
      WHERE sa.collaborator_id = auth.uid()
        AND sa.status = 'active'
        AND sa.role = 'manager'
        AND (
          sa.access_type = 'full_account'
          OR (sa.access_type = 'specific_horses' AND horse_documents.horse_id = ANY(sa.horse_ids))
        )
    )
  )
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'horse-documents',
  'horse-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- Storage policies for horse-documents bucket
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'horse-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'horse-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'horse-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'horse-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger for updated_at
CREATE TRIGGER update_horse_documents_updated_at
BEFORE UPDATE ON public.horse_documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();