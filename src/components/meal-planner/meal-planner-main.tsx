"use client";

import { useMemo, useState } from "react";
import { MealWeekView } from "./meal-week-view";
import { RecipeLibrary } from "./recipe-library";
import { RecipeForm } from "./recipe-form";
import { ShoppingList } from "./shopping-list";
import { HealthCard } from "./health-card";
import { MobileTabBar, type MobileTab } from "./mobile-tab-bar";
import {
  DEFAULT_NUTRITION_TARGETS,
  NutritionTargetSettings as NutritionTargetSettingsControl,
  type NutritionTargetSettings as NutritionTargetSettingsState,
} from "./nutrition-target-settings";
import {
  DEFAULT_HEALTH_TARGETS,
  type HealthTargetValues,
} from "@/lib/health-metrics";
import { generateShoppingListFromPlannedMeals } from "@/lib/shopping-list";
import { FoodDatabase } from "./food-database";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types/database";
import { useMealPlanData } from "@/hooks/use-meal-plan-data";

type DesktopRightPanelTab = "recipes" | "shopping";

export function MealPlannerMain() {
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeFormKey, setRecipeFormKey] = useState(0);
  const [recipeLibraryRefreshKey, setRecipeLibraryRefreshKey] = useState(0);
  const [nutritionTargets, setNutritionTargets] =
    useState<NutritionTargetSettingsState>(DEFAULT_NUTRITION_TARGETS);
  const [healthTargets, setHealthTargets] = useState<HealthTargetValues>(
    DEFAULT_HEALTH_TARGETS,
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("plan");
  const [desktopRightPanelTab, setDesktopRightPanelTab] =
    useState<DesktopRightPanelTab>("recipes");

  const mealPlanData = useMealPlanData();

  const shoppingListItems = useMemo(
    () =>
      generateShoppingListFromPlannedMeals(
        mealPlanData.plannedMeals,
        mealPlanData.recipes,
        mealPlanData.recipeIngredientsByRecipeId,
        mealPlanData.foodItemsById,
      ),
    [
      mealPlanData.plannedMeals,
      mealPlanData.recipes,
      mealPlanData.recipeIngredientsByRecipeId,
      mealPlanData.foodItemsById,
    ],
  );

  const handleRecipeSaved = () => {
    setIsRecipeFormOpen(false);
    setEditingRecipe(null);
    setRecipeFormKey((prev) => prev + 1);
    setRecipeLibraryRefreshKey((prev) => prev + 1);
    mealPlanData.reload();
  };

  const handleNewRecipe = () => {
    setEditingRecipe(null);
    setRecipeFormKey((prev) => prev + 1);
    setIsRecipeFormOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setRecipeFormKey((prev) => prev + 1);
    setIsRecipeFormOpen(true);
  };

  const healthCard = (
    <HealthCard
      plannedMeals={mealPlanData.plannedMeals}
      recipeIngredientsByRecipeId={mealPlanData.recipeIngredientsByRecipeId}
      foodItemsById={mealPlanData.foodItemsById}
      healthTargets={healthTargets}
    />
  );

  return (
    <div className="min-h-screen bg-brand-app-bg pb-16 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-brand-card-border bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="font-heading text-2xl font-extrabold text-brand-ink">
            Wochen-Essensplaner
          </h1>
          <div className="flex items-center gap-2">
            <FoodDatabase />
            <NutritionTargetSettingsControl
              onTargetsChange={setNutritionTargets}
              onHealthTargetsChange={setHealthTargets}
            />
            <Dialog
              open={isRecipeFormOpen}
              onOpenChange={(open) => {
                setIsRecipeFormOpen(open);
                if (!open) {
                  setEditingRecipe(null);
                  setRecipeFormKey((prev) => prev + 1);
                }
              }}
            >
              <RecipeForm
                key={recipeFormKey}
                recipe={editingRecipe}
                onRecipeSaved={handleRecipeSaved}
              />
            </Dialog>
          </div>
        </div>
      </header>

      <main className="p-4">
        {/* Desktop layout: health card + week view next to the recipe-library-or-shopping-list panel */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
            <div className="space-y-4">
              {healthCard}
              <MealWeekView
                recipes={mealPlanData.recipes}
                plannedMeals={mealPlanData.plannedMeals}
                loading={mealPlanData.loading}
                nutritionTargets={nutritionTargets}
                onDataChanged={mealPlanData.reload}
              />
            </div>
            <Card className="p-3">
              <div className="flex gap-1 rounded-xl bg-brand-chip-neutral p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDesktopRightPanelTab("recipes")}
                  className={cn(
                    "flex-1 rounded-full",
                    desktopRightPanelTab === "recipes" &&
                      "bg-white text-brand-accent-dark shadow-sm",
                  )}
                >
                  Rezeptbibliothek
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDesktopRightPanelTab("shopping")}
                  className={cn(
                    "flex-1 rounded-full",
                    desktopRightPanelTab === "shopping" &&
                      "bg-white text-brand-accent-dark shadow-sm",
                  )}
                >
                  Einkaufsliste
                </Button>
              </div>

              <div>
                {desktopRightPanelTab === "recipes" ? (
                  <RecipeLibrary
                    key={recipeLibraryRefreshKey}
                    onNewRecipe={handleNewRecipe}
                    onRecipeSelect={() => {}}
                    onRecipeEdit={handleEditRecipe}
                  />
                ) : (
                  <ShoppingList items={shoppingListItems} />
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Mobile layout: single active tab, switched via the bottom nav */}
        <div className="space-y-4 lg:hidden">
          {mobileTab === "plan" && (
            <>
              {healthCard}
              <MealWeekView
                recipes={mealPlanData.recipes}
                plannedMeals={mealPlanData.plannedMeals}
                loading={mealPlanData.loading}
                nutritionTargets={nutritionTargets}
                onDataChanged={mealPlanData.reload}
              />
            </>
          )}
          {mobileTab === "shopping" && (
            <Card className="p-3">
              <ShoppingList items={shoppingListItems} />
            </Card>
          )}
          {mobileTab === "recipes" && (
            <Card className="p-3">
              <RecipeLibrary
                key={recipeLibraryRefreshKey}
                onNewRecipe={handleNewRecipe}
                onRecipeSelect={() => {}}
                onRecipeEdit={handleEditRecipe}
              />
            </Card>
          )}
        </div>
      </main>

      <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} />
    </div>
  );
}
