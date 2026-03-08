import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameStats from './components/GameStats';
import GameControls from './components/GameControls';
import BestScores from './components/BestScores';
import GameGrid from './components/GameGrid';

// Game constants
const PREVIEW_MS = 3000;

const EMOJIS_ALL = [
  "🎁", "🚗", "🐶", "🌟", "🎵", "⚽", "🎲", "🧩", "🍩", "🚀", "🎧", "🌈",
  "🔔", "🦊", "🐢", "📷", "🎯", "🪐",
];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, label: "Easy", columns: 4, rows: 3 },
  medium: { pairs: 10, label: "Medium", columns: 5, rows: 4 },
  hard: { pairs: 12, label: "Hard" },
};

const LS_KEY = "memoryScores_v1";

function App() {
  // Game state
  const [gameState, setGameState] = useState("idle");
  const [difficulty, setDifficulty] = useState("medium");
  const [deck, setDeck] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [hasScored, setHasScored] = useState(false);
  const [scores, setScores] = useState({});

  // Timers
  const [timerRunning, setTimerRunning] = useState(false);
  const startTimeRef = useRef(null);
  const [previewTimeout, setPreviewTimeout] = useState(null);

  // Utility functions
  const shuffle = useCallback((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  const computeOptimalGrid = useCallback((cardCount) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isDesktop = screenWidth >= 1024;
    const gapSize = isDesktop ? 10 : 8;

    let availableWidth, availableHeight;

    if (isDesktop) {
      const containerPadding = 32;
      const totalWidth = Math.min(screenWidth - containerPadding, 1280);
      availableWidth = (totalWidth * 2 / 3) - 64;
      // Account for header (~80px), panel padding (~40px), outer padding (~40px), margins
      availableHeight = screenHeight - 220;
    } else {
      const containerPadding = 16;
      availableWidth = screenWidth - (containerPadding * 2);
      availableHeight = screenHeight * 0.5;
    }

    if (config.columns && config.rows) {
      const totalGapWidth = (config.columns - 1) * gapSize;
      const totalGapHeight = (config.rows - 1) * gapSize;
      const maxCardWidth = (availableWidth - totalGapWidth) / config.columns;
      const maxCardHeight = (availableHeight - totalGapHeight) / config.rows;
      const cardSize = Math.min(maxCardWidth, maxCardHeight);

      return {
        columns: config.columns,
        rows: config.rows,
        cardSize: cardSize,
        totalSlots: config.columns * config.rows
      };
    }

    let bestConfig = { columns: 4, rows: Math.ceil(cardCount / 4) };
    let bestScore = 0;

    for (let cols = 2; cols <= Math.min(6, cardCount); cols++) {
      const rows = Math.ceil(cardCount / cols);

      const totalGapWidth = (cols - 1) * gapSize;
      const totalGapHeight = (rows - 1) * gapSize;

      const cardWidth = (availableWidth - totalGapWidth) / cols;
      const cardHeight = (availableHeight - totalGapHeight) / rows;
      const cardSize = Math.min(cardWidth, cardHeight);

      if (cardSize > 40) {
        const aspectRatio = Math.min(cardWidth / cardHeight, cardHeight / cardWidth);
        const score = cardSize * aspectRatio * (1 / rows);

        if (score > bestScore) {
          bestScore = score;
          bestConfig = { columns: cols, rows, cardSize };
        }
      }
    }

    return bestConfig;
  }, [difficulty]);

  const buildDeck = useCallback((pairs, totalSlots = null) => {
    const chosen = EMOJIS_ALL.slice(0, pairs);
    const pairsArr = chosen.flatMap((e, i) => [
      { id: i * 2, emoji: e, matched: false },
      { id: i * 2 + 1, emoji: e, matched: false },
    ]);

    if (totalSlots && pairsArr.length < totalSlots) {
      const emptySlots = totalSlots - pairsArr.length;
      for (let i = 0; i < emptySlots; i++) {
        pairsArr.push({ id: `empty-${i}`, emoji: '', matched: false, isEmpty: true });
      }
    }

    return shuffle(pairsArr);
  }, [shuffle]);

  const formatMs = useCallback((ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}.${tenths}`;
  }, []);

  const loadScores = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const saveScores = useCallback((scoresObj) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(scoresObj));
    } catch {}
  }, []);

  // Timer functions
  const stopTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsedMs;
    setTimerRunning(true);
  }, [elapsedMs]);

  // Game functions
  const resetRoundToIdle = useCallback((keepOrder = true) => {
    stopTimer();
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      setPreviewTimeout(null);
    }

    setGameState("idle");
    setElapsedMs(0);
    setSelectedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setCooldown(false);
    setHasScored(false);
    setRevealAll(false);

    if (!keepOrder) {
      const config = DIFFICULTY_CONFIG[difficulty];
      const totalSlots = config.columns && config.rows ? config.columns * config.rows : null;
      setDeck(buildDeck(config.pairs, totalSlots));
    } else {
      setDeck(prevDeck => prevDeck.map(c => ({ ...c, matched: false })));
    }
  }, [difficulty, buildDeck, stopTimer, previewTimeout]);

  const handleCardClick = useCallback((cardId) => {
    if (gameState !== "running") return;
    if (revealAll || cooldown) return;
    if (selectedIds.includes(cardId)) return;

    const card = deck.find(c => c.id === cardId);
    if (!card || card.matched || card.isEmpty) return;
    if (selectedIds.length >= 2) return;

    const newSelectedIds = [...selectedIds, cardId];
    setSelectedIds(newSelectedIds);

    if (newSelectedIds.length === 2) {
      const [aId, bId] = newSelectedIds;
      const a = deck.find(c => c.id === aId);
      const b = deck.find(c => c.id === bId);

      setMoves(prev => prev + 1);

      if (a.emoji === b.emoji) {
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }

        setDeck(prevDeck => prevDeck.map(c =>
          c.id === aId || c.id === bId ? { ...c, matched: true } : c
        ));
        setMatchedPairs(prev => prev + 1);
        setSelectedIds([]);

        if (matchedPairs + 1 === DIFFICULTY_CONFIG[difficulty].pairs) {
          finishGame();
        }
      } else {
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }

        setCooldown(true);
        setTimeout(() => {
          setSelectedIds([]);
          setCooldown(false);
        }, 800);
      }
    }
  }, [gameState, revealAll, cooldown, selectedIds, deck, matchedPairs, difficulty]);

  const finishGame = useCallback(() => {
    stopTimer();
    setGameState("finished");

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    updateScoreboard();

    const resetDelay = window.innerWidth <= 640 ? 2000 : 1500;
    setTimeout(() => {
      resetRoundToIdle(true);
    }, resetDelay);
  }, [stopTimer, resetRoundToIdle]);

  const updateScoreboard = useCallback(() => {
    if (hasScored) return;
    setHasScored(true);

    const current = { ...scores };
    const entry = { ...(current[difficulty] || {}) };

    const betterMoves = entry.bestMoves == null || moves < entry.bestMoves ? moves : entry.bestMoves;
    const betterTime = entry.bestTimeMs == null || elapsedMs < entry.bestTimeMs ? elapsedMs : entry.bestTimeMs;

    const newScores = {
      ...current,
      [difficulty]: {
        bestMoves: betterMoves,
        bestTimeMs: betterTime,
      }
    };

    setScores(newScores);
    saveScores(newScores);
  }, [hasScored, scores, difficulty, moves, elapsedMs, saveScores]);

  // Event handlers
  const handleStart = useCallback(() => {
    if (gameState !== 'idle') return;

    setDeck(prevDeck => prevDeck.map(c => ({ ...c, matched: false })));
    setSelectedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setHasScored(false);
    setElapsedMs(0);

    setRevealAll(true);
    setGameState('preview');

    const timeout = setTimeout(() => {
      setRevealAll(false);
      setGameState('running');
      startTimer();
      setPreviewTimeout(null);
    }, PREVIEW_MS);
    setPreviewTimeout(timeout);
  }, [gameState, startTimer]);

  const handlePauseResume = useCallback(() => {
    if (gameState === 'running') {
      stopTimer();
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('running');
      startTimer();
    }
  }, [gameState, stopTimer, startTimer]);

  const handleStop = useCallback(() => {
    resetRoundToIdle(true);
  }, [resetRoundToIdle]);

  const handleReset = useCallback(() => {
    resetRoundToIdle(false);
  }, [resetRoundToIdle]);

  const handleDifficultyChange = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    const config = DIFFICULTY_CONFIG[newDifficulty];
    const totalSlots = config.columns && config.rows ? config.columns * config.rows : null;
    setDeck(buildDeck(config.pairs, totalSlots));
    resetRoundToIdle(true);
  }, [buildDeck, resetRoundToIdle]);

  const handleResetScores = useCallback(() => {
    if (window.confirm('Reset all high scores? This cannot be undone.')) {
      const newScores = { easy: {}, medium: {}, hard: {} };
      setScores(newScores);
      saveScores(newScores);
    }
  }, [saveScores]);

  // Handle orientation changes and window resizing
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (gameState !== 'idle') {
          setDeck(prevDeck => [...prevDeck]);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [gameState]);

  // Prevent zoom on double tap for iOS
  useEffect(() => {
    let lastTouchEnd = 0;
    const handleTouchEnd = (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', handleTouchEnd, false);
    return () => {
      document.removeEventListener('touchend', handleTouchEnd, false);
    };
  }, []);

  // Initialize game
  useEffect(() => {
    const loadedScores = loadScores();
    setScores(loadedScores);
    const config = DIFFICULTY_CONFIG[difficulty];
    const totalSlots = config.columns && config.rows ? config.columns * config.rows : null;
    setDeck(buildDeck(config.pairs, totalSlots));
  }, [difficulty, buildDeck, loadScores]);

  // Update timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      if (startTimeRef.current != null) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [timerRunning]);

  return (
    <div className="relative z-10 h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto p-3 sm:p-5 h-full flex flex-col">
        {/* Header */}
        <header className="text-center pt-2 pb-3 lg:pt-4 lg:pb-4 shrink-0">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-blue-600">
            Memory
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 font-light">Find all matching pairs</p>
        </header>

        {/* Main content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-3 order-2 lg:order-1 overflow-y-auto">
            <GameStats
              moves={moves}
              matchedPairs={matchedPairs}
              targetPairs={DIFFICULTY_CONFIG[difficulty].pairs}
              elapsedMs={elapsedMs}
              formatMs={formatMs}
              gameState={gameState}
              PREVIEW_MS={PREVIEW_MS}
            />

            <GameControls
              difficulty={difficulty}
              gameState={gameState}
              onDifficultyChange={handleDifficultyChange}
              onStart={handleStart}
              onPauseResume={handlePauseResume}
              onStop={handleStop}
              onReset={handleReset}
            />

            <BestScores
              difficulty={difficulty}
              scores={scores}
              formatMs={formatMs}
              onResetScores={handleResetScores}
            />
          </div>

          {/* Game area */}
          <div className="lg:col-span-2 order-1 lg:order-2 min-h-0">
            <div className={`panel-game game-area h-full flex flex-col p-3 lg:p-5 ${
              gameState === 'running' ? 'active' : ''
            }`}>
              <GameGrid
                deck={deck}
                selectedIds={selectedIds}
                revealAll={revealAll}
                gameState={gameState}
                onCardClick={handleCardClick}
                computeOptimalGrid={computeOptimalGrid}
              />

              {/* Win overlay */}
              {gameState === 'finished' && (
                <div className="win-message text-center py-4">
                  <p className="text-2xl font-bold text-emerald-600">
                    Well done!
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {moves} moves in {formatMs(elapsedMs)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
