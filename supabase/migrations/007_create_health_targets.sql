-- Create health_targets table (one row per user, weekly targets for the Health Card metrics)
CREATE TABLE IF NOT EXISTS health_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plant_diversity_target INTEGER NOT NULL DEFAULT 30,
  fermented_min INTEGER NOT NULL DEFAULT 3,
  fermented_max INTEGER NOT NULL DEFAULT 5,
  legume_min INTEGER NOT NULL DEFAULT 3,
  legume_max INTEGER NOT NULL DEFAULT 7,
  whole_grain_target_pct NUMERIC NOT NULL DEFAULT 70,
  added_sugar_max_meals INTEGER NOT NULL DEFAULT 4,
  unprocessed_target_pct NUMERIC NOT NULL DEFAULT 80,
  color_diversity_target INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE health_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_targets table
DROP POLICY IF EXISTS "Users can view their own health_targets" ON health_targets;
CREATE POLICY "Users can view their own health_targets"
  ON health_targets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create health_targets" ON health_targets;
CREATE POLICY "Users can create health_targets"
  ON health_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own health_targets" ON health_targets;
CREATE POLICY "Users can update their own health_targets"
  ON health_targets FOR UPDATE
  USING (auth.uid() = user_id);

-- Keep updated_at current
DROP TRIGGER IF EXISTS health_targets_updated_at_trigger ON health_targets;
CREATE OR REPLACE FUNCTION update_health_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_targets_updated_at_trigger
AFTER UPDATE ON health_targets
FOR EACH ROW
EXECUTE FUNCTION update_health_targets_updated_at();

-- Auto-create default health_targets when a new user is created
DROP TRIGGER IF EXISTS create_health_targets_trigger ON users;
CREATE OR REPLACE FUNCTION create_health_targets()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO health_targets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_health_targets_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_health_targets();

-- Backfill health_targets for existing users who signed up before this migration
INSERT INTO health_targets (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
