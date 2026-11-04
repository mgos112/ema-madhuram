/* eslint-disable */
/* global WebImporter */

/**
 * Page metadata transformer for wknd.site.
 * Copies content fragment facts that feed the query index (e.g. an adventure's Activity)
 * into <meta data-excat-metadata> tags in the document head. Import scripts add these
 * to the page Metadata block next to the defaults (title, description, image).
 */
const FIELDS = [
  ['activity', '.cmp-contentfragment__element--activity .cmp-contentfragment__element-value'],
];

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const doc = element.ownerDocument || document;
  FIELDS.forEach(([name, selector]) => {
    const value = (doc.querySelector(selector)?.textContent || '').replace(/\s+/g, ' ').trim();
    if (!value || doc.head.querySelector(`meta[data-excat-metadata][name="${name}"]`)) return;
    const meta = doc.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', value);
    meta.setAttribute('data-excat-metadata', '');
    doc.head.append(meta);
  });
}
