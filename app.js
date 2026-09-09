/* Cayo Labs — app.js */
(function () {
  // Year
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Theme toggle
  var root = document.documentElement;
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = prefersDark ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  applyIcon(theme);

  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      applyIcon(theme);
    });
  }

  function applyIcon(t) {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Cambiar a modo ' + (t === 'dark' ? 'claro' : 'oscuro'));
    toggle.innerHTML = t === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // Header shadow on scroll
  var header = document.getElementById('header');
  var onScroll = function () { if (header) header.classList.toggle('header--scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var menuBtn = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll('.card, .section__head, .stats, .strip__inner, .contact__form, .contact__intro');
  reveals.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Contact form → FormSubmit (envía al correo de la empresa)
  var form = document.querySelector('.contact__form');
  if (form) {
    var statusEl = form.querySelector('.form__status');
    var submitBtn = form.querySelector('[type="submit"]');
    var emailTo = form.getAttribute('data-contact-email') || '';

    function setStatus(type, message) {
      if (!statusEl) return;
      statusEl.hidden = !message;
      statusEl.className = 'form__status' + (type ? ' form__status--' + type : '');
      statusEl.textContent = message || '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!emailTo) {
        setStatus('error', 'No hay un correo de destino configurado.');
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var payload = Object.fromEntries(new FormData(form).entries());
      setStatus('pending', 'Enviando mensaje…');
      if (submitBtn) submitBtn.disabled = true;

      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(emailTo), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok && result.data && result.data.success !== 'false') {
            setStatus('success', 'Mensaje enviado. Te responderemos pronto.');
            form.reset();
          } else {
            var msg = (result.data && result.data.message) || 'No se pudo enviar. Inténtalo de nuevo.';
            setStatus('error', msg);
          }
        })
        .catch(function () {
          setStatus('error', 'Error de red. Revisa tu conexión e inténtalo de nuevo.');
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
