-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  horse_id UUID REFERENCES public.horses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  goal_type TEXT NOT NULL DEFAULT 'custom',
  auto_calculate BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  horse_id UUID REFERENCES public.horses(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  achieved_date DATE NOT NULL,
  icon TEXT DEFAULT 'trophy',
  milestone_type TEXT NOT NULL DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  horse_id UUID REFERENCES public.horses(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'award',
  earned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for milestones
CREATE POLICY "Users can view their own milestones"
  ON public.milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON public.milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
  ON public.milestones FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for badges
CREATE POLICY "Users can view their own badges"
  ON public.badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own badges"
  ON public.badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own badges"
  ON public.badges FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_horse_id ON public.goals(horse_id);
CREATE INDEX idx_milestones_user_id ON public.milestones(user_id);
CREATE INDEX idx_milestones_horse_id ON public.milestones(horse_id);
CREATE INDEX idx_badges_user_id ON public.badges(user_id);
CREATE INDEX idx_badges_horse_id ON public.badges(horse_id);