/* eslint-disable */
/* global WebImporter */

import breadcrumbParser from './parsers/breadcrumb.js';
import cardsProfileHorizontalParser from './parsers/cards-profile-horizontal.js';
import cardsButtonParser from './parsers/cards-button.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  "name": "magazine-article",
  "urls": [
    "https://wknd.site/us/en/magazine/guide-la-skateparks.html"
  ],
  "representativeUrl": "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
  "description": "Magazine article: hero image, breadcrumb, article body with byline (left column) and a share rail with optional PDF download and up-next stories (right column)",
  "blocks": [
    {
      "name": "breadcrumb",
      "instances": [
        "main div.breadcrumb"
      ]
    },
    {
      "name": "cards-profile-horizontal",
      "instances": [
        "main .cmp-experiencefragment:not(.cmp-experiencefragment--header):not(.cmp-experiencefragment--footer)"
      ]
    },
    {
      "name": "cards-button",
      "instances": [
        "main aside.cmp-layoutcontainer--sidebar"
      ]
    }
  ],
  "urlPattern": "/us/en/magazine/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero and breadcrumb",
      "selector": [
        "main div.image:not(.byline)"
      ],
      "style": null,
      "blocks": [
        "breadcrumb"
      ],
      "defaultContent": [
        "main div.image:not(.byline) img"
      ]
    },
    {
      "id": "section-2",
      "name": "Article",
      "selector": [
        "main main"
      ],
      "style": "aside, yellow-underline",
      "blocks": [
        "cards-profile-horizontal",
        "cards-button"
      ],
      "defaultContent": [
        "main main h1",
        "main main div.title h4",
        "main main article.contentfragment"
      ]
    }
  ]
};

const parsers = {
  breadcrumb: breadcrumbParser,
  'cards-profile-horizontal': cardsProfileHorizontalParser,
  'cards-button': cardsButtonParser,
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
