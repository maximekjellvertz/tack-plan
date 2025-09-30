-- Create health_logs table
CREATE TABLE public.health_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  horse_id uuid REFERENCES public.horses(id) ON DELETE CASCADE,
  horse_name text NOT NULL,
  event text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'Pågående',
  treatment text NOT NULL,
  notes text,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own health logs" 
ON public.health_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health logs" 
ON public.health_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health logs" 
ON public.health_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health logs" 
ON public.health_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_health_logs_updated_at
BEFORE UPDATE ON public.health_logs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create reminders table
CREATE TABLE public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  horse_id uuid REFERENCES public.horses(id) ON DELETE CASCADE,
  horse_name text,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  type text NOT NULL DEFAULT 'custom',
  completed boolean NOT NULL DEFAULT false,
  recurring boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reminders" 
ON public.reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();