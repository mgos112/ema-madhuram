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

  // tools/importer/import-adventures-landing.js
  var import_adventures_landing_exports = {};
  __export(import_adventures_landing_exports, {
    default: () => import_adventures_landing_default
  });

  // tools/importer/parsers/hero-boxed.js
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
    const srcImg = element.querySelector(".cmp-teaser__image img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const textCell = [];
    const title = element.querySelector(".cmp-teaser__title");
    if (title && title.textContent.trim()) {
      const level = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : "h2";
      const heading = document2.createElement(level);
      heading.textContent = title.textContent.trim();
      textCell.push(heading);
    }
    textCell.push(...textParagraphs(element.querySelector(".cmp-teaser__description"), document2));
    element.querySelectorAll(".cmp-teaser__action-link").forEach((link) => {
      const label = link.textContent.trim();
      const href = link.getAttribute("href");
      if (!label || !href) return;
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      textCell.push(p);
    });
    if (!imageCell.length && !textCell.length) {
      element.remove();
      return;
    }
    const cells = [
      [imageCell.length ? imageCell : ""],
      [textCell.length ? textCell : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Hero (Boxed)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-adventures.js
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
    const hasTabs = !!element.querySelector(".cmp-tabs__tab");
    const config = hasTabs ? `${prefix} | filter:activity` : prefix;
    const cells = [[config]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Adventures)", cells });
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
        "main div.separator",
        // Hidden on the source: content fragment titles and the empty share widget.
        "main .cmp-contentfragment__title",
        "main div.sharing"
      ]);
      element.querySelectorAll("img").forEach((img) => {
        var _a;
        const src = img.getAttribute("src") || "";
        if (src && !src.startsWith("data:")) return;
        const lazy = img.getAttribute("data-cmp-src") || ((_a = img.closest("[data-cmp-src]")) == null ? void 0 : _a.getAttribute("data-cmp-src"));
        const srcset = (img.getAttribute("srcset") || "").split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean);
        const fallback = lazy ? lazy.replace("{.width}", "") : srcset[srcset.length - 1];
        if (fallback) img.setAttribute("src", fallback);
      });
      element.querySelectorAll(".cmp-text--quote blockquote").forEach((quote) => {
        let next = quote.nextElementSibling;
        while (next && next.tagName === "P") {
          const current = next;
          next = next.nextElementSibling;
          quote.append(current);
        }
      });
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
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        try {
          const url = new URL(href, "https://wknd.site");
          if (url.hostname !== "wknd.site" || !/\.html?$/.test(url.pathname)) return;
          if (url.pathname.startsWith("/content/")) return;
          a.setAttribute("href", `${url.pathname.replace(/\.html?$/, "")}${url.search}${url.hash}`);
        } catch (e) {
        }
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

  // tools/importer/import-adventures-landing.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-boxed": parse,
    "cards-adventures": parse2
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
  var import_adventures_landing_default = {
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
  return __toCommonJS(import_adventures_landing_exports);
})();
