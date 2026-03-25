"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Recipe } from "@/types/database";
import { ExternalLink, Flame, Pencil, Trash2, Zap } from "lucide-react";

type VisibilityFilter = "all" | "private" | "public";
type SortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "protein-desc";

const ALL_TAGS_FILTER_VALUE = "__all_tags__";

const TAG_BADGE_CLASSES = [
  "bg-emerald-50 text-emerald-700 rounded-full",
  "bg-sky-50 text-sky-700 rounded-full",
  "bg-violet-50 text-violet-700 rounded-full",
  "bg-amber-50 text-amber-700 rounded-full",
  "bg-rose-50 text-rose-700 rounded-full",
  "bg-cyan-50 text-cyan-700 rounded-full",
];

const formatNumber = (value: number | null) => {
  if (value === null) {
    return null;
  }

  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1).replace(/\.0$/, "");
};

const getTextLines = (text: string | null) =>
  (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const getTagBadgeClassName = (tag: string) => {
  const hash = Array.from(tag.toLowerCase()).reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return TAG_BADGE_CLASSES[hash % TAG_BADGE_CLASSES.length];
};

const getPrimaryNutritionItems = (recipe: Recipe) => {
  return [
    {
      label: "Calories",
      value: recipe.calories,
      suffix: "",
      Icon: Flame,
      iconClassName: "text-orange-500 size-4",
    },
    {
      label: "Protein",
      value: recipe.protein,
      suffix: "g",
      Icon: Zap,
      iconClassName: "text-amber-500 size-4",
    },
  ].filter((item) => item.value !== null);
};

function TagBadges({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={getTagBadgeClassName(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function RecipePreview({ recipe, tags }: { recipe: Recipe; tags: string[] }) {
  const ingredientLines = getTextLines(recipe.ingredients);
  const preparationLines = getTextLines(recipe.preparation_steps);
  const nutritionItems = [
    { label: "Calories", value: recipe.calories, suffix: "" },
    { label: "Protein", value: recipe.protein, suffix: "g" },
    { label: "Carbs", value: recipe.carbs, suffix: "g" },
    { label: "Fats", value: recipe.fats, suffix: "g" },
  ].filter((item) => item.value !== null);

  const servingSize = formatNumber(recipe.serving_size);

  return (
    <div className="space-y-4">
      {recipe.image_url && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            width={720}
            height={480}
            className="h-56 w-full object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {recipe.name}
            </h3>
          </div>

          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label={`Open source for ${recipe.name}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {recipe.prep_time && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              {recipe.prep_time}
            </span>
          )}
          {servingSize && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              Serves {servingSize}
            </span>
          )}
        </div>

        <TagBadges tags={tags} />
      </div>

      {nutritionItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3">
          {nutritionItems.map((item) => (
            <div
              key={item.label}
              className="rounded-md bg-white px-3 py-2 ring-1 ring-gray-200"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {formatNumber(item.value)}
                {item.suffix}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Ingredients
          </h4>
          {ingredientLines.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {ingredientLines.map((ingredient) => (
                <li key={ingredient} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">No ingredients listed.</p>
          )}
        </div>

        {preparationLines.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Preparation
            </h4>
            <ol className="mt-2 space-y-2 text-sm text-gray-700">
              {preparationLines.map((step, index) => (
                <li key={`${index}-${step}`} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

interface RecipeListProps {
  recipes: Recipe[];
  recipeTagsById: Record<string, string[]>;
  loading: boolean;
  onRecipeEdit: (recipe: Recipe) => void;
  onRecipeDelete: (recipe: Recipe) => void;
  onRecipeSelect: (recipe: Recipe) => void;
  showActions?: boolean;
  disableDrag?: boolean;
  selectedRecipeId?: string | null;
}

export function RecipeList({
  recipes,
  recipeTagsById,
  loading,
  onRecipeEdit,
  onRecipeDelete,
  onRecipeSelect,
  showActions = true,
  disableDrag = false,
  selectedRecipeId = null,
}: RecipeListProps) {
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAGS_FILTER_VALUE);
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const availableTags = useMemo(() => {
    const uniqueTags = new Set<string>();

    Object.values(recipeTagsById).forEach((tags) => {
      tags.forEach((tag) => uniqueTags.add(tag));
    });

    return Array.from(uniqueTags).sort((a, b) => a.localeCompare(b));
  }, [recipeTagsById]);

  const filteredRecipes = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const results = recipes.filter((recipe) => {
      const recipeTags = recipeTagsById[recipe.id] ?? [];

      if (visibilityFilter === "public" && !recipe.is_public) {
        return false;
      }

      if (visibilityFilter === "private" && recipe.is_public) {
        return false;
      }

      if (selectedTag !== ALL_TAGS_FILTER_VALUE) {
        const matchesTag = recipeTags.some((tag) => tag === selectedTag);
        if (!matchesTag) {
          return false;
        }
      }

      if (!normalizedSearchQuery) {
        return true;
      }

      const searchableText = [
        recipe.name,
        recipe.ingredients,
        recipe.preparation_steps ?? "",
        recipe.prep_time ?? "",
        recipeTags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });

    return results.sort((a, b) => {
      if (sortOption === "newest") {
        return (
          (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0)
        );
      }

      if (sortOption === "oldest") {
        return (
          (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0)
        );
      }

      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortOption === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      return (b.protein ?? -1) - (a.protein ?? -1);
    });
  }, [
    recipes,
    recipeTagsById,
    searchQuery,
    visibilityFilter,
    selectedTag,
    sortOption,
  ]);

  useEffect(() => {
    if (
      selectedTag !== ALL_TAGS_FILTER_VALUE &&
      !availableTags.includes(selectedTag)
    ) {
      setSelectedTag(ALL_TAGS_FILTER_VALUE);
    }
  }, [availableTags, selectedTag]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading recipes...</p>;
  }

  if (recipes.length === 0) {
    return <p className="text-sm text-gray-500">No recipes yet</p>;
  }

  return (
    <div className="space-y-3">
      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search recipes, ingredients, or tags"
        aria-label="Search recipes"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Select
          value={visibilityFilter}
          onValueChange={(value: VisibilityFilter) =>
            setVisibilityFilter(value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedTag}
          onValueChange={(value) => setSelectedTag(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TAGS_FILTER_VALUE}>All Tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortOption}
          onValueChange={(value: SortOption) => setSortOption(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="protein-desc">Protein</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-gray-500">
        Showing {filteredRecipes.length} of {recipes.length} recipes
      </p>

      {filteredRecipes.length === 0 ? (
        <p className="text-sm text-gray-500">
          No recipes match your current search and filters.
        </p>
      ) : (
        filteredRecipes.map((recipe) => {
          const recipeTags = recipeTagsById[recipe.id] ?? [];
          const primaryNutritionItems = getPrimaryNutritionItems(recipe);

          return (
            <div
              key={recipe.id}
              draggable={!disableDrag}
              onDragStart={(e) => {
                if (disableDrag) {
                  return;
                }

                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData(
                  "application/json",
                  JSON.stringify({
                    type: "recipe",
                    recipe,
                  }),
                );
              }}
              className={`group rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                selectedRecipeId === recipe.id
                  ? "border-blue-300 bg-blue-50/40"
                  : "border-gray-200"
              } ${disableDrag ? "cursor-pointer" : "cursor-move"}`}
            >
              <div className="flex items-start justify-between">
                <Dialog
                  open={openRecipeId === recipe.id}
                  onOpenChange={(open: boolean) =>
                    setOpenRecipeId(open ? recipe.id : null)
                  }
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="flex flex-1 items-start gap-3 text-left"
                      aria-label={`Preview ${recipe.name}`}
                      onClick={() => onRecipeSelect(recipe)}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                        {recipe.image_url ? (
                          <Image
                            src={recipe.image_url}
                            alt={recipe.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-sm font-semibold uppercase text-gray-400">
                            {recipe.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-medium text-gray-900">
                          {recipe.name}
                        </h3>

                        {primaryNutritionItems.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {primaryNutritionItems.map((item) => (
                              <div
                                key={item.label}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                              >
                                <item.Icon className={item.iconClassName} />
                                <span>
                                  {formatNumber(item.value)}
                                  {item.suffix}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {recipeTags.length > 0 && (
                          <div className="mt-2">
                            <TagBadges tags={recipeTags} />
                          </div>
                        )}
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto p-0 sm:max-w-[28rem]">
                    <div className="p-4">
                      <RecipePreview recipe={recipe} tags={recipeTags} />
                    </div>
                  </DialogContent>
                </Dialog>
                {showActions && (
                  <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setOpenRecipeId(null);
                        onRecipeEdit(recipe);
                      }}
                      aria-label={`Edit ${recipe.name}`}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRecipeDelete(recipe)}
                      aria-label={`Delete ${recipe.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
