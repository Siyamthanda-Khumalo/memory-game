import React from 'react';

const Card = ({ card, isSelected, isRevealed, isMatched, isDisabled, onClick }) => {
  const getCardClasses = () => {
    let baseClasses = 'card-button relative aspect-square rounded-lg border-2 text-sm sm:text-base font-bold transition-all duration-200 disabled:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';
    
    if (isMatched) {
      return `${baseClasses} bg-emerald-100 border-emerald-300 text-emerald-800`;
    } else if (isRevealed) {
      return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`;
    } else {
      return `${baseClasses} bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-400`;
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
  };

  // Handle empty slots for fixed grids
  if (card.isEmpty) {
    return (
      <button 
        type="button"
        className="invisible" 
        disabled 
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      className={getCardClasses()}
      disabled={isDisabled}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      style={{ passive: false }}
    >
      <span 
        className={`select-none transition-opacity duration-200 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}
      >
        {card.emoji}
      </span>
      
      {!isRevealed && (
        <span 
          className="absolute inset-0 grid place-items-center text-slate-400 text-xs sm:text-sm font-bold"
          aria-hidden="true"
        >
          ?
        </span>
      )}
    </button>
  );
};

export default Card;