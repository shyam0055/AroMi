/**
 * welcome.js — AroMi Welcome / Landing Page Module
 * ─────────────────────────────────────────────────────────────────
 * Handles:
 *  • Typewriter effect for the hero headline cycling words
 *  • Animated count-up for stats (users, topics, accuracy, rating)
 *  • Particle / floating orb background animations (CSS-driven)
 *  • Auth check redirect: if user is logged in → go to home.html
 *  • "Get Started" CTA routing (auth or direct to home)
 *  • Feature card reveal with staggered IntersectionObserver
 *  • Smooth scroll for anchor links
 *  • Page loader fade-out on load
 *
 * Used on: index.html (landing/marketing page)
 * Depends on: navbar.js (optional — for toast)
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  window.AroMi = window.AroMi || {};


  /* ═══════════════════════════════════════════
     1. AUTH CHECK
     If the user is already logged in (has a
     stored session token), skip the landing page
     and go directly to the dashboard.
  ═══════════════════════════════════════════ */
  async function checkAuthRedirect() {
    try {
      if (typeof _supabase !== 'undefined') {
        const { data: { user } } = await _supabase.auth.getUser();
        if (user) {
          window.location.replace('home.html');
        }
      }
    } catch (_) {
      // If Supabase is not available, just stay on landing
    }
  }

  // Only redirect on the landing page (index.html / root)
  const currentPage = window.location.pathname.split('/').pop();
  if (!currentPage || currentPage === 'index.html') {
    checkAuthRedirect();
  }


  /* ═══════════════════════════════════════════
     2. PAGE LOADER FADE-OUT
     Fades out a full-screen loader div if present.
     Add <div id="page-loader"> to index.html for this.
  ═══════════════════════════════════════════ */
  window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  });


  /* ═══════════════════════════════════════════
     3. TYPEWRITER EFFECT
     Cycles through words in the hero headline.
     Target: element with id="typewriter-word"
     Words: array defined below.

     HTML usage:
       <span id="typewriter-word"></span>
  ═══════════════════════════════════════════ */
  const TYPEWRITER_WORDS = [
    'everyday life quality',
    'heart health',
    'mental wellness',
    'energy levels',
    'longevity',
    'brain performance',
    'immune system',
  ];

  let twIndex = 0;
  let twCharIndex = 0;
  let twDeleting = false;
  let twTimeout = null;

  function typewriterTick() {
    const el = document.getElementById('typewriter-word');
    if (!el) return;

    const currentWord = TYPEWRITER_WORDS[twIndex];

    if (twDeleting) {
      // Erase one character
      twCharIndex--;
      el.textContent = currentWord.slice(0, twCharIndex);
    } else {
      // Type one character
      twCharIndex++;
      el.textContent = currentWord.slice(0, twCharIndex);
    }

    let delay = twDeleting ? 45 : 85;

    if (!twDeleting && twCharIndex === currentWord.length) {
      // Pause at end of word before deleting
      delay = 2000;
      twDeleting = true;
    } else if (twDeleting && twCharIndex === 0) {
      // Move to next word
      twDeleting = false;
      twIndex = (twIndex + 1) % TYPEWRITER_WORDS.length;
      delay = 300;
    }

    twTimeout = setTimeout(typewriterTick, delay);
  }

  function startTypewriter() {
    const el = document.getElementById('typewriter-word');
    if (!el) return;

    // Add blinking cursor via CSS
    el.style.borderRight = '2px solid currentColor';
    el.style.paddingRight = '2px';
    el.style.animation = 'cursorBlink 1s step-end infinite';

    // Inject cursor keyframes if not already there
    if (!document.getElementById('tw-cursor-styles')) {
      const style = document.createElement('style');
      style.id = 'tw-cursor-styles';
      style.textContent = `
        @keyframes cursorBlink {
          0%, 100% { border-color: currentColor; }
          50%       { border-color: transparent; }
        }
      `;
      document.head.appendChild(style);
    }

    typewriterTick();
  }


  /* ═══════════════════════════════════════════
     4. COUNT-UP ANIMATION
     Animates numbers from 0 to their target value.
     Target: elements with data-count="<target>"

     HTML usage:
       <span data-count="50000" data-suffix="K+">0</span>
  ═══════════════════════════════════════════ */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count || el.textContent);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = parseInt(el.dataset.duration || 1800);
    const start = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = target * eased;

      el.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  }


  /* ═══════════════════════════════════════════
     5. FEATURE CARD REVEAL
     Staggered IntersectionObserver for feature
     cards, testimonials, how-it-works steps.
  ═══════════════════════════════════════════ */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || (i * 80));
          setTimeout(() => entry.target.classList.add('in'), delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.07,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.dataset.delay = el.dataset.delay || String(i * 80);
      observer.observe(el);
    });
  }


  /* ═══════════════════════════════════════════
     6. FLOATING PARTICLES (canvas-based)
     Draws soft floating health icons / dots
     on a canvas behind the hero section.
     Only runs if #particles-canvas exists.
  ═══════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const EMOJIS = ['❤️', '🧠', '✨', '🫁', '🛡️', '🌿', '🦴', '🧘'];
    const COUNT = 18;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size: 14 + Math.random() * 16,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.4,
        opacity: 0.08 + Math.random() * 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      };
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push(createParticle());
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Wrap around edges
        if (p.y < -40) { p.y = canvas.height + 40; p.x = Math.random() * canvas.width; }
        if (p.x < -40) p.x = canvas.width + 40;
        if (p.x > canvas.width + 40) p.x = -40;
      });

      requestAnimationFrame(draw);
    }

    draw();
  }


  /* ═══════════════════════════════════════════
     7. SMOOTH SCROLL for anchor links
  ═══════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 80; // account for fixed navbar
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }


  /* ═══════════════════════════════════════════
     8. CTA BUTTON ROUTING
     "Get Started" → auth-choice.html
     "Get Prediction" → opens prediction modal
     "Explore Features" → smooth scrolls to #features
  ═══════════════════════════════════════════ */
  AroMi.getStarted = function () {
    try {
      const user = localStorage.getItem('aromi_user');
      if (user) {
        window.location.href = 'home.html';
      } else {
        window.location.href = 'auth-choice.html';
      }
    } catch (_) {
      window.location.href = 'auth-choice.html';
    }
  };

  AroMi.tryDemo = function () {
    // Go directly to home.html as a guest demo
    // TODO: Set a 'aromi_guest' flag and restrict certain features
    try { localStorage.setItem('aromi_guest', 'true'); } catch (_) {}
    window.location.href = 'home.html';
  };


  /* ═══════════════════════════════════════════
     9. HERO SECTION MOUSE PARALLAX
     Adds subtle depth to floating hero cards
     as the mouse moves.
  ═══════════════════════════════════════════ */
  function initHeroParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const layers = hero.querySelectorAll('.hcard, .stat-float');

    document.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 to 1
      const dy = (e.clientY - cy) / cy;

      layers.forEach((el, i) => {
        const depth = 0.5 + (i % 3) * 0.4;
        const tx = dx * depth * 8;
        const ty = dy * depth * 5;
        // Only apply parallax offset — preserve existing animation
        el.style.setProperty('--px', `${tx}px`);
        el.style.setProperty('--py', `${ty}px`);
      });
    });
  }


  /* ═══════════════════════════════════════════
     10. TESTIMONIALS CAROUSEL (if present)
      Cycles through .testimonial elements.
  ═══════════════════════════════════════════ */
  function initTestimonials() {
    const slides = document.querySelectorAll('.testimonial');
    if (slides.length < 2) return;

    let current = 0;
    slides[0].classList.add('active');

    function next() {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }

    setInterval(next, 4500);

    // Inject minimal styles
    if (!document.getElementById('testimonial-styles')) {
      const s = document.createElement('style');
      s.id = 'testimonial-styles';
      s.textContent = `
        .testimonial { opacity: 0; transform: translateY(12px); transition: all .5s ease; position: absolute; width: 100%; }
        .testimonial.active { opacity: 1; transform: translateY(0); position: relative; }
      `;
      document.head.appendChild(s);
    }
  }


  /* ═══════════════════════════════════════════
     11. INIT
  ═══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    startTypewriter();
    initReveal();
    initCounters();
    initSmoothScroll();
    initParticles();
    initHeroParallax();
    initTestimonials();
  });

})();