# 🚀 Quick Vercel Deployment Steps

## ⚡ Fast Track (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **Add Environment Variables:**
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your Supabase anon key
5. Click "Deploy"

### 3. Update Supabase
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your Vercel URL: `https://your-app.vercel.app`

**Done!** Your app is live! 🎉

---

## 📋 Detailed Steps

See `VERCEL_DEPLOYMENT_GUIDE.md` for complete instructions.

---

## 🔑 Environment Variables

**Required:**
- `VITE_SUPABASE_URL` - From Supabase Dashboard → Settings → API
- `VITE_SUPABASE_PUBLISHABLE_KEY` - From Supabase Dashboard → Settings → API

**Get them from:** Supabase Dashboard → Settings → API

---

## ✅ Post-Deployment

1. Test your live site
2. Update Supabase redirect URLs
3. Test Google OAuth (if using)
4. Test admin login
5. Test all features

---

**Your app URL:** `https://your-project.vercel.app`





