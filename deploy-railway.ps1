# Railway Deployment Script for Windows PowerShell

Write-Host "🚀 Setting up Railway deployment for GitHub Contribution Canon..." -ForegroundColor Green

# Step 1: Install Railway CLI (if not already installed)
Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
npm install -g @railway/cli

# Step 2: Login to Railway
Write-Host "🔐 Please login to Railway (browser will open)..." -ForegroundColor Yellow
railway login

# Step 3: Initialize Railway project
Write-Host "🎯 Initializing Railway project..." -ForegroundColor Yellow
railway init contribution-canon

# Step 4: Set environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
Write-Host "Please set the following environment variables in Railway dashboard:" -ForegroundColor Cyan
Write-Host "  - GITHUB_TOKEN: Your GitHub personal access token" -ForegroundColor White
Write-Host "  - SECRET_KEY: A random secret key for Flask sessions" -ForegroundColor White
Write-Host "  - DEBUG: False" -ForegroundColor White

# Step 5: Deploy
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
railway up

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app will be available at the URL provided by Railway" -ForegroundColor Cyan
Write-Host "📝 Don't forget to update the SERVICE_URL in docs/index.html with your live URL" -ForegroundColor Yellow