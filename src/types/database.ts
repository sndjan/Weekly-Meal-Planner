// Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          ingredients: string;
          preparation_steps: string | null;
          source_url: string | null;
          prep_time: string | null;
          calories: number | null;
          protein: number | null;
          carbs: number | null;
          fats: number | null;
          serving_size: number;
          image_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          ingredients: string;
          preparation_steps?: string | null;
          source_url?: string | null;
          prep_time?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fats?: number | null;
          serving_size?: number;
          image_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          ingredients?: string;
          preparation_steps?: string | null;
          source_url?: string | null;
          prep_time?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fats?: number | null;
          serving_size?: number;
          image_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_tags: {
        Row: {
          id: string;
          recipe_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      meal_plans: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      planned_meals: {
        Row: {
          id: string;
          meal_plan_id: string;
          recipe_id: string;
          day_of_week: number;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          serving_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_plan_id: string;
          recipe_id: string;
          day_of_week: number;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          serving_size?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_plan_id?: string;
          recipe_id?: string;
          day_of_week?: number;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack";
          serving_size?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          protein_target: number;
          calories_target: number;
          carbs_target: number;
          fats_target: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          protein_target?: number;
          calories_target?: number;
          carbs_target?: number;
          fats_target?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          protein_target?: number;
          calories_target?: number;
          carbs_target?: number;
          fats_target?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Application Types
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type MealPlan = Database['public']['Tables']['meal_plans']['Row'];
export type PlannedMeal = Database['public']['Tables']['planned_meals']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type NutritionValues = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type ShoppingListItem = {
  ingredient: string;
  quantity: number;
  unit: string;
};
