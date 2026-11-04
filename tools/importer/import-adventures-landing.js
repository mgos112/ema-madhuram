/* eslint-disable */
/* global WebImporter */

import heroBoxedParser from './parsers/hero-boxed.js';
import cardsAdventuresParser from './parsers/cards-adventures.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  "name": "adventures-landing",
  "urls": [
    "https://wknd.site/us/en/adventures.html"
  ],
  "representativeUrl": "https://wknd.site/us/en/adventures.html",
  "description": "Adventures landing page: intro and a tabbed, filterable list of adventure cards (All plus one tab per activity)",
  "blocks": [
    {
      "name": "hero-boxed",
      "instances": [
        "main div.teaser.cmp-teaser--hero"
      ]
    },
    {
      "name": "cards-adventures",
      "instances": [
        "main div.tabs.panelcontainer"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Page title",
      "selector": [
        "main div.title:not(.cmp-title--underline)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "main div.title:not(.cmp-title--underline) h1"
      ]
    },
    {
      "id": "section-2",
      "name": "Intro teaser",
      "selector": [
        "main div.teaser.cmp-teaser--hero"
      ],
      "style": null,
      "blocks": [
        "hero-boxed"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Current Adventures",
      "selector": [
        "main div.title.cmp-title--underline"
      ],
      "style": "yellow-underline, custom-separator",
      "blocks": [
        "cards-adventures"
      ],
      "defaultContent": [
        "main div.title.cmp-title--underline h2"
      ]
    }
  ]
};

const parsers = {
  'hero-boxed': heroBoxedParser,
  'cards-adventures': cardsAdventuresParser,
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
