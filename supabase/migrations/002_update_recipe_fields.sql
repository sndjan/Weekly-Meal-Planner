-- Update recipes table for revised recipe form fields
ALTER TABLE recipes
  DROP COLUMN IF EXISTS description;

ALTER TABLE recipes
  ALTER COLUMN preparation_steps DROP NOT NULL;

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS prep_time TEXT;
