"use client";

import { Droplets, Flame, Wheat, X, Zap } from "lucide-react";
import type { MealType, Recipe } from "@/types/database";
import type { NutritionTargetSettings } from "./nutrition-target-settings";
import { MEAL_TYPE_LABELS } from "@/lib/meal-labels";

interface MealSlotCardProps {
  recipe: Recipe;
  mealType: MealType;
  servingSize: number;
  nutritionTargets: NutritionTargetSettings;
  onRemove: () => void;
}

export function MealSlotCard({
  recipe,
  mealType,
  servingSize,
  nutritionTargets,
  onRemove,
}: MealSlotCardProps) {
  return (
    <div className="group relative rounded-xl bg-brand-accent-bg-light p-3 ring-1 ring-brand-accent/15">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full p-1 opacity-100 transition-opacity hover:bg-black/5 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={`${recipe.name} entfernen`}
      >
        <X className="h-3.5 w-3.5 text-brand-tertiary" />
      </button>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-secondary">
        {MEAL_TYPE_LABELS[mealType]}
      </p>
      <p className="pr-5 text-sm font-semibold text-brand-ink">{recipe.name}</p>
      <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-brand-secondary">
        {Boolean(recipe.calories) && nutritionTargets.calories_target_enabled && (
          <span className="inline-flex items-center gap-1 text-brand-accent-dark">
            <Flame className="h-3.5 w-3.5 text-brand-accent-dark" strokeWidth={2.5}/>
            {((recipe.calories ?? 0) * servingSize).toFixed(0)}
          </span>
        )}
        {Boolean(recipe.protein) && nutritionTargets.protein_target_enabled && (
          <span className="inline-flex items-center gap-1 text-brand-accent-dark">
            <Zap className="h-3.5 w-3.5 text-brand-accent-dark" />
            {((recipe.protein ?? 0) * servingSize).toFixed(0)}g
          </span>
        )}
        {Boolean(recipe.carbs) && nutritionTargets.carbs_target_enabled && (
          <span className="inline-flex items-center gap-1">
            <Wheat className="h-3.5 w-3.5 text-yellow-600" />
            {((recipe.carbs ?? 0) * servingSize).toFixed(0)}g
          </span>
        )}
        {Boolean(recipe.fats) && nutritionTargets.fats_target_enabled && (
          <span className="inline-flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5 text-sky-500" />
            {((recipe.fats ?? 0) * servingSize).toFixed(0)}g
          </span>
        )}
      </div>
    </div>
  );
}
