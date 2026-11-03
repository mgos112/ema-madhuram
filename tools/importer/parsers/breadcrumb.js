/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the breadcrumb block (AEM Core Components breadcrumb).
 * One row, one cell: an ordered list of parent page links, then the current page as text.
 */
function toPath(href) {
  try {
    const url = new URL(href, 'https://wknd.site');
    return url.pathname.replace(/\.html?$/, '');
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const ol = document.createElement('ol');
  element.querySelectorAll('.cmp-breadcrumb__item').forEach((item) => {
    const text = item.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const li = document.createElement('li');
    const link = item.querySelector('a[href]');
    if (link && !item.classList.contains('cmp-breadcrumb__item--active')) {
      const a = document.createElement('a');
      a.href = toPath(link.getAttribute('href'));
      a.textContent = text;
      li.append(a);
    } else {
      li.textContent = text;
    }
    ol.append(li);
  });

  if (!ol.children.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Breadcrumb', cells: [[ol]] });
  element.replaceWith(block);
}
