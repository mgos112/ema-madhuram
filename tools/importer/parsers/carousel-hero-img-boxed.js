/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the carousel hero-img boxed variant (wknd.site home page hero carousel).
 * Emits a `Carousel (Hero Img, Boxed)` block, which renders as `class="carousel hero-img boxed"`.
 *
 * Source: div.carousel.panelcontainer > .cmp-carousel > .cmp-carousel__content > .cmp-carousel__item
 *   each item holds a .cmp-teaser with title, description, action links and an image.
 * Library Carousel convention, one row per slide:
 *   Cell 1: slide image (widest srcset entry, then src, then data-cmp-src)
 *   Cell 2: teaser title as a heading (source level, default h2), description paragraph(s),
 *           and each action link as <p><strong><a></a></strong></p> (site-relative, no .html)
 * Slides without an image are skipped; prev/next buttons and indicators are ignored.
 */
function bestSrc(img) {
  const srcset = (img.getAttribute('srcset') || img.getAttribute('data-srcset') || '')
    .split(',')
    .map((entry) => {
      const [url, size] = entry.trim().split(/\s+/);
      return { url, size: parseFloat(size) || 0 };
    })
    .filter((entry) => entry.url && !entry.url.startsWith('data:'));
  if (srcset.length) {
    srcset.sort((a, b) => b.size - a.size);
    return srcset[0].url;
  }
  const src = img.getAttribute('src') || '';
  if (src && !src.startsWith('data:')) return src;
  const lazy = img.getAttribute('data-cmp-src') || img.closest('[data-cmp-src]')?.getAttribute('data-cmp-src');
  return lazy ? lazy.replace('{.width}', '') : '';
}

function toPath(href) {
  try {
    const url = new URL(href, 'https://wknd.site');
    if (url.hostname !== 'wknd.site' && url.hostname !== 'www.wknd.site') return href;
    return `${url.pathname.replace(/\.html?$/, '')}${url.search}${url.hash}`;
  } catch (e) {
    return href;
  }
}

function normalize(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function descriptionParagraphs(desc, document) {
  if (!desc) return [];
  const paras = [...desc.querySelectorAll('p')].filter((p) => normalize(p.textContent));
  if (paras.length) return paras;
  const text = normalize(desc.textContent);
  if (!text) return [];
  const p = document.createElement('p');
  p.textContent = text;
  return [p];
}

export default function parse(element, { document }) {
  const cells = [];
  const root = element.querySelector('.cmp-carousel');
  const items = [...element.querySelectorAll('.cmp-carousel__item')]
    .filter((item) => item.closest('.cmp-carousel') === root);

  items.forEach((item) => {
    const srcImg = item.querySelector('img');
    const src = srcImg ? bestSrc(srcImg) : '';
    if (!src) return;

    const img = document.createElement('img');
    img.src = src;
    img.alt = srcImg.getAttribute('alt') || '';

    const content = [];
    const title = item.querySelector('.cmp-teaser__title');
    if (title && normalize(title.textContent)) {
      const level = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h2';
      const heading = document.createElement(level);
      heading.textContent = normalize(title.textContent);
      content.push(heading);
    }

    content.push(...descriptionParagraphs(item.querySelector('.cmp-teaser__description'), document));

    item.querySelectorAll('.cmp-teaser__action-link').forEach((link) => {
      const text = normalize(link.textContent);
      const href = link.getAttribute('href');
      if (!text || !href) return;
      const a = document.createElement('a');
      a.href = toPath(href);
      a.textContent = text;
      const strong = document.createElement('strong');
      strong.append(a);
      const p = document.createElement('p');
      p.append(strong);
      content.push(p);
    });

    cells.push([img, content]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel (Hero Img, Boxed)', cells });
  element.replaceWith(block);
}
