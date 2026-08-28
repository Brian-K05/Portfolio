/* Emergent-style motion: Lenis, cursor, magnetic, parallax, reveals */
(function () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function setupLenis() {
        if (reduce || typeof Lenis === 'undefined') return;
        const lenis = new Lenis({
            lerp: 0.09,
            smoothWheel: true,
            wheelMultiplier: 0.95
        });
        window.__lenis = lenis;
        document.documentElement.classList.add('lenis');
        let rafId;
        const loop = (t) => {
            lenis.raf(t);
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        lenis.on('scroll', () => {
            document.dispatchEvent(new Event('portfolio:scroll'));
        });
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            window.__lenis = null;
        });
    }

    function setupCursor() {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring || !finePointer || reduce) return;
        document.documentElement.classList.add('has-cursor');
        let x = -80;
        let y = -80;
        let rx = -80;
        let ry = -80;
        window.addEventListener(
            'mousemove',
            (e) => {
                x = e.clientX;
                y = e.clientY;
            },
            { passive: true }
        );
        window.addEventListener(
            'mouseover',
            (e) => {
                ring.classList.toggle('is-hover', !!e.target.closest('a, button, [role="button"], .js-magnetic'));
            },
            { passive: true }
        );
        const tick = () => {
            rx = lerp(rx, x, 0.18);
            ry = lerp(ry, y, 0.18);
            dot.style.transform = `translate(${x}px, ${y}px)`;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function setupMagnetic() {
        if (reduce || !finePointer) return;
        document.querySelectorAll('.js-magnetic').forEach((el) => {
            let tx = 0;
            let ty = 0;
            let cx = 0;
            let cy = 0;
            let raf = 0;
            const strength = 0.32;
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

    function setupHeroParallax() {
        const hero = document.querySelector('.hero');
        const text = hero && hero.querySelector('.hero-content');
        const image = hero && hero.querySelector('.hero-image');
        if (!hero || !text || !image || reduce) return;
        const update = () => {
            const r = hero.getBoundingClientRect();
            const h = hero.offsetHeight || 1;
            const p = Math.min(1, Math.max(0, -r.top / h));
            text.style.transform = `translate3d(0, ${p * -70}px, 0)`;
            image.style.transform = `translate3d(0, ${p * 130}px, 0)`;
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        document.addEventListener('portfolio:scroll', update);
    }

    function setupProjectScroll() {
        return;
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
    setupHeroParallax();
    setupProjectScroll();
    setupReveals();
    setupMarqueePause();
})();
