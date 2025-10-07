-- Replace has_horse_access function with correct logic for shared access
CREATE OR REPLACE FUNCTION public.has_horse_access(_user_id uuid, _horse_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Check if user owns the horse
  SELECT EXISTS (
    SELECT 1 FROM horses WHERE id = _horse_id AND user_id = _user_id
  )
  OR
  -- Check if user has shared access to the horse
  EXISTS (
    SELECT 1 FROM shared_access sa
    JOIN horses h ON h.user_id = sa.owner_id
    WHERE sa.collaborator_id = _user_id
      AND sa.status = 'active'
      AND h.id = _horse_id
      AND (
        sa.access_type = 'full_account'
        OR (sa.access_type = 'specific_horses' AND _horse_id = ANY(sa.horse_ids))
      )
  );
$$;