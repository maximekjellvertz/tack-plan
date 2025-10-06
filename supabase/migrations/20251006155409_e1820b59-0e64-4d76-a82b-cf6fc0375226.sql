-- Add RLS policy to allow users to read their own PDFs from storage
CREATE POLICY "Users can download their own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'rule-pdfs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);