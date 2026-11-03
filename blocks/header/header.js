// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment as plain HTML.
 * Metadata-independent: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image paths against the fragment URL (not the page URL).
 * @param {Element} root container with images
 * @param {string} base URL of the fetched fragment
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.loading = 'eager';
  });
}

/**
 * Text of an element without the text of its nested lists.
 * @param {Element} el list item
 * @returns {string}
 */
function ownText(el) {
  return [...el.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join('')
    .trim();
}

function normalizePath(href) {
  try {
    return new URL(href, window.location.href).pathname.replace(/\.html$/, '').replace(/\/$/, '');
  } catch (e) {
    return '';
  }
}

/**
 * Marks the section link matching the current page (or its parent section) as current.
 * @param {Element} list section links list
 */
function markCurrent(list) {
  const here = window.location.pathname.replace(/\.html$/, '').replace(/^\/content/, '').replace(/\/$/, '');
  list.querySelectorAll('a[href]').forEach((a) => {
    const path = normalizePath(a.getAttribute('href'));
    if (path && (here === path || here.startsWith(`${path}/`))) {
      a.setAttribute('aria-current', 'page');
      a.closest('li').classList.add('nav-current');
    }
  });
}

function setLocalePanel(locale, open) {
  const toggle = locale.querySelector('.nav-locale-toggle');
  const panel = locale.querySelector('.nav-locale-panel');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  panel.hidden = !open;
}

/**
 * Builds the locale selector from a list item: label (+ flag) and a nested list of
 * groups (+ flag), each with a nested list of locale links.
 * @param {Element} item list item holding the current locale and the groups
 * @returns {Element}
 */
function buildLocale(item) {
  const locale = document.createElement('div');
  locale.className = 'nav-locale';

  const label = ownText(item);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-locale-toggle';
  toggle.setAttribute('aria-controls', 'nav-locale-panel');
  toggle.setAttribute('aria-label', `Toggle Language ${label}`);
  const flag = item.querySelector(':scope > img');
  if (flag) {
    flag.alt = '';
    toggle.append(flag);
  }
  const text = document.createElement('span');
  text.className = 'nav-locale-label';
  text.textContent = label;
  toggle.append(text);

  const panel = document.createElement('div');
  panel.className = 'nav-locale-panel';
  panel.id = 'nav-locale-panel';
  const groups = item.querySelector(':scope > ul');
  if (groups) {
    groups.classList.add('nav-locale-groups');
    [...groups.children].forEach((group) => {
      group.classList.add('nav-locale-group');
      const name = document.createElement('span');
      name.className = 'nav-locale-group-name';
      name.textContent = ownText(group);
      [...group.childNodes].forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) n.remove();
      });
      const groupFlag = group.querySelector(':scope > img');
      if (groupFlag) groupFlag.classList.add('nav-locale-flag');
      const links = group.querySelector(':scope > ul');
      group.insertBefore(name, links);
      if (links) links.classList.add('nav-locale-links');
      group.querySelectorAll('a').forEach((a) => {
        if (a.textContent.trim() === label) a.setAttribute('aria-current', 'true');
      });
    });
    panel.append(groups);
  }

  locale.append(toggle, panel);
  setLocalePanel(locale, false);
  // the panel's visibility is the source of truth for the toggle state
  toggle.addEventListener('click', () => {
    setLocalePanel(locale, panel.hidden);
  });
  locale.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !panel.hidden) {
      setLocalePanel(locale, false);
      toggle.focus();
    }
  });
  return locale;
}

/**
 * Utility bar: plain links (e.g. Sign In) and an optional locale selector.
 * @param {Element} section first nav fragment section
 * @returns {Element}
 */
function buildUtility(section) {
  const bar = document.createElement('div');
  bar.className = 'nav-utility';
  const inner = document.createElement('div');
  inner.className = 'nav-utility-inner';

  section.querySelectorAll(':scope > p').forEach((p) => {
    p.querySelectorAll('a').forEach((a) => {
      a.classList.add('nav-utility-link');
      inner.append(a);
    });
  });
  section.querySelectorAll(':scope > ul > li').forEach((item) => {
    if (item.querySelector(':scope > ul')) inner.append(buildLocale(item));
  });

  bar.append(inner);
  return bar;
}

/**
 * Opens/closes the mobile push drawer (the desktop nav is always expanded).
 * @param {Element} nav nav element
 * @param {boolean|null} forceExpanded true = force closed state handling as in boilerplate
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const open = !expanded && !isDesktop.matches;
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = open ? 'hidden' : '';
  document.body.classList.toggle('nav-open', open);
  if (isDesktop.matches) nav.removeAttribute('aria-expanded');
  else nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
}

/**
 * Closes the mobile drawer on Escape, on a tap outside the drawer, and when the
 * viewport crosses into desktop width; also closes the locale panel on resize.
 * @param {Element} nav nav element
 */
function bindMenuDismissal(nav) {
  const isOpen = () => nav.getAttribute('aria-expanded') === 'true';
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && isOpen()) {
      toggleMenu(nav, false);
      nav.querySelector('.nav-hamburger button').focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    if (e.target.closest('.nav-sections, .nav-hamburger')) return;
    toggleMenu(nav, false);
  });
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, isDesktop.matches);
    const locale = nav.querySelector('.nav-locale');
    if (locale) setLocalePanel(locale, false);
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  resolveImages(source, fragment.base);
  const [utilitySection, brandSection, sectionsSection, toolsSection] = [...source.children];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  if (utilitySection) nav.append(buildUtility(utilitySection));

  const main = document.createElement('div');
  main.className = 'nav-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-sections" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  mainInner.append(hamburger);

  if (brandSection) {
    const brand = document.createElement('div');
    brand.className = 'nav-brand';
    brand.append(...brandSection.querySelectorAll('a'));
    mainInner.append(brand);
  }

  if (sectionsSection) {
    const sections = document.createElement('div');
    sections.className = 'nav-sections';
    sections.id = 'nav-sections';
    const list = sectionsSection.querySelector('ul');
    if (list) {
      markCurrent(list);
      sections.append(list);
    }
    mainInner.append(sections);
  }

  if (toolsSection) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    toolsSection.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      if (img && !a.textContent.trim()) {
        a.setAttribute('aria-label', img.alt);
        a.title = img.alt;
        img.alt = '';
        a.classList.add('nav-icon-link');
      }
      tools.append(a);
    });
    mainInner.append(tools);
  }

  main.append(mainInner);
  nav.append(main);

  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, isDesktop.matches);
  bindMenuDismissal(nav);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // the fixed header shrinks once the page is scrolled
  const onScroll = () => block.classList.toggle('is-scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
