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

/* ------------ CAROUSEL ------------ */
const Carousel = (() => {
  let carousels = [];

  const bindEvents = (carousel, track, slides, prevBtn, nextBtn, dots) => {
    let current = 0;
    let startX = 0, deltaX = 0, isDragging = false;

    const updateUI = () => {
      track.style.transform = `translateX(-${current * 100}%)`;

      slides.forEach((s, i) => s.classList.toggle('is-active', i===current));
      dots.forEach((d, i) => d.classList.toggle('is-active', i===current));

      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    };

    const goTo = index => {
      if (index < 0 || index >= slides.length) return;
      current = index;
      updateUI();
    };

    prevBtn.addEventListener('click', () => goTo(current-1));
    nextBtn.addEventListener('click', () => goTo(current+1));

    dots.forEach((dot,i)=> {
      dot.addEventListener('click', () => goTo(i));
    });

    // Touch events (mobile "swipe")
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = true;
      deltaX = 0;
      track.style.transition = "none";
    }, {passive:true});

    track.addEventListener('touchmove', e => {
      if (!isDragging) return;
      deltaX = e.touches[0].clientX - startX;
      const percent = (deltaX/track.offsetWidth)*100;
      track.style.transform = `translateX(calc(${-current*100}% + ${percent}%))`;
    }, {passive:true});

    track.addEventListener('touchend', () => {
      track.style.transition = "";
      if (isDragging) {
        if (deltaX < -50) goTo(current+1);
        else if (deltaX > 50) goTo(current-1);
        else updateUI();
      }
      isDragging = false;
    });

    updateUI();
  };

  const init = () => {
    carousels = document.querySelectorAll('[data-carousel]');
    carousels.forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
      const prevBtn = carousel.querySelector('.carousel-btn.prev');
      const nextBtn = carousel.querySelector('.carousel-btn.next');
      const dotsWrap = carousel.querySelector('.carousel-dots');

      // créer les pastilles dynamiquement si besoin
      const dots = slides.map((_,i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('role','tab');
        dot.setAttribute('aria-label', `Aller à la diapo ${i+1}`);
        dotsWrap.appendChild(dot);
        return dot;
      });

      bindEvents(carousel, track, slides, prevBtn, nextBtn, dots);
    });
  };

  return { init };
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

    /* ------------ ADEQUATION MODULE – v10 (préambule / reprise / fullscreen mobile / autosave + expiry J+3) ------------ */
    const Adequation = (() => {
      // CONFIG — <--- remplace si souhaité
      const WEBHOOK_URL = "https://hook.eu1.make.com/98lq6so7rouba4l94h7god7copua3kpu"; // ex: "https://hook.eu1.make.com/xxxx"
      const CALENDLY_URL = "https://calendly.com/luminose/le-seuil-la-rencontre"; // ex: "https://calendly.com/luminose/le-seuil-la-rencontre"
      const DRAFT_KEY = "leSeuil_draft_v10";
      const DRAFT_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 jours

      // DOM
      let rootForm, steps, sectionEl, closeBtn;
      let currentStepIndex = 0;
      let autosaveTimer = null;

      // helpers
      const $ = (s, ctx = document) => ctx.querySelector(s);
      const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
      const show = el => el && el.classList.remove("is-hidden");
      const hide = el => el && el.classList.add("is-hidden");
      const isMobile = () => window.matchMedia("(max-width: 820px)").matches; // ajustable breakpoint
      const nowISO = () => (new Date()).toISOString();

      // messages d'exclusion
      const EXCLUSION_MAP = {
        "sante[q_psychotic]": "Diagnostic psychotique, épilepsie ou antécédent de convulsions.",
        "sante[q_cardio]": "Pathologie cardiaque ou respiratoire significative non stabilisée.",
        "sante[q_pregnancy]": "Grossesse / post-partum immédiat (<3 mois).",
        "sante[q_eye_trauma]": "Glaucome / chirurgie oculaire récente / traumatisme crânien / fracture non consolidée.",
        "sante[q_psychotrop]": "Traitement psychotrope lourd ou sevrage en cours.",
        "sante[q_recent_trauma]": "Traumatisme aigu très récent nécessitant un suivi médical/psy (<6 semaines).",
        "logistique[q_travel]": "Impossibilité de se rendre en présentiel (séance 2 & 5).",
        "logistique[q_slots]": "Absence de créneaux réguliers pour les visios / présentielles.",
        "logistique[q_commit]": "Impossible de s'engager sur 1–2 h d'intégration par semaine."
      };

      /* ---------- INIT ---------- */
      function initDOM() {
        rootForm = document.getElementById("adequation-form");
        if (!rootForm) return;
        steps = $$("[data-step]", rootForm);
        sectionEl = document.querySelector(".section.adequation");
        closeBtn = sectionEl ? sectionEl.querySelector(".ade-close") : null;

        // navigation via classes
        rootForm.querySelectorAll(".ade-next").forEach(btn => btn.addEventListener("click", handleNextClick));
        rootForm.querySelectorAll(".ade-prev").forEach(btn => btn.addEventListener("click", handlePrevClick));

        // resume/reset buttons (present only if HTML added)
        const resumeBtn = document.getElementById("ade-resume");
        const resetBtn = document.getElementById("ade-reset");
        if (resumeBtn) resumeBtn.addEventListener("click", handleResume);
        if (resetBtn) resetBtn.addEventListener("click", handleReset);

        // close fullscreen
        if (closeBtn) {
          closeBtn.addEventListener("click", () => {
            removeFullscreen();
            // return to preamble (step 0)
            goToStepByName("0", { scrollTop:true });
          });
        }

        // manual review
        const reviewBtn = document.getElementById("ade-request-review");
        if (reviewBtn) reviewBtn.addEventListener("click", () => {
          window.location.href = "mailto:hello@luminose.fr?subject=Demande%20examen%20manuel%20-%20Le%20Seuil";
        });

        // submit
        rootForm.addEventListener("submit", handleSubmit);

        // attach validation & autosave
        attachValidationFeedback();

        // load draft and decide whether to show preambule or reprise
        const draft = loadDraft();
        if (draft && draft.valid) {
          // show step 0b (reprise) if present, otherwise go direct to step 1
          const idx0b = getStepIndexByName("0b");
          if (idx0b >= 0) {
            goToStep(idx0b, { scrollTop:true });
          } else {
            // fallback: go to preamble (0) then show resume buttons etc.
            const idx0 = getStepIndexByName("0");
            goToStep(idx0 >= 0 ? idx0 : 0, { scrollTop:true });
          }
        } else {
          // no draft => show preambule (step 0) (if exists)
          const idx0 = getStepIndexByName("0");
          goToStep(idx0 >= 0 ? idx0 : 0, { scrollTop:true });
        }
      }

      /* ---------- helpers (steps handling) ---------- */
      function getStepIndexByName(name) {
        for (let i = 0; i < steps.length; i++) {
          if (steps[i].dataset.step === String(name)) return i;
        }
        return -1;
      }

      // goToStep by index with options
      function goToStep(index, opts = { scrollTop:true, fullscreenIfMobile:false }) {
        steps.forEach((s, i) => {
          if (i === index) s.classList.remove("is-hidden");
          else s.classList.add("is-hidden");
        });
        currentStepIndex = index;

        // If caller requested fullscreen on mobile, apply it
        if (opts.fullscreenIfMobile && isMobile()) {
          applyFullscreen();
        }

        // scroll to top of the container (works in fullscreen and normal)
        if (opts.scrollTop) scrollContainerTop();

        // update any progress UI if you want (progress bars in markup update automatically if you target them)
      }

      function goToStepByName(name, opts = { scrollTop:true, fullscreenIfMobile:false }) {
        const idx = getStepIndexByName(name);
        if (idx >= 0) goToStep(idx, opts);
      }

      /* ---------- fullscreen management ---------- */
      function applyFullscreen() {
        if (!sectionEl) return;
        sectionEl.classList.add("is-fullscreen");
        document.documentElement.style.overflow = "hidden"; // prevent background scroll on many browsers
        document.body.style.overflow = "hidden";
        if (closeBtn) closeBtn.classList.remove("is-hidden");
      }

      function removeFullscreen() {
        if (!sectionEl) return;
        sectionEl.classList.remove("is-fullscreen");
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        if (closeBtn) closeBtn.classList.add("is-hidden");
      }

      // scroll to top of the relevant container
      function scrollContainerTop() {
        // wait a frame to allow layout changes
        requestAnimationFrame(() => {
          if (sectionEl && sectionEl.classList.contains("is-fullscreen")) {
            // scroll inside the section
            try {
              sectionEl.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
              sectionEl.scrollTop = 0;
            }
          } else {
            // standard window scroll
            try {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } catch (err) {
              document.documentElement.scrollTop = 0;
            }
          }
        });
      }

      /* ---------- navigation handlers ---------- */
      function handleNextClick(e) {
        e.preventDefault();
        // validate current step
        if (!validateStep(currentStepIndex)) {
          focusFirstInvalid(currentStepIndex);
          return;
        }
        // if leaving step 0 (preamble), request fullscreen on mobile
        const currentName = steps[currentStepIndex].dataset.step;
        const leavingPreamble = currentName === "0";
        // early exclusions when leaving health/logistics (steps 1 or 2 depending on your layout)
        if (currentStepIndex <= 1) {
          const excl = checkExclusions();
          if (excl.excluded) { handleExclusion(excl); return; }
        }
        const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
        goToStep(nextIndex, { scrollTop:true, fullscreenIfMobile: leavingPreamble });
      }

      function handlePrevClick(e) {
        e.preventDefault();
        const prevIndex = Math.max(0, currentStepIndex - 1);
        // when navigating back from fullscreen step to preambule, keep fullscreen until explicit close?
        // We'll keep fullscreen until user closes via cross.
        goToStep(prevIndex, { scrollTop:true, fullscreenIfMobile:false });
      }

      /* ---------- resume / reset ---------- */
      function handleResume(e) {
        e.preventDefault();
        const draft = loadDraft();
        if (!draft || !draft.valid) {
          // fallback: go to start
          goToStepByName("0", { scrollTop:true });
          return;
        }
        // populate fields with saved flat data
        populateFromFlat(draft.flat || {});
        // show fullscreen on mobile and go to step 1
        applyFullscreen();
        const idxStep1 = resolveIndexOfFirstRealStep(); // choose appropriate next step (1)
        goToStep(idxStep1, { scrollTop:true });
      }

      function handleReset(e) {
        e.preventDefault();
        localStorage.removeItem(DRAFT_KEY);
        // show preamble (normal) - step 0
        const idx0 = getStepIndexByName("0");
        goToStep(idx0 >= 0 ? idx0 : 0, { scrollTop:true });
      }

      // utility: find index of first non-preamble step (usually step "1")
      function resolveIndexOfFirstRealStep() {
        // prefer dataset.step == "1"
        const idx1 = getStepIndexByName("1");
        if (idx1 >= 0) return idx1;
        // otherwise first element that isn't 0 or 0b
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i].dataset.step;
          if (s !== "0" && s !== "0b") return i;
        }
        return 0;
      }

      /* ---------- validation UI behaviours & autosave ---------- */
      function attachValidationFeedback() {
        const controls = $$("input,textarea,select", rootForm);

        controls.forEach(el => {
          // flags
          el.dataset.touched = el.dataset.touched || "0";
          el.dataset.everValid = (el.value && el.value.toString().trim().length > 0) ? "1" : "0";

          // autosave (debounced)
          el.addEventListener("input", () => debouncedSaveDraft());
          el.addEventListener("change", () => debouncedSaveDraft());

          if (el.type === "radio") {
            // attach change once per radio option in the group - behaviour only affects that group
            const radios = $$(`[name="${el.name}"]`, rootForm);
            radios.forEach(r => {
              r.addEventListener("change", () => {
                // clear classes for that group only
                radios.forEach(rr => {
                  rr.classList.remove("is-success", "is-danger");
                  rr.removeAttribute("aria-invalid");
                });
                const checked = rootForm.querySelector(`[name="${el.name}"]:checked`);
                if (checked) {
                  checked.classList.add("is-success");
                  checked.dataset.touched = "1";
                  updateIconForGroup(checked, true);
                }
              });
            });
          } else if (el.type === "checkbox") {
            el.addEventListener("change", () => {
              el.dataset.touched = "1";
              if (el.checked) {
                el.classList.add("is-success"); el.classList.remove("is-danger");
                el.dataset.everValid = "1";
                updateIcon(el.closest(".control") || el.parentNode, true);
              } else {
                if (el.dataset.everValid === "1") {
                  el.classList.remove("is-success"); el.classList.add("is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, false);
                } else {
                  el.classList.remove("is-success","is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, null);
                }
              }
            });
          } else {
            // text / textarea / select
            el.addEventListener("input", () => {
              const val = (el.value || "").toString().trim();
              if (val.length > 0) {
                el.dataset.everValid = "1";
                el.classList.add("is-success"); el.classList.remove("is-danger");
                updateIcon(el.closest(".control") || el.parentNode, true);
              } else {
                // while typing, remain neutral (no immediate red)
                el.classList.remove("is-success", "is-danger");
                updateIcon(el.closest(".control") || el.parentNode, null);
              }
            });

            el.addEventListener("blur", () => {
              el.dataset.touched = "1";
              const val = (el.value || "").toString().trim();
              if (val.length > 0) {
                el.dataset.everValid = "1";
                el.classList.add("is-success"); el.classList.remove("is-danger");
                updateIcon(el.closest(".control") || el.parentNode, true);
              } else {
                // show error only if field was valid before (everValid === "1") OR if we have attempted submission
                if (el.dataset.everValid === "1" || rootForm.dataset.submitted === "1") {
                  el.classList.remove("is-success"); el.classList.add("is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, false);
                } else {
                  el.classList.remove("is-success","is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, null);
                }
              }
            });
          }
        });
      }

      function updateIcon(container, valid) {
        if (!container) return;
        const iconEl = container.querySelector(".icon.is-small.is-right i.fas") || container.querySelector(".icon i.fas");
        if (!iconEl) return;
        iconEl.classList.remove("fa-check", "fa-exclamation-triangle");
        if (valid === true) iconEl.classList.add("fa-check");
        else if (valid === false) iconEl.classList.add("fa-exclamation-triangle");
      }

      function updateIconForGroup(elInGroup, valid) {
        // find the parent cell/control for the group and update its icon if present
        const parent = elInGroup.closest("td") || elInGroup.closest(".control");
        updateIcon(parent, valid);
      }

      /* debounce for autosave */
      function debouncedSaveDraft() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => saveDraft(), 300);
      }

      /* ---------- step validation ---------- */
      function validateStep(index) {
        const step = steps[index];
        if (!step) return true;
        const requiredEls = Array.from(step.querySelectorAll("[required]"));
        let ok = true;
        const processedRadioNames = new Set();

        for (const el of requiredEls) {
          if (!el.name) continue;
          if (el.type === "radio") {
            if (processedRadioNames.has(el.name)) continue;
            processedRadioNames.add(el.name);
            const checked = rootForm.querySelector(`[name="${el.name}"]:checked`);
            const radios = Array.from(rootForm.querySelectorAll(`[name="${el.name}"]`));
            if (!checked) {
              // mark group as error (only radios of this group)
              radios.forEach(r => r.classList.add("is-danger"));
              const parent = radios[0] && (radios[0].closest("td") || radios[0].closest(".control"));
              updateIcon(parent, false);
              ok = false;
            } else {
              // mark only the checked radio as success, clear danger from group
              radios.forEach(r => r.classList.remove("is-danger"));
              checked.classList.add("is-success");
              const parent = checked.closest("td") || checked.closest(".control");
              updateIcon(parent, true);
            }
          } else if (el.type === "checkbox") {
            if (!el.checked) {
              el.classList.add("is-danger");
              el.classList.remove("is-success");
              updateIcon(el.closest(".control") || el.parentNode, false);
              ok = false;
            } else {
              el.classList.add("is-success");
              el.classList.remove("is-danger");
              updateIcon(el.closest(".control") || el.parentNode, true);
            }
          } else {
            const val = (el.value || "").toString().trim();
            if (val.length === 0) {
              el.classList.add("is-danger");
              el.classList.remove("is-success");
              updateIcon(el.closest(".control") || el.parentNode, false);
              ok = false;
            } else {
              el.classList.add("is-success");
              el.classList.remove("is-danger");
              updateIcon(el.closest(".control") || el.parentNode, true);
            }
          }
        }

        // mark submit if any error found
        const submitBtn = rootForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          if (!ok) submitBtn.classList.add('is-danger');
          else submitBtn.classList.remove('is-danger');
        }

        return ok;
      }

      function focusFirstInvalid(index) {
        const step = steps[index];
        if (!step) return;
        const firstError = step.querySelector(".is-danger, :invalid");
        if (firstError && typeof firstError.focus === "function") {
          firstError.focus({ preventScroll: true });
          return;
        }
        const firstReq = step.querySelector("[required]");
        if (firstReq && typeof firstReq.focus === "function") firstReq.focus({ preventScroll:true });
      }

      /* ---------- exclusions ---------- */
      function checkExclusions() {
        const healthKeys = [
          "sante[q_psychotic]",
          "sante[q_cardio]",
          "sante[q_pregnancy]",
          "sante[q_eye_trauma]",
          "sante[q_psychotrop]",
          "sante[q_recent_trauma]"
        ];
        for (let k of healthKeys) {
          const sel = rootForm.querySelector(`[name="${k}"]:checked`);
          if (sel && sel.value === "oui") return { excluded:true, key:k, reason: EXCLUSION_MAP[k] };
        }
        const logiKeys = [
          "logistique[q_travel]",
          "logistique[q_slots]",
          "logistique[q_commit]"
        ];
        for (let k of logiKeys) {
          const sel = rootForm.querySelector(`[name="${k}"]:checked`);
          if (sel && sel.value === "non") return { excluded:true, key:k, reason: EXCLUSION_MAP[k] };
        }
        return { excluded:false };
      }

      function handleExclusion(obj) {
        const panel = document.getElementById("ade-exclusion");
        const reasonEl = document.getElementById("ade-exclusion-reason");
        if (reasonEl) reasonEl.textContent = obj.reason || "Pour des raisons de sécurité, ce parcours n'est pas adapté.";
        show(panel);
        steps.forEach(s => s.classList.add("is-hidden"));
        panel.scrollIntoView({ behavior: "smooth" });
        // save minimal info for debugging
        localStorage.setItem(DRAFT_KEY + "_excluded", JSON.stringify({ ts: nowISO(), reason: obj.reason }));
      }

      /* ---------- data & draft (flat) ---------- */
      function collectFlat() {
        const fd = new FormData(rootForm);
        const flat = {};
        for (const [k,v] of fd.entries()) {
          if (flat[k] === undefined) flat[k] = v;
          else if (Array.isArray(flat[k])) flat[k].push(v);
          else flat[k] = [flat[k], v];
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
          if (key.startsWith('_')) { nested[key] = flat[key]; continue; }
          const parts = key.split(/\[|\]/).filter(Boolean);
          let cur = nested;
          for (let i=0; i<parts.length; i++) {
            const p = parts[i];
            if (i === parts.length - 1) {
              cur[p] = flat[key];
            } else {
              if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
              cur = cur[p];
            }
          }
        }
        return nested;
      }

      function saveDraft(opts = {}) {
        try {
          const flat = collectFlat();
          const wrapper = { ts: nowISO(), flat };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(wrapper));
        } catch (e) {
          console.warn("saveDraft err", e);
        }
      }

      function loadDraft() {
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          if (!raw) return null;
          const obj = JSON.parse(raw);
          // Check ts exists
          if (!obj || !obj.ts) {
            // fallback: treat as invalid
            localStorage.removeItem(DRAFT_KEY);
            return null;
          }
          const age = (new Date()).getTime() - (new Date(obj.ts)).getTime();
          if (age > DRAFT_TTL_MS) {
            // expired
            localStorage.removeItem(DRAFT_KEY);
            return null;
          }
          return { valid:true, ts: obj.ts, flat: obj.flat || {} };
        } catch (e) {
          console.warn("loadDraft err", e);
          return null;
        }
      }

      function populateFromFlat(flatData) {
        // flatData keys are like "sante[q_psychotic]" or "coordonnees[first_name]"
        Object.keys(flatData).forEach(k => {
          const els = rootForm.querySelectorAll(`[name="${k}"]`);
          if (!els || els.length === 0) return;
          const val = flatData[k];
          els.forEach(el => {
            if (el.type === "radio") {
              if (el.value === val) {
                el.checked = true;
                el.classList.add("is-success");
              } else {
                el.checked = false;
                el.classList.remove("is-success","is-danger");
              }
            } else if (el.type === "checkbox") {
              el.checked = Array.isArray(val) ? val.includes(el.value) : !!val;
              el.classList.toggle("is-success", el.checked);
            } else {
              el.value = val;
              const valid = (el.value||"").toString().trim().length > 0;
              el.classList.toggle("is-success", valid);
              if (valid) updateIcon(el.closest(".control") || el.parentNode, true);
            }
          });
        });
      }

      function flattenObject(obj, parentKey = '', res = {}) {
        for (const key in obj) {
          if (!Object.hasOwn(obj, key)) continue;
          const newKey = parentKey ? `${parentKey}[${key}]` : key;
          if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            flattenObject(obj[key], newKey, res);
          } else {
            res[newKey] = obj[key];
          }
        }
        return res;
      }

      /* ---------- submit ---------- */
      async function handleSubmit(e) {
        e.preventDefault();

        // mark that we've attempted submit (affects blur logic)
        rootForm.dataset.submitted = "1";

        // validate all steps
        let allValid = true;
        for (let i = 0; i < steps.length; i++) {
          if (!validateStep(i)) allValid = false;
        }
        if (!allValid) {
          focusFirstInvalid(currentStepIndex);
          return;
        }

        // final exclusion check
        const excl = checkExclusions();
        if (excl.excluded) { handleExclusion(excl); return; }

        // collect nested payload and save draft (for logs)
        const payload = collectStateNested();
        saveDraft();

        // send to webhook if configured and wait for response -> then show Calendly on success
        if (WEBHOOK_URL && WEBHOOK_URL.length > 5) {
          try {
            const resp = await fetch(WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            // handle different response codes
            if (resp.ok) {
              // success → show calendly
              showSuccessAndCalendly();
            } else if (resp.status >= 400 && resp.status < 500) {
              // validation error
              alert("Vos réponses semblent poser problème — merci de vérifier et réessayer. Si le problème persiste, contactez hello@luminose.fr");
              // return to first step
              goToStepByName("1", { scrollTop:true });
            } else {
              // server error
              alert("Erreur technique lors de l'enregistrement. Merci de réessayer plus tard ou de contacter hello@luminose.fr");
              goToStepByName("1", { scrollTop:true });
            }
          } catch (err) {
            console.warn("webhook error", err);
            alert("Impossible de contacter le serveur. Vérifiez votre connexion. Si le problème persiste, contactez hello@luminose.fr");
            goToStepByName("1", { scrollTop:true });
          }
        } else {
          // no webhook configured — directly show calendly
          showSuccessAndCalendly();
        }
      }

      function showSuccessAndCalendly() {
        const success = document.getElementById("ade-success");
        show(success);
        injectCalendly(CALENDLY_URL);
        // go to success panel and scroll
        // find index of success panel (not a step), we will scroll it into view
        success.scrollIntoView({ behavior: "smooth" });
      }

      function injectCalendly(url) {
        const wrap = document.getElementById("ade-calendly");
        if (!wrap) return;
        if (!url || url.length < 5) {
          wrap.innerHTML = `<p class="small-note">Calendly non configuré — vous recevrez un lien par email.</p>`;
          return;
        }
        if (wrap.dataset.loaded === "1") return;
        const iframe = document.createElement("iframe");
        iframe.src = url + '?embed_domain=' + encodeURIComponent(location.hostname) + '&embed_type=Widget';
        iframe.style.width = "100%";
        iframe.style.border = "0";
        iframe.style.minHeight = "600px";
        wrap.appendChild(iframe);
        wrap.dataset.loaded = "1";
      }

      /* ---------- public init ---------- */
      function init() {
        initDOM();
      }

      return { init };
    })();


  /* ------------ APP INIT ------------ */
  const init = () => {
    NavOverlay.init();
    CardToggle.init();
    FAQ.init();
    Carousel.init();
    CookieBanner.init();
    Adequation.init();
    // console.log('App initialised');
  };

  return { init };

})();


// === Boot on DOM ready
document.addEventListener('DOMContentLoaded', App.init);