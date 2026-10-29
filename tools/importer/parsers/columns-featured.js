/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the columns featured variant (wknd.site featured article teaser).
 * Emits a `Columns (Featured)` block, which renders as `class="columns featured"`.
 *
 * Source: div.teaser.cmp-teaser--featured (AEM Core Components teaser).
 * One row, two columns: [ image | label p, h2 title, description p, CTA link ]
 */
function textParagraphs(container, document) {
  if (!container) return [];
  const paragraphs = [...container.querySelectorAll('p')]
    .map((p) => p.textContent.trim())
    .filter(Boolean);
  const texts = paragraphs.length ? paragraphs : [container.textContent.trim()].filter(Boolean);
  return texts.map((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  });
}

export default function parse(element, { document }) {
  const imageCell = [];
  const srcImg = element.querySelector('.cmp-teaser__image img') || element.querySelector('img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const textCell = [];
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    textCell.push(p);
  }

  const title = element.querySelector('.cmp-teaser__title');
  if (title && title.textContent.trim()) {
    const h2 = document.createElement('h2');
    const titleLink = title.querySelector('a[href]');
    if (titleLink) {
      const a = document.createElement('a');
      a.href = titleLink.getAttribute('href');
      a.textContent = title.textContent.trim();
      h2.append(a);
    } else {
      h2.textContent = title.textContent.trim();
    }
    textCell.push(h2);
  }

  textCell.push(...textParagraphs(element.querySelector('.cmp-teaser__description'), document));

  element.querySelectorAll('.cmp-teaser__action-container a[href]').forEach((link) => {
    const label = link.textContent.trim();
    if (!label) return;
    // Bold link on its own line = primary button (scripts.js decorateButtons).
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = label;
    strong.append(a);
    p.append(strong);
    textCell.push(p);
  });

  const cells = [[imageCell.length ? imageCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (Featured)', cells });
  element.replaceWith(block);
}
