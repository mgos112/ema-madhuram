const LABELS = {
  carousel: 'Carousel',
  controls: 'Carousel Slide Controls',
  prev: 'Previous Slide',
  next: 'Next Slide',
  show: 'Show Slide',
  of: 'of',
};

function isEmptyCell(cell) {
  return !cell.textContent.trim() && !cell.querySelector('picture, img, video, iframe');
}

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-slide').forEach((slide, idx) => {
    slide.setAttribute('aria-hidden', idx !== slideIndex);
    slide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-slide-indicator button').forEach((button, idx) => {
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  let realIndex = slideIndex;
  if (slideIndex < 0) realIndex = slides.length - 1;
  if (slideIndex >= slides.length) realIndex = 0;
  const activeSlide = slides[realIndex];

  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
  updateActiveSlide(block, realIndex);
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-slide-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });

  const current = () => parseInt(block.dataset.activeSlide || '0', 10);
  block.querySelector('.slide-prev')?.addEventListener('click', () => showSlide(block, current() - 1));
  block.querySelector('.slide-next')?.addEventListener('click', () => showSlide(block, current() + 1));

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showSlide(block, current() - 1);
    if (e.key === 'ArrowRight') showSlide(block, current() + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => observer.observe(slide));
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-slide');

  const cells = [...row.querySelectorAll(':scope > div')].filter((cell) => !isEmptyCell(cell));
  // the image cell is the first cell holding a picture; fall back to the first cell
  const imageCell = cells.find((cell) => cell.querySelector('picture, img')) || null;
  if (imageCell) {
    imageCell.classList.add('carousel-slide-image');
    slide.append(imageCell);
  }
  const contentCells = cells.filter((cell) => cell !== imageCell);
  if (contentCells.length) {
    const content = contentCells.shift();
    contentCells.forEach((extra) => content.append(...extra.childNodes));
    content.classList.add('carousel-slide-content');
    slide.append(content);
  }

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);

  return slide;
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.id = `carousel-${carouselId}`;

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => [...row.children].some((cell) => !isEmptyCell(cell)));
  // hero-img always shows the controls, even with one slide
  const showControls = rows.length > 1 || block.classList.contains('hero-img');

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', LABELS.carousel);
  block.setAttribute('tabindex', '0');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let indicators;
  let controlsBar;
  if (showControls && rows.length) {
    controlsBar = document.createElement('div');
    controlsBar.classList.add('carousel-controls');

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', LABELS.controls);
    indicators = document.createElement('ol');
    indicators.classList.add('carousel-slide-indicators');
    nav.append(indicators);

    const buttons = document.createElement('div');
    buttons.classList.add('carousel-navigation-buttons');
    buttons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${LABELS.prev}"></button>
      <button type="button" class="slide-next" aria-label="${LABELS.next}"></button>
    `;

    controlsBar.append(nav, buttons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));
    if (indicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${LABELS.show} ${idx + 1} ${LABELS.of} ${rows.length}"></button>`;
      indicators.append(indicator);
    }
  });

  block.textContent = '';
  container.append(slidesWrapper);
  block.append(container);
  if (controlsBar) block.append(controlsBar);

  if (!rows.length) return;
  updateActiveSlide(block, 0);
  if (controlsBar) bindEvents(block);
}
