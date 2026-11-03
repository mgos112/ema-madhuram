/**
 * Query index helpers for index-driven blocks (e.g. cards dynamic).
 * The index is configured at tools.aem.live and served as /query-index.json.
 */

const INDEX_PATH = '/query-index.json';
const PAGE_SIZE = 500;

let indexPromise;

async function fetchIndex() {
  const rows = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${INDEX_PATH}?offset=${offset}&limit=${PAGE_SIZE}`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    const data = Array.isArray(json.data) ? json.data : [];
    rows.push(...data);
    total = Number.isFinite(json.total) ? json.total : rows.length;
    if (!data.length) break;
    offset += data.length;
  }
  return rows;
}

/**
 * Returns all rows of the query index (cached per page view).
 * Resolves to an empty array if the index is missing or unreadable.
 * @returns {Promise<Object[]>}
 */
export async function getIndex() {
  if (!indexPromise) {
    indexPromise = fetchIndex().catch(() => []);
  }
  return indexPromise;
}

function normalizePrefix(prefix) {
  if (!prefix) return '/';
  const path = prefix.trim().replace(/\.html?$/, '');
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Lists pages from the query index.
 * @param {Object} [options]
 * @param {string} [options.prefix] Only pages below this path (the prefix page itself is excluded)
 * @param {boolean} [options.directOnly] Only direct children of the prefix
 * @param {string} [options.category] Only pages whose `category` matches
 * @param {number} [options.limit] Maximum number of pages
 * @returns {Promise<Object[]>}
 */
export async function queryPages({
  prefix = '/',
  directOnly = false,
  category,
  limit,
} = {}) {
  const base = normalizePrefix(prefix);
  const current = window.location.pathname.replace(/\.html?$/, '');
  const rows = await getIndex();
  const pages = rows.filter((row) => {
    const { path } = row;
    if (!path || !path.startsWith(base) || path === current) return false;
    if (directOnly && path.slice(base.length).includes('/')) return false;
    if (category && (row.category || '').toLowerCase() !== category.toLowerCase()) return false;
    return true;
  });
  return limit > 0 ? pages.slice(0, limit) : pages;
}
