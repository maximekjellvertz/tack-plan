-- Lägg till kostinformation i horses-tabellen
ALTER TABLE public.horses 
ADD COLUMN IF NOT EXISTS diet_feed TEXT,
ADD COLUMN IF NOT EXISTS diet_supplements TEXT,
ADD COLUMN IF NOT EXISTS diet_restrictions TEXT;