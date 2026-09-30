/* Smooth scroll (Lenis) + Cuberto mouse-follower cursor */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const desktopMotion = finePointer && canHover && window.matchMedia('(min-width: 1024px)').matches;
    document.documentElement.classList.add('js-ok');

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function setupLenis() {
        if (reduce || typeof Lenis === 'undefined') return;
        const lenis = new Lenis({
            lerp: 0.08,
            smoothWheel: true,
            wheelMultiplier: 0.86,
            touchMultiplier: 1.05
        });
        window.__lenis = lenis;
        document.documentElement.classList.add('lenis', 'lenis-smooth');
        let rafId = 0;
        const loop = (t) => {
            lenis.raf(t);
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            window.__lenis = null;
        });
    }

    function setupCursor() {
        if (typeof MouseFollower === 'undefined' || typeof gsap === 'undefined') return;
        if (!desktopMotion || reduce) return;

        document.querySelectorAll('.js-magnetic').forEach((el) => {
            if (!el.hasAttribute('data-cursor-stick')) {
                el.setAttribute('data-cursor-stick', '');
            }
        });

        document.documentElement.classList.add('has-cursor');
        window.__cursor = new MouseFollower({
            speed: 0.55,
            ease: 'expo.out',
            skewing: 0.8,
            skewingText: 0,
            hideOnLeave: true,
            stateDetection: {
                '-pointer':
                    'a,button,[role="button"],.js-magnetic,.tag,.tech-pill,.win-icon,.feedback-choice,.certificate-image-wrapper,.skill-sheet,.cert-sheet,.tech-meta-item,.win,.skill-filter,.work-archive-row,.footer-social-pill',
                '-text': '.name,.section-title,.project-win-title,.about-headline,.contact-cta-title,.cert-sheet-title,.section-watermark',
                '-hidden': 'iframe,input,textarea,select'
            }
        });
    }

    function setupMagnetic() {
        if (reduce || !desktopMotion) return;
        document.querySelectorAll('.js-magnetic').forEach((el) => {
            let tx = 0;
            let ty = 0;
            let cx = 0;
            let cy = 0;
            let raf = 0;
            const strength = 0.22;
            const tick = () => {
                cx = lerp(cx, tx, 0.16);
                cy = lerp(cy, ty, 0.16);
                el.style.transform = `translate(${cx}px, ${cy}px)`;
                if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.08) {
                    raf = requestAnimationFrame(tick);
                }
            };
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                tx = (e.clientX - (r.left + r.width / 2)) * strength;
                ty = (e.clientY - (r.top + r.height / 2)) * strength;
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(tick);
            });
            el.addEventListener('mouseleave', () => {
                tx = 0;
                ty = 0;
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(tick);
            });
        });
    }

    function setupReveals() {
        const targets = document.querySelectorAll('.js-reveal, .js-stagger');
        if (reduce) {
            targets.forEach((el) => el.classList.add('is-in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        );
        targets.forEach((el) => io.observe(el));
    }

    function setupProgress() {
        const bar = document.querySelector('.scroll-progress-bar');
        if (!bar) return;
        const update = () => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;
            const p = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = `scaleX(${p})`;
        };
        update();
        if (window.__lenis) {
            window.__lenis.on('scroll', update);
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
    }

    function setupPortraitTilt() {
        if (reduce || !desktopMotion) return;
        const frame = document.querySelector('.hero-portrait');
        const img = frame && frame.querySelector('img');
        if (!frame || !img) return;

        let raf = 0;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;

        const tick = () => {
            cx = lerp(cx, tx, 0.12);
            cy = lerp(cy, ty, 0.12);
            img.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg) scale(1.03)`;
            if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.04) {
                raf = requestAnimationFrame(tick);
            }
        };

        frame.addEventListener('mousemove', (e) => {
            const r = frame.getBoundingClientRect();
            tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 5;
            ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * -4;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(tick);
        });
        frame.addEventListener('mouseleave', () => {
            tx = 0;
            ty = 0;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(tick);
        });
    }

    function setupMarqueePause() {
        const tracks = document.querySelectorAll('.studio-marquee-track, .marquee-track');
        if (reduce || !tracks.length) return;
        tracks.forEach((track) => {
            const wrap = track.closest('.studio-marquee, .marquee');
            if (!wrap) return;
            wrap.addEventListener('mouseenter', () => {
                track.style.animationPlayState = 'paused';
            });
            wrap.addEventListener('mouseleave', () => {
                track.style.animationPlayState = 'running';
            });
        });
    }

    function setupSectionGlow() {
        if (reduce || !desktopMotion) return;
        document.querySelectorAll('.has-life').forEach((sec) => {
            sec.addEventListener('mousemove', (e) => {
                const r = sec.getBoundingClientRect();
                sec.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                sec.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
            });
        });
    }

    function setupScrollLife() {
        if (reduce || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);
        if (window.__lenis) {
            window.__lenis.on('scroll', ScrollTrigger.update);
        }

        gsap.utils.toArray('.life-orb').forEach((orb, i) => {
            gsap.to(orb, {
                y: i % 2 === 0 ? 220 : -180,
                x: i === 1 ? 120 : -70,
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1.4
                }
            });
        });

        gsap.utils.toArray('.section-watermark').forEach((mark) => {
            gsap.fromTo(
                mark,
                { y: 40, opacity: 0.2 },
                {
                    y: -80,
                    opacity: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: mark.parentElement,
                        start: 'top 85%',
                        end: 'bottom top',
                        scrub: 1.1
                    }
                }
            );
        });

        const year = document.querySelector('.experience-year');
        if (year) {
            gsap.fromTo(
                year,
                { y: 28, opacity: 0.35 },
                {
                    y: 0,
                    opacity: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: year,
                        start: 'top 90%',
                        end: 'top 40%',
                        scrub: 0.8
                    }
                }
            );
        }
    }

    function setupHeroGlow() {
        if (reduce || !desktopMotion) return;
        const hero = document.querySelector('.hero');
        const glow = document.querySelector('.hero-glow');
        if (!hero || !glow) return;
        let raf = 0;
        hero.addEventListener('mousemove', (e) => {
            const r = hero.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                glow.style.setProperty('--gx', `${x}%`);
                glow.style.setProperty('--gy', `${y}%`);
            });
        });
    }

    function setupWinTilt() {
        if (reduce || !desktopMotion) return;
        document.querySelectorAll('.win:not(.work-index-frame)').forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width - 0.5) * 3;
                const y = ((e.clientY - r.top) / r.height - 0.5) * -2.5;
                el.style.transform = `perspective(1200px) rotateX(${y}deg) rotateY(${x}deg) translateY(-3px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    function setupExperienceRail() {
        const items = document.querySelectorAll('.experience-item--rail');
        if (!items.length) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle('is-active', entry.isIntersecting);
                });
            },
            { threshold: 0.35, rootMargin: '-12% 0px -35% 0px' }
        );
        items.forEach((el) => io.observe(el));
    }

    function setupSkillFilter() {
        const filters = document.querySelectorAll('.skill-filter');
        const sheets = document.querySelectorAll('.skill-sheet[data-skill]');
        const rows = document.querySelectorAll('.tech-meta-row[data-group]');
        if (!filters.length || !sheets.length) return;
        filters.forEach((btn) => {
            btn.addEventListener('click', () => {
                const next = btn.getAttribute('data-filter');
                filters.forEach((other) => {
                    const on = other === btn;
                    other.classList.toggle('is-on', on);
                    other.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
                sheets.forEach((sheet) => {
                    const key = sheet.getAttribute('data-skill');
                    const match =
                        next === 'all' ||
                        key === next ||
                        ((next === 'backend' || next === 'database') && key === 'shipped');
                    sheet.classList.toggle('is-dim', !match);
                });
                rows.forEach((row) => {
                    const group = row.getAttribute('data-group');
                    const match = next !== 'backend' && next !== 'database' || group === next;
                    row.classList.toggle('is-dim', !match);
                });
            });
        });
    }

    function setupWorkIndex() {
        const stageImg = document.getElementById('work-index-img');
        const stageUrl = document.getElementById('work-index-url');
        const rows = document.querySelectorAll('.work-index-list .project-row');
        if (!stageImg || !rows.length) return;

        const activate = (row) => {
            const img = row.querySelector('.win-body img');
            const url = row.querySelector('.win-url');
            rows.forEach((other) => other.classList.toggle('is-on', other === row));
            if (img) {
                stageImg.src = img.getAttribute('src') || img.src;
            }
            if (url && stageUrl) {
                stageUrl.textContent = url.textContent.trim();
            }
        };

        rows.forEach((row) => {
            row.addEventListener('mouseenter', () => activate(row));
            row.addEventListener('focusin', () => activate(row));
        });
        activate(rows[0]);
    }

    function setupWorkRail() {
        const list = document.querySelector('.work-index-list');
        if (!list) return;
        const slides = Array.prototype.slice.call(list.querySelectorAll(':scope > .project-row'));
        const now = document.querySelector('[data-work-now]');
        const bar = document.querySelector('[data-work-progress]');
        const prev = document.querySelector('[data-work-prev]');
        const next = document.querySelector('[data-work-next]');
        if (!slides.length) return;

        const slideStep = () => {
            const first = slides[0];
            const gap = parseFloat(window.getComputedStyle(list).columnGap || window.getComputedStyle(list).gap) || 0;
            return first.getBoundingClientRect().width + gap;
        };

        const currentIndex = () => {
            const step = slideStep();
            if (step <= 0) return 0;
            return Math.min(slides.length - 1, Math.max(0, Math.round(list.scrollLeft / step)));
        };

        const update = () => {
            const i = currentIndex();
            const max = list.scrollWidth - list.clientWidth;
            if (now) now.textContent = String(i + 1).padStart(2, '0');
            if (bar) {
                const p = max > 0 ? list.scrollLeft / max : 0;
                bar.style.transform = 'scaleX(' + Math.max(0.12, p) + ')';
            }
            slides.forEach((slide, idx) => slide.classList.toggle('is-on', idx === i));
            if (prev) prev.disabled = i <= 0;
            if (next) next.disabled = i >= slides.length - 1;
        };

        const go = (dir) => {
            list.scrollBy({ left: dir * slideStep(), behavior: reduce ? 'auto' : 'smooth' });
        };

        list.addEventListener('scroll', update, { passive: true });
        if (prev) prev.addEventListener('click', () => go(-1));
        if (next) next.addEventListener('click', () => go(1));
        window.addEventListener('resize', update, { passive: true });
        update();
    }

    setupLenis();
    setupCursor();
    setupMagnetic();
    setupReveals();
    setupProgress();
    setupPortraitTilt();
    setupHeroGlow();
    setupWinTilt();
        setupWorkIndex();
        setupWorkRail();
    setupExperienceRail();
    setupSkillFilter();
    setupMarqueePause();
    setupSectionGlow();
    setupScrollLife();
})();
