/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the columns spec variant (wknd.site adventure trip facts content fragment).
 * Emits a `Columns (Spec)` block, which renders as `class="columns spec"`.
 *
 * Source: div.contentfragment > article.cmp-contentfragment > dl.cmp-contentfragment__elements
 *   > div.cmp-contentfragment__element > dt.cmp-contentfragment__element-title + dd.cmp-contentfragment__element-value
 * Library Columns convention, every row has the same two cells:
 *   Cell 1: label text (e.g. "Activity")   Cell 2: value text (e.g. "Surfing")
 * The hidden .cmp-contentfragment__title H3 is not content and is ignored.
 */
function cleanText(node) {
  return node ? node.textContent.replace(/\s+/g, ' ').trim() : '';
}

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.cmp-contentfragment__element').forEach((item) => {
    const label = cleanText(item.querySelector('dt'));
    const value = cleanText(item.querySelector('dd'));
    if (!label || !value) return;
    cells.push([label, value]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (Spec)', cells });
  element.replaceWith(block);
}
