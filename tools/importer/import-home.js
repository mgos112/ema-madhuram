/* eslint-disable */
/* global WebImporter */

import carouselHeroImgBoxedParser from './parsers/carousel-hero-img-boxed.js';
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsDynamicParser from './parsers/cards-dynamic.js';
import heroBoxedParser from './parsers/hero-boxed.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';
import pageMetadataTransformer from './transformers/wknd-page-metadata.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://wknd.site/us/en.html"
  ],
  "representativeUrl": "https://wknd.site/us/en.html",
  "description": "Home page: hero carousel with overlay content, featured article teaser, recent magazine articles, banner and adventures teasers",
  "blocks": [
    {
      "name": "carousel-hero-img-boxed",
      "instances": [
        "main div.carousel.panelcontainer"
      ]
    },
    {
      "name": "columns-featured",
      "instances": [
        "main div.teaser.cmp-teaser--featured"
      ]
    },
    {
      "name": "cards-dynamic",
      "instances": [
        "main div.image-list.list"
      ]
    },
    {
      "name": "hero-boxed",
      "instances": [
        "main div.teaser.cmp-teaser--hero:not(.carousel div)"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Hero carousel",
      "selector": [
        "main div.carousel.panelcontainer"
      ],
      "style": null,
      "blocks": [
        "carousel-hero-img-boxed"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Featured article",
      "selector": [
        "main div.teaser.cmp-teaser--featured"
      ],
      "style": null,
      "blocks": [
        "columns-featured"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Recent Articles",
      "selector": [
        "main div.teaser.cmp-teaser--featured ~ div.title.cmp-title--underline"
      ],
      "style": "yellow-underline, primary-cta, custom-separator",
      "blocks": [
        "cards-dynamic"
      ],
      "defaultContent": [
        "main div.title.cmp-title--underline h2",
        "main div.button a"
      ]
    },
    {
      "id": "section-4",
      "name": "Next Adventures banner",
      "selector": [
        "main div.title.cmp-title--underline ~ div.title.cmp-title--underline"
      ],
      "style": "yellow-underline",
      "blocks": [
        "hero-boxed"
      ],
      "defaultContent": [
        "main div.title.cmp-title--underline h2"
      ]
    },
    {
      "id": "section-5",
      "name": "Where do you want to go?",
      "selector": [
        "main div.title:not(.cmp-title--underline)"
      ],
      "style": "primary-cta, custom-separator",
      "blocks": [
        "cards-dynamic"
      ],
      "defaultContent": [
        "main div.title h3",
        "main div.button a"
      ]
    }
  ]
};

const parsers = {
  'carousel-hero-img-boxed': carouselHeroImgBoxedParser,
  'columns-featured': columnsFeaturedParser,
  'cards-dynamic': cardsDynamicParser,
  'hero-boxed': heroBoxedParser,
};

const transformers = [pageMetadataTransformer, cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

/**
 * Default page metadata plus extra fields that transformers put in the head as
 * <meta data-excat-metadata> (e.g. activity, which feeds the query index).
 */
function createPageMetadata(main, document) {
  const meta = WebImporter.Blocks.getMetadata(document) || {};
  document.querySelectorAll('head meta[data-excat-metadata][name]').forEach((tag) => {
    const name = tag.getAttribute('name');
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    if (tag.getAttribute('content')) meta[label] = tag.getAttribute('content');
  });
  if (Object.keys(meta).length) main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    createPageMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
