/**
 * Memory Card Game Engine (Memoria de Parejas)
 * Manages game state, 2D flip animations, timing, scoring, streak multipliers,
 * local storage records, and keyboard accessibility.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Element References
  const themeSelect = document.getElementById('select-theme');
  const ruleSelect = document.getElementById('select-rule');
  const levelSelect = document.getElementById('select-level');
  
  const attemptsLabel = document.getElementById('stat-attempts-label');
  const attemptsValue = document.getElementById('stat-attempts');
  const attemptsCard = document.getElementById('stat-card-attempts');

  const timerLabel = document.getElementById('stat-timer-label');
  const timerValue = document.getElementById('stat-timer');
  const timerCard = document.getElementById('stat-card-timer');

  const scoreValue = document.getElementById('stat-score');
  const recordValue = document.getElementById('stat-record');

  const gameBoard = document.getElementById('game-board');
  const restartBtn = document.getElementById('btn-restart');

  // Dialog Elements
  const victoryDialog = document.getElementById('victory-dialog');
  const victoryRestartBtn = document.getElementById('btn-victory-restart');
  const victoryBaseScore = document.getElementById('victory-base-score');
  const victoryBonusScore = document.getElementById('victory-bonus-score');
  const victoryBonusRow = document.getElementById('victory-bonus-row');
  const victoryTotalScore = document.getElementById('victory-total-score');
  const victoryAttempts = document.getElementById('victory-attempts');
  const victoryTime = document.getElementById('victory-time');
  const newRecordBadge = document.getElementById('new-record-badge');

  const defeatDialog = document.getElementById('defeat-dialog');
  const defeatRetryBtn = document.getElementById('btn-defeat-retry');
  const defeatMessage = document.getElementById('defeat-message');
  const defeatPairs = document.getElementById('defeat-pairs');
  const defeatScore = document.getElementById('defeat-score');

  // Game Engine State Variables
  let currentTheme = 'animales';
  let currentRule = 'sin_limites';
  let currentLevel = 'facil';

  let cardsData = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let totalPairs = 6;

  let attemptsCount = 0;
  let remainingAttempts = 0;

  let secondsCount = 0;
  let remainingSeconds = 0;
  let timerInterval = null;
  let timerStarted = false;

  let currentScore = 0;
  let currentStreak = 0;
  let isLocked = false;
  let isGameOver = false;

  // Initialize Application
  initSelectors();
  initGame();

  /**
   * Bind event listeners to selectors and action buttons
   */
  function initSelectors() {
    themeSelect.addEventListener('change', (e) => {
      currentTheme = e.target.value;
      initGame();
    });

    ruleSelect.addEventListener('change', (e) => {
      currentRule = e.target.value;
      initGame();
    });

    levelSelect.addEventListener('change', (e) => {
      currentLevel = e.target.value;
      initGame();
    });

    restartBtn.addEventListener('click', () => initGame());

    victoryRestartBtn.addEventListener('click', () => {
      if (victoryDialog.close) victoryDialog.close();
      initGame();
    });

    defeatRetryBtn.addEventListener('click', () => {
      if (defeatDialog.close) defeatDialog.close();
      initGame();
    });
  }

  /**
   * Initialize or Reset Game State
   */
  function initGame() {
    // Clear active timer
    stopTimer();
    timerStarted = false;

    // Reset Flags & Counters
    isLocked = false;
    isGameOver = false;
    flippedCards = [];
    matchedPairs = 0;
    attemptsCount = 0;
    secondsCount = 0;
    currentScore = 0;
    currentStreak = 0;

    const levelConfig = GAME_CONFIG.levels[currentLevel];
    const ruleConfig = GAME_CONFIG.rules[currentRule];
    const themeConfig = GAME_CONFIG.themes[currentTheme];

    totalPairs = levelConfig.pairs;

    // Set Up Rule Specific Limits
    if (ruleConfig.type === 'attempts') {
      remainingAttempts = ruleConfig.limits[currentLevel];
      attemptsLabel.textContent = 'Intentos rest.';
      attemptsValue.textContent = remainingAttempts;
    } else {
      attemptsLabel.textContent = 'Intentos';
      attemptsValue.textContent = 0;
    }

    if (ruleConfig.type === 'timer') {
      remainingSeconds = ruleConfig.limits[currentLevel];
      timerLabel.textContent = 'Tiempo rest.';
      timerValue.textContent = formatTime(remainingSeconds);
    } else {
      timerLabel.textContent = 'Tiempo';
      timerValue.textContent = formatTime(0);
    }

    scoreValue.textContent = 0;

    // Reset Red Alerts
    attemptsCard.classList.remove('stat-warning');
    timerCard.classList.remove('stat-warning');

    // Load High Score Record
    updateRecordDisplay();

    // Prepare Cards Deck
    generateDeck(themeConfig, totalPairs);

    // Render Grid Layout
    renderBoard(levelConfig.cols);
  }

  /**
   * Format seconds as MM:SS string
   */
  function formatTime(totalSec) {
    const min = Math.floor(Math.max(0, totalSec) / 60);
    const sec = Math.max(0, totalSec) % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  /**
   * Generate deck of duplicated and shuffled cards
   */
  function generateDeck(themeConfig, pairsCount) {
    // Select items from theme
    const themeItems = themeConfig.items.slice(0, pairsCount);
    
    // Duplicate items for pairs
    const deck = [];
    themeItems.forEach((item, index) => {
      deck.push({ id: index, content: item, themeType: themeConfig.type });
      deck.push({ id: index, content: item, themeType: themeConfig.type });
    });

    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    cardsData = deck;
  }

  /**
   * Render card grid in DOM
   */
  function renderBoard(cols) {
    gameBoard.innerHTML = '';
    gameBoard.className = `game-board grid-${currentLevel}`;

    cardsData.forEach((cardItem, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card face-down';
      cardEl.setAttribute('tabindex', '0');
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', `Carta ${index + 1}`);
      cardEl.dataset.index = index;
      cardEl.dataset.cardId = cardItem.id;

      // Inner Container
      const contentEl = document.createElement('div');
      contentEl.className = 'card-content';
      cardEl.appendChild(contentEl);

      // Event Listeners
      cardEl.addEventListener('click', () => handleCardClick(cardEl, cardItem));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(cardEl, cardItem);
        }
      });

      gameBoard.appendChild(cardEl);
    });
  }

  /**
   * Handle Card Flip Trigger
   */
  function handleCardClick(cardEl, cardItem) {
    if (isLocked || isGameOver) return;
    if (cardEl.classList.contains('face-up') || cardEl.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    // Start timer on FIRST card flip (Requirement adjustment #5)
    if (!timerStarted) {
      startTimer();
      timerStarted = true;
    }

    // Execute 2D scaleX Flip Animation (Shrink -> Change Content -> Expand)
    animateCardFlip(cardEl, cardItem, true);

    flippedCards.push({ element: cardEl, data: cardItem });

    if (flippedCards.length === 2) {
      isLocked = true;
      processAttempt();
    }
  }

  /**
   * Animate Card Flip using 2D scaleX transform
   */
  function animateCardFlip(cardEl, cardItem, faceUp) {
    cardEl.classList.add('flipping');

    setTimeout(() => {
      const contentEl = cardEl.querySelector('.card-content');
      
      if (faceUp) {
        cardEl.classList.remove('face-down');
        cardEl.classList.add('face-up');
        renderCardItemContent(contentEl, cardItem);
      } else {
        cardEl.classList.remove('face-up', 'mismatched');
        cardEl.classList.add('face-down');
        contentEl.innerHTML = '';
      }

      cardEl.classList.remove('flipping');
    }, 125); // Half transition duration
  }

  /**
   * Render theme-specific item content inside card
   */
  function renderCardItemContent(container, cardItem) {
    container.innerHTML = '';

    if (cardItem.themeType === 'emoji') {
      const span = document.createElement('span');
      span.className = 'card-emoji';
      span.textContent = cardItem.content;
      container.appendChild(span);
    } else if (cardItem.themeType === 'svg') {
      container.innerHTML = cardItem.content.svg;
    } else if (cardItem.themeType === 'flag') {
      const flag = document.createElement('span');
      flag.className = `fi fi-${cardItem.content.code} flag-icon-item`;
      flag.title = cardItem.content.name;
      container.appendChild(flag);
    }
  }

  /**
   * Process Pair Flip Attempt
   */
  function processAttempt() {
    attemptsCount++;

    const ruleConfig = GAME_CONFIG.rules[currentRule];

    // Update Attempts Stat
    if (ruleConfig.type === 'attempts') {
      remainingAttempts--;
      attemptsValue.textContent = Math.max(0, remainingAttempts);

      // Warning alert highlight when remaining attempts <= 3
      if (remainingAttempts <= ruleConfig.warningThreshold) {
        attemptsCard.classList.add('stat-warning');
      }
    } else {
      attemptsValue.textContent = attemptsCount;
    }

    const [card1, card2] = flippedCards;

    // Check Match
    if (card1.data.id === card2.data.id) {
      // MATCH SUCCESS!
      card1.element.classList.add('matched');
      card2.element.classList.add('matched');

      matchedPairs++;
      currentStreak++;

      // Score calculation with streak bonus
      const points = 100 + (currentStreak - 1) * 50;
      currentScore += points;
      scoreValue.textContent = currentScore;

      flippedCards = [];
      isLocked = false;

      // Check Victory Condition
      if (matchedPairs === totalPairs) {
        handleVictory();
      }
    } else {
      // MISMATCH FAILURE!
      card1.element.classList.add('mismatched');
      card2.element.classList.add('mismatched');

      currentStreak = 0;
      // Subtract 10 points for mismatch
      currentScore = Math.max(0, currentScore - 10);
      scoreValue.textContent = currentScore;

      // Check Defeat by Attempts
      if (ruleConfig.type === 'attempts' && remainingAttempts <= 0 && matchedPairs < totalPairs) {
        setTimeout(() => {
          handleDefeat('Te quedaste sin intentos');
        }, 600);
        return;
      }

      // Hide cards back after delay
      setTimeout(() => {
        animateCardFlip(card1.element, card1.data, false);
        animateCardFlip(card2.element, card2.data, false);
        flippedCards = [];
        isLocked = false;
      }, 1000);
    }
  }

  /**
   * Timer Handler Loop
   */
  function startTimer() {
    const ruleConfig = GAME_CONFIG.rules[currentRule];

    timerInterval = setInterval(() => {
      if (isGameOver) return;

      if (ruleConfig.type === 'timer') {
        remainingSeconds--;
        timerValue.textContent = formatTime(remainingSeconds);

        // Warning alert highlight when remaining seconds <= 10s
        if (remainingSeconds <= ruleConfig.warningThreshold) {
          timerCard.classList.add('stat-warning');
        }

        // Defeat condition by time
        if (remainingSeconds <= 0) {
          stopTimer();
          handleDefeat('Se acabó el tiempo');
        }
      } else {
        secondsCount++;
        timerValue.textContent = formatTime(secondsCount);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Handle Game Defeat State
   */
  function handleDefeat(reasonMessage) {
    isGameOver = true;
    isLocked = true;
    stopTimer();

    defeatMessage.textContent = reasonMessage;
    defeatPairs.textContent = `${matchedPairs} / ${totalPairs}`;
    defeatScore.textContent = currentScore;

    if (defeatDialog.showModal) {
      defeatDialog.showModal();
    }
  }

  /**
   * Handle Game Victory State
   */
  function handleVictory() {
    isGameOver = true;
    stopTimer();

    const ruleConfig = GAME_CONFIG.rules[currentRule];
    let bonusPoints = 0;

    if (ruleConfig.type === 'timer') {
      bonusPoints = remainingSeconds * 10;
      victoryBonusLabel.textContent = 'Bonus tiempo restante (+10/s):';
      victoryBonusScore.textContent = `+${bonusPoints}`;
      victoryBonusRow.classList.remove('hidden');
    } else if (ruleConfig.type === 'attempts') {
      bonusPoints = remainingAttempts * 50;
      victoryBonusLabel.textContent = 'Bonus intentos restantes (+50/intentos):';
      victoryBonusScore.textContent = `+${bonusPoints}`;
      victoryBonusRow.classList.remove('hidden');
    } else {
      // Speed bonus for unlimited mode
      const speedBonus = Math.max(0, 300 - secondsCount * 2);
      bonusPoints = speedBonus;
      victoryBonusLabel.textContent = 'Bonus rapidez:';
      victoryBonusScore.textContent = `+${bonusPoints}`;
      victoryBonusRow.classList.remove('hidden');
    }

    const finalTotalScore = currentScore + bonusPoints;

    victoryBaseScore.textContent = currentScore;
    victoryTotalScore.textContent = finalTotalScore;
    victoryAttempts.textContent = attemptsCount;
    victoryTime.textContent = ruleConfig.type === 'timer' 
      ? formatTime(ruleConfig.limits[currentLevel] - remainingSeconds)
      : formatTime(secondsCount);

    // Save record to localStorage
    const recordKey = getRecordKey();
    const isNewRecord = saveRecord(recordKey, finalTotalScore);

    if (isNewRecord) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }

    updateRecordDisplay();

    setTimeout(() => {
      if (victoryDialog.showModal) {
        victoryDialog.showModal();
      }
    }, 400);
  }

  /**
   * Generate key for record storage per Theme + Rule + Level
   */
  function getRecordKey() {
    return `memory_record_${currentTheme}_${currentRule}_${currentLevel}`;
  }

  /**
   * Save record to localStorage with try/catch safeguard
   */
  function saveRecord(key, score) {
    try {
      const savedScore = parseInt(localStorage.getItem(key) || '0', 10);
      if (score > savedScore) {
        localStorage.setItem(key, score.toString());
        return true;
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
    return false;
  }

  /**
   * Get record from localStorage with try/catch safeguard
   */
  function getRecord(key) {
    try {
      return parseInt(localStorage.getItem(key) || '0', 10);
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
      return 0;
    }
  }

  /**
   * Update high score display in stats bar
   */
  function updateRecordDisplay() {
    const key = getRecordKey();
    const record = getRecord(key);
    recordValue.textContent = record;
  }
});
