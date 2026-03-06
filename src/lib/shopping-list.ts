import type { ShoppingListItem } from '@/types/database';

/**
 * Parse ingredient string to extract quantity and unit
 * e.g., "200g flour" -> { ingredient: "flour", quantity: 200, unit: "g" }
 */
export function parseIngredient(ingredient: string): {
  ingredient: string;
  quantity: number;
  unit: string;
} {
  const trimmed = ingredient.trim();
  
  // Try to match pattern: "number unit name"
  const match = trimmed.match(/^([\d.]+)\s*([a-zA-Z]+)?\s+(.+)$/);
  
  if (match) {
    const quantity = parseFloat(match[1]);
    const unit = match[2] || '';
    const ingredientName = match[3];
    
    return {
      ingredient: ingredientName.toLowerCase(),
      quantity,
      unit,
    };
  }
  
  // If no match, treat the whole thing as ingredient name with quantity 1
  return {
    ingredient: trimmed.toLowerCase(),
    quantity: 1,
    unit: '',
  };
}

/**
 * Merge shopping list items intelligently
 * Combines quantities for identical ingredients with the same units
 * Keeps separate entries for different units or names
 */
export function mergeShoppingList(items: ShoppingListItem[]): ShoppingListItem[] {
  const grouped = new Map<string, ShoppingListItem>();
  
  for (const item of items) {
    const key = `${item.ingredient}|${item.unit}`;
    
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.quantity += item.quantity;
    } else {
      grouped.set(key, { ...item });
    }
  }
  
  return Array.from(grouped.values()).sort((a, b) => 
    a.ingredient.localeCompare(b.ingredient)
  );
}

/**
 * Generate shopping list from recipe ingredients
 */
export function generateShoppingListFromRecipes(
  recipes: Array<{ ingredients: string; serving_size?: number }>,
  portionMultipliers?: Record<string, number>
): ShoppingListItem[] {
  const items: ShoppingListItem[] = [];
  
  recipes.forEach((recipe, index) => {
    const multiplier = portionMultipliers?.[index] ?? 1;
    const servingSize = recipe.serving_size ?? 1;
    const finalMultiplier = multiplier / servingSize;
    
    const ingredientLines = recipe.ingredients
      .split('\n')
      .filter(line => line.trim().length > 0);
    
    for (const line of ingredientLines) {
      const parsed = parseIngredient(line.replace(/^[-•*]\s*/, ''));
      
      items.push({
        ingredient: parsed.ingredient,
        quantity: parsed.quantity * finalMultiplier,
        unit: parsed.unit,
      });
    }
  });
  
  return mergeShoppingList(items);
}

/**
 * Format shopping list for display
 */
export function formatShoppingList(items: ShoppingListItem[]): string {
  return items
    .map(item => {
      const qty = Number.isInteger(item.quantity) 
        ? item.quantity 
        : item.quantity.toFixed(2);
      
      const capitalizedIngredient = item.ingredient.charAt(0).toUpperCase() + item.ingredient.slice(1);
      
      return item.unit 
        ? `${qty} ${item.unit} ${capitalizedIngredient}`
        : `${qty} ${capitalizedIngredient}`;
    })
    .join('\n');
}

/**
 * Build Bring app deep link URL
 * Reference: https://sites.google.com/getbring.com/bring-import-dev-guide/web-to-app-integration
 */
export function generateBringAppLink(items: ShoppingListItem[]): string {
  const listNameEncoded = encodeURIComponent('Weekly Meal Planner');
  
  const itemsParams = items
    .map(item => {
      const qty = Number.isInteger(item.quantity)
        ? String(item.quantity)
        : item.quantity.toFixed(2);
      
      const fullItem = item.unit ? `${qty} ${item.unit} ${item.ingredient}` : `${qty} ${item.ingredient}`;
      return `&listItems[]=${encodeURIComponent(fullItem)}`;
    })
    .join('');
  
  return `https://www.getbring.com/?listName=${listNameEncoded}${itemsParams}`;
}
