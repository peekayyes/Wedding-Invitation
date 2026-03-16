// Curtain reveal animation
document.addEventListener('DOMContentLoaded', () => {
    const curtainOverlay = document.getElementById('curtain-overlay');
    const heart = document.getElementById('curtain-heart');
    const heroSection = document.querySelector('.hero');

    // Hero card hidden until heart departs
    heroSection.classList.add('hero-hidden');

    // Background, particles, data — all start immediately
    document.querySelectorAll('.countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer')
        .forEach(el => el.classList.add('content-visible'));
    document.querySelectorAll('.countdown-luxury .vintage-paper, .events-luxury .vintage-paper, .venue-luxury .vintage-paper, .families-section .vintage-paper, .things-to-know .vintage-paper')
        .forEach(p => p.classList.add('emerged'));
    startCountdown();
    fetchWeather();
    initParticles();
    initPetals();

    // Step 1 — open curtains after 1.5s
    setTimeout(() => {
        curtainOverlay.classList.add('opening');

        // Step 2 — heart flies in (CSS handles it, triggered by 'opening' class removal of heart-hidden)
        heart.classList.add('heart-active');

        // Step 3 — heart soars away after hovering
        setTimeout(() => {
            heart.classList.add('heart-depart');

            // Step 4 — hero card blooms in after heart is gone
            setTimeout(() => {
                curtainOverlay.style.display = 'none';
                heroSection.classList.remove('hero-hidden');
                heroSection.classList.add('hero-bloom');
                document.querySelector('.hero .vintage-paper').classList.add('emerged');
                initTypewriter('"Our hearts were dealt."', 'hero-quote');
                document.body.classList.add('enable-scroll');
                initScrollReveal();
                initParallax();
                initTilt();
            }, 700);
        }, 2800);
    }, 1500);
});

// Countdown Timer with flip animation
function startCountdown() {
    const weddingDate = new Date('2026-04-23T10:30:00').getTime();
    let prev = { days: '', hours: '', minutes: '', seconds: '' };
    
    function flipUpdate(id, value) {
        const el = document.getElementById(id);
        const current = el.querySelector('.flip-current');
        const next = el.querySelector('.flip-next');
        const val = String(value).padStart(2, '0');
        
        if (prev[id] === val) return;
        prev[id] = val;
        
        next.textContent = val;
        el.classList.remove('flipping');
        void el.offsetWidth; // reflow
        el.classList.add('flipping');
        
        setTimeout(() => {
            current.textContent = val;
            el.classList.remove('flipping');
        }, 600);
    }
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelector('.countdown-grid').innerHTML = '<p style="font-size: 2rem; color: #d4af37; grid-column: 1/-1;">The Wedding Day is Here! 🎉</p>';
            return;
        }
        
        flipUpdate('days', Math.floor(distance / (1000 * 60 * 60 * 24)));
        flipUpdate('hours', Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        flipUpdate('minutes', Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        flipUpdate('seconds', Math.floor((distance % (1000 * 60)) / 1000));
    }
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// Weather Information
function fetchWeather() {
    // Kovilpatti coordinates
    const lat = 9.1711;
    const lon = 77.8711;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia/Kolkata`)
        .then(response => response.json())
        .then(data => {
            const temp = Math.round(data.current.temperature_2m);
            const weatherCode = data.current.weather_code;
            const weatherDesc = getWeatherDescription(weatherCode);
            
            document.getElementById('weather-temp').textContent = `${temp}°C`;
            document.getElementById('weather-desc').textContent = weatherDesc;
        })
        .catch(() => {
            document.getElementById('weather-temp').textContent = 'Pleasant Weather Expected';
            document.getElementById('weather-desc').textContent = 'Perfect for celebrations';
        });
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
        61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers'
    };
    return weatherCodes[code] || 'Pleasant Weather';
}

// Smooth scroll for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add keyboard accessibility for interactive elements
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        if (document.activeElement.classList.contains('directions-btn')) {
            e.preventDefault();
            document.activeElement.click();
        }
    }
});

// Gold Floating Particles
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const count = Math.min(40, Math.floor(window.innerWidth / 20));
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedY: -(Math.random() * 0.5 + 0.1),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.2,
            flicker: Math.random() * Math.PI * 2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.flicker += 0.02;
            const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.flicker));
            
            if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.2})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Scroll-triggered reveals with directional entrances
function initScrollReveal() {
    const dirMap = [
        { sel: '.countdown-item', dir: 'reveal-up' },
        { sel: '.event-item:first-child', dir: 'reveal-left' },
        { sel: '.event-item:last-child', dir: 'reveal-right' },
        { sel: '.venue-card', dir: 'reveal-scale' },
        { sel: '.detail-item', dir: 'reveal-up' },
        { sel: '.luxury-footer', dir: 'reveal-up' }
    ];
    
    const targets = [];
    dirMap.forEach(({ sel, dir }) => {
        document.querySelectorAll(sel).forEach(el => {
            el.classList.add('reveal', dir);
            targets.push(el);
        });
    });
    
    // Also add directional reveals to vintage-paper sections (not hero)
    document.querySelectorAll('.countdown-luxury .vintage-paper').forEach(el => {
        el.classList.add('reveal', 'reveal-left');
        targets.push(el);
    });
    document.querySelectorAll('.events-luxury .vintage-paper').forEach(el => {
        el.classList.add('reveal', 'reveal-right');
        targets.push(el);
    });
    document.querySelectorAll('.venue-luxury .vintage-paper').forEach(el => {
        el.classList.add('reveal', 'reveal-up');
        targets.push(el);
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });
    
    targets.forEach(el => observer.observe(el));
}

// Typewriter effect
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
            el.insertBefore(document.createTextNode(text[i]), cursor);
            i++;
            setTimeout(type, 60 + Math.random() * 40);
        } else {
            setTimeout(() => cursor.remove(), 2000);
        }
    }
    setTimeout(type, 500);
}

// Parallax scroll — sections only, not background
function initParallax() {
    const sections = document.querySelectorAll('.countdown-luxury, .events-luxury, .venue-luxury');
    if (!sections.length) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        sections.forEach((sec, i) => {
            const speed = 0.03 + i * 0.01;
            const rect = sec.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                sec.style.transform = `translateY(${(rect.top - window.innerHeight) * speed}px)`;
            }
        });
    }, { passive: true });
}

// 3D tilt on countdown items
function initTilt() {
    document.querySelectorAll('.countdown-item').forEach(item => {
        item.addEventListener('pointermove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            item.style.transform = `perspective(400px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) translateY(-3px)`;
        });
        item.addEventListener('pointerleave', () => {
            item.style.transform = '';
        });
    });
}

// Rose Petals
function initPetals() {
    const canvas = document.getElementById('petals');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const petals = [];
    const count = Math.min(18, Math.floor(window.innerWidth / 40));
    
    for (let i = 0; i < count; i++) {
        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 0.6 + 0.2,
            speedX: (Math.random() - 0.5) * 0.4,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 2,
            wobble: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.3 + 0.15
        });
    }
    
    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.6, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, 'rgba(183, 110, 121, 0.9)');
        grad.addColorStop(1, 'rgba(183, 110, 121, 0.3)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.y += p.speedY;
            p.wobble += 0.02;
            p.x += p.speedX + Math.sin(p.wobble) * 0.3;
            p.rotation += p.rotSpeed;
            
            if (p.y > canvas.height + 20) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
            drawPetal(p);
        });
        requestAnimationFrame(animate);
    }
    
    animate();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
