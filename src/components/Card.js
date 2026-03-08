import React from 'react';

const Card = ({ card, isSelected, isRevealed, isMatched, isDisabled, onClick, index }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (!isDisabled) onClick();
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
  };

  if (card.isEmpty) {
    return <div className="invisible" aria-hidden="true" />;
  }

  const isFlipped = isRevealed || isMatched;

  return (
    <div
      className={`card-wrapper card-enter ${isMatched ? 'card-matched' : ''}`}
      style={{
        aspectRatio: '1',
        animationDelay: `${(index || 0) * 25}ms`,
      }}
    >
      <button
        type="button"
        className={`card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}
        disabled={isDisabled}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        aria-label={isRevealed ? card.emoji : 'Hidden card'}
        style={{ cursor: isDisabled ? 'default' : 'pointer' }}
      >
        {/* Back face - hidden state */}
        <div className="card-face card-front">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </div>

        {/* Front face - revealed state */}
        <div className="card-face card-back">
          <span className="select-none" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>
            {card.emoji}
          </span>
        </div>
      </button>
    </div>
  );
};

export default Card;
