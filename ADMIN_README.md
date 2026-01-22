# Portfolio Admin Panel - User Guide

## Overview

The admin panel allows you to manage your portfolio projects without editing code. It automatically fetches your GitHub repositories, detects tech stacks, and lets you choose which projects to showcase.

## Getting Started

### 1. Access the Admin Panel

Open `admin.html` in your browser.

### 2. Configure GitHub Access

1. **GitHub Username**: Enter your GitHub username (default: `Brian-K05`)
2. **GitHub Token (Optional)**: 
   - For better rate limits and access to private repos, create a Personal Access Token:
   - Go to: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `public_repo` (and `repo` if you have private repos)
   - Copy the token and paste it in the admin panel

### 3. Fetch Your Repositories

1. Click **"Fetch My Repositories"**
2. The system will:
   - Fetch all your GitHub repositories
   - Auto-detect tech stacks from repository files
   - Display them in the projects list

## Managing Projects

### Toggle Showcase

- Use the toggle switch on each project card to show/hide it in your portfolio
- Only projects with the toggle ON will appear on your main portfolio

### Edit Project Details

1. Click **"Edit"** on any project card
2. In the modal, you can:
   - **Project Name**: Change the display name
   - **Description**: Add/edit project description
   - **Category**: Set project category (e.g., "Web Application", "Mobile App")
   - **Live Demo URL**: Add link to live demo
   - **Project Image**: 
     - Enter image URL, OR
     - Upload image file (stored as data URL)
   - **Tech Stack**: Auto-detected (read-only)

3. Click **"Save Project"** to save changes

### Save All Changes

Click **"💾 Save Changes"** to save all project configurations to localStorage.

## How It Works

### Tech Stack Detection

The system automatically detects tech stacks by checking:
- `package.json` → JavaScript/Node.js frameworks (React, Vue, Angular, etc.)
- `requirements.txt` → Python packages
- `composer.json` → PHP/Laravel
- `pom.xml` → Java
- `build.gradle` → Kotlin/Android
- `pubspec.yaml` → Flutter/Dart
- `Gemfile` → Ruby
- `Cargo.toml` → Rust
- `go.mod` → Go
- Repository language from GitHub API

### Data Storage

- All project data is stored in **localStorage** (browser storage)
- Data persists across browser sessions
- To share across devices, export/import the localStorage data

### Portfolio Integration

- The main portfolio (`index.html`) automatically loads showcased projects from localStorage
- Projects are sorted by their `order` property
- If no showcased projects exist, the portfolio shows the default static projects

## Features

✅ **Automatic GitHub Integration** - Fetches all your repositories  
✅ **Tech Stack Auto-Detection** - Identifies technologies from repo files  
✅ **Visual Project Management** - Easy toggle and edit interface  
✅ **Image Upload Support** - Add project screenshots  
✅ **Live Demo Links** - Add deployment URLs  
✅ **Category Management** - Organize projects by type  
✅ **Order Control** - Control project display order  

## Tips

1. **Refresh Repositories**: Click "🔄 Refresh Repositories" to fetch latest repos
2. **Image Best Practices**: 
   - Use high-quality screenshots
   - Recommended size: 1200x675px (16:9 aspect ratio)
   - Supported formats: PNG, JPG, WebP
3. **Descriptions**: Write compelling descriptions that highlight key features
4. **Categories**: Use consistent categories (e.g., "Web Application", "Mobile App", "API/Backend")

## Troubleshooting

### Repositories Not Loading
- Check your GitHub username
- Verify internet connection
- If rate limited, add a GitHub token

### Tech Stack Not Detected
- Ensure repository has standard config files (package.json, etc.)
- Some repos may need manual tech stack entry

### Projects Not Showing on Portfolio
- Make sure you toggled "Showcase" ON for projects
- Click "Save Changes" after making edits
- Refresh the portfolio page

## Security Note

⚠️ **Important**: The admin panel stores data in localStorage, which is client-side only. For production use with multiple users or sensitive data, consider:
- Adding authentication
- Using a backend API
- Storing data in a database

## Next Steps

1. Fetch your repositories
2. Toggle showcase for projects you want to display
3. Edit project details (descriptions, images, links)
4. Save changes
5. View your updated portfolio!

---

**Need Help?** Check the browser console (F12) for error messages.

