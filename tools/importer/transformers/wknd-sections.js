/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for wknd.site.
 * Inserts <hr> section breaks before each non-first section (beforeTransform,
 * while parser targets still exist). For styled sections a Section Metadata
 * block is added in afterTransform at the end of the section. Multiple styles
 * are comma-separated (e.g. 'yellow-underline, custom-separator').
 */
const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector in this DOM implementation; try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (section.style) {
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (marker) {
          // place metadata at end of the section that the marker opens
          let cursor = marker.nextElementSibling;
          let last = marker;
          while (cursor && cursor.tagName !== 'HR') {
            last = cursor;
            cursor = cursor.nextElementSibling;
          }
          last.after(metadata);
        } else {
          const el = findSectionElement(element, section);
          if (el) el.after(metadata);
        }
      }
      if (marker) {
        if (i === 0) marker.remove();
        else marker.removeAttribute(MARKER);
      }
    }
  }
}
