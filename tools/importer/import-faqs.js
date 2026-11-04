/* eslint-disable */
/* global WebImporter */

import accordionDividerParser from './parsers/accordion-divider.js';
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

const PAGE_TEMPLATE = {
  name: 'faqs',
  urls: [
    'https://wknd.site/us/en/faqs.html',
  ],
  representativeUrl: 'https://wknd.site/us/en/faqs.html',
  description: "FAQs page: title, hero image, intro text and an accordion of questions, with a 'Need more help?' contact aside",
  blocks: [
    {
      name: 'accordion-divider',
      instances: [
        'main div.accordion.panelcontainer',
        'main div.cmp-accordion',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: "FAQs: main column and 'Need more help?' aside",
      selector: [
        'main.container',
        'main',
      ],
      style: 'faq-aside, yellow-underline',
      blocks: ['accordion-divider'],
      defaultContent: [
        'main div.title.cmp-title--underline h1',
        'main div.image img',
        'main div.image ~ div.text',
        'main div.container.responsivegrid + div.container.responsivegrid div.title h3',
        'main div.container.responsivegrid + div.container.responsivegrid div.text',
      ],
    },
  ],
};

const parsers = {
  'accordion-divider': accordionDividerParser,
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

/**
 * wknd-sections only styles pages with two or more sections, so the single
 * styled section of this template gets its Section Metadata here.
 */
function addSectionMetadata(main, document) {
  const [section] = PAGE_TEMPLATE.sections;
  if (PAGE_TEMPLATE.sections.length !== 1 || !section.style) return;
  const metadata = WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: { style: section.style },
  });
  main.append(metadata);
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

    addSectionMetadata(main, document);

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
