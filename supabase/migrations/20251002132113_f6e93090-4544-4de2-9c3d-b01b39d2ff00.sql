-- Create packing list templates table
CREATE TABLE public.packing_list_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packing list items table (for both templates and competition-specific items)
CREATE TABLE public.packing_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.packing_list_templates(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Övrigt',
  is_checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT template_or_competition CHECK (
    (template_id IS NOT NULL AND competition_id IS NULL) OR 
    (template_id IS NULL AND competition_id IS NOT NULL)
  )
);

-- Create competition rules/info table
CREATE TABLE public.competition_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  category TEXT NOT NULL DEFAULT 'Allmänt',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add travel/logistics columns to competitions table
ALTER TABLE public.competitions 
ADD COLUMN travel_departure_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN accommodation_info TEXT,
ADD COLUMN venue_map_url TEXT,
ADD COLUMN transport_vehicle TEXT,
ADD COLUMN travel_companions TEXT,
ADD COLUMN travel_notes TEXT;

-- Enable RLS
ALTER TABLE public.packing_list_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packing_list_templates
CREATE POLICY "Users can view own templates"
  ON public.packing_list_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON public.packing_list_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.packing_list_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.packing_list_templates FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for packing_list_items
CREATE POLICY "Users can view own packing items"
  ON public.packing_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own packing items"
  ON public.packing_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packing items"
  ON public.packing_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packing items"
  ON public.packing_list_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for competition_rules
CREATE POLICY "Users can view own rules"
  ON public.competition_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rules"
  ON public.competition_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules"
  ON public.competition_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules"
  ON public.competition_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for competition_rules updated_at
CREATE TRIGGER update_competition_rules_updated_at
  BEFORE UPDATE ON public.competition_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();