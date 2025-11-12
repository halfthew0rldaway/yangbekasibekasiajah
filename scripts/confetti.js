/**
 * Confetti Animation Module
 * High-performance confetti effect using Canvas API and requestAnimationFrame
 * @module confetti
 */

// Configuration
const CONFIG = {
  particleCount: 150,
  duration: 4000,
  colors: ['#d4a574', '#e8d4b8', '#1e3a5f', '#4caf50', '#2196f3'],
  shapes: ['circle', 'square'],
  gravity: 0.5,
  windResistance: 0.98,
  initialVelocityRange: { min: -15, max: -5 },
  angleRange: { min: -Math.PI / 4, max: -Math.PI * 3 / 4 }
};

let canvas, ctx, particles, animationId, isAnimating;

/**
 * Particle class representing a single confetti piece
 */
class Particle {
  /**
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 4;
    this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    this.shape = CONFIG.shapes[Math.floor(Math.random() * CONFIG.shapes.length)];
    
    // Physics properties
    const angle = Math.random() * (CONFIG.angleRange.max - CONFIG.angleRange.min) + CONFIG.angleRange.min;
    const velocity = Math.random() * (CONFIG.initialVelocityRange.max - CONFIG.initialVelocityRange.min) + CONFIG.initialVelocityRange.min;
    this.vx = Math.cos(angle) * velocity;
    this.vy = Math.sin(angle) * velocity;
    
    // Rotation
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    
    // Lifecycle
    this.opacity = 1;
    this.life = 1;
  }
  
  /**
   * Update particle physics
   */
  update() {
    // Apply gravity
    this.vy += CONFIG.gravity;
    
    // Apply wind resistance
    this.vx *= CONFIG.windResistance;
    this.vy *= CONFIG.windResistance;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Update rotation
    this.rotation += this.rotationSpeed;
    
    // Fade out
    this.life -= 0.01;
    this.opacity = Math.max(0, this.life);
  }
  
  /**
   * Draw particle on canvas
   * @param {CanvasRenderingContext2D} context - Canvas 2D context
   */
  draw(context) {
    context.save();
    context.globalAlpha = this.opacity;
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.fillStyle = this.color;
    
    if (this.shape === 'circle') {
      context.beginPath();
      context.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    
    context.restore();
  }
  
  /**
   * Check if particle is still alive
   * @returns {boolean} True if particle should continue existing
   */
  isAlive() {
    return this.life > 0 && this.y < canvas.height + 50;
  }
}

/**
 * Initialize confetti canvas and context
 */
export function initConfetti() {
  canvas = document.getElementById('confetti-canvas');
  
  if (!canvas) {
    console.warn('Confetti canvas not found');
    return;
  }
  
  ctx = canvas.getContext('2d');
  particles = [];
  isAnimating = false;
  
  // Set canvas size
  resizeCanvas();
  
  // Handle window resize
  window.addEventListener('resize', resizeCanvas);
}

/**
 * Resize canvas to match window size
 */
function resizeCanvas() {
  if (!canvas) return;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Create particles at a specific position
 * @param {number} x - X coordinate for particle spawn
 * @param {number} y - Y coordinate for particle spawn
 * @param {number} count - Number of particles to create
 */
function createParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y));
  }
}

/**
 * Animation loop using requestAnimationFrame
 */
function animate() {
  if (!ctx || !canvas) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update and draw particles
  particles = particles.filter(particle => {
    particle.update();
    
    if (particle.isAlive()) {
      particle.draw(ctx);
      return true;
    }
    
    return false;
  });
  
  // Continue animation if particles exist
  if (particles.length > 0) {
    animationId = requestAnimationFrame(animate);
  } else {
    isAnimating = false;
  }
}

/**
 * Trigger confetti effect
 * @param {Object} options - Configuration options
 * @param {number} options.x - X position (default: center)
 * @param {number} options.y - Y position (default: 40% from top)
 * @param {number} options.count - Number of particles (default: CONFIG.particleCount)
 */
export function triggerConfetti(options = {}) {
  if (!canvas || !ctx) {
    console.warn('Confetti not initialized');
    return;
  }
  
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('Confetti disabled due to reduced motion preference');
    return;
  }
  
  const x = options.x || canvas.width / 2;
  const y = options.y || 40; // spawn near the top of the page
  const count = options.count || CONFIG.particleCount;
  
  // Create particles
  createParticles(x, y, count);
  
  // Start animation if not already running
  if (!isAnimating) {
    isAnimating = true;
    animate();
  }
  
  // Auto-stop after duration
  setTimeout(() => {
    if (isAnimating) {
      stopConfetti();
    }
  }, CONFIG.duration);
}

/**
 * Stop confetti animation
 */
export function stopConfetti() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  particles = [];
  isAnimating = false;
  
  // Clear canvas
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Update confetti configuration
 * @param {Object} newConfig - New configuration options
 */
export function updateConfig(newConfig) {
  Object.assign(CONFIG, newConfig);
}