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

   /* ------------ ADEQUATION MODULE – v9 ------------ */
    const Adequation = (() => {
      const WEBHOOK_URL = ""; // <-- renseigne si besoin
      const CALENDLY_URL = ""; // <-- renseigne si besoin
      const DRAFT_KEY = "leSeuil_draft_v9";

      let rootForm, steps;
      let currentStep = 0;

      // helpers
      const $ = (s, ctx = document) => ctx.querySelector(s);
      const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
      const show = (el) => el && el.classList.remove("is-hidden");
      const hide = (el) => el && el.classList.add("is-hidden");

      const EXCLUSION_MAP = {
        "sante[q_psychotic]": "Diagnostic psychotique, épilepsie ou antécédent de convulsions.",
        "sante[q_cardio]": "Pathologie cardiaque ou respiratoire significative non stabilisée.",
        "sante[q_pregnancy]": "Grossesse / post-partum immédiat (<3 mois).",
        "sante[q_eye_trauma]": "Glaucome / chirurgie oculaire récente / traumatisme crânien / fracture non consolidée.",
        "sante[q_psychotrop]": "Traitement psychotrope lourd ou sevrage en cours.",
        "sante[q_recent_trauma]": "Traumatisme aigu très récent nécessitant un suivi médical/psy (<6 semaines).",
        "logistique[q_availability]": "Disponibilité matérielle / temporelle insuffisante.",
        "logistique[q_travel]": "Impossibilité de se rendre en présentiel (séance 2 & 5).",
        "logistique[q_slots]": "Absence de créneaux réguliers pour les visios / présentielles.",
        "logistique[q_commit]": "Impossible de s'engager sur 1–2 h d'intégration par semaine.",
      };

      /* ---------- init ---------- */
      function initDOM() {
        rootForm = document.getElementById("adequation-form");
        if (!rootForm) return;
        steps = $$("[data-step]", rootForm);

        // nav buttons via classes (no IDs)
        rootForm.querySelectorAll(".ade-next").forEach((btn) => btn.addEventListener("click", handleNextClick));
        rootForm.querySelectorAll(".ade-prev").forEach((btn) => btn.addEventListener("click", handlePrevClick));

        // manual review
        const reviewBtn = document.getElementById("ade-request-review");
        if (reviewBtn) {
          reviewBtn.addEventListener("click", () => {
            window.location.href =
              "mailto:hello@luminose.fr?subject=Demande%20examen%20manuel%20-%20Le%20Seuil";
          });
        }

        // form submit
        rootForm.addEventListener("submit", handleSubmit);

        // attach validation behaviour + autosave
        attachValidationFeedback();

        // populate draft if exists
        loadDraft();

        // initial display
        goToStep(0);
      }

      function handleNextClick(e) {
        e.preventDefault();
        if (!validateStep(currentStep)) {
          focusFirstInvalid(currentStep);
          return;
        }
        // exclusions early
        if (currentStep <= 1) {
          const excl = checkExclusions();
          if (excl.excluded) {
            handleExclusion(excl);
            return;
          }
        }
        if (currentStep < steps.length - 1) goToStep(currentStep + 1);
      }

      function handlePrevClick(e) {
        e.preventDefault();
        if (currentStep > 0) goToStep(Math.max(0, currentStep - 1));
      }

      function goToStep(index) {
        steps.forEach((s, i) =>
          i === index ? s.classList.remove("is-hidden") : s.classList.add("is-hidden")
        );
        currentStep = index;
        const first = steps[index].querySelector("input,textarea,select,button");
        if (first) first.focus({ preventScroll: true });
      }

      /* ---------- validation UI behaviours ---------- */
      function attachValidationFeedback() {
        const controls = $$("input,textarea,select", rootForm);
        controls.forEach((el) => {
          el.dataset.touched = el.dataset.touched || "0";
          el.dataset.everValid =
            el.value && el.value.toString().trim().length > 0 ? "1" : "0";

          // autosave on every change
          el.addEventListener("input", saveDraft);
          el.addEventListener("change", saveDraft);

          if (el.type === "radio") {
            const radios = $$(`[name="${el.name}"]`, rootForm);
            radios.forEach((r) => {
              r.addEventListener("change", () => {
                radios.forEach((rr) => {
                  rr.classList.remove("is-success", "is-danger");
                  rr.removeAttribute("aria-invalid");
                });
                const checked = rootForm.querySelector(
                  `[name="${el.name}"]:checked`
                );
                if (checked) {
                  checked.classList.add("is-success");
                  checked.dataset.touched = "1";
                  const parent = checked.closest("td") || checked.closest(".control");
                  updateIcon(parent, true);
                }
              });
            });
          } else if (el.type === "checkbox") {
            el.addEventListener("change", () => {
              el.dataset.touched = "1";
              if (el.checked) {
                el.classList.add("is-success");
                el.classList.remove("is-danger");
                updateIcon(el.closest(".control") || el.parentNode, true);
                el.dataset.everValid = "1";
              } else {
                if (el.dataset.everValid === "1") {
                  el.classList.remove("is-success");
                  el.classList.add("is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, false);
                } else {
                  el.classList.remove("is-success", "is-danger");
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
                el.classList.add("is-success");
                el.classList.remove("is-danger");
                updateIcon(el.closest(".control") || el.parentNode, true);
              } else {
                el.classList.remove("is-success", "is-danger");
                updateIcon(el.closest(".control") || el.parentNode, null);
              }
            });

            el.addEventListener("blur", () => {
              el.dataset.touched = "1";
              const val = (el.value || "").toString().trim();
              if (val.length > 0) {
                el.dataset.everValid = "1";
                el.classList.add("is-success");
                el.classList.remove("is-danger");
                updateIcon(el.closest(".control") || el.parentNode, true);
              } else {
                // 🔧 nouvelle règle : si déjà en erreur => rester rouge
                if (el.classList.contains("is-danger")) {
                  updateIcon(el.closest(".control") || el.parentNode, false);
                } else if (el.dataset.everValid === "1") {
                  el.classList.remove("is-success");
                  el.classList.add("is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, false);
                } else {
                  el.classList.remove("is-success", "is-danger");
                  updateIcon(el.closest(".control") || el.parentNode, null);
                }
              }
            });
          }
        });
      }

      // update icon
      function updateIcon(container, valid) {
        if (!container) return;
        const iconEl =
          container.querySelector(".icon.is-small.is-right i.fas") ||
          container.querySelector(".icon i.fas");
        if (!iconEl) return;
        iconEl.classList.remove("fa-check", "fa-exclamation-triangle");
        if (valid === true) iconEl.classList.add("fa-check");
        else if (valid === false) iconEl.classList.add("fa-exclamation-triangle");
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
              radios.forEach((r) => r.classList.add("is-danger"));
              const parent = radios[0] && (radios[0].closest("td") || radios[0].closest(".control"));
              updateIcon(parent, false);
              ok = false;
            } else {
              radios.forEach((r) => r.classList.remove("is-danger"));
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

        return ok;
      }

      function focusFirstInvalid(index) {
        const step = steps[index];
        if (!step) return;
        const firstError = step.querySelector(".is-danger, :invalid");
        if (firstError) {
          firstError.focus({ preventScroll: true });
          return;
        }
        const firstReq = step.querySelector("[required]");
        if (firstReq) firstReq.focus({ preventScroll: true });
      }

      /* ---------- exclusions ---------- */
      function checkExclusions() {
        const healthKeys = [
          "sante[q_psychotic]",
          "sante[q_cardio]",
          "sante[q_pregnancy]",
          "sante[q_eye_trauma]",
          "sante[q_psychotrop]",
          "sante[q_recent_trauma]",
        ];
        for (let k of healthKeys) {
          const sel = rootForm.querySelector(`[name="${k}"]:checked`);
          if (sel && sel.value === "oui") return { excluded: true, key: k, reason: EXCLUSION_MAP[k] };
        }
        const logiKeys = [
          "logistique[q_availability]",
          "logistique[q_travel]",
          "logistique[q_slots]",
          "logistique[q_commit]",
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
        steps.forEach((s) => s.classList.add("is-hidden"));
        panel.scrollIntoView({ behavior: "smooth" });
        saveDraft({ minimal: true, reason: obj.reason });
      }

      /* ---------- data & draft ---------- */
      function collectState() {
        const fd = new FormData(rootForm);
        const flat = {};
        for (const [k, v] of fd.entries()) {
          if (flat[k] === undefined) flat[k] = v;
          else if (Array.isArray(flat[k])) flat[k].push(v);
          else flat[k] = [flat[k], v];
        }
        flat._submitted_at = new Date().toISOString();
        return nestObjectFromFlat(flat);
      }

      function nestObjectFromFlat(flat) {
        const nested = {};
        for (const key in flat) {
          if (key.startsWith("_")) {
            nested[key] = flat[key];
            continue;
          }
          const parts = key.split(/\[|\]/).filter(Boolean);
          let cur = nested;
          for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (i === parts.length - 1) {
              cur[p] = flat[key];
            } else {
              if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
              cur = cur[p];
            }
          }
        }
        return nested;
      }

      function saveDraft(opts = {}) {
        try {
          if (opts.minimal) {
            const minimal = { ts: new Date().toISOString(), reason: opts.reason || null };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(minimal));
          } else {
            const s = collectState();
            localStorage.setItem(DRAFT_KEY, JSON.stringify(s));
          }
        } catch (e) {
          console.warn("draft save err", e);
        }
      }

      function loadDraft() {
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          if (!raw) return;
          const data = JSON.parse(raw);

          // Aplatir les objets imbriqués → { "sante[q_psychotic]": "oui", "first_name": "Jean" }
          const flatData = flattenObject(data);

          Object.keys(flatData).forEach(k => {
            if (k.startsWith('_') || k === 'ts') return;
            const els = rootForm.querySelectorAll(`[name="${k}"]`);
            if (!els || els.length === 0) return;
            const val = flatData[k];
            els.forEach(el => {
              if (el.type === 'radio') {
                if (el.value === val) el.checked = true;
                el.classList.toggle('is-success', el.checked);
                if (el.checked) el.dataset.everValid = "1";
              } else if (el.type === 'checkbox') {
                el.checked = Array.isArray(val) ? val.includes(el.value) : !!val;
                el.classList.toggle('is-success', el.checked);
                if (el.checked) el.dataset.everValid = "1";
              } else {
                el.value = val;
                const valid = (el.value||'').toString().trim().length > 0;
                el.classList.toggle('is-success', valid);
                if (valid) {
                  el.dataset.everValid = "1";
                  updateIcon(el.closest('.control') || el.parentNode, true);
                }
              }
            });
          });
        } catch(e) { /* ignore */ }
      }

      function flattenObject(obj, parentKey = '', res = {}) {
        for (const key in obj) {
          if (!Object.hasOwn(obj,key)) continue;
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

        let allValid = true;
        steps.forEach((_, i) => {
          if (!validateStep(i)) allValid = false;
        });

        if (!allValid) {
          focusFirstInvalid(currentStep);
          return;
        }

        const excl = checkExclusions();
        if (excl.excluded) {
          handleExclusion(excl);
          return;
        }

        const payload = collectState();
        saveDraft();

        if (WEBHOOK_URL && WEBHOOK_URL.length > 5) {
          try {
            await fetch(WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } catch (err) {
            console.warn("webhook error", err);
          }
        }

        const success = document.getElementById("ade-success");
        show(success);
        injectCalendly(CALENDLY_URL);
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
        iframe.src =
          url +
          "?embed_domain=" +
          encodeURIComponent(location.hostname) +
          "&embed_type=Widget";
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