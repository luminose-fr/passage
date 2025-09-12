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


  /* ------------ ADEQUATION FORM ------------ */
  const AdequationForm = (() => {
    let form, errorSummary;

    const validateRequiredFields = () => {
      let firstInvalid = null;
      const requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(el => {
        const invalid =
          (el.type === 'checkbox' && !el.checked) ||
          (el.type === 'radio' && !form.querySelector(`input[name="${el.name}"]:checked`)) ||
          (!['checkbox','radio'].includes(el.type) && !el.value.trim());

        if (invalid) {
          el.setAttribute('aria-invalid','true');
          if (!firstInvalid) firstInvalid = el;
        } else {
          el.removeAttribute('aria-invalid');
        }
      });

      if (firstInvalid) {
        if (errorSummary) { errorSummary.hidden = false; errorSummary.focus(); }
        return false;
      }
      return true;
    };

    const handleSubmit = e => {
      e.preventDefault();
      if (!validateRequiredFields()) return;

      const fd = new FormData(form);
      const yes = v => v === 'oui';

      const ciAny = ['ci_psychose','ci_cardio','ci_grossesse','ci_yeux_chir','ci_psychotrope','ci_trauma'].some(n => yes(fd.get(n)));
      const canTravel = yes(fd.get('ci_deplacement'));
      const age = parseInt(fd.get('age')||'0',10);

      const missingLong = ['why','change','explored']
        .map(n => (fd.get(n)||'').trim())
        .some(txt => txt.length < 40);

      const result  = document.getElementById('form-result');
      const title   = document.getElementById('form-result-title');
      const text    = document.getElementById('form-result-text');
      const actions = document.getElementById('form-result-actions');
      const show    = () => { result.hidden = false; result.scrollIntoView({behavior:'smooth'}); };

      // --- Decision tree ---
      if (ciAny || !canTravel) {
        localStorage.removeItem('leSeuilAdmissible');
        title.textContent = "Merci. Pour votre sécurité, Le Seuil n’est pas indiqué aujourd’hui.";
        text.innerHTML    = "Certaines réponses indiquent des contre‑indications aux états modifiés de conscience, ou une impossibilité logistique. Nous vous invitons à consulter un professionnel de santé. Ressources et précisions sur la page Sécurité.";
        actions.innerHTML = `<a class="button is-primary" href="{{ '/securite/' | relative_url }}">Voir la page Sécurité</a>`;
        show(); track('form_blocked'); return;
      }

      if ((age>0 && age<21) || missingLong) {
        localStorage.removeItem('leSeuilAdmissible');
        title.textContent = "Merci. Votre demande nécessite une courte relecture.";
        text.textContent  = "Nous revenons vers vous sous 48 h pour confirmer l’entretien gratuit. Aucun prix n’est affiché en ligne; l’investissement est communiqué en fin d’entretien. Paiement échelonné possible.";
        actions.innerHTML = `<a class="button is-light" href="{{ '/' | relative_url }}">Retour à l’accueil</a>`;
        show(); track('form_review'); return;
      }

      // Pre-admissible
      localStorage.setItem('leSeuilAdmissible','1');
      track('form_submit', {status:'admissible'});
      window.location.href = "{{ '/entretien/' | relative_url }}";
    };

    const init = () => {
      form = document.querySelector('#adequation-form');
      if (!form) return;
      errorSummary = document.getElementById('form-error-summary');
      form.addEventListener('submit', handleSubmit);
    };

    return { init };
  })();


  /* ------------ CALENDLY GATE ------------ */
  const CalendlyGate = (() => {
    const init = () => {
      const gate = document.getElementById('entretien-gate');
      const cal  = document.getElementById('calendly-embed');
      if (!gate || !cal) return;

      const ok = localStorage.getItem('leSeuilAdmissible') === '1';
      gate.hidden = ok;
      cal.hidden  = !ok;
      track('calendly_view', {allowed: ok});
    };
    return { init };
  })();


  /* ------------ APP INIT ------------ */
  const init = () => {
    NavOverlay.init();
    CardToggle.init();
    FAQ.init();
    Carousel.init();
    CookieBanner.init();
    AdequationForm.init();
    CalendlyGate.init();
    // console.log('App initialised');
  };

  return { init };

})();


// === Boot on DOM ready
document.addEventListener('DOMContentLoaded', App.init);