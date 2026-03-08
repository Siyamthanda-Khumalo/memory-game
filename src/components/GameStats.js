import React from 'react';

const GameStats = ({ moves, matchedPairs, targetPairs, elapsedMs, formatMs, gameState, PREVIEW_MS }) => {
  const progress = targetPairs > 0 ? (matchedPairs / targetPairs) * 100 : 0;

  const getStatusMessage = () => {
    switch (gameState) {
      case 'idle':
        return 'Press Start to begin';
      case 'preview':
        return `Memorize! Hiding in ${Math.ceil(PREVIEW_MS / 1000)}s...`;
      case 'running':
        return 'Find all matching pairs';
      case 'paused':
        return 'Game paused';
      case 'finished':
        return 'All pairs found!';
      default:
        return 'Press Start to begin';
    }
  };

  return (
    <div className="panel p-5">
      {/* Status message */}
      <div className="mb-4">
        <p className={`text-sm font-medium ${
          gameState === 'finished' ? 'text-emerald-600' :
          gameState === 'preview' ? 'text-amber-600' :
          'text-slate-400'
        }`}>
          {getStatusMessage()}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Moves</p>
          <p className="text-2xl font-semibold text-slate-800 stat-value">{moves}</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Pairs</p>
          <p className="text-2xl font-semibold stat-value">
            <span className="text-blue-600">{matchedPairs}</span>
            <span className="text-slate-300 mx-0.5">/</span>
            <span className="text-slate-500">{targetPairs}</span>
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Time</p>
          <p className="text-2xl font-semibold text-slate-800 stat-value">{formatMs(elapsedMs)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar h-1.5">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GameStats;
