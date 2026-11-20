/* Small, accessible click feedback shared by every Constantine page. */
(() => {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  document.documentElement.classList.add('interaction-effects-ready');

  const interactiveSelector = [
    'a', 'button', 'input', 'select', 'textarea', 'summary',
    '[role="button"]', '[role="tab"]', '[role="checkbox"]', '[role="radio"]',
    '[data-interactive]', '.tile', '.feature-card', '.explore-card',
    '.quote-card', '.ruler-card', '.miracle-card', '.person', '.saint-card',
    '.prophet-card', '.person-card', '.angel-card', '.prayer-card'
  ].join(',');

  document.addEventListener('click', event => {
    const target = event.target instanceof Element
      ? event.target.closest(interactiveSelector)
      : null;

    if (target && (target.matches(':disabled') || target.getAttribute('aria-disabled') === 'true')) {
      return;
    }

    const ripple = document.createElement('span');
    ripple.className = 'interaction-ripple';

    let x = event.clientX;
    let y = event.clientY;
    if (!x && !y && target) {
      const rect = target.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    window.setTimeout(() => ripple.remove(), 700);

    if (target) {
      target.classList.remove('interaction-pressed');
      void target.offsetWidth;
      target.classList.add('interaction-pressed');
      window.setTimeout(() => target.classList.remove('interaction-pressed'), 260);
    }
  }, true);
})();
