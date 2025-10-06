import React from 'react';
import Card from './Card';

const GameGrid = ({ deck, selectedIds, revealAll, gameState, onCardClick, computeOptimalGrid }) => {
  const gridConfig = computeOptimalGrid(deck.length);
  
  const gridStyle = {
    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
  };

  // Apply consistent sizing for all difficulties
  if (gridConfig.cardSize) {
    const gap = window.innerWidth >= 1024 ? 8 : 6;
    gridStyle.maxWidth = `${gridConfig.columns * gridConfig.cardSize + (gridConfig.columns - 1) * gap}px`;
    gridStyle.maxHeight = `${gridConfig.rows * gridConfig.cardSize + (gridConfig.rows - 1) * gap}px`;
    gridStyle.margin = '0 auto';
  } else {
    // Fallback for cases without cardSize
    gridStyle.maxWidth = '600px';
    gridStyle.maxHeight = '500px';
    gridStyle.margin = '0 auto';
  }

  return (
    <div className="flex-1 flex items-center justify-center mb-4">
      <div 
        className="game-grid grid gap-2" 
        style={gridStyle}
      >
        {deck.map(card => (
          <Card
            key={card.id}
            card={card}
            isSelected={selectedIds.includes(card.id)}
            isRevealed={revealAll || selectedIds.includes(card.id) || card.matched}
            isMatched={card.matched}
            isDisabled={gameState !== "running" || revealAll}
            onClick={() => onCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameGrid;