"use client";

import { CalendarDays, ShoppingCart, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTab = "plan" | "shopping" | "recipes";

const TABS: { value: MobileTab; label: string; Icon: typeof CalendarDays }[] = [
  { value: "plan", label: "Planer", Icon: CalendarDays },
  { value: "shopping", label: "Einkauf", Icon: ShoppingCart },
  { value: "recipes", label: "Rezepte", Icon: BookOpen },
];

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brand-card-border bg-white lg:hidden">
      {TABS.map(({ value, label, Icon }) => {
        const isActive = value === activeTab;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onTabChange(value)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium",
              isActive ? "text-brand-accent-dark" : "text-brand-tertiary",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
