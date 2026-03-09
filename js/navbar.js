/**
 * navbar.js — AroMi Shared Navbar Module
 * ─────────────────────────────────────────────────────────────────
 * Handles:
 *  • Auto-hide on scroll down, reveal on scroll up / mouse to top
 *  • Mobile hamburger menu open/close + outside-click dismiss
 *  • Active link highlighting based on current page filename
 *  • Notification badge pulse + click handler (stubbed for backend)
 *  • Profile avatar initials from localStorage user data
 *  • Toast notification system (used by other modules)
 *
 * Usage: <script src="js/navbar.js"></script>
 * Requires: #navbar, #mobileMenu elements in HTML
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     1. SCROLL HIDE / REVEAL
  ═══════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  if (!navbar) return; // Guard: skip if navbar not present

  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (currentY > 80) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }
        lastScrollY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Reveal when mouse hovers near top of screen
  document.addEventListener('mousemove', (e) => {
    if (e.clientY < 80) navbar.classList.remove('nav-hidden');
  });

  // Reveal on touch near top (mobile swipe down gesture)
  document.addEventListener('touchstart', (e) => {
    if (e.touches[0].clientY < 80) navbar.classList.remove('nav-hidden');
  }, { passive: true });


  /* ═══════════════════════════════════════════
     2. MOBILE HAMBURGER MENU
  ═══════════════════════════════════════════ */
  const mobileMenu = document.getElementById('mobileMenu');

  window.toggleMenu = function () {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.toggle('open');
    // Animate hamburger bars into X shape
    const bars = document.querySelectorAll('.nav-hamburger span');
    if (isOpen) {
      bars[0] && (bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)');
      bars[1] && (bars[1].style.opacity = '0');
      bars[2] && (bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)');
    } else {
      bars[0] && (bars[0].style.transform = '');
      bars[1] && (bars[1].style.opacity = '');
      bars[2] && (bars[2].style.transform = '');
    }
  };

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu) return;
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !e.target.closest('.nav-hamburger')
    ) {
      mobileMenu.classList.remove('open');
      const bars = document.querySelectorAll('.nav-hamburger span');
      bars[0] && (bars[0].style.transform = '');
      bars[1] && (bars[1].style.opacity = '');
      bars[2] && (bars[2].style.transform = '');
    }
  });

  // Close menu when a mobile link is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenu) mobileMenu.classList.remove('open');
      // Also close any open overlays
      document.querySelectorAll('.overlay.on').forEach(el => {
        el.classList.remove('on');
        document.body.style.overflow = '';
      });
    }
  });


  /* ═══════════════════════════════════════════
     3. ACTIVE LINK HIGHLIGHTING
     Automatically marks the correct nav link
     as .active based on current page filename.
  ═══════════════════════════════════════════ */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const linkMap = {
    'home.html':               ['home.html'],
    'history.html':            ['history.html'],
    'prediction.html':         ['prediction.html', 'prediction-results.html'],
    'prediction-results.html': ['prediction.html', 'prediction-results.html'],
    'profile.html':            ['profile.html'],
    'health-topic.html':       ['home.html'], // Topic pages highlight Home
    'index.html':              ['index.html'],
  };

  const activeFiles = linkMap[currentPage] || [];

  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const fileName = href.split('/').pop().split('?')[0];
    if (activeFiles.includes(fileName)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });


  /* ═══════════════════════════════════════════
     4. PROFILE AVATAR — initials from user data
     Reads from localStorage (set on login/signup).
     Falls back to default 👤 emoji.
  ═══════════════════════════════════════════ */
  function updateProfileAvatar() {
    const profileEl = document.querySelector('.nav-profile');
    if (!profileEl) return;

    try {
      // TODO: Replace with backend session/token check when auth is ready
      const userData = localStorage.getItem('aromi_user');
      if (userData) {
        const user = JSON.parse(userData);
        const name = user.name || user.email || '';
        if (name) {
          const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          profileEl.textContent = initials;
          profileEl.style.fontSize = '13px';
          profileEl.style.fontWeight = '600';
          profileEl.title = name;
        }
      }
    } catch (_) {
      // Keep default emoji if anything fails
    }
  }

  updateProfileAvatar();


  /* ═══════════════════════════════════════════
     5. NOTIFICATION BADGE
  ═══════════════════════════════════════════ */
  const notifBtn = document.querySelector('.nav-notif');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      // TODO: Open notification panel / fetch from backend
      // For now show a toast
      AroMi.toast('No new notifications', 'info');
      // Hide the red dot after viewing
      const dot = notifBtn.querySelector('.notif-dot');
      if (dot) dot.style.display = 'none';
    });

    // TODO: Replace with backend API call — GET /api/notifications/unread-count
    // Simulate: show dot if user has unread notifications
    try {
      const hasNotif = localStorage.getItem('aromi_has_notif');
      const dot = notifBtn.querySelector('.notif-dot');
      if (dot) dot.style.display = (hasNotif === 'false') ? 'none' : 'block';
    } catch (_) {}
  }


  /* ═══════════════════════════════════════════
     6. GLOBAL MODAL HELPERS
     Used by cards.js, prediction.js, etc.
  ═══════════════════════════════════════════ */
  window.AroMi = window.AroMi || {};

  AroMi.openModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('on');
    document.body.style.overflow = 'hidden';
  };

  AroMi.closeModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('on');
    document.body.style.overflow = '';
  };

  // Close modal when clicking the dark overlay background
  document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) AroMi.closeModal(overlay.id);
    });
  });

  // Legacy aliases used by inline onclick handlers
  window.openM  = AroMi.openModal;
  window.closeM = AroMi.closeModal;
  window.overlayClose = (e, id) => { if (e.target === document.getElementById(id)) AroMi.closeModal(id); };


  /* ═══════════════════════════════════════════
     7. TOAST NOTIFICATION SYSTEM
     AroMi.toast(message, type, duration)
     type: 'success' | 'error' | 'info' | 'warning'
  ═══════════════════════════════════════════ */
  // Inject toast styles once
  if (!document.getElementById('aromi-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'aromi-toast-styles';
    style.textContent = `
      #aromi-toast-container {
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        pointer-events: none;
      }
      .aromi-toast {
        padding: 12px 22px;
        border-radius: 50px;
        font-family: 'DM Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: #fff;
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px rgba(0,0,0,.18);
        pointer-events: all;
        opacity: 0;
        transform: translateY(16px) scale(.95);
        transition: opacity .3s ease, transform .3s cubic-bezier(.34,1.3,.64,1);
        white-space: nowrap;
        max-width: 320px;
        text-align: center;
      }
      .aromi-toast.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .aromi-toast.success { background: linear-gradient(135deg,#10b981,#059669); }
      .aromi-toast.error   { background: linear-gradient(135deg,#ef4444,#dc2626); }
      .aromi-toast.info    { background: linear-gradient(135deg,#8b5cf6,#6d28d9); }
      .aromi-toast.warning { background: linear-gradient(135deg,#f59e0b,#d97706); }
    `;
    document.head.appendChild(style);
  }

  // Create container
  let toastContainer = document.getElementById('aromi-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'aromi-toast-container';
    document.body.appendChild(toastContainer);
  }

  AroMi.toast = function (message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.className = `aromi-toast ${type}`;
    toast.textContent = (icons[type] || '') + ' ' + message;
    toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  };

  /* ═══════════════════════════════════════════
     8. SCROLL PROGRESS BAR (optional)
     Shows a thin gradient line at top of page
     indicating scroll depth.
  ═══════════════════════════════════════════ */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(90deg, #ec4899, #8b5cf6, #10b981);
    z-index: 9998; transition: width .1s linear; pointer-events: none;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });

})();