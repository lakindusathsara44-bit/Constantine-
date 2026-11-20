/* Shared, accessible navigation for every Constantine page. */
(() => {
  'use strict';

  const pages = [
    ['Home', 'HomeC.html'],
    ['Jesus Christ', 'Jesus.html'],
    ['Trinity & Angels', 'htaa.html'],
    ['Miracles', 'Miracles.html'],
    ['Saints', 'catholicsaints.html'],
    ['Kings', 'Kings.html'],
    ['Prophets', 'vog.html'],
    ['People', 'resp.html'],
    ['Bible Quotes', 'Quotes.html'],
    ['Prayer Wall', 'PrayerWall.html'],
    ['Settings', 'settings.html', 'settings-nav']
  ];

  const currentPage = (window.location.pathname.split('/').filter(Boolean).pop() || 'HomeC.html').toLowerCase();
  let header = document.querySelector('header.site-header');

  if (!header) {
    header = document.createElement('header');
    header.className = 'site-header';
    document.body.insertBefore(header, document.body.firstChild);
  }

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = 'HomeC.html';
  brand.append(document.createTextNode('CONSTANTINE '));

  const mark = document.createElement('span');
  mark.textContent = '✦';
  mark.setAttribute('aria-hidden', 'true');
  brand.append(mark);

  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.textContent = 'Menu';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'constantine-nav-links');

  const links = document.createElement('div');
  links.className = 'nav-links';
  links.id = 'constantine-nav-links';

  pages.forEach(([label, href, className]) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (className) link.className = className;
    if (href.toLowerCase() === currentPage) link.setAttribute('aria-current', 'page');
    links.append(link);
  });

  const closeMenu = () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
  };

  toggle.addEventListener('click', () => {
    const expanded = !links.classList.contains('is-open');
    links.classList.toggle('is-open', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Close' : 'Menu';
  });

  links.addEventListener('click', event => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  nav.append(brand, toggle, links);
  header.replaceChildren(nav);
  document.body.classList.add('constantine-nav-active');
})();
