/* Seven-second ping-pong carousel with accessible manual controls. */
(() => {
  const root = document.getElementById('hero-highlights');
  const viewport = document.getElementById('hero-carousel-viewport');
  if (!root || !viewport) return;
  const slides = Array.from(viewport.querySelectorAll('.hero-slide'));
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const counter = document.getElementById('hero-carousel-counter');
  const rotationButton = document.getElementById('hero-rotation-btn');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let direction = 1;
  let timer;
  let userPaused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  let touching = false;
  let visible = true;

  function mayRotate() {
    return slides.length > 1 && !userPaused && !hovered && !focused &&
      !touching && visible && !document.hidden;
  }

  function schedule() {
    window.clearTimeout(timer);
    const running = mayRotate();
    root.dataset.rotation = running ? 'running' : 'paused';
    viewport.setAttribute('aria-live', running ? 'off' : 'polite');
    counter?.setAttribute('aria-live', running ? 'off' : 'polite');
    if (running) timer = window.setTimeout(() => {
      if (current === slides.length - 1) direction = -1;
      if (current === 0) direction = 1;
      select(current + direction, true);
    }, 7000);
  }

  function select(index, automatic = false) {
    const next = (index + slides.length) % slides.length;
    const movement = automatic ? direction : (index >= current ? 1 : -1);
    if (!automatic) direction = movement;
    slides.forEach((slide, i) => {
      const active = i === next;
      slide.classList.toggle('hidden', !active);
      slide.classList.toggle('flex', active);
      slide.classList.remove('pi-slide-forward', 'pi-slide-back');
      slide.hidden = !active;
      slide.toggleAttribute('inert', !active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    if (next !== current && !reducedMotion.matches) {
      slides[next].classList.add(movement > 0 ? 'pi-slide-forward' : 'pi-slide-back');
    }
    current = next;
    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      ['bg-navy-dark', 'text-white', 'border-navy-dark'].forEach(c => tab.classList.toggle(c, active));
      ['bg-surface-pure', 'text-navy-dark', 'border-navy-dark/20'].forEach(c => tab.classList.toggle(c, !active));
    });
    if (counter) counter.textContent = `${current + 1}/${slides.length}`;
    schedule();
  }

  window.goToSlide = index => select(index);
  window.nextSlide = () => select(current + 1);
  window.prevSlide = () => select(current - 1);
  window.handleCarouselKey = event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); window.nextSlide(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); window.prevSlide(); }
  };
  root.querySelector('[role="tablist"]')?.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
    select(index);
    tabs[current].focus();
  });

  function updateRotationButton() {
    if (!rotationButton) return;
    rotationButton.textContent = userPaused ? 'Reproduzir slides' : 'Pausar slides';
    rotationButton.setAttribute('aria-label', userPaused ? 'Reproduzir slides automaticamente a cada 7 segundos' : 'Pausar rotação automática dos slides');
  }
  rotationButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    updateRotationButton();
    schedule();
  });
  viewport.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover: hover)').matches) { hovered = true; schedule(); }
  });
  viewport.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', event => {
    if (event.target !== rotationButton) { focused = true; schedule(); }
  });
  root.addEventListener('focusout', () => {
    window.setTimeout(() => {
      focused = root.contains(document.activeElement) && document.activeElement !== rotationButton;
      schedule();
    }, 0);
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) userPaused = true;
    updateRotationButton();
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
      schedule();
    }, {threshold: [0, 0.2]}).observe(viewport);
  }
  let touchX = 0;
  let touchY = 0;
  viewport.addEventListener('touchstart', event => {
    touchX = event.changedTouches[0].clientX;
    touchY = event.changedTouches[0].clientY;
    touching = true;
    schedule();
  }, {passive: true});
  viewport.addEventListener('touchend', event => {
    const dx = event.changedTouches[0].clientX - touchX;
    const dy = event.changedTouches[0].clientY - touchY;
    touching = false;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) select(current + (dx < 0 ? 1 : -1));
    else schedule();
  }, {passive: true});
  viewport.addEventListener('touchcancel', () => { touching = false; schedule(); }, {passive: true});
  updateRotationButton();
  select(0, true);
})();
