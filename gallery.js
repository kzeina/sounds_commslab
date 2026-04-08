function initGallery(slider) {
  const track  = slider.querySelector('.gallery-track');
  const prev   = slider.querySelector('.gallery-prev');
  const next   = slider.querySelector('.gallery-next');
  const slides = Array.from(track.querySelectorAll('.gallery-slide, .gallery-slide-placeholder'));
  const total  = slides.length;
  let index    = 0;

  function update() {
    // Track moves by exactly one slide width each step.
    const slideWidth = slides[0].offsetWidth;
    track.style.transform = `translateX(${-index * slideWidth}px)`;
    prev.style.visibility = index === 0           ? 'hidden' : 'visible';
    next.style.visibility = index === total - 1   ? 'hidden' : 'visible';
  }

  prev.addEventListener('click', () => { if (index > 0)           { index--; update(); } });
  next.addEventListener('click', () => { if (index < total - 1)   { index++; update(); } });

  update();
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize every gallery instance independently per page.
  document.querySelectorAll('.gallery-slider').forEach(initGallery);
});
