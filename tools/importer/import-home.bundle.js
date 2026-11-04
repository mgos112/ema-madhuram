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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero-img-boxed.js
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
  function toPath(href) {
    try {
      const url = new URL(href, "https://wknd.site");
      if (url.hostname !== "wknd.site" && url.hostname !== "www.wknd.site") return href;
      return `${url.pathname.replace(/\.html?$/, "")}${url.search}${url.hash}`;
    } catch (e) {
      return href;
    }
  }
  function normalize(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function descriptionParagraphs(desc, document2) {
    if (!desc) return [];
    const paras = [...desc.querySelectorAll("p")].filter((p2) => normalize(p2.textContent));
    if (paras.length) return paras;
    const text = normalize(desc.textContent);
    if (!text) return [];
    const p = document2.createElement("p");
    p.textContent = text;
    return [p];
  }
  function parse(element, { document: document2 }) {
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
      const content = [];
      const title = item.querySelector(".cmp-teaser__title");
      if (title && normalize(title.textContent)) {
        const level = /^H[1-6]$/.test(title.tagName) ? title.tagName.toLowerCase() : "h2";
        const heading = document2.createElement(level);
        heading.textContent = normalize(title.textContent);
        content.push(heading);
      }
      content.push(...descriptionParagraphs(item.querySelector(".cmp-teaser__description"), document2));
      item.querySelectorAll(".cmp-teaser__action-link").forEach((link) => {
        const text = normalize(link.textContent);
        const href = link.getAttribute("href");
        if (!text || !href) return;
        const a = document2.createElement("a");
        a.href = toPath(href);
        a.textContent = text;
        const strong = document2.createElement("strong");
        strong.append(a);
        const p = document2.createElement("p");
        p.append(strong);
        content.push(p);
      });
      cells.push([img, content]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Carousel (Hero Img, Boxed)", cells });
    element.replaceWith(block);
  }

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
  function parse2(element, { document: document2 }) {
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
  function toPath2(href) {
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
  function pagePath(params) {
    const url = params && params.originalURL;
    if (!url) return "";
    try {
      return new URL(url, "https://wknd.site").pathname.replace(/\.html?$/, "").replace(/\/$/, "");
    } catch (e) {
      return "";
    }
  }
  function parse3(element, { document: document2, params }) {
    const links = [...element.querySelectorAll("a[href]")].map((a) => toPath2(a.getAttribute("href"))).filter((p) => p && p.startsWith("/"));
    const unique = [...new Set(links)];
    const prefix = commonPrefix(unique);
    if (!prefix) {
      element.remove();
      return;
    }
    const page = pagePath(params);
    const config = page && page !== prefix ? `${prefix} | ${unique.length}` : prefix;
    const cells = [[config]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Dynamic)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-boxed.js
  function textParagraphs2(container, document2) {
    if (!container) return [];
    const paragraphs = [...container.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean);
    const texts = paragraphs.length ? paragraphs : [container.textContent.trim()].filter(Boolean);
    return texts.map((text) => {
      const p = document2.createElement("p");
      p.textContent = text;
      return p;
    });
  }
  function parse4(element, { document: document2 }) {
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
    textCell.push(...textParagraphs2(element.querySelector(".cmp-teaser__description"), document2));
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://wknd.site/us/en.html"
    ],
    "representativeUrl": "https://wknd.site/us/en.html",
    "description": "Home page: hero carousel with overlay content, featured article teaser, recent magazine articles, banner and adventures teasers",
    "blocks": [
      {
        "name": "carousel-hero-img-boxed",
        "instances": [
          "main div.carousel.panelcontainer"
        ]
      },
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
        "name": "hero-boxed",
        "instances": [
          "main div.teaser.cmp-teaser--hero:not(.carousel div)"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Hero carousel",
        "selector": [
          "main div.carousel.panelcontainer"
        ],
        "style": null,
        "blocks": [
          "carousel-hero-img-boxed"
        ],
        "defaultContent": []
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
        "name": "Recent Articles",
        "selector": [
          "main div.teaser.cmp-teaser--featured ~ div.title.cmp-title--underline"
        ],
        "style": "yellow-underline, primary-cta, custom-separator",
        "blocks": [
          "cards-dynamic"
        ],
        "defaultContent": [
          "main div.title.cmp-title--underline h2",
          "main div.button a"
        ]
      },
      {
        "id": "section-4",
        "name": "Next Adventures banner",
        "selector": [
          "main div.title.cmp-title--underline ~ div.title.cmp-title--underline"
        ],
        "style": "yellow-underline",
        "blocks": [
          "hero-boxed"
        ],
        "defaultContent": [
          "main div.title.cmp-title--underline h2"
        ]
      },
      {
        "id": "section-5",
        "name": "Where do you want to go?",
        "selector": [
          "main div.title:not(.cmp-title--underline)"
        ],
        "style": "primary-cta, custom-separator",
        "blocks": [
          "cards-dynamic"
        ],
        "defaultContent": [
          "main div.title h3",
          "main div.button a"
        ]
      }
    ]
  };
  var parsers = {
    "carousel-hero-img-boxed": parse,
    "columns-featured": parse2,
    "cards-dynamic": parse3,
    "hero-boxed": parse4
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
