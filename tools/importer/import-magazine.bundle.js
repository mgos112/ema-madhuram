/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-magazine.js
  var import_magazine_exports = {};
  __export(import_magazine_exports, {
    default: () => import_magazine_default
  });

  // tools/importer/parsers/columns-featured.js
  function textParagraphs(container, document2) {
    if (!container) return [];
    const paragraphs = [...container.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean);
    const texts = paragraphs.length ? paragraphs : [container.textContent.trim()].filter(Boolean);
    return texts.map((text) => {
      const p = document2.createElement("p");
      p.textContent = text;
      return p;
    });
  }
  function parse(element, { document: document2 }) {
    const imageCell = [];
    const srcImg = element.querySelector(".cmp-teaser__image img") || element.querySelector("img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const textCell = [];
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      textCell.push(p);
    }
    const title = element.querySelector(".cmp-teaser__title");
    if (title && title.textContent.trim()) {
      const h2 = document2.createElement("h2");
      const titleLink = title.querySelector("a[href]");
      if (titleLink) {
        const a = document2.createElement("a");
        a.href = titleLink.getAttribute("href");
        a.textContent = title.textContent.trim();
        h2.append(a);
      } else {
        h2.textContent = title.textContent.trim();
      }
      textCell.push(h2);
    }
    textCell.push(...textParagraphs(element.querySelector(".cmp-teaser__description"), document2));
    element.querySelectorAll(".cmp-teaser__action-container a[href]").forEach((link) => {
      const label = link.textContent.trim();
      if (!label) return;
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      textCell.push(p);
    });
    const cells = [[imageCell.length ? imageCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns (Featured)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-dynamic.js
  function toPath(href) {
    try {
      return new URL(href, "https://wknd.site").pathname.replace(/\.html?$/, "");
    } catch (e) {
      return "";
    }
  }
  function commonPrefix(paths) {
    if (!paths.length) return "";
    const split = paths.map((p) => p.split("/").filter(Boolean).slice(0, -1));
    const first = split[0];
    let length = first.length;
    split.forEach((parts) => {
      let i = 0;
      while (i < length && parts[i] === first[i]) i += 1;
      length = i;
    });
    return length ? `/${first.slice(0, length).join("/")}` : "";
  }
  function parse2(element, { document: document2 }) {
    const links = [...element.querySelectorAll("a[href]")].map((a) => toPath(a.getAttribute("href"))).filter((p) => p && p.startsWith("/"));
    const unique = [...new Set(links)];
    const prefix = commonPrefix(unique);
    if (!prefix) {
      element.remove();
      return;
    }
    const cells = [[prefix]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Dynamic)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-member-only.js
  var CARD_SELECTOR = "div.teaser.cmp-teaser--secure";
  function isCard(el) {
    return !!(el && el.matches && el.matches(CARD_SELECTOR));
  }
  function buildRow(card, document2) {
    const imageCell = [];
    const srcImg = card.querySelector(".cmp-teaser__image img") || card.querySelector("img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const bodyCell = [];
    const title = card.querySelector(".cmp-teaser__title");
    if (title && title.textContent.trim()) {
      const h3 = document2.createElement("h3");
      h3.textContent = title.textContent.trim();
      bodyCell.push(h3);
    }
    const description = card.querySelector(".cmp-teaser__description");
    if (description) {
      const paragraphs = [...description.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean);
      const texts = paragraphs.length ? paragraphs : [description.textContent.trim()].filter(Boolean);
      texts.forEach((text) => {
        const p = document2.createElement("p");
        p.textContent = text;
        bodyCell.push(p);
      });
    }
    const action = card.querySelector(".cmp-teaser__action-container");
    if (action && action.textContent.trim()) {
      const p = document2.createElement("p");
      const link = action.querySelector("a[href]");
      if (link) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.trim();
        p.append(a);
      } else {
        p.textContent = action.textContent.trim();
      }
      bodyCell.push(p);
    }
    if (!imageCell.length && !bodyCell.length) return null;
    return [imageCell.length ? imageCell : "", bodyCell.length ? bodyCell : ""];
  }
  function parse3(element, { document: document2 }) {
    const cards = [element];
    let next = element.nextElementSibling;
    while (isCard(next)) {
      cards.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    cards.forEach((card) => {
      const row = buildRow(card, document2);
      if (row) cells.push(row);
    });
    cards.slice(1).forEach((card) => card.remove());
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Member Only)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        // Header / footer experience fragments
        "header.cmp-experiencefragment--header",
        ".cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        ".cmp-experiencefragment--footer",
        // Mobile navigation (outside main)
        "#toggleNav",
        "#mobileNav",
        ".cmp-navigation--mobile",
        // Tracking / sync iframes
        "iframe#destination_publishing_iframe_wkndsite_0",
        'iframe[src*="demdex.net"]',
        // Decorative separator components: their inner <hr> would become a section break.
        // The rule is reproduced by the `custom-separator` section style instead.
        "main div.separator"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        "iframe",
        "script",
        "style",
        "noscript",
        "link"
      ]);
      const attrs = [
        "data-cmp-link-accessibility-enabled",
        "data-cmp-link-accessibility-text",
        "data-cmp-data-layer-enabled",
        "data-cmp-data-layer-name",
        "data-cmp-data-layer",
        "data-cmp-clickable"
      ];
      const nodes = [element, ...element.querySelectorAll("*")];
      nodes.forEach((el) => {
        if (!el.removeAttribute) return;
        attrs.forEach((a) => el.removeAttribute(a));
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (section.style) {
          const metadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (marker) {
            let cursor = marker.nextElementSibling;
            let last = marker;
            while (cursor && cursor.tagName !== "HR") {
              last = cursor;
              cursor = cursor.nextElementSibling;
            }
            last.after(metadata);
          } else {
            const el = findSectionElement(element, section);
            if (el) el.after(metadata);
          }
        }
        if (marker) {
          if (i === 0) marker.remove();
          else marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/import-magazine.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "columns-featured": parse,
    "cards-dynamic": parse2,
    "cards-member-only": parse3
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_magazine_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_magazine_exports);
})();
