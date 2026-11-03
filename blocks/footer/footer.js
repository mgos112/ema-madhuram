/**
 * Fetches the footer fragment as plain HTML.
 * Metadata-independent: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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
    img.loading = 'lazy';
  });
  // previewed fragments wrap images in <picture> with relative srcset candidates
  root.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = source.getAttribute('srcset').split(',').map((candidate) => {
      const [url, ...descriptor] = candidate.trim().split(/\s+/);
      return [new URL(url, base).href, ...descriptor].join(' ');
    }).join(', ');
  });
}

/**
 * Marks the link matching the current page (or its parent section) as current.
 * @param {Element} list links list
 */
function markCurrent(list) {
  const here = window.location.pathname.replace(/\.html$/, '').replace(/^\/content/, '').replace(/\/$/, '');
  list.querySelectorAll('a[href]').forEach((a) => {
    const path = new URL(a.getAttribute('href'), window.location.href).pathname.replace(/\.html$/, '').replace(/\/$/, '');
    if (path && (here === path || here.startsWith(`${path}/`))) a.setAttribute('aria-current', 'page');
  });
}

/**
 * Classifies a fragment section by its content (order-independent):
 * brand (only an image link), social (heading + list of social links),
 * links (a list of text links) or credits (paragraphs).
 * @param {Element} section fragment section
 * @returns {string}
 */
function sectionType(section) {
  const list = section.querySelector(':scope > ul');
  const links = list ? [...list.querySelectorAll('a')] : [];
  if (list && links.length && links.every((a) => a.querySelector('img') && !a.textContent.trim())) return 'social';
  if (list && !section.querySelector(':scope > p')) return 'links';
  const paragraphs = [...section.querySelectorAll(':scope > p')];
  if (paragraphs.length === 1 && paragraphs[0].querySelector('a img') && !paragraphs[0].textContent.trim()) return 'brand';
  return 'credits';
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  resolveImages(source, fragment.base);

  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  [...source.children].forEach((section) => {
    const type = sectionType(section);
    section.className = `footer-${type}`;
    if (type === 'links') {
      const list = section.querySelector(':scope > ul');
      markCurrent(list);
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Footer navigation');
      nav.append(list);
      section.replaceChildren(nav);
    }
    if (type === 'social') {
      // icon-only buttons: the authored image becomes a CSS icon, its alt the (hidden) label
      section.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        const label = document.createElement('span');
        label.className = 'footer-social-label';
        label.textContent = img.alt;
        a.style.setProperty('--footer-social-icon', `url("${img.src}")`);
        a.classList.add('footer-social-link');
        a.replaceChildren(label);
      });
    }
    footer.append(section);
  });

  block.append(footer);
}
