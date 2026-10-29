/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for wknd.site (AEM Core Components).
 * Removes non-authorable chrome: header/footer experience fragments, navigation,
 * mobile nav toggle, tracking iframes, scripts/styles and data-layer attributes.
 * Contributor experience fragments inside <main> are left intact for the parser.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, [
      // Header / footer experience fragments
      'header.cmp-experiencefragment--header',
      '.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      '.cmp-experiencefragment--footer',
      // Mobile navigation (outside main)
      '#toggleNav',
      '#mobileNav',
      '.cmp-navigation--mobile',
      // Tracking / sync iframes
      'iframe#destination_publishing_iframe_wkndsite_0',
      'iframe[src*="demdex.net"]',
    ]);
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      'iframe',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Strip Core Components data-layer / accessibility tracking attributes
    const attrs = [
      'data-cmp-link-accessibility-enabled',
      'data-cmp-link-accessibility-text',
      'data-cmp-data-layer-enabled',
      'data-cmp-data-layer-name',
      'data-cmp-data-layer',
      'data-cmp-clickable',
    ];
    const nodes = [element, ...element.querySelectorAll('*')];
    nodes.forEach((el) => {
      if (!el.removeAttribute) return;
      attrs.forEach((a) => el.removeAttribute(a));
    });
  }
}
