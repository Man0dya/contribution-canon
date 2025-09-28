# 🎯 Automated Contribution Animation Setup

This repository now includes GitHub Actions automation to generate your contribution animation automatically, just like the snake animation!

## 🚀 How it works

1. **GitHub Actions runs daily** and on every push to main branch
2. **Fetches your real contribution data** from GitHub API  
3. **Generates animated SVG** with popping contribution boxes
4. **Auto-commits the SVG** back to your repository
5. **Your README displays** the always up-to-date animation

## 📁 Generated Files

The automation creates multiple SVG files:
- `{username}-contribution-animation.svg` - Personal filename
- `contribution-animation.svg` - Generic filename  
- `github-contribution-animation.svg` - Snake-style naming

## 🧩 Use this in your own repository (copy-paste setup)

You can automate this animation in any repository. Here’s the simplest setup:

1) Create the workflow file in your repo

Create the path `.github/workflows/generate-contribution-animation.yml` and paste:

```yaml
name: Generate Contribution Animation

on:
   schedule:
      - cron: '0 0 * * *' # Daily at 00:00 UTC
   workflow_dispatch:
   push:
      branches: [ main ]

permissions:
   contents: write

concurrency:
   group: generate-contribution-animation
   cancel-in-progress: false

jobs:
   build:
      runs-on: ubuntu-latest
      steps:
         - name: Checkout repository
            uses: actions/checkout@v4

         - name: Setup Node.js
            uses: actions/setup-node@v4
            with:
               node-version: '20'

         - name: Generate animated SVGs
            run: node scripts/generate-svg.cjs
            env:
               GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

         - name: Commit and push updated SVGs
            uses: stefanzweifel/git-auto-commit-action@v5
            with:
               commit_message: "chore: update contribution animation [skip ci]"
               file_pattern: "*-contribution-animation.svg contribution-animation.svg github-contribution-animation.svg"
```

2) Add the script folder

Copy the `scripts/generate-svg.cjs` file from this repo into your repo at `scripts/generate-svg.cjs`.

3) Reference the SVG in your README

```markdown
![Contribution Animation](github-contribution-animation.svg)
```

4) Commit and push. Then check the Actions tab for the job run. The SVGs will be created/updated automatically.

Notes
- No extra PAT is needed; the built-in `${{ secrets.GITHUB_TOKEN }}` is sufficient for committing the generated files.
- The script infers the username from the repo owner automatically.
- The animation updates daily via schedule and on each push to main.
- You can change the filename in README to `${yourname}-contribution-animation.svg` if you prefer the personalized output.

## 🔧 Setup Instructions

### Option 1: Use in your own repository

1. **Copy the workflow file**:
   ```bash
   mkdir -p .github/workflows
   cp .github/workflows/generate-contribution-animation.yml .github/workflows/
   cp -r scripts/ ./
   ```

2. **Add to your README.md**:
   ```markdown
   ![Contribution Animation](github-contribution-animation.svg)
   ```

3. **Push to trigger first generation**:
   ```bash
   git add .
   git commit -m "Add automated contribution animation"
   git push
   ```

4. **Wait for GitHub Actions** to run (check Actions tab)

### Option 2: Use this repository's animation

Simply reference the animation from this repo in your README:

```markdown
![Contribution Animation](https://raw.githubusercontent.com/Man0dya/contribution-canon/main/Man0dya-contribution-animation.svg)
```

## ⚙️ Customization

Edit `scripts/generate-svg.js` to customize:
- 🎨 **Colors**: Modify the `getContributionColor()` function
- ⏱️ **Animation speed**: Adjust `animationDuration` calculation  
- 📏 **Size**: Change `svgWidth` and `svgHeight`
- 🎭 **Animation style**: Modify CSS keyframes

## 🔄 Schedule

- **Daily at 00:00 UTC**: Automatic update
- **On every push**: Immediate update
- **Manual trigger**: From Actions tab

## 📊 Features

✅ **Real GitHub data** - Uses actual contribution counts  
✅ **Animated popping** - Contribution boxes explode in sequence  
✅ **Auto-updating** - Always shows latest contributions  
✅ **Zero maintenance** - Runs completely automatically  
✅ **Multiple formats** - Various filename options  
✅ **Fast loading** - Optimized SVG animations

---

🎯 Powered by: Contribution Animation (bubble‑shooter)