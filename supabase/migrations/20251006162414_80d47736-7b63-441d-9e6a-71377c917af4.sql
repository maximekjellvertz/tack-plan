-- Update existing reminders to set horse_id based on horse_name
UPDATE reminders 
SET horse_id = (
  SELECT id 
  FROM horses 
  WHERE horses.name = reminders.horse_name 
  LIMIT 1
)
WHERE horse_id IS NULL 
AND horse_name IS NOT NULL;