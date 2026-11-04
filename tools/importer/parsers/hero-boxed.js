/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the hero boxed variant (wknd.site AEM teaser with cmp-teaser--hero).
 * Emits a `Hero (Boxed)` block, which renders as `class="hero boxed"`.
 *
 * Source: div.teaser.cmp-teaser--hero (AEM Core Components teaser).
 * Library Hero convention, one column:
 *   Row 1: image
 *   Row 2: title heading, description paragraph(s), CTA link paragraph(s)
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
  const srcImg = element.querySelector('.cmp-teaser__image img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const textCell = [];
  const title = element.querySelector('.cmp-teaser__title');
  if (title && title.textContent.trim()) {
    const level = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : 'h2';
    const heading = document.createElement(level);
    heading.textContent = title.textContent.trim();
    textCell.push(heading);
  }

  textCell.push(...textParagraphs(element.querySelector('.cmp-teaser__description'), document));

  element.querySelectorAll('.cmp-teaser__action-link').forEach((link) => {
    const label = link.textContent.trim();
    const href = link.getAttribute('href');
    if (!label || !href) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    textCell.push(p);
  });

  if (!imageCell.length && !textCell.length) {
    element.remove();
    return;
  }

  const cells = [
    [imageCell.length ? imageCell : ''],
    [textCell.length ? textCell : ''],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero (Boxed)', cells });
  element.replaceWith(block);
}
