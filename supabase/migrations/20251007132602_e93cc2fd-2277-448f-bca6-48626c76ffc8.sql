-- Drop old policy that blocks pending invitations
DROP POLICY IF EXISTS "Collaborators can view their access" ON public.shared_access;

-- Create new policy that allows viewing pending invitations by email
CREATE POLICY "Collaborators can view their invitations"
ON public.shared_access FOR SELECT
USING (
  auth.uid() = owner_id 
  OR 
  (auth.uid() = collaborator_id AND status = 'active')
  OR
  (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = shared_access.collaborator_email
    )
    AND status = 'pending'
  )
);