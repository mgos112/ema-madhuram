/*
 * Accordion Block
 * One row per item: cell 1 is the label (question), cell 2 the body (answer).
 * Options (class tokens): divider.
 */

/* Unwrap a label cell that holds a single paragraph so the summary stays inline. */
function labelNodes(cell) {
  const only = cell.children.length === 1 ? cell.firstElementChild : null;
  if (only && only.tagName === 'P' && only.textContent.trim() === cell.textContent.trim()) {
    return [...only.childNodes];
  }
  return [...cell.childNodes];
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const [label, bodyCell] = cells;

    // A row without a label has nothing to toggle: drop it.
    if (!label || !label.textContent.trim()) {
      row.remove();
      return;
    }

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...labelNodes(label));

    const body = bodyCell || document.createElement('div');
    body.className = 'accordion-item-body';
    // Authors may add extra cells: keep their content in the body.
    cells.slice(2).forEach((extra) => body.append(...extra.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
