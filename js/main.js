/* ============================================================
   Jack M. Kite Co. — interaction layer
   GSAP 3.13 + ScrollTrigger + SplitText (CDN, loaded before this)
   Everything degrades: reduced-motion users get a static page,
   no-JS users get the .no-js CSS fallbacks.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof gsap !== 'undefined';

  if (hasGsap) gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- year stamp ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- nav current page ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .menu__links a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  /* ---------- nav scroll behaviour ---------- */
  var nav = document.querySelector('.nav');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (y > 320 && y > lastY + 4 && !menuOpen) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 320) nav.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.classList.remove('is-hidden');
    if (!hasGsap || reduced) {
      menu.style.visibility = open ? 'visible' : 'hidden';
      menu.style.clipPath = open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)';
      return;
    }
    if (open) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'power4.inOut' });
      gsap.fromTo(menu.querySelectorAll('.menu__links a'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.25, ease: 'power3.out', overwrite: true });
      gsap.fromTo(menu.querySelector('.menu__foot'),
        { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.55, overwrite: true });
    } else {
      gsap.to(menu, {
        clipPath: 'inset(0 0 100% 0)', duration: 0.5, ease: 'power4.inOut',
        onComplete: function () { gsap.set(menu, { visibility: 'hidden' }); }
      });
    }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!menuOpen); });

  /* ---------- page transition wipe ---------- */
  var wipe = document.querySelector('.wipe');

  if (wipe && hasGsap && !reduced) {
    if (sessionStorage.getItem('kite-wipe')) {
      sessionStorage.removeItem('kite-wipe');
      gsap.set(wipe, { scaleY: 1, transformOrigin: 'top center' });
      wipe.classList.add('is-active');
      gsap.to(wipe, {
        scaleY: 0, duration: 0.7, ease: 'power4.inOut', delay: 0.08,
        onComplete: function () { wipe.classList.remove('is-active'); }
      });
    }
    document.querySelectorAll('a[data-transition]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href.indexOf('#') === 0 || a.target === '_blank') return;
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (href === here) { e.preventDefault(); if (menuOpen) setMenu(false); return; }
        e.preventDefault();
        wipe.classList.add('is-active');
        sessionStorage.setItem('kite-wipe', '1');
        gsap.set(wipe, { transformOrigin: 'bottom center' });
        gsap.to(wipe, {
          scaleY: 1, duration: 0.55, ease: 'power4.inOut',
          onComplete: function () { location.href = href; }
        });
      });
    });
    // restore if user navigates back from bfcache mid-wipe
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) gsap.set(wipe, { scaleY: 0 });
    });
  }

  /* ============================================================
     Everything below is decorative motion — bail out politely
     ============================================================ */
  if (!hasGsap || reduced) {
    document.querySelectorAll('[data-counter]').forEach(function (el) {
      el.textContent = el.getAttribute('data-counter');
    });
    return;
  }

  /* ---------- hero entrance ---------- */
  var heroLines = document.querySelectorAll('[data-hero-title] .line');
  if (heroLines.length) {
    heroLines.forEach(function (line) {
      var shell = document.createElement('span');
      shell.style.cssText = 'display:block;overflow:clip';
      line.parentNode.insertBefore(shell, line);
      shell.appendChild(line);
    });
    var intro = gsap.timeline({ delay: sessionStorage.getItem('kite-wipe') ? 0.55 : 0.15 });
    intro.from(heroLines, {
      yPercent: 112, duration: 1.1, stagger: 0.12, ease: 'power4.out'
    }).from('[data-hero-fade]', {
      y: 28, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out'
    }, '-=0.55');
  }

  /* hero content drifts up slightly as you scroll past */
  var heroContent = document.querySelector('.hero__content');
  if (heroContent) {
    gsap.to(heroContent, {
      yPercent: -12, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'bottom 90%', end: 'bottom 30%', scrub: true }
    });
  }

  /* ---------- generic reveals ---------- */
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    gsap.fromTo(el, { y: 34, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- split-line headings + statement (after fonts) ---------- */
  document.fonts.ready.then(function () {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      var split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1, stagger: 0.09, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    var statement = document.querySelector('[data-statement]');
    if (statement) {
      var words = new SplitText(statement, { type: 'words', wordsClass: 'word' }).words;
      gsap.fromTo(words, { opacity: 0.13 }, {
        opacity: 1, stagger: 0.04, ease: 'none',
        scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 45%', scrub: 0.4 }
      });
    }
    ScrollTrigger.refresh();
  });

  /* ---------- counters ---------- */
  document.querySelectorAll('[data-counter]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });

  /* ---------- marquee ---------- */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    gsap.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
  });

  /* ---------- parallax media ---------- */
  document.querySelectorAll('.ph[data-parallax] img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img.closest('.ph'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- footer big type ---------- */
  var footBig = document.querySelector('[data-footer-big]');
  if (footBig) {
    gsap.from(footBig, {
      yPercent: 45, ease: 'none',
      scrollTrigger: { trigger: footBig, start: 'top bottom', end: 'top 65%', scrub: true }
    });
  }

  /* ---------- thermometer scroll progress ---------- */
  var thermoFill = document.querySelector('.thermo__fill');
  if (thermoFill) {
    gsap.to(thermoFill, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------- custom cursor ---------- */
  if (finePointer) {
    var dot = document.querySelector('.cursor:not(.cursor--ring)');
    var ring = document.querySelector('.cursor--ring');
    if (dot && ring) {
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      var dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
      var dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
      var rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power2.out' });
      var ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power2.out' });
      window.addEventListener('pointermove', function (e) {
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      }, { passive: true });
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest('a, button, .area-chip')) gsap.to(ring, { scale: 1.7, duration: 0.3 });
      });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest('a, button, .area-chip')) gsap.to(ring, { scale: 1, duration: 0.3 });
      });
    }
  }

  /* ---------- service index hover preview ---------- */
  if (finePointer) {
    var preview = document.querySelector('.svc-preview');
    var rows = document.querySelectorAll('.svc-row[data-preview-img]');
    if (preview && rows.length) {
      var imgs = {};
      rows.forEach(function (row) {
        var src = row.getAttribute('data-preview-img');
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        preview.appendChild(img);
        imgs[src] = img;
      });
      var px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
      var py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });
      gsap.set(preview, { xPercent: 8, yPercent: -50 });

      rows.forEach(function (row) {
        row.addEventListener('mouseenter', function () {
          Object.keys(imgs).forEach(function (k) { imgs[k].classList.remove('is-active'); });
          imgs[row.getAttribute('data-preview-img')].classList.add('is-active');
          gsap.to(preview, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' });
        });
        row.addEventListener('mousemove', function (e) { px(e.clientX); py(e.clientY); });
        row.addEventListener('mouseleave', function () {
          gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.35, ease: 'power3.in' });
        });
      });
    }
  }

  /* ---------- live temperature readouts (hero) ---------- */
  document.querySelectorAll('[data-temp-read]').forEach(function (el) {
    var cold = el.getAttribute('data-temp-read') === 'cold';
    var base = cold ? 72 : 68;
    var state = { v: base };
    function drift() {
      gsap.to(state, {
        v: base + (Math.random() * 2.4 - 1.2),
        duration: 2.4 + Math.random() * 2,
        ease: 'sine.inOut',
        onUpdate: function () { el.textContent = state.v.toFixed(1) + '°F'; },
        onComplete: drift
      });
    }
    drift();
  });

  /* ---------- floating-label selects (contact form) ---------- */
  document.querySelectorAll('.field select').forEach(function (sel) {
    function sync() { sel.closest('.field').classList.toggle('is-filled', !!sel.value); }
    sel.addEventListener('change', sync);
    sync();
  });
})();
