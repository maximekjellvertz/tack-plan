-- Create new policies with shared access support

-- Goals: Allow viewing goals from accounts with shared access
CREATE POLICY "Users can view accessible goals"
ON public.goals FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.owner_id = goals.user_id
      AND sa.access_type = 'full_account'
  )
);

-- Daily Schedule: Allow viewing schedules from shared accounts
CREATE POLICY "Users can view accessible schedules"
ON public.daily_schedule FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.owner_id = daily_schedule.user_id
      AND sa.access_type = 'full_account'
  )
);

-- Reminders: Allow viewing reminders from shared accounts
CREATE POLICY "Users can view accessible reminders"
ON public.reminders FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.owner_id = reminders.user_id
      AND sa.access_type = 'full_account'
  )
);

-- Badges: Allow viewing badges from shared accounts
CREATE POLICY "Users can view accessible badges"
ON public.badges FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.owner_id = badges.user_id
      AND sa.access_type = 'full_account'
  )
);

-- Milestones: Allow viewing milestones from shared accounts
CREATE POLICY "Users can view accessible milestones"
ON public.milestones FOR SELECT
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.owner_id = milestones.user_id
      AND sa.access_type = 'full_account'
  )
);