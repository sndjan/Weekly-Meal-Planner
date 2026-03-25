"use client";

import { useEffect, useState } from "react";
import { ShoppingListItem } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface ShoppingListProps {
  items: ShoppingListItem[];
}

const CHECKED_ITEMS_STORAGE_KEY =
  "weekly-meal-planner:shopping-list:checked-items";

function getItemStorageKey(item: ShoppingListItem): string {
  return `${item.ingredient.trim().toLowerCase()}|${item.unit.trim().toLowerCase()}`;
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [editableItems, setEditableItems] = useState<ShoppingListItem[]>(items);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedItems = window.localStorage.getItem(
        CHECKED_ITEMS_STORAGE_KEY,
      );

      if (!storedItems) {
        return;
      }

      const parsed = JSON.parse(storedItems);

      if (!Array.isArray(parsed)) {
        return;
      }

      const validKeys = parsed.filter(
        (entry): entry is string => typeof entry === "string",
      );
      setCheckedItems(new Set(validKeys));
    } catch {
      // Ignore malformed data and start with an empty set.
    } finally {
      setIsStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) {
      return;
    }

    window.localStorage.setItem(
      CHECKED_ITEMS_STORAGE_KEY,
      JSON.stringify(Array.from(checkedItems)),
    );
  }, [checkedItems, isStorageHydrated]);

  useEffect(() => {
    setEditableItems(items);

    const validItemKeys = new Set(items.map((item) => getItemStorageKey(item)));

    setCheckedItems((prev) => {
      const nextCheckedItems = new Set<string>();

      prev.forEach((key) => {
        if (validItemKeys.has(key)) {
          nextCheckedItems.add(key);
        }
      });

      return nextCheckedItems;
    });
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
          : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    const removedItem = editableItems[index];

    setEditableItems((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );

    if (!removedItem) {
      return;
    }

    const removedItemKey = getItemStorageKey(removedItem);
    setCheckedItems((prev) => {
      const nextCheckedItems = new Set(prev);
      nextCheckedItems.delete(removedItemKey);
      return nextCheckedItems;
    });
  };

  const addCustomItem = () => {
    setEditableItems((prev) => [
      ...prev,
      {
        ingredient: "",
        quantity: 1,
        unit: "",
      },
    ]);
  };

  const viewRows = editableItems.map((item, index) => {
    const key = `row-${index}`;
    const checkKey = getItemStorageKey(item);
    const isChecked = checkedItems.has(checkKey);
    const qty = Number.isInteger(item.quantity)
      ? String(item.quantity)
      : item.quantity.toFixed(2);
    const formattedIngredient = item.ingredient
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      item,
      index,
      key,
      checkKey,
      isChecked,
      qty,
      formattedIngredient,
      itemLabel: item.unit
        ? `${qty} ${item.unit} ${formattedIngredient}`
        : `${qty} ${formattedIngredient}`,
    };
  });

  const uncheckedViewRows = viewRows.filter((row) => !row.isChecked);
  const checkedViewRows = viewRows.filter((row) => row.isChecked);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Shopping List</CardTitle>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addCustomItem}
              disabled={!isEditMode}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={isEditMode ? "default" : "outline"}
              onClick={() => setIsEditMode((prev) => !prev)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {/* <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editableItems.length === 0 ? (
          <p className="text-sm text-gray-500">No items in shopping list</p>
        ) : !isEditMode ? (
          <div className="space-y-2">
            <ul className="space-y-1">
              {uncheckedViewRows.map((row) => (
                <li
                  key={row.key}
                  className="flex items-center gap-2 text-sm leading-5"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleItem(row.checkKey)}
                    className="w-4 h-4"
                  />
                  <span>{row.itemLabel.trim()}</span>
                </li>
              ))}
            </ul>

            {checkedViewRows.length > 0 && (
              <details className=" border-gray-200 py-2">
                <summary className="cursor-pointer select-none text-xs text-gray-600">
                  Completed ({checkedViewRows.length})
                </summary>
                <ul className="mt-2 space-y-1">
                  {checkedViewRows.map((row) => (
                    <li
                      key={row.key}
                      className="flex items-center gap-2 text-sm leading-5 opacity-50"
                    >
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleItem(row.checkKey)}
                        className="w-4 h-4"
                      />
                      <span className="line-through">
                        {row.itemLabel.trim()}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {viewRows.map((row) => {
              return (
                <li
                  key={row.key}
                  className={`grid grid-cols-[auto_84px_84px_1fr_auto] gap-2 items-center ${row.isChecked ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={row.isChecked}
                    onChange={() => toggleItem(row.checkKey)}
                    className="w-4 h-4"
                  />

                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.qty}
                    onChange={(event) => {
                      const parsed = Number.parseFloat(event.target.value);
                      updateItem(row.index, {
                        quantity:
                          Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
                      });
                    }}
                    className="h-8"
                  />

                  <Input
                    value={row.item.unit}
                    onChange={(event) =>
                      updateItem(row.index, { unit: event.target.value })
                    }
                    placeholder="unit"
                    className="h-8"
                  />

                  <Input
                    value={row.formattedIngredient}
                    onChange={(event) =>
                      updateItem(row.index, { ingredient: event.target.value })
                    }
                    placeholder="ingredient"
                    className={`h-8 ${row.isChecked ? "line-through" : ""}`}
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(row.index)}
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
