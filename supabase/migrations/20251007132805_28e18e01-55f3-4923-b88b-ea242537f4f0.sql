-- Drop the problematic policy
DROP POLICY IF EXISTS "Collaborators can view their invitations" ON public.shared_access;

-- Create new policy that uses JWT to get email (no auth.users query needed)
CREATE POLICY "Collaborators can view their invitations"
ON public.shared_access FOR SELECT
USING (
  auth.uid() = owner_id 
  OR 
  (auth.uid() = collaborator_id AND status = 'active')
  OR
  (
    auth.jwt() ->> 'email' = collaborator_email
    AND status = 'pending'
  )
);