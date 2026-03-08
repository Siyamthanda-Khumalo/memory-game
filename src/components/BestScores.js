import React from 'react';

const DIFFICULTY_LABELS = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const BestScores = ({ difficulty, scores, formatMs, onResetScores }) => {
  const bestForDiff = scores[difficulty] || {};
  const hasBest = bestForDiff.bestMoves != null || bestForDiff.bestTimeMs != null;

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-slate-400">Best Scores</h3>
          <p className="text-sm text-blue-600 font-medium mt-0.5">
            {DIFFICULTY_LABELS[difficulty]}
          </p>
        </div>
        <button
          onClick={onResetScores}
          className="text-[11px] text-slate-300 hover:text-slate-500 transition-colors px-2 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {hasBest ? (
        <div className="flex gap-6">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Moves</p>
            <p className="text-xl font-semibold text-slate-700 stat-value">
              {bestForDiff.bestMoves != null ? bestForDiff.bestMoves : '-'}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Time</p>
            <p className="text-xl font-semibold text-slate-700 stat-value">
              {bestForDiff.bestTimeMs != null ? formatMs(bestForDiff.bestTimeMs) : '-'}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-300">No scores yet. Play a game!</p>
      )}
    </div>
  );
};

export default BestScores;
