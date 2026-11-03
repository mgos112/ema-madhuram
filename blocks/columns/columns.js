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
}
