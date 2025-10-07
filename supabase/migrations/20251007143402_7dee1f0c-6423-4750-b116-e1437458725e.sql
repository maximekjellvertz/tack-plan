-- Update RLS policy for deleting health logs to allow horse owners to delete all logs for their horses
-- This allows the main account owner to manage all health logs for their horses

DROP POLICY IF EXISTS "Users can delete accessible health logs" ON health_logs;

CREATE POLICY "Users can delete accessible health logs"
ON health_logs
FOR DELETE
USING (
  -- User owns the log
  auth.uid() = user_id
  OR
  -- User owns the horse that the log is about
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM horses h
    WHERE h.id = health_logs.horse_id
      AND h.user_id = auth.uid()
  ))
  OR
  -- User has shared access as manager to the horse
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role = 'manager'
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND horse_id = ANY(sa.horse_ids))
      )
  ))
);