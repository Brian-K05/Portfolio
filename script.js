const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getNavOffset() {
    return Math.min(96, Math.round(window.innerHeight * 0.11));
}

/** Eased scroll (cubic ease-out) — premium feel vs native smooth-scroll only */
function scrollToY(targetY, duration) {
    const d = prefersReducedMotion ? 0 : (duration != null ? duration : 820);
    const start = window.pageYOffset;
    const change = targetY - start;
    if (d <= 0 || Math.abs(change) < 2) {
        window.scrollTo(0, targetY);
        return;
    }
    const t0 = performance.now();
    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }
    function step(now) {
        const elapsed = Math.min(1, (now - t0) / d);
        window.scrollTo(0, start + change * easeOutQuint(elapsed));
        if (elapsed < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function scrollToElement(el, duration) {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - getNavOffset();
    scrollToY(Math.max(0, y), duration);
}

// Logo click scroll to top
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', function (e) {
        e.preventDefault();
        scrollToY(0);
    });
}

// Smooth scroll for in-page navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToElement(target);
    });
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]');

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

// CV link is now handled directly via HTML link, no JavaScript needed

// Hire me button functionality
const hireMeBtn = document.querySelector('.btn-hire-me');
if (hireMeBtn) {
    hireMeBtn.addEventListener('click', function () {
        scrollToElement(document.querySelector('#contact'));
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
    scrollIndicator.addEventListener('click', function () {
        scrollToY(window.innerHeight);
    });
}

// Navbar: scrolled styling only (no auto-hide). Inline transform/background + scroll
// direction caused a broken header after opening CV in a new tab and returning.
const navbar = document.querySelector('.navbar');

function resetNavbarAfterTabReturn() {
    if (!navbar) return;
    const active = document.activeElement;
    if (active && navbar.contains(active)) {
        active.blur();
    }
    navbar.style.removeProperty('transform');
    navbar.style.removeProperty('background-color');
    const y = window.pageYOffset;
    if (y > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

if (navbar) {
    window.addEventListener(
        'scroll',
        function () {
            const y = window.pageYOffset;
            if (y > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        },
        { passive: true }
    );

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            resetNavbarAfterTabReturn();
        }
    });

    window.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            resetNavbarAfterTabReturn();
        }
    });
}

// Scroll reveal (once per element — unobserve after trigger)
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
};

const easePremium = 'cubic-bezier(0.22, 1, 0.36, 1)';
const revealMs = '0.82s';

const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
    });
}, observerOptions);

function revealResetVisible() {
    document.querySelectorAll('section').forEach((section) => {
        section.style.opacity = '1';
        section.style.transform = 'none';
    });
    document
        .querySelectorAll(
            '.project-card, .about-main, .about-stats, .tech-stack-tabs, .certificate-featured-wrap'
        )
        .forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
}

if (prefersReducedMotion) {
    revealResetVisible();
} else {
    document.querySelectorAll('section').forEach((section, index) => {
        if (index > 0) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(22px)';
            section.style.transition = `opacity ${revealMs} ${easePremium}, transform ${revealMs} ${easePremium}`;
            observer.observe(section);
        }
    });

    document.querySelectorAll('.project-card').forEach((card, index) => {
        const delay = index * 0.055;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity ${revealMs} ${easePremium} ${delay}s, transform ${revealMs} ${easePremium} ${delay}s`;
        observer.observe(card);
    });

    document.querySelectorAll('.about-main, .about-stats').forEach((el, index) => {
        const delay = index * 0.07;
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity ${revealMs} ${easePremium} ${delay}s, transform ${revealMs} ${easePremium} ${delay}s`;
        observer.observe(el);
    });

    const techTabs = document.querySelector('.tech-stack-tabs');
    if (techTabs) {
        techTabs.style.opacity = '0';
        techTabs.style.transform = 'translateY(16px)';
        techTabs.style.transition = `opacity ${revealMs} ${easePremium}, transform ${revealMs} ${easePremium}`;
        observer.observe(techTabs);
    }

    document.querySelectorAll('.certificate-featured-wrap').forEach((el, index) => {
        const delay = index * 0.065;
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = `opacity ${revealMs} ${easePremium} ${delay}s, transform ${revealMs} ${easePremium} ${delay}s`;
        observer.observe(el);
    });
}

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
                }, 38);
            }
            statsObserver.unobserve(statNumber);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// Tech stack: category tabs (ARIA tabs pattern)
function setupTechStackTabs() {
    const root = document.querySelector('[data-tech-tabs]');
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const panels = Array.from(root.querySelectorAll('[role="tabpanel"]'));
    if (tabs.length === 0 || tabs.length !== panels.length) return;

    function applySelection(index, focusTab) {
        const i = Math.max(0, Math.min(index, tabs.length - 1));
        tabs.forEach((tab, j) => {
            const on = j === i;
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
            tab.tabIndex = on ? 0 : -1;
            panels[j].hidden = !on;
        });
        tabs[i].scrollIntoView({ inline: 'nearest', block: 'nearest' });
        if (focusTab) {
            tabs[i].focus();
        }
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', function () {
            applySelection(i, false);
        });
        tab.addEventListener('keydown', function (e) {
            let next = null;
            if (e.key === 'ArrowRight') {
                next = i + 1;
            } else if (e.key === 'ArrowLeft') {
                next = i - 1;
            } else if (e.key === 'Home') {
                next = 0;
            } else if (e.key === 'End') {
                next = tabs.length - 1;
            }
            if (next !== null) {
                e.preventDefault();
                applySelection(next, true);
            }
        });
    });
}

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

// Subtle hero parallax (container only — avoids fighting card / image CSS transforms)
window.addEventListener(
    'scroll',
    function () {
        if (prefersReducedMotion) return;
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const scrolled = window.pageYOffset;
        const h = hero.offsetHeight || 1;
        const p = Math.min(1, scrolled / h);
        hero.style.setProperty('--hero-parallax', `${p * 16}px`);
    },
    { passive: true }
);

// Smooth reveal for text blocks (once)
const textObserver = new IntersectionObserver(
    function (entries) {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            textObserver.unobserve(entry.target);
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
);

if (prefersReducedMotion) {
    document.querySelectorAll('.about-text, .about-text-secondary, .project-description').forEach((text) => {
        text.style.opacity = '1';
        text.style.transform = 'none';
    });
} else {
    document.querySelectorAll('.about-text, .about-text-secondary, .project-description').forEach((text) => {
        text.style.opacity = '0';
        text.style.transform = 'translateY(12px)';
        text.style.transition =
            `opacity ${revealMs} ${easePremium}, transform ${revealMs} ${easePremium}`;
        textObserver.observe(text);
    });
}

// Section titles: underline reveal once
document.querySelectorAll('.section-title').forEach((title) => {
    const titleObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                titleObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.25, rootMargin: '0px 0px -5% 0px' }
    );
    if (prefersReducedMotion) {
        title.classList.add('visible');
    } else {
        titleObserver.observe(title);
    }
});

const footerNewsletterForm = document.getElementById('footer-newsletter-form');
if (footerNewsletterForm) {
    footerNewsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = document.getElementById('footer-newsletter-email');
        const raw = input && input.value ? input.value.trim() : '';
        const to = 'briankylesalor02@gmail.com';
        const subject = encodeURIComponent('Newsletter signup');
        const body = encodeURIComponent(
            raw
                ? `Please add this email to updates: ${raw}`
                : 'Please add me to your newsletter list.'
        );
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
}

document.querySelectorAll('.project-card').forEach((card) => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        card.addEventListener('touchstart', function () {
            this.classList.add('is-touch-pressing');
        });
        card.addEventListener('touchend', function () {
            const self = this;
            setTimeout(() => self.classList.remove('is-touch-pressing'), 160);
        });
        card.addEventListener('touchcancel', function () {
            this.classList.remove('is-touch-pressing');
        });
    }

    card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        if (e.target.closest('.award-badge') || e.target.closest('.award-ribbon')) return;
        openProjectModal(card);
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

    button.querySelectorAll('.ripple').forEach((el) => el.remove());

    button.appendChild(circle);
    circle.addEventListener('animationend', function () {
        circle.remove();
    });
}

// Ripple on primary actions only — not on CV links (keeps header control stable, no scale animation)
document.querySelectorAll('.btn-hire-me, .btn-submit').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Opening target=_blank can leave the CV link focused / :hover stuck when returning;
// blur after navigation so the header layout and styles match a fresh state.
document.querySelectorAll('.btn-download-cv, .btn-download-cv-mobile').forEach((el) => {
    el.addEventListener('click', function () {
        const link = this;
        setTimeout(function () {
            if (document.activeElement === link) {
                link.blur();
            }
        }, 0);
    });
});

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a, .btn-download-cv-mobile');

if (mobileMenuToggle && mobileMenu) {
    function setMenuOpen(isOpen) {
        mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function toggleMenu() {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        const open = mobileMenu.classList.contains('active');
        document.body.style.overflow = open ? 'hidden' : '';
        setMenuOpen(open);
    }
    
    function closeMenu() {
        mobileMenuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        setMenuOpen(false);
    }

    setMenuOpen(false);

    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close button functionality
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMenu();
        });
    }

    // Close menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                closeMenu();
            }, 300); // Small delay for smooth transition
        });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

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
const modalClose = projectModal ? projectModal.querySelector('.modal-close') : null;
const modalOverlay = projectModal ? projectModal.querySelector('.modal-overlay') : null;

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
        modalImage.innerHTML = '<div class="image-placeholder" style="width: 100%; height: auto; min-height: 200px; aspect-ratio: 16/9; background: linear-gradient(135deg, #2a2115 0%, #241909 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center;"></div>';
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

// Projects grid: no scroll arrows (layout is CSS grid)

// Set PDF.js worker path
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Certificates data - list of PDF and image certificate files
const certificatesList = [
    { filename: 'Certificate_of_Participation_DigitalSafety.pdf', title: 'Digital Safety Certificate', type: 'pdf' },
    { filename: 'IP Orientation_COP_Oct302024.pdf', title: 'IP Orientation Certificate', type: 'pdf' },
    { filename: 'Certificate - Brian Kyle L. Salor.pdf', title: 'Certificate of Participation', type: 'pdf' },
    { filename: 'Brian Kyle L. Salor.pdf', title: 'Certificate', type: 'pdf' },
    { filename: 'Brian Kyle L. Salor E-Certificate.pdf', title: 'E-Certificate', type: 'pdf' },
    { filename: 'Salor.png', title: 'Certificate', type: 'image' }
];

// Function to render PDF as image
async function renderPDFAsImage(pdfUrl, container) {
    try {
        // Show loading state
        container.innerHTML = `
            <div class="certificate-loading">
                <div class="loading-spinner"></div>
                <p>Loading certificate...</p>
            </div>
        `;

        // Configure PDF.js worker
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        // Get the first page
        const page = await pdf.getPage(1);
        
        // Set up canvas for rendering
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page to canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to image
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.alt = container.getAttribute('data-title') || 'Certificate';
        img.className = 'certificate-image';
        
        // Replace loading with image
        container.innerHTML = '';
        container.appendChild(img);
        
        // Make clickable to open PDF
        container.style.cursor = 'pointer';
        container.addEventListener('click', function() {
            window.open(pdfUrl, '_blank');
        });
        
    } catch (error) {
        console.error('Error rendering PDF:', error);
        // Show error state
        container.innerHTML = `
            <div class="certificate-error">
                <div class="certificate-icon">📜</div>
                <p class="certificate-placeholder-text">${container.getAttribute('data-title') || 'Certificate'}</p>
                <p class="certificate-error-text">Click to view PDF</p>
            </div>
        `;
        container.style.cursor = 'pointer';
        container.addEventListener('click', function() {
            window.open(pdfUrl, '_blank');
        });
    }
}

// Function to load image certificate
function loadImageCertificate(imageUrl, container) {
    container.innerHTML = `
        <div class="certificate-loading">
            <div class="loading-spinner"></div>
            <p>Loading certificate...</p>
        </div>
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = container.getAttribute('data-title') || 'Certificate';
    img.className = 'certificate-image';
    
    img.onload = function() {
        container.innerHTML = '';
        container.appendChild(img);
        container.style.cursor = 'pointer';
        container.addEventListener('click', function() {
            window.open(imageUrl, '_blank');
        });
    };
    
    img.onerror = function() {
        container.innerHTML = `
            <div class="certificate-error">
                <div class="certificate-icon">📜</div>
                <p class="certificate-placeholder-text">${container.getAttribute('data-title') || 'Certificate'}</p>
                <p class="certificate-error-text">Click to view</p>
            </div>
        `;
        container.style.cursor = 'pointer';
        container.addEventListener('click', function() {
            window.open(imageUrl, '_blank');
        });
    };
}

// Populate a container with all certificates (PDF + image), same logic everywhere
function fillCertificatesContainer(container) {
    if (!container) return;

    container.innerHTML = '';

    certificatesList.forEach((cert) => {
        const certItem = document.createElement('div');
        certItem.className = 'certificate-image-item';
        certItem.setAttribute('data-filename', cert.filename);

        const imageContainer = document.createElement('div');
        imageContainer.className = 'certificate-image-container';
        imageContainer.setAttribute('data-title', cert.title);

        certItem.appendChild(imageContainer);
        container.appendChild(certItem);

        const fileType = cert.type || (cert.filename.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? 'image' : 'pdf');

        if (fileType === 'image') {
            loadImageCertificate(cert.filename, imageContainer);
        } else if (typeof pdfjsLib !== 'undefined') {
            renderPDFAsImage(cert.filename, imageContainer);
        } else {
            imageContainer.innerHTML = `
                <div class="certificate-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            setTimeout(() => {
                if (typeof pdfjsLib !== 'undefined') {
                    renderPDFAsImage(cert.filename, imageContainer);
                }
            }, 500);
        }
    });
}

function setupCertificatesGallery() {
    const seeAllBtn = document.getElementById('seeAllCertificates');
    const modal = document.getElementById('certificatesGalleryModal');
    const grid = document.getElementById('certificatesGalleryGrid');
    const certModalClose = modal?.querySelector('.modal-close');
    const overlay = modal?.querySelector('.modal-overlay');

    if (!seeAllBtn || !modal || !grid) return;

    function closeGallery() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        seeAllBtn.focus();
    }

    function openGallery() {
        fillCertificatesContainer(grid);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function() {
            certModalClose?.focus();
        });
    }

    seeAllBtn.addEventListener('click', openGallery);

    if (certModalClose) {
        certModalClose.addEventListener('click', closeGallery);
    }
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeGallery();
            }
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeGallery();
        }
    });
}

/** Horizontal projects carousel — scroll-snap viewport + prev/next + dots */
function setupProjectsSlider() {
    const viewport = document.getElementById('projects-slider');
    const track = viewport?.querySelector('.projects-slider-track');
    const prevBtn = document.querySelector('.projects-slider-btn--prev');
    const nextBtn = document.querySelector('.projects-slider-btn--next');
    const dotsRoot = document.getElementById('projects-slider-dots');
    if (!viewport || !track || !prevBtn || !nextBtn || !dotsRoot) return;

    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function cards() {
        return Array.from(track.querySelectorAll('.project-card-case'));
    }

    function getStep() {
        const list = cards();
        if (!list.length) return 0;
        const st = getComputedStyle(track);
        const gap = parseFloat(st.gap || st.columnGap) || 20;
        return list[0].offsetWidth + gap;
    }

    function getNearestIndex() {
        const list = cards();
        if (!list.length) return 0;
        const vr = viewport.getBoundingClientRect();
        const mid = vr.left + vr.width / 2;
        let best = 0;
        let bestDist = Infinity;
        list.forEach((c, i) => {
            const cr = c.getBoundingClientRect();
            const cMid = cr.left + cr.width / 2;
            const dist = Math.abs(cMid - mid);
            if (dist < bestDist) {
                bestDist = dist;
                best = i;
            }
        });
        return best;
    }

    function updateUi() {
        if (cards().length <= 1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }
        const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth - 2);
        const left = viewport.scrollLeft;
        prevBtn.disabled = left <= 2;
        nextBtn.disabled = left >= max;

        const idx = getNearestIndex();
        dotsRoot.querySelectorAll('.projects-slider-dot').forEach((dot, i) => {
            dot.classList.toggle('is-active', i === idx);
            dot.setAttribute('aria-current', i === idx ? 'true' : 'false');
        });
    }

    function buildDots() {
        dotsRoot.innerHTML = '';
        const list = cards();
        const controls = document.querySelector('.projects-slider-controls');
        if (controls) {
            controls.style.display = list.length <= 1 ? 'none' : '';
        }
        if (list.length <= 1) {
            updateUi();
            return;
        }
        list.forEach((card, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'projects-slider-dot';
            b.setAttribute('aria-label', 'Go to project ' + (i + 1));
            b.addEventListener('click', function () {
                card.scrollIntoView({
                    behavior: motionOk ? 'smooth' : 'auto',
                    inline: 'center',
                    block: 'nearest',
                });
            });
            dotsRoot.appendChild(b);
        });
        updateUi();
    }

    function scrollPrev() {
        viewport.scrollBy({ left: -getStep(), behavior: motionOk ? 'smooth' : 'auto' });
    }

    function scrollNext() {
        viewport.scrollBy({ left: getStep(), behavior: motionOk ? 'smooth' : 'auto' });
    }

    if (viewport.dataset.sliderReady !== '1') {
        viewport.dataset.sliderReady = '1';
        prevBtn.addEventListener('click', scrollPrev);
        nextBtn.addEventListener('click', scrollNext);

        let scrollRaf = 0;
        viewport.addEventListener(
            'scroll',
            function () {
                if (scrollRaf) cancelAnimationFrame(scrollRaf);
                scrollRaf = requestAnimationFrame(function () {
                    scrollRaf = 0;
                    updateUi();
                });
            },
            { passive: true }
        );

        let resizeT;
        window.addEventListener('resize', function () {
            clearTimeout(resizeT);
            resizeT = setTimeout(function () {
                buildDots();
                updateUi();
            }, 120);
        });

        viewport.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollNext();
            }
        });
    }

    buildDots();
    requestAnimationFrame(updateUi);
}

// Load projects dynamically from localStorage
function loadProjectsFromStorage() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

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
            return;
        }

        function buildCaseCard(project, index) {
            const num = String(index + 1).padStart(3, '0');
            const imgSrc = project.image ? escapeHtml(project.image) : '';
            const caption = (project.description || project.name || '').slice(0, 60) + ((project.description || '').length > 60 ? '…' : '');
            const tag = escapeHtml(project.category || 'Project');
            const deployUrl = project.deployUrl && project.deployUrl !== '#' ? escapeHtml(project.deployUrl) : '#';
            const modalTags = (project.techStack || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
            const modalLinks = `
                ${project.deployUrl && project.deployUrl !== '#' ? `<a href="${escapeHtml(project.deployUrl)}" class="btn-live-demo" target="_blank" rel="noopener noreferrer"><span>🌐 View Live</span></a>` : ''}
                ${project.githubUrl && project.githubUrl !== '#' ? `<a href="${escapeHtml(project.githubUrl)}" class="btn-github" target="_blank" rel="noopener noreferrer"><span>💻 View Code</span></a>` : project.githubUrl === '#' ? '<span class="project-link-disabled">Private Repository (Client Project)</span>' : ''}
            `;
            return `
                <article class="project-card project-card-case" data-project="${escapeHtml(project.id)}" data-deploy-url="${escapeHtml(project.deployUrl || '#')}" data-github-url="${escapeHtml(project.githubUrl || '#')}">
                    <div class="project-card-header">
                        <span class="project-index">/${num}</span>
                        <div class="project-dots" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
                    </div>
                    <div class="project-card-image-wrap project-image">
                        ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHtml(project.name)}" class="project-card-img">` : '<div class="image-placeholder"></div>'}
                    </div>
                    <div class="project-card-footer">
                        <span class="project-card-caption">${escapeHtml(caption)}</span>
                        <span class="project-card-tag">${tag}</span>
                    </div>
                    <div class="project-details" style="display: none;">
                        <div class="project-category">${escapeHtml(project.category || 'Project')}</div>
                        <h3 class="project-title">${escapeHtml(project.name)}</h3>
                        <p class="project-description">${escapeHtml(project.description || 'No description available.')}</p>
                        <div class="project-tags">${modalTags}</div>
                        <div class="project-links">${modalLinks}</div>
                    </div>
                </article>
            `;
        }

        projectsGrid.innerHTML = showcasedProjects.map(buildCaseCard).join('');

        const projectCards = projectsGrid.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('a')) openProjectModal(this);
            });
        });

        setupProjectsSlider();
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
    setupProjectsSlider();

    setupCertificatesGallery();
    setupTechStackTabs();

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

// Featured Certificate Full View Modal
const featuredCertImage = document.getElementById('featuredCertificateImage');
const certificateFullViewModal = document.getElementById('certificateFullViewModal');
const certFullViewClose = certificateFullViewModal?.querySelector('.modal-close');

if (featuredCertImage && certificateFullViewModal) {
    featuredCertImage.addEventListener('click', function() {
        certificateFullViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Close certificate full view modal
if (certFullViewClose) {
    certFullViewClose.addEventListener('click', function() {
        certificateFullViewModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close modal when clicking overlay
if (certificateFullViewModal) {
    const overlay = certificateFullViewModal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                certificateFullViewModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certificateFullViewModal.classList.contains('active')) {
            certificateFullViewModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

