-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Användare')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add created_by and updated_by to relevant tables
ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

ALTER TABLE competitions ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

ALTER TABLE reminders ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS updated_by_name TEXT;

ALTER TABLE daily_schedule ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE daily_schedule ADD COLUMN IF NOT EXISTS updated_by_name TEXT;