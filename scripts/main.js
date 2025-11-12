/**
 * Main JavaScript Module
 * Coordinates all interactive features of the birthday website
 * @module main
 */

import { initConfetti, triggerConfetti } from './confetti.js';
import { initSlideshow } from './slideshow.js';

// State management
const state = {
  isAudioPlaying: false,
  easterEggCount: 0,
  messagesLoaded: false
};

/**
 * Initialize the application
 */
async function init() {
  // Initialize components
  initConfetti();
  initSlideshow();
  initOrnaments();
  initPersonalMessageReveal();
  syncAudioToggle();
  
  // Load messages
  await loadMessages();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup parallax effect
  setupParallax();
  
  // Animate message cards on scroll
  setupScrollAnimations();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Celebrate button (hero - hidden in CSS) kept for fallback
  const celebrateBtn = document.getElementById('celebrate-btn');
  if (celebrateBtn) celebrateBtn.addEventListener('click', handleCelebrate);
  const celebrateHero = document.getElementById('celebrate-hero');
  if (celebrateHero) celebrateHero.addEventListener('click', handleCelebrate);
  
  // Audio toggle
  const audioToggle = document.getElementById('audio-toggle');
  if (audioToggle) audioToggle.addEventListener('click', toggleAudio);
  
}

/**
 * Load birthday messages from JSON file
 */
async function loadMessages() {
  const messagesContainer = document.getElementById('messages-container');
  
  if (!messagesContainer) return;
  
  try {
    const response = await fetch('data/messages.json');
    
    if (!response.ok) {
      throw new Error('Failed to load messages');
    }
    
    const data = await response.json();
    const messages = data.messages || [];
    
    // Clear existing content (including noscript fallback)
    messagesContainer.innerHTML = '';
    
    // Render messages
    messages.forEach((message, index) => {
      const card = createMessageCard(message, index);
      messagesContainer.appendChild(card);
    });
    
    state.messagesLoaded = true;
  } catch (error) {
    console.error('Error loading messages:', error);
    
    // Show fallback message
    messagesContainer.innerHTML = `
      <div class="message-card">
        <p class="message-text">Wishing you the happiest of birthdays, Amanda Kyla! May this year bring you joy, adventure, and all the wonderful things you deserve.</p>
        <p class="message-author">— With love from everyone</p>
      </div>
    `;
  }
}

/**
 * Create a message card element
 * @param {Object} message - Message object with text and author
 * @param {number} index - Index for staggered animation
 * @returns {HTMLElement} Message card element
 */
function createMessageCard(message, index) {
  const card = document.createElement('div');
  card.className = 'message-card';
  card.style.animationDelay = `${index * 0.1}s`;
  
  const text = document.createElement('p');
  text.className = 'message-text';
  text.textContent = message.text;
  
  const author = document.createElement('p');
  author.className = 'message-author';
  author.textContent = `— ${message.author}`;
  
  card.appendChild(text);
  card.appendChild(author);
  
  return card;
}

/**
 * Handle celebrate button click
 */
function handleCelebrate() {
  triggerConfetti();
  
  // Add celebratory feedback
  const btn = document.getElementById('celebrate-btn');
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 150);
  }
}

/**
 * Inject a top-right celebrate icon into header
 */
function injectCelebrateTop() {
  const nav = document.querySelector('header nav');
  if (!nav) return;
  
  // Ensure right container exists
  let right = nav.querySelector('.nav-right');
  if (!right) {
    right = document.createElement('div');
    right.className = 'nav-right';
    nav.appendChild(right);
  }
  
  // Add celebrate button if missing
  if (!document.getElementById('celebrate-top')) {
    const btn = document.createElement('button');
    btn.id = 'celebrate-top';
    btn.className = 'icon-btn celebrate-btn';
    btn.setAttribute('aria-label', 'Celebrate');
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M3 22l3-7 7-3-7 3-3 7zm9-9l6-6m-2 8l2-2m-8-2l2-2" />
      </svg>
    `;
    btn.addEventListener('click', handleCelebrate);
    right.appendChild(btn);
  }
}

/**
 * Toggle background music
 */
function toggleAudio() {
  const audio = document.getElementById('background-music');
  const btn = document.getElementById('audio-toggle');
  if (!audio || !btn) return;
  
  if (state.isAudioPlaying) {
    audio.pause();
    state.isAudioPlaying = false;
    btn.setAttribute('aria-pressed', 'false');
    syncAudioToggle();
  } else {
    if (audio.readyState === 0) {
      audio.load();
    }
    
    audio.play().then(() => {
      state.isAudioPlaying = true;
      btn.setAttribute('aria-pressed', 'true');
      syncAudioToggle();
    }).catch(error => {
      console.warn('Audio playback failed:', error);
      alert('Audio playback is blocked. Please interact with the page first.');
    });
  }
}

function syncAudioToggle() {
  const btn = document.getElementById('audio-toggle');
  if (!btn) return;
  const musicIcon = btn.querySelector('.music-icon');
  const muteIcon = btn.querySelector('.mute-icon');
  const isPlaying = state.isAudioPlaying;
  if (musicIcon) {
    musicIcon.classList.toggle('hidden', !isPlaying);
  }
  if (muteIcon) {
    muteIcon.classList.toggle('hidden', isPlaying);
  }
}

/**
 * Handle share button click
 */
async function handleShare() {
  const url = window.location.href;
  
  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Happy Birthday Amanda Kyla!',
        text: 'Check out this special birthday celebration!',
        url: url
      });
      return;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('Share failed:', error);
      }
    }
  }
  
  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    showNotification('Link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotification('Failed to copy link');
  }
}

/**
 * Show temporary notification
 * @param {string} message - Notification message
 */
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary-color);
    color: var(--surface);
    padding: 1rem 2rem;
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-xl);
    z-index: 3000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Setup parallax effect for hero decorative elements
 */
function setupParallax() {
  const hero = document.querySelector('.hero');
  const layers = document.querySelectorAll('.parallax-layer');
  
  if (!hero || layers.length === 0) return;
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    layers.forEach((layer, index) => {
      const depth = (index + 1) * 10;
      const moveX = x * depth;
      const moveY = y * depth;
      layer.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    });
  });
}

/**
 * Setup scroll-triggered animations
 */
function setupScrollAnimations() {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe sections
  const sections = document.querySelectorAll('.personal-message-section, .messages-section, .slideshow-section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
  });
}

function initPersonalMessageReveal() {
  const card = document.querySelector('.personal-message-card');
  if (!card) {
    console.warn('Personal message card not found');
    return;
  }

  const lines = card.querySelectorAll('.message-intro, .message-body, .message-signature');
  if (lines.length === 0) {
    console.warn('No message lines found');
    return;
  }

  lines.forEach((line, index) => {
    line.style.transitionDelay = `${index * 0.18}s`;
  });

  // Fallback: trigger on scroll if IntersectionObserver isn't available
  const checkVisibility = () => {
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    if (isVisible && !card.classList.contains('is-visible')) {
      card.classList.add('is-visible');
    }
  };

  // Try IntersectionObserver first
  if ('IntersectionObserver' in window) {
    try {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            card.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -5% 0px'
      });

      observer.observe(card);
    } catch (error) {
      console.warn('IntersectionObserver failed, using scroll fallback:', error);
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('load', checkVisibility);
      setTimeout(checkVisibility, 100);
    }
  } else {
    // Fallback for older browsers
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('load', checkVisibility);
    setTimeout(checkVisibility, 100);
  }
}

/**
 * Inject subtle sky ornaments (twinkling stars and drifting clouds)
 */
function initOrnaments() {
  const container = document.createElement('div');
  container.className = 'sky-ornaments';
  container.setAttribute('aria-hidden', 'true');
  
  // Create stars
  const starCount = 100;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star' + (Math.random() > 0.5 ? ' soft' : '');
    const top = Math.random() * 100; // vh
    const left = Math.random() * 100; // vw
    const size = 3 + Math.random() * 4; // 3-7px
    const delay = Math.random() * 6;
    star.style.top = `${top}vh`;
    star.style.left = `${left}vw`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${delay}s`;
    container.appendChild(star);
  }
  
  // Create a few drifting clouds
  const cloudRows = [12, 28, 45, 62, 78]; // vh
  cloudRows.forEach((row, idx) => {
    const cloud = document.createElement('div');
    const sizeClass = Math.random() > 0.5 ? 'large' : (Math.random() > 0.5 ? 'small' : '');
    cloud.className = `cloud ${sizeClass}`.trim();
    cloud.style.top = `${row}vh`;
    cloud.style.left = `${-30 - idx * 8}vw`;
    cloud.style.opacity = String(0.35 + Math.random() * 0.35);
    const duration = 38 + Math.random() * 30; // 38s - 68s
    const delay = Math.random() * 10;
    cloud.style.animationDuration = `${duration}s`;
    cloud.style.animationDelay = `${delay}s`;
    container.appendChild(cloud);
  });
  
  // Insert as the very first child so it paints behind the rest
  const first = document.body.firstChild;
  if (first) {
    document.body.insertBefore(container, first);
  } else {
    document.body.appendChild(container);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all resources are loaded on GitHub Pages
    setTimeout(init, 50);
  });
} else {
  // Small delay for immediate execution
  setTimeout(init, 50);
}

// Add fadeOut animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);