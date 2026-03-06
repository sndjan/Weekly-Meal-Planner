'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserPreferences, NutritionValues } from '@/types/database';

interface NutritionalSummaryProps {
  dayIndex: number;
  plannedRecipes: Array<{ calories?: number; protein?: number; carbs?: number; fats?: number }>;
}

export function NutritionalSummary({ dayIndex, plannedRecipes }: NutritionalSummaryProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) setPreferences(data);
      } catch (err) {
        console.error('Failed to fetch preferences');
      }
    };

    fetchPreferences();
  }, [supabase]);

  // Calculate totals
  const totals = plannedRecipes.reduce(
    (acc, recipe) => ({
      calories: acc.calories + (recipe.calories || 0),
      protein: acc.protein + (recipe.protein || 0),
      carbs: acc.carbs + (recipe.carbs || 0),
      fats: acc.fats + (recipe.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const targets = {
    calories: preferences?.calories_target || 2000,
    protein: preferences?.protein_target || 150,
    carbs: preferences?.carbs_target || 250,
    fats: preferences?.fats_target || 70,
  };

  const getPercentage = (actual: number, target: number): number => {
    return target > 0 ? Math.round((actual / target) * 100) : 0;
  };

  const getNutritionColor = (percentage: number): string => {
    if (percentage < 80) return 'bg-red-200';
    if (percentage <= 120) return 'bg-green-200';
    return 'bg-yellow-200';
  };

  const NutritionBar = ({
    label,
    actual,
    target,
  }: {
    label: string;
    actual: number;
    target: number;
  }) => {
    const percentage = getPercentage(actual, target);
    const displayActual = actual.toFixed(0);

    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium">{label}</span>
          <span className="text-xs text-gray-600">
            {displayActual} / {target.toFixed(0)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getNutritionColor(percentage)}`}
            style={{
              width: `${Math.min(percentage, 100)}%`,
            }}
          />
        </div>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-sm mb-3">Daily Summary</h4>
      <NutritionBar label="Protein (g)" actual={totals.protein} target={targets.protein} />
      <NutritionBar label="Carbs (g)" actual={totals.carbs} target={targets.carbs} />
      <NutritionBar label="Fats (g)" actual={totals.fats} target={targets.fats} />
      <NutritionBar label="Calories" actual={totals.calories} target={targets.calories} />
    </div>
  );
}
