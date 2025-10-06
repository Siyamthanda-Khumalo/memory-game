# 🧠 Memory Game - React Edition

A modern, responsive memory card matching game built with React. Test your memory skills by matching pairs of emoji cards across different difficulty levels!

![Memory Game Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Memory+Game+React)

## ✨ Features

### 🎮 **Game Features**
- **3 Difficulty Levels**: Easy (4×3), Medium (4×5), and Hard (24 cards)
- **Smart Grid Layout**: Automatically adjusts card sizes for optimal gameplay
- **Card Preview**: 3-second preview before cards hide for memorization
- **Real-time Statistics**: Track moves, pairs found, and elapsed time
- **High Score System**: Persistent best scores for each difficulty level

### 📱 **Mobile Optimized**
- **Touch Support**: Optimized for mobile devices with haptic feedback
- **Responsive Design**: Adapts to all screen sizes
- **Touch Gestures**: Smooth card interactions on touch devices
- **No Zoom on Double Tap**: Prevents accidental zooming during gameplay

### 🎨 **User Experience**
- **Visual Feedback**: Smooth card animations and transitions
- **Status Messages**: Clear game state indicators
- **Accessibility**: ARIA labels and keyboard navigation support
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start development server**:
   ```bash
   npm start
   ```
4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```
This creates an optimized production build in the `build` folder.

## 📁 Project Structure

```
memory-game-react/
├── public/
│   └── index.html          # HTML template with Tailwind CSS
├── src/
│   ├── components/
│   │   ├── Card.js         # Individual memory card component
│   │   ├── GameControls.js # Game control buttons and difficulty selector
│   │   ├── GameGrid.js     # Grid container for memory cards
│   │   ├── GameStats.js    # Game statistics display
│   │   └── BestScores.js   # High scores display
│   ├── App.js              # Main application component with game logic
│   └── index.js            # React application entry point
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🎯 How to Play

1. **Select Difficulty**: Choose Easy, Medium, or Hard mode
2. **Start Game**: Click "Start Game" to begin
3. **Memorize**: Cards will be revealed for 3 seconds - memorize their positions!
4. **Match Pairs**: Click on cards to flip them and find matching pairs
5. **Complete**: Match all pairs to win the game
6. **Beat Records**: Try to complete in fewer moves and faster time

### 🏆 Scoring
- **Moves**: Each pair of cards clicked counts as one move
- **Time**: Total time from start to completion
- **Best Scores**: Automatically saved for each difficulty level

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Local Storage** - Persistent high score storage
- **Custom Hooks** - Game state management
- **Responsive Design** - Mobile-first approach

## 🎨 Customization

### Adding New Emojis
Edit the `EMOJIS_ALL` array in `src/App.js`:
```javascript
const EMOJIS_ALL = [
  "🎁", "🚗", "🐶", "🌟", "🎵", "⚽", "🎲", "🧩", "🍩", "🚀", "🎧", "🌈",
  "🔔", "🦊", "🐢", "📷", "🎯", "🪐",
  // Add your emojis here!
];
```

### Adjusting Difficulty
Modify the `DIFFICULTY_CONFIG` object in `src/App.js`:
```javascript
const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, label: "Easy", columns: 4, rows: 3 },
  medium: { pairs: 10, label: "Medium", columns: 4, rows: 5 },
  hard: { pairs: 12, label: "Hard" },
  // Add custom difficulty levels
};
```



