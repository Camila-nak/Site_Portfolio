(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

  const systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // true se o sistema (ou o navegador) pede menos movimento
  const motionReduced = () => systemReducedMotion.matches;

  /*Cabeçalho*/
  const header = $('#topo');

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /*Menu mobile*/
  const menu = $('#menu');
  const menuButton = $('#topo nav > button');

  const setMenu = (open) => {
    if (!menu || !menuButton) return;
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  if (menu && menuButton) {
    menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));

    // fecha o menu ao escolher um item
    $$('a', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        setMenu(false);
        menuButton.focus();
      }
    });

    // se a tela voltar a ser larga, fecha o menu mobile
    window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /*Link ativo no menu */
  const sectionLinks = $$('#menu a[href^="#"]');
  const sections = sectionLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const revealSelectors = [
    '#projetos header > h2',
    '#projetos header > h2 + p',
    '#projetos article',
    '#sobre header > h2',
    '#sobre > div > p',
    '#sobre dl',
    '#habilidades header > h2',
    '#habilidades article',
    '#contato h2',
  ];

  const revealItems = $$(revealSelectors.join(', '));
  revealItems.forEach((item) => item.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /*Contadores */
  const animateCount = (element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;

    if (motionReduced()) {
      element.textContent = target;
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    element.textContent = 0;
    requestAnimationFrame(tick);
  };

  const counters = $$('[data-count]');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  /* 7. Ano no rodapé*/
  const year = $('#ano');
  if (year) year.textContent = new Date().getFullYear();
})();