-- Create table for storing user's TDB credentials (encrypted)
CREATE TABLE public.tdb_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tdb_email TEXT NOT NULL,
  tdb_password_encrypted TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tdb_credentials
ALTER TABLE public.tdb_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own TDB credentials
CREATE POLICY "Users can view own TDB credentials"
  ON public.tdb_credentials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own TDB credentials"
  ON public.tdb_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own TDB credentials"
  ON public.tdb_credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own TDB credentials"
  ON public.tdb_credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for competitions from TDB
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tdb_id TEXT,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  discipline TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  classes JSONB DEFAULT '[]'::jsonb,
  organizer TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  registration_deadline DATE,
  registration_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on competitions
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own competitions
CREATE POLICY "Users can view own competitions"
  ON public.competitions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitions"
  ON public.competitions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitions"
  ON public.competitions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitions"
  ON public.competitions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_tdb_credentials_updated_at
  BEFORE UPDATE ON public.tdb_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();