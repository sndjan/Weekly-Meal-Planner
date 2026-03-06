'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Recipe } from '@/types/database';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecipeLibraryProps {
  onRecipeSelect: (recipe: Recipe) => void;
}

export function RecipeLibrary({ onRecipeSelect }: RecipeLibraryProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
      } catch (err) {
        toast.error('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecipes(recipes.filter((r) => r.id !== id));
      toast.success('Recipe deleted');
    } catch (err) {
      toast.error('Failed to delete recipe');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recipe Library</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p className="text-sm text-gray-500">No recipes yet</p>
        ) : (
          <div className="space-y-2">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => onRecipeSelect(recipe)}
                    className="flex-1"
                  >
                    <h3 className="font-medium text-sm">{recipe.name}</h3>
                    <p className="text-xs text-gray-500">
                      {recipe.protein ? `${recipe.protein}g protein` : 'No data'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
