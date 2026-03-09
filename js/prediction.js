/**
 * prediction.js — AroMi Prediction Form Module
 * ─────────────────────────────────────────────────────────────────
 * Handles:
 *  • Opening the prediction modal (from hero button or topic cards)
 *  • Pre-filling body area when opened from a health topic card
 *  • Live BMI calculation + category display as user types
 *  • Stress level visual indicator
 *  • Full form validation with inline error messages
 *  • Collecting all 11 fields and redirecting to prediction-results.html
 *  • Saving last-used form values to localStorage (UX convenience)
 *  • "Reset form" helper
 *
 * Depends on: navbar.js (for AroMi.openModal, AroMi.toast)
 *             cards.js  (for AroMi.topics — optional, for body area map)
 * Usage: <script src="js/navbar.js"></script>
 *        <script src="js/cards.js"></script>
 *        <script src="js/prediction.js"></script>
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  window.AroMi = window.AroMi || {};

  /* ═══════════════════════════════════════════
     1. OPEN PREDICTION MODAL
     Called from hero button or health card modal.
     Optional: pass a bodyArea string to pre-select it.
  ═══════════════════════════════════════════ */
  AroMi.openPredModal = function (bodyArea) {
    restoreFormValues();         // Re-fill from last session
    AroMi.openModal('pred-modal');

    // Pre-select the body area if provided (from topic card shortcut)
    if (bodyArea) {
      const sel = document.querySelector('[name="body_area"]');
      if (sel) {
        // Find matching option (partial match friendly)
        const opt = Array.from(sel.options).find(o =>
          o.value.toLowerCase().includes(bodyArea.toLowerCase()) ||
          bodyArea.toLowerCase().includes(o.value.toLowerCase())
        );
        if (opt) {
          sel.value = opt.value;
          triggerBodyAreaUpdate(opt.value);
        }
      }
    }
  };

  // Legacy alias used by inline onclick in home.html
  window.openPred = () => AroMi.openPredModal();


  /* ═══════════════════════════════════════════
     2. BODY AREA VISUAL HINT
     Shows a coloured emoji hint when a body area
     is selected, so users feel the form is smart.
  ═══════════════════════════════════════════ */
  const bodyAreaIcons = {
    'Brain / Head':         { icon: '🧠', color: '#8b5cf6' },
    'Eyes':                 { icon: '👁️', color: '#6366f1' },
    'Ears':                 { icon: '👂', color: '#a78bfa' },
    'Heart / Chest':        { icon: '❤️', color: '#ef4444' },
    'Lungs / Respiratory':  { icon: '🫁', color: '#06b6d4' },
    'Liver / Digestive':    { icon: '🫀', color: '#f59e0b' },
    'Kidneys / Urinary':    { icon: '🩺', color: '#10b981' },
    'Bones / Joints':       { icon: '🦴', color: '#64748b' },
    'Skin':                 { icon: '✨', color: '#ec4899' },
    'Mental Health':        { icon: '🧘', color: '#8b5cf6' },
    'Immunity / General':   { icon: '🛡️', color: '#10b981' },
    'Other':                { icon: '🔍', color: '#6b7280' },
  };

  function triggerBodyAreaUpdate(value) {
    const info = bodyAreaIcons[value];
    const hint = document.getElementById('body-area-hint');
    if (hint && info) {
      hint.textContent = info.icon + ' ' + value;
      hint.style.color = info.color;
      hint.style.display = 'inline-flex';
    } else if (hint) {
      hint.style.display = 'none';
    }
  }


  /* ═══════════════════════════════════════════
     3. LIVE BMI CALCULATOR
     Updates #bmi-preview as height/weight are typed.
     Same values are passed to prediction-results.html.
  ═══════════════════════════════════════════ */
  function updateBMI() {
    const heightEl = document.getElementById('f-height') ||
                     document.querySelector('[name="height"]');
    const weightEl = document.getElementById('f-weight') ||
                     document.querySelector('[name="weight"]');
    const preview  = document.getElementById('bmi-preview');
    const bmiVal   = document.getElementById('bmi-val');
    const bmiCat   = document.getElementById('bmi-cat');

    if (!heightEl || !weightEl || !preview) return;

    const h = parseFloat(heightEl.value);
    const w = parseFloat(weightEl.value);

    if (!h || !w || h < 50 || h > 280 || w < 5 || w > 500) {
      preview.style.display = 'none';
      return;
    }

    const bmi = (w / Math.pow(h / 100, 2)).toFixed(1);
    const { cat, color, emoji } = getBMICategory(parseFloat(bmi));

    if (bmiVal) bmiVal.textContent = bmi;
    if (bmiCat) {
      bmiCat.textContent = `(${cat}) ${emoji}`;
      bmiCat.style.color = color;
    }
    preview.style.display = 'block';
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return { cat: 'Underweight', color: '#f59e0b', emoji: '⚠️' };
    if (bmi < 25)   return { cat: 'Normal',       color: '#10b981', emoji: '✅' };
    if (bmi < 30)   return { cat: 'Overweight',   color: '#f59e0b', emoji: '⚠️' };
    return                  { cat: 'Obese',        color: '#ef4444', emoji: '🔴' };
  }

  // Expose so home.html inline handler can call it
  window.updateBMIPreview = updateBMI;


  /* ═══════════════════════════════════════════
     4. STRESS LEVEL VISUAL INDICATOR
     Colors the stress select border based on level.
  ═══════════════════════════════════════════ */
  function updateStressIndicator(value) {
    const sel = document.querySelector('[name="stress"]');
    if (!sel) return;
    const colors = {
      Low:      '#10b981',
      Moderate: '#f59e0b',
      High:     '#ef4444',
      Severe:   '#dc2626'
    };
    sel.style.borderColor = colors[value] || 'rgba(196,181,253,.45)';
    sel.style.boxShadow = value !== 'Low'
      ? `0 0 0 3px ${colors[value]}22`
      : '';
  }


  /* ═══════════════════════════════════════════
     5. FORM VALIDATION
     Returns { valid: bool, errors: { fieldName: message } }
  ═══════════════════════════════════════════ */
  function validateForm(form) {
    const errors = {};

    const age = parseInt(form.age?.value);
    if (!age || age < 1 || age > 120) {
      errors.age = 'Please enter a valid age (1–120)';
    }

    if (!form.gender?.value) {
      errors.gender = 'Please select your gender';
    }

    const symptoms = form.symptoms?.value?.trim();
    if (!symptoms || symptoms.length < 3) {
      errors.symptoms = 'Please describe your symptoms (at least 3 characters)';
    }

    if (!form.body_area?.value) {
      errors.body_area = 'Please select a health area';
    }

    const h = parseFloat(form.height?.value);
    const w = parseFloat(form.weight?.value);
    if (form.height?.value && (h < 50 || h > 280)) {
      errors.height = 'Height must be between 50–280 cm';
    }
    if (form.weight?.value && (w < 5 || w > 500)) {
      errors.weight = 'Weight must be between 5–500 kg';
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    field.style.borderColor = '#ef4444';
    field.style.boxShadow = '0 0 0 3px rgba(239,68,68,.12)';

    // Remove any existing error
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();

    const errEl = document.createElement('div');
    errEl.className = 'field-error';
    errEl.style.cssText = 'font-size:11px;color:#ef4444;margin-top:4px;font-weight:500;';
    errEl.textContent = '⚠️ ' + message;
    field.parentElement.appendChild(errEl);
  }

  function clearFieldErrors(form) {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    });
  }


  /* ═══════════════════════════════════════════
     6. SAVE / RESTORE FORM VALUES
     Remembers last-used values in localStorage
     so returning users don't have to re-type.
  ═══════════════════════════════════════════ */
  const STORAGE_KEY = 'aromi_pred_form';

  function saveFormValues(form) {
    try {
      const data = {};
      ['age', 'gender', 'body_area', 'conditions', 'sleep', 'exercise',
       'height', 'weight', 'diet', 'stress'].forEach(name => {
        const el = form[name];
        if (el && el.value) data[name] = el.value;
      });
      // Don't save symptoms (private health info)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function restoreFormValues() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      const form = document.getElementById('pred-form');
      if (!form) return;
      Object.entries(data).forEach(([name, value]) => {
        const el = form[name];
        if (el) el.value = value;
      });
      // Trigger live updates after restore
      updateBMI();
      if (data.stress) updateStressIndicator(data.stress);
      if (data.body_area) triggerBodyAreaUpdate(data.body_area);
    } catch (_) {}
  }

  AroMi.resetPredForm = function () {
    const form = document.getElementById('pred-form');
    if (form) {
      form.reset();
      clearFieldErrors(form);
      const preview = document.getElementById('bmi-preview');
      if (preview) preview.style.display = 'none';
      localStorage.removeItem(STORAGE_KEY);
    }
  };


  /* ═══════════════════════════════════════════
     7. FORM SUBMIT HANDLER
     ─────────────────────────────────────────
     Collects all 11 fields → URLSearchParams
     → navigates to prediction-results.html

     prediction-results.html reads each param:
       const p = new URLSearchParams(location.search)
       p.get('age'), p.get('gender'), p.get('symptoms')
       p.get('body_area'), p.get('conditions')
       p.get('sleep'), p.get('exercise')
       p.get('height'), p.get('weight')
       p.get('diet'), p.get('stress')
     → passes all to Claude AI for personalized analysis
  ═══════════════════════════════════════════ */
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    clearFieldErrors(form);

    // Validate
    const { valid, errors } = validateForm(form);
    if (!valid) {
      Object.entries(errors).forEach(([field, msg]) => showFieldError(field, msg));
      const firstError = form.querySelector('.field-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      AroMi.toast('Please fix the highlighted fields', 'warning');
      return;
    }

    // Save for next visit
    saveFormValues(form);

    // Loading state
    const btn = document.getElementById('analyze-btn') ||
                form.querySelector('[type="submit"]');
    if (btn) {
      btn.innerHTML = '⏳ Analyzing…';
      btn.disabled = true;
    }

    // Collect all 11 fields into a plain object
    const data = {
      age:        (form.age?.value || '').trim(),
      gender:     form.gender?.value || '',
      symptoms:   (form.symptoms?.value || '').trim() || 'General checkup',
      body_area:  form.body_area?.value || '',
      conditions: (form.conditions?.value || '').trim() || 'None',
      sleep:      form.sleep?.value || '7–8 hours',
      exercise:   form.exercise?.value || '3–4x / week',
      height:     (form.height?.value || '').trim(),
      weight:     (form.weight?.value || '').trim(),
      diet:       form.diet?.value || 'Balanced / Mixed',
      stress:     form.stress?.value || 'Low'
    };

    // Build URL query string
    // Every key name matches exactly what prediction-results.html reads
    const params = new URLSearchParams(data);

    // Small delay so user sees the loading state, then navigate
    // TODO: When backend ready, POST to /api/predict and use returned prediction_id
    setTimeout(() => {
      window.location.href = 'prediction-results.html?' + params.toString();
    }, 400);
  }


  /* ═══════════════════════════════════════════
     8. CHARACTER COUNTER FOR SYMPTOMS FIELD
  ═══════════════════════════════════════════ */
  function addSymptomCounter() {
    const textarea = document.querySelector('[name="symptoms"]');
    if (!textarea) return;

    const counter = document.createElement('div');
    counter.style.cssText = 'font-size:11px;color:#9ca3af;text-align:right;margin-top:3px;';
    counter.textContent = '0 / 500';
    textarea.parentElement.appendChild(counter);

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / 500`;
      counter.style.color = len > 450 ? '#ef4444' : '#9ca3af';
      if (len > 500) textarea.value = textarea.value.slice(0, 500);
    });
  }


  /* ═══════════════════════════════════════════
     9. ATTACH ALL EVENT LISTENERS
  ═══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pred-form');
    if (!form) return;

    // Main submit
    form.addEventListener('submit', handleSubmit);

    // Live BMI
    ['height', 'weight'].forEach(name => {
      const el = form[name];
      if (el) el.addEventListener('input', updateBMI);
    });

    // Body area visual hint
    const bodyAreaSel = form.body_area;
    if (bodyAreaSel) {
      bodyAreaSel.addEventListener('change', e => triggerBodyAreaUpdate(e.target.value));
    }

    // Stress level indicator
    const stressSel = form.stress;
    if (stressSel) {
      stressSel.addEventListener('change', e => updateStressIndicator(e.target.value));
      updateStressIndicator(stressSel.value); // Set initial colour
    }

    // Clear error on input
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
        const err = el.parentElement.querySelector('.field-error');
        if (err) err.remove();
      });
    });

    // Symptom counter
    addSymptomCounter();

    // Restore last-used values (age, gender, etc. — not symptoms)
    restoreFormValues();
  });

})();