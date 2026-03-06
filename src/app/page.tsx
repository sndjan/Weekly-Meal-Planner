import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/meal-planner');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Weekly Meal Planner
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Plan your meals for the week and automatically generate shopping lists
        </p>
        <div className="space-y-4">
          <Link href="/auth/signup">
            <Button className="w-full">Get Started</Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
