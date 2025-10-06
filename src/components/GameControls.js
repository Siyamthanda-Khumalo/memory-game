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
  const DIFFICULTY_CONFIG = {
    easy: { pairs: 6, label: "Easy", columns: 4, rows: 3 },
    medium: { pairs: 10, label: "Medium", columns: 4, rows: 5 },
    hard: { pairs: 12, label: "Hard" },
  };

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">Game Controls</h2>
      <div className="space-y-4">
        {/* Difficulty Selector */}
        <div>
          <label htmlFor="difficulty-select" className="block text-sm font-medium text-slate-700 mb-2">
            Difficulty Level
          </label>
          <select 
            id="difficulty-select" 
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full control-btn px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={gameState === 'running' || gameState === 'preview'}
          >
            <option value="easy">Easy (4×3 grid)</option>
            <option value="medium">Medium (4×5 grid)</option>
            <option value="hard">Hard (24 cards)</option>
          </select>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={onStart}
            disabled={gameState !== 'idle'}
            className="control-btn px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {gameState === 'idle' ? 'Start Game' : 'Starting...'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={onPauseResume}
              disabled={gameState !== 'running' && gameState !== 'paused'}
              className="control-btn px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {gameState === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button 
              onClick={onStop}
              disabled={gameState === 'idle'}
              className="control-btn px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Stop
            </button>
          </div>
          <button 
            onClick={onReset}
            className="control-btn px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;