// Admin Panel JavaScript
class PortfolioAdmin {
    constructor() {
        this.githubUsername = 'Brian-K05';
        this.githubToken = '';
        this.repositories = [];
        this.projectsData = this.loadProjectsData();
        this.currentEditId = null;
        
        // Suppress 404 console errors for tech stack detection
        this.suppress404Errors();
        
        this.init();
    }

    // Helper to suppress 404 errors in console (they're expected when checking for files)
    suppress404Errors() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                // Don't log 404s for tech stack file checks
                if (response.status === 404 && args[0] && typeof args[0] === 'string' && args[0].includes('/contents/')) {
                    // Silently handle 404s for file checks
                    return response;
                }
                return response;
            } catch (error) {
                throw error;
            }
        };
    }

    init() {
        // Load saved GitHub config
        const savedUsername = localStorage.getItem('githubUsername');
        const savedToken = localStorage.getItem('githubToken');
        
        if (savedUsername) {
            document.getElementById('githubUsername').value = savedUsername;
            this.githubUsername = savedUsername;
        }
        
        if (savedToken) {
            document.getElementById('githubToken').value = savedToken;
            this.githubToken = savedToken;
        }

        // Event listeners
        document.getElementById('fetchRepos').addEventListener('click', () => this.fetchRepositories());
        document.getElementById('refreshRepos').addEventListener('click', () => this.fetchRepositories());
        document.getElementById('saveProjects').addEventListener('click', () => this.saveAllProjects());
        document.getElementById('closeModal').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('editProjectForm').addEventListener('submit', (e) => this.saveProjectEdit(e));
        
        // Settings modal
        document.getElementById('openSettings').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // Image preview
        document.getElementById('editImageFile').addEventListener('change', (e) => this.handleImagePreview(e));
        document.getElementById('editImageUrl').addEventListener('input', (e) => this.handleImageUrlPreview(e));
        
        // Auto-save GitHub config on change
        document.getElementById('githubUsername').addEventListener('change', (e) => {
            this.githubUsername = e.target.value;
            localStorage.setItem('githubUsername', e.target.value);
        });
        
        document.getElementById('githubToken').addEventListener('change', (e) => {
            this.githubToken = e.target.value;
            localStorage.setItem('githubToken', e.target.value);
        });
        
        // Check if repos were already fetched (hide config section)
        this.checkIfReposLoaded();

        // Load existing projects if available
        if (this.projectsData.projects.length > 0) {
            // Show existing showcased projects even before fetching repos
            this.showExistingShowcasedProjects();
        }

        // Check if repos were already fetched (hide config section)
        this.checkIfReposLoaded();
    }

    async fetchRepositories() {
        const username = document.getElementById('githubUsername').value || this.githubUsername;
        if (!username) {
            this.showMessage('Please enter a GitHub username', 'error');
            return;
        }

        this.githubUsername = username;
        localStorage.setItem('githubUsername', username);

        const loadingState = document.getElementById('loadingState');
        loadingState.innerHTML = '<p>🔄 Fetching repositories from GitHub...</p>';

        try {
            const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;
            const headers = {};
            
            if (this.githubToken) {
                headers['Authorization'] = `token ${this.githubToken}`;
            }

            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('User not found. Please check the username.');
                } else if (response.status === 403) {
                    throw new Error('Rate limit exceeded. Please add a GitHub token for higher limits.');
                }
                throw new Error(`Failed to fetch repositories: ${response.statusText}`);
            }

            const repos = await response.json();
            this.repositories = repos;

            // Auto-save token if provided
            const tokenInput = document.getElementById('githubToken');
            if (tokenInput && tokenInput.value) {
                this.githubToken = tokenInput.value;
                localStorage.setItem('githubToken', tokenInput.value);
            }

            // Hide config section after successful fetch
            const configSection = document.getElementById('configSection');
            if (configSection) {
                configSection.style.display = 'none';
            }
            localStorage.setItem('reposFetched', 'true');

            // Display projects immediately (with basic info)
            this.displayProjects();
            this.showMessage(`Loading ${repos.length} repositories... Detecting tech stacks...`, 'success');

            // Fetch tech stack for each repository (in background, non-blocking)
            this.fetchTechStacks(repos).then(() => {
                // Update display after tech stacks are detected
                this.displayProjects();
                this.showMessage(`Successfully loaded ${repos.length} repositories with tech stacks!`, 'success');
            }).catch(error => {
                console.error('Error fetching tech stacks:', error);
                // Still show projects even if tech stack detection fails
                this.displayProjects();
                this.showMessage(`Loaded ${repos.length} repositories (tech stack detection had some issues)`, 'success');
            });
        } catch (error) {
            console.error('Error fetching repositories:', error);
            loadingState.innerHTML = `<p style="color: var(--error-red);">❌ Error: ${error.message}</p>`;
            this.showMessage(error.message, 'error');
        }
    }

    async fetchTechStacks(repos) {
        // Process repos in batches to avoid overwhelming the API
        const batchSize = 5;
        for (let i = 0; i < repos.length; i += batchSize) {
            const batch = repos.slice(i, i + batchSize);
            await Promise.all(
                batch.map(async (repo) => {
                    if (repo.fork) {
                        repo.detectedTechStack = [];
                        return;
                    }
                    
                    try {
                        const techStack = await this.detectTechStack(repo);
                        repo.detectedTechStack = techStack;
                    } catch (error) {
                        // Silently handle errors - use language as fallback
                        repo.detectedTechStack = repo.language ? [repo.language] : [];
                    }
                })
            );
            
            // Small delay between batches to respect rate limits
            if (i + batchSize < repos.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    async detectTechStack(repo) {
        const techStack = [];
        const filesToCheck = [
            'package.json',
            'requirements.txt',
            'composer.json',
            'pom.xml',
            'build.gradle',
            'pubspec.yaml',
            'Gemfile',
            'Cargo.toml',
            'go.mod',
            'package-lock.json',
            'yarn.lock',
            '.csproj'
        ];

        // Check for common tech stack indicators
        const techIndicators = {
            'package.json': ['JavaScript', 'Node.js'],
            'requirements.txt': ['Python'],
            'composer.json': ['PHP'],
            'pom.xml': ['Java'],
            'build.gradle': ['Kotlin', 'Android'],
            'pubspec.yaml': ['Flutter', 'Dart'],
            'Gemfile': ['Ruby'],
            'Cargo.toml': ['Rust'],
            'go.mod': ['Go'],
            '.csproj': ['.NET', 'C#']
        };

        // Check repository language
        if (repo.language) {
            techStack.push(repo.language);
        }

        // Check for framework indicators in package.json
        try {
            const packageUrl = `https://api.github.com/repos/${repo.full_name}/contents/package.json`;
            const headers = {};
            if (this.githubToken) {
                headers['Authorization'] = `token ${this.githubToken}`;
            }

            const response = await fetch(packageUrl, { headers });
            if (response.ok) {
                const file = await response.json();
                const content = atob(file.content);
                const packageJson = JSON.parse(content);
                
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
                
                // Detect frameworks
                if (dependencies.react || dependencies['react-dom']) techStack.push('React');
                if (dependencies.vue) techStack.push('Vue.js');
                if (dependencies.angular) techStack.push('Angular');
                if (dependencies.next) techStack.push('Next.js');
                if (dependencies['@nestjs/core']) techStack.push('NestJS');
                if (dependencies.express) techStack.push('Express');
                if (dependencies.laravel || dependencies['laravel/framework']) techStack.push('Laravel');
                if (dependencies.django) techStack.push('Django');
                if (dependencies.flask) techStack.push('Flask');
                if (dependencies['@angular/core']) techStack.push('Angular');
            }
        } catch (error) {
            // package.json not found or error reading it - silently continue
        }

        // Check for other tech stack files
        for (const file of filesToCheck) {
            try {
                const fileUrl = `https://api.github.com/repos/${repo.full_name}/contents/${file}`;
                const headers = {};
                if (this.githubToken) {
                    headers['Authorization'] = `token ${this.githubToken}`;
                }

                const response = await fetch(fileUrl, { headers });
                // Only process if response is OK (200), silently ignore 404s
                if (response.status === 200) {
                    const detected = techIndicators[file];
                    if (detected) {
                        techStack.push(...detected);
                    }
                }
                // Silently ignore 404s - files don't always exist, which is normal
            } catch (error) {
                // Network error - silently continue (404s are expected)
            }
        }

        // Remove duplicates and return
        return [...new Set(techStack)];
    }

    showExistingShowcasedProjects() {
        const projectsList = document.getElementById('projectsList');
        const showcasedProjects = this.projectsData.projects.filter(p => p.showcase);
        
        if (showcasedProjects.length > 0) {
            const showcasedCount = document.getElementById('showcasedCount');
            showcasedCount.textContent = `Showcased: ${showcasedProjects.length}`;
            
            projectsList.innerHTML = `
                <div class="loading-state" style="grid-column: 1 / -1; text-align: left; padding: 1rem;">
                    <p style="margin-bottom: 1rem;"><strong>Currently Showcased Projects (${showcasedProjects.length}):</strong></p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${showcasedProjects.map(p => `<span style="background: var(--success-green); color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${this.escapeHtml(p.name)}</span>`).join('')}
                    </div>
                    <p style="margin-top: 1rem; color: var(--text-gray); font-size: 0.9rem;">Click "Fetch My Repositories" to see all projects and manage showcase status.</p>
                </div>
            `;
        }
    }

    displayProjects() {
        const projectsList = document.getElementById('projectsList');
        const totalRepos = document.getElementById('totalRepos');
        const showcasedCount = document.getElementById('showcasedCount');

        if (this.repositories.length === 0) {
            // If no repos but we have showcased projects, show them
            if (this.projectsData.projects.length > 0) {
                this.showExistingShowcasedProjects();
                return;
            }
            projectsList.innerHTML = '<div class="loading-state"><p>No repositories found. Click "Fetch My Repositories" to load projects.</p></div>';
            return;
        }

        // Merge with existing project data
        const mergedProjects = this.repositories.map(repo => {
            const existing = this.projectsData.projects.find(p => p.id === repo.name);
            return {
                id: repo.name,
                name: existing?.name || repo.name,
                githubUrl: repo.html_url,
                deployUrl: existing?.deployUrl || '',
                description: existing?.description || repo.description || 'No description available.',
                category: existing?.category || this.detectCategory(repo),
                techStack: existing?.techStack || repo.detectedTechStack || [repo.language].filter(Boolean),
                image: existing?.image || '',
                showcase: existing?.showcase || false,
                order: existing?.order || 999,
                updated: repo.updated_at
            };
        });

        // Sort by showcase status and order
        mergedProjects.sort((a, b) => {
            if (a.showcase !== b.showcase) return b.showcase - a.showcase;
            return a.order - b.order;
        });

        totalRepos.textContent = `Total: ${mergedProjects.length}`;
        showcasedCount.textContent = `Showcased: ${mergedProjects.filter(p => p.showcase).length}`;

        projectsList.innerHTML = mergedProjects.map(project => this.createProjectCard(project)).join('');

        // Add event listeners to new cards
        mergedProjects.forEach(project => {
            const card = document.querySelector(`[data-project-id="${project.id}"]`);
            if (card) {
                const toggle = card.querySelector('.toggle-switch');
                const editBtn = card.querySelector('.btn-edit');
                
                toggle.addEventListener('click', () => this.toggleShowcase(project.id));
                editBtn.addEventListener('click', () => this.openEditModal(project));
            }
        });
    }

    detectCategory(repo) {
        const name = repo.name.toLowerCase();
        const description = (repo.description || '').toLowerCase();
        const topics = (repo.topics || []).map(t => t.toLowerCase());

        if (name.includes('mobile') || name.includes('app') || topics.includes('mobile') || topics.includes('android') || topics.includes('ios')) {
            return 'Mobile App';
        }
        if (name.includes('web') || topics.includes('web') || topics.includes('website')) {
            return 'Web Application';
        }
        if (name.includes('api') || topics.includes('api') || topics.includes('backend')) {
            return 'API/Backend';
        }
        if (topics.includes('data') || topics.includes('visualization')) {
            return 'Data Visualization';
        }
        if (topics.includes('calculator') || topics.includes('tool')) {
            return 'Tool/Utility';
        }
        
        return 'Web Application';
    }

    createProjectCard(project) {
        const techStackHtml = project.techStack.length > 0
            ? project.techStack.slice(0, 5).map(tech => `<span class="tech-tag">${tech}</span>`).join('')
            : '<span class="tech-tag">No tech detected</span>';

        return `
            <div class="project-card-admin ${project.showcase ? 'showcased' : ''}" data-project-id="${project.id}">
                <div class="project-header">
                    <h3 class="project-title">${this.escapeHtml(project.name)}</h3>
                    <div class="showcase-toggle">
                        <span style="font-size: 0.8rem; color: var(--text-gray);">Showcase</span>
                        <div class="toggle-switch ${project.showcase ? 'active' : ''}" data-project-id="${project.id}"></div>
                    </div>
                </div>
                <div class="project-info">
                    <p class="project-description-preview">${this.escapeHtml(project.description)}</p>
                    <div class="project-tech">
                        ${techStackHtml}
                    </div>
                    <div class="project-links-admin">
                        <a href="${project.githubUrl}" target="_blank" class="project-link">🔗 GitHub</a>
                        ${project.deployUrl ? `<a href="${project.deployUrl}" target="_blank" class="project-link">🌐 Live Demo</a>` : ''}
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn-edit" data-project-id="${project.id}">✏️ Edit</button>
                </div>
            </div>
        `;
    }

    toggleShowcase(projectId) {
        let project = this.projectsData.projects.find(p => p.id === projectId);
        
        if (!project) {
            // Create new project entry
            const repo = this.repositories.find(r => r.name === projectId);
            if (!repo) return;

            project = {
                id: repo.name,
                name: repo.name,
                githubUrl: repo.html_url,
                deployUrl: '',
                description: repo.description || 'No description available.',
                category: this.detectCategory(repo),
                techStack: repo.detectedTechStack || [repo.language].filter(Boolean),
                image: '',
                showcase: false,
                order: 999
            };
            this.projectsData.projects.push(project);
        }

        project.showcase = !project.showcase;
        
        // Update order for showcased projects
        if (project.showcase) {
            const showcasedProjects = this.projectsData.projects.filter(p => p.showcase && p.id !== projectId);
            project.order = showcasedProjects.length;
        }

        this.saveProjectsData();
        this.displayProjects();
        
        // Notify portfolio page if it's open
        window.dispatchEvent(new CustomEvent('portfolioUpdated'));
        localStorage.setItem('portfolioProjects', JSON.stringify(this.projectsData));
    }

    openEditModal(project) {
        this.currentEditId = project.id;
        const modal = document.getElementById('editModal');
        
        document.getElementById('editName').value = project.name;
        document.getElementById('editDescription').value = project.description;
        document.getElementById('editCategory').value = project.category;
        document.getElementById('editDeployUrl').value = project.deployUrl || '';
        document.getElementById('editImageUrl').value = project.image || '';
        
        // Display tech stack
        const techStackDisplay = document.getElementById('editTechStack');
        techStackDisplay.innerHTML = project.techStack.length > 0
            ? project.techStack.map(tech => `<span class="tech-stack-item">${this.escapeHtml(tech)}</span>`).join('')
            : '<span style="color: var(--text-gray);">No tech stack detected</span>';

        modal.classList.add('active');
    }

    closeEditModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('active');
        this.currentEditId = null;
        document.getElementById('editProjectForm').reset();
    }

    async saveProjectEdit(e) {
        e.preventDefault();
        
        if (!this.currentEditId) return;

        let project = this.projectsData.projects.find(p => p.id === this.currentEditId);
        
        if (!project) {
            // Create new project
            const repo = this.repositories.find(r => r.name === this.currentEditId);
            if (!repo) return;

            project = {
                id: repo.name,
                name: repo.name,
                githubUrl: repo.html_url,
                deployUrl: '',
                description: repo.description || '',
                category: this.detectCategory(repo),
                techStack: repo.detectedTechStack || [repo.language].filter(Boolean),
                image: '',
                showcase: false,
                order: 999
            };
            this.projectsData.projects.push(project);
        }

        // Update project data
        project.name = document.getElementById('editName').value;
        project.description = document.getElementById('editDescription').value;
        project.category = document.getElementById('editCategory').value;
        project.deployUrl = document.getElementById('editDeployUrl').value;

        // Handle image upload
        const imageFile = document.getElementById('editImageFile').files[0];
        if (imageFile) {
            // Store as data URL (base64 encoded)
            const reader = new FileReader();
            reader.onload = (e) => {
                project.image = e.target.result;
                this.saveProjectsData();
                this.displayProjects();
                this.closeEditModal();
                this.showMessage('Project saved successfully! Portfolio will update automatically.', 'success');
                
                // Notify portfolio page if it's open
                window.dispatchEvent(new CustomEvent('portfolioUpdated'));
                localStorage.setItem('portfolioProjects', JSON.stringify(this.projectsData));
            };
            reader.readAsDataURL(imageFile);
        } else {
            const imageUrl = document.getElementById('editImageUrl').value;
            if (imageUrl) {
                project.image = imageUrl;
            } else if (!project.image) {
                // Clear image if both fields are empty
                project.image = '';
            }
            
            this.saveProjectsData();
            this.displayProjects();
            this.closeEditModal();
            this.showMessage('Project saved successfully! Portfolio will update automatically.', 'success');
            
            // Notify portfolio page if it's open
            window.dispatchEvent(new CustomEvent('portfolioUpdated'));
            localStorage.setItem('portfolioProjects', JSON.stringify(this.projectsData));
        }
    }

    saveAllProjects() {
        this.saveProjectsData();
        this.showMessage('All projects saved successfully! Portfolio will update automatically.', 'success');
        
        // Notify portfolio page if it's open (using custom event for same-tab updates)
        window.dispatchEvent(new CustomEvent('portfolioUpdated'));
        
        // Also trigger storage event for cross-tab updates
        localStorage.setItem('portfolioProjects', JSON.stringify(this.projectsData));
    }

    saveProjectsData() {
        localStorage.setItem('portfolioProjects', JSON.stringify(this.projectsData));
    }

    loadProjectsData() {
        const saved = localStorage.getItem('portfolioProjects');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Error loading projects data:', error);
            }
        }
        return { projects: [] };
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const adminContainer = document.querySelector('.admin-container');
        adminContainer.insertBefore(messageDiv, adminContainer.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    checkIfReposLoaded() {
        const reposFetched = localStorage.getItem('reposFetched');
        if (reposFetched === 'true' && this.repositories.length > 0) {
            const configSection = document.getElementById('configSection');
            if (configSection) {
                configSection.style.display = 'none';
            }
        }
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        document.getElementById('settingsGithubUsername').value = this.githubUsername;
        document.getElementById('settingsGithubToken').value = this.githubToken || '';
        modal.classList.add('active');
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('active');
    }

    saveSettings() {
        const username = document.getElementById('settingsGithubUsername').value;
        const token = document.getElementById('settingsGithubToken').value;

        if (username) {
            this.githubUsername = username;
            localStorage.setItem('githubUsername', username);
        }

        if (token) {
            this.githubToken = token;
            localStorage.setItem('githubToken', token);
        }

        // Update main form if visible
        const usernameInput = document.getElementById('githubUsername');
        const tokenInput = document.getElementById('githubToken');
        if (usernameInput) usernameInput.value = this.githubUsername;
        if (tokenInput) tokenInput.value = this.githubToken;

        this.closeSettingsModal();
        this.showMessage('Settings saved successfully!', 'success');
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('imagePreviewImg');
                if (preview && previewImg) {
                    previewImg.src = event.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        } else {
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.style.display = 'none';
            }
        }
    }

    handleImageUrlPreview(e) {
        const url = e.target.value;
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('imagePreviewImg');
        
        if (url && preview && previewImg) {
            previewImg.src = url;
            preview.style.display = 'block';
            previewImg.onerror = () => {
                preview.style.display = 'none';
            };
        } else if (preview) {
            preview.style.display = 'none';
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAdmin();
});

