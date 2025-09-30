-- Create horses table
CREATE TABLE public.horses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  breed text NOT NULL,
  age integer NOT NULL,
  discipline text NOT NULL,
  level text NOT NULL,
  color text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own horses" 
ON public.horses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own horses" 
ON public.horses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own horses" 
ON public.horses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own horses" 
ON public.horses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_horses_updated_at
BEFORE UPDATE ON public.horses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();