"use client";

import { useState } from "react";
import { MealWeekView } from "./meal-week-view";
import { RecipeLibrary } from "./recipe-library";
import { RecipeForm } from "./recipe-form";
import {
  DEFAULT_NUTRITION_TARGETS,
  NutritionTargetSettings as NutritionTargetSettingsControl,
  type NutritionTargetSettings as NutritionTargetSettingsState,
} from "./nutrition-target-settings";
import { Dialog } from "@/components/ui/dialog";
import type { Recipe } from "@/types/database";

export function MealPlannerMain() {
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeFormKey, setRecipeFormKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nutritionTargets, setNutritionTargets] =
    useState<NutritionTargetSettingsState>(DEFAULT_NUTRITION_TARGETS);

  const handleRecipeSaved = () => {
    setIsRecipeFormOpen(false);
    setEditingRecipe(null);
    setRecipeFormKey((prev) => prev + 1);
    setRefreshKey((prev) => prev + 1);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Weekly Meal Planner
          </h1>
          <div className="flex items-center gap-2">
            <NutritionTargetSettingsControl
              onTargetsChange={setNutritionTargets}
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

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MealWeekView
              key={refreshKey}
              nutritionTargets={nutritionTargets}
            />
          </div>
          <div>
            <RecipeLibrary
              key={refreshKey}
              onNewRecipe={handleNewRecipe}
              onRecipeSelect={() => {
                // Handle recipe selection for drag and drop or modal
              }}
              onRecipeEdit={handleEditRecipe}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
