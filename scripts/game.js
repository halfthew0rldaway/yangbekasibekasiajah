/**
 * Birthday Trivia Game Module (Alternative to Slideshow)
 * Simple, accessible quiz game with celebratory animations
 * @module game
 * 
 * TO USE THIS INSTEAD OF SLIDESHOW:
 * 1. Replace slideshow section in index.html with game section
 * 2. Import this module instead of slideshow.js in main.js
 * 3. Call initGame() instead of initSlideshow()
 */

import { triggerConfetti } from './confetti.js';

// Game configuration
const QUESTIONS = [
  {
    question: "What is Amanda Kyla's favorite color?",
    options: ["Blue", "Purple", "Green", "Pink"],
    correct: 1, // Index of correct answer (Purple)
    explanation: "Amanda Kyla loves purple!"
  },
  {
    question: "What month was Amanda Kyla born?",
    options: ["January", "June", "November", "December"],
    correct: 2,
    explanation: "Born in November!"
  },
  {
    question: "What's Amanda Kyla's favorite hobby?",
    options: ["Reading", "Painting", "Hiking", "Cooking"],
    correct: 0,
    explanation: "Amanda Kyla is an avid reader!"
  },
  {
    question: "Amanda Kyla's dream vacation destination?",
    options: ["Paris", "Tokyo", "New York", "Iceland"],
    correct: 3,
    explanation: "Iceland's northern lights are calling!"
  }
];

// Game state
let currentQuestion = 0;
let score = 0;
let gameContainer, questionElement, optionsContainer, scoreElement, feedbackElement;

/**
 * Initialize the trivia game
 */
export function initGame() {
  gameContainer = document.getElementById('trivia-game');
  
  if (!gameContainer) {
    console.warn('Game container not found');
    return;
  }
  
  questionElement = document.getElementById('question-text');
  optionsContainer = document.getElementById('options-container');
  scoreElement = document.getElementById('score-display');
  feedbackElement = document.getElementById('feedback');
  
  // Setup restart button
  const restartBtn = document.getElementById('restart-game');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }
  
  // Load first question
  loadQuestion(currentQuestion);
  updateScore();
}

/**
 * Load a question and its options
 * @param {number} index - Question index
 */
function loadQuestion(index) {
  if (!QUESTIONS[index]) {
    endGame();
    return;
  }
  
  const question = QUESTIONS[index];
  
  // Update question text
  if (questionElement) {
    questionElement.textContent = question.question;
    questionElement.setAttribute('aria-live', 'polite');
  }
  
  // Clear previous options
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    
    // Create option buttons
    question.options.forEach((option, optionIndex) => {
      const button = document.createElement('button');
      button.className = 'option-btn';
      button.textContent = option;
      button.setAttribute('aria-label', `Option ${optionIndex + 1}: ${option}`);
      button.addEventListener('click', () => handleAnswer(optionIndex, question.correct, question.explanation));
      optionsContainer.appendChild(button);
    });
  }
  
  // Clear feedback
  if (feedbackElement) {
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
  }
  
  // Update progress
  updateProgress();
}

/**
 * Handle answer selection
 * @param {number} selectedIndex - Index of selected answer
 * @param {number} correctIndex - Index of correct answer
 * @param {string} explanation - Explanation text
 */
function handleAnswer(selectedIndex, correctIndex, explanation) {
  const buttons = optionsContainer.querySelectorAll('.option-btn');
  const isCorrect = selectedIndex === correctIndex;
  
  // Disable all buttons
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    
    // Highlight correct and incorrect
    if (index === correctIndex) {
      btn.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });
  
  // Update score
  if (isCorrect) {
    score++;
    updateScore();
    
    // Show celebratory feedback
    if (feedbackElement) {
      feedbackElement.textContent = `🎉 Correct! ${explanation}`;
      feedbackElement.className = 'feedback correct-feedback';
    }
  } else {
    if (feedbackElement) {
      feedbackElement.textContent = `Not quite! ${explanation}`;
      feedbackElement.className = 'feedback incorrect-feedback';
    }
  }
  
  // Move to next question after delay
  setTimeout(() => {
    currentQuestion++;
    loadQuestion(currentQuestion);
  }, 2000);
}

/**
 * Update score display
 */
function updateScore() {
  if (scoreElement) {
    scoreElement.textContent = `Score: ${score} / ${QUESTIONS.length}`;
    scoreElement.setAttribute('aria-live', 'polite');
  }
}

/**
 * Update progress indicator
 */
function updateProgress() {
  const progressElement = document.getElementById('game-progress');
  if (progressElement) {
    progressElement.textContent = `Question ${currentQuestion + 1} of ${QUESTIONS.length}`;
  }
}

/**
 * End game and show results
 */
function endGame() {
  const percentage = (score / QUESTIONS.length) * 100;
  let message = '';
  
  if (percentage === 100) {
    message = "🌟 Perfect score! You know Amanda Kyla so well!";
    triggerConfetti();
  } else if (percentage >= 75) {
    message = "🎊 Great job! You're a true friend!";
    triggerConfetti({ count: 100 });
  } else if (percentage >= 50) {
    message = "👍 Good effort! You know Amanda Kyla pretty well!";
  } else {
    message = "😊 Thanks for playing! Get to know Amanda Kyla better!";
  }
  
  // Show results
  if (questionElement) {
    questionElement.textContent = "Game Complete!";
  }
  
  if (optionsContainer) {
    optionsContainer.innerHTML = `
      <div class="game-results">
        <h3>Your Score: ${score} / ${QUESTIONS.length}</h3>
        <p class="result-message">${message}</p>
        <button id="restart-game-final" class="cta-btn">Play Again</button>
      </div>
    `;
    
    // Setup restart button
    const finalRestartBtn = document.getElementById('restart-game-final');
    if (finalRestartBtn) {
      finalRestartBtn.addEventListener('click', restartGame);
    }
  }
  
  if (feedbackElement) {
    feedbackElement.textContent = '';
  }
}

/**
 * Restart the game
 */
function restartGame() {
  currentQuestion = 0;
  score = 0;
  updateScore();
  loadQuestion(currentQuestion);
}

/**
 * Get current game state (for testing/debugging)
 * @returns {Object} Current game state
 */
export function getGameState() {
  return {
    currentQuestion,
    score,
    totalQuestions: QUESTIONS.length
  };
}

/**
 * HTML Structure for Game (add to index.html):
 * 
 * <section class="game-section" role="region" aria-labelledby="game-heading">
 *   <h2 id="game-heading">Birthday Trivia Challenge</h2>
 *   <div id="trivia-game" class="trivia-game">
 *     <div class="game-header">
 *       <div id="score-display" class="score-display">Score: 0 / 4</div>
 *       <div id="game-progress" class="game-progress">Question 1 of 4</div>
 *     </div>
 *     
 *     <div class="game-content">
 *       <h3 id="question-text" class="question-text"></h3>
 *       <div id="options-container" class="options-container"></div>
 *       <div id="feedback" class="feedback"></div>
 *     </div>
 *   </div>
 * </section>
 * 
 * 
 * CSS Styles for Game (add to main.css):
 * 
 * .game-section {
 *   padding: var(--space-3xl) var(--space-lg);
 *   max-width: 800px;
 *   margin: 0 auto;
 * }
 * 
 * .trivia-game {
 *   background: var(--surface);
 *   padding: var(--space-2xl);
 *   border-radius: var(--radius-lg);
 *   box-shadow: var(--shadow-xl);
 * }
 * 
 * .game-header {
 *   display: flex;
 *   justify-content: space-between;
 *   margin-bottom: var(--space-xl);
 *   padding-bottom: var(--space-md);
 *   border-bottom: 2px solid var(--accent-light);
 * }
 * 
 * .score-display, .game-progress {
 *   font-weight: 600;
 *   color: var(--primary-color);
 * }
 * 
 * .question-text {
 *   font-size: var(--text-2xl);
 *   color: var(--primary-color);
 *   margin-bottom: var(--space-xl);
 *   text-align: center;
 * }
 * 
 * .options-container {
 *   display: grid;
 *   gap: var(--space-md);
 *   margin-bottom: var(--space-lg);
 * }
 * 
 * .option-btn {
 *   padding: var(--space-md) var(--space-lg);
 *   font-size: var(--text-lg);
 *   background: var(--background);
 *   border: 2px solid var(--accent-light);
 *   border-radius: var(--radius-md);
 *   cursor: pointer;
 *   transition: all var(--transition-base);
 *   text-align: left;
 * }
 * 
 * .option-btn:hover:not(:disabled) {
 *   background: var(--accent-light);
 *   transform: translateY(-2px);
 *   box-shadow: var(--shadow-md);
 * }
 * 
 * .option-btn:disabled {
 *   cursor: not-allowed;
 * }
 * 
 * .option-btn.correct {
 *   background: var(--success-color);
 *   color: white;
 *   border-color: var(--success-color);
 * }
 * 
 * .option-btn.incorrect {
 *   background: #f44336;
 *   color: white;
 *   border-color: #f44336;
 * }
 * 
 * .feedback {
 *   text-align: center;
 *   font-size: var(--text-lg);
 *   padding: var(--space-md);
 *   border-radius: var(--radius-md);
 *   min-height: 60px;
 * }
 * 
 * .correct-feedback {
 *   background: #e8f5e9;
 *   color: #2e7d32;
 * }
 * 
 * .incorrect-feedback {
 *   background: #ffebee;
 *   color: #c62828;
 * }
 * 
 * .game-results {
 *   text-align: center;
 *   padding: var(--space-2xl) 0;
 * }
 * 
 * .game-results h3 {
 *   font-size: var(--text-3xl);
 *   color: var(--primary-color);
 *   margin-bottom: var(--space-md);
 * }
 * 
 * .result-message {
 *   font-size: var(--text-xl);
 *   color: var(--text-secondary);
 *   margin-bottom: var(--space-xl);
 * }
 */