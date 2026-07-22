"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FoodColor } from "@/types/database";

export type FoodItemTagValues = {
  is_plant: boolean;
  is_legume: boolean;
  is_fermented: boolean;
  is_whole_grain: boolean;
  has_added_sugar: boolean;
  is_processed: boolean;
  color: FoodColor | null;
};

export const DEFAULT_FOOD_ITEM_TAGS: FoodItemTagValues = {
  is_plant: false,
  is_legume: false,
  is_fermented: false,
  is_whole_grain: false,
  has_added_sugar: false,
  is_processed: false,
  color: null,
};

export const FOOD_COLOR_OPTIONS: {
  value: FoodColor;
  label: string;
  swatchClassName: string;
}[] = [
  { value: "red", label: "Rot", swatchClassName: "bg-brand-red" },
  { value: "yellow", label: "Gelb", swatchClassName: "bg-brand-orange" },
  { value: "green", label: "Grün", swatchClassName: "bg-brand-accent" },
  { value: "purple", label: "Lila", swatchClassName: "bg-brand-purple" },
  { value: "brown", label: "Braun", swatchClassName: "bg-brand-brown" },
];

const TAG_CHECKBOX_FIELDS: {
  key: keyof Omit<FoodItemTagValues, "color">;
  label: string;
}[] = [
  { key: "is_plant", label: "Pflanzlich" },
  { key: "is_legume", label: "Hülsenfrucht" },
  { key: "is_fermented", label: "Fermentiert" },
  { key: "is_whole_grain", label: "Vollkorn" },
  { key: "has_added_sugar", label: "Zugesetzter Zucker" },
  { key: "is_processed", label: "Verarbeitet" },
];

interface FoodItemFieldsProps {
  value: FoodItemTagValues;
  onChange: (value: FoodItemTagValues) => void;
  idPrefix: string;
}

export function FoodItemFields({ value, onChange, idPrefix }: FoodItemFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {TAG_CHECKBOX_FIELDS.map((field) => {
          const inputId = `${idPrefix}-${field.key}`;

          return (
            <div key={field.key} className="flex items-center gap-2">
              <Checkbox
                id={inputId}
                checked={value[field.key]}
                onCheckedChange={(checked) =>
                  onChange({ ...value, [field.key]: checked === true })
                }
              />
              <Label htmlFor={inputId} className="text-sm font-normal">
                {field.label}
              </Label>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-brand-tertiary">Farbe</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...value, color: null })}
            className={cn(
              "flex size-6 items-center justify-center rounded-full border border-dashed border-brand-disabled text-[10px] text-brand-muted",
              value.color === null && "ring-2 ring-offset-1 ring-brand-secondary",
            )}
            aria-label="Keine Farbe"
            title="Keine Farbe"
          >
            &times;
          </button>
          {FOOD_COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...value, color: option.value })}
              className={cn(
                "size-6 rounded-full",
                option.swatchClassName,
                value.color === option.value && "ring-2 ring-offset-1 ring-brand-accent-dark",
              )}
              aria-label={option.label}
              title={option.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
