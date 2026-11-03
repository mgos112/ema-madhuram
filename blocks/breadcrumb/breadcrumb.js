/**
 * Breadcrumb: an authored list of links ending with the current page.
 * Accepts a list (ol/ul) or plain links/paragraphs; the last item without a link
 * (or the last item) is marked as the current page.
 */
function collectItems(block) {
  const list = block.querySelector('ol, ul');
  if (list) return [...list.children].map((li) => li.childNodes);
  const items = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const parts = cell.querySelectorAll(':scope > p');
    if (parts.length) parts.forEach((p) => items.push(p.childNodes));
    else if (cell.textContent.trim()) items.push(cell.childNodes);
  });
  return items;
}

export default function decorate(block) {
  const items = collectItems(block)
    .map((nodes) => [...nodes])
    .filter((nodes) => nodes.some((n) => n.textContent.trim()));

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  items.forEach((nodes, i) => {
    const li = document.createElement('li');
    li.append(...nodes);
    if (i === items.length - 1) {
      const link = li.querySelector('a');
      if (link) link.setAttribute('aria-current', 'page');
      else li.setAttribute('aria-current', 'page');
    }
    ol.append(li);
  });
  nav.append(ol);
  block.replaceChildren(nav);
}
