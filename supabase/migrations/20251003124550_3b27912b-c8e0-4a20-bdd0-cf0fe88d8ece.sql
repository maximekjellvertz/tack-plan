-- Add horse_id column to competitions table to allow linking competitions to specific horses
ALTER TABLE public.competitions
ADD COLUMN horse_id UUID REFERENCES public.horses(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_competitions_horse_id ON public.competitions(horse_id);