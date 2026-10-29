/* eslint-disable */
/* global WebImporter */

import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsDynamicParser from './parsers/cards-dynamic.js';
import cardsMemberOnlyParser from './parsers/cards-member-only.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  "name": "magazine",
  "urls": [
    "https://wknd.site/us/en/magazine.html"
  ],
  "representativeUrl": "https://wknd.site/us/en/magazine.html",
  "description": "Magazine landing page: page title, featured article teaser, index-driven All Articles list, and Members Only locked teasers",
  "blocks": [
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
      "name": "cards-member-only",
      "instances": [
        "main div.teaser.cmp-teaser--secure:not(div.teaser.cmp-teaser--secure + div.teaser.cmp-teaser--secure)"
      ]
    }
  ],
  "urlPattern": "/us/en/magazine",
  "sections": [
    {
      "id": "section-1",
      "name": "Page title",
      "selector": [
        "main div.title.aem-GridColumn:not(.cmp-title--underline)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main div.title.aem-GridColumn:not(.cmp-title--underline) h1"
      ]
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
      "name": "All Articles",
      "selector": [
        "main div.title.cmp-title--underline.aem-GridColumn"
      ],
      "style": "yellow-underline",
      "blocks": [
        "cards-dynamic"
      ],
      "defaultContent": [
        "main div.title.cmp-title--underline.aem-GridColumn h2"
      ]
    },
    {
      "id": "section-4",
      "name": "Members Only",
      "selector": [
        "main div.title.cmp-title--underline.aem-GridColumn ~ div.title.cmp-title--underline.aem-GridColumn"
      ],
      "style": "yellow-underline, custom-separator",
      "blocks": [
        "cards-member-only"
      ],
      "defaultContent": [
        "main div.title.cmp-title--underline.aem-GridColumn h2",
        "main div.text.aem-GridColumn"
      ]
    }
  ]
};

const parsers = {
  'columns-featured': columnsFeaturedParser,
  'cards-dynamic': cardsDynamicParser,
  'cards-member-only': cardsMemberOnlyParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

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
    WebImporter.rules.createMetadata(main, document);
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
