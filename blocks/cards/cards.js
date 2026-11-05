import { createOptimizedPicture } from '../../scripts/aem.js';
import { queryPages } from '../../scripts/query-index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const LOCK_ICON = '<path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1zm2 0h6V7a3 3 0 0 0-6 0v3z" fill="currentColor"/>';

/* Optimize same-origin images only; external (not yet ingested) images are left as they are. */
function optimizeImages(container, width) {
  container.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width }]));
  });
}

/* Image-only cell vs. body cell, as in the default cards decoration. */
function isImageCell(cell) {
  return cell.children.length === 1 && !!cell.querySelector('picture') && !cell.textContent.trim();
}

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
      // Horizontal (article byline): the social bar becomes the card's third child.
      const social = bodyCell.querySelector(':scope > .cards-profile-social');
      if (social && block.classList.contains('horizontal')) li.append(social);
    }
    ul.append(li);
  });

  optimizeImages(ul, '400');
  block.replaceChildren(ul);
}

const DOWNLOAD_ICON = '<path d="M3 3h18v18H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 6h2v7.2l2.6-2.6 1.4 1.4-5 5-5-5 1.4-1.4 2.6 2.6z" fill="currentColor"/>';

function isPdfLink(a) {
  try {
    return /\.pdf$/i.test(new URL(a.href, window.location.href).pathname);
  } catch (e) {
    return false;
  }
}

/* PDF panel: title link, description, file properties (values only) and a download button. */
function buildPdfPanel(cell) {
  const panel = document.createElement('div');
  panel.className = 'cards-card-body cards-button-pdf';
  panel.append(...cell.childNodes);

  const links = [...panel.querySelectorAll('a')].filter(isPdfLink);
  links.forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = a.closest('p');
    if (wrapper) wrapper.classList.remove('button-wrapper');
    const filename = decodeURIComponent(new URL(a.href, window.location.href).pathname.split('/').pop());
    a.setAttribute('download', filename);
  });

  // The last PDF link outside a heading is the download button.
  const button = links.filter((a) => !a.closest('h1, h2, h3, h4, h5, h6')).pop();
  if (button) {
    button.classList.add('cards-button-download');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = DOWNLOAD_ICON;
    button.prepend(svg);
  }

  const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-button-pdf-title');
  panel.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => {
    list.classList.add('cards-button-pdf-properties');
    [...list.children].forEach((item) => item.classList.add('cards-button-pdf-property'));
  });
  return panel;
}

/* Story card: the whole card is one link with the title and a muted date. */
function buildStory(cells) {
  const content = document.createElement('div');
  cells.forEach((cell) => content.append(...cell.childNodes));
  const link = content.querySelector('a[href]');
  if (!link) return null;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = link.getAttribute('href');
  a.className = 'cards-button-story';
  const title = document.createElement('span');
  title.className = 'cards-button-story-title';
  title.textContent = link.textContent.trim();
  a.append(title);

  const rest = content.textContent.replace(link.textContent, '').trim();
  if (rest) {
    const date = document.createElement('span');
    date.className = 'cards-button-story-date';
    date.textContent = rest;
    a.append(date);
  }
  li.append(a);
  return li;
}

/*
 * Share rail: optional title, optional PDF panel, optional list of story cards.
 * Rows are recognised by content, so authors can omit or reorder any of them.
 */
function decorateShareRail(block) {
  let title = null;
  let pdfPanel = null;
  const stories = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((cell) => cell.textContent.trim());
    if (!cells.length) return;
    const links = [...row.querySelectorAll('a[href]')];

    if (links.some(isPdfLink)) {
      if (!pdfPanel) pdfPanel = buildPdfPanel(cells[0]);
      else cells.forEach((cell) => pdfPanel.append(...cell.childNodes));
    } else if (!links.length) {
      if (!title) {
        title = document.createElement('div');
        title.className = 'cards-title';
        cells.forEach((cell) => title.append(...cell.childNodes));
      }
    } else {
      const story = buildStory(cells);
      if (story) stories.append(story);
    }
  });

  const children = [title, pdfPanel, stories.children.length ? stories : null].filter(Boolean);
  block.replaceChildren(...children);
}

/* Members-only teasers: body above the image, faded, with a yellow lock ribbon. */
function decorateMemberOnly(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((cell) => cell.textContent.trim() || cell.querySelector('picture, img'))) return;

    const li = document.createElement('li');
    li.className = 'cards-member-only-card';

    const ribbon = document.createElement('span');
    ribbon.className = 'cards-member-only-lock';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Members only');
    svg.innerHTML = LOCK_ICON;
    ribbon.append(svg);
    li.append(ribbon);

    const images = cells.filter(isImageCell);
    const bodies = cells.filter((cell) => !isImageCell(cell) && cell.textContent.trim());
    bodies.forEach((body) => {
      body.className = 'cards-card-body';
      // A trailing short paragraph is the "Read More" call to action.
      const paragraphs = body.querySelectorAll(':scope > p');
      if (paragraphs.length > 1) paragraphs[paragraphs.length - 1].classList.add('cards-member-only-cta');
      li.append(body);
    });
    images.forEach((image) => {
      image.className = 'cards-card-image';
      li.append(image);
    });
    ul.append(li);
  });

  optimizeImages(ul, '750');
  block.replaceChildren(ul);
}

/* Index-driven lists show the most recently updated pages first unless "sort:index" is authored. */
const DEFAULT_SORT = 'lastModified';

/* "sort:<index column>" picks the sort column; "sort:index" keeps the index (publish) order. */
function readSort(value) {
  if (!value) return DEFAULT_SORT;
  return value.toLowerCase() === 'index' ? undefined : value;
}

/*
 * Reads "<path prefix> | <limit> | sort:<column>" from the block (parts after the prefix are
 * optional and in any order); the prefix may also be authored as a link.
 */
function readDynamicConfig(block) {
  const [rawPrefix = '', ...options] = block.textContent.split('|').map((part) => part.trim());
  const link = block.querySelector('a[href]');
  const config = {
    prefix: link ? new URL(link.href, window.location.href).pathname : rawPrefix,
    sort: DEFAULT_SORT,
    limit: undefined,
  };
  options.forEach((option) => {
    const [key, value] = option.split(':').map((part) => part.trim());
    if (key.toLowerCase() === 'sort') config.sort = readSort(value);
    else if (/^\d+$/.test(key)) config.limit = parseInt(key, 10);
  });
  return config;
}

function buildIndexCard(page) {
  const li = document.createElement('li');

  if (page.image) {
    const imageCell = document.createElement('div');
    imageCell.className = 'cards-card-image';
    const imageLink = document.createElement('a');
    imageLink.href = page.path;
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
    imageLink.append(createOptimizedPicture(page.image, page.title || '', false, [{ width: '750' }]));
    imageCell.append(imageLink);
    li.append(imageCell);
  }

  const body = document.createElement('div');
  body.className = 'cards-card-body';
  const heading = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = page.path;
  titleLink.textContent = page.title || page.path;
  heading.append(titleLink);
  body.append(heading);
  if (page.description) {
    const description = document.createElement('p');
    description.className = 'cards-dynamic-description';
    description.textContent = page.description;
    body.append(description);
  }
  li.append(body);
  return li;
}

/* Index-driven cards: lists pages below a path prefix from the query index. */
async function decorateDynamic(block) {
  const { prefix, sort, limit } = readDynamicConfig(block);
  // Never show the raw configuration, even if the index is unavailable.
  block.replaceChildren();
  if (!prefix) return;

  const pages = await queryPages({ prefix, sort, limit });
  if (!pages.length) return;

  const ul = document.createElement('ul');
  pages.forEach((page) => ul.append(buildIndexCard(page)));
  block.replaceChildren(ul);
}

/*
 * Reads "<path prefix> | filter:<index column> | sort:<column> | <limit>"
 * (all parts after the prefix optional).
 */
function readAdventuresConfig(block) {
  const [rawPrefix = '', ...options] = block.textContent.split('|').map((part) => part.trim());
  const link = block.querySelector('a[href]');
  const config = {
    prefix: link ? new URL(link.href, window.location.href).pathname : rawPrefix,
    filter: 'activity',
    sort: DEFAULT_SORT,
    limit: undefined,
  };
  options.forEach((option) => {
    const [key, value] = option.split(':').map((part) => part.trim());
    if (key.toLowerCase() === 'filter' && value) config.filter = value;
    else if (key.toLowerCase() === 'sort') config.sort = readSort(value);
    else if (/^\d+$/.test(key)) config.limit = parseInt(key, 10);
  });
  return config;
}

/* Index values may hold several entries ("Cycling, Travel"). */
function splitValues(value) {
  return (value || '').split(',').map((entry) => entry.trim()).filter(Boolean);
}

function showTab(block, tabs, selected) {
  tabs.forEach((tab) => {
    const active = tab.dataset.filter === selected;
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
  });
  block.querySelectorAll(':scope > ul > li').forEach((li) => {
    const values = (li.dataset.filter || '').split('|');
    li.hidden = selected !== '' && !values.includes(selected);
  });
}

/* Filter tabs ("All" + one per value), built only when the index provides values. */
function buildFilterTabs(block, pages, filter, list) {
  const values = [...new Set(pages.flatMap((page) => splitValues(page[filter])))]
    .sort((a, b) => a.localeCompare(b));
  if (!values.length) return null;

  const tablist = document.createElement('div');
  tablist.className = 'cards-adventures-tabs';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Filter adventures');
  const tabs = [['All', ''], ...values.map((value) => [value, value])].map(([label, value]) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-adventures-tab';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', list.id);
    tab.dataset.filter = value;
    tab.textContent = label;
    tablist.append(tab);
    return tab;
  });

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('.cards-adventures-tab');
    if (tab) showTab(block, tabs, tab.dataset.filter);
  });
  tablist.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const next = tabs[(current + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    showTab(block, tabs, next.dataset.filter);
  });
  return { tablist, tabs };
}

/* Index-driven adventure cards with filter tabs built from an index column (default: activity). */
async function decorateAdventures(block) {
  const {
    prefix, filter, sort, limit,
  } = readAdventuresConfig(block);
  block.replaceChildren();
  if (!prefix) return;

  const pages = await queryPages({ prefix, sort, limit });
  if (!pages.length) return;

  const ul = document.createElement('ul');
  ul.id = `cards-adventures-${Math.random().toString(36).slice(2, 8)}`;
  pages.forEach((page) => {
    const li = buildIndexCard(page);
    li.dataset.filter = splitValues(page[filter]).join('|');
    ul.append(li);
  });

  const filterTabs = buildFilterTabs(block, pages, filter, ul);
  if (filterTabs) {
    ul.setAttribute('role', 'tabpanel');
    block.replaceChildren(filterTabs.tablist, ul);
    showTab(block, filterTabs.tabs, '');
  } else {
    block.replaceChildren(ul);
  }
}

export default async function decorate(block) {
  if (block.classList.contains('adventures')) {
    await decorateAdventures(block);
    return;
  }
  if (block.classList.contains('profile')) {
    decorateProfile(block);
    return;
  }
  if (block.classList.contains('member-only')) {
    decorateMemberOnly(block);
    return;
  }
  if (block.classList.contains('dynamic')) {
    await decorateDynamic(block);
    return;
  }
  if (block.classList.contains('button')) {
    decorateShareRail(block);
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
