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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
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

  // tools/importer/parsers/cards-profile-horizontal.js
  var NETWORKS = ["facebook", "twitter", "instagram"];
  function socialLabel(link) {
    const text = (link.querySelector(".cmp-button__text") || {}).textContent;
    if (text && text.trim()) return text.trim();
    const icon = link.querySelector('[class*="cmp-button__icon--"]');
    const iconName = icon && (icon.className.match(/cmp-button__icon--([a-z]+)/) || [])[1];
    const haystack = `${link.getAttribute("aria-label") || ""} ${iconName || ""} ${link.getAttribute("href") || ""}`.toLowerCase();
    const network = NETWORKS.find((n) => haystack.includes(n) || n === "instagram" && haystack.includes("insta"));
    if (network) return network.charAt(0).toUpperCase() + network.slice(1);
    return (link.getAttribute("aria-label") || link.textContent || "").trim();
  }
  function parse2(element, { document: document2 }) {
    const imageCell = [];
    const srcImg = element.querySelector(".cmp-byline__image img") || element.querySelector("img");
    if (srcImg && srcImg.getAttribute("src")) {
      const img = document2.createElement("img");
      img.src = srcImg.getAttribute("src");
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const bodyCell = [];
    const name = element.querySelector(".cmp-byline__name") || element.querySelector("h1, h2, h3, h4, h5, h6");
    if (name && name.textContent.trim()) {
      const h3 = document2.createElement("h3");
      h3.textContent = name.textContent.trim();
      bodyCell.push(h3);
    }
    const role = element.querySelector(".cmp-byline__occupations");
    if (role && role.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = role.textContent.trim();
      bodyCell.push(p);
    }
    const ul = document2.createElement("ul");
    element.querySelectorAll("a.cmp-button[href], .cmp-buildingblock--btn-list a[href]").forEach((link) => {
      const label = socialLabel(link);
      if (!label) return;
      const li = document2.createElement("li");
      const a = document2.createElement("a");
      a.href = link.getAttribute("href");
      a.textContent = label;
      li.append(a);
      ul.append(li);
    });
    if (ul.children.length) bodyCell.push(ul);
    if (!imageCell.length && !bodyCell.length) {
      element.remove();
      return;
    }
    const cells = [[imageCell.length ? imageCell : "", bodyCell.length ? bodyCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Profile, Horizontal)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-button.js
  function toPath2(href) {
    try {
      return new URL(href, "https://wknd.site").pathname.replace(/\.html?$/, "");
    } catch (e) {
      return href;
    }
  }
  function pageFolder(ctx) {
    const canonical = ctx.document.querySelector('link[rel="canonical"], meta[property="og:url"]');
    const candidates = [
      ctx.params && ctx.params.originalURL,
      ctx.url,
      canonical && (canonical.getAttribute("href") || canonical.getAttribute("content"))
    ];
    for (const candidate of candidates) {
      try {
        const path = new URL(candidate).pathname;
        if (path.lastIndexOf("/") > 0) return path.substring(0, path.lastIndexOf("/"));
      } catch (e) {
      }
    }
    return "";
  }
  function hostedPdfPath(href, filename, ctx) {
    const file = filename || decodeURIComponent((href || "").split("/").pop().replace(/\.coredownload\.pdf$/i, ""));
    return `${pageFolder(ctx)}/${file}`;
  }
  function textOf(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function buildPdfRow(download, ctx) {
    const { document: document2 } = ctx;
    const filename = textOf(download.querySelector(".cmp-download__property--filename .cmp-download__property-content"));
    const titleLink = download.querySelector(".cmp-download__title-link, .cmp-download__title a");
    const action = download.querySelector(".cmp-download__action");
    const sourceLink = titleLink || action;
    const href = hostedPdfPath(sourceLink ? sourceLink.getAttribute("href") : "", filename, ctx);
    const cell = [];
    const titleText = textOf(download.querySelector(".cmp-download__title"));
    if (titleText) {
      const h3 = document2.createElement("h3");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = titleText;
      h3.append(a);
      cell.push(h3);
    }
    const description = download.querySelector(".cmp-download__description");
    if (description) {
      const texts = [...description.querySelectorAll("p")].map(textOf).filter(Boolean);
      (texts.length ? texts : [textOf(description)].filter(Boolean)).forEach((text) => {
        const p = document2.createElement("p");
        p.textContent = text;
        cell.push(p);
      });
    }
    const values = [...download.querySelectorAll(".cmp-download__property-content")].map(textOf).filter(Boolean);
    if (values.length) {
      const ul = document2.createElement("ul");
      values.forEach((value) => {
        const li = document2.createElement("li");
        li.textContent = value;
        ul.append(li);
      });
      cell.push(ul);
    }
    if (action) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = textOf(action.querySelector(".cmp-download__action-text")) || textOf(action);
      p.append(a);
      cell.push(p);
    }
    return cell.length ? [cell] : null;
  }
  function buildStoryRows(list, document2) {
    return [...list.querySelectorAll(".cmp-list__item")].map((item) => {
      const link = item.querySelector("a[href]");
      const title = textOf(item.querySelector(".cmp-list__item-title")) || textOf(link);
      if (!link || !title) return null;
      const cell = [];
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = toPath2(link.getAttribute("href"));
      a.textContent = title;
      p.append(a);
      cell.push(p);
      const date = textOf(item.querySelector(".cmp-list__item-date"));
      if (date) {
        const dp = document2.createElement("p");
        dp.textContent = date;
        cell.push(dp);
      }
      return [cell];
    }).filter(Boolean);
  }
  function parse3(element, { document: document2, url, params }) {
    const cells = [];
    const title = textOf(element.querySelector(".title .cmp-title__text"));
    if (title) {
      const h2 = document2.createElement("h2");
      h2.textContent = title;
      cells.push([h2]);
    }
    const download = element.querySelector(".cmp-download");
    const pdfRow = download ? buildPdfRow(download, { document: document2, url, params }) : null;
    if (pdfRow) cells.push(pdfRow);
    const list = element.querySelector(".cmp-list");
    const storyRows = list ? buildStoryRows(list, document2) : [];
    cells.push(...storyRows);
    if (!pdfRow && !storyRows.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards (Button)", cells });
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

  // tools/importer/import-magazine-article.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    breadcrumb: parse,
    "cards-profile-horizontal": parse2,
    "cards-button": parse3
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
  var import_magazine_article_default = {
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
  return __toCommonJS(import_magazine_article_exports);
})();
