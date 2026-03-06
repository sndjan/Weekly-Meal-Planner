-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT NOT NULL,
  preparation_steps TEXT NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  serving_size NUMERIC DEFAULT 1,
  image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe_tags junction table
CREATE TABLE IF NOT EXISTS recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, tag_id)
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Create planned_meals table
CREATE TABLE IF NOT EXISTS planned_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  serving_size NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  protein_target NUMERIC DEFAULT 150,
  calories_target NUMERIC DEFAULT 2000,
  carbs_target NUMERIC DEFAULT 250,
  fats_target NUMERIC DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_id ON recipe_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_meal_plan_id ON planned_meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_recipe_id ON planned_meals(recipe_id);

-- Enable Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create their own data" ON users;
CREATE POLICY "Users can create their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for recipes table
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public recipes" ON recipes;
CREATE POLICY "Users can view public recipes"
  ON recipes FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Users can create recipes" ON recipes;
CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tags table
DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create tags" ON tags;
CREATE POLICY "Users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;
CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_tags table
DROP POLICY IF EXISTS "Users can view recipe_tags for recipes they own" ON recipe_tags;
CREATE POLICY "Users can view recipe_tags for recipes they own"
  ON recipe_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_tags.recipe_id AND recipes.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_tags.recipe_id AND recipes.is_public = true
  ));

DROP POLICY IF EXISTS "Users can manage recipe_tags for recipes they own" ON recipe_tags;
CREATE POLICY "Users can manage recipe_tags for recipes they own"
  ON recipe_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_tags.recipe_id AND recipes.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete recipe_tags for recipes they own" ON recipe_tags;
CREATE POLICY "Users can delete recipe_tags for recipes they own"
  ON recipe_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM recipes WHERE recipes.id = recipe_tags.recipe_id AND recipes.user_id = auth.uid()
  ));

-- RLS Policies for meal_plans table
DROP POLICY IF EXISTS "Users can view their own meal_plans" ON meal_plans;
CREATE POLICY "Users can view their own meal_plans"
  ON meal_plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create meal_plans" ON meal_plans;
CREATE POLICY "Users can create meal_plans"
  ON meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meal_plans" ON meal_plans;
CREATE POLICY "Users can update their own meal_plans"
  ON meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own meal_plans" ON meal_plans;
CREATE POLICY "Users can delete their own meal_plans"
  ON meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for planned_meals table
DROP POLICY IF EXISTS "Users can view planned_meals for their meal_plans" ON planned_meals;
CREATE POLICY "Users can view planned_meals for their meal_plans"
  ON planned_meals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meal_plans WHERE meal_plans.id = planned_meals.meal_plan_id AND meal_plans.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create planned_meals for their meal_plans" ON planned_meals;
CREATE POLICY "Users can create planned_meals for their meal_plans"
  ON planned_meals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM meal_plans WHERE meal_plans.id = planned_meals.meal_plan_id AND meal_plans.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update planned_meals for their meal_plans" ON planned_meals;
CREATE POLICY "Users can update planned_meals for their meal_plans"
  ON planned_meals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM meal_plans WHERE meal_plans.id = planned_meals.meal_plan_id AND meal_plans.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete planned_meals for their meal_plans" ON planned_meals;
CREATE POLICY "Users can delete planned_meals for their meal_plans"
  ON planned_meals FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM meal_plans WHERE meal_plans.id = planned_meals.meal_plan_id AND meal_plans.user_id = auth.uid()
  ));

-- RLS Policies for user_preferences table
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create preferences" ON user_preferences;
CREATE POLICY "Users can create preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a trigger to automatically create users when they sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create an insert trigger for updating updated_at timestamp on users
DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Create an insert trigger for updating updated_at timestamp on recipes
DROP TRIGGER IF EXISTS recipes_updated_at_trigger ON recipes;
CREATE OR REPLACE FUNCTION update_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at_trigger
AFTER UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_recipes_updated_at();

-- Create an insert trigger for updating updated_at timestamp on meal_plans
DROP TRIGGER IF EXISTS meal_plans_updated_at_trigger ON meal_plans;
CREATE OR REPLACE FUNCTION update_meal_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_plans_updated_at_trigger
AFTER UPDATE ON meal_plans
FOR EACH ROW
EXECUTE FUNCTION update_meal_plans_updated_at();

-- Create an insert trigger for updating updated_at timestamp on user_preferences
DROP TRIGGER IF EXISTS user_preferences_updated_at_trigger ON user_preferences;
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at_trigger
AFTER UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_updated_at();

-- Create a trigger to automatically create user preferences when a new user is created
DROP TRIGGER IF EXISTS create_preferences_trigger ON users;
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_preferences_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_preferences();

