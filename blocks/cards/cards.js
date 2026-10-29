import { createOptimizedPicture } from '../../scripts/aem.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* Minimal inline icons for the profile variant (no /icons dependency). */
const SOCIAL_ICONS = {
  facebook: '<path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.5V11H7v4h3v9h4v-9h3l1-4h-4V8.6c0-.4.3-.6.6-.6z" fill="currentColor"/>',
  twitter: '<path d="M23 4.6a9 9 0 0 1-2.6.7 4.5 4.5 0 0 0 2-2.5 9 9 0 0 1-2.9 1.1 4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.5 3.3a4.5 4.5 0 0 0 1.4 6 4.5 4.5 0 0 1-2-.6 4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 1 18.1 12.8 12.8 0 0 0 7.9 20c8.3 0 12.8-6.9 12.8-12.8v-.6A9 9 0 0 0 23 4.6z" fill="currentColor"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>',
};

const NETWORK_PATTERNS = [
  ['facebook', /facebook|fb\.com/i],
  ['twitter', /twitter|x\.com/i],
  ['instagram', /instagram|insta/i],
];

function detectNetwork(link) {
  const haystack = `${link.href} ${link.textContent} ${link.title}`;
  const match = NETWORK_PATTERNS.find(([, re]) => re.test(haystack));
  return match ? match[0] : null;
}

/* An element whose only meaningful content is one or more links. */
function isLinkOnly(el) {
  const links = el.querySelectorAll('a');
  if (!links.length) return false;
  const linkText = [...links].map((a) => a.textContent).join('');
  return el.textContent.replace(/[\s|,]/g, '') === linkText.replace(/[\s|,]/g, '');
}

function buildSocialList(links) {
  const ul = document.createElement('ul');
  ul.className = 'cards-profile-social';
  links.forEach((link) => {
    const li = document.createElement('li');
    const a = link;
    a.classList.remove('button', 'primary', 'secondary');
    const network = detectNetwork(a);
    if (network) {
      const label = a.textContent.trim() || network;
      a.setAttribute('aria-label', label);
      a.classList.add('cards-profile-social-link', `cards-profile-social-${network}`);
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.innerHTML = SOCIAL_ICONS[network];
      const text = document.createElement('span');
      text.className = 'cards-profile-social-label';
      text.textContent = label;
      a.replaceChildren(svg, text);
    } else {
      a.classList.add('cards-profile-social-link', 'cards-profile-social-other');
    }
    li.append(a);
    ul.append(li);
  });
  return ul;
}

function decorateProfileBody(body) {
  body.className = 'cards-profile-card-body';

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-profile-name');

  // Collect social links: lists of links and link-only paragraphs.
  const socialLinks = [];
  const consumed = [];
  body.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => {
    const items = [...list.children];
    if (items.length && items.every(isLinkOnly)) {
      items.forEach((item) => socialLinks.push(...item.querySelectorAll('a')));
      consumed.push(list);
    }
  });
  body.querySelectorAll(':scope > p, :scope > div').forEach((el) => {
    if (isLinkOnly(el)) {
      socialLinks.push(...el.querySelectorAll('a'));
      consumed.push(el);
    }
  });

  // Remaining plain paragraphs are the role line(s).
  body.querySelectorAll(':scope > p').forEach((p) => {
    if (!consumed.includes(p) && p.textContent.trim()) p.classList.add('cards-profile-role');
  });

  if (socialLinks.length) {
    const social = buildSocialList(socialLinks);
    consumed.forEach((el) => el.remove());
    body.append(social);
  }
}

function decorateProfile(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // Skip rows with no authored content at all.
    if (!cells.some((cell) => cell.textContent.trim() || cell.querySelector('picture, img'))) return;

    const li = document.createElement('li');
    li.className = 'cards-profile-card';

    let imageCell = null;
    let bodyCell = null;
    cells.forEach((cell) => {
      const hasPicture = cell.querySelector('picture, img');
      const hasText = cell.textContent.trim();
      if (hasPicture && !hasText && !imageCell) imageCell = cell;
      else if (!bodyCell && (hasText || !hasPicture)) bodyCell = cell;
      else if (bodyCell) bodyCell.append(...cell.childNodes);
    });

    // Single cell holding both image and text: split the picture out.
    if (!imageCell && bodyCell) {
      const pic = bodyCell.querySelector('picture') || bodyCell.querySelector('img');
      if (pic) {
        imageCell = document.createElement('div');
        const wrapper = pic.parentElement;
        imageCell.append(pic);
        if (wrapper !== bodyCell && !wrapper.textContent.trim() && !wrapper.children.length) {
          wrapper.remove();
        }
      }
    }

    if (imageCell) {
      imageCell.className = 'cards-profile-card-image';
      li.append(imageCell);
    }
    if (bodyCell) {
      decorateProfileBody(bodyCell);
      li.append(bodyCell);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });

  block.replaceChildren(ul);
}

export default function decorate(block) {
  if (block.classList.contains('profile')) {
    decorateProfile(block);
    return;
  }

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
