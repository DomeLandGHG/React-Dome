# 💰 React Money Clicker

An addictive incremental clicker game featuring rebirth mechanics, rune systems, achievements, and complex progression systems. Build your fortune from humble beginnings to astronomical wealth!

🎮 **[Play Now!](https://domelandghg.github.io/React-Dome)**

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/domedandghg/React-Dome)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🎯 Game Overview

React Money Clicker is a sophisticated idle/incremental game that combines classic clicker mechanics with deep progression systems. Start by clicking to earn money, unlock rebirth mechanics, collect gems and runes, and climb through multiple layers of meta-progression.

### Key Progression Stages
- **Early Game**: Basic clicking and upgrades
- **Mid Game**: Rebirth system and multipliers
- **Late Game**: Gem drops and rune collection
- **End Game**: Elemental prestige and achievement grinding

---

## ✨ Features

### 🎮 Core Gameplay
- **Click Mechanics**: Manual clicking with visual feedback and floating numbers
- **Auto Income**: Passive money generation through upgrades
- **Rebirth System**: Reset progress for permanent multipliers and new content
- **Gem System**: Rare drops that unlock powerful rune packs
- **Rune Collection**: 6 rarity tiers with merging and crafting mechanics

### 🏆 Achievement System
- **8 Achievement Types**: Money, Rebirth Points, Gems, Clicks, Upgrades, Elements, Runes, and Time
- **100 Tiers Each**: Exponential scaling with meaningful progression
- **Real-time Tracking**: Visual progress bars and bonus calculations
- **Manual Reload**: Button to recalculate achievement progress

### ⚡ Performance Optimized (v0.2.0)
- **Ultra-fast Click Processing**: Handles thousands of clicks per second
- **Dynamic FPS Targeting**: Adapts to system performance
- **Smart Achievement Checks**: Optimized validation frequency
- **Memory Efficient**: Reduced memory usage and improved stability

### 🎨 User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Feedback**: Animations, glow effects, and progress indicators
- **Settings Menu**: Toggle animations and access game options
- **Performance Monitor**: Real-time FPS and click rate display (Ctrl+Shift+P)

### 🔧 Advanced Systems
- **Elemental Prestige**: Permanent bonuses for each element type
- **Rune Crafting**: Combine runes for powerful secret runes
- **Elemental Trader**: Trade runes between elements
- **Random Events**: Temporary multipliers and bonuses
- **Cloud Saves**: Firebase integration for cross-device progress

---

## 🚀 Quick Start

### Online Play
Simply visit **[domelandghg.github.io/React-Dome](https://domelandghg.github.io/React-Dome)** and start playing immediately!

### Local Development
```bash
# Clone the repository
git clone https://github.com/domedandghg/React-Dome.git
cd React-Dome

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🎯 How to Play

### Getting Started
1. **Click the Money Button**: Earn $1 per click initially
2. **Buy Upgrades**: Increase your clicking power and unlock auto-income
3. **Reach 10,000$**: Unlock the rebirth system
4. **Perform Your First Rebirth**: Reset for Rebirth Points (RP) and multipliers

### Core Mechanics

#### 💵 Money System
- **Manual Clicks**: Base income + upgrade bonuses
- **Auto Income**: Passive generation from purchased upgrades
- **Multipliers**: Rebirth bonuses × Rune bonuses × Achievement bonuses

#### 🔄 Rebirth System
- **Reset Progress**: Lose money and normal upgrades, keep RP and rebirth upgrades
- **RP Calculation**: `floor(sqrt(clicks / 10))`
- **Permanent Bonuses**: RP spent on multipliers that carry over

#### 💎 Gem System
- **Drop Chance**: 0.1% base + bonuses from runes and achievements
- **Rune Packs**: Buy packs with gems for random runes
- **Two Types**: Base Runes (money multipliers) and Elemental Runes (resources)

#### 🎴 Rune System
- **Base Runes**: 6 rarities (Common to Mythic) providing money/RP/gem bonuses
- **Elemental Runes**: 6 elements producing resources over time
- **Merging**: Combine 3 identical runes into 1 higher rarity
- **Crafting**: Create Secret Runes with massive bonuses

### Advanced Features

#### ✨ Elemental Prestige
- **Requirements**: Accumulate 10-15 runes per element
- **Benefits**: Permanent bonuses that scale with prestige level
- **Elements**: Air, Earth, Water, Fire, Light, Dark

#### 🏪 Elemental Trader
- **Trades**: Exchange runes between elements
- **Refresh**: New offers every 4 hours or instant with gems
- **Balance**: Optimize your elemental rune distribution

#### 🎪 Random Events
- **Duration**: 30-60 seconds
- **Effects**: 2x-3x multipliers for various resources
- **Elements**: Fire Storm, Earthquake, Tidal Wave, etc.

---

## 🏆 Achievement System

### Achievement Types

| Achievement | Icon | Description | Max Tiers | Bonus |
|-------------|------|-------------|-----------|-------|
| Money Maker | 💰 | Reach X total money | 100 | +1% Money |
| Rebirth Master | 🔄 | Reach X rebirth points | 100 | +1% RP |
| Gem Collector | 💎 | Reach X total gems | 100 | +0.1% Gem Chance |
| Click Master | 👆 | Reach X total clicks | 100 | +1% Money |
| Upgrade Enthusiast | 📈 | Reach X total upgrades | 100 | +1% Money |
| Element Producer | ⚡ | Reach X elements produced | 100 | +1% Elements |
| Rune Collector | 📜 | Reach X rune packs bought | 100 | +1% Elements |
| Active Player | ⏰ | Play for X hours | 50 | +1% Money |
| Idle Master | 💤 | Accumulate X offline hours | 50 | +1% Money |
| Ascension Master | ✨ | Perform X elemental ascensions | 100 | +1% Money |

### Scaling System
- **Exponential Growth**: Requirements double each tier
- **Scientific Notation**: Higher tiers use 1.23e45 format
- **Realistic Progression**: Balanced for long-term gameplay

---

## 📊 Statistics & Tracking

### Comprehensive Stats
- **Money Statistics**: All-time earnings, click vs auto income
- **Rebirth Tracking**: Total RP earned, rebirths performed
- **Gem Analytics**: Total gems collected and spent
- **Rune Metrics**: Packs bought, runes merged, crafted items
- **Time Tracking**: Online/offline play time
- **Achievement Progress**: Current tiers and total bonuses

### Performance Monitoring
- **Real-time FPS**: Frame rate and click processing speed
- **Memory Usage**: System resource monitoring
- **Achievement Checks**: Validation frequency and timing
- **Toggle**: Press Ctrl+Shift+P to show/hide monitor

---

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: React 19 with TypeScript 5.9
- **Build Tool**: Vite with Rolldown bundler
- **Styling**: CSS3 with responsive design
- **Backend**: Firebase for cloud saves and leaderboards
- **Deployment**: GitHub Pages

### Performance Optimizations (v0.2.0)
- **Click Batching**: Processes multiple clicks efficiently
- **Smart Rendering**: Only updates changed components
- **Memory Management**: Automatic cleanup and optimization
- **Achievement Caching**: Reduces calculation overhead

### Browser Support
- **Chrome 120+**: Recommended for best performance
- **Firefox 115+**: Full functionality with minor visual differences
- **Edge 120+**: Excellent performance on Windows
- **Safari**: Compatible with some limitations

---

## 🎮 Gameplay Tips

### Early Game Strategy
1. Focus on **Extra Click** upgrades first
2. Balance manual clicking with auto-income
3. Save for **Rebirth Unlock** (10,000$)
4. Complete early achievements for bonuses

### Mid Game Optimization
1. Perform regular rebirths to gain RP
2. Prioritize **RP Multiplier** and **Click Power**
3. Unlock gems and start rune collection
4. Use rebirth timing strategically

### Late Game Mastery
1. Farm elemental runes for prestige
2. Craft secret runes for massive bonuses
3. Optimize achievement progression
4. Balance gem spending vs rune collection

### Achievement Grinding
- **Money Maker**: Progresses naturally through gameplay
- **Rebirth Master**: Requires multiple rebirth cycles
- **Gem Collector**: Long-term gem farming
- **Click Master**: Focus on maximizing click count
- **Element Producer**: Accumulate elemental resources
- **Rune Collector**: Purchase rune packs regularly

---

## 📈 Version History

### v0.2.0 (December 2025) - Performance & Achievements
- ⚡ Ultra-fast click processing and dynamic FPS targeting
- 🏆 Fixed achievement scaling bugs and improved balance
- 📊 Added performance monitoring (Ctrl+Shift+P)
- 🔧 Enhanced TypeScript types and error handling

### v0.1.0 (November 2025) - Initial Release
- 🎮 Core clicker mechanics and rebirth system
- 💎 Gem drops and rune collection
- ✨ Elemental prestige and trader system
- 🏆 Achievement system with 100 tiers each

---

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Help with translations

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-username/React-Dome.git

# Install dependencies
npm install

# Start development
npm run dev

# Run tests (when available)
npm test
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Special thanks to:
- The incremental game community for inspiration
- React and TypeScript teams for amazing tools
- Our players for feedback and support

---

**Enjoy the game and happy clicking! 🎮💰**

*Built with ❤️ using React and TypeScript*

*Last updated: December 2025*
