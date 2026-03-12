'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { Recipe, MealType } from '@/types/database';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddMealDialogProps {
  dayOfWeek: number;
  mealType: MealType;
  onMealAdded: () => void;
}

export function AddMealDialog({ dayOfWeek, mealType, onMealAdded }: AddMealDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [servingSize, setServingSize] = useState('1');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      const fetchRecipes = async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { data } = await supabase
            .from('recipes')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

          if (data) setRecipes(data);
        } catch (err) {
          toast.error('Failed to load recipes');
        }
      };

      fetchRecipes();
    }
  }, [isOpen, supabase]);

  const handleAddMeal = async () => {
    if (!selectedRecipe) {
      toast.error('Please select a recipe');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Get or create meal plan for this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const dateStr = weekStart.toISOString().split('T')[0];

      const { data: mealPlanData } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', dateStr)
        .maybeSingle();

      // @ts-ignore - TypeScript server not inferring Database types correctly
      let mealPlanId: string | undefined = mealPlanData?.id;

      if (!mealPlanId) {
        // @ts-ignore - TypeScript server not inferring Database types correctly
        const { data: newMealPlan, error: createError } = await supabase
          .from('meal_plans')
          // @ts-ignore - TypeScript server not inferring Database types correctly
          .insert({
            user_id: user.id,
            week_start_date: dateStr,
          })
          .select('*')
          .single();

        if (createError) throw createError;
        // @ts-ignore - TypeScript server not inferring Database types correctly
        mealPlanId = newMealPlan?.id;
      }

      if (!mealPlanId) {
        toast.error('Failed to create meal plan');
        return;
      }

      // Add the meal
      // @ts-ignore - TypeScript server not inferring Database types correctly
      const { error: insertError } = await supabase
        .from('planned_meals')
        // @ts-ignore - TypeScript server not inferring Database types correctly
        .insert({
          meal_plan_id: mealPlanId,
          recipe_id: selectedRecipe,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          serving_size: parseFloat(servingSize) || 1,
        });

      if (insertError) throw insertError;

      toast.success('Meal added successfully!');
      setIsOpen(false);
      setSelectedRecipe('');
      setServingSize('1');
      onMealAdded();
    } catch (err) {
      toast.error('Failed to add meal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
        
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {mealType}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2"> 
            <Label htmlFor="recipe-select">Select Recipe</Label>
            <Select
              value={selectedRecipe}
              onValueChange={(value) => setSelectedRecipe(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Select a recipe --" />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serving-size">Serving Size</Label>
            <Input
              id="serving-size"
              type="number"
              step="0.5"
              min="0.5"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAddMeal}
            disabled={loading || !selectedRecipe}
            className="w-full"
          >
            {loading ? 'Adding...' : 'Add Meal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
