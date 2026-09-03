const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lockPageScroll() {
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
}

function unlockPageScroll() {
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
}

function getMobileMenuEls() {
    return {
        toggle: document.querySelector('.mobile-menu-toggle'),
        menu: document.querySelector('.mobile-menu')
    };
}

function isMobileMenuOpen() {
    const { menu } = getMobileMenuEls();
    return !!(menu && menu.classList.contains('active'));
}

function closeMobileMenu() {
    const { toggle, menu } = getMobileMenuEls();
    if (toggle) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    }
    if (menu) menu.classList.remove('active');
    unlockPageScroll();
}

function afterMobileMenuClosed(fn) {
    closeMobileMenu();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.setTimeout(fn, 50);
        });
    });
}

(function setupPreloader() {
    const el = document.getElementById('preloader');
    const hero = document.querySelector('.hero');
    const startHero = () => {
        document.body.classList.add('is-ready');
        if (hero) hero.classList.add('is-started');
        document.dispatchEvent(new Event('portfolio:ready'));
    };
    const finish = () => {
        if (el) {
            el.classList.add('is-done');
            document.body.style.overflow = '';
            window.setTimeout(() => el.remove(), 800);
        }
        startHero();
    };
    const seen = (() => {
        try {
            return sessionStorage.getItem('portfolio-seen') === '1';
        } catch (err) {
            return false;
        }
    })();
    const markSeen = () => {
        try {
            sessionStorage.setItem('portfolio-seen', '1');
        } catch (err) {
            /* ignore */
        }
    };
    if (!el || prefersReducedMotion || seen) {
        if (el) el.remove();
        document.body.style.overflow = '';
        markSeen();
        startHero();
        return;
    }
    document.body.style.overflow = 'hidden';
    const bar = el.querySelector('.preloader-bar');
    let done = false;
    const once = () => {
        if (done) return;
        done = true;
        markSeen();
        finish();
    };
    if (bar) bar.addEventListener('animationend', once, { once: true });
    window.setTimeout(once, 400);
})();

function getNavOffset() {
    return Math.min(96, Math.round(window.innerHeight * 0.11));
}

/** Eased scroll (cubic ease-out) — premium feel vs native smooth-scroll only */
function scrollToY(targetY, duration) {
    if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { offset: 0, duration: prefersReducedMotion ? 0 : 1.15 });
        return;
    }
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
    if (window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -70, duration: prefersReducedMotion ? 0 : 1.15 });
        return;
    }
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
        const go = () => scrollToElement(target);
        if (this.closest('.mobile-menu') && isMobileMenuOpen()) {
            afterMobileMenuClosed(go);
            return;
        }
        go();
    });
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]');

function highlightNavLink() {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const id = section.getAttribute('id');
        if (id === 'feedback') return;
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = id;
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

// Primary hero CTA is an in-page link; hash handler above covers it.


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
            '.project-row, .about-main, .about-facts, .tech-stack-groups, .certificate-featured-wrap, .experience-list, .feedback-copy, .feedback-card, .feedback-form'
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

    document.querySelectorAll('.project-row').forEach((card, index) => {
        const delay = index * 0.055;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity ${revealMs} ${easePremium} ${delay}s, transform ${revealMs} ${easePremium} ${delay}s`;
        observer.observe(card);
    });

    document.querySelectorAll('.about-main, .about-facts').forEach((el, index) => {
        const delay = index * 0.07;
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity ${revealMs} ${easePremium} ${delay}s, transform ${revealMs} ${easePremium} ${delay}s`;
        observer.observe(el);
    });

    const techGroups = document.querySelector('.tech-stack-groups');
    if (techGroups) {
        techGroups.style.opacity = '0';
        techGroups.style.transform = 'translateY(16px)';
        techGroups.style.transition = `opacity ${revealMs} ${easePremium}, transform ${revealMs} ${easePremium}`;
        observer.observe(techGroups);
    }

    document.querySelectorAll('.experience-list').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = `opacity ${revealMs} ${easePremium}, transform ${revealMs} ${easePremium}`;
        observer.observe(el);
    });

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
            if (!/^\d+\+?$/.test(targetValue.trim())) {
                statsObserver.unobserve(statNumber);
                return;
            }
            const numericValue = parseInt(targetValue, 10);
            
            if (!isNaN(numericValue) && targetValue.includes('+')) {
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

// Hero parallax is handled in motion/CSS — skip extra scroll transforms here


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

document.querySelectorAll('.project-row').forEach((card) => {
    const openBtn = card.querySelector('.js-open-case');
    if (openBtn) {
        openBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            openProjectModal(card);
        });
    }
    const foot = card.querySelector('.project-win-foot');
    if (foot) {
        foot.addEventListener('click', function (e) {
            if (e.target.closest('a')) return;
            openProjectModal(card);
        });
    }
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
        if (open) lockPageScroll();
        else unlockPageScroll();
        setMenuOpen(open);
    }
    
    function closeMenu() {
        closeMobileMenu();
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

    // Hash links close + scroll in the global handler. File downloads close now.
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            const href = this.getAttribute('href') || '';
            if (!href.startsWith('#')) closeMenu();
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

// Project case drawer
const projectModal = document.getElementById('projectModal');
const casePanel = projectModal ? projectModal.querySelector('.case-drawer-panel') : null;
const caseKicker = document.getElementById('case-drawer-kicker');
const caseMedia = document.getElementById('case-drawer-media');
const caseTitle = document.getElementById('project-modal-title');
const caseCopy = document.getElementById('case-drawer-copy');
const caseTags = document.getElementById('case-drawer-tags');
const caseLinks = document.getElementById('case-drawer-links');
let caseReturnFocus = null;

function isCaseOpen() {
    return !!(projectModal && projectModal.classList.contains('is-open'));
}

function openProjectModal(card) {
    const details = card.querySelector('.project-details');
    if (!details || !projectModal) return;

    const category = details.querySelector('.project-category')?.textContent || '';
    const title = details.querySelector('.project-title')?.textContent || '';
    const description = details.querySelector('.project-description')?.textContent || '';
    const tags = details.querySelectorAll('.project-tags .tag');
    const links = details.querySelector('.project-links');
    const image = card.querySelector('.win-body img');

    caseKicker.textContent = category;
    caseTitle.textContent = title;
    caseCopy.textContent = description;

    caseMedia.innerHTML = '';
    if (image && image.tagName === 'IMG' && image.getAttribute('src')) {
        const img = document.createElement('img');
        img.src = image.currentSrc || image.src;
        img.alt = title;
        img.width = image.width || 1280;
        img.height = image.height || 800;
        caseMedia.appendChild(img);
        caseMedia.hidden = false;
    } else {
        caseMedia.hidden = true;
    }

    caseTags.innerHTML = '';
    tags.forEach((tag) => {
        caseTags.appendChild(tag.cloneNode(true));
    });

    caseLinks.innerHTML = links ? links.innerHTML : '';

    const deployUrl = card.getAttribute('data-deploy-url');
    const githubUrl = card.getAttribute('data-github-url');
    const liveDemoBtn = caseLinks.querySelector('.btn-live-demo');
    const githubBtn = caseLinks.querySelector('.btn-github');

    if (liveDemoBtn) {
        if (deployUrl && deployUrl !== '#') {
            liveDemoBtn.href = deployUrl;
            liveDemoBtn.classList.remove('disabled');
        } else {
            liveDemoBtn.classList.add('disabled');
            liveDemoBtn.href = '#';
        }
    }

    if (githubBtn && githubUrl && githubUrl !== '#') {
        githubBtn.href = githubUrl;
    }

    caseReturnFocus = document.activeElement;
    projectModal.classList.add('is-open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('case-open');
    lockPageScroll();
    const closeBtn = projectModal.querySelector('.case-drawer-close');
    window.requestAnimationFrame(function () {
        (closeBtn || casePanel).focus();
    });
}

function closeProjectModal() {
    if (!projectModal || !isCaseOpen()) return;
    projectModal.classList.remove('is-open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('case-open');
    unlockPageScroll();
    if (caseReturnFocus && typeof caseReturnFocus.focus === 'function') {
        caseReturnFocus.focus();
    }
    caseReturnFocus = null;
}

if (projectModal) {
    projectModal.querySelectorAll('[data-case-close]').forEach((el) => {
        el.addEventListener('click', closeProjectModal);
    });
}

function getCaseFocusables() {
    if (!casePanel) return [];
    return Array.from(
        casePanel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isCaseOpen()) {
        closeProjectModal();
        return;
    }
    if (e.key !== 'Tab' || !isCaseOpen()) return;
    const items = getCaseFocusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

// Projects grid: no scroll arrows (layout is CSS grid)

// Set PDF.js worker path
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Certificates data - list of PDF and image certificate files
const certificatesList = [
    { filename: 'Brian Kyle L. Salor E-Certificate.pdf', title: 'Internship completion — Machica Firm', type: 'pdf' },
    { filename: 'Certificate_of_Participation_DigitalSafety.pdf', title: 'Digital Safety', type: 'pdf' },
    { filename: 'IP Orientation_COP_Oct302024.pdf', title: 'IP Orientation', type: 'pdf' },
    { filename: 'Certificate - Brian Kyle L. Salor.pdf', title: 'Zuitt Data Visualization', type: 'pdf' }
];

function loadPdfJs() {
    return new Promise((resolve, reject) => {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
            return;
        }
        const existing = document.querySelector('script[data-pdfjs]');
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        script.dataset.pdfjs = 'true';
        script.addEventListener('load', function () {
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            resolve();
        });
        script.addEventListener('error', reject);
        document.body.appendChild(script);
    });
}

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

    const inGallery = container.id === 'certificatesGalleryGrid';

    certificatesList.forEach((cert) => {
        const certItem = document.createElement('div');
        certItem.className = inGallery ? 'gallery-cert' : 'certificate-image-item';
        certItem.setAttribute('data-filename', cert.filename);

        const imageContainer = document.createElement('div');
        imageContainer.className = inGallery ? 'gallery-cert-frame' : 'certificate-image-container';
        imageContainer.setAttribute('data-title', cert.title);

        certItem.appendChild(imageContainer);
        if (inGallery) {
            const label = document.createElement('p');
            label.className = 'gallery-cert-title';
            label.textContent = cert.title;
            certItem.appendChild(label);
        }
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
        unlockPageScroll();
        seeAllBtn.focus();
    }

    function openGallery() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        lockPageScroll();
        requestAnimationFrame(function() {
            certModalClose?.focus();
        });
        if (grid.childElementCount === 0) {
            loadPdfJs()
                .then(function () {
                    fillCertificatesContainer(grid);
                })
                .catch(function () {
                    fillCertificatesContainer(grid);
                });
        }
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

/** Horizontal snap carousel — Work and Feedback */
function setupSnapSlider(viewportId, options) {
    const opts = options || {};
    const viewport = document.getElementById(viewportId);
    const wrap = viewport?.closest('.projects-slider-wrap');
    const track = viewport?.querySelector('.projects-slider-track');
    const prevBtn = wrap?.querySelector('.projects-slider-btn--prev');
    const nextBtn = wrap?.querySelector('.projects-slider-btn--next');
    const dotsRoot = wrap?.querySelector('.projects-slider-dots');
    const controls = wrap?.querySelector('.projects-slider-controls');
    if (!viewport || !wrap || !track || !prevBtn || !nextBtn || !dotsRoot) return;

    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const titleSelector = opts.titleSelector || '';
    const fallbackLabel = opts.fallbackLabel || 'Go to slide';

    function cards() {
        return Array.from(track.children).filter((el) => el.tagName === 'LI');
    }

    if (cards().length === 0) {
        wrap.hidden = true;
        return;
    }
    wrap.hidden = false;

    function getStep() {
        const list = cards();
        if (!list.length) return viewport.clientWidth * 0.8;
        const st = getComputedStyle(track);
        const gap = parseFloat(st.gap || st.columnGap) || 20;
        return list[0].offsetWidth + gap;
    }

    function getNearestIndex() {
        const list = cards();
        if (!list.length) return 0;
        const vr = viewport.getBoundingClientRect();
        const mid = vr.left + Math.min(vr.width, getStep()) / 2;
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

    function scrollToCard(card) {
        if (!card) return;
        const pad = parseFloat(getComputedStyle(viewport).scrollPaddingInlineStart) || 0;
        viewport.scrollTo({
            left: Math.max(0, card.offsetLeft - pad),
            behavior: motionOk ? 'smooth' : 'auto'
        });
    }

    function updateUi() {
        const list = cards();
        const idx = getNearestIndex();
        list.forEach((li, i) => {
            li.classList.toggle('is-slide-active', i === idx);
        });

        if (list.length <= 1) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }
        const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth - 2);
        const left = viewport.scrollLeft;
        prevBtn.disabled = left <= 2;
        nextBtn.disabled = left >= max;

        dotsRoot.querySelectorAll('.projects-slider-dot').forEach((dot, i) => {
            const on = i === idx;
            dot.classList.toggle('is-active', on);
            dot.setAttribute('aria-selected', on ? 'true' : 'false');
            dot.setAttribute('tabindex', on ? '0' : '-1');
        });
    }

    function buildDots() {
        dotsRoot.innerHTML = '';
        const list = cards();
        if (controls) {
            controls.hidden = list.length <= 1;
        }
        if (list.length <= 1) {
            updateUi();
            return;
        }
        list.forEach((card, i) => {
            const title = titleSelector ? card.querySelector(titleSelector) : null;
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'projects-slider-dot';
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-label', title && title.textContent.trim()
                ? title.textContent.trim()
                : fallbackLabel + ' ' + (i + 1));
            b.addEventListener('click', function () {
                scrollToCard(card);
            });
            dotsRoot.appendChild(b);
        });
        updateUi();
    }

    function scrollPrev() {
        const idx = getNearestIndex();
        scrollToCard(cards()[Math.max(0, idx - 1)]);
    }

    function scrollNext() {
        const list = cards();
        const idx = getNearestIndex();
        scrollToCard(list[Math.min(list.length - 1, idx + 1)]);
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

        viewport.addEventListener(
            'wheel',
            function (e) {
                if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
                const max = viewport.scrollWidth - viewport.clientWidth;
                if (max <= 2) return;
                const atStart = viewport.scrollLeft <= 2;
                const atEnd = viewport.scrollLeft >= max - 2;
                if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
                e.preventDefault();
                viewport.scrollLeft += e.deltaY;
            },
            { passive: false }
        );

        let dragId = null;
        let dragStartX = 0;
        let dragStartScroll = 0;
        let dragged = false;

        viewport.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'touch' || e.button !== 0) return;
            if (e.target.closest('a, input, textarea, select, label, button.feedback-choice')) return;
            dragId = e.pointerId;
            dragStartX = e.clientX;
            dragStartScroll = viewport.scrollLeft;
            dragged = false;
            viewport.classList.add('is-dragging');
        });

        viewport.addEventListener('pointermove', function (e) {
            if (dragId !== e.pointerId) return;
            const dx = e.clientX - dragStartX;
            if (Math.abs(dx) > 8) dragged = true;
            if (dragged) {
                viewport.scrollLeft = dragStartScroll - dx;
            }
        });

        function endDrag(e) {
            if (dragId !== e.pointerId) return;
            dragId = null;
            viewport.classList.remove('is-dragging');
        }

        viewport.addEventListener('pointerup', endDrag);
        viewport.addEventListener('pointercancel', endDrag);

        viewport.addEventListener(
            'click',
            function (e) {
                if (!dragged) return;
                e.preventDefault();
                e.stopPropagation();
                dragged = false;
            },
            true
        );
    }

    buildDots();
    requestAnimationFrame(updateUi);
}

function setupProjectsSlider() {
    setupSnapSlider('projects-slider', {
        titleSelector: '.project-win-title',
        fallbackLabel: 'Go to project'
    });
}

function setupFeedbackSlider() {
    setupSnapSlider('feedback-slider', {
        titleSelector: '.feedback-name',
        fallbackLabel: 'Go to quote'
    });
}

// Public site uses the static project markup. Admin localStorage must not replace it.
function loadProjectsFromStorage() {
    return;
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
    highlightNavLink();
    setupCertificatesGallery();
    setupTechStackTabs();
    setupProjectsSlider();
    setupFeedbackSlider();

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.classList.add('visible');
    }
});

// Featured Certificate Full View Modal
const featuredCertImage = document.getElementById('featuredCertificateImage');
const certificateFullViewModal = document.getElementById('certificateFullViewModal');
const certFullViewClose = certificateFullViewModal?.querySelector('.modal-close');

if (featuredCertImage && certificateFullViewModal) {
    featuredCertImage.addEventListener('click', function() {
        certificateFullViewModal.classList.add('active');
        lockPageScroll();
    });
}

// Close certificate full view modal
if (certFullViewClose) {
    certFullViewClose.addEventListener('click', function() {
        certificateFullViewModal.classList.remove('active');
        unlockPageScroll();
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

(function setupFeedbackForm() {
    const STORAGE_KEY = 'bkFeedbackCards';
    const form = document.getElementById('feedback-form');
    if (!form) return;
    const grid = document.getElementById('feedback-grid');
    const layout = document.getElementById('feedback-layout');
    const sentNote = document.getElementById('feedback-sent');
    const sentLead = document.getElementById('feedback-sent-lead');
    const copy = document.querySelector('.feedback-copy');
    const next = document.getElementById('feedback-next');
    const template = document.getElementById('feedback-card-template');
    const againBtn = document.getElementById('feedback-again');
    const openBtn = document.getElementById('feedback-open');
    const closeBtn = document.getElementById('feedback-close');
    const cta = document.getElementById('feedback-cta');

    if (next && window.location.protocol !== 'file:') {
        const url = new URL(window.location.href);
        url.searchParams.set('sent', '1');
        url.hash = 'feedback';
        next.value = url.origin + url.pathname + url.search + url.hash;
    }

    function withHttps(link) {
        const value = (link || '').trim();
        if (!value) return '#';
        return /^https?:\/\//i.test(value) ? value : 'https://' + value;
    }

    function allowed(item) {
        return String(item && item.permission || '').toLowerCase() === 'yes';
    }

    function cardKey(item) {
        return ((item && item.name) + '|' + (item && item.quote)).toLowerCase().trim();
    }

    function readLocalCards() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(raw) ? raw : [];
        } catch (err) {
            return [];
        }
    }

    function saveLocalCard(item) {
        if (!item || !allowed(item) || !item.quote || !item.name) return;
        const existing = readLocalCards();
        if (existing.some((card) => cardKey(card) === cardKey(item))) return;
        existing.push(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }

    function renderCard(item, kicker) {
        if (!grid || !template || !item || !item.quote) return;
        const node = template.content.cloneNode(true);
        const card = node.querySelector('.feedback-card');
        const kickerEl = node.querySelector('.feedback-kicker');
        const quoteEl = node.querySelector('.feedback-quote');
        const nameEl = node.querySelector('.feedback-name');
        const roleEl = node.querySelector('.feedback-role');
        const onEl = node.querySelector('.feedback-on');
        const dateEl = node.querySelector('.feedback-date');
        const linkedinEl = node.querySelector('.feedback-chip--linkedin');
        const googleEl = node.querySelector('.feedback-chip--google');
        if (kickerEl) kickerEl.textContent = kicker || '';
        if (quoteEl) quoteEl.textContent = item.quote;
        if (nameEl) nameEl.textContent = item.name || '';
        if (roleEl) roleEl.textContent = item.role || '';
        if (onEl) onEl.textContent = item.project ? 'On: ' + item.project : '';
        if (dateEl) dateEl.textContent = item.date || '';
        if (linkedinEl) {
            if (item.linkedin) linkedinEl.href = withHttps(item.linkedin);
            else linkedinEl.remove();
        }
        if (googleEl) googleEl.remove();
        if (card) {
            card.classList.add('is-in');
            card.style.opacity = '1';
            card.style.transform = 'none';
        }
        grid.appendChild(node);
        if (grid.children.length === 1) {
            const first = grid.querySelector('li');
            if (first) first.classList.add('is-slide-active');
        }
    }

    function alreadyRendered(item) {
        if (!grid) return false;
        return Array.from(grid.querySelectorAll('.feedback-quote')).some((el) => {
            return el.textContent.trim() === (item.quote || '').trim();
        });
    }

    function setCtaVisible(show) {
        if (cta) cta.hidden = !show;
    }

    function hideComposer() {
        if (layout) {
            layout.hidden = true;
            layout.classList.remove('is-sent');
        }
        if (form) form.hidden = false;
        if (copy) copy.hidden = false;
        if (sentNote) sentNote.hidden = true;
        setCtaVisible(true);
    }

    function showComposer() {
        if (layout) {
            layout.hidden = false;
            layout.classList.remove('is-sent');
        }
        if (form) form.hidden = false;
        if (copy) copy.hidden = false;
        if (sentNote) sentNote.hidden = true;
        setCtaVisible(false);
        window.setTimeout(() => {
            form?.querySelector('input[name="name"]')?.focus();
        }, 50);
    }

    function showForm() {
        showComposer();
    }

    function showThanks(hasCard) {
        if (layout) {
            layout.hidden = false;
            layout.classList.add('is-sent');
        }
        if (form) form.hidden = true;
        if (copy) copy.hidden = true;
        if (sentNote) sentNote.hidden = false;
        setCtaVisible(false);
        if (sentLead) {
            sentLead.textContent = hasCard
                ? 'Your quote is above. I also emailed myself a copy. It stays for everyone after I confirm the LinkedIn.'
                : 'I emailed myself a copy. No quote was added because permission was No, or the message had no saved text. Use Write another to send again.';
        }
    }

    function draftFromForm(formEl) {
        const data = new FormData(formEl);
        return {
            name: String(data.get('name') || '').trim(),
            role: String(data.get('role') || '').trim(),
            linkedin: String(data.get('linkedin') || '').trim(),
            project: String(data.get('project') || '').trim(),
            quote: String(data.get('quote') || '').trim(),
            permission: String(data.get('permission') || '').trim(),
            date: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })
        };
    }

    function publishDraft(item) {
        if (!item || !item.quote) return false;
        if (!allowed(item)) return false;
        saveLocalCard(item);
        if (!alreadyRendered(item)) renderCard(item, 'Received');
        setupFeedbackSlider();
        return true;
    }

    fetch('feedback.json')
        .then((res) => (res.ok ? res.json() : []))
        .then((official) => {
            (Array.isArray(official) ? official : []).forEach((item) => renderCard(item, ''));
            readLocalCards().forEach((item) => {
                if (!alreadyRendered(item)) renderCard(item, 'Received');
            });
            setupFeedbackSlider();
        })
        .catch(() => {
            readLocalCards().forEach((item) => renderCard(item, 'Received'));
            setupFeedbackSlider();
        });

    let draft = null;
    try {
        draft = JSON.parse(sessionStorage.getItem('bkFeedbackDraft') || 'null');
    } catch (err) {
        draft = null;
    }

    const sent = new URLSearchParams(window.location.search).get('sent') === '1';
    if (sent) {
        const published = publishDraft(draft);
        if (draft) showThanks(published);
        else hideComposer();
        sessionStorage.removeItem('bkFeedbackDraft');
        history.replaceState({}, '', window.location.pathname + '#feedback');
    }

    if (openBtn) {
        openBtn.addEventListener('click', function () {
            showComposer();
            layout?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            hideComposer();
            document.getElementById('feedback')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        });
    }

    if (againBtn) {
        againBtn.addEventListener('click', function () {
            showForm();
            form?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (!form) return;

    form.addEventListener('submit', function (event) {
        const draftNow = draftFromForm(form);
        sessionStorage.setItem('bkFeedbackDraft', JSON.stringify(draftNow));
        if (window.location.protocol === 'file:') {
            event.preventDefault();
            showThanks(publishDraft(draftNow));
            return;
        }

        event.preventDefault();
        const submitBtn = document.getElementById('feedback-submit');
        if (submitBtn) submitBtn.disabled = true;

        fetch('https://formsubmit.co/ajax/briankylesalor02@gmail.com', {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: new FormData(form)
        })
            .then((res) => {
                if (!res.ok) throw new Error('send failed');
                return res.json().catch(() => ({}));
            })
            .then(() => {
                showThanks(publishDraft(draftNow));
                sessionStorage.removeItem('bkFeedbackDraft');
                document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            })
            .catch(() => {
                form.submit();
            })
            .finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
    });
})();

