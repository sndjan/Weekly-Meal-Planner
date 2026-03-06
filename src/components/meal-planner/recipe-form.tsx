'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface RecipeFormProps {
  onRecipeCreated: () => void;
}

export function RecipeForm({ onRecipeCreated }: RecipeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: '',
    preparation_steps: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    serving_size: '1',
    is_public: false,
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to create a recipe');
        return;
      }

      const { error } = await supabase.from('recipes').insert([
        {
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          ingredients: formData.ingredients,
          preparation_steps: formData.preparation_steps,
          calories: formData.calories ? parseFloat(formData.calories) : null,
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fats: formData.fats ? parseFloat(formData.fats) : null,
          serving_size: parseFloat(formData.serving_size) || 1,
          is_public: formData.is_public,
        },
      ]);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Recipe created successfully!');
      onRecipeCreated();
    } catch (err) {
      toast.error('Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Recipe</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Recipe Name *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Grilled Chicken with Vegetables"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Brief description of the recipe"
          />
        </div>

        <div>
          <Label htmlFor="ingredients">Ingredients *</Label>
          <Textarea
            id="ingredients"
            required
            value={formData.ingredients}
            onChange={(e) =>
              setFormData({ ...formData, ingredients: e.target.value })
            }
            placeholder="List ingredients (one per line):&#10;- 500g chicken breast&#10;- 2 cups broccoli&#10;- 3 tbsp olive oil"
            className="h-24"
          />
        </div>

        <div>
          <Label htmlFor="preparation_steps">Preparation Steps *</Label>
          <Textarea
            id="preparation_steps"
            required
            value={formData.preparation_steps}
            onChange={(e) =>
              setFormData({ ...formData, preparation_steps: e.target.value })
            }
            placeholder="Steps to prepare the recipe (one per line):&#10;1. Preheat oven to 200°C&#10;2. Season chicken with salt and pepper"
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serving_size">Serving Size</Label>
            <Input
              id="serving_size"
              type="number"
              step="0.5"
              min="1"
              value={formData.serving_size}
              onChange={(e) =>
                setFormData({ ...formData, serving_size: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="calories">Calories (per serving)</Label>
            <Input
              id="calories"
              type="number"
              step="0.1"
              value={formData.calories}
              onChange={(e) =>
                setFormData({ ...formData, calories: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={(e) =>
                setFormData({ ...formData, protein: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              step="0.1"
              value={formData.carbs}
              onChange={(e) =>
                setFormData({ ...formData, carbs: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="fats">Fats (g)</Label>
            <Input
              id="fats"
              type="number"
              step="0.1"
              value={formData.fats}
              onChange={(e) =>
                setFormData({ ...formData, fats: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public}
            onChange={(e) =>
              setFormData({ ...formData, is_public: e.target.checked })
            }
            className="w-4 h-4"
          />
          <label htmlFor="is_public" className="ml-2 text-sm">
            Make this recipe public
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Recipe'}
        </Button>
      </form>
    </DialogContent>
  );
}
