/**
 * cards.js — AroMi Health Topic Cards Module
 * ─────────────────────────────────────────────────────────────────
 * Handles:
 *  • Rendering all 12 health topic cards into #health-grid
 *  • Opening the quick-preview modal with topic data
 *  • "Learn More" linking to health-topic.html?topic=<id>
 *  • "Get Prediction" shortcut pre-filled with the topic's body area
 *  • Scroll reveal animations via IntersectionObserver
 *  • Mini heart-rate chart bars in the hero widget
 *  • Three.js animated brain in the hero (with resize handling)
 *
 * Depends on: navbar.js (for AroMi.openModal / closeModal / toast)
 * Usage: <script src="js/navbar.js"></script>
 *        <script src="js/cards.js"></script>
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     1. HEALTH TOPICS DATA
     12 topics — each maps to health-topic.html?topic=<id>
     and to a body_area value in the prediction form.
  ═══════════════════════════════════════════ */
  const TOPICS = [
    {
      id: 'brain', icon: '🧠', title: 'Brain Health',
      desc: 'Protect your cognitive function and mental sharpness.',
      bodyArea: 'Brain / Head',
      prec: ['Avoid excessive screen time', 'Get 7–8 hours sleep nightly', 'Manage stress proactively', 'Limit alcohol consumption'],
      foods: ['Blueberries', 'Walnuts', 'Salmon', 'Dark Chocolate', 'Turmeric', 'Eggs'],
      exer: ['Daily meditation 10–15 min', 'Puzzle & memory games', 'Aerobic exercise 30 min/day', 'Regular reading']
    },
    {
      id: 'eye', icon: '👁️', title: 'Eye Health',
      desc: 'Preserve your vision and reduce eye strain.',
      bodyArea: 'Eyes',
      prec: ['Follow 20-20-20 screen rule', 'Wear UV-protective sunglasses', 'Regular eye checkups', 'Avoid rubbing your eyes'],
      foods: ['Carrots', 'Spinach', 'Sweet Potato', 'Citrus Fruits', 'Almonds', 'Fish'],
      exer: ['Eye rolling exercises', 'Focus shifting practice', 'Palming relaxation', 'Blinking exercises']
    },
    {
      id: 'ear', icon: '👂', title: 'Ear Health',
      desc: 'Protect your hearing and prevent infections.',
      bodyArea: 'Ears',
      prec: ['Limit headphone volume to 60%', 'Never insert objects into ears', 'Keep ears dry', 'Use protection in loud environments'],
      foods: ['Magnesium-rich foods', 'Pumpkin seeds (Zinc)', 'Leafy greens (Folate)', 'Omega-3 fatty acids'],
      exer: ['Jaw exercises', 'Neck stretches', 'Yawning exercises', 'Gentle chewing']
    },
    {
      id: 'heart', icon: '❤️', title: 'Heart Health',
      desc: 'Keep your cardiovascular system strong.',
      bodyArea: 'Heart / Chest',
      prec: ['Monitor blood pressure', 'Quit smoking', 'Limit saturated fats', 'Manage stress'],
      foods: ['Oats', 'Berries', 'Leafy greens', 'Avocado', 'Olive oil', 'Legumes'],
      exer: ['Brisk walking 30 min/day', 'Swimming', 'Cycling', 'Heart-health yoga']
    },
    {
      id: 'lung', icon: '🫁', title: 'Lung Health',
      desc: 'Breathe easier with a healthy respiratory system.',
      bodyArea: 'Lungs / Respiratory',
      prec: ['Avoid smoking', 'Exercise in clean air', 'Use air purifiers', 'Wear masks in pollution'],
      foods: ['Apples', 'Pumpkin', 'Tomatoes', 'Green tea', 'Ginger', 'Garlic'],
      exer: ['Deep breathing exercises', 'Pursed lip breathing', 'Belly breathing', 'Aerobic cardio']
    },
    {
      id: 'liver', icon: '🫀', title: 'Liver Health',
      desc: 'Detox and protect your largest internal organ.',
      bodyArea: 'Liver / Digestive',
      prec: ['Limit alcohol', 'Avoid unnecessary meds', 'Maintain healthy weight', 'Get Hepatitis vaccine'],
      foods: ['Coffee (moderate)', 'Grapefruit', 'Beetroot', 'Cruciferous veggies', 'Berries'],
      exer: ['Aerobic 150 min/week', 'Resistance training', 'Yoga twists', 'Walking after meals']
    },
    {
      id: 'kidney', icon: '🩺', title: 'Kidney Health',
      desc: 'Keep your kidneys filtering well.',
      bodyArea: 'Kidneys / Urinary',
      prec: ['Stay hydrated (2L+/day)', 'Limit salt', 'Monitor blood sugar', 'Limit painkiller overuse'],
      foods: ['Cauliflower', 'Blueberries', 'Red grapes', 'Egg whites', 'Garlic', 'Olive oil'],
      exer: ['Walking', 'Swimming', 'Light cycling', 'Stretching routines']
    },
    {
      id: 'skin', icon: '✨', title: 'Skin Health',
      desc: 'Glow from the inside out.',
      bodyArea: 'Skin',
      prec: ['Use SPF 30+ sunscreen daily', 'Stay hydrated', 'Remove makeup before sleep', 'Avoid harsh chemicals'],
      foods: ['Avocado', 'Tomatoes', 'Dark chocolate', 'Green tea', 'Fatty fish', 'Broccoli'],
      exer: ['Facial yoga', 'Cardio (clears pores)', 'Facial massage', 'Consistent sleep schedule']
    },
    {
      id: 'bone', icon: '🦴', title: 'Bone & Joint Health',
      desc: 'Build strong bones and flexible joints.',
      bodyArea: 'Bones / Joints',
      prec: ['Get Vitamin D & Calcium', 'Prevent falls', 'Maintain healthy weight', 'Quit smoking'],
      foods: ['Dairy', 'Leafy greens', 'Sardines', 'Tofu', 'Almonds', 'Fortified cereals'],
      exer: ['Weight-bearing exercise', 'Resistance training', 'Balance exercises', 'Yoga & stretching']
    },
    {
      id: 'mental', icon: '🧘', title: 'Mental Health',
      desc: 'Nurture your emotional wellbeing and peace.',
      bodyArea: 'Mental Health',
      prec: ['Limit social media', 'Seek help when overwhelmed', 'Maintain social connections', 'Practice gratitude'],
      foods: ['Leafy greens', 'Walnuts', 'Fermented foods', 'Salmon', 'Chamomile tea', 'Dark chocolate'],
      exer: ['Daily meditation', 'Journaling', 'Yoga', 'Nature walks']
    },
    {
      id: 'digestive', icon: '🌿', title: 'Digestive Health',
      desc: 'Optimize your gut for energy and immunity.',
      bodyArea: 'Liver / Digestive',
      prec: ['Eat slowly & mindfully', 'Avoid overeating', 'Stay hydrated', 'Manage stress'],
      foods: ['Yogurt', 'Kefir', 'Whole grains', 'Ginger', 'Bananas', 'Fennel'],
      exer: ['Walk after meals', 'Yoga twists', 'Core strengthening', 'Deep breathing']
    },
    {
      id: 'immunity', icon: '🛡️', title: 'Immune Health',
      desc: "Build your body's natural defense system.",
      bodyArea: 'Immunity / General',
      prec: ['Get adequate sleep', 'Wash hands regularly', 'Stay vaccinated', 'Reduce chronic stress'],
      foods: ['Citrus fruits', 'Garlic', 'Ginger', 'Spinach', 'Almonds', 'Turmeric'],
      exer: ['Moderate aerobic', 'Yoga', 'Tai chi', 'Avoid overtraining']
    }
  ];

  // Expose topics globally so other modules (e.g. prediction.js) can reference them
  window.AroMi = window.AroMi || {};
  AroMi.topics = TOPICS;


  /* ═══════════════════════════════════════════
     2. RENDER HEALTH GRID CARDS
  ═══════════════════════════════════════════ */
  function renderCards() {
    const grid = document.getElementById('health-grid');
    if (!grid) return;

    grid.innerHTML = TOPICS.map((t, i) => `
      <div class="hc glass reveal"
           data-topic="${t.id}"
           onclick="AroMi.openHealthModal('${t.id}')"
           role="button"
           tabindex="0"
           aria-label="Learn about ${t.title}"
           style="animation-delay:${i * 60}ms">
        <span class="hc-icon">${t.icon}</span>
        <div class="hc-title">${t.title}</div>
        <div class="hc-desc">${t.desc}</div>
        <div class="hc-link">Explore →</div>
      </div>
    `).join('');

    // Keyboard navigation for cards
    grid.querySelectorAll('.hc').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    initReveal();
  }


  /* ═══════════════════════════════════════════
     3. HEALTH TOPIC MODAL
     Quick-preview modal on the home page.
     "Learn More" → health-topic.html?topic=id
     "Predict" → pre-fills prediction form
  ═══════════════════════════════════════════ */
  AroMi.openHealthModal = function (id) {
    const t = TOPICS.find(x => x.id === id);
    if (!t) return;

    // Populate modal fields
    const set = (sel, val, html = false) => {
      const el = document.getElementById(sel);
      if (el) html ? (el.innerHTML = val) : (el.textContent = val);
    };

    set('m-ico', t.icon);
    set('m-title', t.title);
    set('m-desc', t.desc);
    set('m-prec', t.prec.map(p => `<li>${p}</li>`).join(''), true);
    set('m-foods', t.foods.map(f => `<span class="mtag">${f}</span>`).join(''), true);
    set('m-exer', t.exer.map(e => `<li>${e}</li>`).join(''), true);

    // "Learn More" button → full topic page
    const learnBtn = document.getElementById('m-learn');
    if (learnBtn) learnBtn.href = `health-topic.html?topic=${id}`;

    // "Predict for this area" button (if it exists in the modal)
    const predBtn = document.getElementById('m-pred');
    if (predBtn) {
      predBtn.onclick = () => {
        AroMi.closeModal('health-modal');
        AroMi.openPredModal(t.bodyArea);
      };
    }

    AroMi.openModal('health-modal');
  };

  // Legacy alias
  window.openHealth = AroMi.openHealthModal;


  /* ═══════════════════════════════════════════
     4. SCROLL REVEAL ANIMATION
     Uses IntersectionObserver to stagger-reveal
     cards and section headings as they scroll in.
  ═══════════════════════════════════════════ */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('in');
          }, i * 75);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.07,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Expose so navbar.js or other modules can trigger it
  AroMi.initReveal = initReveal;


  /* ═══════════════════════════════════════════
     5. MINI HEART CHART (hero widget)
     Renders animated bar chart in #mini-chart
  ═══════════════════════════════════════════ */
  function buildMiniChart() {
    const container = document.getElementById('mini-chart');
    if (!container) return;

    const values = [60, 75, 55, 80, 65, 90, 70, 85, 60, 95, 72, 88];
    container.innerHTML = '';

    values.forEach((v, i) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = '0px';
      bar.style.opacity = String(0.5 + v * 0.005);
      container.appendChild(bar);

      // Animate bars in on load
      setTimeout(() => {
        bar.style.transition = `height 0.6s cubic-bezier(.34,1.3,.64,1) ${i * 50}ms`;
        bar.style.height = (v * 0.4) + 'px';
      }, 300 + i * 50);
    });
  }


  /* ═══════════════════════════════════════════
     6. THREE.JS ANIMATED BRAIN (hero right panel)
     Self-contained — only runs if THREE is loaded
     and #brain-canvas exists on the page.
  ═══════════════════════════════════════════ */
  function initThree() {
    if (typeof THREE === 'undefined') return;
    const canvas = document.getElementById('brain-canvas');
    if (!canvas) return;

    const parent = canvas.parentElement;
    const W = parent.clientWidth || 480;
    const H = parent.clientHeight || 440;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    cam.position.set(0, 0, 5.5);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const l1 = new THREE.DirectionalLight(0xff80c0, 2.5); l1.position.set(4, 5, 5); scene.add(l1);
    const l2 = new THREE.DirectionalLight(0x9090ff, 1.8); l2.position.set(-5, -2, 3); scene.add(l2);
    const l3 = new THREE.DirectionalLight(0x80ffd0, 1.2); l3.position.set(0, 6, -4); scene.add(l3);

    // Brain sphere cluster
    const group = new THREE.Group();
    const lobes = [
      { pos: [0, 0.25, 0],    r: 1.1,  c: 0xf9a8d4 },
      { pos: [-1, 0.3, 0.2],  r: 0.75, c: 0xc4b5fd },
      { pos: [1, 0.3, 0.2],   r: 0.75, c: 0xa5b4fc },
      { pos: [0, -0.6, 0.15], r: 0.8,  c: 0xfbcfe8 },
      { pos: [0, 0.85, -0.2], r: 0.6,  c: 0xddd6fe },
      { pos: [-0.55, -0.28, 0.55], r: 0.6, c: 0x93c5fd },
      { pos: [0.55, -0.28, 0.55],  r: 0.6, c: 0xbfdbfe },
      { pos: [-0.3, 0.55, 0.45],   r: 0.5, c: 0xf0abfc },
      { pos: [0.3, 0.55, 0.45],    r: 0.5, c: 0xd9f99d }
    ];

    lobes.forEach(b => {
      const mat = new THREE.MeshPhongMaterial({
        color: b.c, transparent: true, opacity: 0.72,
        shininess: 90, specular: new THREE.Color(0xffffff)
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(b.r, 28, 28), mat);
      mesh.position.set(...b.pos);
      group.add(mesh);
    });
    scene.add(group);

    // Floating orbs
    const orbs = [];
    [
      [2.2, 0.8, 0.5, 0xf9a8d4],
      [2, -0.5, 0.3, 0x6ee7b7],
      [-2.1, 0.6, 0.4, 0xc4b5fd],
      [-1.9, -0.7, 0.6, 0xfde68a],
      [0.5, 2, -0.5, 0xa5f3fc]
    ].forEach(([x, y, z, c]) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshPhongMaterial({ color: c, transparent: true, opacity: 0.65 })
      );
      m.position.set(x, y, z);
      m.userData = { oy: y, spd: 0.3 + Math.random() * 0.4, off: Math.random() * Math.PI * 2 };
      scene.add(m);
      orbs.push(m);
    });

    // Mouse parallax
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
      my = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    // Responsive resize
    function onResize() {
      const W2 = parent.clientWidth || 480;
      const H2 = parent.clientHeight || 440;
      renderer.setSize(W2, H2);
      cam.aspect = W2 / H2;
      cam.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    // Animation loop
    let t = 0;
    (function animate() {
      requestAnimationFrame(animate);
      t += 0.008;
      group.rotation.y = Math.sin(t * 0.4) * 0.18 + mx * 0.35;
      group.rotation.x = Math.sin(t * 0.3) * 0.12 - my * 0.25;
      group.rotation.z = Math.sin(t * 0.25) * 0.06;
      orbs.forEach(o => {
        o.position.y = o.userData.oy + Math.sin(t * o.userData.spd + o.userData.off) * 0.35;
        o.rotation.y += 0.015;
      });
      renderer.render(scene, cam);
    })();
  }


  /* ═══════════════════════════════════════════
     7. SEARCH / FILTER CARDS (bonus feature)
     Filters the health grid by keyword.
     Attach to any <input> with id="card-search"
  ═══════════════════════════════════════════ */
  AroMi.filterCards = function (query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.hc[data-topic]').forEach(card => {
      const id = card.dataset.topic;
      const topic = TOPICS.find(t => t.id === id);
      if (!topic) return;
      const match = !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.desc.toLowerCase().includes(q) ||
        topic.foods.some(f => f.toLowerCase().includes(q)) ||
        topic.exer.some(e => e.toLowerCase().includes(q));
      card.style.display = match ? '' : 'none';
    });
  };

  const searchInput = document.getElementById('card-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => AroMi.filterCards(e.target.value));
  }


  /* ═══════════════════════════════════════════
     8. INIT
  ═══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    buildMiniChart();
    initReveal();
  });

  window.addEventListener('load', () => {
    initThree();
  });

})();