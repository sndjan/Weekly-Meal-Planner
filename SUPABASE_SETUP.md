# Supabase Setup Guide

This guide walks you through setting up your Supabase project for the Weekly Meal Planner application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Create a new organization (or use existing)
5. Create a new project with the following settings:
   - **Database Password**: Create a strong password and save it
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient for MVP

## Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Paste these into your `.env.local` file

## Step 3: Create Database Tables

### Option A: Using SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire SQL from `supabase/migrations/001_create_schema.sql`
4. Paste it into the SQL editor
5. Click **Run**
6. Wait for the execution to complete (you'll see a success message)

### Option B: Using Migrations

If you want to use Supabase CLI:

```bash
npm install -g supabase
supabase link --project-ref your-project-ref
supabase db push
```

## Step 4: Enable Email Authentication

1. Go to **Authentication** > **Providers**
2. Click on **Email**
3. Toggle it ON
4. (Optional) Configure email templates under **Email Templates**

### Email Configuration Options

By default, Supabase sends emails using its own SMTP server. For production, you may want to:

1. Go to **Authentication** > **Email Templates**
2. Customize confirmation and reset email templates
3. For custom SMTP, go to **Settings** > **SMTP Settings**

## Step 5: Configure Security Settings

### CORS Settings

1. Go to **Settings** > **API**
2. Under **CORS configuration**, ensure your domain is allowed:
   - Local: `http://localhost:3000`
   - Production: Your actual domain

### JWT Settings

Leave default JWT settings as is - they work well with Next.js.

## Step 6: Verify Setup

### Test Authentication

1. Start the app: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign Up"
4. Create a test account
5. You should see a confirmation email

### Test Database

1. In Supabase dashboard, go to **Table Editor**
2. You should see all the tables created:
   - `users`
   - `recipes`
   - `tags`
   - `recipe_tags`
   - `meal_plans`
   - `planned_meals`
   - `user_preferences`

## Step 7: Explore Row-Level Security (RLS)

Your database includes RLS policies. To view them:

1. In **Table Editor**, select any table
2. Click the **RLS** button
3. You'll see the policies that protect data access

## Backup Your Database

Supabase provides daily backups on the free tier. To backup manually:

1. Go to **Settings** > **Backups**
2. Click **Take a manual backup**

## Viewing Logs

Monitor your application:

1. **Auth logs**: Authentication > Logs
2. **SQL queries**: Logs > Database
3. **API calls**: Realtime logs (check via CLI)

## Common Issues

### "Invalid credentials" when signing up

- Email authentication might not be enabled
- Check that Email provider is toggled ON in Providers

### Tables not created

- Re-run the SQL migration
- Check SQL execution logs for errors
- Ensure you have sufficient permissions on the project

### Connection timeout

- Ensure your Supabase project is not paused
- Check your internet connection
- Verify correct credentials in `.env.local`

### Too many requests

- Free tier has rate limits
- Contact Supabase support to increase limits
- Or upgrade to a paid plan

## Upgrading to Production

When ready for production:

1. Consider upgrading from Free to Pro plan for:
   - Higher rate limits
   - Better support
   - Production SLA
   - 8GB storage instead of 500MB

2. Set up proper backup strategy

3. Configure custom domain in **Settings > General**

4. Enable two-factor authentication for your account

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Community Discord](https://discord.supabase.com)
