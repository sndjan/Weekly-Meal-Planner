'use client';

import { useEffect, useState } from 'react';
import { ShoppingListItem } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShoppingListProps {
  items: ShoppingListItem[];
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [editableItems, setEditableItems] = useState<ShoppingListItem[]>(items);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setEditableItems(items);
    setCheckedItems(new Set());
  }, [items]);

  const toggleItem = (rowKey: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(rowKey)) {
      newSet.delete(rowKey);
    } else {
      newSet.add(rowKey);
    }
    setCheckedItems(newSet);
  };

  const updateItem = (index: number, updates: Partial<ShoppingListItem>) => {
    setEditableItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    setEditableItems((prev) => prev.filter((_, currentIndex) => currentIndex !== index));

    const nextCheckedItems = new Set<string>();
    checkedItems.forEach((key) => {
      const itemIndex = Number.parseInt(key.split('-')[1] ?? '-1', 10);

      if (itemIndex < index) {
        nextCheckedItems.add(key);
      }

      if (itemIndex > index) {
        nextCheckedItems.add(`row-${itemIndex - 1}`);
      }
    });

    setCheckedItems(nextCheckedItems);
  };

  const addCustomItem = () => {
    setEditableItems((prev) => [
      ...prev,
      {
        ingredient: '',
        quantity: 1,
        unit: '',
      },
    ]);
  };

  const handleDownload = () => {
    const cleanedItems = editableItems.filter((item) => item.ingredient.trim().length > 0);

    if (cleanedItems.length === 0) {
      toast.error('Nothing to download');
      return;
    }

    const content = cleanedItems
      .map(item => {
        const qty = Number.isInteger(item.quantity)
          ? String(item.quantity)
          : item.quantity.toFixed(2);
        return item.unit
          ? `${qty} ${item.unit} ${item.ingredient}`
          : `${qty} ${item.ingredient}`;
      })
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    );
    element.setAttribute('download', 'shopping-list.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Shopping list downloaded');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Shopping List</CardTitle>
          <div className="space-x-2">
            <Button size="sm" variant="outline" onClick={addCustomItem}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editableItems.length === 0 ? (
          <p className="text-sm text-gray-500">No items in shopping list</p>
        ) : (
          <ul className="space-y-2">
            {editableItems.map((item, index) => {
              const key = `row-${index}`;
              const isChecked = checkedItems.has(key);
              const qty = Number.isInteger(item.quantity)
                ? String(item.quantity)
                : item.quantity.toFixed(2);

              return (
                <li key={key} className={`grid grid-cols-[auto_84px_84px_1fr_auto] gap-2 items-center ${isChecked ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(key)}
                    className="w-4 h-4"
                  />

                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={qty}
                    onChange={(event) => {
                      const parsed = Number.parseFloat(event.target.value);
                      updateItem(index, {
                        quantity: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
                      });
                    }}
                    className="h-8"
                    />

                    <Input
                    value={item.unit}
                    onChange={(event) => updateItem(index, { unit: event.target.value })}
                    placeholder="unit"
                    className="h-8"
                    />

                    <Input
                    value={item.ingredient.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    onChange={(event) => updateItem(index, { ingredient: event.target.value })}
                    placeholder="ingredient"
                    className={`h-8 ${isChecked ? 'line-through' : ''}`}
                    />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
