const swiffyslider = function() {
    return {
        version: "1.6.0",
        init(rootElement = document.body) {
            for (let sliderElement of rootElement.querySelectorAll(".swiffy-slider")) {
                this.initSlider(sliderElement);
            }
        },

        initSlider(sliderElement) {
            for (let navElement of sliderElement.querySelectorAll(".slider-nav")) {
                let next = navElement.classList.contains("slider-nav-next");
                navElement.addEventListener("click", () => this.slide(sliderElement, next), { passive: true });
            }
            for (let indicatorElement of sliderElement.querySelectorAll(".slider-indicators")) {
                indicatorElement.addEventListener("click", () => this.slideToByIndicator());
                this.onSlideEnd(sliderElement, () => this.handleIndicators(sliderElement), 60);
            }
            if (sliderElement.classList.contains("slider-nav-autoplay")) {
                const timeout = sliderElement.getAttribute("data-slider-nav-autoplay-interval") ? sliderElement.getAttribute("data-slider-nav-autoplay-interval") : 2500;
                this.autoPlay(sliderElement, timeout, sliderElement.classList.contains("slider-nav-autopause"));
            }
            if (["slider-nav-autohide", "slider-nav-animation"].some(className => sliderElement.classList.contains(className))) {
                const threshold = sliderElement.getAttribute("data-slider-nav-animation-threshold") ? sliderElement.getAttribute("data-slider-nav-animation-threshold") : 0.3;
                this.setVisibleSlides(sliderElement, threshold);
            }
        },

        setVisibleSlides(sliderElement, threshold = 0.3) {
            let observer = new IntersectionObserver(slides => {
                slides.forEach(slide => {
                    slide.isIntersecting ? slide.target.classList.add("slide-visible") : slide.target.classList.remove("slide-visible");
                });
                sliderElement.querySelector(".slider-container>*:first-child").classList.contains("slide-visible") ? sliderElement.classList.add("slider-item-first-visible") : sliderElement.classList.remove("slider-item-first-visible");
                sliderElement.querySelector(".slider-container>*:last-child").classList.contains("slide-visible") ? sliderElement.classList.add("slider-item-last-visible") : sliderElement.classList.remove("slider-item-last-visible");
            }, {
                root: sliderElement.querySelector(".slider-container"),
                threshold: threshold
            });
            for (let slide of sliderElement.querySelectorAll(".slider-container>*"))
                observer.observe(slide);
        },

        slide(sliderElement, next = true) {
            const container = sliderElement.querySelector(".slider-container");
            const fullpage = sliderElement.classList.contains("slider-nav-page");
            const noloop = sliderElement.classList.contains("slider-nav-noloop");
            const nodelay = sliderElement.classList.contains("slider-nav-nodelay");
            const slides = container.children;
            const gapWidth = parseInt(window.getComputedStyle(container).columnGap);
            const scrollStep = slides[0].offsetWidth + gapWidth;
            let scrollLeftPosition = next ?
                container.scrollLeft + scrollStep :
                container.scrollLeft - scrollStep;
            if (fullpage) {
                scrollLeftPosition = next ?
                    container.scrollLeft + container.offsetWidth :
                    container.scrollLeft - container.offsetWidth;
            }
            if (container.scrollLeft < 1 && !next && !noloop) {
                scrollLeftPosition = (container.scrollWidth - container.offsetWidth);
            }
            if (container.scrollLeft >= (container.scrollWidth - container.offsetWidth) && next && !noloop) {
                scrollLeftPosition = 0;
            }
            container.scroll({
                left: scrollLeftPosition,
                behavior: nodelay ? "auto" : "smooth"
            });
        },

        slideToByIndicator() {
            const indicator = window.event.target;
            const indicatorIndex = Array.from(indicator.parentElement.children).indexOf(indicator);
            const indicatorCount = indicator.parentElement.children.length;
            const sliderElement = indicator.closest(".swiffy-slider");
            const slideCount = sliderElement.querySelector(".slider-container").children.length;
            const relativeSlideIndex = (slideCount / indicatorCount) * indicatorIndex;
            this.slideTo(sliderElement, relativeSlideIndex);
        },

        slideTo(sliderElement, slideIndex) {
            const container = sliderElement.querySelector(".slider-container");
            const gapWidth = parseInt(window.getComputedStyle(container).columnGap);
            const scrollStep = container.children[0].offsetWidth + gapWidth;
            const nodelay = sliderElement.classList.contains("slider-nav-nodelay");
            container.scroll({
                left: (scrollStep * slideIndex),
                behavior: nodelay ? "auto" : "smooth"
            });
        },

        onSlideEnd(sliderElement, delegate, timeout = 125) {
            let isScrolling;
            sliderElement.querySelector(".slider-container").addEventListener("scroll", function() {
                window.clearTimeout(isScrolling);
                isScrolling = setTimeout(delegate, timeout);
            }, { capture: false, passive: true });
        },

        autoPlay(sliderElement, timeout, autopause) {
            timeout = timeout < 750 ? 750 : timeout;
            let autoplayTimer = setInterval(() => this.slide(sliderElement), timeout);
            const autoplayer = () => this.autoPlay(sliderElement, timeout, autopause);
            if (autopause) {
                ["mouseover", "touchstart"].forEach(function(event) {
                    sliderElement.addEventListener(event, function() {
                        window.clearTimeout(autoplayTimer);
                    }, { once: true, passive: true });
                });
                ["mouseout", "touchend"].forEach(function(event) {
                    sliderElement.addEventListener(event, function() {
                        autoplayer();
                    }, { once: true, passive: true });
                });
            }
            return autoplayTimer;
        },

        handleIndicators(sliderElement) {
            if (!sliderElement) return;
            const container = sliderElement.querySelector(".slider-container");
            const slidingAreaWidth = container.scrollWidth - container.offsetWidth;
            const percentSlide = (container.scrollLeft / slidingAreaWidth);
            for (let scrollIndicatorContainers of sliderElement.querySelectorAll(".slider-indicators")) {
                let scrollIndicators = scrollIndicatorContainers.children;
                let activeIndicator = Math.abs(Math.round((scrollIndicators.length - 1) * percentSlide));
                for (let element of scrollIndicators)
                    element.classList.remove("active");
                scrollIndicators[activeIndicator].classList.add("active");
            }
        }
    };
}();

window.swiffyslider = swiffyslider;
if (!document.currentScript.hasAttribute("data-noinit")) {
    if (document.currentScript.hasAttribute("defer")) {
        swiffyslider.init();
    } else {
        document.onreadystatechange = () => {
            if (document.readyState === 'interactive') {
                swiffyslider.init();
            }
        }
    }
}
/**
 * App.js - Application principale
 * Architecture modulaire basée sur des classes
 */

/* ============================================
 * SEUIL MODAL - Modale style Apple
 * ============================================ */
class SeuilModal {
  constructor(modalId, options = {}) {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    
    if (!this.modal) {
      console.error(`Modal with id "${modalId}" not found`);
      return;
    }

    this.options = {
      closeOnOverlayClick: true,
      closeOnEscape: true,
      onOpen: null,
      onClose: null,
      ...options
    };

    this.overlay = this.modal.querySelector('.seuil-modal-overlay');
    this.container = this.modal.querySelector('.seuil-modal-container');
    this.closeButtons = this.modal.querySelectorAll('[data-modal-close]');

    this.init();
  }

  init() {
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    if (this.options.closeOnOverlayClick) {
      this.overlay.addEventListener('click', (e) => {
        if (!this.container.contains(e.target)) {
          this.close();
        }
      });
    }

    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });
    }

    this.container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.overlay.addEventListener('scroll', () => this.checkScrollPosition());
  }

  open() {
    // Sauvegarder la position de scroll actuelle
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Bloquer le scroll du body
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    this.overlay.classList.add('is-active');
    this.overlay.scrollTop = 0;
    this.checkScrollPosition();

    if (typeof this.options.onOpen === 'function') {
      this.options.onOpen(this);
    }
  }

  close() {
    this.overlay.classList.remove('is-active');
    this.container.classList.remove('is-at-bottom');
    
    // Restaurer le scroll du body
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    // Restaurer la position de scroll
    if (this.scrollPosition !== undefined) {
      window.scrollTo(0, this.scrollPosition);
    }

    if (typeof this.options.onClose === 'function') {
      this.options.onClose(this);
    }
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  isOpen() {
    return this.overlay.classList.contains('is-active');
  }

  checkScrollPosition() {
    const scrollTop = this.overlay.scrollTop;
    const scrollHeight = this.overlay.scrollHeight;
    const clientHeight = this.overlay.clientHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Calculer le padding du wrapper
    const wrapper = this.overlay.querySelector('.seuil-modal-wrapper');
    const wrapperPadding = wrapper ? parseFloat(getComputedStyle(wrapper).paddingBottom) : 0;
    
    // Seuil = padding + marge de sécurité
    const threshold = wrapperPadding + 5;

    if (distanceFromBottom < threshold) {
      this.container.classList.add('is-at-bottom');
    } else {
      this.container.classList.remove('is-at-bottom');
    }
  }

  destroy() {
    this.close();
  }
}


/* ============================================
 * NAV OVERLAY
 * ============================================ */
class NavOverlay {
  constructor() {
    this.navShell = document.querySelector('.floating-nav .nav-shell');
    this.menuBtn = document.querySelector('.nav-menu-button');
    this.overlay = document.getElementById('mobile-overlay');
    this.panel = this.overlay?.querySelector('.mobile-panel');
  }

  init() {
    if (!this.navShell || !this.menuBtn || !this.overlay) return;
    this.bindEvents();
  }

  close() {
    if (!this.overlay || this.overlay.classList.contains('is-hidden')) return;
    this.overlay.classList.add('is-hidden');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.menuBtn.setAttribute('aria-expanded', 'false');
    this.navShell.classList.remove('is-open');
  }

  open() {
    if (!this.overlay || !this.overlay.classList.contains('is-hidden')) return;
    this.overlay.classList.remove('is-hidden');
    this.overlay.removeAttribute('aria-hidden');
    this.menuBtn.setAttribute('aria-expanded', 'true');
    this.navShell.classList.add('is-open');
  }

  toggle() {
    this.overlay.classList.contains('is-hidden') ? this.open() : this.close();
  }

  bindEvents() {
    this.menuBtn.addEventListener('click', () => this.toggle());
    
    this.panel?.addEventListener('click', e => {
      if (e.target.closest('a')) this.close();
    });
    
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-shell, #mobile-overlay, .nav-menu-button')) {
        this.close();
      }
    });
    
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });
  }
}


/* ============================================
 * EXPANDABLE TOGGLE
 * ============================================ */
class ExpandableToggle {
  constructor() {
    this.buttons = document.querySelectorAll('.expandable .plus');
  }

  init() {
    this.buttons.forEach(button => this.bindButton(button));
  }

  toggle(button, secondary) {
    const isHidden = secondary.classList.contains('is-hidden');
    if (isHidden) {
      secondary.classList.remove('is-hidden');
      secondary.setAttribute('aria-hidden', 'false');
      button.classList.add('is-open');
    } else {
      secondary.classList.add('is-hidden');
      secondary.setAttribute('aria-hidden', 'true');
      button.classList.remove('is-open');
    }
  }

  bindButton(button) {
    const expandable = button.closest('.expandable');
    if (!expandable) return;
    
    const secondary = expandable.querySelector('.secondaire');
    if (!secondary) return;

    button.addEventListener('click', () => this.toggle(button, secondary));
  }
}


/* ============================================
 * FAQ
 * ============================================ */
class FAQ {
  constructor() {
    this.container = document.querySelector('.faq-container');
  }

  init() {
    if (!this.container) return;

    this.questions = this.container.querySelectorAll('.faq-question');
    this.answers = this.container.querySelectorAll('.faq-answer');
    this.panel = this.container.querySelector('.faq-panel');
    this.backBtn = this.panel?.querySelector('.faq-back');
    this.menu = this.container.querySelector('.faq-menu');
    this.isTouch = window.matchMedia('(max-width: 1023px)').matches;

    this.bindEvents();
  }

  bindEvents() {
    this.questions.forEach((q, i) => {
      q.addEventListener('click', () => this.showAnswer(i, q));
    });

    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => this.hidePanel());
    }
  }

  showAnswer(index, question) {
    this.answers.forEach(a => a.classList.remove('is-active'));
    this.answers[index].classList.add('is-active');

    if (this.isTouch) {
      this.container.classList.add('show-panel');
      this.panel.classList.add('is-visible');
    } else {
      this.container.classList.add('has-selection');
      this.panel.classList.add('is-visible');
      this.questions.forEach(q => q.classList.remove('is-active'));
      question.classList.add('is-active');
    }
  }

  hidePanel() {
    if (this.isTouch) {
      this.container.classList.remove('show-panel');
      this.panel.classList.remove('is-visible');
    }
  }
}


/* ============================================
 * COOKIE BANNER
 * ============================================ */
class CookieBanner {
  constructor() {
    this.banner = document.querySelector('.cookie-banner');
  }

  init() {
    if (!this.banner) return;

    const consent = localStorage.getItem('analyticsConsent') || 'unset';
    if (consent === 'unset') {
      this.banner.hidden = false;
    }

    this.acceptBtn = this.banner.querySelector('[data-accept-analytics]');
    this.declineBtn = this.banner.querySelector('[data-decline-analytics]');

    this.acceptBtn?.addEventListener('click', () => this.grantConsent());
    this.declineBtn?.addEventListener('click', () => this.denyConsent());
  }

  grantConsent() {
    localStorage.setItem('analyticsConsent', 'granted');
    this.banner.hidden = true;
    window.analyticsConsent = 'granted';
    if (typeof track === 'function') track('consent_granted');
  }

  denyConsent() {
    localStorage.setItem('analyticsConsent', 'denied');
    this.banner.hidden = true;
    window.analyticsConsent = 'denied';
    console.log('Analytics disabled by user');
  }
}


/* ============================================
 * UTM PARAMETERS PROPAGATION
 * ============================================ */
class UTMParamsPropagation {
  init() {
    const deleteParams = [];
    const utmParamQueryString = new URLSearchParams(window.location.search);

    utmParamQueryString.forEach((value, key) => {
      if (!key.startsWith("utm_")) {
        deleteParams.push(key);
      }
    });

    deleteParams.forEach((value) => {
      utmParamQueryString.delete(value);
    });

    if (utmParamQueryString.toString()) {
      document.querySelectorAll("a").forEach((item) => {
        if (item.href && item.href !== "") {
          const checkUrl = new URL(item.href);
          if (checkUrl.host === location.host) {
            let doNotProcess = false;
            const linkSearchParams = new URLSearchParams(checkUrl.search);
            
            linkSearchParams.forEach((value, key) => {
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
  }
}


/* ============================================
 * ADEQUATION MODULE
 * ============================================ */
class Adequation {
  constructor() {
    // Config
    this.WEBHOOK_URL = "https://hook.eu1.make.com/98lq6so7rouba4l94h7god7copua3kpu";
    this.CALENDLY_URL = "https://calendly.com/luminose/le-seuil-la-rencontre?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=86285A&text_color=86285A";
    this.DRAFT_KEY = "leSeuil_draft_v14";
    this.DRAFT_TTL_MS = 3 * 24 * 60 * 60 * 1000;
    this.FETCH_TIMEOUT_MS = 30000;
    this.serverMsgElId = "ade-server-message";

    // State
    this.rootForm = null;
    this.steps = [];
    this.currentStepIndex = 0;
    this.autosaveTimer = null;

    // Exclusions
    this.EXCLUSION_KEYS = {
      "1": ["sante[q_psychotic]", "sante[q_cardio]", "sante[q_pregnancy]", "sante[q_eye_trauma]", "sante[q_psychotrop_recent_trauma]"],
      "2": ["logistique[q_travel]", "logistique[q_slots]", "logistique[q_commit]", "logistique[q_tech]"]
    };
  }

  init() {
    this.rootForm = document.getElementById("adequation-form");
    if (!this.rootForm) return;
    
    this.steps = Array.from(this.rootForm.querySelectorAll("[data-step]"));
    this.initDOM();
  }

  initDOM() {
    // Navigation
    this.rootForm.querySelectorAll(".ade-next").forEach(btn => 
      btn.addEventListener("click", (e) => this.handleNextClick(e))
    );
    this.rootForm.querySelectorAll(".ade-prev").forEach(btn => 
      btn.addEventListener("click", (e) => this.handlePrevClick(e))
    );

    // Reprise
    document.getElementById("ade-resume")?.addEventListener("click", (e) => this.handleResume(e));

    // Reset
    this.rootForm.querySelectorAll(".ade-reset").forEach(btn => 
      btn.addEventListener("click", (e) => this.handleReset(e))
    );

    // Fermer
    this.rootForm.querySelectorAll(".adequation-close").forEach(btn =>
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToStepByName("0", { scrollTop: true });
      })
    );

    // Submit
    this.rootForm.addEventListener("submit", (e) => this.handleSubmit(e));

    // Validation & autosave
    this.attachValidationFeedback();

    // Starting step
    const draft = this.loadDraft();
    if (draft?.valid) {
      this.goToStepByName("0b");
    } else {
      this.goToStepByName("0");
    }
  }

  // Navigation
  getStepIndexByName(name) {
    return this.steps.findIndex(s => s.dataset.step === String(name));
  }

  goToStep(index, opts = { scrollTop: true }) {
    this.steps.forEach((s, i) => {
      if (i === index) {
        s.classList.remove('is-hidden');
      } else {
        s.classList.add('is-hidden');
      }
    });
    this.currentStepIndex = index;
    if (opts.scrollTop) this.scrollContainerTop();
  }

  goToStepByName(name, opts = { scrollTop: true }) {
    const idx = this.getStepIndexByName(name);
    if (idx >= 0) this.goToStep(idx, opts);
  }

  scrollContainerTop() {
    requestAnimationFrame(() => {
      const active = this.steps[this.currentStepIndex];
      if (!active) return;
      try {
        active.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        try {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          document.documentElement.scrollTop = 0;
        }
      }
    });
  }

  handleNextClick(e) {
    e.preventDefault();
    const stepName = this.steps[this.currentStepIndex].dataset.step;

    if (["0", "0b"].includes(stepName)) {
      this.goToStep(Math.min(this.steps.length - 1, this.currentStepIndex + 1));
      return;
    }

    if (!this.validateStep(this.currentStepIndex)) {
      this.focusFirstInvalid(this.currentStepIndex);
      return;
    }

    if (["1", "2"].includes(stepName)) {
      const excl = this.checkExclusions(stepName);
      if (excl.excluded) {
        this.handleExclusion();
        return;
      }
    }

    this.goToStep(Math.min(this.steps.length - 1, this.currentStepIndex + 1));
  }

  handlePrevClick(e) {
    e.preventDefault();
    this.goToStep(Math.max(0, this.currentStepIndex - 1));
  }

  handleResume(e) {
    e?.preventDefault();
    const draft = this.loadDraft();
    if (!draft?.valid) {
      this.goToStepByName("0");
      return;
    }
    this.populateFromFlat(draft.flat);
    this.goToStepByName("1");
  }

  handleReset(e) {
    e?.preventDefault();
    localStorage.removeItem(this.DRAFT_KEY);
    this.goToStepByName("0");
    this.hideServerMessage();
  }

  // Validation
  attachValidationFeedback() {
    if (!this.rootForm) return;
    const controls = Array.from(this.rootForm.querySelectorAll("input,textarea,select"));

    controls.forEach(el => {
      el.dataset.touched = "0";
      el.dataset.everValid = (el.value?.toString().trim().length > 0) ? "1" : "0";

      el.addEventListener("input", () => this.debouncedSaveDraft());
      el.addEventListener("change", () => this.debouncedSaveDraft());

      if (el.type === "radio") {
        const radios = Array.from(this.rootForm.querySelectorAll(`[name="${el.name}"]`));
        radios.forEach(r => r.addEventListener("change", () => {
          radios.forEach(rr => {
            rr.classList.remove("is-success", "is-danger");
            rr.removeAttribute("aria-invalid");
          });
          const checked = this.rootForm.querySelector(`[name="${el.name}"]:checked`);
          if (checked) {
            checked.classList.add("is-success");
            checked.dataset.touched = "1";
            checked.dataset.everValid = "1";
            this.updateIcon(checked.closest(".control"), true);
          }
        }));
      } else if (el.type === "checkbox") {
        el.addEventListener("change", () => {
          el.dataset.touched = "1";
          if (el.checked) {
            el.classList.add("is-success");
            el.classList.remove("is-danger");
            el.dataset.everValid = "1";
            this.updateIcon(el.closest(".control"), true);
          } else {
            el.classList.remove("is-success");
            if (el.dataset.everValid === "1") {
              el.classList.add("is-danger");
              this.updateIcon(el.closest(".control"), false);
            } else {
              this.updateIcon(el.closest(".control"), null);
            }
          }
        });
      } else {
        el.addEventListener("input", () => {
          const val = (el.value || "").toString().trim();
          if (val.length > 0) {
            el.dataset.everValid = "1";
            el.classList.add("is-success");
            el.classList.remove("is-danger");
            this.updateIcon(el.closest(".control"), true);
          } else {
            el.classList.remove("is-success");
            if (el.classList.contains("is-danger")) {
              this.updateIcon(el.closest(".control"), false);
            } else {
              this.updateIcon(el.closest(".control"), null);
            }
          }
        });

        el.addEventListener("blur", () => {
          el.dataset.touched = "1";
          const val = (el.value || "").toString().trim();
          const valid = el.type === "email" ? el.checkValidity() : val.length > 0;
          if (valid) {
            el.dataset.everValid = "1";
            el.classList.add("is-success");
            el.classList.remove("is-danger");
            this.updateIcon(el.closest(".control"), true);
          } else if (el.dataset.everValid === "1" || this.rootForm.dataset.submitted === "1") {
            el.classList.remove("is-success");
            el.classList.add("is-danger");
            this.updateIcon(el.closest(".control"), false);
          } else {
            el.classList.remove("is-success", "is-danger");
            this.updateIcon(el.closest(".control"), null);
          }
        });
      }
    });
  }

  updateIcon(container, valid) {
    if (!container) return;
    const iconEl = container.querySelector(".icon.is-small.is-right i.fas");
    if (!iconEl) return;
    iconEl.classList.remove("fa-check", "fa-exclamation-triangle");
    if (valid === true) iconEl.classList.add("fa-check");
    else if (valid === false) iconEl.classList.add("fa-exclamation-triangle");
  }

  debouncedSaveDraft() {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => this.saveDraft(), 300);
  }

  validateStep(index) {
    const step = this.steps[index];
    if (!step) return true;
    const requiredEls = Array.from(step.querySelectorAll("[required]"));
    let ok = true;
    const processedRadio = new Set();

    for (const el of requiredEls) {
      if (!el.name) continue;

      if (el.type === "radio") {
        if (processedRadio.has(el.name)) continue;
        processedRadio.add(el.name);

        const checked = this.rootForm.querySelector(`[name="${el.name}"]:checked`);
        const radios = Array.from(this.rootForm.querySelectorAll(`[name="${el.name}"]`));
        if (!checked) {
          radios.forEach(r => r.classList.add("is-danger"));
          ok = false;
        } else {
          radios.forEach(r => r.classList.remove("is-danger"));
          checked.classList.add("is-success");
        }
      } else if (el.type === "checkbox") {
        if (!el.checked) {
          el.classList.add("is-danger");
          ok = false;
        } else {
          el.classList.add("is-success");
        }
      } else {
        const val = (el.value || "").toString().trim();
        const valid = el.type === "email" ? el.checkValidity() : val.length > 0;
        if (!valid) {
          el.classList.add("is-danger");
          ok = false;
        } else {
          el.classList.add("is-success");
        }
      }
    }

    const submitBtn = this.rootForm.querySelector('button[type="submit"], #ade-submit');
    if (submitBtn) submitBtn.classList.toggle('is-danger', !ok);

    return ok;
  }

  focusFirstInvalid(index) {
    const step = this.steps[index];
    if (!step) return;
    const firstError = step.querySelector(".is-danger, :invalid, [required]");
    if (firstError && typeof firstError.focus === "function") {
      try {
        firstError.focus({ preventScroll: true });
      } catch {}
    }
  }

  // Exclusions
  checkExclusions(stepName) {
    const keys = this.EXCLUSION_KEYS[String(stepName)] || [];
    for (const k of keys) {
      const sel = this.rootForm.querySelector(`[name="${k}"]:checked`);
      if (!sel) continue;
      if (String(stepName) === "1" && sel.value === "oui") return { excluded: true };
      if (String(stepName) === "2" && sel.value === "non") return { excluded: true };
    }
    return { excluded: false };
  }

  handleExclusion() {
    const exclusionEl = document.getElementById("ade-exclusion");
    if (exclusionEl) exclusionEl.classList.remove('is-hidden');
    this.steps.forEach(s => s.classList.add('is-hidden'));
  }

  // Data & Draft
  collectFlat() {
    const fd = new FormData(this.rootForm);
    const flat = {};
    for (const [k, v] of fd.entries()) {
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

  collectStateNested() {
    const flat = this.collectFlat();
    const nested = this.nestObjectFromFlat(flat);
    nested._submitted_at = new Date().toISOString();
    return nested;
  }

  nestObjectFromFlat(flat) {
    const nested = {};
    for (const key in flat) {
      if (!Object.prototype.hasOwnProperty.call(flat, key)) continue;
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

  saveDraft(opts = {}) {
    try {
      const flat = this.collectFlat();
      const keys = Object.keys(flat);
      if (!keys.length && !opts.force) {
        localStorage.removeItem(this.DRAFT_KEY);
        return;
      }
      const wrapper = { ts: new Date().toISOString(), flat };
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(wrapper));
    } catch (e) {
      console.warn("saveDraft err", e);
    }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj?.ts) {
        localStorage.removeItem(this.DRAFT_KEY);
        return null;
      }
      if (Date.now() - new Date(obj.ts).getTime() > this.DRAFT_TTL_MS) {
        localStorage.removeItem(this.DRAFT_KEY);
        return null;
      }
      const flat = obj.flat || {};
      if (!Object.keys(flat).length) {
        localStorage.removeItem(this.DRAFT_KEY);
        return null;
      }
      return { valid: true, ts: obj.ts, flat };
    } catch (e) {
      console.warn("loadDraft err", e);
      return null;
    }
  }

  populateFromFlat(flat) {
    for (const k in flat) {
      const els = Array.from(this.rootForm.querySelectorAll(`[name="${k}"]`));
      if (!els.length) continue;
      const val = flat[k];
      els.forEach(el => {
        if (el.type === "radio") {
          el.checked = (el.value === val);
        } else if (el.type === "checkbox") {
          el.checked = Array.isArray(val) ? val.includes(el.value) : !!val;
        } else {
          el.value = val;
        }
      });
    }
  }

  // Server message UI
  showServerMessage(message) {
    const el = document.getElementById(this.serverMsgElId);
    if (!el) {
      alert(message);
      return;
    }
    const details = el.querySelector("#ade-error-details");
    if (details) {
      details.textContent = message || "";
      details.classList.remove('is-hidden');
    }
    el.classList.remove('is-hidden');
    this.steps.forEach(s => s.classList.add('is-hidden'));
  }

  hideServerMessage() {
    const el = document.getElementById(this.serverMsgElId);
    if (!el) return;
    const details = el.querySelector("#ade-error-details");
    if (details) {
      details.textContent = "";
      details.classList.add('is-hidden');
    }
    el.classList.add('is-hidden');
  }

  // Loading
  setFormLoading(state) {
    if (!this.rootForm) return;
    const submitBtn = this.rootForm.querySelector('button[type="submit"], #ade-submit');
    if (submitBtn) submitBtn.classList.toggle("is-loading", !!state);
    Array.from(this.rootForm.querySelectorAll("input,textarea,select,button")).forEach(c => {
      c.disabled = !!state;
    });
  }

  fetchWithTimeout(url, options = {}, timeout = this.FETCH_TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;
    return fetch(url, options).finally(() => clearTimeout(id));
  }

  // Submit
  async handleSubmit(e) {
    e.preventDefault();
    this.rootForm.dataset.submitted = "1";

    let allValid = true;
    for (let i = 0; i < this.steps.length; i++) {
      if (!this.validateStep(i)) allValid = false;
    }
    if (!allValid) {
      this.focusFirstInvalid(this.currentStepIndex);
      return;
    }

    const excl1 = this.checkExclusions("1");
    const excl2 = this.checkExclusions("2");
    if (excl1.excluded || excl2.excluded) {
      this.handleExclusion();
      return;
    }

    const payload = this.collectStateNested();
    const utm_term = this.getParamFromCurrentPage("utm_term");
    if (utm_term) payload.utm_term = utm_term;
    this.saveDraft();

    this.setFormLoading(true);
    this.hideServerMessage();

    try {
      const resp = await this.fetchWithTimeout(this.WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const bodyText = await resp.text().catch(() => "");

      if (resp.ok) {
        this.goToStepByName("5");
        this.injectCalendly(this.CALENDLY_URL, payload);
        localStorage.removeItem(this.DRAFT_KEY);
      } else {
        this.showServerMessage(bodyText || `Erreur ${resp.status}`);
      }
    } catch (err) {
      this.showServerMessage(err?.message || "Erreur réseau : impossible de contacter le serveur.");
    } finally {
      this.setFormLoading(false);
    }
  }

  getParamFromCurrentPage(param_name) {
    param_name = param_name.replace(/([\[\]])/g, "\\$1");
    const regex = new RegExp("[\\?&]" + param_name + "=([^&#]*)");
    const results = regex.exec(window.location.href);
    return results ? results[1] : "";
  }

  getUtmParams() {
    return {
      utmCampaign: this.getParamFromCurrentPage("utm_campaign"),
      utmSource: this.getParamFromCurrentPage("utm_source"),
      utmMedium: this.getParamFromCurrentPage("utm_medium"),
      utmContent: this.getParamFromCurrentPage("gclid"),
      utmTerm: this.getParamFromCurrentPage("utm_term")
    };
  }

  // Calendly inline widget
  injectCalendly(url, payload) {
    const wrap = document.getElementById("ade-calendly");
    const utmParams = this.getUtmParams();
    const prefill = {};
    
    if (payload.coordonnees?.email) prefill.email = payload.coordonnees.email;
    if (payload.coordonnees?.first_name) prefill.firstName = payload.coordonnees.first_name;
    if (payload.coordonnees?.last_name) prefill.lastName = payload.coordonnees.last_name;

    if (!wrap) return;
    if (!url || String(url).trim().length < 5) {
      this.showServerMessage("Calendly non configuré.");
      return;
    }
    if (wrap.dataset.loaded === "1") return;

    if (window.Calendly && typeof window.Calendly.initInlineWidget === "function") {
      try {
        window.Calendly.initInlineWidget({
          url: url,
          parentElement: wrap,
          prefill: prefill,
          utm: utmParams,
          resize: true
        });
        wrap.dataset.loaded = "1";
      } catch (err) {
        console.warn("Calendly inline init erreur", err);
        this.showServerMessage("Erreur lors de l'initialisation du calendrier.");
      }
    } else {
      this.showServerMessage("Le widget Calendly n'est pas disponible (script manquant).");
    }
  }
}

/* ============================================
 * SEUIL CAROUSEL v2.1 - Carousel
 * Utilisable dans la modale ou standalone
 * data-carousel               : Active l'auto-init
 * data-loop="true/false"     : Active/désactive le loop (défaut: true)
 * data-autoplay="true/false" : Autoplay (défaut: false)
 * data-autoplay-delay="5000" : Délai autoplay en ms
 * data-slides-per-view="3"   : Nombre de slides visibles desktop (défaut: 1)
 * data-slides-per-view-mobile="1" : Nombre de slides visibles mobile (défaut: 1)
 * data-show-peek="true"      : Afficher aperçu slide suivante (défaut: false)
 * data-peek-amount="80px"    : Taille de l'aperçu (défaut: 60px)
 * data-show-bullets="true"   : Afficher les bullets (défaut: false)
 * data-swipe="true/false"    : Activer le swipe (défaut: true)
 * ============================================ */

class SeuilCarousel {
  constructor(carouselId, options = {}) {
    this.carouselId = carouselId;
    this.carousel = document.getElementById(carouselId);
    
    if (!this.carousel) {
      console.error(`Carousel with id "${carouselId}" not found`);
      return;
    }

    // Options (inchangées)
    this.options = {
      autoplay: this.carousel.dataset.autoplay === 'true' || options.autoplay || false,
      autoplayDelay: parseInt(this.carousel.dataset.autoplayDelay) || options.autoplayDelay || 5000,
      loop: this.carousel.dataset.loop !== 'false' && (options.loop !== false),
      swipe: this.carousel.dataset.swipe !== 'false' && (options.swipe !== false),
      slidesPerView: parseInt(this.carousel.dataset.slidesPerView) || options.slidesPerView || 1,
      slidesPerViewMobile: parseInt(this.carousel.dataset.slidesPerViewMobile) || options.slidesPerViewMobile || 1,
      showPeek: this.carousel.dataset.showPeek === 'true' || options.showPeek || false,
      peekAmount: this.carousel.dataset.peekAmount || options.peekAmount || '60px',
      showBullets: this.carousel.dataset.showBullets === 'true' || options.showBullets || false,
      onChange: options.onChange || null,
      ...options
    };

    // DOM elements (inchangés)
    this.track = this.carousel.querySelector('.seuil-carousel-track');
    this.slides = Array.from(this.carousel.querySelectorAll('.seuil-carousel-slide'));
    this.prevBtn = this.carousel.querySelector('.seuil-carousel-prev');
    this.nextBtn = this.carousel.querySelector('.seuil-carousel-next');
    
    this.tabsContainer = this.carousel.querySelector('.seuil-carousel-tabs') || 
                        document.querySelector(`[data-carousel-tabs="${carouselId}"]`);
    this.tabs = this.tabsContainer ? Array.from(this.tabsContainer.querySelectorAll('.seuil-carousel-tab')) : [];

    // State
    this.currentIndex = 0;
    this.isAnimating = false;
    this.autoplayTimer = null;
    this.isMobile = window.innerWidth < 768;

    // Touch state - AMÉLIORÉ
    this.touch = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      isScrolling: null,
      allowClick: true,
      isDragging: false,
      initialTranslate: 0,
      currentTranslate: 0
    };

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    this.init();
  }

  init() {
    if (!this.track || this.slides.length === 0) return;

    this.updateResponsive();

    if (this.options.showBullets) {
      this.createBullets();
    }

    this.goToSlide(0, false);

    // Events
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.goToSlide(index * this.getCurrentSlidesPerView()));
    });

    // Touch amélioré
    if (this.options.swipe) {
      this.initTouchEvents();
    }

    if (this.options.autoplay) {
      this.startAutoplay();
    }

    this.updateButtons();
  }

  // Tout le reste de ton code reste IDENTIQUE jusqu'à initSwipe()
  updateResponsive() {
    this.isMobile = window.innerWidth < 768;
    const slidesPerView = this.getCurrentSlidesPerView();
    
    if (this.options.showPeek && !this.isMobile) {
      this.carousel.style.setProperty('--peek-amount', this.options.peekAmount);
      this.carousel.classList.add('has-peek');
    } else {
      this.carousel.classList.remove('has-peek');
    }

    this.slides.forEach(slide => {
      if (this.options.showPeek && !this.isMobile) {
        const width = `calc((100% - ${this.options.peekAmount}) / ${slidesPerView})`;
        slide.style.width = width;
        slide.style.flexBasis = width;
      } else {
        const width = `${100 / slidesPerView}%`;
        slide.style.width = width;
        slide.style.flexBasis = width;
      }
    });

    if (this.options.showBullets) {
      this.createBullets();
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      const wasMobile = this.isMobile;
      this.updateResponsive();
      
      if (wasMobile !== this.isMobile) {
        this.goToSlide(this.currentIndex, false);
      }
    }, 150);
  }

  getCurrentSlidesPerView() {
    return this.isMobile ? this.options.slidesPerViewMobile : this.options.slidesPerView;
  }

  getTotalPages() {
    const slidesPerView = this.getCurrentSlidesPerView();
    return Math.ceil(this.slides.length / slidesPerView);
  }

  getCurrentPage() {
    const slidesPerView = this.getCurrentSlidesPerView();
    return Math.floor(this.currentIndex / slidesPerView);
  }

  createBullets() {
    if (this.bulletsContainer) {
      this.bulletsContainer.remove();
    }

    const totalPages = this.getTotalPages();
    if (totalPages <= 1) return;

    this.bulletsContainer = document.createElement('div');
    this.bulletsContainer.className = 'seuil-carousel-bullets';
    
    this.bullets = [];
    for (let i = 0; i < totalPages; i++) {
      const bullet = document.createElement('button');
      bullet.className = 'seuil-carousel-bullet';
      bullet.setAttribute('aria-label', `Aller à la page ${i + 1}`);
      if (i === 0) bullet.classList.add('is-active');
      
      bullet.addEventListener('click', () => {
        const slidesPerView = this.getCurrentSlidesPerView();
        this.goToSlide(i * slidesPerView);
      });
      
      this.bullets.push(bullet);
      this.bulletsContainer.appendChild(bullet);
    }

    const viewport = this.carousel.querySelector('.seuil-carousel-viewport');
    if (viewport) {
      viewport.after(this.bulletsContainer);
    }
  }

  updateBullets() {
    if (!this.options.showBullets || !this.bullets.length) return;
    
    const currentPage = this.getCurrentPage();
    this.bullets.forEach((bullet, i) => {
      bullet.classList.toggle('is-active', i === currentPage);
    });
  }

  goToSlide(index, animate = true) {
    if (this.isAnimating && animate) return;
    
    const slidesPerView = this.getCurrentSlidesPerView();
    const maxIndex = this.slides.length - slidesPerView;
    
    if (this.options.loop) {
      if (index < 0) index = maxIndex;
      if (index > maxIndex) index = 0;
    } else {
      if (index < 0) index = 0;
      if (index > maxIndex) index = maxIndex;
    }

    if (index === this.currentIndex && animate) return;

    if (animate) {
      this.isAnimating = true;
    }

    this.slides.forEach((slide, i) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next');
      if (i >= index && i < index + slidesPerView) {
        slide.classList.add('is-active');
      } else if (i < index) {
        slide.classList.add('is-prev');
      } else {
        slide.classList.add('is-next');
      }
    });

    const currentPage = Math.floor(index / slidesPerView);
    this.tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === currentPage);
    });

    // Animation avec transform - PLUS ROBUSTE que scroll
    const translateX = -(index * (100 / slidesPerView));
    
    this.track.style.transition = animate ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    this.track.style.transform = `translateX(${translateX}%)`;

    this.currentIndex = index;

    if (animate) {
      setTimeout(() => {
        this.isAnimating = false;
      }, 400);
    }

    this.updateButtons();
    this.updateBullets();

    if (typeof this.options.onChange === 'function') {
      this.options.onChange(index, this.slides[index], currentPage);
    }

    if (this.options.autoplay) {
      this.resetAutoplay();
    }
  }

  next() {
    const slidesPerView = this.getCurrentSlidesPerView();
    this.goToSlide(this.currentIndex + slidesPerView);
  }

  prev() {
    const slidesPerView = this.getCurrentSlidesPerView();
    this.goToSlide(this.currentIndex - slidesPerView);
  }

  updateButtons() {
    if (!this.prevBtn || !this.nextBtn) return;
    
    const slidesPerView = this.getCurrentSlidesPerView();
    const maxIndex = this.slides.length - slidesPerView;
    
    if (this.options.loop) {
      this.prevBtn.classList.remove('is-disabled');
      this.nextBtn.classList.remove('is-disabled');
      this.prevBtn.disabled = false;
      this.nextBtn.disabled = false;
    } else {
      const atStart = this.currentIndex === 0;
      const atEnd = this.currentIndex >= maxIndex;
      
      this.prevBtn.classList.toggle('is-disabled', atStart);
      this.nextBtn.classList.toggle('is-disabled', atEnd);
      this.prevBtn.disabled = atStart;
      this.nextBtn.disabled = atEnd;
    }
  }

  /* ============================================
   * TOUCH EVENTS - Version robuste et propre
   * ============================================ */
  initTouchEvents() {
    // Support souris aussi
    const events = {
      start: ['touchstart', 'mousedown'],
      move: ['touchmove', 'mousemove'],
      end: ['touchend', 'touchcancel', 'mouseup']
    };

    // Start
    events.start.forEach(event => {
      this.track.addEventListener(event, this.onTouchStart.bind(this), { 
        passive: event.startsWith('touch') 
      });
    });

    // Move
    events.move.forEach(event => {
      this.track.addEventListener(event, this.onTouchMove.bind(this), { 
        passive: false 
      });
    });

    // End
    events.end.forEach(event => {
      this.track.addEventListener(event, this.onTouchEnd.bind(this), { 
        passive: true 
      });
    });

    // Prevent context menu on long press
    this.track.addEventListener('contextmenu', e => {
      if (this.touch.isDragging) e.preventDefault();
    });
  }

  onTouchStart(e) {
    if (this.isAnimating) return;

    const point = e.touches ? e.touches[0] : e;
    
    this.touch.startX = point.clientX;
    this.touch.startY = point.clientY;
    this.touch.currentX = point.clientX;
    this.touch.currentY = point.clientY;
    this.touch.startTime = Date.now();
    this.touch.isScrolling = null;
    this.touch.allowClick = true;
    this.touch.isDragging = false;

    // Stocker la position actuelle
    const slidesPerView = this.getCurrentSlidesPerView();
    this.touch.initialTranslate = -(this.currentIndex * (100 / slidesPerView));
    this.touch.currentTranslate = this.touch.initialTranslate;

    // Enlever les transitions pour un drag fluide
    this.track.style.transition = 'none';

    // Prevent text selection
    document.body.style.userSelect = 'none';
  }

  onTouchMove(e) {
    if (!this.touch.startX) return;

    const point = e.touches ? e.touches[0] : e;
    this.touch.currentX = point.clientX;
    this.touch.currentY = point.clientY;

    const diffX = this.touch.currentX - this.touch.startX;
    const diffY = this.touch.currentY - this.touch.startY;

    // Détection de direction au premier mouvement
    if (this.touch.isScrolling === null) {
      this.touch.isScrolling = Math.abs(diffY) > Math.abs(diffX);
    }

    // Si c'est un scroll vertical, on laisse faire
    if (this.touch.isScrolling) {
      return;
    }

    // On est en train de swiper horizontalement
    e.preventDefault();
    this.touch.isDragging = true;
    this.touch.allowClick = false;

    // Calculer le nouveau translate
    const trackWidth = this.track.offsetWidth;
    const dragPercent = (diffX / trackWidth) * 100;
    let newTranslate = this.touch.initialTranslate + dragPercent;

    // Résistance aux bords si pas de loop
    if (!this.options.loop) {
      const slidesPerView = this.getCurrentSlidesPerView();
      const maxTranslate = 0;
      const minTranslate = -((this.slides.length - slidesPerView) * (100 / slidesPerView));

      if (newTranslate > maxTranslate) {
        newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.3;
      } else if (newTranslate < minTranslate) {
        newTranslate = minTranslate + (newTranslate - minTranslate) * 0.3;
      }
    }

    this.touch.currentTranslate = newTranslate;
    this.track.style.transform = `translateX(${newTranslate}%)`;
  }

  onTouchEnd(e) {
    if (!this.touch.startX) return;

    const touchDuration = Date.now() - this.touch.startTime;
    const distance = this.touch.currentX - this.touch.startX;
    const velocity = Math.abs(distance) / touchDuration;

    // Restaurer les styles
    this.track.style.transition = '';
    document.body.style.userSelect = '';

    // Si pas de drag, permettre le click
    if (!this.touch.isDragging) {
      this.resetTouch();
      return;
    }

    // Déterminer la direction et l'intensité
    const slidesPerView = this.getCurrentSlidesPerView();
    const threshold = velocity > 0.5 ? 30 : trackWidth * 0.2; // Seuil adaptatif
    const trackWidth = this.track.offsetWidth;

    let targetIndex = this.currentIndex;

    if (Math.abs(distance) > threshold) {
      if (distance > 0) {
        // Swipe vers la droite - slide précédente
        targetIndex = this.currentIndex - slidesPerView;
      } else {
        // Swipe vers la gauche - slide suivante  
        targetIndex = this.currentIndex + slidesPerView;
      }
    }

    // Aller à la slide cible
    this.goToSlide(targetIndex, true);
    
    this.resetTouch();
  }

  resetTouch() {
    this.touch = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0,
      isScrolling: null,
      allowClick: true,
      isDragging: false,
      initialTranslate: 0,
      currentTranslate: 0
    };
  }

  // Autoplay (inchangé)
  startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      this.next();
    }, this.options.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  resetAutoplay() {
    this.stopAutoplay();
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  destroy() {
    this.stopAutoplay();
    window.removeEventListener('resize', this.handleResize);
    if (this.bulletsContainer) {
      this.bulletsContainer.remove();
    }
  }
}


/* ============================================
 * MODALS MANAGER - Auto-initialisation des modales
 * ============================================ */
class ModalsManager {
  constructor() {
    this.modals = new Map();
  }

  init() {
    // Auto-initialisation pour les modales avec data-modal-trigger
    const triggers = document.querySelectorAll('[data-modal-trigger]');
    
    triggers.forEach(trigger => {
      const modalId = trigger.getAttribute('data-modal-trigger');
      
      // Créer la modale si elle n'existe pas déjà
      if (!this.modals.has(modalId)) {
        const modal = new SeuilModal(modalId);
        this.modals.set(modalId, modal);
      }
      
      // Attacher l'event listener
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = this.modals.get(modalId);
        if (modal) modal.open();
      });
    });
  }

  // Méthode pour créer une modale programmatiquement
  create(modalId, options = {}) {
    if (this.modals.has(modalId)) {
      console.warn(`Modal "${modalId}" already exists`);
      return this.modals.get(modalId);
    }
    
    const modal = new SeuilModal(modalId, options);
    this.modals.set(modalId, modal);
    return modal;
  }

  // Récupérer une modale existante
  get(modalId) {
    return this.modals.get(modalId);
  }

  // Fermer toutes les modales
  closeAll() {
    this.modals.forEach(modal => modal.close());
  }

  // Détruire une modale
  destroy(modalId) {
    const modal = this.modals.get(modalId);
    if (modal) {
      modal.destroy();
      this.modals.delete(modalId);
    }
  }
}

/* ============================================
 * CAROUSEL MANAGER - Auto-initialisation
 * ============================================ */
class CarouselManager {
  constructor() {
    this.carousels = new Map();
  }

  init() {
    // Auto-init tous les carousels
    const carouselElements = document.querySelectorAll('[data-carousel]');
    
    carouselElements.forEach(el => {
      const id = el.id;
      if (!id) return;

      const carousel = new SeuilCarousel(id);
      this.carousels.set(id, carousel);
    });
  }

  create(carouselId, options = {}) {
    if (this.carousels.has(carouselId)) {
      console.warn(`Carousel "${carouselId}" already exists`);
      return this.carousels.get(carouselId);
    }
    
    const carousel = new SeuilCarousel(carouselId, options);
    this.carousels.set(carouselId, carousel);
    return carousel;
  }

  get(carouselId) {
    return this.carousels.get(carouselId);
  }

  destroy(carouselId) {
    const carousel = this.carousels.get(carouselId);
    if (carousel) {
      carousel.destroy();
      this.carousels.delete(carouselId);
    }
  }
}


/* ============================================
 * APPLICATION PRINCIPALE
 * ============================================ */
class App {
  constructor() {
    this.modules = {
      navOverlay: new NavOverlay(),
      expandableToggle: new ExpandableToggle(),
      faq: new FAQ(),
      cookieBanner: new CookieBanner(),
      utmParams: new UTMParamsPropagation(),
      adequation: new Adequation(),
      modals: new ModalsManager(),
      carousels: new CarouselManager()
    };
  }

  init() {
    // Initialiser tous les modules
    Object.values(this.modules).forEach(module => {
      if (module && typeof module.init === 'function') {
        module.init();
      }
    });
    
    // Exposer l'API des modales pour usage externe
    window.SeuilModals = this.modules.modals;
    
    // console.log('App initialised');
  }

  // Méthode pour accéder aux modules depuis l'extérieur
  getModule(name) {
    return this.modules[name];
  }
}


/* ============================================
 * BOOT
 * ============================================ */
const app = new App();
document.addEventListener('DOMContentLoaded', () => {
  app.init();

  // Retirer la classe preload après un court délai
  setTimeout(() => {
    document.documentElement.classList.remove('preload');
  }, 100);
});

// Exposer l'app globalement pour usage externe si nécessaire
window.App = app;