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
      // Decorative separator components: their inner <hr> would become a section break.
      // The rule is reproduced by the `custom-separator` section style instead.
      'main div.separator',
      // Hidden on the source: content fragment titles and the empty share widget.
      'main .cmp-contentfragment__title',
      'main div.sharing',
    ]);

    // Lazy-loaded images: fall back to data-cmp-src / the largest srcset entry.
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src && !src.startsWith('data:')) return;
      const lazy = img.getAttribute('data-cmp-src') || img.closest('[data-cmp-src]')?.getAttribute('data-cmp-src');
      const srcset = (img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean);
      const fallback = lazy ? lazy.replace('{.width}', '') : srcset[srcset.length - 1];
      if (fallback) img.setAttribute('src', fallback);
    });

    // Pull-quotes: keep the attribution inside the blockquote.
    element.querySelectorAll('.cmp-text--quote blockquote').forEach((quote) => {
      let next = quote.nextElementSibling;
      while (next && next.tagName === 'P') {
        const current = next;
        next = next.nextElementSibling;
        quote.append(current);
      }
    });
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

    // Internal page links: EDS paths have no .html extension.
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      try {
        const url = new URL(href, 'https://wknd.site');
        if (url.hostname !== 'wknd.site' || !/\.html?$/.test(url.pathname)) return;
        if (url.pathname.startsWith('/content/')) return;
        a.setAttribute('href', `${url.pathname.replace(/\.html?$/, '')}${url.search}${url.hash}`);
      } catch (e) {
        // leave unparseable hrefs as they are
      }
    });
  }
}
