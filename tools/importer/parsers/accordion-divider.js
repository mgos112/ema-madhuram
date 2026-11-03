/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the accordion divider variant (AEM Core Components accordion, wknd.site FAQs).
 * Emits an `Accordion (Divider)` block, which renders as `class="accordion divider"`.
 *
 * Source: `div.accordion.panelcontainer` > `div.cmp-accordion` > `.cmp-accordion__item`,
 * each with a `.cmp-accordion__title` (inside the header button) and a `.cmp-accordion__panel`
 * holding one or more `.cmp-text` rich-text components.
 *
 * Row (2 columns): [ title: question as plain text | content: answer rich content ]
 */
const CONTENT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, table, pre';
const TRAILING_WS = /[\s ]+$/;

function cleanText(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function isEmpty(el) {
  if (el.querySelector('img, picture, video, iframe')) return false;
  return !cleanText(el.textContent);
}

/** Remove trailing whitespace / &nbsp; from the end of an element, across nested nodes. */
function trimTrailing(el, document) {
  const walker = document.createTreeWalker(el, 4 /* NodeFilter.SHOW_TEXT */);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (let i = textNodes.length - 1; i >= 0; i -= 1) {
    const node = textNodes[i];
    const trimmed = node.textContent.replace(TRAILING_WS, '');
    node.textContent = trimmed;
    if (trimmed) return;
  }
}

function stripAttributes(el) {
  [el, ...el.querySelectorAll('[id], [class]')].forEach((n) => {
    n.removeAttribute('id');
    n.removeAttribute('class');
  });
}

function buildAnswer(panel, document) {
  const content = [];
  if (!panel) return content;

  // Prefer rich-text components; fall back to the panel itself.
  const sources = [...panel.querySelectorAll('.cmp-text')];
  if (!sources.length) sources.push(panel);

  sources.forEach((src) => {
    // Top-level content elements only (skip e.g. a p nested in an li or blockquote).
    const blocks = [...src.querySelectorAll(CONTENT_SELECTOR)].filter((el) => {
      const outer = el.parentElement.closest(CONTENT_SELECTOR);
      return !outer || !src.contains(outer);
    });
    if (!blocks.length && cleanText(src.textContent)) {
      const p = document.createElement('p');
      p.textContent = cleanText(src.textContent);
      blocks.push(p);
    }
    blocks.forEach((el) => {
      if (isEmpty(el)) return;
      const clone = el.cloneNode(true);
      stripAttributes(clone);
      // Drop empty inner paragraphs/headings.
      clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((n) => {
        if (isEmpty(n)) n.remove();
      });
      trimTrailing(clone, document);
      if (!isEmpty(clone)) content.push(clone);
    });
  });

  return content;
}

export default function parse(element, { document }) {
  const root = element.matches('.cmp-accordion')
    ? element
    : (element.querySelector('.cmp-accordion') || element);
  // Only this accordion's own items, not items of a nested accordion inside a panel.
  const items = [...root.querySelectorAll('.cmp-accordion__item')]
    .filter((item) => root === element && !root.matches('.cmp-accordion')
      || item.closest('.cmp-accordion') === root);

  const cells = [];
  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button')
      || item.querySelector('.cmp-accordion__header');
    const question = cleanText(titleEl && titleEl.textContent);
    if (!question) return;

    const answer = buildAnswer(item.querySelector('.cmp-accordion__panel'), document);
    cells.push([question, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Accordion (Divider)', cells });
  element.replaceWith(block);
}
