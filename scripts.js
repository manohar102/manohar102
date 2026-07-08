// Custom Cursor: Dot and trailing Ring
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

if (cursorDot && cursorRing) {
    // Initial position to avoid flying in from top-left
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
    ringX = mouseX;
    ringY = mouseY;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Dot moves instantly
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth follow with lerp for the ring
    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Grow ring on interactive elements
    document.querySelectorAll('a, button, .timeline-item, .blog-entry, .skills-category, .filter-btn, .dt-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('halo-active'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('halo-active'));
    });

    // Hide cursors when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
    });
}

// Floating elements animation
const shapes = document.querySelectorAll('.floating-shape');

shapes.forEach((shape, index) => {
    shape.style.animationDelay = `${index * 2}s`;
    shape.style.left = `${20 + index * 25}%`;
    shape.style.top = `${20 + index * 15}%`;
});



// Smooth scrolling for navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const url = new URL(link.href);
        if (url.pathname === window.location.pathname) {
            if (url.hash) {
                e.preventDefault();
                const targetId = url.hash.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
});

// Update active nav link based on URL and scroll
function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    let isHashActive = false;

    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id], .hero[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll(`.nav-link`).forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href*="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                isHashActive = true;
            }
        }
    });

    if (!isHashActive) {
        document.querySelectorAll(`.nav-link`).forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPath || (currentPath === 'index.html' && linkHref === '#home')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

window.addEventListener('scroll', setActiveNavLink);
window.addEventListener('DOMContentLoaded', setActiveNavLink);

// Scroll-reveal animation for elements
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.project-row, .blog-card, .skills-category');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

window.addEventListener('DOMContentLoaded', initScrollReveal);

// ============================================
// CLI Intro — terminal-style "about me" before the hero.
// Plays once per browser tab (sessionStorage). Respects
// prefers-reduced-motion. Aborts if the user navigates away.
// ============================================
(function initCliIntro() {
    const intro = document.getElementById('cli-intro');
    if (!intro) return;

    const cmdEl = document.getElementById('cli-cmd');
    const caretEl = document.getElementById('cli-caret');
    const outputEl = document.getElementById('cli-output');
    const doneEl = document.getElementById('cli-done');

    const COMMAND = 'about me';
    const BIO_LINES = [
        'I build intelligent systems at scale.',
        'GenAI, full-stack, distributed systems.',
        'Passionate about AI, robotics,',
        'and making complex problems simple.'
    ];

    const CHAR_DELAY_CMD = 45;   // ms per char while typing the command
    const CHAR_DELAY_BIO = 22;   // ms per char while typing bio lines
    const ENTER_DELAY = 220;     // pause after command finishes
    const DONE_HOLD = 700;       // hold the last bio line before showing the final prompt
    const EXIT_HOLD = 900;       // hold the final prompt before fading out
    const STORAGE_KEY = 'cli-played';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) === '1';

    // Bail paths: reduced motion or already played in this tab.
    if (reduceMotion || alreadyPlayed) {
        return; // hero shows normally via existing animations
    }

    // Engage the intro. We do this on the next frame so the
    // .cli-intro opacity transition actually runs.
    document.body.classList.add('intro-active');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        // no-op: just a guarantee the styles apply before typing starts
    }));

    let aborted = false;
    let activeTimer = null;
    function setTimer(fn, ms) {
        if (aborted) return;
        activeTimer = setTimeout(() => {
            activeTimer = null;
            fn();
        }, ms);
    }
    function clearActiveTimer() {
        if (activeTimer) {
            clearTimeout(activeTimer);
            activeTimer = null;
        }
    }

    // Abort if the tab is hidden or the page is being torn down.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') aborted = true;
    });
    window.addEventListener('pagehide', () => { aborted = true; });

    function sleep(ms) {
        return new Promise(resolve => setTimer(resolve, ms));
    }

    async function typeInto(el, text, perCharMs) {
        for (let i = 0; i < text.length; i++) {
            if (aborted) return false;
            el.textContent += text[i];
            await sleep(perCharMs);
        }
        return true;
    }

    async function typeBioLine(text) {
        const line = document.createElement('div');
        line.className = 'cli-line';
        const prompt = document.createElement('span');
        prompt.className = 'cli-prompt';
        prompt.textContent = '>';
        const body = document.createElement('span');
        line.appendChild(prompt);
        line.appendChild(document.createTextNode(' '));
        line.appendChild(body);
        outputEl.appendChild(line);
        const ok = await typeInto(body, text, CHAR_DELAY_BIO);
        return ok;
    }

    function finish() {
        if (aborted) return;
        sessionStorage.setItem(STORAGE_KEY, '1');
        clearActiveTimer();
        intro.classList.add('fading');
        const onEnd = (e) => {
            if (e && e.propertyName && e.propertyName !== 'opacity') return;
            intro.removeEventListener('transitionend', onEnd);
            intro.style.display = 'none';
            document.body.classList.remove('intro-active');
        };
        intro.addEventListener('transitionend', onEnd);
        // Safety net: ensure finish() always runs even if transitionend
        // doesn't fire (e.g. reduced motion flip mid-sequence).
        setTimer(() => onEnd({ propertyName: 'opacity' }), 600);
    }

    async function run() {
        if (aborted) return;

        // 1. Type the command.
        const okCmd = await typeInto(cmdEl, COMMAND, CHAR_DELAY_CMD);
        if (!okCmd) return;

        // 2. Press enter — hide the command caret.
        await sleep(ENTER_DELAY);
        if (aborted) return;
        if (caretEl) caretEl.style.visibility = 'hidden';

        // 3. Type each bio line.
        for (const line of BIO_LINES) {
            if (aborted) return;
            const ok = await typeBioLine(line);
            if (!ok) return;
        }

        // 4. Hold, then reveal the final blinking prompt.
        await sleep(DONE_HOLD);
        if (aborted) return;
        doneEl.hidden = false;

        // 5. Hold, then fade out and reveal the hero.
        await sleep(EXIT_HOLD);
        if (aborted) return;
        finish();
    }

    // Tiny delay so the user perceives the terminal "settling in"
    // before typing starts.
    setTimer(run, 350);
})();

// ============================================
// Theme: system default + manual toggle
// ============================================
(function initTheme() {
    const KEY = 'theme-pref';
    const root = document.documentElement;

    function currentPref() {
        try { return localStorage.getItem(KEY) || 'system'; }
        catch (e) { return 'system'; }
    }

    function applyTheme(pref) {
        if (pref === 'light' || pref === 'dark') {
            root.setAttribute('data-theme', pref);
        } else {
            root.removeAttribute('data-theme');
        }
    }

    // The pre-paint script in <head> already set data-theme from
    // the stored pref + OS preference. Sync up in case the OS theme
    // changed between head and DOMContentLoaded.
    if (currentPref() === 'system') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (dark) root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
    }

    // Toggle button: cycle light → dark → system → light.
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        let pressTimer = null;

        const cycle = () => {
            const cur = currentPref();
            const next = cur === 'light' ? 'dark'
                       : cur === 'dark'  ? 'system'
                       :                    'light';
            try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
            applyTheme(next);
        };

        const resetSystem = () => {
            try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
            applyTheme('system');
        };

        btn.addEventListener('click', cycle);

        // Long-press (650ms) to reset to system.
        btn.addEventListener('pointerdown', () => {
            pressTimer = setTimeout(resetSystem, 650);
        });
        ['pointerup', 'pointerleave', 'pointercancel', 'pointerout'].forEach(ev => {
            btn.addEventListener(ev, () => {
                if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
            });
        });
    }

    // React to OS theme changes only when user is on 'system'.
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) {
        mq.addEventListener('change', () => {
            if (currentPref() === 'system') applyTheme('system');
        });
    }
})();
