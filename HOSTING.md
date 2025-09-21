# 🚀 Complete Hosting Guide: GitHub Contribution Canon

## Overview
This project uses a **hybrid hosting approach**:
- **Backend (Flask)**: Hosted on Railway/Render (free tier)
- **Frontend (Static)**: Hosted on GitHub Pages alongside your portfolio

## 📋 Step-by-Step Setup

### 1. GitHub Pages Setup (Static Frontend)

#### Option A: Separate GitHub Pages site
```bash
# Enable GitHub Pages for this repository
# Go to: Settings > Pages > Deploy from branch > main > /docs folder
# Your site will be at: https://man0dya.github.io/contribution-canon/
```

#### Option B: Add to existing portfolio
```bash
# Copy docs/index.html to your portfolio repository
# Rename it to contribution-canon.html or create a subfolder
# Access via: https://man0dya.github.io/portfolio/contribution-canon/
```

### 2. Backend Deployment (Choose One)

#### Railway (Recommended - Easiest)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy (run from project root)
railway login
railway init contribution-canon
railway up

# Set environment variables in Railway dashboard:
# GITHUB_TOKEN=your_token_here
# SECRET_KEY=your_secret_key
# DEBUG=False
```

#### Render (Alternative)
```bash
# 1. Connect your GitHub repo to Render
# 2. Create new Web Service
# 3. Set environment variables in Render dashboard
# 4. Auto-deploys on git push
```

#### Vercel (Serverless)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### 3. Connect Frontend to Backend

After deploying backend, you'll get a URL like:
- Railway: `https://contribution-canon-production.up.railway.app`
- Render: `https://your-app.onrender.com`
- Vercel: `https://your-app.vercel.app`

Update `docs/index.html`:
```javascript
const SERVICE_URL = 'https://your-actual-deployed-url.com';
```

### 4. Test the Complete Setup

1. **Backend Test**: Visit your deployed URL directly
2. **Frontend Test**: Visit your GitHub Pages URL
3. **Integration Test**: Use the form on GitHub Pages to generate animations

## 🎯 Final URLs Structure

After setup:
- **GitHub Pages**: `https://man0dya.github.io/contribution-canon/`
- **API Backend**: `https://your-app.railway.app/`
- **Embed Example**: `![Canon](https://your-app.railway.app/USERNAME)`

## 🔧 Environment Variables Needed

Set these in your hosting platform:
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
SECRET_KEY=your-random-secret-key-here
DEBUG=False
PORT=5000  # Usually set automatically by hosting platform
```

## 💡 Quick Commands

### Deploy to Railway:
```bash
# Windows
./deploy-railway.ps1

# macOS/Linux  
./deploy-railway.sh
```

### Update GitHub Pages:
```bash
git add docs/
git commit -m "Update GitHub Pages"
git push origin main
```

### Test locally:
```bash
python app.py
# Visit: http://localhost:5001
```

## 🎉 Benefits of This Setup

✅ **Free Hosting**: Both GitHub Pages and Railway/Render have free tiers  
✅ **Fast Loading**: Static frontend loads instantly  
✅ **SEO Friendly**: GitHub Pages is crawlable  
✅ **Easy Updates**: Git push updates both frontend and backend  
✅ **Custom Domain**: Can add custom domain to both  
✅ **Portfolio Integration**: Works alongside existing GitHub Pages site

## 🆘 Troubleshooting

**Backend not responding?**
- Check environment variables are set
- Verify your GitHub token has correct permissions
- Check hosting platform logs

**Frontend not updating?**  
- GitHub Pages can take 5-10 minutes to update
- Clear browser cache
- Check GitHub Actions tab for build status

**CORS errors?**
- Add your GitHub Pages domain to CORS settings if needed
- Use the same protocol (https) for both frontend and backend

Ready to deploy? Choose your hosting platform and follow the steps above! 🚀