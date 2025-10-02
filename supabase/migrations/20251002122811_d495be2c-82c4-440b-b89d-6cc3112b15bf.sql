-- Create storage bucket for horse images
INSERT INTO storage.buckets (id, name, public)
VALUES ('horse-images', 'horse-images', true);

-- Add image_url column to horses table
ALTER TABLE public.horses 
ADD COLUMN image_url TEXT;

-- RLS policies for horse-images bucket
CREATE POLICY "Users can view all horse images"
ON storage.objects FOR SELECT
USING (bucket_id = 'horse-images');

CREATE POLICY "Users can upload their own horse images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'horse-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own horse images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'horse-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own horse images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'horse-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
