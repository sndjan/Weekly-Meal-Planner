import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MealPlannerMain } from '@/components/meal-planner/meal-planner-main';

export default async function MealPlannerPage() {
  const supabase = await createServerSupabaseClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <MealPlannerMain />;
}
