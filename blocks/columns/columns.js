export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('featured')) {
    // featured teaser: mark the text panel and the label paragraph above the heading
    block.querySelectorAll(':scope > div > div:not(.columns-img-col)').forEach((col) => {
      col.classList.add('columns-featured-text');
      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
      const label = heading && heading.previousElementSibling;
      if (label && label.tagName === 'P' && !label.querySelector('a')) {
        label.classList.add('columns-featured-pretitle');
      }
    });
  }

  if (block.classList.contains('spec')) {
    // spec list: each row is label | value, rendered as a definition list
    const dl = document.createElement('dl');
    dl.className = 'columns-spec-list';
    [...block.children].forEach((row) => {
      const [labelCell, valueCell, ...extra] = [...row.children];
      const label = labelCell ? labelCell.textContent.trim() : '';
      const hasValue = [valueCell, ...extra].some((c) => c && c.textContent.trim());
      if (!label && !hasValue) return;
      const item = document.createElement('div');
      item.className = 'columns-spec-item';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      [valueCell, ...extra].filter(Boolean).forEach((cell, idx) => {
        if (idx && dd.textContent.trim()) dd.append(' ');
        const only = cell.children.length === 1 && cell.firstElementChild.tagName === 'P';
        dd.append(...(only ? cell.firstElementChild.childNodes : cell.childNodes));
      });
      item.append(dt, dd);
      dl.append(item);
    });
    block.replaceChildren(dl);
  }
}
