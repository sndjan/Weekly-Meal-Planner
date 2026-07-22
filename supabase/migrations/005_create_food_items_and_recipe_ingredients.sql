-- Create food_items table (personal, per-user food database with health tags)
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_plant BOOLEAN NOT NULL DEFAULT FALSE,
  is_legume BOOLEAN NOT NULL DEFAULT FALSE,
  is_fermented BOOLEAN NOT NULL DEFAULT FALSE,
  is_whole_grain BOOLEAN NOT NULL DEFAULT FALSE,
  has_added_sugar BOOLEAN NOT NULL DEFAULT FALSE,
  is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  color TEXT CHECK (color IN ('red', 'yellow', 'green', 'purple', 'brown')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create recipe_ingredients table (structured ingredients linking recipes to food_items)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_food_items_user_id ON food_items(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_food_item_id ON recipe_ingredients(food_item_id);

-- Enable RLS
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_items table
DROP POLICY IF EXISTS "Users can view their own food_items" ON food_items;
CREATE POLICY "Users can view their own food_items"
  ON food_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create food_items" ON food_items;
CREATE POLICY "Users can create food_items"
  ON food_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own food_items" ON food_items;
CREATE POLICY "Users can update their own food_items"
  ON food_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own food_items" ON food_items;
CREATE POLICY "Users can delete their own food_items"
  ON food_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_ingredients table
DROP POLICY IF EXISTS "Users can view recipe_ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can view recipe_ingredients for recipes they own"
  ON recipe_ingredients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.is_public = true
  ));

DROP POLICY IF EXISTS "Users can create recipe_ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can create recipe_ingredients for recipes they own"
  ON recipe_ingredients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update recipe_ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can update recipe_ingredients for recipes they own"
  ON recipe_ingredients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete recipe_ingredients for recipes they own" ON recipe_ingredients;
CREATE POLICY "Users can delete recipe_ingredients for recipes they own"
  ON recipe_ingredients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid()
  ));

-- Keep food_items.updated_at current
DROP TRIGGER IF EXISTS food_items_updated_at_trigger ON food_items;
CREATE OR REPLACE FUNCTION update_food_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER food_items_updated_at_trigger
AFTER UPDATE ON food_items
FOR EACH ROW
EXECUTE FUNCTION update_food_items_updated_at();
