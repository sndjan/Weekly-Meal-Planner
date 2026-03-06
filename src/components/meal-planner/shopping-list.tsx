'use client';

import { useState } from 'react';
import { ShoppingListItem } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateBringAppLink } from '@/lib/shopping-list';
import { Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShoppingListProps {
  items: ShoppingListItem[];
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (ingredient: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(ingredient)) {
      newSet.delete(ingredient);
    } else {
      newSet.add(ingredient);
    }
    setCheckedItems(newSet);
  };

  const handleExportToBring = () => {
    const url = generateBringAppLink(items);
    window.open(url, '_blank');
    toast.success('Opened Bring app');
  };

  const handleDownload = () => {
    const content = items
      .map(item => {
        const qty = Number.isInteger(item.quantity)
          ? String(item.quantity)
          : item.quantity.toFixed(2);
        return item.unit
          ? `${qty} ${item.unit} ${item.ingredient}`
          : `${item.ingredient}`;
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
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleExportToBring}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Bring App
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No items in shopping list</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const key = `${item.ingredient}|${item.unit}`;
              const isChecked = checkedItems.has(key);
              const qty = Number.isInteger(item.quantity)
                ? String(item.quantity)
                : item.quantity.toFixed(2);

              return (
                <li key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(key)}
                    className="w-4 h-4"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isChecked ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {item.unit ? `${qty} ${item.unit}` : qty} {item.ingredient}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
