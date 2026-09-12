/* No imports/fetch: also runs when index.html is opened with file://. */
(() => {
  'use strict';
  function init(root) {
    if (root.dataset.brewInitialized) return;
    root.dataset.brewInitialized = 'true';
    const slides = [...root.querySelectorAll('.brew-block__slide')];
    const bottles = [...root.querySelectorAll('.brew-block__bottle')];
    const previous = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const status = root.querySelector('[data-status]');
    const track = root.querySelector('.brew-block__track');
    const art = root.querySelector('.brew-block__art');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let pointer = null;
    let settledTimer;

    function resize() {
      const width = root.getBoundingClientRect().width;
      root.style.setProperty('--brew-scale', String(width / 1440));
      root.style.setProperty('--brew-mobile-scale', String(Math.min(.625, Math.max(.44, width / 780))));
    }
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    function announce() {
      root.removeAttribute('aria-busy');
      status.textContent = `${index + 1} из ${slides.length}. ${slides[index].querySelector('h2').innerText.replace(/\s+/g, ' ')}`;
    }
    function show(target) {
      target = Math.max(0, Math.min(slides.length - 1, target));
      if (target === index) return;
      index = target;
      root.dataset.slide = String(index);
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== index));
        slide.inert = i !== index;
        bottles[i].setAttribute('aria-hidden', String(i !== index));
      });
      previous.setAttribute('aria-disabled', String(index === 0));
      next.setAttribute('aria-disabled', String(index === slides.length - 1));
      clearTimeout(settledTimer);
      root.setAttribute('aria-busy', 'true');
      // Rapid clicks reverse the CSS transition from its current position.
      // The timeout also covers tab suspension and zero-duration transitions.
      if (reducedMotion.matches) announce();
      else settledTimer = setTimeout(announce, 1600);
      root.dispatchEvent(new CustomEvent('brew:change', { bubbles: true, detail: { index } }));
    }
    track.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform') { clearTimeout(settledTimer); announce(); }
    });
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    root.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const targets = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1 };
      if (Object.hasOwn(targets, event.key)) { event.preventDefault(); show(targets[event.key]); }
    });
    art.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary || event.target.closest('button')) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      art.setPointerCapture(event.pointerId);
    });
    art.addEventListener('pointerup', event => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
    });
    art.addEventListener('pointercancel', () => { pointer = null; });
    art.addEventListener('lostpointercapture', () => { pointer = null; });
  }
  document.querySelectorAll('[data-brew-block]').forEach(init);
})();
