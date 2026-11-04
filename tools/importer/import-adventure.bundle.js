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

  // tools/importer/import-adventure.js
  var import_adventure_exports = {};
  __export(import_adventure_exports, {
    default: () => import_adventure_default
  });

  // tools/importer/parsers/breadcrumb.js
  function toPath(href) {
    try {
      const url = new URL(href, "https://wknd.site");
      return url.pathname.replace(/\.html?$/, "");
    } catch (e) {
      return href;
    }
  }
  function parse(element, { document: document2 }) {
    const ol = document2.createElement("ol");
    element.querySelectorAll(".cmp-breadcrumb__item").forEach((item) => {
      const text = item.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const li = document2.createElement("li");
      const link = item.querySelector("a[href]");
      if (link && !item.classList.contains("cmp-breadcrumb__item--active")) {
        const a = document2.createElement("a");
        a.href = toPath(link.getAttribute("href"));
        a.textContent = text;
        li.append(a);
      } else {
        li.textContent = text;
      }
      ol.append(li);
    });
    if (!ol.children.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Breadcrumb", cells: [[ol]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-hero-img.js
  var CONTENT_TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE"];
  function bestSrc(img) {
    var _a;
    const srcset = (img.getAttribute("srcset") || img.getAttribute("data-srcset") || "").split(",").map((entry) => {
      const [url, size] = entry.trim().split(/\s+/);
      return { url, size: parseFloat(size) || 0 };
    }).filter((entry) => entry.url && !entry.url.startsWith("data:"));
    if (srcset.length) {
      srcset.sort((a, b) => b.size - a.size);
      return srcset[0].url;
    }
    const src = img.getAttribute("src") || "";
    if (src && !src.startsWith("data:")) return src;
    const lazy = img.getAttribute("data-cmp-src") || ((_a = img.closest("[data-cmp-src]")) == null ? void 0 : _a.getAttribute("data-cmp-src"));
    return lazy ? lazy.replace("{.width}", "") : "";
  }
  function collectContent(node, out) {
    [...node.children].forEach((child) => {
      if (CONTENT_TAGS.includes(child.tagName)) {
        if (child.textContent.trim()) out.push(child);
      } else if (child.tagName === "A") {
        if (child.textContent.trim() && child.getAttribute("href")) {
          const p = child.ownerDocument.createElement("p");
          p.append(child);
          out.push(p);
        }
      } else {
        collectContent(child, out);
      }
    });
  }
  function parse2(element, { document: document2 }) {
    const cells = [];
    const root = element.querySelector(".cmp-carousel");
    const items = [...element.querySelectorAll(".cmp-carousel__item")].filter((item) => item.closest(".cmp-carousel") === root);
    items.forEach((item) => {
      const srcImg = item.querySelector("img");
      const src = srcImg ? bestSrc(srcImg) : "";
      if (!src) return;
      const img = document2.createElement("img");
      img.src = src;
      img.alt = srcImg.getAttribute("alt") || "";
      const textItem = item.cloneNode(true);
      textItem.querySelectorAll("img, picture, .cmp-image, .image, meta").forEach((el) => el.remove());
      const textCell = [];
      collectContent(textItem, textCell);
      cells.push(textCell.length ? [img, textCell] : [img]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Carousel (Hero Img)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-spec.js
  function cleanText(node) {
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function parse3(element, { document: document2 }) {
    const cells = [];
    element.querySelectorAll(".cmp-contentfragment__element").forEach((item) => {
      const label = cleanText(item.querySelector("dt"));
      const value = cleanText(item.querySelector("dd"));
      if (!label || !value) return;
      cells.push([label, value]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Columns (Spec)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-adventure.js
  var BLOCK_TAGS = ["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "TABLE"];
  function bestSrc2(img) {
    var _a;
    const srcset = (img.getAttribute("srcset") || img.getAttribute("data-srcset") || "").split(",").map((entry) => {
      const [url, size] = entry.trim().split(/\s+/);
      return { url, size: parseFloat(size) || 0 };
    }).filter((entry) => entry.url && !entry.url.startsWith("data:"));
    if (srcset.length) {
      srcset.sort((a, b) => b.size - a.size);
      return srcset[0].url;
    }
    const src = img.getAttribute("src") || "";
    if (src && !src.startsWith("data:")) return src;
    const lazy = img.getAttribute("data-cmp-src") || ((_a = img.closest("[data-cmp-src]")) == null ? void 0 : _a.getAttribute("data-cmp-src"));
    return lazy ? lazy.replace("{.width}", "") : "";
  }
  function makeImage(srcImg, document2) {
    const src = bestSrc2(srcImg);
    if (!src) return null;
    const img = document2.createElement("img");
    img.src = src;
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function hasText(node) {
    return node.textContent.trim().length > 0;
  }
  function collectContent2(node, out, document2) {
    [...node.children].forEach((child) => {
      const tag = child.tagName;
      if (BLOCK_TAGS.includes(tag)) {
        child.querySelectorAll("img").forEach((srcImg) => {
          const img = makeImage(srcImg, document2);
          if (img) srcImg.replaceWith(img);
          else srcImg.remove();
        });
        child.querySelectorAll("picture source, meta").forEach((el) => el.remove());
        const keepImageParagraph = tag === "P" && child.querySelector("img");
        if (hasText(child) || keepImageParagraph) out.push(child);
      } else if (tag === "IMG") {
        const img = makeImage(child, document2);
        if (img) out.push(img);
      } else if (tag === "A") {
        if (hasText(child) && child.getAttribute("href")) {
          const p = document2.createElement("p");
          p.append(child);
          out.push(p);
        }
      } else if (tag !== "SCRIPT" && tag !== "STYLE" && tag !== "BUTTON") {
        collectContent2(child, out, document2);
      }
    });
  }
  function findPanel(tab, index, panels) {
    const controls = tab.getAttribute("aria-controls");
    let panel = controls && panels.find((p) => p.id === controls);
    if (!panel && tab.id) {
      panel = panels.find((p) => p.getAttribute("aria-labelledby") === tab.id) || panels.find((p) => p.id && p.id === tab.id.replace(/-tab$/, "-tabpanel"));
    }
    return panel || panels[index] || null;
  }
  function parse4(element, { document: document2 }) {
    const root = element.querySelector(".cmp-tabs") || element;
    const own = (el) => el.closest(".cmp-tabs") === root;
    const tabs = [...root.querySelectorAll(".cmp-tabs__tab")].filter(own);
    const panels = [...root.querySelectorAll(".cmp-tabs__tabpanel")].filter(own);
    const cells = [];
    tabs.forEach((tab, index) => {
      const label = tab.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      const content = [];
      const panel = findPanel(tab, index, panels);
      if (panel) {
        const clone = panel.cloneNode(true);
        clone.querySelectorAll(".cmp-contentfragment__title, article.cmp-contentfragment > h3").forEach((el) => el.remove());
        collectContent2(clone, content, document2);
      }
      cells.push([label, content.length ? content : ""]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Tabs (Adventure)", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      element.querySelectorAll("main div.sharing").forEach((sharing) => {
        if (sharing.textContent.trim()) return;
        const title = sharing.previousElementSibling;
        if (title && title.matches("div.title") && title.querySelector("h5")) title.remove();
      });
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

  // tools/importer/transformers/wknd-page-metadata.js
  var FIELDS = [
    ["activity", ".cmp-contentfragment__element--activity .cmp-contentfragment__element-value"]
  ];
  function transform3(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const doc = element.ownerDocument || document;
    FIELDS.forEach(([name, selector]) => {
      var _a;
      const value = (((_a = doc.querySelector(selector)) == null ? void 0 : _a.textContent) || "").replace(/\s+/g, " ").trim();
      if (!value || doc.head.querySelector(`meta[data-excat-metadata][name="${name}"]`)) return;
      const meta = doc.createElement("meta");
      meta.setAttribute("name", name);
      meta.setAttribute("content", value);
      meta.setAttribute("data-excat-metadata", "");
      doc.head.append(meta);
    });
  }

  // tools/importer/import-adventure.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "breadcrumb": parse,
    "carousel-hero-img": parse2,
    "columns-spec": parse3,
    "tabs-adventure": parse4
  };
  var transformers = [transform3, transform, transform2];
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
  function createPageMetadata(main, document2) {
    const meta = WebImporter.Blocks.getMetadata(document2) || {};
    document2.querySelectorAll("head meta[data-excat-metadata][name]").forEach((tag) => {
      const name = tag.getAttribute("name");
      const label = name.charAt(0).toUpperCase() + name.slice(1);
      if (tag.getAttribute("content")) meta[label] = tag.getAttribute("content");
    });
    if (Object.keys(meta).length) main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
  }
  var import_adventure_default = {
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
      createPageMetadata(main, document2);
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
  return __toCommonJS(import_adventure_exports);
})();
