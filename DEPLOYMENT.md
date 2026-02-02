# Tathastu Website - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Push Your Code to GitHub

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Click "Sign Up" or "Login"
   - Choose "Continue with GitHub"

2. **Import Your Repository:**
   - Click "Add New..." → "Project"
   - Find and select your `Tathastu` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_key
   ```
   
   ⚠️ **Important:** Get these from your Supabase dashboard:
   - Go to: https://app.supabase.com
   - Select your project
   - Go to Settings → API
   - Copy "Project URL" and "anon/public key"

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://tathastu-xxxx.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? tathastu (or your preferred name)
# - In which directory is your code located? ./
# - Want to override the settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### Step 3: Your Website is Live! 🎉

You'll get a URL like:
- `https://tathastu.vercel.app`
- `https://tathastu-akshat8171.vercel.app`

## 🔄 Automatic Deployments

Once set up, Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
# Then:
git add .
git commit -m "Update website"
git push origin main

# Vercel automatically builds and deploys! ✨
```

## 🌐 Adding a Custom Domain (Optional)

If you buy a domain later:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `tathastu.com`)
4. Follow DNS configuration instructions
5. Wait 24-48 hours for DNS propagation

## 📊 Monitoring Your Site

**Vercel Dashboard provides:**
- Real-time analytics
- Deployment logs
- Performance metrics
- Error tracking

Access at: https://vercel.com/dashboard

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Images Not Loading
- Check Supabase storage permissions
- Verify image URLs in `next.config.js`
- Ensure environment variables are correct

### 404 Errors
- Clear Vercel cache and redeploy
- Check file paths are correct
- Verify all routes exist

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check deployment logs for specific errors

## 📝 Important Notes

- ✅ Free tier includes: Unlimited deployments, 100GB bandwidth/month
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Automatic preview deployments for PRs
- ⚠️ Keep your `.env.local` file private (never commit it)
- ⚠️ Add environment variables in Vercel dashboard

---

**Your website will be live in minutes!** 🚀
