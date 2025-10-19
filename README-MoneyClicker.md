# 💰 React Money Clicker

A modern, feature-rich clicker game built with React, TypeScript, and Vite. Click to earn money, buy upgrades, and grow your fortune!

## 🎮 Game Features

### Core Mechanics
- **Click to Earn**: Click the money button to earn cash
- **Auto-Generation**: Buy upgrades to earn money automatically
- **Progress Saving**: Your game progress is automatically saved to localStorage

### Upgrade System
- **+1€ per Click** (10€) - Increases money per click by 1€ (Max: 10x)
- **+1€ per Second** (100€) - Automatically generates 1€ per second (Max: 10x)  
- **+10€ per Click** (1000€) - Increases money per click by 10€ (Max: 5x)

### Advanced Features
- **Rebirth System**: When you reach 1000€, perform a rebirth to gain Rebirth Points
- **Statistics Tracking**: Monitor your total clicks and current stats
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Beautiful gradients, animations, and visual feedback

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone or download** this project
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 How to Play

1. **Start Clicking**: Click the green money button to earn your first euros
2. **Buy Upgrades**: Use your money to purchase upgrades that increase your earning power
3. **Watch Your Money Grow**: Upgrades compound - the more you buy, the faster you earn
4. **Rebirth for Prestige**: Once you reach 1000€, you can perform a rebirth to gain Rebirth Points
5. **Maximize Your Strategy**: Balance between click upgrades and auto-generation upgrades

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with gradients and animations

### Architecture
- **Component-Based**: Modular React components for easy maintenance
- **Custom Hooks**: `useGameLogic` hook manages all game state and logic
- **Local Storage**: Automatic saving and loading of game progress
- **Type Safety**: Full TypeScript coverage for robust development

### File Structure
```
src/
├── components/          # React components
│   ├── GameStats.tsx   # Money and statistics display
│   ├── MoneyButton.tsx # Main click button
│   ├── UpgradesPanel.tsx # Upgrade purchasing interface
│   └── ActionButtons.tsx # Rebirth and cheat buttons
├── types.ts            # TypeScript type definitions
├── storage.ts          # localStorage management
├── useGameLogic.ts     # Game logic custom hook
├── App.tsx            # Main application component
└── App.css            # Styling and animations
```

## 🎨 Features & Enhancements

### Visual Features
- **Smooth Animations**: Button hover effects and click feedback
- **Responsive Design**: Adapts to different screen sizes
- **Color-Coded Upgrades**: Green for affordable, red for expensive, gray for maxed
- **Progress Indicators**: Visual feedback for upgrade availability

### Game Balance
- **Progressive Pricing**: Upgrade costs increase with each purchase
- **Multiple Upgrade Paths**: Choose between click power and auto-generation
- **Rebirth Mechanics**: Reset progress for long-term advancement

## 📱 Mobile Support

The game is fully responsive and optimized for mobile devices:
- Touch-friendly button sizes
- Optimized layout for smaller screens
- Fast performance on mobile browsers

## 🔧 Development

### Adding New Features
The modular architecture makes it easy to add new features:
- Add new upgrade types in `types.ts`
- Implement logic in `useGameLogic.ts`
- Create UI components in the `components/` directory

### Customization
- Modify game balance in `types.ts` (INITIAL_GAME_STATE, UPGRADES)
- Adjust styling in `App.css`
- Add new components for expanded functionality

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

**Enjoy clicking your way to riches! 💰**