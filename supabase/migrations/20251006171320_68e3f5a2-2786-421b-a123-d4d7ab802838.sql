-- Create daily_schedule table for horse activities with specific times
CREATE TABLE public.daily_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  horse_id UUID NOT NULL,
  horse_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own schedules"
ON public.daily_schedule
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedules"
ON public.daily_schedule
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules"
ON public.daily_schedule
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules"
ON public.daily_schedule
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_daily_schedule_updated_at
BEFORE UPDATE ON public.daily_schedule
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();