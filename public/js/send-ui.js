/* global window, document */
(function () {
  const canvas = document.getElementById('air-particles');
  const slidesRoot = document.getElementById('slidesRoot');
  if (!canvas || !slidesRoot) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const particleCount = 50;
  const particles = [];

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function seedParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.6 + Math.random() * 0.8,
        v: 0.05 + Math.random() * 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.y += p.v;
      if (p.y > window.innerHeight + 5) {
        p.y = -5;
        p.x = Math.random() * window.innerWidth;
      }
    });

    window.requestAnimationFrame(draw);
  }

  resize();
  seedParticles();
  draw();
  window.addEventListener('resize', () => {
    resize();
    seedParticles();
    slidesRoot.style.transform = `translate3d(0, -${activeIndex * 100}vh, 0)`;
  });

  const slides = Array.from(slidesRoot.querySelectorAll('.slide'));
  let activeIndex = 0;
  let isAnimating = false;
  const totalSlides = slides.length;
  const transitionDuration = 740;
  const inputLockDelay = 150;
  let lockTimeout = null;
  let wheelReleaseTimer = null;
  let wheelLock = false;
  let lastWheelTime = 0;
  const wheelIdleDelay = 200;
  let animatingUntil = 0;
  let touchStartY = null;
  let isInputFocused = false;

  function isFormField(el) {
    if (!el || !el.tagName) {
      return false;
    }
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  function setActiveSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });
  }

  function goToSlide(index) {
    if (isAnimating) {
      return;
    }
    const nextIndex = Math.max(0, Math.min(index, totalSlides - 1));
    if (nextIndex === activeIndex) {
      return;
    }
    isAnimating = true;
    animatingUntil = Date.now() + transitionDuration + inputLockDelay;
    activeIndex = nextIndex;
    setActiveSlide(activeIndex);
    slidesRoot.style.transform = `translate3d(0, -${activeIndex * 100}vh, 0)`;
    if (lockTimeout) {
      window.clearTimeout(lockTimeout);
    }
    lockTimeout = window.setTimeout(() => {
      isAnimating = false;
      requestWheelRelease();
    }, transitionDuration + inputLockDelay);
  }

  function requestWheelRelease() {
    if (!wheelLock) {
      return;
    }
    if (wheelReleaseTimer) {
      window.clearTimeout(wheelReleaseTimer);
    }
    const now = Date.now();
    const idleAt = lastWheelTime + wheelIdleDelay;
    const releaseAt = Math.max(animatingUntil, idleAt);
    if (!isAnimating && now >= releaseAt) {
      wheelLock = false;
      return;
    }
    wheelReleaseTimer = window.setTimeout(() => {
      requestWheelRelease();
    }, Math.max(releaseAt - now, 0));
  }

  function handleWheel(event) {
    event.preventDefault();
    if (isInputFocused) {
      return;
    }
    lastWheelTime = Date.now();
    if (wheelLock || isAnimating) {
      requestWheelRelease();
      return;
    }
    const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
    if (!direction) {
      return;
    }
    const nextIndex = Math.max(0, Math.min(activeIndex + direction, totalSlides - 1));
    if (nextIndex === activeIndex) {
      return;
    }
    wheelLock = true;
    goToSlide(nextIndex);
    requestWheelRelease();
  }

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', (event) => {
    if (isInputFocused) {
      touchStartY = null;
      return;
    }
    if (event.touches && event.touches.length) {
      touchStartY = event.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener('touchmove', (event) => {
    if (isInputFocused) {
      return;
    }
    event.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', (event) => {
    if (isInputFocused) {
      touchStartY = null;
      return;
    }
    if (isAnimating || touchStartY === null) {
      touchStartY = null;
      return;
    }
    const touch = event.changedTouches && event.changedTouches.length
      ? event.changedTouches[0]
      : null;
    if (!touch) {
      touchStartY = null;
      return;
    }
    const deltaY = touchStartY - touch.clientY;
    touchStartY = null;
    if (Math.abs(deltaY) < 30) {
      return;
    }
    if (deltaY > 0) {
      goToSlide(activeIndex + 1);
    } else {
      goToSlide(activeIndex - 1);
    }
  }, { passive: true });

  slidesRoot.style.transform = 'translate3d(0, 0, 0)';
  setActiveSlide(0);

  document.addEventListener('focusin', (event) => {
    if (isFormField(event.target)) {
      isInputFocused = true;
    }
  });
  document.addEventListener('focusout', () => {
    window.setTimeout(() => {
      isInputFocused = isFormField(document.activeElement);
    }, 0);
  });

  window.Slides = {
    goToSlide
  };
})();
