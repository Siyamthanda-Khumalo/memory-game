import React from 'react';
import Card from './Card';

const GAP_DESKTOP = 10;
const GAP_MOBILE = 8;

const GameGrid = ({ deck, selectedIds, revealAll, gameState, onCardClick, computeOptimalGrid }) => {
  const gridConfig = computeOptimalGrid(deck.length);
  const isDesktop = window.innerWidth >= 1024;
  const gap = isDesktop ? GAP_DESKTOP : GAP_MOBILE;

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
    gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
    gap: `${gap}px`,
  };

  if (gridConfig.cardSize) {
    gridStyle.maxWidth = `${gridConfig.columns * gridConfig.cardSize + (gridConfig.columns - 1) * gap}px`;
    gridStyle.maxHeight = `${gridConfig.rows * gridConfig.cardSize + (gridConfig.rows - 1) * gap}px`;
    gridStyle.margin = '0 auto';
  } else {
    gridStyle.maxWidth = '600px';
    gridStyle.maxHeight = '500px';
    gridStyle.margin = '0 auto';
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="game-grid grid"
        style={gridStyle}
      >
        {deck.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
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
