import type { MealType } from "@/types/database";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Frühstück",
  lunch: "Mittagessen",
  dinner: "Abendessen",
  snack: "Snack",
  extra: "Extra",
};
