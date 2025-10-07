-- Create enums for access management
CREATE TYPE access_role AS ENUM ('viewer', 'editor', 'manager');
CREATE TYPE access_type AS ENUM ('full_account', 'specific_horses');
CREATE TYPE invitation_status AS ENUM ('pending', 'active', 'revoked');

-- Create shared_access table
CREATE TABLE public.shared_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborator_email TEXT NOT NULL,
  collaborator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role access_role NOT NULL DEFAULT 'viewer',
  access_type access_type NOT NULL DEFAULT 'full_account',
  horse_ids UUID[] DEFAULT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_horse_restriction CHECK (
    (access_type = 'full_account' AND horse_ids IS NULL) OR
    (access_type = 'specific_horses' AND horse_ids IS NOT NULL)
  )
);

-- Enable RLS on shared_access
ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

-- RLS policies for shared_access table
CREATE POLICY "Owners can view their shared access"
ON public.shared_access FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Collaborators can view their access"
ON public.shared_access FOR SELECT
USING (auth.uid() = collaborator_id AND status = 'active');

CREATE POLICY "Owners can create shared access"
ON public.shared_access FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their shared access"
ON public.shared_access FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shared access"
ON public.shared_access FOR DELETE
USING (auth.uid() = owner_id);

-- Trigger for updated_at
CREATE TRIGGER update_shared_access_updated_at
BEFORE UPDATE ON public.shared_access
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create helper function to check if user has access to a horse
CREATE OR REPLACE FUNCTION public.has_horse_access(
  _user_id UUID,
  _horse_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user owns the horse
  SELECT EXISTS (
    SELECT 1 FROM horses WHERE id = _horse_id AND user_id = _user_id
  )
  OR
  -- Check if user has shared access to the horse
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = _user_id
      AND sa.status = 'active'
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND _horse_id = ANY(sa.horse_ids))
      )
  );
$$;

-- Update horses table RLS policies
DROP POLICY IF EXISTS "Users can view their own horses" ON public.horses;
CREATE POLICY "Users can view owned or shared horses"
ON public.horses FOR SELECT
USING (
  auth.uid() = user_id
  OR
  public.has_horse_access(auth.uid(), id)
);

-- Update horses edit policy for editors and managers
DROP POLICY IF EXISTS "Users can update their own horses" ON public.horses;
CREATE POLICY "Users can update owned horses or shared as editor/manager"
ON public.horses FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role IN ('editor', 'manager')
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND horses.id = ANY(sa.horse_ids))
      )
  )
);

-- Update competitions table RLS policies
DROP POLICY IF EXISTS "Users can view own competitions" ON public.competitions;
CREATE POLICY "Users can view owned or shared competitions"
ON public.competitions FOR SELECT
USING (
  auth.uid() = user_id
  OR
  (horse_id IS NOT NULL AND public.has_horse_access(auth.uid(), horse_id))
);

DROP POLICY IF EXISTS "Users can insert own competitions" ON public.competitions;
CREATE POLICY "Users can insert competitions for accessible horses"
ON public.competitions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    horse_id IS NULL
    OR public.has_horse_access(auth.uid(), horse_id)
  )
);

DROP POLICY IF EXISTS "Users can update own competitions" ON public.competitions;
CREATE POLICY "Users can update accessible competitions"
ON public.competitions FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role IN ('editor', 'manager')
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND competitions.horse_id = ANY(sa.horse_ids))
      )
  ))
);

DROP POLICY IF EXISTS "Users can delete own competitions" ON public.competitions;
CREATE POLICY "Users can delete accessible competitions"
ON public.competitions FOR DELETE
USING (
  auth.uid() = user_id
  OR
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role = 'manager'
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND competitions.horse_id = ANY(sa.horse_ids))
      )
  ))
);

-- Update health_logs table RLS policies
DROP POLICY IF EXISTS "Users can view their own health logs" ON public.health_logs;
CREATE POLICY "Users can view accessible health logs"
ON public.health_logs FOR SELECT
USING (
  auth.uid() = user_id
  OR
  (horse_id IS NOT NULL AND public.has_horse_access(auth.uid(), horse_id))
);

DROP POLICY IF EXISTS "Users can update their own health logs" ON public.health_logs;
CREATE POLICY "Users can update accessible health logs"
ON public.health_logs FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role IN ('editor', 'manager')
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND health_logs.horse_id = ANY(sa.horse_ids))
      )
  ))
);

DROP POLICY IF EXISTS "Users can create their own health logs" ON public.health_logs;
CREATE POLICY "Users can create health logs for accessible horses"
ON public.health_logs FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    horse_id IS NULL
    OR public.has_horse_access(auth.uid(), horse_id)
  )
);

DROP POLICY IF EXISTS "Users can delete their own health logs" ON public.health_logs;
CREATE POLICY "Users can delete accessible health logs"
ON public.health_logs FOR DELETE
USING (
  auth.uid() = user_id
  OR
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role = 'manager'
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND health_logs.horse_id = ANY(sa.horse_ids))
      )
  ))
);

-- Update training_sessions table RLS policies
DROP POLICY IF EXISTS "Users can view their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can view accessible training sessions"
ON public.training_sessions FOR SELECT
USING (
  auth.uid() = user_id
  OR
  public.has_horse_access(auth.uid(), horse_id)
);

DROP POLICY IF EXISTS "Users can update their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can update accessible training sessions"
ON public.training_sessions FOR UPDATE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role IN ('editor', 'manager')
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND training_sessions.horse_id = ANY(sa.horse_ids))
      )
  )
);

DROP POLICY IF EXISTS "Users can create their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can create training sessions for accessible horses"
ON public.training_sessions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.has_horse_access(auth.uid(), horse_id)
);

DROP POLICY IF EXISTS "Users can delete their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can delete accessible training sessions"
ON public.training_sessions FOR DELETE
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role = 'manager'
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND training_sessions.horse_id = ANY(sa.horse_ids))
      )
  )
);