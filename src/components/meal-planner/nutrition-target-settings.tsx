"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserPreferences } from "@/types/database";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export type NutritionTargetSettings = {
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fats_target: number;
  calories_target_enabled: boolean;
  protein_target_enabled: boolean;
  carbs_target_enabled: boolean;
  fats_target_enabled: boolean;
};

export const DEFAULT_NUTRITION_TARGETS: NutritionTargetSettings = {
  calories_target: 2000,
  protein_target: 150,
  carbs_target: 250,
  fats_target: 70,
  calories_target_enabled: true,
  protein_target_enabled: true,
  carbs_target_enabled: true,
  fats_target_enabled: true,
};

const toNutritionTargets = (
  preferences?: Partial<UserPreferences> | null,
): NutritionTargetSettings => ({
  calories_target: Number(
    preferences?.calories_target ?? DEFAULT_NUTRITION_TARGETS.calories_target,
  ),
  protein_target: Number(
    preferences?.protein_target ?? DEFAULT_NUTRITION_TARGETS.protein_target,
  ),
  carbs_target: Number(
    preferences?.carbs_target ?? DEFAULT_NUTRITION_TARGETS.carbs_target,
  ),
  fats_target: Number(
    preferences?.fats_target ?? DEFAULT_NUTRITION_TARGETS.fats_target,
  ),
  calories_target_enabled: Boolean(
    preferences?.calories_target_enabled ??
    DEFAULT_NUTRITION_TARGETS.calories_target_enabled,
  ),
  protein_target_enabled: Boolean(
    preferences?.protein_target_enabled ??
    DEFAULT_NUTRITION_TARGETS.protein_target_enabled,
  ),
  carbs_target_enabled: Boolean(
    preferences?.carbs_target_enabled ??
    DEFAULT_NUTRITION_TARGETS.carbs_target_enabled,
  ),
  fats_target_enabled: Boolean(
    preferences?.fats_target_enabled ??
    DEFAULT_NUTRITION_TARGETS.fats_target_enabled,
  ),
});

interface NutritionTargetSettingsProps {
  onTargetsChange?: (targets: NutritionTargetSettings) => void;
}

export function NutritionTargetSettings({
  onTargetsChange,
}: NutritionTargetSettingsProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [targetSettings, setTargetSettings] = useState<NutritionTargetSettings>(
    DEFAULT_NUTRITION_TARGETS,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const supabase = createClient();

  const activeTargets = useMemo(
    () =>
      preferences ? toNutritionTargets(preferences) : DEFAULT_NUTRITION_TARGETS,
    [preferences],
  );

  useEffect(() => {
    onTargetsChange?.(activeTargets);
  }, [activeTargets, onTargetsChange]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPreferences(null);
          setTargetSettings(DEFAULT_NUTRITION_TARGETS);
          return;
        }

        const { data: preferencesData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (preferencesData) {
          setPreferences(preferencesData);
          setTargetSettings(toNutritionTargets(preferencesData));
        } else {
          setPreferences(null);
          setTargetSettings(DEFAULT_NUTRITION_TARGETS);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load nutrition targets");
      }
    };

    loadPreferences();
  }, [supabase]);

  const handleTargetToggle = (
    field: keyof NutritionTargetSettings,
    checked: boolean,
  ) => {
    setTargetSettings((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleTargetValueChange = (
    field: keyof NutritionTargetSettings,
    value: string,
  ) => {
    const parsedValue = Number(value);

    setTargetSettings((prev) => ({
      ...prev,
      [field]:
        Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0,
    }));
  };

  const handleSaveTargets = async () => {
    try {
      setIsSavingTargets(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be signed in to save targets");
        return;
      }

      const payload = {
        user_id: user.id,
        calories_target: targetSettings.calories_target,
        protein_target: targetSettings.protein_target,
        carbs_target: targetSettings.carbs_target,
        fats_target: targetSettings.fats_target,
        calories_target_enabled: targetSettings.calories_target_enabled,
        protein_target_enabled: targetSettings.protein_target_enabled,
        carbs_target_enabled: targetSettings.carbs_target_enabled,
        fats_target_enabled: targetSettings.fats_target_enabled,
      };

      const { data, error } = await supabase
        .from("user_preferences")
        .upsert(payload, { onConflict: "user_id" })
        .select("*")
        .single();

      if (error) throw error;

      setPreferences(data);
      setIsSettingsOpen(false);
      toast.success("Nutrition targets saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save nutrition targets");
    } finally {
      setIsSavingTargets(false);
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-1.5 h-4 w-4" />
          Targets
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily Nutrition Targets</DialogTitle>
          <DialogDescription>
            Set your daily goals and choose which targets should be active.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="space-y-1">
              <Label htmlFor="calories-target">Calories</Label>
              <Input
                id="calories-target"
                type="number"
                min="0"
                value={targetSettings.calories_target}
                disabled={!targetSettings.calories_target_enabled}
                onChange={(e) =>
                  handleTargetValueChange("calories_target", e.target.value)
                }
              />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Checkbox
                id="calories-enabled"
                checked={targetSettings.calories_target_enabled}
                onCheckedChange={(checked) =>
                  handleTargetToggle(
                    "calories_target_enabled",
                    checked === true,
                  )
                }
              />
              <Label htmlFor="calories-enabled">Active</Label>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="space-y-1">
              <Label htmlFor="protein-target">Protein (g)</Label>
              <Input
                id="protein-target"
                type="number"
                min="0"
                value={targetSettings.protein_target}
                disabled={!targetSettings.protein_target_enabled}
                onChange={(e) =>
                  handleTargetValueChange("protein_target", e.target.value)
                }
              />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Checkbox
                id="protein-enabled"
                checked={targetSettings.protein_target_enabled}
                onCheckedChange={(checked) =>
                  handleTargetToggle("protein_target_enabled", checked === true)
                }
              />
              <Label htmlFor="protein-enabled">Active</Label>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="space-y-1">
              <Label htmlFor="carbs-target">Carbs (g)</Label>
              <Input
                id="carbs-target"
                type="number"
                min="0"
                value={targetSettings.carbs_target}
                disabled={!targetSettings.carbs_target_enabled}
                onChange={(e) =>
                  handleTargetValueChange("carbs_target", e.target.value)
                }
              />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Checkbox
                id="carbs-enabled"
                checked={targetSettings.carbs_target_enabled}
                onCheckedChange={(checked) =>
                  handleTargetToggle("carbs_target_enabled", checked === true)
                }
              />
              <Label htmlFor="carbs-enabled">Active</Label>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="space-y-1">
              <Label htmlFor="fats-target">Fats (g)</Label>
              <Input
                id="fats-target"
                type="number"
                min="0"
                value={targetSettings.fats_target}
                disabled={!targetSettings.fats_target_enabled}
                onChange={(e) =>
                  handleTargetValueChange("fats_target", e.target.value)
                }
              />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Checkbox
                id="fats-enabled"
                checked={targetSettings.fats_target_enabled}
                onCheckedChange={(checked) =>
                  handleTargetToggle("fats_target_enabled", checked === true)
                }
              />
              <Label htmlFor="fats-enabled">Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTargets} disabled={isSavingTargets}>
            {isSavingTargets ? "Saving..." : "Save Targets"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
