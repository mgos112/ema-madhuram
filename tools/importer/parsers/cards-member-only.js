/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the cards member-only variant (wknd.site secured teasers).
 * Emits a `Cards (Member Only)` block, which renders as `class="cards member-only"`.
 *
 * Source: flat sibling `div.teaser.cmp-teaser--secure` elements. The instance selector
 * matches only the first teaser of each run, so this parser consumes the matched element
 * plus every immediately following secured teaser, emitting one row per card.
 *
 * Row (Cards convention): [ image | h3 title, description p, "Read More" p (plain text, or a link if present) ]
 */
const CARD_SELECTOR = 'div.teaser.cmp-teaser--secure';

function isCard(el) {
  return !!(el && el.matches && el.matches(CARD_SELECTOR));
}

function buildRow(card, document) {
  const imageCell = [];
  const srcImg = card.querySelector('.cmp-teaser__image img') || card.querySelector('img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const bodyCell = [];
  const title = card.querySelector('.cmp-teaser__title');
  if (title && title.textContent.trim()) {
    const h3 = document.createElement('h3');
    h3.textContent = title.textContent.trim();
    bodyCell.push(h3);
  }

  const description = card.querySelector('.cmp-teaser__description');
  if (description) {
    const paragraphs = [...description.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean);
    const texts = paragraphs.length ? paragraphs : [description.textContent.trim()].filter(Boolean);
    texts.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      bodyCell.push(p);
    });
  }

  const action = card.querySelector('.cmp-teaser__action-container');
  if (action && action.textContent.trim()) {
    const p = document.createElement('p');
    const link = action.querySelector('a[href]');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      p.append(a);
    } else {
      p.textContent = action.textContent.trim();
    }
    bodyCell.push(p);
  }

  if (!imageCell.length && !bodyCell.length) return null;
  return [imageCell.length ? imageCell : '', bodyCell.length ? bodyCell : ''];
}

export default function parse(element, { document }) {
  const cards = [element];
  let next = element.nextElementSibling;
  while (isCard(next)) {
    cards.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  cards.forEach((card) => {
    const row = buildRow(card, document);
    if (row) cells.push(row);
  });

  cards.slice(1).forEach((card) => card.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Member Only)', cells });
  element.replaceWith(block);
}
