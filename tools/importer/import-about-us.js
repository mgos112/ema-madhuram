/* eslint-disable */
/* global WebImporter */

import cardsProfileParser from './parsers/cards-profile.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  name: 'about-us',
  urls: [
    'https://wknd.site/us/en/about-us.html',
  ],
  representativeUrl: 'https://wknd.site/us/en/about-us.html',
  description: 'About Us page: page title, then two groups (Our Contributors, WKND Guides) each with an underlined heading, an intro paragraph and a grid of profile cards',
  urlPattern: '/us/en/*',
  blocks: [
    {
      name: 'cards-profile',
      instances: [
        'main div.text.cmp-text--font-small + section.experiencefragment.cmp-experience-fragment--contributor',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Page title',
      selector: [
        'main div.title.aem-GridColumn:not(.cmp-title--underline)',
      ],
      style: null,
      blocks: [],
      defaultContent: [
        'main div.title.aem-GridColumn:not(.cmp-title--underline) h1',
      ],
    },
    {
      id: 'section-2',
      name: 'Our Contributors',
      selector: [
        'main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(2)',
        'main div.title.cmp-title--underline.aem-GridColumn',
      ],
      style: null,
      blocks: ['cards-profile'],
      defaultContent: [
        'main div.title.cmp-title--underline.aem-GridColumn h2',
        'main div.text.cmp-text--font-small.aem-GridColumn',
      ],
    },
    {
      id: 'section-3',
      name: 'WKND Guides',
      selector: [
        'main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(4)',
        'main div.title.cmp-title--underline.aem-GridColumn ~ div.title.cmp-title--underline.aem-GridColumn',
      ],
      style: null,
      blocks: ['cards-profile'],
      defaultContent: [
        'main div.title.cmp-title--underline.aem-GridColumn h2',
        'main div.text.cmp-text--font-small.aem-GridColumn',
      ],
    },
  ],
};

const parsers = {
  'cards-profile': cardsProfileParser,
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
