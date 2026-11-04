/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the cards dynamic variant (wknd.site AEM Image List / List components).
 * Emits a `Cards (Dynamic)` block, which renders as `class="cards dynamic"`.
 *
 * Deliberate deviation from the static Cards convention (playbook §E4/§E5): the source
 * list is generated from child pages, so only the list configuration is authored —
 * one row, one cell holding the path prefix the items share (e.g. /us/en/magazine).
 * The block fills the cards from the query index at render time.
 *
 * Limit: when the list sits on a page other than its own listing page (e.g. the home
 * page showing the latest magazine articles), the cell also carries the number of
 * unique source items: `${prefix} | ${count}` (e.g. /us/en/magazine | 4). The page path
 * comes from params.originalURL (pathname, .html stripped); on the listing page itself
 * (page path === prefix, e.g. /us/en/magazine) the cell stays just `${prefix}`.
 */
function toPath(href) {
  try {
    return new URL(href, 'https://wknd.site').pathname.replace(/\.html?$/, '');
  } catch (e) {
    return '';
  }
}

/** Longest common parent directory of the item paths, e.g. /us/en/magazine. */
function commonPrefix(paths) {
  if (!paths.length) return '';
  const split = paths.map((p) => p.split('/').filter(Boolean).slice(0, -1));
  const first = split[0];
  let length = first.length;
  split.forEach((parts) => {
    let i = 0;
    while (i < length && parts[i] === first[i]) i += 1;
    length = i;
  });
  return length ? `/${first.slice(0, length).join('/')}` : '';
}

/** Path of the page being imported, from params.originalURL; '' when unknown. */
function pagePath(params) {
  const url = params && params.originalURL;
  if (!url) return '';
  try {
    return new URL(url, 'https://wknd.site').pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document, params }) {
  const links = [...element.querySelectorAll('a[href]')]
    .map((a) => toPath(a.getAttribute('href')))
    .filter((p) => p && p.startsWith('/'));
  const unique = [...new Set(links)];
  const prefix = commonPrefix(unique);

  if (!prefix) {
    // Nothing to configure; drop the generated list rather than emit an empty block.
    element.remove();
    return;
  }

  const page = pagePath(params);
  const config = page && page !== prefix ? `${prefix} | ${unique.length}` : prefix;
  const cells = [[config]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Dynamic)', cells });
  element.replaceWith(block);
}
