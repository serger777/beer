(() => {
  'use strict';

  function init(root) {
    if (root.dataset.productInitialized) return;
    root.dataset.productInitialized = 'true';

    const slides = root.querySelectorAll('.product__slide');
    const prevBtn = root.querySelector('[data-prev]');
    const nextBtn = root.querySelector('[data-next]');
    const track = root.querySelector('.product__track');
    const status = root.querySelector('[data-status]');

    let index = 0;
    let isAnimating = false;

    // Responsive scaling
    const resize = () => {
      const width = root.getBoundingClientRect().width;
      root.style.setProperty('--product-scale', String(width / 1440));
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    // Update ARIA attributes
    const updateAria = () => {
      prevBtn.setAttribute('aria-disabled', String(index === 0));
      nextBtn.setAttribute('aria-disabled', String(index === slides.length - 1));

      slides.forEach((slide, i) => {
        const isActive = i === index;
        slide.setAttribute('aria-hidden', String(!isActive));
        if (isActive) {
          slide.removeAttribute('inert');
        } else {
          slide.setAttribute('inert', '');
        }
      });

      const bottles = root.querySelectorAll('.product__bottle');
      bottles.forEach((bottle, i) => {
        bottle.setAttribute('aria-hidden', String(i !== index));
      });
    };

    // Navigate to slide
    function show(target) {
      target = Math.max(0, Math.min(slides.length - 1, target));
      if (target === index || isAnimating) return;

      const oldIndex = index;
      index = target;
      isAnimating = true;

      // Update data-slide attribute (triggers CSS animations)
      root.dataset.slide = String(index);

      // Update ARIA
      updateAria();

      // Announce to screen readers
      if (status) {
        const slideLabel = slides[index].getAttribute('aria-label');
        status.textContent = `${slideLabel}`;
      }

      // Wait for animation to complete
      const handler = (event) => {
        if (event.target === track && event.propertyName === 'transform') {
          isAnimating = false;
          track.removeEventListener('transitionend', handler);
        }
      };
      track.addEventListener('transitionend', handler);

      // Fallback timeout in case transitionend doesn't fire
      setTimeout(() => {
        isAnimating = false;
      }, 1600);
    }

    // Button listeners
    prevBtn.addEventListener('click', () => {
      if (index > 0) show(index - 1);
    });

    nextBtn.addEventListener('click', () => {
      if (index < slides.length - 1) show(index + 1);
    });

    // Keyboard navigation
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (event) => {
      const handlers = {
        ArrowLeft: () => index > 0 && show(index - 1),
        ArrowRight: () => index < slides.length - 1 && show(index + 1),
        Home: () => show(0),
        End: () => show(slides.length - 1)
      };

      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    });

    // Initialize ARIA
    updateAria();

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    root.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    root.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < swipeThreshold) return;

      if (diff > 0 && index < slides.length - 1) {
        // Swipe left - next
        show(index + 1);
      } else if (diff < 0 && index > 0) {
        // Swipe right - prev
        show(index - 1);
      }
    }
  }

  // Initialize all product carousels
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-product-carousel]').forEach(init);
    });
  } else {
    document.querySelectorAll('[data-product-carousel]').forEach(init);
  }
})();
