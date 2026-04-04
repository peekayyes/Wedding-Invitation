var isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

if (isMobile) {
    // ── MOBILE: Skip everything heavy, just show content ──
    document.addEventListener('DOMContentLoaded', function() {
        // Hide canvases
        var particles = document.getElementById('particles');
        var petals = document.getElementById('petals');
        if (particles) particles.style.display = 'none';
        if (petals) petals.style.display = 'none';

        // Show all sections immediately
        var sections = document.querySelectorAll('.hero, .countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer');
        for (var i = 0; i < sections.length; i++) {
            sections[i].style.opacity = '1';
        }
        var papers = document.querySelectorAll('.vintage-paper');
        for (var i = 0; i < papers.length; i++) {
            papers[i].style.opacity = '1';
        }

        // Curtain: tap to just remove it
        var overlay = document.getElementById('curtain-overlay');
        var tapPrompt = document.getElementById('curtain-tap');

        function openCurtain() {
            if (overlay) overlay.style.display = 'none';
            document.body.classList.add('enable-scroll');
        }

        if (tapPrompt) tapPrompt.addEventListener('click', openCurtain);
        if (overlay) overlay.addEventListener('click', openCurtain);

        // Quote
        var quote = document.getElementById('hero-quote');
        if (quote) quote.textContent = '"Our hearts were dealt."';

        // Countdown
        startCountdownSimple();
        fetchWeather();
    });

    function startCountdownSimple() {
        var weddingDate = new Date('2026-04-23T10:30:00').getTime();
        function update() {
            var d = weddingDate - Date.now();
            if (d < 0) {
                var grid = document.querySelector('.countdown-grid');
                if (grid) grid.innerHTML = '<p style="font-size:2rem;color:#d4af37;grid-column:1/-1;">The Wedding Day is Here! 🎉</p>';
                return;
            }
            var el;
            el = document.querySelector('#days .flip-current'); if (el) el.textContent = String(Math.floor(d / 86400000)).padStart(2, '0');
            el = document.querySelector('#hours .flip-current'); if (el) el.textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0');
            el = document.querySelector('#minutes .flip-current'); if (el) el.textContent = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
            el = document.querySelector('#seconds .flip-current'); if (el) el.textContent = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
        }
        update();
        setInterval(update, 1000);
    }

} else {
    // ── DESKTOP: Full GSAP experience ──
    try { gsap.registerPlugin(ScrollTrigger); } catch(e) {}

    var particlesRAF = null, petalsRAF = null, paused = false;
    var resizeTimer, resizeCallbacks = [];
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() { resizeCallbacks.forEach(function(fn) { fn(); }); }, 150);
    });

    document.addEventListener('DOMContentLoaded', function() {
        try {
            startCountdown();
            fetchWeather();
            initParticles();
            initPetals();
            initCurtainSequence();
            initVisibilityPause();
        } catch(e) {
            document.body.classList.add('enable-scroll');
            document.querySelectorAll('.hero, .countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer')
                .forEach(function(el) { el.style.opacity = '1'; });
            var ov = document.getElementById('curtain-overlay');
            if (ov) ov.style.display = 'none';
        }
    });

    function initVisibilityPause() {
        document.addEventListener('visibilitychange', function() {
            paused = document.hidden;
            if (!paused) {
                if (particlesRAF === 'paused') particlesRAF = requestAnimationFrame(particlesLoop);
                if (petalsRAF === 'paused') petalsRAF = requestAnimationFrame(petalsLoop);
            }
        });
    }

    function initCurtainSequence() {
        var overlay = document.getElementById('curtain-overlay');
        var heart = document.getElementById('curtain-heart');
        var hero = document.querySelector('.hero');
        var tapPrompt = document.getElementById('curtain-tap');
        if (!overlay || !heart || !hero) return;

        var wingLeft = document.querySelector('.wing-left');
        var wingRight = document.querySelector('.wing-right');
        var heartBody = document.querySelector('.heart-body');
        if (wingLeft) wingLeft.style.animation = 'none';
        if (wingRight) wingRight.style.animation = 'none';
        if (heartBody) heartBody.style.animation = 'none';

        gsap.set(hero, { opacity: 0 });
        gsap.set(heart, { opacity: 0, scale: 0.3, xPercent: -50, yPercent: -50, x: 0, y: 80 });

        function startReveal() {
            if (tapPrompt) {
                tapPrompt.removeEventListener('click', startReveal);
                gsap.to(tapPrompt, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power2.in', onComplete: function() { tapPrompt.style.display = 'none'; } });
            }
            overlay.removeEventListener('click', startReveal);
            runTimeline();
        }

        if (tapPrompt) tapPrompt.addEventListener('click', startReveal);
        overlay.addEventListener('click', startReveal);

        function runTimeline() {
            var wingTweens = [];
            var tl = gsap.timeline();

            tl.to('.curtain-left', { x: '-100%', duration: 2.8, ease: 'power3.inOut' }, 0)
              .to('.curtain-right', { x: '100%', duration: 2.8, ease: 'power3.inOut' }, 0)
              .to('.curtain-rod', { y: -50, opacity: 0, duration: 1.4, ease: 'power2.inOut' }, 0.3)
              .to('.curtain-valance', { y: -60, opacity: 0, duration: 1.6, ease: 'power2.inOut' }, 0.1);

            tl.to(heart, { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: 'back.out(1.8)' }, 0.3);

            tl.add(function() {
                if (wingLeft) wingTweens.push(gsap.to(wingLeft, { scaleY: 0.6, rotation: -5, duration: 0.45, ease: 'power1.inOut', yoyo: true, repeat: -1, transformOrigin: '158px 105px' }));
                if (wingRight) wingTweens.push(gsap.to(wingRight, { scaleY: 0.6, rotation: 5, duration: 0.45, ease: 'power1.inOut', yoyo: true, repeat: -1, transformOrigin: '182px 105px' }));
                if (heartBody) wingTweens.push(gsap.to(heartBody, { y: -10, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '170px 115px' }));
            }, 1.2);

            tl.add(function() { wingTweens.forEach(function(t) { t.kill(); }); wingTweens = []; }, 2.8);
            tl.to(heart, { y: -280, scale: 0.1, opacity: 0, duration: 0.9, ease: 'power2.in' }, 2.8);

            tl.add(function() {
                overlay.style.display = 'none';
                document.body.classList.add('enable-scroll');
            }, 3.5);

            tl.to(hero, { opacity: 1, duration: 1.2, ease: 'power3.out' }, 3.5);
            tl.to('.hero .vintage-paper', { opacity: 1, duration: 1, ease: 'power2.out' }, 3.7);
            tl.from('.hero .paper-content > *', { opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, 3.9);

            tl.add(function() {
                initTypewriter('"Our hearts were dealt."', 'hero-quote');
                initScrollReveal();
                initTilt();
            }, 4.7);
        }
    }

    function initScrollReveal() {
        try {
            gsap.set('.countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer', { opacity: 1 });
            gsap.set('.countdown-item', { opacity: 1, y: 0, scale: 1 });

            gsap.utils.toArray('.section-heading').forEach(function(el) {
                gsap.from(el, { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
            });
            gsap.from('.countdown-item', { opacity: 0, y: 40, scale: 0.9, duration: 0.6, stagger: 0.1,
                ease: 'back.out(1.4)', clearProps: 'all',
                scrollTrigger: { trigger: '.countdown-grid', start: 'top 85%', toggleActions: 'play none none none' } });
            gsap.utils.toArray('.events-timeline .event-item').forEach(function(el, i) {
                gsap.from(el, { opacity: 0, x: i % 2 === 0 ? -60 : 60, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' } });
            });
            gsap.from('.venue-card', { opacity: 0, scale: 0.88, y: 30, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: '.venue-card', start: 'top 80%', toggleActions: 'play none none none' } });
            gsap.from('.detail-item', { opacity: 0, y: 30, duration: 0.6, stagger: 0.15, ease: 'power2.out',
                scrollTrigger: { trigger: '.venue-details', start: 'top 82%', toggleActions: 'play none none none' } });
            gsap.utils.toArray('.family-card').forEach(function(el, i) {
                gsap.from(el, { opacity: 0, x: i % 2 === 0 ? -50 : 50, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' } });
            });
            gsap.utils.toArray('.info-grid .event-item').forEach(function(el, i) {
                gsap.from(el, { opacity: 0, y: 60, rotation: i % 2 === 0 ? -1.5 : 1.5, duration: 0.85, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
            });
            gsap.from('.luxury-footer', { opacity: 0, y: 40, duration: 1, ease: 'power2.out',
                scrollTrigger: { trigger: '.luxury-footer', start: 'top 90%', toggleActions: 'play none none none' } });
            gsap.from('.footer-hearts', { opacity: 0, scale: 0.5, duration: 0.8, ease: 'back.out(2)',
                scrollTrigger: { trigger: '.luxury-footer', start: 'top 88%', toggleActions: 'play none none none' } });
        } catch(e) {
            document.querySelectorAll('.countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer')
                .forEach(function(el) { el.style.opacity = '1'; });
        }
    }

    function startCountdown() {
        var weddingDate = new Date('2026-04-23T10:30:00').getTime();
        var prev = { days: '', hours: '', minutes: '', seconds: '' };

        function flipUpdate(id, value) {
            var el = document.getElementById(id);
            if (!el) return;
            var current = el.querySelector('.flip-current');
            if (!current) return;
            var val = String(value).padStart(2, '0');
            if (prev[id] === val) return;
            prev[id] = val;
            try {
                gsap.timeline()
                    .to(current, { opacity: 0, y: -8, duration: 0.18, ease: 'power1.in' })
                    .set(current, { textContent: val })
                    .to(current, { opacity: 1, y: 0, duration: 0.22, ease: 'power1.out' });
            } catch(e) { current.textContent = val; }
        }

        function updateCountdown() {
            var distance = weddingDate - Date.now();
            if (distance < 0) {
                clearInterval(interval);
                var grid = document.querySelector('.countdown-grid');
                if (grid) grid.innerHTML = '<p style="font-size:2rem;color:#d4af37;grid-column:1/-1;">The Wedding Day is Here! 🎉</p>';
                return;
            }
            flipUpdate('days', Math.floor(distance / 86400000));
            flipUpdate('hours', Math.floor((distance % 86400000) / 3600000));
            flipUpdate('minutes', Math.floor((distance % 3600000) / 60000));
            flipUpdate('seconds', Math.floor((distance % 60000) / 1000));
        }
        updateCountdown();
        var interval = setInterval(updateCountdown, 1000);
    }

    function initTypewriter(text, elementId) {
        var el = document.getElementById(elementId);
        if (!el) return;
        el.textContent = '';
        var cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        el.appendChild(cursor);
        var i = 0;
        function type() {
            if (i < text.length) {
                el.insertBefore(document.createTextNode(text[i++]), cursor);
                setTimeout(type, 60 + Math.random() * 40);
            } else { setTimeout(function() { cursor.remove(); }, 2000); }
        }
        setTimeout(type, 500);
    }

    function initTilt() {
        document.querySelectorAll('.countdown-item').forEach(function(item) {
            item.addEventListener('pointermove', function(e) {
                var r = item.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - 0.5;
                var y = (e.clientY - r.top) / r.height - 0.5;
                gsap.to(item, { rotateY: x * 18, rotateX: -y * 18, translateY: -4, duration: 0.3, ease: 'power1.out', transformPerspective: 500 });
            });
            item.addEventListener('pointerleave', function() {
                gsap.to(item, { rotateY: 0, rotateX: 0, translateY: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }

    var particlesCtx, particlesCanvas, particlesArr;
    function initParticles() {
        particlesCanvas = document.getElementById('particles');
        if (!particlesCanvas) return;
        particlesCtx = particlesCanvas.getContext('2d');
        function resize() { particlesCanvas.width = window.innerWidth; particlesCanvas.height = window.innerHeight; }
        resize(); resizeCallbacks.push(resize);
        var count = Math.min(20, Math.floor(window.innerWidth / 50));
        particlesArr = [];
        for (var i = 0; i < count; i++) {
            particlesArr.push({ x: Math.random() * particlesCanvas.width, y: Math.random() * particlesCanvas.height,
                size: Math.random() * 2.5 + 0.8, speedY: -(Math.random() * 0.45 + 0.08), speedX: (Math.random() - 0.5) * 0.25,
                opacity: Math.random() * 0.5 + 0.2, flicker: Math.random() * Math.PI * 2 });
        }
        particlesRAF = requestAnimationFrame(particlesLoop);
    }

    function particlesLoop() {
        if (paused) { particlesRAF = 'paused'; return; }
        var ctx = particlesCtx, c = particlesCanvas;
        ctx.clearRect(0, 0, c.width, c.height);
        for (var i = 0; i < particlesArr.length; i++) {
            var p = particlesArr[i];
            p.y += p.speedY; p.x += p.speedX; p.flicker += 0.025;
            var alpha = p.opacity * (0.55 + 0.45 * Math.sin(p.flicker));
            if (p.y < -10) { p.y = c.height + 10; p.x = Math.random() * c.width; }
            if (p.x < -10) p.x = c.width + 10;
            if (p.x > c.width + 10) p.x = -10;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(212,175,55,' + alpha + ')'; ctx.fill();
        }
        particlesRAF = requestAnimationFrame(particlesLoop);
    }

    var petalsCtx, petalsCanvas, petalsArr;
    function initPetals() {
        petalsCanvas = document.getElementById('petals');
        if (!petalsCanvas) return;
        petalsCtx = petalsCanvas.getContext('2d');
        function resize() { petalsCanvas.width = window.innerWidth; petalsCanvas.height = window.innerHeight; }
        resize(); resizeCallbacks.push(resize);
        var count = Math.min(8, Math.floor(window.innerWidth / 100));
        petalsArr = [];
        for (var i = 0; i < count; i++) {
            petalsArr.push({ x: Math.random() * petalsCanvas.width, y: Math.random() * petalsCanvas.height - petalsCanvas.height,
                size: Math.random() * 9 + 4, speedY: Math.random() * 0.55 + 0.18, speedX: (Math.random() - 0.5) * 0.35,
                rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 1.8, wobble: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.28 + 0.12 });
        }
        petalsRAF = requestAnimationFrame(petalsLoop);
    }

    function petalsLoop() {
        if (paused) { petalsRAF = 'paused'; return; }
        var ctx = petalsCtx, c = petalsCanvas;
        ctx.clearRect(0, 0, c.width, c.height);
        for (var i = 0; i < petalsArr.length; i++) {
            var p = petalsArr[i];
            p.y += p.speedY; p.wobble += 0.018; p.x += p.speedX + Math.sin(p.wobble) * 0.28; p.rotation += p.rotSpeed;
            if (p.y > c.height + 20) { p.y = -20; p.x = Math.random() * c.width; }
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.globalAlpha = p.opacity;
            ctx.beginPath(); ctx.moveTo(0, -p.size);
            ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.6, p.size * 0.5, 0, p.size);
            ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
            ctx.fillStyle = 'rgba(183,110,121,0.5)'; ctx.fill(); ctx.restore();
        }
        petalsRAF = requestAnimationFrame(petalsLoop);
    }
}

// ── Shared: Weather ──
function fetchWeather() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=9.1711&longitude=77.8711&current=temperature_2m,weather_code&timezone=Asia/Kolkata')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var temp = document.getElementById('weather-temp');
            var desc = document.getElementById('weather-desc');
            if (temp) temp.textContent = Math.round(data.current.temperature_2m) + '°C';
            if (desc) desc.textContent = getWeatherDescription(data.current.weather_code);
        })
        .catch(function() {
            var temp = document.getElementById('weather-temp');
            var desc = document.getElementById('weather-desc');
            if (temp) temp.textContent = 'Pleasant Weather Expected';
            if (desc) desc.textContent = 'Perfect for celebrations';
        });
}

function getWeatherDescription(code) {
    var map = { 0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Foggy',
        51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',
        80:'Light Showers',81:'Showers',82:'Heavy Showers' };
    return map[code] || 'Pleasant Weather';
}
