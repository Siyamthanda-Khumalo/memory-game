import React from 'react';

const GameStats = ({ moves, matchedPairs, targetPairs, elapsedMs, formatMs, gameState, PREVIEW_MS }) => {
  const getGameStatus = () => {
    switch (gameState) {
      case 'idle':
        return '(Tap Start to begin)';
      case 'preview':
        return '(Previewing cards…)';
      case 'running':
        return '';
      case 'paused':
        return '(Paused)';
      case 'finished':
        return '';
      default:
        return '(Tap Start to begin)';
    }
  };

  const getStatusMessage = () => {
    switch (gameState) {
      case 'idle':
        return 'Ready when you are — tap Start to begin.';
      case 'preview':
        return `Memorize the cards! They will hide after ${Math.ceil(PREVIEW_MS / 1000)} seconds.`;
      case 'running':
        return '';
      case 'paused':
        return 'Game paused. Tap Resume to continue.';
      case 'finished':
        return `🎉 Excellent memory! All pairs found in ${moves} moves • ${formatMs(elapsedMs)}`;
      default:
        return 'Ready when you are — tap Start to begin.';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">Game Stats</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Moves</span>
          <span className="font-semibold text-slate-900 text-lg">{moves}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Pairs Found</span>
          <span className="font-semibold text-lg">
            <span className="text-emerald-600">{matchedPairs}</span>/
            <span className="text-slate-900">{targetPairs}</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Time</span>
          <span className="font-semibold text-slate-900 text-lg">{formatMs(elapsedMs)}</span>
        </div>
        <div className="pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">{getGameStatus()}</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;