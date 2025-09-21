# 🚀 Deployment Guide: GitHub Contribution Canon

## Overview
Since GitHub Pages only serves static files, we need to host the Flask backend elsewhere and create a static frontend for GitHub Pages.

## Recommended Deployment Strategy

### 1. Backend Hosting Options (Choose One)

#### A. Railway (Recommended - Free & Easy)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway deploy
```

#### B. Render (Free Tier)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

#### C. Vercel (Serverless Python)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 2. Frontend for GitHub Pages

Create a static version that:
- Shows demo animations
- Links to the live hosted backend
- Provides embed codes with the live URL
- Works alongside your existing portfolio

### 3. Environment Variables Needed

For any hosting platform, set these:
```
GITHUB_TOKEN=your_github_token_here
SECRET_KEY=your_secret_key_here
DEBUG=False
```

### 4. Domain Configuration

After hosting:
1. Get the live URL (e.g., `https://your-app.railway.app`)
2. Update embed examples in GitHub Pages
3. Configure CORS if needed

## Quick Setup Commands

### For Railway:
```bash
pip install railway
railway login
railway init contribution-canon
railway up
```

### For Render:
1. Push to GitHub
2. Connect at render.com
3. Set environment variables
4. Deploy

Would you like me to set up any of these options?