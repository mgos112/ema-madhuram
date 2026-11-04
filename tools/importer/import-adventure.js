/* eslint-disable */
/* global WebImporter */

import breadcrumbParser from './parsers/breadcrumb.js';
import carouselHeroImgParser from './parsers/carousel-hero-img.js';
import columnsSpecParser from './parsers/columns-spec.js';
import tabsAdventureParser from './parsers/tabs-adventure.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';
import pageMetadataTransformer from './transformers/wknd-page-metadata.js';

const PAGE_TEMPLATE = {
  "name": "adventure",
  "urls": [
    "https://wknd.site/us/en/adventures/bali-surf-camp.html"
  ],
  "representativeUrl": "https://wknd.site/us/en/adventures/bali-surf-camp.html",
  "description": "Adventure detail page: breadcrumb, hero image, title, trip facts (activity, type, length, group size, difficulty, price) and Overview / Itinerary / What to Bring tabs",
  "blocks": [
    {
      "name": "breadcrumb",
      "instances": [
        "main div.breadcrumb"
      ]
    },
    {
      "name": "carousel-hero-img",
      "instances": [
        "main div.carousel.panelcontainer"
      ]
    },
    {
      "name": "columns-spec",
      "instances": [
        "main div.contentfragment:has(> .cmp-contentfragment > dl.cmp-contentfragment__elements)"
      ]
    },
    {
      "name": "tabs-adventure",
      "instances": [
        "main div.tabs.panelcontainer"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Breadcrumb and hero carousel",
      "selector": [
        "main div.breadcrumb"
      ],
      "style": null,
      "blocks": [
        "breadcrumb",
        "carousel-hero-img"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Title",
      "selector": [
        "main div.title.cmp-title--underline"
      ],
      "style": "yellow-underline",
      "blocks": [],
      "defaultContent": [
        "main div.title.cmp-title--underline h1"
      ]
    },
    {
      "id": "section-3",
      "name": "Trip facts and tabs",
      "selector": [
        "main div.title.cmp-title--underline + main.container",
        "main main.container:has(> .cmp-container > .aem-Grid--3)"
      ],
      "style": "adventure-body",
      "blocks": [
        "columns-spec",
        "tabs-adventure"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'breadcrumb': breadcrumbParser,
  'carousel-hero-img': carouselHeroImgParser,
  'columns-spec': columnsSpecParser,
  'tabs-adventure': tabsAdventureParser,
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
