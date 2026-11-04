/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the tabs adventure variant (wknd.site adventure Overview / Itinerary / What to Bring tabs).
 * Emits a `Tabs (Adventure)` block, which renders as `class="tabs adventure"`.
 *
 * Source: div.tabs.panelcontainer > .cmp-tabs > ol.cmp-tabs__tablist > li.cmp-tabs__tab
 *         and .cmp-tabs > .cmp-tabs__tabpanel (each wraps a content fragment article)
 * Library Tabs convention, two cells per row, one row per tab:
 *   Cell 1: tab label (plain text)
 *   Cell 2: tab panel rich content (paragraphs, bold, H2/H3 headings, images, links, lists)
 * Tabs are matched to panels by aria-controls / id, falling back to index order.
 * Hidden content fragment title H3s (they repeat the page title) and empty paragraphs/headings are dropped.
 */
const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'BLOCKQUOTE', 'TABLE'];

function bestSrc(img) {
  const srcset = (img.getAttribute('srcset') || img.getAttribute('data-srcset') || '')
    .split(',')
    .map((entry) => {
      const [url, size] = entry.trim().split(/\s+/);
      return { url, size: parseFloat(size) || 0 };
    })
    .filter((entry) => entry.url && !entry.url.startsWith('data:'));
  if (srcset.length) {
    srcset.sort((a, b) => b.size - a.size);
    return srcset[0].url;
  }
  const src = img.getAttribute('src') || '';
  if (src && !src.startsWith('data:')) return src;
  const lazy = img.getAttribute('data-cmp-src') || img.closest('[data-cmp-src]')?.getAttribute('data-cmp-src');
  return lazy ? lazy.replace('{.width}', '') : '';
}

function makeImage(srcImg, document) {
  const src = bestSrc(srcImg);
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = srcImg.getAttribute('alt') || '';
  return img;
}

function hasText(node) {
  return node.textContent.trim().length > 0;
}

function collectContent(node, out, document) {
  [...node.children].forEach((child) => {
    const tag = child.tagName;
    if (BLOCK_TAGS.includes(tag)) {
      // Rebuild nested images with a resolved src; keep the rest of the markup as authored.
      child.querySelectorAll('img').forEach((srcImg) => {
        const img = makeImage(srcImg, document);
        if (img) srcImg.replaceWith(img); else srcImg.remove();
      });
      child.querySelectorAll('picture source, meta').forEach((el) => el.remove());
      const keepImageParagraph = tag === 'P' && child.querySelector('img');
      if (hasText(child) || keepImageParagraph) out.push(child);
    } else if (tag === 'IMG') {
      const img = makeImage(child, document);
      if (img) out.push(img);
    } else if (tag === 'A') {
      if (hasText(child) && child.getAttribute('href')) {
        const p = document.createElement('p');
        p.append(child);
        out.push(p);
      }
    } else if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'BUTTON') {
      collectContent(child, out, document);
    }
  });
}

function findPanel(tab, index, panels) {
  const controls = tab.getAttribute('aria-controls');
  let panel = controls && panels.find((p) => p.id === controls);
  if (!panel && tab.id) {
    panel = panels.find((p) => p.getAttribute('aria-labelledby') === tab.id)
      || panels.find((p) => p.id && p.id === tab.id.replace(/-tab$/, '-tabpanel'));
  }
  return panel || panels[index] || null;
}

export default function parse(element, { document }) {
  const root = element.querySelector('.cmp-tabs') || element;
  const own = (el) => el.closest('.cmp-tabs') === root;
  const tabs = [...root.querySelectorAll('.cmp-tabs__tab')].filter(own);
  const panels = [...root.querySelectorAll('.cmp-tabs__tabpanel')].filter(own);

  const cells = [];
  tabs.forEach((tab, index) => {
    const label = tab.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;

    const content = [];
    const panel = findPanel(tab, index, panels);
    if (panel) {
      const clone = panel.cloneNode(true);
      clone.querySelectorAll('.cmp-contentfragment__title, article.cmp-contentfragment > h3')
        .forEach((el) => el.remove());
      collectContent(clone, content, document);
    }

    cells.push([label, content.length ? content : '']);
  });

  if (!cells.length) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs (Adventure)', cells });
  element.replaceWith(block);
}
