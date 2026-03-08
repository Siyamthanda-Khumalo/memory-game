import React from 'react';

const GameControls = ({
  difficulty,
  gameState,
  onDifficultyChange,
  onStart,
  onPauseResume,
  onStop,
  onReset
}) => {
  return (
    <div className="panel p-5">
      <div className="space-y-4">
        {/* Difficulty Selector */}
        <div>
          <label htmlFor="difficulty-select" className="block text-[11px] uppercase tracking-wider text-slate-400 mb-2">
            Difficulty
          </label>
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="select-modern control-btn w-full px-4 py-2.5 text-sm"
            disabled={gameState === 'running' || gameState === 'preview'}
          >
            <option value="easy">Easy  -  4 x 3 grid</option>
            <option value="medium">Medium  -  5 x 4 grid</option>
            <option value="hard">Hard  -  24 cards</option>
          </select>
        </div>

        {/* Primary action */}
        <button
          onClick={onStart}
          disabled={gameState !== 'idle'}
          className="btn-primary control-btn w-full px-4 py-3 text-sm"
        >
          {gameState === 'idle' ? 'Start Game' : gameState === 'preview' ? 'Starting...' : 'In Progress'}
        </button>

        {/* Secondary actions */}
        <div className="flex gap-2">
          <button
            onClick={onPauseResume}
            disabled={gameState !== 'running' && gameState !== 'paused'}
            className="btn-secondary control-btn flex-1 px-3 py-2.5 text-sm"
          >
            {gameState === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={onStop}
            disabled={gameState === 'idle'}
            className="btn-secondary control-btn flex-1 px-3 py-2.5 text-sm"
          >
            Stop
          </button>
        </div>

        {/* New game */}
        <button
          onClick={onReset}
          className="btn-secondary control-btn w-full px-3 py-2.5 text-sm"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameControls;
