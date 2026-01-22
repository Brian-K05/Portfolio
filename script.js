// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNavLink() {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// Download CV button functionality
const downloadCVBtn = document.querySelector('.btn-download-cv');
if (downloadCVBtn) {
    downloadCVBtn.addEventListener('click', function() {
        // You can replace this with actual CV download functionality
        alert('CV download functionality - Replace with actual CV file link');
        // Example: window.open('path/to/cv.pdf', '_blank');
    });
}

// Hire me button functionality
const hireMeBtn = document.querySelector('.btn-hire-me');
if (hireMeBtn) {
    hireMeBtn.addEventListener('click', function() {
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            const offsetTop = contactSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
}


// Enhanced scroll indicator with click functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 100) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
        } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.pointerEvents = 'auto';
        }
    });
    
    // Click to scroll down
    scrollIndicator.addEventListener('click', function() {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
}

// Enhanced navbar scroll effects
const navbar = document.querySelector('.navbar');
if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
            navbar.style.backgroundColor = 'rgba(26, 26, 26, 0.98)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
        }
        
        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Enhanced Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach((section, index) => {
    if (index > 0) { // Skip hero section
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        observer.observe(section);
    }
});

// Observe project cards with stagger
document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;
    observer.observe(card);
});

// Observe about sections
document.querySelectorAll('.about-main, .about-stats').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;
    observer.observe(el);
});

// Animate stats numbers on scroll
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            const targetValue = statNumber.textContent;
            const numericValue = parseInt(targetValue);
            
            if (!isNaN(numericValue)) {
                let currentValue = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        statNumber.textContent = targetValue;
                        clearInterval(timer);
                    } else {
                        statNumber.textContent = Math.floor(currentValue) + '+';
                    }
                }, 30);
            }
            statsObserver.unobserve(statNumber);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// Mobile menu toggle (for smaller screens)
function createMobileMenu() {
    const nav = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    
    // Check if we're on mobile
    if (window.innerWidth <= 768) {
        // Mobile menu functionality can be added here if needed
    }
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        createMobileMenu();
    }, 250);
});

// Parallax effect for hero image
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.profile-image-placeholder');
    if (heroImage && scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 - scrolled * 0.0005})`;
    }
});

// Smooth reveal for text elements
const textObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.about-text, .about-text-secondary, .project-description').forEach(text => {
    text.style.opacity = '0';
    text.style.transform = 'translateY(20px)';
    text.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    textObserver.observe(text);
});

// Animate section titles
document.querySelectorAll('.section-title').forEach(title => {
    const titleObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.3 });
    
    titleObserver.observe(title);
});

// Interactive 3D tilt effect for project cards (desktop only)
document.querySelectorAll('.project-card').forEach(card => {
    // Only enable 3D tilt on desktop (not touch devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) {
        // 3D tilt effect on mouse move
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    }

    // Add touch feedback for mobile
    if (isTouchDevice) {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.97)';
            this.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 150);
        });
    }

    // Make project card clickable to open modal
    card.addEventListener('click', function(e) {
        // Don't trigger if clicking on badges/ribbons
        if (!e.target.closest('.award-badge') && !e.target.closest('.award-ribbon')) {
            openProjectModal(card);
        }
    });
});

// Add interactive ripple effect on buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Add ripple to buttons
document.querySelectorAll('.btn-hire-me, .btn-download-cv, .btn-submit, .btn-download-cv-mobile').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a, .btn-download-cv-mobile');

if (mobileMenuToggle && mobileMenu) {
    function toggleMenu() {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }, 300); // Small delay for smooth transition
        });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            toggleMenu();
        }
    });
}

// Prevent body scroll when menu is open
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Typing animation for SALOR
let isTyping = false;
let typingTimeout = null;
let lastScrollPosition = 0;

function typeSalor() {
    const salorText = document.querySelector('.typing-text');
    const salorElement = document.getElementById('salor-text');
    if (!salorText || !salorElement || isTyping) return;

    isTyping = true;
    const text = 'SALOR';
    let index = 0;
    salorText.textContent = '';
    salorElement.classList.remove('typing-complete');

    function type() {
        if (index < text.length) {
            salorText.textContent += text[index];
            index++;
            typingTimeout = setTimeout(type, 150); // Typing speed
        } else {
            // Animation complete
            setTimeout(() => {
                salorElement.classList.add('typing-complete');
                isTyping = false;
            }, 500);
        }
    }

    type();
}

function resetTyping() {
    const salorText = document.querySelector('.typing-text');
    const salorElement = document.getElementById('salor-text');
    if (salorText && salorElement) {
        salorText.textContent = '';
        salorElement.classList.remove('typing-complete');
        isTyping = false;
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
    }
}

// Observe hero section for typing animation
let heroHasBeenVisible = false;
const heroObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Hero section is visible
            const currentScroll = window.pageYOffset;
            // Check if scrolling up (back to hero) or first time
            if (!heroHasBeenVisible || currentScroll < lastScrollPosition) {
                setTimeout(() => {
                    resetTyping();
                    setTimeout(() => {
                        typeSalor();
                    }, 100);
                }, 300);
            }
            heroHasBeenVisible = true;
        } else {
            // Hero section is not visible
            resetTyping();
        }
        lastScrollPosition = window.pageYOffset;
    });
}, { threshold: 0.3 });

// Project Modal Functionality
const projectModal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

function openProjectModal(card) {
    const details = card.querySelector('.project-details');
    if (!details) return;

    // Get project data
    const category = details.querySelector('.project-category')?.textContent || '';
    const title = details.querySelector('.project-title')?.textContent || '';
    const description = details.querySelector('.project-description')?.textContent || '';
    const tags = details.querySelectorAll('.project-tags .tag');
    const links = details.querySelector('.project-links');
    const image = card.querySelector('.project-image img') || card.querySelector('.project-image .image-placeholder');
    
    // Get image source
    let imageSrc = '';
    if (image) {
        if (image.tagName === 'IMG') {
            imageSrc = image.src;
        }
    }

    // Populate modal
    const modalImage = projectModal.querySelector('.modal-project-image');
    const modalCategory = projectModal.querySelector('.modal-category');
    const modalTitle = projectModal.querySelector('.modal-title');
    const modalDescription = projectModal.querySelector('.modal-description');
    const modalTags = projectModal.querySelector('.modal-tags');
    const modalLinks = projectModal.querySelector('.modal-links');

    // Set image
    if (imageSrc) {
        modalImage.innerHTML = `<img src="${imageSrc}" alt="${title}">`;
    } else {
        modalImage.innerHTML = '<div class="image-placeholder" style="width: 100%; height: auto; min-height: 200px; aspect-ratio: 16/9; background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center;"></div>';
    }

    modalCategory.textContent = category;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    // Set tags
    modalTags.innerHTML = '';
    tags.forEach(tag => {
        const tagClone = tag.cloneNode(true);
        modalTags.appendChild(tagClone);
    });

    // Set links
    if (links) {
        modalLinks.innerHTML = links.innerHTML;
    } else {
        modalLinks.innerHTML = '';
    }

    // Update button states
    const deployUrl = card.getAttribute('data-deploy-url');
    const githubUrl = card.getAttribute('data-github-url');
    const liveDemoBtn = modalLinks.querySelector('.btn-live-demo');
    const githubBtn = modalLinks.querySelector('.btn-github');

    if (liveDemoBtn) {
        if (deployUrl && deployUrl !== '#') {
            liveDemoBtn.href = deployUrl;
            liveDemoBtn.classList.remove('disabled');
        } else {
            liveDemoBtn.classList.add('disabled');
            liveDemoBtn.href = '#';
        }
    }

    if (githubBtn && githubUrl) {
        githubBtn.href = githubUrl;
    }

    // Open modal
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal events
if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeProjectModal);
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
    }
});

// Projects scroll arrows functionality
const projectsList = document.querySelector('.projects-list');
const scrollLeftBtn = document.querySelector('.scroll-arrow-left');
const scrollRightBtn = document.querySelector('.scroll-arrow-right');

if (projectsList && scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.addEventListener('click', function() {
        projectsList.scrollBy({
            left: -400,
            behavior: 'smooth'
        });
    });

    scrollRightBtn.addEventListener('click', function() {
        projectsList.scrollBy({
            left: 400,
            behavior: 'smooth'
        });
    });

    // Update arrow visibility based on scroll position
    function updateArrowVisibility() {
        const scrollLeft = projectsList.scrollLeft;
        const scrollWidth = projectsList.scrollWidth;
        const clientWidth = projectsList.clientWidth;

        if (scrollLeft <= 10) {
            scrollLeftBtn.style.opacity = '0.3';
            scrollLeftBtn.style.pointerEvents = 'none';
        } else {
            scrollLeftBtn.style.opacity = '1';
            scrollLeftBtn.style.pointerEvents = 'auto';
        }

        if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRightBtn.style.opacity = '0.3';
            scrollRightBtn.style.pointerEvents = 'none';
        } else {
            scrollRightBtn.style.opacity = '1';
            scrollRightBtn.style.pointerEvents = 'auto';
        }
    }

    projectsList.addEventListener('scroll', updateArrowVisibility);
    updateArrowVisibility();

    // Center projects when they fit on screen (3 or fewer)
    function centerProjectsIfNeeded() {
        const projectCards = projectsList.querySelectorAll('.project-card');
        const cardCount = projectCards.length;
        
        // Calculate total width needed for all cards
        let totalWidth = 0;
        projectCards.forEach(card => {
            const cardStyle = window.getComputedStyle(card);
            const cardWidth = card.offsetWidth;
            const marginLeft = parseInt(cardStyle.marginLeft) || 0;
            const marginRight = parseInt(cardStyle.marginRight) || 0;
            totalWidth += cardWidth + marginLeft + marginRight;
        });
        
        // Add gap between cards (1.5rem = 24px)
        const gap = 24;
        totalWidth += gap * (cardCount - 1);
        
        // Check if projects fit within viewport
        const containerWidth = projectsList.clientWidth;
        
        if (totalWidth <= containerWidth) {
            // Projects fit, center them
            projectsList.style.justifyContent = 'center';
        } else {
            // Projects don't fit, align to start for scrolling
            projectsList.style.justifyContent = 'flex-start';
        }
    }

    // Run on load and resize
    centerProjectsIfNeeded();
    window.addEventListener('resize', centerProjectsIfNeeded);
}

// Load projects dynamically from localStorage
function loadProjectsFromStorage() {
    const projectsList = document.querySelector('.projects-list');
    if (!projectsList) return;

    try {
        const saved = localStorage.getItem('portfolioProjects');
        if (!saved) {
            // No saved projects, keep existing HTML
            return;
        }

        const data = JSON.parse(saved);
        const showcasedProjects = data.projects
            .filter(p => p.showcase)
            .sort((a, b) => a.order - b.order);

        if (showcasedProjects.length === 0) {
            // No showcased projects, keep existing HTML
            return;
        }

        // Generate HTML for each project
        const projectsHTML = showcasedProjects.map(project => {
            const imageHtml = project.image
                ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.name)}" class="project-img">`
                : '<div class="image-placeholder"></div>';

            const tagsHtml = project.techStack && project.techStack.length > 0
                ? project.techStack.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')
                : '';

            const linksHtml = `
                ${project.deployUrl && project.deployUrl !== '#' 
                    ? `<a href="${escapeHtml(project.deployUrl)}" class="btn-live-demo" target="_blank" rel="noopener noreferrer"><span>🌐 View Live</span></a>`
                    : ''}
                ${project.githubUrl && project.githubUrl !== '#'
                    ? `<a href="${escapeHtml(project.githubUrl)}" class="btn-github" target="_blank" rel="noopener noreferrer"><span>💻 View Code</span></a>`
                    : project.githubUrl === '#'
                    ? '<span class="project-link-disabled">Private Repository (Client Project)</span>'
                    : ''}
            `;

            return `
                <div class="project-card award-winner" data-project="${project.id}" data-deploy-url="${escapeHtml(project.deployUrl || '#')}" data-github-url="${escapeHtml(project.githubUrl || '#')}">
                    <div class="project-image-wrapper">
                        <div class="project-image">
                            ${imageHtml}
                        </div>
                        <div class="project-overlay">
                            <div class="project-overlay-content">
                                <h3 class="project-title-overlay">${escapeHtml(project.name)}</h3>
                                <p class="project-category-overlay">${escapeHtml(project.category || 'Project')}</p>
                            </div>
                        </div>
                    </div>
                    <!-- Hidden project details for modal -->
                    <div class="project-details" style="display: none;">
                        <div class="project-category">${escapeHtml(project.category || 'Project')}</div>
                        <h3 class="project-title">${escapeHtml(project.name)}</h3>
                        <p class="project-description">${escapeHtml(project.description || 'No description available.')}</p>
                        <div class="project-tags">
                            ${tagsHtml}
                        </div>
                        <div class="project-links">
                            ${linksHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Replace projects list content
        projectsList.innerHTML = projectsHTML;

        // Re-attach click event listeners to project cards
        const projectCards = projectsList.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', function() {
                openProjectModal(this);
            });
        });

        // Re-initialize scroll functionality
        const scrollLeftBtn = document.querySelector('.scroll-arrow-left');
        const scrollRightBtn = document.querySelector('.scroll-arrow-right');
        
        if (scrollLeftBtn && scrollRightBtn && projectsList) {
            const updateArrowVisibility = () => {
                const scrollLeft = projectsList.scrollLeft;
                const scrollWidth = projectsList.scrollWidth;
                const clientWidth = projectsList.clientWidth;

                if (scrollLeft <= 10) {
                    scrollLeftBtn.style.opacity = '0.3';
                    scrollLeftBtn.style.pointerEvents = 'none';
                } else {
                    scrollLeftBtn.style.opacity = '1';
                    scrollLeftBtn.style.pointerEvents = 'auto';
                }

                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollRightBtn.style.opacity = '0.3';
                    scrollRightBtn.style.pointerEvents = 'none';
                } else {
                    scrollRightBtn.style.opacity = '1';
                    scrollRightBtn.style.pointerEvents = 'auto';
                }
            };

            projectsList.addEventListener('scroll', updateArrowVisibility);
            updateArrowVisibility();

            // Center projects if needed
            function centerProjectsIfNeeded() {
                const projectCards = projectsList.querySelectorAll('.project-card');
                const cardCount = projectCards.length;
                
                let totalWidth = 0;
                projectCards.forEach(card => {
                    const cardStyle = window.getComputedStyle(card);
                    const cardWidth = card.offsetWidth;
                    const marginLeft = parseInt(cardStyle.marginLeft) || 0;
                    const marginRight = parseInt(cardStyle.marginRight) || 0;
                    totalWidth += cardWidth + marginLeft + marginRight;
                });
                
                const gap = 24;
                totalWidth += gap * (cardCount - 1);
                const containerWidth = projectsList.clientWidth;
                
                if (totalWidth <= containerWidth) {
                    projectsList.style.justifyContent = 'center';
                } else {
                    projectsList.style.justifyContent = 'flex-start';
                }
            }

            centerProjectsIfNeeded();
            window.addEventListener('resize', centerProjectsIfNeeded);
        }
    } catch (error) {
        console.error('Error loading projects from storage:', error);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Listen for storage changes (when admin updates projects)
window.addEventListener('storage', function(e) {
    if (e.key === 'portfolioProjects') {
        // Reload projects when admin makes changes
        loadProjectsFromStorage();
    }
});

// Also listen for custom storage events (for same-tab updates)
window.addEventListener('portfolioUpdated', function() {
    loadProjectsFromStorage();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    createMobileMenu();
    highlightNavLink();
    
    // Load projects from storage (will replace static projects if available)
    loadProjectsFromStorage();
    
    // Add visible class to hero section immediately
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.classList.add('visible');
        
        // Observe hero section for typing animation
        heroObserver.observe(heroSection);
        
        // Trigger typing on first load if hero is visible
        if (window.scrollY < window.innerHeight * 0.7) {
            setTimeout(() => {
                typeSalor();
            }, 800);
        }
    }
});

