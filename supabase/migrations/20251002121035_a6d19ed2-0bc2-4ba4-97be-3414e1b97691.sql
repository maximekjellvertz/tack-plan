-- Add personality and fun facts columns to horses table
ALTER TABLE public.horses 
ADD COLUMN personality_trait TEXT,
ADD COLUMN fun_fact TEXT;

-- Add comments to explain the new columns
COMMENT ON COLUMN public.horses.personality_trait IS 'User-defined personality trait for the horse (e.g. Modig, Kärleksfull, Lekfull)';
COMMENT ON COLUMN public.horses.fun_fact IS 'User-defined fun fact about the horse';
