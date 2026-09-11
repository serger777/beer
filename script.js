document.addEventListener('DOMContentLoaded', () => {
    // Loader logic
    const loader = document.getElementById('loader');
    const loaderProgress = document.getElementById('loaderProgress');
    const heroVideos = document.querySelectorAll('.hero__video');

    let videosLoaded = 0;
    const totalVideos = heroVideos.length;

    const updateProgress = () => {
        const progress = (videosLoaded / totalVideos) * 100;
        if (loaderProgress) {
            loaderProgress.style.width = `${progress}%`;
        }

        if (videosLoaded === totalVideos) {
            setTimeout(() => {
                if (loader) {
                    loader.classList.add('loader--hidden');
                }
            }, 300);
        }
    };

    heroVideos.forEach(video => {
        // Track loading progress
        video.addEventListener('loadeddata', () => {
            videosLoaded++;
            updateProgress();
        });

        // Fallback if video fails to load
        video.addEventListener('error', () => {
            videosLoaded++;
            updateProgress();
        });

        // Switch to loop video when open video ends
        video.addEventListener('ended', () => {
            const loopSrc = video.getAttribute('data-loop');
            if (loopSrc) {
                video.src = loopSrc;
                video.loop = true;
                video.play();
            }
        });
    });

    // Fallback: hide loader after 5 seconds if videos don't load
    setTimeout(() => {
        if (loader && !loader.classList.contains('loader--hidden')) {
            loader.classList.add('loader--hidden');
        }
    }, 5000);

    const header = document.querySelector('.header');
    if (!header) return;

    const SCROLL_THRESHOLD = 160;
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        // Добавляем фон при скролле
        header.classList.toggle('header--scrolled', currentScrollY > SCROLL_THRESHOLD);

        // Скрываем хедер при скролле вниз, показываем при скролле вверх
        if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
            // Скролл вниз
            header.classList.add('header--hidden');
        } else {
            // Скролл вверх
            header.classList.remove('header--hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    const requestTick = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    };

    updateHeader();
    window.addEventListener('scroll', requestTick, { passive: true });

    // Mobile burger menu
    const burger = document.querySelector('.header__burger');
    const mobileMenu = document.querySelector('.header__mobile-menu');

    if (burger && mobileMenu) {
        burger.addEventListener('click', () => {
            mobileMenu.classList.toggle('header__mobile-menu--open');
            burger.setAttribute('aria-expanded', mobileMenu.classList.contains('header__mobile-menu--open'));
        });

        // Close menu when clicking on links
        const mobileLinks = document.querySelectorAll('.header__mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('header__mobile-menu--open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const tabs = document.querySelectorAll('.about__card');
    const panels = document.querySelectorAll('.about__panel');
    const timeline = document.querySelector('.timeline');

    if (tabs.length && panels.length) {
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                if (tab.dataset.pos === 'center') return;

                const centerTab = Array.from(tabs).find((t) => t.dataset.pos === 'center');
                const clickedPos = tab.dataset.pos;

                tab.dataset.pos = 'center';
                if (centerTab) centerTab.dataset.pos = clickedPos;

                panels.forEach((p) => p.classList.toggle('about__panel--active', p.dataset.panel === tab.dataset.tab));
                if (timeline) timeline.classList.toggle('timeline--visible', tab.dataset.tab === 'history');
            });
        });
    }

    const lineGroups = document.querySelectorAll('.product__line-group');
    const lineBadges = document.querySelectorAll('.product__line-badge');
    const prevBtn = document.querySelector('.product__badge-btn--prev');
    const nextBtn = document.querySelector('.product__badge-btn--next');
    const lineDotLeftBtns = document.querySelectorAll('.product__line-dot--left');
    const lineDotRightBtns = document.querySelectorAll('.product__line-dot--right');

    if (lineGroups.length) {
        let activeLineIndex = Array.from(lineGroups).findIndex((g) => g.classList.contains('product__line-group--active'));
        if (activeLineIndex === -1) activeLineIndex = 0;

        const getSlidesForLine = (lineIndex) => lineGroups[lineIndex].querySelectorAll('.product__slide');

        const showSlide = (lineIndex, slideIndex) => {
            const slides = getSlidesForLine(lineIndex);
            const total = slides.length;
            const currentActiveIndex = Array.from(slides).findIndex(s => s.classList.contains('product__slide--active'));
            const activeSlideIndex = (slideIndex + total) % total;

            if (currentActiveIndex !== -1 && currentActiveIndex !== activeSlideIndex) {
                const currentSlide = slides[currentActiveIndex];
                const nextSlide = slides[activeSlideIndex];
                const currentLeft = currentSlide.querySelector('.product_left');
                const currentRight = currentSlide.querySelector('.product_right');
                const nextLeft = nextSlide.querySelector('.product_left');
                const nextRight = nextSlide.querySelector('.product_right');

                if (currentLeft && currentRight && nextLeft && nextRight) {
                    // Determine navigation direction
                    const isForward = (slideIndex - currentActiveIndex + total) % total < total / 2;

                    // Disable slide transition (it has 0.4s opacity transition that conflicts)
                    currentSlide.style.transition = 'none';
                    nextSlide.style.transition = 'none';

                    // Disable transitions temporarily for instant positioning
                    nextLeft.style.transition = 'none';
                    nextRight.style.transition = 'none';

                    // Set initial position for next slide elements (off-screen)
                    nextLeft.style.transform = 'translateX(-100%)';
                    nextLeft.style.opacity = '1';

                    if (isForward) {
                        nextRight.style.transform = 'translateX(100%)';
                    } else {
                        nextRight.style.transform = 'translateX(-100%)';
                    }
                    nextRight.style.opacity = '1';

                    // Activate next slide (now positioned off-screen)
                    nextSlide.classList.add('product__slide--active');

                    // Force reflow
                    void nextSlide.offsetHeight;

                    // Re-enable transitions
                    nextLeft.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
                    nextRight.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
                    currentLeft.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';
                    currentRight.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';

                    // Start animation using requestAnimationFrame
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Animate current slide out
                            currentLeft.style.transform = 'translateX(-100%)';
                            currentLeft.style.opacity = '0';
                            if (isForward) {
                                currentRight.style.transform = 'translateX(-100%)';
                            } else {
                                currentRight.style.transform = 'translateX(100%)';
                            }
                            currentRight.style.opacity = '0';

                            // Animate next slide in
                            nextLeft.style.transform = 'translateX(0)';
                            nextRight.style.transform = 'translateX(0)';
                        });
                    });

                    // Clean up after animation completes
                    setTimeout(() => {
                        currentSlide.classList.remove('product__slide--active');
                        // Reset inline styles
                        currentSlide.style.transition = '';
                        nextSlide.style.transition = '';
                        currentLeft.style.transition = '';
                        currentLeft.style.transform = '';
                        currentLeft.style.opacity = '';
                        currentRight.style.transition = '';
                        currentRight.style.transform = '';
                        currentRight.style.opacity = '';
                    }, 1100);
                }
            } else {
                // No animation needed, just toggle
                slides.forEach((slide, i) => {
                    slide.classList.toggle('product__slide--active', i === activeSlideIndex);
                });
            }

            return activeSlideIndex;
        };

        const showLine = (lineIndex) => {
            const total = lineGroups.length;
            activeLineIndex = (lineIndex + total) % total;
            lineGroups.forEach((group, i) => {
                group.classList.toggle('product__line-group--active', i === activeLineIndex);
            });
            lineBadges.forEach((badge) => {
                const badgeLine = parseInt(badge.dataset.lineBadge, 10) - 1;
                badge.classList.toggle('product__line-badge--active', badgeLine === activeLineIndex);
            });
        };

        const activeSlideIndexOf = (lineIndex) => {
            const slides = Array.from(getSlidesForLine(lineIndex));
            const idx = slides.findIndex((s) => s.classList.contains('product__slide--active'));
            return idx === -1 ? 0 : idx;
        };

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                const current = activeSlideIndexOf(activeLineIndex);
                showSlide(activeLineIndex, current - 1);
            });
            nextBtn.addEventListener('click', () => {
                const current = activeSlideIndexOf(activeLineIndex);
                showSlide(activeLineIndex, current + 1);
            });
        }

        lineDotLeftBtns.forEach((btn) => btn.addEventListener('click', () => showLine(activeLineIndex - 1)));
        lineDotRightBtns.forEach((btn) => btn.addEventListener('click', () => showLine(activeLineIndex + 1)));
    }

    const brewerSlides = document.querySelectorAll('.about__brewers-slide');
    const brewerPrevBtn = document.querySelector('.about__brewers-arrow--prev');
    const brewerNextBtn = document.querySelector('.about__brewers-arrow--next');

    if (brewerSlides.length && brewerPrevBtn && brewerNextBtn) {
        const showBrewerSlide = (index) => {
            const total = brewerSlides.length;
            const activeIndex = (index + total) % total;
            brewerSlides.forEach((slide, i) => {
                slide.classList.toggle('about__brewers-slide--active', i === activeIndex);
            });
        };

        const activeBrewerIndex = () => {
            const idx = Array.from(brewerSlides).findIndex((s) => s.classList.contains('about__brewers-slide--active'));
            return idx === -1 ? 0 : idx;
        };

        brewerPrevBtn.addEventListener('click', () => showBrewerSlide(activeBrewerIndex() - 1));
        brewerNextBtn.addEventListener('click', () => showBrewerSlide(activeBrewerIndex() + 1));
    }

    const timelineItems = document.querySelectorAll('.timeline__item');
    const timelineTexts = document.querySelectorAll('.about__timeline-text');

    if (timelineItems.length && timelineTexts.length) {
        timelineItems.forEach((item) => {
            item.addEventListener('click', () => {
                const year = item.dataset.year;

                timelineItems.forEach((i) => {
                    const isActive = i === item;
                    i.classList.toggle('timeline__item--active', isActive);
                    const dotImg = i.querySelector('.timeline__dot');
                    if (dotImg) {
                        dotImg.src = isActive
                            ? 'images/about/timeline-dot-active.png'
                            : 'images/about/timeline-dot.png';
                    }
                });

                timelineTexts.forEach((t) => t.classList.toggle('about__timeline-text--active', t.dataset.year === year));
            });
        });
    }
});
