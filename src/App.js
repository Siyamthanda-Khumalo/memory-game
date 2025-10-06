import React, { useState, useEffect, useCallback } from 'react';
import GameStats from './components/GameStats';
import GameControls from './components/GameControls';
import BestScores from './components/BestScores';
import GameGrid from './components/GameGrid';

// Game constants
const PREVIEW_MS = 3000;
const MIN_CARD_PX = 50;

const EMOJIS_ALL = [
  "🎁", "🚗", "🐶", "🌟", "🎵", "⚽", "🎲", "🧩", "🍩", "🚀", "🎧", "🌈",
  "🔔", "🦊", "🐢", "📷", "🎯", "🪐",
];

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, label: "Easy", columns: 4, rows: 3 },
  medium: { pairs: 10, label: "Medium", columns: 4, rows: 5 },
  hard: { pairs: 12, label: "Hard" },
};

const LS_KEY = "memoryScores_v1";

function App() {
  // Game state
  const [gameState, setGameState] = useState("idle"); // idle, preview, running, paused, finished
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
  const [tickInterval, setTickInterval] = useState(null);
  const [startTime, setStartTime] = useState(null);
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
    
    // Use fixed layout for easy and medium modes with smaller cards
    if (config.columns && config.rows) {
      const screenWidth = window.innerWidth;
      const isDesktop = screenWidth >= 1024;
      
      // Calculate available space
      let availableWidth;
      if (isDesktop) {
        const containerPadding = 32;
        const totalWidth = Math.min(screenWidth - containerPadding, 1280);
        availableWidth = (totalWidth * 2 / 3) - 32;
      } else {
        const containerPadding = 16;
        availableWidth = screenWidth - (containerPadding * 2);
      }
      
      // Calculate smaller card size similar to hard mode
      const gapSize = isDesktop ? 8 : 6;
      const totalGapWidth = (config.columns - 1) * gapSize;
      const maxCardWidth = (availableWidth - totalGapWidth) / config.columns;
      
      // Limit card size to make them smaller (similar to hard mode)
      const cardSize = Math.min(maxCardWidth, isDesktop ? 100 : 60);
      
      return {
        columns: config.columns,
        rows: config.rows,
        cardSize: cardSize,
        totalSlots: config.columns * config.rows
      };
    }
    
    // Dynamic calculation for hard mode (unchanged)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isDesktop = screenWidth >= 1024;
    
    let availableWidth, availableHeight;
    
    if (isDesktop) {
      const containerPadding = 32;
      const totalWidth = Math.min(screenWidth - containerPadding, 1280);
      availableWidth = (totalWidth * 2 / 3) - 32;
      availableHeight = screenHeight * 0.8;
    } else {
      const containerPadding = 16;
      availableWidth = screenWidth - (containerPadding * 2);
      availableHeight = screenHeight * 0.5;
    }
    
    let bestConfig = { columns: 4, rows: Math.ceil(cardCount / 4) };
    let bestScore = 0;
    
    for (let cols = 2; cols <= Math.min(6, cardCount); cols++) {
      const rows = Math.ceil(cardCount / cols);
      
      const gapSize = isDesktop ? 8 : 6;
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
    
    // If we have a fixed grid size, add empty slots if needed
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
    if (tickInterval) {
      clearInterval(tickInterval);
      setTickInterval(null);
    }
  }, [tickInterval]);

  const startTimer = useCallback(() => {
    setStartTime(Date.now() - elapsedMs);
    stopTimer();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - (Date.now() - elapsedMs));
    }, 100);
    setTickInterval(interval);
  }, [elapsedMs, stopTimer]);

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
        // Match found - provide haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
        
        setDeck(prevDeck => prevDeck.map(c => 
          c.id === aId || c.id === bId ? { ...c, matched: true } : c
        ));
        setMatchedPairs(prev => prev + 1);
        setSelectedIds([]);
        
        // Check if game is finished
        if (matchedPairs + 1 === DIFFICULTY_CONFIG[difficulty].pairs) {
          finishGame();
        }
      } else {
        // No match - provide different haptic feedback
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
    
    // Success haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    updateScoreboard();
    
    // Auto reset after 2 seconds on mobile, 1.5 on desktop
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
    
    // Reset for new game
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
          // Force re-render of grid
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
    if (startTime && tickInterval) {
      const interval = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, tickInterval]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen">
          {/* Left Column: Stats & Controls */}
          <div className="lg:col-span-1 space-y-4">
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

          {/* Right Column: Game Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm game-area h-full flex flex-col">
              <div className="p-4 flex-1 flex flex-col">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">Memory Game</h2>
                
                <GameGrid
                  deck={deck}
                  selectedIds={selectedIds}
                  revealAll={revealAll}
                  gameState={gameState}
                  onCardClick={handleCardClick}
                  computeOptimalGrid={computeOptimalGrid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;