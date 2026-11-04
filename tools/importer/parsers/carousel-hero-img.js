/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the carousel hero-img variant (wknd.site AEM carousel on adventure pages).
 * Emits a `Carousel (Hero Img)` block, which renders as `class="carousel hero-img"`.
 *
 * Source: div.carousel.panelcontainer > .cmp-carousel > .cmp-carousel__content > .cmp-carousel__item
 * Library Carousel convention, one row per slide:
 *   Cell 1: slide image
 *   Cell 2 (optional, only when the slide has text): heading / paragraphs / links
 * Slides without an image are skipped; prev/next buttons and indicators are ignored.
 */
const CONTENT_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'BLOCKQUOTE'];

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

function collectContent(node, out) {
  [...node.children].forEach((child) => {
    if (CONTENT_TAGS.includes(child.tagName)) {
      if (child.textContent.trim()) out.push(child);
    } else if (child.tagName === 'A') {
      if (child.textContent.trim() && child.getAttribute('href')) {
        const p = child.ownerDocument.createElement('p');
        p.append(child);
        out.push(p);
      }
    } else {
      collectContent(child, out);
    }
  });
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

    const textItem = item.cloneNode(true);
    textItem.querySelectorAll('img, picture, .cmp-image, .image, meta').forEach((el) => el.remove());
    const textCell = [];
    collectContent(textItem, textCell);

    // Text cell only when the slide has text; empty content cells are skipped.
    cells.push(textCell.length ? [img, textCell] : [img]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel (Hero Img)', cells });
  element.replaceWith(block);
}
