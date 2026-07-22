import type {
  FoodColor,
  FoodItem,
  HealthTargets,
  PlannedMeal,
  RecipeIngredient,
} from '@/types/database';

export type MealForHealthMetrics = Pick<PlannedMeal, 'id' | 'recipe_id'>;

export type HealthTargetValues = Omit<
  HealthTargets,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export type HealthMetricsResult = {
  plantDiversity: { count: number; target: number };
  fermented: { count: number; min: number; max: number };
  legumes: { count: number; min: number; max: number };
  wholeGrainPct: { value: number; target: number };
  addedSugarMeals: { count: number; max: number };
  unprocessedPct: { value: number; target: number };
  colorDiversity: { count: number; target: number; colorsPresent: FoodColor[] };
};

function getFoodItemsForMeal(
  meal: MealForHealthMetrics,
  recipeIngredientsByRecipeId: Record<string, RecipeIngredient[]>,
  foodItemsById: Record<string, FoodItem>,
): FoodItem[] {
  const ingredients = recipeIngredientsByRecipeId[meal.recipe_id] ?? [];

  return ingredients
    .map((ingredient) => foodItemsById[ingredient.food_item_id])
    .filter((foodItem): foodItem is FoodItem => Boolean(foodItem));
}

function countMealsWhereAnyFoodItemMatches(
  meals: MealForHealthMetrics[],
  recipeIngredientsByRecipeId: Record<string, RecipeIngredient[]>,
  foodItemsById: Record<string, FoodItem>,
  predicate: (foodItem: FoodItem) => boolean,
): number {
  return meals.filter((meal) =>
    getFoodItemsForMeal(meal, recipeIngredientsByRecipeId, foodItemsById).some(predicate),
  ).length;
}

/**
 * Computes the 7 Health Card metrics for a set of planned meals (typically one week).
 * Plant diversity, unprocessed/vollkorn %, and color diversity are based on the set of
 * *unique* food items used; fermented/legume/added-sugar are based on how many distinct
 * *meals* contain the tag at least once.
 */
export function calculateHealthMetrics(
  plannedMeals: MealForHealthMetrics[],
  recipeIngredientsByRecipeId: Record<string, RecipeIngredient[]>,
  foodItemsById: Record<string, FoodItem>,
  targets: HealthTargetValues,
): HealthMetricsResult {
  const uniqueFoodItemsById = new Map<string, FoodItem>();

  for (const meal of plannedMeals) {
    for (const foodItem of getFoodItemsForMeal(meal, recipeIngredientsByRecipeId, foodItemsById)) {
      uniqueFoodItemsById.set(foodItem.id, foodItem);
    }
  }

  const uniqueFoodItems = Array.from(uniqueFoodItemsById.values());
  const uniqueFoodItemCount = uniqueFoodItems.length;

  const plantCount = uniqueFoodItems.filter((foodItem) => foodItem.is_plant).length;
  const wholeGrainCount = uniqueFoodItems.filter((foodItem) => foodItem.is_whole_grain).length;
  const unprocessedCount = uniqueFoodItems.filter((foodItem) => !foodItem.is_processed).length;

  const colorsPresent = Array.from(
    new Set(
      uniqueFoodItems
        .map((foodItem) => foodItem.color)
        .filter((color): color is FoodColor => Boolean(color)),
    ),
  );

  const fermentedCount = countMealsWhereAnyFoodItemMatches(
    plannedMeals,
    recipeIngredientsByRecipeId,
    foodItemsById,
    (foodItem) => foodItem.is_fermented,
  );

  const legumeCount = countMealsWhereAnyFoodItemMatches(
    plannedMeals,
    recipeIngredientsByRecipeId,
    foodItemsById,
    (foodItem) => foodItem.is_legume,
  );

  const addedSugarCount = countMealsWhereAnyFoodItemMatches(
    plannedMeals,
    recipeIngredientsByRecipeId,
    foodItemsById,
    (foodItem) => foodItem.has_added_sugar,
  );

  return {
    plantDiversity: {
      count: plantCount,
      target: targets.plant_diversity_target,
    },
    fermented: {
      count: fermentedCount,
      min: targets.fermented_min,
      max: targets.fermented_max,
    },
    legumes: {
      count: legumeCount,
      min: targets.legume_min,
      max: targets.legume_max,
    },
    wholeGrainPct: {
      value: uniqueFoodItemCount > 0 ? (wholeGrainCount / uniqueFoodItemCount) * 100 : 0,
      target: targets.whole_grain_target_pct,
    },
    addedSugarMeals: {
      count: addedSugarCount,
      max: targets.added_sugar_max_meals,
    },
    unprocessedPct: {
      value: uniqueFoodItemCount > 0 ? (unprocessedCount / uniqueFoodItemCount) * 100 : 0,
      target: targets.unprocessed_target_pct,
    },
    colorDiversity: {
      count: colorsPresent.length,
      target: targets.color_diversity_target,
      colorsPresent,
    },
  };
}

export const DEFAULT_HEALTH_TARGETS: HealthTargetValues = {
  plant_diversity_target: 30,
  fermented_min: 3,
  fermented_max: 5,
  legume_min: 3,
  legume_max: 7,
  whole_grain_target_pct: 70,
  added_sugar_max_meals: 4,
  unprocessed_target_pct: 80,
  color_diversity_target: 5,
};
