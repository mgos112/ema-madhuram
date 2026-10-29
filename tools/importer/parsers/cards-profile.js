/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the cards profile variant (wknd.site contributor / guide profile cards).
 * Emits a `Cards (Profile)` block, which renders as `class="cards profile"`.
 *
 * Source: flat sibling `section.experiencefragment.cmp-experience-fragment--contributor`
 * elements in one grid. The instance selector matches only the first card of each run,
 * so this parser consumes the matched element plus every immediately following sibling
 * contributor section, emitting one row per card.
 *
 * Row: [ portrait image | h3 name, p role, ul of social links ]
 */
const CARD_SELECTOR = 'section.experiencefragment.cmp-experience-fragment--contributor';

function isCard(el) {
  return !!(el && el.matches && el.matches(CARD_SELECTOR));
}

function buildRow(card, document) {
  // Cell 1: portrait image
  const imageCell = [];
  const srcImg = card.querySelector('img.cmp-image__image') || card.querySelector('img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  // Cell 2: name, role, social links
  const bodyCell = [];
  const titles = [...card.querySelectorAll('.cmp-title__text')];
  const nameEl = card.querySelector('.title:not(.cmp-title--black) h3.cmp-title__text')
    || card.querySelector('h3.cmp-title__text')
    || titles[0];
  const roleEl = card.querySelector('.cmp-title--black .cmp-title__text')
    || card.querySelector('h5.cmp-title__text')
    || titles.find((t) => t !== nameEl);

  const nameText = nameEl ? nameEl.textContent.trim() : '';
  if (nameText) {
    const h3 = document.createElement('h3');
    h3.textContent = nameText;
    bodyCell.push(h3);
  }

  const roleText = roleEl && roleEl !== nameEl ? roleEl.textContent.trim() : '';
  if (roleText) {
    const p = document.createElement('p');
    p.textContent = roleText;
    bodyCell.push(p);
  }

  const links = [...card.querySelectorAll('a.cmp-button[href]')];
  if (links.length) {
    const ul = document.createElement('ul');
    links.forEach((src) => {
      const labelEl = src.querySelector('.cmp-button__text');
      const label = (labelEl ? labelEl.textContent : src.textContent).trim()
        || src.getAttribute('aria-label') || src.getAttribute('title') || '';
      if (!label) return;
      const a = document.createElement('a');
      a.href = src.getAttribute('href');
      a.textContent = label;
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
    if (ul.children.length) bodyCell.push(ul);
  }

  if (!imageCell.length && !bodyCell.length) return null;
  return [imageCell.length ? imageCell : '', bodyCell.length ? bodyCell : ''];
}

export default function parse(element, { document }) {
  // Collect the matched card plus following sibling cards in the same run.
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

  // Remove consumed siblings (not the anchor element, which is replaced below).
  cards.slice(1).forEach((card) => card.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Profile)', cells });
  element.replaceWith(block);
}
