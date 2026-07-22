-- Allow an 'extra' meal_type so days can have unlimited additional meals
-- beyond the fixed breakfast/lunch/dinner/snack slots.
ALTER TABLE planned_meals
  DROP CONSTRAINT IF EXISTS planned_meals_meal_type_check;

ALTER TABLE planned_meals
  ADD CONSTRAINT planned_meals_meal_type_check
  CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'extra'));
