# GitHub Setup Instructions for Portfolio

## Step 1: Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `portfolio` (or `web-portfolio`)
3. Description: "My personal portfolio website with admin panel"
4. Make it **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

## Step 2: Initialize Git in Your Portfolio Folder

Open PowerShell/Terminal in your portfolio folder and run:

```powershell
# Navigate to your portfolio folder
cd "C:\Users\Brian\Documents\personal projectsss\Web portfolio"

# Remove existing git connection (if any)
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Initialize new git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Portfolio website with admin panel"

# Rename branch to main
git branch -M main

# Add your new GitHub repository (replace YOUR-REPO-NAME with actual name)
git remote add origin https://github.com/Brian-K05/portfolio.git

# Push to GitHub
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/Brian-K05/portfolio
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section (left sidebar)
4. Under **"Source"**, select **"Deploy from a branch"**
5. Select **"main"** branch
6. Select **"/ (root)"** folder
7. Click **"Save"**
8. Wait 1-2 minutes, then your site will be live at:
   - **Portfolio**: https://brian-k05.github.io/portfolio/
   - **Admin Panel**: https://brian-k05.github.io/portfolio/admin.html
   - **Resume**: https://brian-k05.github.io/portfolio/resume.html

## Step 4: Update Resume Link

After deployment, update `resume.html`:
- Find the portfolio link (currently `#`)
- Replace with: `https://brian-k05.github.io/portfolio/`

## Troubleshooting

If you get authentication errors:
- Use GitHub Desktop app, OR
- Use Personal Access Token instead of password
- Get token from: GitHub Settings → Developer settings → Personal access tokens

