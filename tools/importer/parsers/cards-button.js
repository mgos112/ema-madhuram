/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the cards button variant (wknd.site article share rail, aside sidebar).
 * Emits a `Cards (Button)` block → `class="cards button"`.
 *
 * Cards "no images" convention: one cell per row. Every row is optional and emitted only
 * when the source has it:
 *  - title row: the sidebar title (e.g. "SHARE THIS STORY"), as an h2
 *  - PDF panel row: h3 title link, description, list of property values, download link
 *  - story rows: one per up-next list item: link with the title, then the date
 * AEM DAM `….coredownload.pdf` links (they 404) are rewritten to the PDF hosted in DA
 * next to the page: /<page folder>/<filename>.pdf (playbook: Downloads).
 */
function toPath(href) {
  try {
    return new URL(href, 'https://wknd.site').pathname.replace(/\.html?$/, '');
  } catch (e) {
    return href;
  }
}

/** Folder of the source page: from the import params, the import URL, or the canonical link. */
function pageFolder(ctx) {
  const canonical = ctx.document.querySelector('link[rel="canonical"], meta[property="og:url"]');
  const candidates = [
    ctx.params && ctx.params.originalURL,
    ctx.url,
    canonical && (canonical.getAttribute('href') || canonical.getAttribute('content')),
  ];
  for (const candidate of candidates) {
    try {
      const path = new URL(candidate).pathname;
      if (path.lastIndexOf('/') > 0) return path.substring(0, path.lastIndexOf('/'));
    } catch (e) {
      // try the next candidate
    }
  }
  return '';
}

function hostedPdfPath(href, filename, ctx) {
  const file = filename
    || decodeURIComponent((href || '').split('/').pop().replace(/\.coredownload\.pdf$/i, ''));
  return `${pageFolder(ctx)}/${file}`;
}

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

function buildPdfRow(download, ctx) {
  const { document } = ctx;
  const filename = textOf(download.querySelector('.cmp-download__property--filename .cmp-download__property-content'));
  const titleLink = download.querySelector('.cmp-download__title-link, .cmp-download__title a');
  const action = download.querySelector('.cmp-download__action');
  const sourceLink = titleLink || action;
  const href = hostedPdfPath(sourceLink ? sourceLink.getAttribute('href') : '', filename, ctx);

  const cell = [];
  const titleText = textOf(download.querySelector('.cmp-download__title'));
  if (titleText) {
    const h3 = document.createElement('h3');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = titleText;
    h3.append(a);
    cell.push(h3);
  }

  const description = download.querySelector('.cmp-download__description');
  if (description) {
    const texts = [...description.querySelectorAll('p')].map(textOf).filter(Boolean);
    (texts.length ? texts : [textOf(description)].filter(Boolean)).forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      cell.push(p);
    });
  }

  // Property values only (filename, size, format); labels are dropped.
  const values = [...download.querySelectorAll('.cmp-download__property-content')].map(textOf).filter(Boolean);
  if (values.length) {
    const ul = document.createElement('ul');
    values.forEach((value) => {
      const li = document.createElement('li');
      li.textContent = value;
      ul.append(li);
    });
    cell.push(ul);
  }

  if (action) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = textOf(action.querySelector('.cmp-download__action-text')) || textOf(action);
    p.append(a);
    cell.push(p);
  }
  return cell.length ? [cell] : null;
}

function buildStoryRows(list, document) {
  return [...list.querySelectorAll('.cmp-list__item')].map((item) => {
    const link = item.querySelector('a[href]');
    const title = textOf(item.querySelector('.cmp-list__item-title')) || textOf(link);
    if (!link || !title) return null;
    const cell = [];
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = toPath(link.getAttribute('href'));
    a.textContent = title;
    p.append(a);
    cell.push(p);
    const date = textOf(item.querySelector('.cmp-list__item-date'));
    if (date) {
      const dp = document.createElement('p');
      dp.textContent = date;
      cell.push(dp);
    }
    return [cell];
  }).filter(Boolean);
}

export default function parse(element, { document, url, params }) {
  const cells = [];

  const title = textOf(element.querySelector('.title .cmp-title__text'));
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title;
    cells.push([h2]);
  }

  const download = element.querySelector('.cmp-download');
  const pdfRow = download ? buildPdfRow(download, { document, url, params }) : null;
  if (pdfRow) cells.push(pdfRow);

  const list = element.querySelector('.cmp-list');
  const storyRows = list ? buildStoryRows(list, document) : [];
  cells.push(...storyRows);

  // A title on its own is not worth a block: without a PDF panel and stories, drop the rail.
  if (!pdfRow && !storyRows.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Button)', cells });
  element.replaceWith(block);
}
