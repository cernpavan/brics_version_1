# Vercel Deployment Guide - BRICS Connect

## 🚀 Deployment Steps for Vercel

### Prerequisites
1. GitHub account (or GitLab/Bitbucket)
2. Vercel account (free tier works)
3. Supabase project already set up

---

## 📋 Step-by-Step Instructions

### STEP 1: Prepare Your Code

1. **Commit all changes to Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verify build works locally:**
   ```bash
   npm run build
   ```
   This should create a `dist` folder. Test it works!

---

### STEP 2: Push to GitHub

1. **Create a GitHub repository** (if you haven't already)
   - Go to https://github.com/new
   - Create a new repository
   - Don't initialize with README (if you already have code)

2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

### STEP 3: Deploy to Vercel

#### Option A: Via Vercel Website (Recommended)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up/Login with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
   
   **Where to find these:**
   - Go to Supabase Dashboard → Settings → API
   - Copy "Project URL" → `VITE_SUPABASE_URL`
   - Copy "anon public" key → `VITE_SUPABASE_PUBLISHABLE_KEY`

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your site will be live! 🎉

#### Option B: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when asked

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

### STEP 4: Update Supabase Settings

1. **Add Vercel URL to Supabase:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add your Vercel URL to "Redirect URLs"
   - Example: `https://your-app.vercel.app`

2. **Update Google OAuth (if using):**
   - Go to Google Cloud Console
   - Update authorized redirect URIs with Vercel URL

---

## 🔧 Environment Variables

### Required Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### How to Add in Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development
4. Redeploy after adding variables

---

## 📝 Post-Deployment Checklist

- [ ] Test homepage loads
- [ ] Test user signup/login
- [ ] Test Google OAuth (if using)
- [ ] Test admin login at `/admin`
- [ ] Test product posting
- [ ] Test image uploads
- [ ] Verify all routes work
- [ ] Check mobile responsiveness

---

## 🔄 Updating Your Deployment

After making changes:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Vercel auto-deploys:**
   - Vercel automatically detects pushes
   - Builds and deploys automatically
   - You'll get a notification when done

---

## 🌐 Custom Domain (Optional)

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## 🐛 Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `npm run build` works locally

### Environment Variables Not Working:
- Make sure variables start with `VITE_`
- Redeploy after adding variables
- Check variable names match exactly

### Routes Not Working:
- Verify `vercel.json` exists with rewrites
- Check React Router is configured correctly

### Supabase Connection Issues:
- Verify `VITE_SUPABASE_URL` is correct
- Check `VITE_SUPABASE_PUBLISHABLE_KEY` is correct
- Ensure Supabase project is active

---

## 📦 Alternative Hosting Options

### 1. Netlify
- Similar to Vercel
- Free tier available
- Good for static sites

### 2. Railway
- Good for full-stack apps
- Easy database integration

### 3. Render
- Free tier available
- Good documentation

### 4. Cloudflare Pages
- Fast CDN
- Free tier available

---

## ✅ Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] `npm run build` works locally
- [ ] Environment variables ready
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Supabase URLs updated
- [ ] Test all features

---

**Your app will be live at:** `https://your-project.vercel.app` 🚀

