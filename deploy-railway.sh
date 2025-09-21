#!/bin/bash

# Railway Deployment Script for GitHub Contribution Canon

echo "🚀 Setting up Railway deployment for GitHub Contribution Canon..."

# Step 1: Install Railway CLI (if not already installed)
echo "📦 Installing Railway CLI..."
npm install -g @railway/cli

# Step 2: Login to Railway
echo "🔐 Please login to Railway (browser will open)..."
railway login

# Step 3: Initialize Railway project
echo "🎯 Initializing Railway project..."
railway init contribution-canon

# Step 4: Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please set the following environment variables in Railway dashboard:"
echo "  - GITHUB_TOKEN: Your GitHub personal access token"
echo "  - SECRET_KEY: A random secret key for Flask sessions"
echo "  - DEBUG: False"

# Step 5: Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at the URL provided by Railway"
echo "📝 Don't forget to update the SERVICE_URL in docs/index.html with your live URL"