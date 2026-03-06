'use client';

import { useState } from 'react';
import { MealWeekView } from './meal-week-view';
import { RecipeLibrary } from './recipe-library';
import { RecipeForm } from './recipe-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function MealPlannerMain() {
  const [isRecipeFormOpen, setIsRecipeFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecipeCreated = () => {
    setIsRecipeFormOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Meal Planner</h1>
          <Dialog open={isRecipeFormOpen} onOpenChange={setIsRecipeFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Recipe
              </Button>
            </DialogTrigger>
            <RecipeForm onRecipeCreated={handleRecipeCreated} />
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MealWeekView key={refreshKey} />
          </div>
          <div>
            <RecipeLibrary key={refreshKey} onRecipeSelect={() => {
              // Handle recipe selection for drag and drop or modal
            }} />
          </div>
        </div>
      </main>
    </div>
  );
}
