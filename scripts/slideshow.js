/**
 * Slideshow Module
 * Injects and controls a simple, accessible slideshow
 * @module slideshow
 */

const SLIDES = [
  {
    image: 'assets/images/1.png',
    year: 'anjay',
    caption: 'mff paparazzi'
  },
  {
    image: 'assets/images/2.png',
    year: 'canon event',
    caption: 'im actually from UK btw'
  },
  {
    image: 'assets/images/3.png',
    year: 'new record',
    caption: 'rare moment dawg make it past 1 AM'
  },
  {
    image: 'assets/images/4.jpg',
    year: 'lol',
    caption: 'another canon event, iykyk lmao'
  },
  {
    image: 'assets/images/5.jpg',
    year: '',
    caption: 'Thanks for always accepting and stay connected with me as a whole kyl, you add pretty much color to my life.'
  }
];

let current = 0;
let slideshowEl, indicatorsEl, prevBtn, nextBtn;

export function initSlideshow() {
  slideshowEl = document.getElementById('slideshow');
  indicatorsEl = document.getElementById('slide-indicators');
  prevBtn = document.getElementById('prev-slide');
  nextBtn = document.getElementById('next-slide');
  
  if (!slideshowEl || !indicatorsEl || !prevBtn || !nextBtn) {
    console.warn('Slideshow elements not found');
    return;
  }
  
  // Render slides and indicators
  renderSlides();
  renderIndicators();
  updateUI();
  
  // Ensure first slide is visible immediately
  const firstSlide = slideshowEl.querySelector('.slide');
  if (firstSlide) {
    firstSlide.classList.add('active');
  }
  
  // Controls
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  
  // Keyboard navigation
  slideshowEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
  
  // Auto-advance (pause if reduced motion)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      goTo(current + 1);
    }, 6000);
  }
}

function renderSlides() {
  slideshowEl.innerHTML = '';
  slideshowEl.setAttribute('tabindex', '0');
  
  SLIDES.forEach((slide, index) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'slide';
    slideEl.setAttribute('role', 'group');
    slideEl.setAttribute('aria-roledescription', 'slide');
    slideEl.setAttribute('aria-label', `${index + 1} of ${SLIDES.length}`);
    
    if (slide.image) {
      const img = document.createElement('img');
      img.className = 'slide-image';
      img.src = slide.image;
      img.alt = slide.caption ? slide.caption : `Memory from ${slide.year}`;
      slideEl.appendChild(img);
    }

    const layer = document.createElement('div');
    layer.className = 'slide-overlay';

    const content = document.createElement('div');
    content.className = 'slide-content';

    const year = document.createElement('div');
    year.className = 'slide-year';
    year.textContent = slide.year;

    const caption = document.createElement('div');
    caption.className = 'slide-caption';
    caption.textContent = slide.caption;

    content.appendChild(year);
    content.appendChild(caption);
    layer.appendChild(content);
    slideEl.appendChild(layer);
    slideshowEl.appendChild(slideEl);
  });
}

function renderIndicators() {
  indicatorsEl.innerHTML = '';
  
  SLIDES.forEach((_, index) => {
    const btn = document.createElement('button');
    btn.className = 'slide-indicator';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Go to slide ${index + 1}`);
    btn.addEventListener('click', () => goTo(index));
    indicatorsEl.appendChild(btn);
  });
}

function updateUI() {
  const slides = slideshowEl.querySelectorAll('.slide');
  const indicators = indicatorsEl.querySelectorAll('.slide-indicator');
  
  slides.forEach((el, index) => {
    if (index === current) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  indicators.forEach((el, index) => {
    if (index === current) {
      el.classList.add('active');
      el.setAttribute('aria-selected', 'true');
    } else {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    }
  });
  
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === SLIDES.length - 1;
}

function goTo(index) {
  if (index < 0) index = 0;
  if (index >= SLIDES.length) index = SLIDES.length - 1;
  if (index === current) return;
  current = index;
  updateUI();
}


