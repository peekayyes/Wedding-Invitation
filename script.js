document.addEventListener('DOMContentLoaded', function() {
    startCountdown();
    fetchWeather();
    initParticles();
    initPetals();
    initVisibilityPause();

    // Show all sections except hero
    var sections = document.querySelectorAll('.countdown-luxury, .events-luxury, .venue-luxury, .families-section, .things-to-know, .luxury-footer');
    for (var i = 0; i < sections.length; i++) sections[i].classList.add('content-visible');
    var papers = document.querySelectorAll('.countdown-luxury .vintage-paper, .events-luxury .vintage-paper, .venue-luxury .vintage-paper, .families-section .vintage-paper, .things-to-know .vintage-paper');
    for (var i = 0; i < papers.length; i++) papers[i].classList.add('emerged');

    // Curtain auto-open after 1.5s
    setTimeout(function() {
        var overlay = document.getElementById('curtain-overlay');
        var heart = document.getElementById('curtain-heart');
        if (overlay) overlay.classList.add('opening');
        if (heart) heart.classList.add('heart-active');

        // Heart departs after 2.8s
        setTimeout(function() {
            if (heart) heart.classList.add('heart-depart');

            // Hero appears after 0.7s
            setTimeout(function() {
                if (overlay) overlay.style.display = 'none';
                var hero = document.querySelector('.hero');
                if (hero) {
                    hero.classList.remove('hero-hidden');
                    hero.classList.add('hero-bloom');
                }
                var heroPaper = document.querySelector('.hero .vintage-paper');
                if (heroPaper) heroPaper.classList.add('emerged');
                initTypewriter('"Our hearts were dealt."', 'hero-quote');
                document.body.classList.add('enable-scroll');
                initScrollReveal();
            }, 700);
        }, 2800);
    }, 1500);
});

// Visibility pause for canvases
var paused = false;
var particlesRAF = null;
var petalsRAF = null;

function initVisibilityPause() {
    document.addEventListener('visibilitychange', function() {
        paused = document.hidden;
        if (!paused) {
            if (particlesRAF === 'paused') particlesRAF = requestAnimationFrame(particlesLoop);
            if (petalsRAF === 'paused') petalsRAF = requestAnimationFrame(petalsLoop);
        }
    });
}

// Countdown
function startCountdown() {
    var weddingDate = new Date('2026-04-23T10:30:00').getTime();
    var prev = {};

    function update() {
        var d = weddingDate - Date.now();
        if (d < 0) {
            var grid = document.querySelector('.countdown-grid');
            if (grid) grid.innerHTML = '<p style="font-size:2rem;color:#d4af37;grid-column:1/-1;">The Wedding Day is Here! 🎉</p>';
            return;
        }
        set('days', Math.floor(d / 86400000));
        set('hours', Math.floor((d % 86400000) / 3600000));
        set('minutes', Math.floor((d % 3600000) / 60000));
        set('seconds', Math.floor((d % 60000) / 1000));
    }

    function set(id, val) {
        var s = val < 10 ? '0' + val : '' + val;
        if (prev[id] === s) return;
        prev[id] = s;
        var el = document.querySelector('#' + id + ' .flip-current');
        if (el) el.textContent = s;
    }

    update();
    setInterval(update, 1000);
}

// Weather
function fetchWeather() {
    try {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=9.1711&longitude=77.8711&current=temperature_2m,weather_code&timezone=Asia/Kolkata')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                var t = document.getElementById('weather-temp');
                var d = document.getElementById('weather-desc');
                if (t) t.textContent = Math.round(data.current.temperature_2m) + '\u00b0C';
                if (d) d.textContent = getWeatherDescription(data.current.weather_code);
            }).catch(function() { weatherFallback(); });
    } catch(e) { weatherFallback(); }
}

function weatherFallback() {
    var t = document.getElementById('weather-temp');
    var d = document.getElementById('weather-desc');
    if (t) t.textContent = 'Pleasant Weather Expected';
    if (d) d.textContent = 'Perfect for celebrations';
}

function getWeatherDescription(code) {
    var m = {0:'Clear Sky',1:'Mainly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Foggy',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',80:'Light Showers',81:'Showers',82:'Heavy Showers'};
    return m[code] || 'Pleasant Weather';
}

// Typewriter
function initTypewriter(text, id) {
    var el = document.getElementById(id);
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
        } else {
            setTimeout(function() { if (cursor.parentNode) cursor.parentNode.removeChild(cursor); }, 2000);
        }
    }
    setTimeout(type, 500);
}

// Scroll reveal
function initScrollReveal() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) {
        // Add reveal classes
        addReveal('.countdown-item', 'reveal-up');
        addReveal('.events-timeline .event-item', 'reveal-up');
        addReveal('.venue-card', 'reveal-scale');
        addReveal('.detail-item', 'reveal-up');
        addReveal('.family-card', 'reveal-up');
        addReveal('.info-grid .event-item', 'reveal-up');
        addReveal('.luxury-footer', 'reveal-up');
        reveals = document.querySelectorAll('.reveal');
    }

    var observer = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) entries[i].target.classList.add('visible');
        }
    }, { threshold: 0.15 });

    for (var i = 0; i < reveals.length; i++) observer.observe(reveals[i]);
}

function addReveal(sel, dir) {
    var els = document.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) {
        els[i].classList.add('reveal', dir);
    }
}

// Gold Particles
var particlesCtx, particlesCanvas, particlesArr;
var isMobile = window.innerWidth < 768;

function initParticles() {
    particlesCanvas = document.getElementById('particles');
    if (!particlesCanvas) return;
    particlesCtx = particlesCanvas.getContext('2d');
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    window.addEventListener('resize', function() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    });

    var count = isMobile ? 20 : 45;
    particlesArr = [];
    for (var i = 0; i < count; i++) {
        particlesArr.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            size: Math.random() * 3 + 0.5,
            speedY: -(Math.random() * 0.5 + 0.05),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.6 + 0.15,
            flicker: Math.random() * Math.PI * 2
        });
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
        var a = p.opacity * (0.5 + 0.5 * Math.sin(p.flicker));
        if (p.y < -10) { p.y = c.height + 10; p.x = Math.random() * c.width; }
        if (p.x < -10) p.x = c.width + 10;
        if (p.x > c.width + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.28);
        ctx.fillStyle = 'rgba(212,175,55,' + a + ')'; ctx.fill();
    }
    particlesRAF = requestAnimationFrame(particlesLoop);
}

// Rose Petals
var petalsCtx, petalsCanvas, petalsArr;

function initPetals() {
    petalsCanvas = document.getElementById('petals');
    if (!petalsCanvas) return;
    petalsCtx = petalsCanvas.getContext('2d');
    petalsCanvas.width = window.innerWidth;
    petalsCanvas.height = window.innerHeight;
    window.addEventListener('resize', function() {
        petalsCanvas.width = window.innerWidth;
        petalsCanvas.height = window.innerHeight;
    });

    var count = isMobile ? 10 : 18;
    petalsArr = [];
    for (var i = 0; i < count; i++) {
        petalsArr.push({
            x: Math.random() * petalsCanvas.width,
            y: Math.random() * petalsCanvas.height - petalsCanvas.height,
            size: Math.random() * 10 + 3,
            speedY: Math.random() * 0.6 + 0.15,
            speedX: (Math.random() - 0.5) * 0.4,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 2,
            wobble: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    petalsRAF = requestAnimationFrame(petalsLoop);
}

function petalsLoop() {
    if (paused) { petalsRAF = 'paused'; return; }
    var ctx = petalsCtx, c = petalsCanvas;
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < petalsArr.length; i++) {
        var p = petalsArr[i];
        p.y += p.speedY; p.wobble += 0.018; p.x += p.speedX + Math.sin(p.wobble) * 0.3; p.rotation += p.rotSpeed;
        if (p.y > c.height + 20) { p.y = -20; p.x = Math.random() * c.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * 0.01745);
        ctx.globalAlpha = p.opacity;
        ctx.beginPath(); ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.6, p.size * 0.5, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.5, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
        ctx.fillStyle = 'rgba(183,110,121,0.5)'; ctx.fill(); ctx.restore();
    }
    petalsRAF = requestAnimationFrame(petalsLoop);
}
