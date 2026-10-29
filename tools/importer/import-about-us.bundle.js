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

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/cards-profile.js
  var CARD_SELECTOR = "section.experiencefragment.cmp-experience-fragment--contributor";
  function isCard(el) {
    return !!(el && el.matches && el.matches(CARD_SELECTOR));
  }
  function buildRow(card, document2) {
    const imageCell = [];
    const srcImg = card.querySelector("img.cmp-image__image") || card.querySelector("img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const bodyCell = [];
    const titles = [...card.querySelectorAll(".cmp-title__text")];
    const nameEl = card.querySelector(".title:not(.cmp-title--black) h3.cmp-title__text") || card.querySelector("h3.cmp-title__text") || titles[0];
    const roleEl = card.querySelector(".cmp-title--black .cmp-title__text") || card.querySelector("h5.cmp-title__text") || titles.find((t) => t !== nameEl);
    const nameText = nameEl ? nameEl.textContent.trim() : "";
    if (nameText) {
      const h3 = document2.createElement("h3");
      h3.textContent = nameText;
      bodyCell.push(h3);
    }
    const roleText = roleEl && roleEl !== nameEl ? roleEl.textContent.trim() : "";
    if (roleText) {
      const p = document2.createElement("p");
      p.textContent = roleText;
      bodyCell.push(p);
    }
    const links = [...card.querySelectorAll("a.cmp-button[href]")];
    if (links.length) {
      const ul = document2.createElement("ul");
      links.forEach((src) => {
        const labelEl = src.querySelector(".cmp-button__text");
        const label = (labelEl ? labelEl.textContent : src.textContent).trim() || src.getAttribute("aria-label") || src.getAttribute("title") || "";
        if (!label) return;
        const a = document2.createElement("a");
        a.href = src.getAttribute("href");
        a.textContent = label;
        const li = document2.createElement("li");
        li.append(a);
        ul.append(li);
      });
      if (ul.children.length) bodyCell.push(ul);
    }
    if (!imageCell.length && !bodyCell.length) return null;
    return [imageCell.length ? imageCell : "", bodyCell.length ? bodyCell : ""];
  }
  function parse(element, { document: document2 }) {
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Profile)", cells });
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
        'iframe[src*="demdex.net"]'
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

  // tools/importer/import-about-us.js
  var PAGE_TEMPLATE = {
    name: "about-us",
    urls: [
      "https://wknd.site/us/en/about-us.html"
    ],
    representativeUrl: "https://wknd.site/us/en/about-us.html",
    description: "About Us page: page title, then two groups (Our Contributors, WKND Guides) each with an underlined heading, an intro paragraph and a grid of profile cards",
    urlPattern: "/us/en/*",
    blocks: [
      {
        name: "cards-profile",
        instances: [
          "main div.text.cmp-text--font-small + section.experiencefragment.cmp-experience-fragment--contributor"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Page title",
        selector: [
          "main div.title.aem-GridColumn:not(.cmp-title--underline)"
        ],
        style: null,
        blocks: [],
        defaultContent: [
          "main div.title.aem-GridColumn:not(.cmp-title--underline) h1"
        ]
      },
      {
        id: "section-2",
        name: "Our Contributors",
        selector: [
          "main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(2)",
          "main div.title.cmp-title--underline.aem-GridColumn"
        ],
        style: null,
        blocks: ["cards-profile"],
        defaultContent: [
          "main div.title.cmp-title--underline.aem-GridColumn h2",
          "main div.text.cmp-text--font-small.aem-GridColumn"
        ]
      },
      {
        id: "section-3",
        name: "WKND Guides",
        selector: [
          "main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(4)",
          "main div.title.cmp-title--underline.aem-GridColumn ~ div.title.cmp-title--underline.aem-GridColumn"
        ],
        style: null,
        blocks: ["cards-profile"],
        defaultContent: [
          "main div.title.cmp-title--underline.aem-GridColumn h2",
          "main div.text.cmp-text--font-small.aem-GridColumn"
        ]
      }
    ]
  };
  var parsers = {
    "cards-profile": parse
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
  var import_about_us_default = {
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
  return __toCommonJS(import_about_us_exports);
})();
