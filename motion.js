/* Smooth scroll (Lenis) + Cuberto mouse-follower cursor */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;

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
                    'a,button,[role="button"],.js-magnetic,.tag,.tech-pill,.win-icon,.feedback-choice,.certificate-image-wrapper,.certificate-featured',
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
        if (reduce) {
            document.querySelectorAll('.js-reveal').forEach((el) => el.classList.add('is-in'));
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
        document.querySelectorAll('.js-reveal').forEach((el) => io.observe(el));
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
    setupMarqueePause();
})();
