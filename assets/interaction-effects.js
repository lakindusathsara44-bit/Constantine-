/* Site-wide click, ripple and in-view effects for Constantine. */
(() => {
  'use strict';
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const interactive = 'a,button,input,select,textarea,label,summary,[role="button"],[tabindex]:not([tabindex="-1"])';
  const cards = '.ruler-card,.miracle-card,.quote-card,.person,.prophet-card,.saint-card,.explore-card,.feature-card,.tile,.prayer-card,.person-card,.angel-card';
  const selector = interactive + ',' + cards;
  const isElement = value => value && value.nodeType === 1;

  function findTarget(target) {
    if (!isElement(target)) target = target && target.parentElement;
    return isElement(target) ? target.closest(selector) : null;
  }

  function addRipple(target, event) {
    if (!target || reduceMotion || !event || event.button !== 0) return;
    if (target.matches('input,select,textarea,label')) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ui-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.left = (event.clientX - rect.left) + 'px';
    ripple.style.top = (event.clientY - rect.top) + 'px';
    target.classList.add('ui-ripple-host');
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), {once:true});
    window.setTimeout(() => { if (ripple.isConnected) ripple.remove(); }, 800);
  }

  document.addEventListener('pointerdown', event => {
    const target = findTarget(event.target);
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
    target.classList.add('ui-is-pressed');
    addRipple(target, event);
  }, {passive:true});

  const release = () => {
    document.querySelectorAll('.ui-is-pressed').forEach(node => node.classList.remove('ui-is-pressed'));
  };
  document.addEventListener('pointerup', release, {passive:true});
  document.addEventListener('pointercancel', release, {passive:true});
  window.addEventListener('blur', release);

  document.addEventListener('click', event => {
    const target = findTarget(event.target);
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
    target.classList.remove('ui-clicked');
    void target.offsetWidth;
    target.classList.add('ui-clicked');
    window.setTimeout(() => target.classList.remove('ui-clicked'), 500);
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealSelector = 'main .section,main .miracle-card,main .quote-card,main .person,main .prophet-card,main .prayer-panel,main .saint-card,main .feature-card,main .explore-card';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('ui-reveal-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:0.08,rootMargin:'0px 0px -24px 0px'});

    let sequence = 0;
    function prepare(node) {
      if (!isElement(node)) return;
      const candidates = [];
      if (node.matches(revealSelector)) candidates.push(node);
      node.querySelectorAll(revealSelector).forEach(item => candidates.push(item));
      candidates.forEach(item => {
        if (item.classList.contains('ui-reveal')) return;
        item.classList.add('ui-reveal');
        item.style.setProperty('--ui-reveal-delay', ((sequence++ % 5) * 48) + 'ms');
        observer.observe(item);
      });
    }
    prepare(document.body);
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(prepare)));
    mutations.observe(document.body, {childList:true,subtree:true});
  }
})();
