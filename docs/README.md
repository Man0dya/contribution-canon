# Docs folder for GitHub Pages

This folder contains the static website that will be hosted on GitHub Pages.

## Files:
- `index.html` - Main landing page for the GitHub Contribution Canon
- This page provides information about the project and will link to the live hosted service

## GitHub Pages Setup:
1. Go to your repository Settings > Pages
2. Set source to "Deploy from a branch"
3. Select "main" branch and "/docs" folder
4. Your static site will be available at: https://man0dya.github.io/contribution-canon/

## After Backend Deployment:
1. Deploy the Flask app to Railway/Render/Vercel
2. Update the SERVICE_URL in index.html with your live backend URL
3. The static site will then be able to generate live animations