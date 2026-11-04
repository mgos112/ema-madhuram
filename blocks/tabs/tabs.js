import { toClassName } from '../../scripts/aem.js';

let tabsId = 0;

function selectTab(block, button, focus = false) {
  const tablist = block.querySelector('.tabs-list');
  tablist.querySelectorAll('[role=tab]').forEach((btn) => {
    const selected = btn === button;
    btn.setAttribute('aria-selected', selected);
    btn.setAttribute('tabindex', selected ? '0' : '-1');
  });
  block.querySelectorAll(':scope > [role=tabpanel]').forEach((panel) => {
    panel.setAttribute('aria-hidden', panel.id !== button.getAttribute('aria-controls'));
  });
  if (focus) button.focus();
}

export default function decorate(block) {
  tabsId += 1;
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const usedIds = new Set();
  const buttons = [];

  rows.forEach((row, i) => {
    const [labelCell, ...contentCells] = [...row.children];
    const labelText = labelCell.textContent.trim();
    // a row with neither label nor content is author noise
    if (!labelText && !contentCells.some((c) => c.textContent.trim() || c.querySelector('picture, img'))) {
      row.remove();
      return;
    }

    let id = `${tabsId}-${toClassName(labelText) || `tab-${i + 1}`}`;
    while (usedIds.has(id)) id = `${id}-${i + 1}`;
    usedIds.add(id);

    // panel: first content cell, extra cells merged in; created if missing
    const panel = contentCells.shift() || document.createElement('div');
    contentCells.forEach((extra) => {
      panel.append(...extra.childNodes);
      extra.remove();
    });
    panel.className = 'tabs-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.setAttribute('tabindex', '0');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    if (labelText) {
      const onlyPara = labelCell.children.length === 1 && labelCell.firstElementChild.tagName === 'P';
      button.innerHTML = onlyPara ? labelCell.firstElementChild.innerHTML : labelCell.innerHTML;
    } else {
      button.textContent = `Tab ${buttons.length + 1}`;
    }
    button.addEventListener('click', () => selectTab(block, button));
    tablist.append(button);
    buttons.push(button);

    // the panel replaces its row as a direct child of the block
    row.replaceWith(panel);
  });

  if (!buttons.length) return;

  tablist.addEventListener('keydown', (e) => {
    const idx = buttons.indexOf(document.activeElement);
    if (idx < 0) return;
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    else return;
    e.preventDefault();
    selectTab(block, buttons[next], true);
  });

  block.prepend(tablist);
  selectTab(block, buttons[0]);
}
