"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flame, Droplets, Wheat, Zap, X } from "lucide-react";
import type {
  Recipe,
  PlannedMeal,
  MealType,
  NutritionValues,
} from "@/types/database";
import { AddMealDialog } from "./add-meal-dialog";
import { ShoppingList } from "./shopping-list";
import { generateShoppingListFromPlannedMeals } from "@/lib/shopping-list";
import type { NutritionTargetSettings } from "./nutrition-target-settings";
import { DEFAULT_NUTRITION_TARGETS } from "./nutrition-target-settings";
import toast from "react-hot-toast";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

interface MealWeekViewProps {
  nutritionTargets?: NutritionTargetSettings;
}

export function MealWeekView({
  nutritionTargets = DEFAULT_NUTRITION_TARGETS,
}: MealWeekViewProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const supabase = createClient();

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get all recipes
      const { data: recipesData } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", user.id);

      // Get current week's meal plan
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const dateStr = weekStart.toISOString().split("T")[0];

      const { data: mealPlansData } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start_date", dateStr);

      if (recipesData) setRecipes(recipesData);

      if (mealPlansData && mealPlansData.length > 0 && mealPlansData[0]) {
        const currentMealPlanId = (mealPlansData[0] as any).id as string;

        if (currentMealPlanId) {
          const { data: mealsData } = await supabase
            .from("planned_meals")
            .select("*")
            .eq("meal_plan_id", currentMealPlanId);

          if (mealsData) setPlannedMeals(mealsData);
        }
      } else {
        setPlannedMeals([]);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  const getMealForSlot = (
    dayIndex: number,
    mealType: MealType,
  ): PlannedMeal | undefined => {
    return plannedMeals.find(
      (meal) => meal.day_of_week === dayIndex && meal.meal_type === mealType,
    );
  };

  const handleDropRecipe = async (
    e: React.DragEvent<HTMLTableCellElement>,
    dayIndex: number,
    mealType: MealType,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = e.dataTransfer.getData("application/json");
      const { type, recipe } = JSON.parse(data);

      if (type !== "recipe") return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Check if there's already a meal at this slot
      const existingMeal = getMealForSlot(dayIndex, mealType);
      if (existingMeal) {
        // Remove the existing meal first
        await supabase.from("planned_meals").delete().eq("id", existingMeal.id);
      }

      // Get or create meal plan for this week
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const dateStr = weekStart.toISOString().split("T")[0];

      let mealPlanId: string;
      const { data: existingPlan } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("week_start_date", dateStr)
        .single<{ id: string }>();

      if (existingPlan) {
        mealPlanId = existingPlan.id;
      } else {
        const { data: newPlan, error: createError } = await supabase
          .from("meal_plans")
          .insert({
            user_id: user.id,
            week_start_date: dateStr,
          })
          .select("id")
          .single<{ id: string }>();

        if (createError || !newPlan) throw createError;
        mealPlanId = newPlan.id;
      }

      // Add the new meal
      const { error: mealError } = await supabase.from("planned_meals").insert({
        meal_plan_id: mealPlanId,
        recipe_id: recipe.id,
        day_of_week: dayIndex,
        meal_type: mealType,
        serving_size: 1,
      });

      if (mealError) throw mealError;

      toast.success(`${recipe.name} added to ${mealType}`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add meal");
    }
  };

  const getDailyNutritionTotals = (dayIndex: number): NutritionValues => {
    return plannedMeals.reduce(
      (totals, meal) => {
        if (meal.day_of_week !== dayIndex) {
          return totals;
        }

        const recipe = recipes.find(
          (currentRecipe) => currentRecipe.id === meal.recipe_id,
        );
        if (!recipe) {
          return totals;
        }

        const servingMultiplier = meal.serving_size || 1;

        return {
          calories:
            totals.calories + (recipe.calories ?? 0) * servingMultiplier,
          protein: totals.protein + (recipe.protein ?? 0) * servingMultiplier,
          carbs: totals.carbs + (recipe.carbs ?? 0) * servingMultiplier,
          fats: totals.fats + (recipe.fats ?? 0) * servingMultiplier,
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      },
    );
  };

  const shoppingListItems = useMemo(
    () => generateShoppingListFromPlannedMeals(plannedMeals, recipes),
    [plannedMeals, recipes],
  );

  const handleRemoveMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from("planned_meals")
        .delete()
        .eq("id", mealId);

      if (error) throw error;

      setPlannedMeals((prev) => prev.filter((m) => m.id !== mealId));
      toast.success("Meal removed");
    } catch (err) {
      toast.error("Failed to remove meal");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading week view...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-sm border-r border-gray-200 w-24">
                Meal
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-center font-semibold text-sm border-r border-gray-200 last:border-r-0 w-40"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map((mealType) => (
              <tr
                key={mealType}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-sm capitalize bg-gray-50 border-r border-gray-200 w-24">
                  {mealType}
                </td>
                {DAYS.map((day, dayIndex) => {
                  const meal = getMealForSlot(dayIndex, mealType);
                  const recipeForMeal = meal
                    ? recipes.find((r) => r.id === meal.recipe_id)
                    : undefined;
                  const slotKey = `${day}-${mealType}`;
                  const isDragOverThis = dragOverSlot === slotKey;

                  return (
                    <td
                      key={slotKey}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "copy";
                        setDragOverSlot(slotKey);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.currentTarget === e.target) {
                          setDragOverSlot(null);
                        }
                      }}
                      onDrop={(e) => {
                        setDragOverSlot(null);
                        handleDropRecipe(e, dayIndex, mealType);
                      }}
                      className={`px-4 py-3 border-r border-gray-200 last:border-r-0 align-top min-h-28 w-40 transition-colors ${
                        isDragOverThis ? "bg-blue-50 ring-2 ring-blue-300" : ""
                      }`}
                    >
                      {meal && recipeForMeal ? (
                        <div className="space-y-2 group">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 flex-1 truncate">
                              {recipeForMeal.name}
                            </p>
                            <button
                              onClick={() => handleRemoveMeal(meal.id)}
                              className="p-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 flex flex-wrap gap-2">
                            {/* <div className="flex items-center gap-1">
                              <UtensilsCrossed className="h-3.5 w-3.5 text-gray-400" />
                              <span>
                                {meal.serving_size} serving
                                {meal.serving_size !== 1 ? "s" : ""}
                              </span>
                            </div> */}
                            {recipeForMeal.calories &&
                              nutritionTargets.calories_target_enabled && (
                                <div className="flex items-center gap-1">
                                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                                  <span>
                                    {(
                                      recipeForMeal.calories * meal.serving_size
                                    ).toFixed(0)}
                                    g
                                  </span>
                                </div>
                              )}
                            {recipeForMeal.protein &&
                              nutritionTargets.protein_target_enabled && (
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                                  <span>
                                    {(
                                      recipeForMeal.protein * meal.serving_size
                                    ).toFixed(0)}
                                    g
                                  </span>
                                </div>
                              )}
                            {recipeForMeal.carbs &&
                              nutritionTargets.carbs_target_enabled && (
                                <div className="flex items-center gap-1">
                                  <Wheat className="h-3.5 w-3.5 text-yellow-600" />
                                  <span>
                                    {(
                                      recipeForMeal.carbs * meal.serving_size
                                    ).toFixed(0)}
                                    g
                                  </span>
                                </div>
                              )}
                            {recipeForMeal.fats &&
                              nutritionTargets.fats_target_enabled && (
                                <div className="flex items-center gap-1">
                                  <Droplets className="h-3.5 w-3.5 text-sky-500" />
                                  <span>
                                    {(
                                      recipeForMeal.fats * meal.serving_size
                                    ).toFixed(0)}
                                    g
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-center">
                          <AddMealDialog
                            dayOfWeek={dayIndex}
                            mealType={mealType}
                            onMealAdded={loadData}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-4 py-3 font-semibold text-xs uppercase text-gray-700 border-r border-gray-200 w-24 align-top">
                Totals
              </td>
              {DAYS.map((day, dayIndex) => {
                const totals = getDailyNutritionTotals(dayIndex);

                return (
                  <td
                    key={`${day}-totals`}
                    className="px-4 py-3 border-r border-gray-200 last:border-r-0 align-top w-40"
                  >
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex justify-between items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                          Calories
                        </span>
                        <span>
                          {totals.calories.toFixed(0)}
                          {nutritionTargets.calories_target_enabled
                            ? ` / ${nutritionTargets.calories_target.toFixed(0)}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          Protein
                        </span>
                        <span>
                          {totals.protein.toFixed(0)}g
                          {nutritionTargets.protein_target_enabled
                            ? ` / ${nutritionTargets.protein_target.toFixed(0)}g`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Wheat className="h-3.5 w-3.5 text-yellow-600" />
                          Carbs
                        </span>
                        <span>
                          {totals.carbs.toFixed(0)}g
                          {nutritionTargets.carbs_target_enabled
                            ? ` / ${nutritionTargets.carbs_target.toFixed(0)}g`
                            : ""}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3.5 w-3.5 text-sky-500" />
                          Fats
                        </span>
                        <span>
                          {totals.fats.toFixed(0)}g
                          {nutritionTargets.fats_target_enabled
                            ? ` / ${nutritionTargets.fats_target.toFixed(0)}g`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <ShoppingList items={shoppingListItems} />
    </div>
  );
}
