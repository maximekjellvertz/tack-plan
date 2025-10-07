-- First drop all existing view policies that we need to replace
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals CASCADE;
DROP POLICY IF EXISTS "Users can view accessible goals" ON public.goals CASCADE;
DROP POLICY IF EXISTS "Users can view their own schedules" ON public.daily_schedule CASCADE;
DROP POLICY IF EXISTS "Users can view accessible schedules" ON public.daily_schedule CASCADE;
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.reminders CASCADE;
DROP POLICY IF EXISTS "Users can view accessible reminders" ON public.reminders CASCADE;
DROP POLICY IF EXISTS "Users can view their own badges" ON public.badges CASCADE;
DROP POLICY IF EXISTS "Users can view accessible badges" ON public.badges CASCADE;
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.milestones CASCADE;
DROP POLICY IF EXISTS "Users can view accessible milestones" ON public.milestones CASCADE;