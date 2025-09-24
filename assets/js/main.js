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

    /* ------------ ADEQUATION MODULE – v12 (loader Bulma, webhook handling, autosave TTL 3j) ------------ */
    const Adequation = (() => {
      // --------- CONFIG ----------
      const WEBHOOK_URL = "https://hook.eu1.make.com/98lq6so7rouba4l94h7god7copua3kpu"; // fourni
      const CALENDLY_URL = "https://calendly.com/luminose/le-seuil-la-rencontre"; // fourni
      const DRAFT_KEY = "leSeuil_draft_v12";
      const DRAFT_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 jours
      const FETCH_TIMEOUT_MS = 30000; // 30s timeout

      // --------- STATE / DOM ----------
      let rootForm, steps, sectionEl, closeBtn;
      let currentStepIndex = 0;
      let autosaveTimer = null;

      // helpers
      const $ = (s, ctx = document) => ctx.querySelector(s);
      const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
      const show = (el) => el && el.classList.remove("is-hidden");
      const hide = (el) => el && el.classList.add("is-hidden");
      const isMobile = () => window.matchMedia("(max-width: 820px)").matches;
      const nowISO = () => (new Date()).toISOString();

      // server messages container (must exist in your HTML)
      const serverMsgElId = "ade-server-message";

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
        closeBtn = sectionEl ? sectionEl.querySelector(".adequation-close") : null; // attention : classe via HTML

        // nav (classes)
        rootForm.querySelectorAll(".ade-next").forEach(btn => btn.addEventListener("click", handleNextClick));
        rootForm.querySelectorAll(".ade-prev").forEach(btn => btn.addEventListener("click", handlePrevClick));

        // resume / reset
        const resumeBtn = document.getElementById("ade-resume");
        const resetBtn = document.getElementById("ade-reset");
        if (resumeBtn) resumeBtn.addEventListener("click", handleResume);
        if (resetBtn) resetBtn.addEventListener("click", handleReset);

        // close fullscreen (croix)
        if (closeBtn) {
          closeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            removeFullscreen();
            // show preamble (0)
            goToStepByName("0", { scrollTop: true });
          });
        }

        // manual review
        const reviewBtn = document.getElementById("ade-request-review");
        if (reviewBtn) reviewBtn.addEventListener("click", () => {
          window.location.href = "mailto:hello@luminose.fr?subject=Demande%20examen%20manuel%20-%20Le%20Seuil";
        });

        // submit
        rootForm.addEventListener("submit", handleSubmit);

        // attach validation + autosave
        attachValidationFeedback();

        // decide starting step based on draft existence/validity
        const draft = loadDraft();
        if (draft && draft.valid) {
          // if a "0b" step exists, show it, else go to preamble (0)
          const idx0b = getStepIndexByName("0b");
          if (idx0b >= 0) goToStep(idx0b, { scrollTop: true });
          else goToStepByName("0", { scrollTop: true });
        } else {
          goToStepByName("0", { scrollTop: true });
        }
      }

      /* ---------- step helpers ---------- */
      function getStepIndexByName(name) {
        for (let i = 0; i < steps.length; i++) {
          if (String(steps[i].dataset.step) === String(name)) return i;
        }
        return -1;
      }

      // go to step index (no automatic focus)
      function goToStep(index, opts = { scrollTop: true, fullscreenIfMobile: false }) {
        steps.forEach((s, i) => (i === index ? s.classList.remove("is-hidden") : s.classList.add("is-hidden")));
        currentStepIndex = index;

        // fullscreen on mobile if requested (used when leaving preamble)
        if (opts.fullscreenIfMobile && isMobile()) applyFullscreen();

        if (opts.scrollTop) scrollContainerTop();
      }

      function goToStepByName(name, opts = { scrollTop: true, fullscreenIfMobile: false }) {
        const idx = getStepIndexByName(name);
        if (idx >= 0) goToStep(idx, opts);
      }

      /* ---------- fullscreen ----------
        Adds a class on the section and prevent body scroll on mobile.
      */
      function applyFullscreen() {
        if (!sectionEl) return;
        sectionEl.classList.add("is-fullscreen");
        document.documentElement.style.overflow = "hidden";
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

      function scrollContainerTop() {
        requestAnimationFrame(() => {
          if (sectionEl && sectionEl.classList.contains("is-fullscreen")) {
            try { sectionEl.scrollTo({ top: 0, behavior: "smooth" }); }
            catch (e) { sectionEl.scrollTop = 0; }
          } else {
            try { window.scrollTo({ top: 0, behavior: "smooth" }); }
            catch (e) { document.documentElement.scrollTop = 0; }
          }
        });
      }

      /* ---------- navigation handlers ---------- */
      function handleNextClick(e) {
        e.preventDefault();
        if (!validateStep(currentStepIndex)) { focusFirstInvalid(currentStepIndex); return; }

        // leaving preamble (data-step == "0") => ask for fullscreen on mobile
        const leavingPreamble = String(steps[currentStepIndex].dataset.step) === "0";

        // early exclusion check when leaving health/logistics (steps 1/2)
        if (currentStepIndex <= 1) {
          const excl = checkExclusions();
          if (excl.excluded) { handleExclusion(excl); return; }
        }

        const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
        goToStep(nextIndex, { scrollTop: true, fullscreenIfMobile: leavingPreamble });
      }

      function handlePrevClick(e) {
        e.preventDefault();
        const prevIndex = Math.max(0, currentStepIndex - 1);
        goToStep(prevIndex, { scrollTop: true });
      }

      /* ---------- resume / reset ---------- */
      function handleResume(e) {
        e.preventDefault();
        const draft = loadDraft();
        if (!draft || !draft.valid) {
          goToStepByName("0", { scrollTop: true });
          return;
        }
        populateFromFlat(draft.flat || {});
        applyFullscreen();
        const idx = getStepIndexByName("1") >= 0 ? getStepIndexByName("1") : resolveIndexOfFirstRealStep();
        goToStep(idx, { scrollTop: true });
      }

      function handleReset(e) {
        e.preventDefault();
        localStorage.removeItem(DRAFT_KEY);
        goToStepByName("0", { scrollTop: true });
      }

      function resolveIndexOfFirstRealStep() {
        const idx1 = getStepIndexByName("1");
        if (idx1 >= 0) return idx1;
        for (let i = 0; i < steps.length; i++) {
          const s = steps[i].dataset.step;
          if (s !== "0" && s !== "0b") return i;
        }
        return 0;
      }

      /* ---------- validation UI behaviours & autosave ---------- */
      function attachValidationFeedback() {
        if (!rootForm) return;
        const controls = $$("input,textarea,select", rootForm);

        controls.forEach(el => {
          el.dataset.touched = el.dataset.touched || "0";
          el.dataset.everValid = (el.value && el.value.toString().trim().length > 0) ? "1" : "0";

          // autosave (debounced) — only triggered by user interactions on inputs/selects
          el.addEventListener("input", debouncedSaveDraft);
          el.addEventListener("change", debouncedSaveDraft);

          if (el.type === "radio") {
            // attach change for the group
            const radios = $$(`[name="${el.name}"]`, rootForm);
            radios.forEach(r => {
              r.addEventListener("change", () => {
                // clear classes only for that group
                radios.forEach(rr => {
                  rr.classList.remove("is-success", "is-danger");
                  rr.removeAttribute("aria-invalid");
                });
                const checked = rootForm.querySelector(`[name="${el.name}"]:checked`);
                if (checked) {
                  checked.classList.add("is-success");
                  checked.dataset.touched = "1";
                  checked.dataset.everValid = "1";
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
                if (el.dataset.everValid === "1" || rootForm.dataset.submitted === "1") {
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
                // while typing, remain neutral unless already flagged
                if (el.classList.contains("is-danger")) {
                  // keep danger visible during typing until corrected
                  updateIcon(el.closest(".control") || el.parentNode, false);
                } else {
                  el.classList.remove("is-success","is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, null);
                }
              }
            });

            el.addEventListener("blur", () => {
              el.dataset.touched = "1";
              const val = (el.value || "").toString().trim();

              // special: email uses HTML5 validity check
              if (el.type === "email") {
                const validEmail = el.checkValidity(); // uses browser built-in pattern for "type=email"
                if (validEmail) {
                  el.dataset.everValid = "1";
                  el.classList.add("is-success"); el.classList.remove("is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, true);
                } else {
                  // keep error if previously invalid or previously valid or on submit
                  if (el.classList.contains("is-danger") || el.dataset.everValid === "1" || rootForm.dataset.submitted === "1") {
                    el.classList.remove("is-success"); el.classList.add("is-danger");
                    updateIcon(el.closest(".control") || el.parentNode, false);
                  } else {
                    el.classList.remove("is-success","is-danger");
                    updateIcon(el.closest(".control") || el.parentNode, null);
                  }
                }
                return;
              }

              // generic (text/select/textarea)
              if (val.length > 0) {
                el.dataset.everValid = "1";
                el.classList.add("is-success"); el.classList.remove("is-danger");
                updateIcon(el.closest(".control") || el.parentNode, true);
              } else {
                // if previously flagged as error, keep it
                if (el.classList.contains("is-danger") || el.dataset.everValid === "1" || rootForm.dataset.submitted === "1") {
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
        const parent = elInGroup.closest("td") || elInGroup.closest(".control");
        updateIcon(parent, valid);
      }

      /* ---------- debounce for autosave ---------- */
      function debouncedSaveDraft() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => saveDraft(), 350);
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
              // mark group radios as danger (only group)
              radios.forEach(r => r.classList.add("is-danger"));
              const parent = radios[0] && (radios[0].closest("td") || radios[0].closest(".control"));
              updateIcon(parent, false);
              ok = false;
            } else {
              radios.forEach(r => r.classList.remove("is-danger"));
              checked.classList.add("is-success");
              const parent = checked.closest("td") || checked.closest(".control");
              updateIcon(parent, true);
            }
          } else if (el.type === "checkbox") {
            if (!el.checked) {
              el.classList.add("is-danger"); el.classList.remove("is-success");
              updateIcon(el.closest(".control") || el.parentNode, false);
              ok = false;
            } else {
              el.classList.add("is-success"); el.classList.remove("is-danger");
              updateIcon(el.closest(".control") || el.parentNode, true);
            }
          } else if (el.type === "email") {
            const validEmail = el.checkValidity();
            if (!validEmail) {
              el.classList.add("is-danger"); el.classList.remove("is-success");
              updateIcon(el.closest(".control") || el.parentNode, false);
              ok = false;
            } else {
              el.classList.add("is-success"); el.classList.remove("is-danger");
              updateIcon(el.closest(".control") || el.parentNode, true);
            }
          } else {
            const val = (el.value || "").toString().trim();
            if (val.length === 0) {
              el.classList.add("is-danger"); el.classList.remove("is-success");
              updateIcon(el.closest(".control") || el.parentNode, false);
              ok = false;
            } else {
              el.classList.add("is-success"); el.classList.remove("is-danger");
              updateIcon(el.closest(".control") || el.parentNode, true);
            }
          }
        }

        // submit button decoration
        const submitBtn = rootForm.querySelector('button[type="submit"], #ade-submit');
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
          try { firstError.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
          return;
        }
        const firstReq = step.querySelector("[required]");
        if (firstReq && typeof firstReq.focus === "function") {
          try { firstReq.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
        }
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
          if (sel && sel.value === "oui") return { excluded: true, key: k, reason: EXCLUSION_MAP[k] };
        }
        const logiKeys = [
          "logistique[q_travel]",
          "logistique[q_slots]",
          "logistique[q_commit]"
        ];
        for (let k of logiKeys) {
          const sel = rootForm.querySelector(`[name="${k}"]:checked`);
          if (sel && sel.value === "non") return { excluded: true, key: k, reason: EXCLUSION_MAP[k] };
        }
        return { excluded: false };
      }

      function handleExclusion(obj) {
        const panel = document.getElementById("ade-exclusion");
        const reasonEl = document.getElementById("ade-exclusion-reason");
        if (reasonEl) reasonEl.textContent = obj.reason || "Pour des raisons de sécurité, ce parcours n'est pas adapté.";
        show(panel);
        steps.forEach(s => s.classList.add("is-hidden"));
        panel.scrollIntoView({ behavior: "smooth" });
        localStorage.setItem(DRAFT_KEY + "_excluded", JSON.stringify({ ts: nowISO(), reason: obj.reason }));
      }

      /* ---------- data & draft (flat) ---------- */
      function collectFlat() {
        const fd = new FormData(rootForm);
        const flat = {};
        for (const [k, v] of fd.entries()) {
          // only keep non-empty values (string trimmed)
          if (typeof v === "string") {
            const trimmed = v.toString().trim();
            if (trimmed.length === 0) continue;
            flat[k] = trimmed;
          } else {
            flat[k] = v;
          }
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
          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (i === parts.length - 1) cur[p] = flat[key];
            else {
              if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
              cur = cur[p];
            }
          }
        }
        return nested;
      }

      // Save draft only if there is at least one non-empty answer (avoid saving an empty wrapper on "Commencer")
      function saveDraft(opts = {}) {
        try {
          const flat = collectFlat();
          const keys = Object.keys(flat);
          if (!keys.length) {
            // nothing to save -> remove any existing draft
            if (!opts.force) localStorage.removeItem(DRAFT_KEY);
            return;
          }
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
          if (!obj || !obj.ts) { localStorage.removeItem(DRAFT_KEY); return null; }
          const age = (new Date()).getTime() - (new Date(obj.ts)).getTime();
          if (age > DRAFT_TTL_MS) { localStorage.removeItem(DRAFT_KEY); return null; }
          const flat = obj.flat || {};
          const hasKeys = Object.keys(flat).length > 0;
          if (!hasKeys) { localStorage.removeItem(DRAFT_KEY); return null; }
          return { valid: true, ts: obj.ts, flat };
        } catch (e) {
          console.warn("loadDraft err", e);
          return null;
        }
      }

      function populateFromFlat(flatData) {
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
              const valid = (el.value || "").toString().trim().length > 0;
              el.classList.toggle("is-success", valid);
              if (valid) updateIcon(el.closest(".control") || el.parentNode, true);
            }
          });
        });
      }

      /* ---------- server message UI ---------- */
      function showServerMessage(message, severity = "danger") {
        const el = document.getElementById(serverMsgElId);
        if (!el) {
          // fallback to alert
          alert(message);
          return;
        }
        el.className = "notification"; // reset classes
        if (severity === "danger") el.classList.add("is-danger");
        else if (severity === "warning") el.classList.add("is-warning");
        else if (severity === "success") el.classList.add("is-success");
        el.innerHTML = message;
        console.log("ici");
        show(el);
        // scroll to message
        try { el.scrollIntoView({ behavior: "smooth" }); } catch (e) { /* ignore */ }
      }

      /* ---------- loading / disable form ---------- */
      function setFormLoading(state) {
        if (!rootForm) return;
        const submitBtn = rootForm.querySelector('button[type="submit"], #ade-submit');
        // Bulma loader: add class is-loading on the submit button only
        if (submitBtn) submitBtn.classList.toggle("is-loading", state);

        // disable/enable all form controls while keeping outer-cross (close) active
        const controls = rootForm.querySelectorAll("input,textarea,select,button");
        controls.forEach(c => {
          // keep the submit button disabled as well while loading
          c.disabled = !!state;
        });
      }

      /* ---------- fetch with timeout ---------- */
      function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT_MS) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        options.signal = controller.signal;
        return fetch(url, options).finally(() => clearTimeout(id));
      }

      /* ---------- submit ---------- */
      async function handleSubmit(e) {
        e.preventDefault();
        // mark that we've attempted submit (used to show errors on blur)
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

        // prepare payload and save draft (for logs)
        const payload = collectStateNested();
        saveDraft(); // keep a final copy

        // send to webhook
        setFormLoading(true);
        hide(document.getElementById(serverMsgElId)); // clear previous server message

        if (WEBHOOK_URL && WEBHOOK_URL.length > 5) {
          try {
            const resp = await fetchWithTimeout(WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }, FETCH_TIMEOUT_MS);

            // parse response body if possible
            let bodyText = "";
            let jsonBody = null;
            try {
              bodyText = await resp.text();
              jsonBody = bodyText ? JSON.parse(bodyText) : null;
            } catch (_) {
              jsonBody = null;
            }

            if (resp.ok) {
              // webhook accepted -> success path
              // optionally check JSON for a success flag
              if (jsonBody && (jsonBody.success === false || jsonBody.error)) {
                // webhook returned an application-level validation failure
                const msg = (jsonBody && (jsonBody.message || jsonBody.error)) || "Vos réponses ont été rejetées par le serveur. Merci de vérifier.";
                showServerMessage(msg, "danger");
                // return to first real step to let user correct
                goToStepByName("1", { scrollTop: true });
                setFormLoading(false);
                return;
              }

              // success: clear draft and show Calendly (step 5)
              localStorage.removeItem(DRAFT_KEY);
              const idxCalendly = getStepIndexByName("5");
              if (idxCalendly >= 0) {
                goToStep(idxCalendly, { scrollTop: true });
                injectCalendly(CALENDLY_URL);
              } else {
                // fallback: render success message
                showServerMessage("Vos réponses ont bien été enregistrées. Vous allez pouvoir choisir un créneau.", "success");
              }
              setFormLoading(false);
              return;
            } else {
              // non-ok responses -> inspect status
              const parsedMessage = (jsonBody && (jsonBody.message || jsonBody.error)) || bodyText || null;
              if (resp.status === 422) {
                showServerMessage(parsedMessage || "Certaines réponses ne passent pas la validation. Merci de vérifier vos informations.", "danger");
                goToStepByName("1", { scrollTop: true });
              } else if (resp.status >= 400 && resp.status < 500) {
                showServerMessage(parsedMessage || "Erreur dans la transmission des données. Merci de vérifier vos réponses ou contactez hello@luminose.fr", "danger");
                goToStepByName("1", { scrollTop: true });
              } else {
                // 5xx
                showServerMessage(parsedMessage || "Erreur technique sur le serveur. Merci de réessayer plus tard ou de contacter hello@luminose.fr", "danger");
                goToStepByName("1", { scrollTop: true });
              }
              setFormLoading(false);
              return;
            }
          } catch (err) {
            console.warn("webhook error", err);
            if (err && err.name === "AbortError") {
              showServerMessage("La requête a expiré (timeout). Vérifiez votre connexion et réessayez.", "danger");
            } else {
              showServerMessage("Impossible de contacter le serveur. Vérifiez votre connexion ou contactez hello@luminose.fr", "danger");
            }
            setFormLoading(false);
            goToStepByName("1", { scrollTop: true });
            return;
          }
        } else {
          // no webhook configured -> directly show Calendly
          const idxCalendly = getStepIndexByName("5");
          if (idxCalendly >= 0) {
            goToStep(idxCalendly, { scrollTop: true });
            injectCalendly(CALENDLY_URL);
          } else {
            showServerMessage("Pas de webhook configuré — vous recevrez un lien par email.", "warning");
          }
          setFormLoading(false);
        }
      }

      /* ---------- Calendly injection ---------- */
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
        iframe.style.width = '100%';
        iframe.style.border = '0';
        iframe.style.minHeight = '480px';
        wrap.appendChild(iframe);
        wrap.dataset.loaded = "1";
      }

      /* ---------- public init ---------- */
      function init() {
        initDOM();
      }

      // return public API
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