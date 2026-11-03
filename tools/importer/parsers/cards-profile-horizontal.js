/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the cards profile horizontal variant (wknd.site article author byline).
 * Emits a `Cards (Profile, Horizontal)` block → `class="cards profile horizontal"`.
 *
 * Source: the byline experience fragment (`.cmp-byline` + icon-only button list).
 * One row (Cards convention): [ avatar | h3 name, p occupations, ul of social links ]
 */
const NETWORKS = ['facebook', 'twitter', 'instagram'];

/** Social network label from text, aria-label, icon class or href (most links are href="#"). */
function socialLabel(link) {
  const text = (link.querySelector('.cmp-button__text') || {}).textContent;
  if (text && text.trim()) return text.trim();
  const icon = link.querySelector('[class*="cmp-button__icon--"]');
  const iconName = icon && (icon.className.match(/cmp-button__icon--([a-z]+)/) || [])[1];
  const haystack = `${link.getAttribute('aria-label') || ''} ${iconName || ''} ${link.getAttribute('href') || ''}`.toLowerCase();
  const network = NETWORKS.find((n) => haystack.includes(n) || (n === 'instagram' && haystack.includes('insta')));
  if (network) return network.charAt(0).toUpperCase() + network.slice(1);
  return (link.getAttribute('aria-label') || link.textContent || '').trim();
}

export default function parse(element, { document }) {
  const imageCell = [];
  const srcImg = element.querySelector('.cmp-byline__image img') || element.querySelector('img');
  if (srcImg && srcImg.getAttribute('src')) {
    const img = document.createElement('img');
    img.src = srcImg.getAttribute('src');
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const bodyCell = [];
  const name = element.querySelector('.cmp-byline__name') || element.querySelector('h1, h2, h3, h4, h5, h6');
  if (name && name.textContent.trim()) {
    const h3 = document.createElement('h3');
    h3.textContent = name.textContent.trim();
    bodyCell.push(h3);
  }

  const role = element.querySelector('.cmp-byline__occupations');
  if (role && role.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = role.textContent.trim();
    bodyCell.push(p);
  }

  const ul = document.createElement('ul');
  element.querySelectorAll('a.cmp-button[href], .cmp-buildingblock--btn-list a[href]').forEach((link) => {
    const label = socialLabel(link);
    if (!label) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    a.textContent = label;
    li.append(a);
    ul.append(li);
  });
  if (ul.children.length) bodyCell.push(ul);

  if (!imageCell.length && !bodyCell.length) {
    element.remove();
    return;
  }

  const cells = [[imageCell.length ? imageCell : '', bodyCell.length ? bodyCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (Profile, Horizontal)', cells });
  element.replaceWith(block);
}
