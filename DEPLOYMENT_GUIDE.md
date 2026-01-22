# Portfolio Deployment Guide

## Quick Deployment Options

### Option 1: GitHub Pages (Recommended - Free & Easy)

1. **Create a GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `portfolio` (or any name you like)
   - Make it Public
   - Click "Create repository"

2. **Upload Your Files:**
   - Open your project folder in terminal/command prompt
   - Run these commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Portfolio website"
   git branch -M main
   git remote add origin https://github.com/Brian-K05/portfolio.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://brian-k05.github.io/portfolio/`

4. **Update Resume Link:**
   - After deployment, update the portfolio link in `resume.html`
   - Replace `#` in the portfolio link with your GitHub Pages URL

---

### Option 2: Netlify (Free & Very Easy)

1. **Go to https://www.netlify.com**
   - Sign up with your GitHub account (free)

2. **Deploy:**
   - Drag and drop your entire project folder onto Netlify
   - OR connect your GitHub repository
   - Your site will be live instantly with a URL like: `https://your-site-name.netlify.app`

3. **Custom Domain (Optional):**
   - You can add a custom domain in Netlify settings

---

### Option 3: Vercel (Free & Fast)

1. **Go to https://vercel.com**
   - Sign up with your GitHub account

2. **Deploy:**
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Your site will be live at: `https://your-project.vercel.app`

---

## Important Notes:

1. **Admin Panel Access:**
   - After deployment, your admin panel will be at: `your-site.com/admin.html`
   - Example: `https://brian-k05.github.io/portfolio/admin.html`

2. **LocalStorage:**
   - The admin panel uses localStorage, which works in deployed sites
   - Data is stored in the user's browser

3. **Update Resume:**
   - After deployment, update the portfolio link in `resume.html`
   - The link is currently set to `#` - replace it with your actual URL

4. **Images:**
   - Make sure all image files are included in your deployment
   - Check that image paths in your HTML are correct

---

## Recommended: GitHub Pages

Since you already have a GitHub account, GitHub Pages is the easiest option:
- Free forever
- Easy to update (just push changes)
- Custom domain support
- HTTPS by default

Your portfolio will be accessible at:
`https://brian-k05.github.io/portfolio/`

Your admin panel will be at:
`https://brian-k05.github.io/portfolio/admin.html`

