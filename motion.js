/* Smooth scroll (Lenis) + Cuberto mouse-follower cursor */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
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
        if (!finePointer || !canHover || reduce) return;

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
                    'a,button,[role="button"],.js-magnetic,.tag,.tech-pill,.win-icon,.feedback-choice,.certificate-image-wrapper,.skill-sheet,.cert-sheet,.tech-meta-item,.win',
                '-text': '.name,.section-title,.project-win-title,.about-headline,.contact-cta-title,.cert-sheet-title',
                '-hidden': 'iframe,input,textarea,select'
            }
        });
    }

    function setupMagnetic() {
        if (reduce || !finePointer) return;
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
        if (reduce || !finePointer || !canHover) return;
        if (!window.matchMedia('(min-width: 1024px)').matches) return;
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
            tx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 10;
            ty = ((e.clientY - (r.top + r.height / 2)) / r.height) * -8;
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
        const track = document.querySelector('.marquee-track');
        if (!track || reduce) return;
        const wrap = track.closest('.marquee');
        wrap.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        wrap.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    }

    setupLenis();
    setupCursor();
    setupMagnetic();
    setupReveals();
    setupProgress();
    setupPortraitTilt();
    setupMarqueePause();
})();
