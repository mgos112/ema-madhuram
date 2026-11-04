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

  // tools/importer/import-faqs.js
  var import_faqs_exports = {};
  __export(import_faqs_exports, {
    default: () => import_faqs_default
  });

  // tools/importer/parsers/accordion-divider.js
  var CONTENT_SELECTOR = "p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, table, pre";
  var TRAILING_WS = /[\s ]+$/;
  function cleanText(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function isEmpty(el) {
    if (el.querySelector("img, picture, video, iframe")) return false;
    return !cleanText(el.textContent);
  }
  function trimTrailing(el, document2) {
    const walker = document2.createTreeWalker(
      el,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (let i = textNodes.length - 1; i >= 0; i -= 1) {
      const node = textNodes[i];
      const trimmed = node.textContent.replace(TRAILING_WS, "");
      node.textContent = trimmed;
      if (trimmed) return;
    }
  }
  function stripAttributes(el) {
    [el, ...el.querySelectorAll("[id], [class]")].forEach((n) => {
      n.removeAttribute("id");
      n.removeAttribute("class");
    });
  }
  function buildAnswer(panel, document2) {
    const content = [];
    if (!panel) return content;
    const sources = [...panel.querySelectorAll(".cmp-text")];
    if (!sources.length) sources.push(panel);
    sources.forEach((src) => {
      const blocks = [...src.querySelectorAll(CONTENT_SELECTOR)].filter((el) => {
        const outer = el.parentElement.closest(CONTENT_SELECTOR);
        return !outer || !src.contains(outer);
      });
      if (!blocks.length && cleanText(src.textContent)) {
        const p = document2.createElement("p");
        p.textContent = cleanText(src.textContent);
        blocks.push(p);
      }
      blocks.forEach((el) => {
        if (isEmpty(el)) return;
        const clone = el.cloneNode(true);
        stripAttributes(clone);
        clone.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((n) => {
          if (isEmpty(n)) n.remove();
        });
        trimTrailing(clone, document2);
        if (!isEmpty(clone)) content.push(clone);
      });
    });
    return content;
  }
  function parse(element, { document: document2 }) {
    const root = element.matches(".cmp-accordion") ? element : element.querySelector(".cmp-accordion") || element;
    const items = [...root.querySelectorAll(".cmp-accordion__item")].filter((item) => root === element && !root.matches(".cmp-accordion") || item.closest(".cmp-accordion") === root);
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button") || item.querySelector(".cmp-accordion__header");
      const question = cleanText(titleEl && titleEl.textContent);
      if (!question) return;
      const answer = buildAnswer(item.querySelector(".cmp-accordion__panel"), document2);
      cells.push([question, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Accordion (Divider)", cells });
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

  // tools/importer/import-faqs.js
  var PAGE_TEMPLATE = {
    name: "faqs",
    urls: [
      "https://wknd.site/us/en/faqs.html"
    ],
    representativeUrl: "https://wknd.site/us/en/faqs.html",
    description: "FAQs page: title, hero image, intro text and an accordion of questions, with a 'Need more help?' contact aside",
    blocks: [
      {
        name: "accordion-divider",
        instances: [
          "main div.accordion.panelcontainer",
          "main div.cmp-accordion"
        ]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "FAQs: main column and 'Need more help?' aside",
        selector: [
          "main.container",
          "main"
        ],
        style: "faq-aside, yellow-underline",
        blocks: ["accordion-divider"],
        defaultContent: [
          "main div.title.cmp-title--underline h1",
          "main div.image img",
          "main div.image ~ div.text",
          "main div.container.responsivegrid + div.container.responsivegrid div.title h3",
          "main div.container.responsivegrid + div.container.responsivegrid div.text"
        ]
      }
    ]
  };
  var parsers = {
    "accordion-divider": parse
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
  function addSectionMetadata(main, document2) {
    const [section] = PAGE_TEMPLATE.sections;
    if (PAGE_TEMPLATE.sections.length !== 1 || !section.style) return;
    const metadata = WebImporter.Blocks.createBlock(document2, {
      name: "Section Metadata",
      cells: { style: section.style }
    });
    main.append(metadata);
  }
  var import_faqs_default = {
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
      addSectionMetadata(main, document2);
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
  return __toCommonJS(import_faqs_exports);
})();
