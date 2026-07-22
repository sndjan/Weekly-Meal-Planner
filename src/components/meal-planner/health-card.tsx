"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  calculateHealthMetrics,
  type HealthTargetValues,
  type MealForHealthMetrics,
} from "@/lib/health-metrics";
import { FOOD_COLOR_OPTIONS } from "./food-item-fields";
import type { FoodItem, RecipeIngredient } from "@/types/database";

interface HealthCardProps {
  plannedMeals: MealForHealthMetrics[];
  recipeIngredientsByRecipeId: Record<string, RecipeIngredient[]>;
  foodItemsById: Record<string, FoodItem>;
  healthTargets: HealthTargetValues;
}

function PlantDiversityRing({ count, target }: { count: number; target: number }) {
  const percentage = target > 0 ? Math.min(count / target, 1) * 100 : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-brand-track"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-brand-accent transition-[stroke-dashoffset]"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-heading text-lg font-extrabold leading-none text-brand-ink">{count}</span>
        <span className="text-[10px] text-brand-tertiary">/{target}</span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  target,
  isOnTarget,
}: {
  label: string;
  value: string;
  target: string;
  isOnTarget: boolean;
}) {
  return (
    <div className="rounded-lg bg-brand-stat-bg px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">{label}</p>
      <p className="font-heading text-base font-extrabold text-brand-ink">
        {value}
        <span
          className={cn(
            "ml-1 text-xs font-normal",
            isOnTarget ? "text-brand-accent-dark" : "text-brand-warn",
          )}
        >
          {target}
        </span>
      </p>
    </div>
  );
}

export function HealthCard({
  plannedMeals,
  recipeIngredientsByRecipeId,
  foodItemsById,
  healthTargets,
}: HealthCardProps) {
  const metrics = calculateHealthMetrics(
    plannedMeals,
    recipeIngredientsByRecipeId,
    foodItemsById,
    healthTargets,
  );

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4 px-4">
        <PlantDiversityRing
          count={metrics.plantDiversity.count}
          target={metrics.plantDiversity.target}
        />
        <div>
          <p className="text-sm font-semibold text-brand-accent-dark">Pflanzenvielfalt</p>
          <p className="text-xs text-brand-tertiary">einzigartige Pflanzen diese Woche</p>
        </div>

        <div className="ml-auto grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          <StatTile
            label="Unverarbeitet"
            value={`${Math.round(metrics.unprocessedPct.value)}%`}
            target={`Ziel ≥${metrics.unprocessedPct.target}%`}
            isOnTarget={metrics.unprocessedPct.value >= metrics.unprocessedPct.target}
          />
          <StatTile
            label="Fermentiert"
            value={`${metrics.fermented.count}`}
            target={`${metrics.fermented.min}-${metrics.fermented.max}`}
            isOnTarget={
              metrics.fermented.count >= metrics.fermented.min &&
              metrics.fermented.count <= metrics.fermented.max
            }
          />
          <StatTile
            label="Hülsenfrüchte"
            value={`${metrics.legumes.count}`}
            target={`${metrics.legumes.min}-${metrics.legumes.max}`}
            isOnTarget={
              metrics.legumes.count >= metrics.legumes.min &&
              metrics.legumes.count <= metrics.legumes.max
            }
          />
          <StatTile
            label="Vollkorn"
            value={`${Math.round(metrics.wholeGrainPct.value)}%`}
            target={`Ziel >${metrics.wholeGrainPct.target}%`}
            isOnTarget={metrics.wholeGrainPct.value > metrics.wholeGrainPct.target}
          />
          <StatTile
            label="Zugesetzter Zucker"
            value={`${metrics.addedSugarMeals.count}`}
            target={`≤${metrics.addedSugarMeals.max}`}
            isOnTarget={metrics.addedSugarMeals.count <= metrics.addedSugarMeals.max}
          />
          <div className="rounded-lg bg-brand-stat-bg px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
              Farbdiversität
            </p>
            <div className="mt-1.5 flex items-center gap-1">
              {FOOD_COLOR_OPTIONS.map((option) => (
                <span
                  key={option.value}
                  title={option.label}
                  className={cn(
                    "size-3 rounded-full",
                    metrics.colorDiversity.colorsPresent.includes(option.value)
                      ? option.swatchClassName
                      : "bg-brand-track",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
