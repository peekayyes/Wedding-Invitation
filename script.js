gsap.registerPlugin(ScrollTrigger);

// Shared state
let particlesRAF = null;
let petalsRAF = null;
let paused = false;

document.addEventListener('DOMContentLoaded', () => {
    startCountdown();
    fetchWeather();
    initParticles();
    initPetals();
    initCurtainSequence();
    initVisibilityPause();
});

// ── Pause canvas loops when tab is hidden ──────────────────────────────────
function initVisibilityPause() {
    document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
        if (!paused) {
            if (particlesRAF === 'paused') particlesRAF = requestAnimationFrame(particlesLoop);
            if (petalsRAF === 'paused') petalsRAF = requestAnimationFrame(petalsLoop);
        }
    });
}

// ── Debounced resize ───────────────────────────────────────────────────────
let resizeTimer;
const resizeCallbacks = [];
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resizeCallbacks.forEach(fn => fn()), 150);
});

// ── Curtain → Heart → Hero bloom sequence ──────────────────────────────────
function initCurtainSequence() {
    const overlay   = document.getElementById('curtain-overlay');
    const heart     = document.getElementById('curtain-heart');
    const hero      = document.querySelector('.hero');
    const wingLeft  = document.querySelector('.wing-left');
    const wingRight = document.querySelector('.wing-right');
    const heartBody = document.querySelector('.heart-body');

    // Kill CSS animations — GSAP takes over
    [wingLeft, wingRight, heartBody].forEach(el => el.style.animation = 'none');

    gsap.set(hero, { opacity: 0 });
    gsap.set(heart, { opacity: 0, scale: 0.3, xPercent: -50, yPercent: -50, x: 0, y: 80 });

    const tapPrompt = document.getElementById('curtain-tap');

    // Wait for user tap
    function startReveal() {
        tapPrompt.removeEventListener('click', startReveal);
        overlay.removeEventListener('click', startReveal);

        // Fade out tap prompt
        gsap.to(tapPrompt, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power2.in', onComplete: () => tapPrompt.style.display = 'none' });

        runCurtainTimeline();
    }

    tapPrompt.addEventListener('click', startReveal);
    overlay.addEventListener('click', startReveal);

    function runCurtainTimeline() {
    let wingTweens = [];
    const tl = gsap.timeline();

    // 1 — curtains open + rod/valance exit
    tl.to('.curtain-left',  { x: '-100%', duration: 2.8, ease: 'power3.inOut' }, 0)
      .to('.curtain-right', { x:  '100%', duration: 2.8, ease: 'power3.inOut' }, 0)
      .to('.curtain-rod', { y: -50, opacity: 0, duration: 1.4, ease: 'power2.inOut' }, 0.3)
      .to('.curtain-valance', { y: -60, opacity: 0, duration: 1.6, ease: 'power2.inOut' }, 0.1);

    // 2 — heart arrives
    tl.to(heart, {
        opacity: 1, scale: 1, y: 0,
        duration: 1.4,
        ease: 'back.out(1.8)'
    }, 0.3);

    // 3 — wings flap
    tl.add(() => {
        wingTweens.push(
            gsap.to(wingLeft,  { scaleY: 0.6, rotation: -5, duration: 0.45, ease: 'power1.inOut', yoyo: true, repeat: -1, transformOrigin: '158px 105px' }),
            gsap.to(wingRight, { scaleY: 0.6, rotation:  5, duration: 0.45, ease: 'power1.inOut', yoyo: true, repeat: -1, transformOrigin: '182px 105px' }),
            gsap.to(heartBody, { y: -10, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '170px 115px' })
        );
    }, 1.2);

    // 4 — heart departs
    tl.add(() => {
        wingTweens.forEach(t => t.kill());
        wingTweens = [];
    }, 2.8);
    tl.to(heart, {
        y: -280, scale: 0.1, opacity: 0,
        duration: 0.9,
        ease: 'power2.in'
    }, 2.8);

    // 5 — hide overlay, show hero
    tl.add(() => {
        overlay.style.display = 'none';
        document.body.classList.add('enable-scroll');
    }, 3.5);

    tl.to(hero, {
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out'
    }, 3.5);

    // 6 — hero paper
    tl.to('.hero .vintage-paper', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
    }, 3.7);

    // 7 — hero content
    tl.from('.hero .paper-content > *', {
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out'
    }, 3.9);

    // 8 — typewriter + scroll reveals
    tl.add(() => {
        initTypewriter('"Our hearts were dealt."', 'hero-quote');
        initScrollReveal();
        initTilt();
    }, 6.2 - 1.5);
    } // end runCurtainTimeline
}

// ── Scroll reveals with GSAP ScrollTrigger ─────────────────────────────────
function initScrollReveal() {
    gsap.set('.countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer', { opacity: 1 });

    gsap.utils.toArray('.section-heading').forEach(el => {
        gsap.from(el, {
            opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    gsap.set('.countdown-item', { opacity: 1, y: 0, scale: 1 });
    gsap.from('.countdown-item', {
        opacity: 0, y: 40, scale: 0.9, duration: 0.6, stagger: 0.1,
        ease: 'back.out(1.4)', clearProps: 'all',
        scrollTrigger: { trigger: '.countdown-grid', start: 'top 85%', toggleActions: 'play none none none' }
    });

    gsap.utils.toArray('.events-timeline .event-item').forEach((el, i) => {
        gsap.from(el, {
            opacity: 0, x: i % 2 === 0 ? -60 : 60, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' }
        });
    });

    gsap.from('.venue-card', {
        opacity: 0, scale: 0.88, y: 30, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.venue-card', start: 'top 80%', toggleActions: 'play none none none' }
    });

    gsap.from('.detail-item', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '.venue-details', start: 'top 82%', toggleActions: 'play none none none' }
    });

    gsap.utils.toArray('.family-card').forEach((el, i) => {
        gsap.from(el, {
            opacity: 0, x: i % 2 === 0 ? -50 : 50, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' }
        });
    });

    gsap.utils.toArray('.info-grid .event-item').forEach((el, i) => {
        gsap.from(el, {
            opacity: 0, y: 60, rotation: i % 2 === 0 ? -1.5 : 1.5, duration: 0.85, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    gsap.from('.luxury-footer', {
        opacity: 0, y: 40, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: '.luxury-footer', start: 'top 90%', toggleActions: 'play none none none' }
    });

    gsap.from('.footer-hearts', {
        opacity: 0, scale: 0.5, duration: 0.8, ease: 'back.out(2)',
        scrollTrigger: { trigger: '.luxury-footer', start: 'top 88%', toggleActions: 'play none none none' }
    });
}

// ── Countdown Timer ─────────────────────────────────────────────────────────
function startCountdown() {
    const weddingDate = new Date('2026-04-23T10:30:00').getTime();
    let prev = { days: '', hours: '', minutes: '', seconds: '' };

    function flipUpdate(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        const current = el.querySelector('.flip-current');
        if (!current) return;
        const val = String(value).padStart(2, '0');
        if (prev[id] === val) return;
        prev[id] = val;

        gsap.timeline()
            .to(current, { opacity: 0, y: -8, duration: 0.18, ease: 'power1.in' })
            .set(current, { textContent: val })
            .to(current, { opacity: 1, y: 0, duration: 0.22, ease: 'power1.out' });

        const item = el.closest('.countdown-item');
        if (item) {
            gsap.fromTo(item,
                { boxShadow: '0 4px 15px rgba(0,0,0,0.15)' },
                { boxShadow: '0 0 22px 4px rgba(212,175,55,0.45)', duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }
            );
        }
    }

    function updateCountdown() {
        const distance = weddingDate - Date.now();
        if (distance < 0) {
            clearInterval(interval);
            const grid = document.querySelector('.countdown-grid');
            if (grid) grid.innerHTML = '<p style="font-size:2rem;color:#d4af37;grid-column:1/-1;">The Wedding Day is Here! 🎉</p>';
            return;
        }
        flipUpdate('days',    Math.floor(distance / 86400000));
        flipUpdate('hours',   Math.floor((distance % 86400000) / 3600000));
        flipUpdate('minutes', Math.floor((distance % 3600000)  / 60000));
        flipUpdate('seconds', Math.floor((distance % 60000)    / 1000));
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
}

// ── Weather ─────────────────────────────────────────────────────────────────
function fetchWeather() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=9.1711&longitude=77.8711&current=temperature_2m,weather_code&timezone=Asia/Kolkata')
        .then(r => r.json())
        .then(data => {
            document.getElementById('weather-temp').textContent = `${Math.round(data.current.temperature_2m)}°C`;
            document.getElementById('weather-desc').textContent = getWeatherDescription(data.current.weather_code);
        })
        .catch(() => {
            document.getElementById('weather-temp').textContent = 'Pleasant Weather Expected';
            document.getElementById('weather-desc').textContent = 'Perfect for celebrations';
        });
}

function getWeatherDescription(code) {
    const map = { 0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Foggy',
        51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',
        80:'Light Showers',81:'Showers',82:'Heavy Showers' };
    return map[code] || 'Pleasant Weather';
}

// ── Typewriter ───────────────────────────────────────────────────────────────
function initTypewriter(text, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);
    let i = 0;
    function type() {
        if (i < text.length) {
            el.insertBefore(document.createTextNode(text[i++]), cursor);
            setTimeout(type, 60 + Math.random() * 40);
        } else {
            setTimeout(() => cursor.remove(), 2000);
        }
    }
    setTimeout(type, 500);
}

// ── 3D tilt + hover lifts ────────────────────────────────────────────────────
function initTilt() {
    document.querySelectorAll('.countdown-item').forEach(item => {
        item.addEventListener('pointermove', (e) => {
            const r = item.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            gsap.to(item, { rotateY: x * 18, rotateX: -y * 18, translateY: -4,
                duration: 0.3, ease: 'power1.out', transformPerspective: 500 });
        });
        item.addEventListener('pointerleave', () => {
            gsap.to(item, { rotateY: 0, rotateX: 0, translateY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    });

    document.querySelectorAll('.event-item').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -10, boxShadow: '0 20px 50px rgba(212,175,55,0.35)', duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', duration: 0.5, ease: 'elastic.out(1, 0.6)' });
        });
    });

    document.querySelectorAll('.family-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -6, scale: 1.02, duration: 0.3, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
        });
    });
}

// ── Gold Particles ──────────────────────────────────────────────────────────
let particlesCtx, particlesCanvas, particles;

function initParticles() {
    particlesCanvas = document.getElementById('particles');
    if (!particlesCanvas) return;
    particlesCtx = particlesCanvas.getContext('2d');

    function resize() { particlesCanvas.width = window.innerWidth; particlesCanvas.height = window.innerHeight; }
    resize();
    resizeCallbacks.push(resize);

    const count = Math.min(25, Math.floor(window.innerWidth / 40));
    particles = Array.from({ length: count }, () => ({
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        size: Math.random() * 2.5 + 0.8,
        speedY: -(Math.random() * 0.45 + 0.08),
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.5 + 0.2,
        flicker: Math.random() * Math.PI * 2
    }));

    particlesRAF = requestAnimationFrame(particlesLoop);
}

function particlesLoop() {
    if (paused) { particlesRAF = 'paused'; return; }
    const ctx = particlesCtx, c = particlesCanvas;
    ctx.clearRect(0, 0, c.width, c.height);
    particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.flicker += 0.025;
        const alpha = p.opacity * (0.55 + 0.45 * Math.sin(p.flicker));

        if (p.y < -10) { p.y = c.height + 10; p.x = Math.random() * c.width; }
        if (p.x < -10) p.x = c.width + 10;
        if (p.x > c.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${alpha * 0.15})`;
        ctx.fill();
    });
    particlesRAF = requestAnimationFrame(particlesLoop);
}

// ── Rose Petals ──────────────────────────────────────────────────────────────
let petalsCtx, petalsCanvas, petals;

function initPetals() {
    petalsCanvas = document.getElementById('petals');
    if (!petalsCanvas) return;
    petalsCtx = petalsCanvas.getContext('2d');

    function resize() { petalsCanvas.width = window.innerWidth; petalsCanvas.height = window.innerHeight; }
    resize();
    resizeCallbacks.push(resize);

    const count = Math.min(10, Math.floor(window.innerWidth / 80));
    petals = Array.from({ length: count }, () => ({
        x: Math.random() * petalsCanvas.width,
        y: Math.random() * petalsCanvas.height - petalsCanvas.height,
        size: Math.random() * 9 + 4,
        speedY: Math.random() * 0.55 + 0.18,
        speedX: (Math.random() - 0.5) * 0.35,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.8,
        wobble: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.28 + 0.12
    }));

    petalsRAF = requestAnimationFrame(petalsLoop);
}

function petalsLoop() {
    if (paused) { petalsRAF = 'paused'; return; }
    const ctx = petalsCtx, c = petalsCanvas;
    ctx.clearRect(0, 0, c.width, c.height);
    petals.forEach(p => {
        p.y += p.speedY;
        p.wobble += 0.018;
        p.x += p.speedX + Math.sin(p.wobble) * 0.28;
        p.rotation += p.rotSpeed;
        if (p.y > c.height + 20) { p.y = -20; p.x = Math.random() * c.width; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo( p.size * 0.8, -p.size * 0.5,  p.size * 0.6,  p.size * 0.5, 0,  p.size);
        ctx.bezierCurveTo(-p.size * 0.6,  p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        g.addColorStop(0, 'rgba(183,110,121,0.9)');
        g.addColorStop(1, 'rgba(183,110,121,0.2)');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
    });
    petalsRAF = requestAnimationFrame(petalsLoop);
}

// ── Smooth anchor scroll ─────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
});
