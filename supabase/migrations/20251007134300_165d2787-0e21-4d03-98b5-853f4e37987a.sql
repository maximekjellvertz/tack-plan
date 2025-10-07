-- Allow collaborators to accept their own invitations
CREATE POLICY "Collaborators can accept their invitations"
ON public.shared_access FOR UPDATE
USING (
  auth.jwt() ->> 'email' = collaborator_email
  AND status = 'pending'
)
WITH CHECK (
  auth.jwt() ->> 'email' = collaborator_email
  AND status = 'active'
);