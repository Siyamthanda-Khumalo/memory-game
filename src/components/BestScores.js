import React from 'react';

const BestScores = ({ difficulty, scores, formatMs, onResetScores }) => {
  const DIFFICULTY_CONFIG = {
    easy: { pairs: 6, label: "Easy", columns: 4, rows: 3 },
    medium: { pairs: 10, label: "Medium", columns: 4, rows: 5 },
    hard: { pairs: 12, label: "Hard" },
  };

  const bestForDiff = scores[difficulty] || {};

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">Best Scores</h2>
        <button 
          onClick={onResetScores}
          className="control-btn px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-200"
        >
          Reset
        </button>
      </div>
      <div className="text-sm text-slate-700 mb-2">
        <span>{DIFFICULTY_CONFIG[difficulty].label}</span> Difficulty
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Best moves</span>
          <span className="font-medium text-slate-900">
            {bestForDiff.bestMoves != null ? bestForDiff.bestMoves : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Best time</span>
          <span className="font-medium text-slate-900">
            {bestForDiff.bestTimeMs != null ? formatMs(bestForDiff.bestTimeMs) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BestScores;