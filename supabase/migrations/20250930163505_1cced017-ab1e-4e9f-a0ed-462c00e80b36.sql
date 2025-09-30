-- Add statistics columns to horses table
ALTER TABLE public.horses 
ADD COLUMN IF NOT EXISTS competitions_this_year INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS placements INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS training_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vet_visits INTEGER DEFAULT 0;