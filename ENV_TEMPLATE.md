# Environment Variables Template

Copy this file to `.env.local` for local development, or add these to Vercel environment variables.

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

## How to Get These Values:

1. Go to your Supabase Dashboard
2. Navigate to: **Settings** → **API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

## For Vercel:

1. Go to your Vercel project
2. Navigate to: **Settings** → **Environment Variables**
3. Add both variables
4. Select all environments (Production, Preview, Development)
5. Redeploy your project

## Important Notes:

- Variables MUST start with `VITE_` to be accessible in the browser
- Never commit `.env.local` to Git (it's in .gitignore)
- Always use the `anon` key, never the `service_role` key in frontend

