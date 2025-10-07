-- Update RLS policy for deleting health logs to allow users to delete their own logs
-- and allow editors/managers to delete logs for horses they have access to

DROP POLICY IF EXISTS "Users can delete accessible health logs" ON health_logs;

CREATE POLICY "Users can delete accessible health logs"
ON health_logs
FOR DELETE
USING (
  -- User owns the log
  auth.uid() = user_id
  OR
  -- User has shared access as editor or manager to the horse
  (horse_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM shared_access sa
    WHERE sa.collaborator_id = auth.uid()
      AND sa.status = 'active'
      AND sa.role IN ('editor', 'manager')
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND horse_id = ANY(sa.horse_ids))
      )
  ))
);