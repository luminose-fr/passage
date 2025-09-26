const App = (() => {

  /* ------------ NAV OVERLAY ------------ */
  const NavOverlay = (() => {
    let navShell, menuBtn, overlay, panel;

    const close = () => {
      if (!overlay || overlay.classList.contains('is-hidden')) return;
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      navShell.classList.remove('is-open');
    };

    const open = () => {
      if (!overlay || !overlay.classList.contains('is-hidden')) return;
      overlay.classList.remove('is-hidden');
      overlay.removeAttribute('aria-hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      navShell.classList.add('is-open');
    };

    const toggle = () => {
      overlay.classList.contains('is-hidden') ? open() : close();
    };

    const bindEvents = () => {
      menuBtn.addEventListener('click', toggle);
      panel && panel.addEventListener('click', e => {
        if (e.target.closest('a')) close();
      });
      document.addEventListener('click', e => {
        if (!e.target.closest('.nav-shell, #mobile-overlay, .nav-menu-button')) close();
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    };

    const init = () => {
      navShell = document.querySelector('.floating-nav .nav-shell');
      menuBtn  = document.querySelector('.nav-menu-button');
      overlay  = document.getElementById('mobile-overlay');
      panel    = overlay ? overlay.querySelector('.mobile-panel') : null;
      if (!navShell || !menuBtn || !overlay) return;
      bindEvents();
    };

    return { init };
  })();

  /* ------------ CARD TOGGLE ------------ */
const CardToggle = (() => {

  const toggle = (button, secondary) => {
    const isHidden = secondary.classList.contains('is-hidden');
    if (isHidden) {
      secondary.classList.remove('is-hidden');
      secondary.setAttribute('aria-hidden','false');
      button.classList.add('is-open');
    } else {
      secondary.classList.add('is-hidden');
      secondary.setAttribute('aria-hidden','true');
      button.classList.remove('is-open');
    }
  };

  const bindEvents = button => {
    const card = button.closest('.card');
    if (!card) return;
    const secondary = card.querySelector('.secondaire');
    if (!secondary) return;

    button.addEventListener('click', () => toggle(button, secondary));
  };

  const init = () => {
    const buttons = document.querySelectorAll('.card .plus');
    buttons.forEach(bindEvents);
  };

  return { init };
})();

/* ------------ FAQ TOGGLE ------------ */
const FAQ = (() => {
  const init = () => {
    const container = document.querySelector('.faq-container');
    if (!container) return;

    const questions = container.querySelectorAll('.faq-question');
    const answers   = container.querySelectorAll('.faq-answer');
    const panel     = container.querySelector('.faq-panel');
    const backBtn   = panel.querySelector('.faq-back');
    const menu      = container.querySelector('.faq-menu');

    const isTouch = window.matchMedia('(max-width: 1023px)').matches;

    questions.forEach((q, i) => {
      q.addEventListener('click', () => {
        answers.forEach(a => a.classList.remove('is-active'));
        answers[i].classList.add('is-active');

        if (isTouch) {
          container.classList.add('show-panel');
          panel.classList.add('is-visible');
        } else {
          container.classList.add('has-selection');
          panel.classList.add('is-visible');
          questions.forEach(x => x.classList.remove('is-active'));
          q.classList.add('is-active');
        }
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (isTouch) {
          container.classList.remove('show-panel');
          panel.classList.remove('is-visible');
        }
      });
    }
  };
  return { init };
})();

 /* ------------ CAROUSEL (v2: tactile robuste, disabling simple on touch single-slide, debug) ------------ */
const Carousel = (() => {
  const carouselsSelector = '[data-carousel]';
  const H_SWIPE_THRESHOLD_PX = 50; // seuil minimum en px pour valider un changement de slide
  const MIN_HORIZONTAL_START = 6; // px pour considérer qu'on commence un drag horizontal
  const DEBUG = true; // passe à false en prod

  function createDebugDiv(carousel) {
    let dbg = carousel.querySelector('.carousel-debug');
    if (!dbg) {
      dbg = document.createElement('div');
      dbg.className = 'carousel-debug';
      dbg.style.cssText = 'font-size:12px;padding:.5rem;margin-top:.5rem;color:#222;background:rgba(0,0,0,0.04);border-radius:.25rem;';
      carousel.appendChild(dbg);
    }
    return dbg;
  }

  function logDebug(carousel, message, append = false) {
    if (!DEBUG) return;
    const dbg = createDebugDiv(carousel);
    if (append) dbg.textContent += '\n' + message;
    else dbg.textContent = message;
    // also console for devtools
    console.log('[Carousel]', message);
  }

  function initCarousel(carousel) {
    if (carousel.dataset.carouselInit) return; // idempotent
    carousel.dataset.carouselInit = '1';

    const track = carousel.querySelector('.carousel-track');
    if (!track) return;
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dotsWrap = carousel.querySelector('.carousel-dots');

    let dots = [];
    // create dots if wrapper exists and no dots yet
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Aller à la diapo ${i + 1}`);
        dotsWrap.appendChild(dot);
        return dot;
      });
    }

    // state
    let current = 0;
    const lastIndex = slides.length - 1;

    function clampIndex(idx) {
      if (idx < 0) return 0;
      if (idx > lastIndex) return lastIndex;
      return idx;
    }

    function updateUI() {
      // transform to the current slide
      track.style.transition = 'transform 280ms ease';
      track.style.transform = `translateX(-${current * 100}%)`;

      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));

      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === lastIndex;
    }

    function goTo(index) {
      const idx = clampIndex(index);
      if (idx === current) {
        updateUI(); // snap back
        return;
      }
      current = idx;
      updateUI();
    }

    // buttons & dots handlers (safe on touch devices too)
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Decide whether to enable swipe on this carousel (touch devices)
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    // override via data attribute: data-carousel-touch="off"
    const forcedTouchOff = carousel.dataset.carouselTouch === 'off' || carousel.dataset.carouselTouch === 'false';
    // default: disable swipe on touch if only 1 slide (case accueil)
    const autoDisable = isTouchDevice && slides.length <= 1;

    const enableSwipe = !forcedTouchOff && !(autoDisable);

    if (!enableSwipe) {
      carousel.classList.add('carousel-no-swipe');
      // make sure track doesn't steal vertical scrolling
      track.style.touchAction = 'pan-y';
      logDebug(carousel, `Swipe disabled (isTouchDevice=${isTouchDevice}, slides=${slides.length})`);
      updateUI();
      return;
    }

    // --- TOUCH HANDLING (passive:false to allow preventDefault when horizontal) ---
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isDragging = false;
    let tracking = false;
    let containerWidth = 0;

    function onTouchStart(e) {
      if (!e.touches || e.touches.length > 1) return; // ignore multi-touch
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      deltaX = 0; deltaY = 0;
      isDragging = false;
      tracking = true;
      containerWidth = track.clientWidth || carousel.clientWidth || window.innerWidth;
      track.style.transition = 'none'; // follow finger
      logDebug(carousel, `touchstart startX=${startX}`);
    }

    function onTouchMove(e) {
      if (!tracking) return;
      if (!e.touches || e.touches.length > 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      deltaX = x - startX;
      deltaY = y - startY;

      // if not yet considered dragging, determine axis dominance
      if (!isDragging) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > MIN_HORIZONTAL_START) {
          isDragging = true;
          // we now decide to prevent vertical page scroll so user can swipe
          // preventDefault only when horizontal drag detected
          e.preventDefault();
          logDebug(carousel, `start horizontal drag (deltaX=${Math.round(deltaX)})`, true);
        } else {
          // not a horizontal drag -> let page scroll
          return;
        }
      } else {
        // already dragging -> preventDefault to keep control
        e.preventDefault();
      }

      // compute percent to move
      const percent = (deltaX / (containerWidth || window.innerWidth)) * 100;

      // clamp so we don't allow dragging past bounds (no bounce)
      let allowedPercent = percent;
      if (current === 0 && percent > 0) {
        // at first slide, disallow movement to right (no negative index)
        allowedPercent = 0;
      } else if (current === lastIndex && percent < 0) {
        // at last slide, disallow movement to left
        allowedPercent = 0;
      }

      // apply transform relative to current
      track.style.transform = `translateX(calc(${-current * 100}% + ${allowedPercent}%))`;
      logDebug(carousel, `touchmove dx=${Math.round(deltaX)} percent=${allowedPercent.toFixed(2)}`, true);
    }

    function onTouchEnd(/*e*/) {
      if (!tracking) return;
      tracking = false;
      track.style.transition = 'transform 240ms ease';

      if (!isDragging) {
        updateUI();
        logDebug(carousel, 'touchend (not dragging) — returning', true);
        return;
      }

      // decide slide change by px threshold
      if (Math.abs(deltaX) > H_SWIPE_THRESHOLD_PX) {
        if (deltaX < 0 && current < lastIndex) {
          logDebug(carousel, `swipe left -> goTo(${current + 1})`, true);
          goTo(current + 1);
        } else if (deltaX > 0 && current > 0) {
          logDebug(carousel, `swipe right -> goTo(${current - 1})`, true);
          goTo(current - 1);
        } else {
          logDebug(carousel, 'swipe beyond bounds — snap back', true);
          updateUI();
        }
      } else {
        // not enough movement
        logDebug(carousel, `swipe too small (${Math.round(deltaX)}px) — snap back`, true);
        updateUI();
      }

      // reset
      isDragging = false;
      deltaX = 0; deltaY = 0;
    }

    // Use non-passive listeners so we can call preventDefault() when we detect horizontal drag
    track.addEventListener('touchstart', onTouchStart, { passive: true }); // touchstart can be passive
    // touchmove must be non-passive
    track.addEventListener('touchmove', onTouchMove, { passive: false });
    track.addEventListener('touchend', onTouchEnd, { passive: true });
    track.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // initialize UI
    updateUI();
    logDebug(carousel, `Swipe enabled (slides=${slides.length})`);
  } // initCarousel

  function initAll() {
    const nodes = Array.from(document.querySelectorAll(carouselsSelector));
    nodes.forEach(c => initCarousel(c));
  }

  return { init: initAll };
})();

  /* ------------ COOKIE BANNER ------------ */
  const CookieBanner = (() => {
    let banner, accept, decline;

    const grantConsent = () => {
      localStorage.setItem('analyticsConsent', 'granted');
      banner.hidden = true;
      window.analyticsConsent = 'granted';
      track('consent_granted');
    };

    const denyConsent = () => {
      localStorage.setItem('analyticsConsent', 'denied');
      banner.hidden = true;
      window.analyticsConsent = 'denied';
      console.log('Analytics disabled by user');
    };

    const init = () => {
      banner = document.querySelector('.cookie-banner');
      if (!banner) return;

      const consent = localStorage.getItem('analyticsConsent') || 'unset';
      if (consent === 'unset') banner.hidden = false;

      accept  = banner.querySelector('[data-accept-analytics]');
      decline = banner.querySelector('[data-decline-analytics]');

      accept?.addEventListener('click', grantConsent);
      decline?.addEventListener('click', denyConsent);
    };

    return { init };
  })();

  /* ------------ UTM parameters propagation  ------------ */
  const UTMParamsPropagation = (() => {
    const init = () => {
      // use URLSerachParams to get strings <- does not work in Internet Explorer
      let deleteParams = [];
      const utmParamQueryString = new URLSearchParams(window.location.search);

      utmParamQueryString.forEach(function(value, key) {
        if (!key.startsWith("utm_")) {
          deleteParams.push(key);
        }
      });
      deleteParams.forEach(function(value, key) {
        utmParamQueryString.delete(value);
      });

      if (utmParamQueryString) {
        // get all the links on the page
        document.querySelectorAll("a").forEach(function(item) {
          if (item.href && item.href != "") {
            const checkUrl = new URL(item.href);
            // if the links hrefs are not navigating to the same domain, then skip processing them
            if (checkUrl.host === location.host) {
              let doNotProcess = false;
              const linkSearchParams = new URLSearchParams(checkUrl.search);
              linkSearchParams.forEach(function(value, key) {
                if (key.startsWith("utm_")) doNotProcess = true;
              });
              if (doNotProcess) return;
              checkUrl.search = new URLSearchParams({
                ...Object.fromEntries(utmParamQueryString),
                ...Object.fromEntries(linkSearchParams),
              });
              item.href = checkUrl.href;
            }
          }
        });
      }
    };

    return { init };
  })();

    /* ------------ ADEQUATION MODULE – v14 (CALENDLY INLINE WIDGET — NO IFRAME) ------------ */
      const Adequation = (() => {
        // --------- CONFIG ----------
        const WEBHOOK_URL = "https://hook.eu1.make.com/98lq6so7rouba4l94h7god7copua3kpu";
        const CALENDLY_URL = "https://calendly.com/luminose/le-seuil-la-rencontre?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=86285A&text_color=86285A";
        const DRAFT_KEY = "leSeuil_draft_v14";
        const DRAFT_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 jours
        const FETCH_TIMEOUT_MS = 30000; // 30s
        const serverMsgElId = "ade-server-message";

        // --------- STATE / DOM ----------
        let rootForm, steps;
        let currentStepIndex = 0;
        let autosaveTimer = null;

        // helpers
        const $ = (s, ctx = document) => (ctx || document).querySelector(s);
        const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
        const show = el => el && el.classList.remove("is-hidden");
        const hide = el => el && el.classList.add("is-hidden");
        const nowISO = () => new Date().toISOString();

        /* ---------- INIT ---------- */
        function initDOM() {
          rootForm = $("#adequation-form");
          if (!rootForm) return;
          steps = $$("[data-step]", rootForm);

          // nav
          rootForm.querySelectorAll(".ade-next").forEach(btn => btn.addEventListener("click", handleNextClick));
          rootForm.querySelectorAll(".ade-prev").forEach(btn => btn.addEventListener("click", handlePrevClick));

          // reprise
          $("#ade-resume")?.addEventListener("click", handleResume);

          // reset
          rootForm.querySelectorAll(".ade-reset").forEach(btn => btn.addEventListener("click", handleReset));

          // fermer (croix)
          rootForm.querySelectorAll(".adequation-close").forEach(btn =>
            btn.addEventListener("click", e => {
              e.preventDefault();
              goToStepByName("0", { scrollTop: true });
            })
          );

          // submit
          rootForm.addEventListener("submit", handleSubmit);

          // validation UI + autosave
          attachValidationFeedback();

          // decide starting step
          const draft = loadDraft();
          if (draft?.valid) goToStepByName("0b");
          else goToStepByName("0");
        }

        /* ---------- navigation ---------- */
        function getStepIndexByName(name) {
          return steps.findIndex(s => s.dataset.step === String(name));
        }

        function goToStep(index, opts = { scrollTop: true }) {
          steps.forEach((s, i) => (i === index ? show(s) : hide(s)));
          currentStepIndex = index;
          if (opts.scrollTop) scrollContainerTop();
        }

        function goToStepByName(name, opts = { scrollTop: true }) {
          const idx = getStepIndexByName(name);
          if (idx >= 0) goToStep(idx, opts);
        }

        function scrollContainerTop() {
          requestAnimationFrame(() => {
            const active = steps[currentStepIndex];
            if (!active) return;
            try { active.scrollTo({ top: 0, behavior: "smooth" }); }
            catch { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { document.documentElement.scrollTop = 0; } }
          });
        }

        function handleNextClick(e) {
          e.preventDefault();

          const stepName = steps[currentStepIndex].dataset.step;

          // 1) step 0 / 0b -> pas de validation (simple transition)
          if (["0", "0b"].includes(stepName)) {
            goToStep(Math.min(steps.length - 1, currentStepIndex + 1));
            return;
          }

          // 2) valider uniquement l'étape courante
          if (!validateStep(currentStepIndex)) {
            focusFirstInvalid(currentStepIndex);
            return;
          }

          // 3) exclusions spécifiques (immédiates)
          if (["1", "2"].includes(stepName)) {
            const excl = checkExclusions(stepName);
            if (excl.excluded) { handleExclusion(); return; }
          }

          goToStep(Math.min(steps.length - 1, currentStepIndex + 1));
        }

        function handlePrevClick(e) {
          e.preventDefault();
          goToStep(Math.max(0, currentStepIndex - 1));
        }

        /* ---------- reprise / reset ---------- */
        function handleResume(e) {
          e?.preventDefault();
          const draft = loadDraft();
          if (!draft?.valid) { goToStepByName("0"); return; }
          populateFromFlat(draft.flat);
          goToStepByName("1");
        }

        function handleReset(e) {
          e?.preventDefault();
          localStorage.removeItem(DRAFT_KEY);
          goToStepByName("0");
          hideServerMessage();
        }

        /* ---------- validation UI + autosave ---------- */
        function attachValidationFeedback() {
          if (!rootForm) return;
          const controls = $$("input,textarea,select", rootForm);

          controls.forEach(el => {
            el.dataset.touched = "0";
            el.dataset.everValid = (el.value?.toString().trim().length > 0) ? "1" : "0";

            // autosave
            el.addEventListener("input", debouncedSaveDraft);
            el.addEventListener("change", debouncedSaveDraft);

            if (el.type === "radio") {
              const radios = $$(`[name="${el.name}"]`, rootForm);
              radios.forEach(r => r.addEventListener("change", () => {
                radios.forEach(rr => { rr.classList.remove("is-success", "is-danger"); rr.removeAttribute("aria-invalid"); });
                const checked = rootForm.querySelector(`[name="${el.name}"]:checked`);
                if (checked) { checked.classList.add("is-success"); checked.dataset.touched = "1"; checked.dataset.everValid = "1"; updateIcon(checked.closest(".control"), true); }
              }));
            } else if (el.type === "checkbox") {
              el.addEventListener("change", () => {
                el.dataset.touched = "1";
                if (el.checked) { el.classList.add("is-success"); el.classList.remove("is-danger"); el.dataset.everValid = "1"; updateIcon(el.closest(".control"), true); }
                else { el.classList.remove("is-success"); if (el.dataset.everValid === "1") { el.classList.add("is-danger"); updateIcon(el.closest(".control"), false); } else { updateIcon(el.closest(".control"), null); } }
              });
            } else {
              el.addEventListener("input", () => {
                const val = (el.value || "").toString().trim();
                if (val.length > 0) { el.dataset.everValid = "1"; el.classList.add("is-success"); el.classList.remove("is-danger"); updateIcon(el.closest(".control"), true); }
                else { el.classList.remove("is-success"); if (el.classList.contains("is-danger")) updateIcon(el.closest(".control"), false); else updateIcon(el.closest(".control"), null); }
              });

              el.addEventListener("blur", () => {
                el.dataset.touched = "1";
                const val = (el.value || "").toString().trim();
                const valid = el.type === "email" ? el.checkValidity() : val.length > 0;
                if (valid) { el.dataset.everValid = "1"; el.classList.add("is-success"); el.classList.remove("is-danger"); updateIcon(el.closest(".control"), true); }
                else if (el.dataset.everValid === "1" || rootForm.dataset.submitted === "1") { el.classList.remove("is-success"); el.classList.add("is-danger"); updateIcon(el.closest(".control"), false); }
                else { el.classList.remove("is-success","is-danger"); updateIcon(el.closest(".control"), null); }
              });
            }
          });
        }

        function updateIcon(container, valid) {
          if (!container) return;
          const iconEl = container.querySelector(".icon.is-small.is-right i.fas");
          if (!iconEl) return;
          iconEl.classList.remove("fa-check", "fa-exclamation-triangle");
          if (valid === true) iconEl.classList.add("fa-check"); else if (valid === false) iconEl.classList.add("fa-exclamation-triangle");
        }

        function debouncedSaveDraft() {
          if (autosaveTimer) clearTimeout(autosaveTimer);
          autosaveTimer = setTimeout(saveDraft, 300);
        }

        /* ---------- validation (par étape) ---------- */
        function validateStep(index) {
          const step = steps[index];
          if (!step) return true;
          const requiredEls = Array.from(step.querySelectorAll("[required]"));
          let ok = true;
          const processedRadio = new Set();

          for (const el of requiredEls) {
            if (!el.name) continue;

            if (el.type === "radio") {
              if (processedRadio.has(el.name)) continue;
              processedRadio.add(el.name);

              const checked = rootForm.querySelector(`[name="${el.name}"]:checked`);
              const radios = Array.from(rootForm.querySelectorAll(`[name="${el.name}"]`));
              if (!checked) { radios.forEach(r => r.classList.add("is-danger")); ok = false; }
              else { radios.forEach(r => r.classList.remove("is-danger")); checked.classList.add("is-success"); }
            } else if (el.type === "checkbox") {
              if (!el.checked) { el.classList.add("is-danger"); ok = false; } else { el.classList.add("is-success"); }
            } else {
              const val = (el.value || "").toString().trim();
              const valid = el.type === "email" ? el.checkValidity() : val.length > 0;
              if (!valid) { el.classList.add("is-danger"); ok = false; } else { el.classList.add("is-success"); }
            }
          }

          // set danger style on submit button if needed
          const submitBtn = rootForm.querySelector('button[type="submit"], #ade-submit');
          if (submitBtn) submitBtn.classList.toggle('is-danger', !ok);

          return ok;
        }

        function focusFirstInvalid(index) {
          const step = steps[index];
          if (!step) return;
          const firstError = step.querySelector(".is-danger, :invalid, [required]");
          if (firstError && typeof firstError.focus === "function") {
            try { firstError.focus({ preventScroll: true }); } catch {}
          }
        }

        /* ---------- exclusions (simplifiées & ciblées) ---------- */
        const EXCLUSION_KEYS = {
          "1": ["sante[q_psychotic]", "sante[q_cardio]", "sante[q_pregnancy]", "sante[q_eye_trauma]", "sante[q_psychotrop_recent_trauma]"],
          "2": ["logistique[q_travel]", "logistique[q_slots]", "logistique[q_commit]", "logistique[q_tech]"]
        };

        function checkExclusions(stepName) {
          const keys = EXCLUSION_KEYS[String(stepName)] || [];
          for (const k of keys) {
            const sel = rootForm.querySelector(`[name="${k}"]:checked`);
            if (!sel) continue;
            // step 1: "oui" is exclusion; step 2: "non" is exclusion
            if (String(stepName) === "1" && sel.value === "oui") return { excluded: true };
            if (String(stepName) === "2" && sel.value === "non") return { excluded: true };
          }
          return { excluded: false };
        }

        function handleExclusion() {
          show($("#ade-exclusion"));
          steps.forEach(s => hide(s));
        }

        /* ---------- data & draft ---------- */
        function collectFlat() {
          const fd = new FormData(rootForm);
          const flat = {};
          for (const [k, v] of fd.entries()) {
            if (typeof v === "string") {
              const trimmed = v.toString().trim();
              if (trimmed.length === 0) continue;
              flat[k] = trimmed;
            } else flat[k] = v;
          }
          return flat;
        }

        function collectStateNested() {
          const flat = collectFlat();
          const nested = nestObjectFromFlat(flat);
          nested._submitted_at = nowISO();
          return nested;
        }

        function nestObjectFromFlat(flat) {
          const nested = {};
          for (const key in flat) {
            if (!Object.prototype.hasOwnProperty.call(flat, key)) continue;
            const parts = key.split(/\[|\]/).filter(Boolean);
            let cur = nested;
            for (let i = 0; i < parts.length; i++) {
              const p = parts[i];
              if (i === parts.length - 1) cur[p] = flat[key];
              else { if (!cur[p] || typeof cur[p] !== "object") cur[p] = {}; cur = cur[p]; }
            }
          }
          return nested;
        }

        function saveDraft(opts = {}) {
          try {
            const flat = collectFlat();
            const keys = Object.keys(flat);
            if (!keys.length && !opts.force) { localStorage.removeItem(DRAFT_KEY); return; }
            const wrapper = { ts: nowISO(), flat };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(wrapper));
          } catch (e) { console.warn("saveDraft err", e); }
        }

        function loadDraft() {
          try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            if (!obj?.ts) { localStorage.removeItem(DRAFT_KEY); return null; }
            if (Date.now() - new Date(obj.ts).getTime() > DRAFT_TTL_MS) { localStorage.removeItem(DRAFT_KEY); return null; }
            const flat = obj.flat || {};
            if (!Object.keys(flat).length) { localStorage.removeItem(DRAFT_KEY); return null; }
            return { valid: true, ts: obj.ts, flat };
          } catch (e) { console.warn("loadDraft err", e); return null; }
        }

        function populateFromFlat(flat) {
          for (const k in flat) {
            const els = $$(`[name="${k}"]`, rootForm);
            if (!els.length) continue;
            const val = flat[k];
            els.forEach(el => {
              if (el.type === "radio") el.checked = (el.value === val);
              else if (el.type === "checkbox") el.checked = Array.isArray(val) ? val.includes(el.value) : !!val;
              else el.value = val;
            });
          }
        }

        /* ---------- server message UI ---------- */
        function showServerMessage(message) {
          const el = $(`#${serverMsgElId}`);
          if (!el) { alert(message); return; }
          const details = el.querySelector("#ade-error-details");
          if (details) { details.textContent = message || ""; show(details); }
          show(el);
          steps.forEach(s => hide(s));
        }
        function hideServerMessage() {
          const el = $(`#${serverMsgElId}`);
          if (!el) return;
          const details = el.querySelector("#ade-error-details");
          if (details) { details.textContent = ""; hide(details); }
          hide(el);
        }

        /* ---------- loading ---------- */
        function setFormLoading(state) {
          if (!rootForm) return;
          const submitBtn = rootForm.querySelector('button[type="submit"], #ade-submit');
          if (submitBtn) submitBtn.classList.toggle("is-loading", !!state);
          $$("input,textarea,select,button", rootForm).forEach(c => (c.disabled = !!state));
        }

        function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT_MS) {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          options.signal = controller.signal;
          return fetch(url, options).finally(() => clearTimeout(id));
        }

        /* ---------- submit ---------- */
        async function handleSubmit(e) {
          e.preventDefault();
          rootForm.dataset.submitted = "1";

          // validate every step (final check)
          let allValid = true;
          for (let i = 0; i < steps.length; i++) if (!validateStep(i)) allValid = false;
          if (!allValid) { focusFirstInvalid(currentStepIndex); return; }

          // final exclusion check (both step 1 and 2)
          const excl1 = checkExclusions("1");
          const excl2 = checkExclusions("2");
          if (excl1.excluded || excl2.excluded) { handleExclusion(); return; }

          const payload = collectStateNested();
          const utm_term = getParamFromCurrentPage("utm_term");
          if (utm_term) payload.utm_term = utm_term;
          saveDraft();

          setFormLoading(true);
          hideServerMessage();

          try {
            const resp = await fetchWithTimeout(WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            const bodyText = await resp.text().catch(() => "");

            if (resp.ok) {      
              goToStepByName("5");
              injectCalendly(CALENDLY_URL, payload);
              localStorage.removeItem(DRAFT_KEY);
            } else {
              // show server message; caller can inspect bodyText (Make often returns details)
              showServerMessage(bodyText || `Erreur ${resp.status}`);
            }
          } catch (err) {
            showServerMessage(err?.message || "Erreur réseau : impossible de contacter le serveur.");
          } finally {
            setFormLoading(false);
          }
        }

        function getParamFromCurrentPage(param_name) {
          param_name = param_name.replace(/([\[\]])/g, "\\\$1");
          var regex = new RegExp("[\\?&]" + param_name + "=([^&#]*)"),
            results = regex.exec(window.location.href);
          return results ? results[1] : "";
        }

        function getUtmParams() {
          var utm_params = {
            utmCampaign: getParamFromCurrentPage("utm_campaign"),
            utmSource: getParamFromCurrentPage("utm_source"),
            utmMedium: getParamFromCurrentPage("utm_medium"),
            utmContent: getParamFromCurrentPage("gclid"),
            utmTerm: getParamFromCurrentPage("utm_term")
          }
          return utm_params;
        }

        /* ---------- Calendly inline widget (NO IFRAME fallback) ---------- */
        function injectCalendly(url, payload) {
          const wrap = $("#ade-calendly");
          const utmParams = getUtmParams();
          const prefill = {};
          if (payload.coordonnees.email) prefill.email = payload.coordonnees.email;
          if (payload.coordonnees.first_name) prefill.firstName = payload.coordonnees.first_name;
          if (payload.coordonnees.last_name) prefill.lastName = payload.coordonnees.last_name;

          if (!wrap) return;
          if (!url || String(url).trim().length < 5) { showServerMessage("Calendly non configuré."); return; }
          if (wrap.dataset.loaded === "1") return;

          if (window.Calendly && typeof window.Calendly.initInlineWidget === "function") {
            try {
              // init inline widget (Calendly handles cookies as it wishes; we just use their inline init)
              Calendly.initInlineWidget({
                url: url,
                parentElement: wrap,
                prefill: prefill,
                utm: utmParams,
                resize: true
              });
              wrap.dataset.loaded = "1";
            } catch (err) {
              console.warn("Calendly inline init erreur", err);
              showServerMessage("Erreur lors de l'initialisation du calendrier.");
            }
          } else {
            showServerMessage("Le widget Calendly n'est pas disponible (script manquant).");
          }
          return;
        }

        /* ---------- public init ---------- */
        function init() { initDOM(); }
        return { init };
      })();


  /* ------------ APP INIT ------------ */
  const init = () => {
    NavOverlay.init();
    CardToggle.init();
    FAQ.init();
    Carousel.init();
    CookieBanner.init();
    UTMParamsPropagation.init();
    Adequation.init();
    // console.log('App initialised');
  };

  return { init };

})();


// === Boot on DOM ready
document.addEventListener('DOMContentLoaded', App.init);