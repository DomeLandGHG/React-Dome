//verbindet alle scripte


//imports der Libarys
import React, { useState } from 'react';
import { useGameLogic } from './useGameLogic';
import GameStats from './components/GameStats';
import MoneyButton from './components/MoneyButton';
import SwitchButton from './components/Panel-switchButton';
import UpgradesPanel from './components/UpgradesPanel';
import RebirthPanel from './components/RebirthUpgradePanel';
import ActionButtons from './components/ActionButtons';
import MobileTabNavigation from './components/MobileTabNavigation';
import { formatNumberGerman } from './types';
import { RUNES_1, RUNES_2, type Rune } from './types/Runes';
import './App.css';

function App() {
  const { gameState, clickMoney, buyUpgrade, buyRebirthUpgrade, performRebirth, resetGame, cheatMoney, devAddMoney, devAddMoneyDirect, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, devAddElementalRune, openRunePack, mergeRunes, mergeAllRunes, switchRuneType, toggleElementalStats, toggleMoneyEffects, toggleDiamondEffects } = useGameLogic();
  const [activePanel, setActivePanel] = useState<'upgrades' | 'rebirth'>('upgrades');
  const [mobileActiveTab, setMobileActiveTab] = useState<'stats' | 'upgrades' | 'rebirth' | 'gems' | 'dev'>('stats');
  const [isFlashing, setIsFlashing] = useState(false);
  const [hoveredRune, setHoveredRune] = useState<number | null>(null);
  
  // Check if rebirth is unlocked
  const isRebirthUnlocked = gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0);
  
  // Reset to upgrades if rebirth becomes locked
  React.useEffect(() => {
    if (!isRebirthUnlocked && activePanel === 'rebirth') {
      setActivePanel('upgrades');
    }
  }, [isRebirthUnlocked, activePanel]);
  
  // Prüfe ob beide Unlock-Upgrades gekauft wurden
  const bothUnlocksOwned = gameState.upgradeAmounts[4] > 0 && gameState.rebirth_upgradeAmounts[3] > 0;

  // Calculate total rune bonuses
  const calculateRuneBonuses = () => {
    let totalMoneyBonus = 0;
    let totalRpBonus = 0;
    let totalGemBonus = 0;

    gameState.runes.forEach((amount, index) => {
      const rune = RUNES_1[index];
      if (amount > 0) {
        totalMoneyBonus += (rune.moneyBonus || 0) * amount;
        totalRpBonus += (rune.rpBonus || 0) * amount;
        totalGemBonus += (rune.gemBonus || 0) * amount;
      }
    });

    return { totalMoneyBonus, totalRpBonus, totalGemBonus };
  };

  // Calculate elemental production stats
  const calculateElementalStats = () => {
    const elementalStats = RUNES_2.map((rune, index) => ({
      name: rune.producing || 'Unknown',
      color: rune.color,
      totalProducing: gameState.elementalRunes[index] * (rune.produceAmount || 0),
      currentAmount: gameState.elementalResources[index] || 0,
      runeCount: gameState.elementalRunes[index]
    }));
    
    return elementalStats;
  };

  const runeBonuses = calculateRuneBonuses();
  const elementalStats = calculateElementalStats();
  const currentRunes = gameState.currentRuneType === 'basic' ? RUNES_1 : RUNES_2;
  const currentRuneAmounts = gameState.currentRuneType === 'basic' ? gameState.runes : gameState.elementalRunes;
  
  // Check if any elemental runes exist to show the elemental stats button
  const hasElementalRunes = gameState.elementalRunes.some(amount => amount > 0);

  // Handle rebirth with flash effect
  const handleRebirth = () => {
    setIsFlashing(true);
    performRebirth();
    setTimeout(() => setIsFlashing(false), 800);
  };

  // Console Commands für Developer/Cheat Funktionen
  React.useEffect(() => {
    // Füge Console-Befehle zum globalen Window-Objekt hinzu
    (window as any).MoneyClicker = {
      // Hauptbefehl: give
      give: (thing: string, ...args: any[]) => {
        const thingLower = thing.toLowerCase();
        
        switch(thingLower) {
          case 'money': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give money {number}');
              return;
            }
            console.log(`💰 Giving ${amount} money`);
            devAddMoneyDirect(amount);
            break;
          }
          
          case 'rp': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give rp {number}');
              return;
            }
            console.log(`🔄 Giving ${amount} Rebirth Points`);
            for(let i = 0; i < amount; i++) devAddRebirthPoint();
            break;
          }
          
          case 'gem':
          case 'gems': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give gem {number}');
              return;
            }
            console.log(`💎 Giving ${amount} gems`);
            for(let i = 0; i < amount; i++) devAddGem();
            break;
          }
          
          case 'clicks':
          case 'click': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give clicks {number}');
              return;
            }
            console.log(`👆 Giving ${amount} total clicks`);
            for(let i = 0; i < Math.ceil(amount / 100); i++) devAddClick();
            break;
          }
          
          case 'runes':
          case 'rune': {
            const runeType = args[0]; // 'basic' or 'elemental'
            const rarity = args[1];
            const amount = args[2] || 1;
            
            if (!runeType || !['basic', 'elemental'].includes(runeType.toLowerCase())) {
              console.error('❌ Usage: give runes {type} {rarity} {number}');
              console.error('Types: basic, elemental');
              console.error('Basic rarities: 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary, 6=Mythic, 7=Secret');
              console.error('Elemental rarities: 1=Air, 2=Earth, 3=Water, 4=Fire, 5=Light, 6=Dark');
              return;
            }
            
            if (typeof rarity !== 'number' || rarity < 1) {
              console.error('❌ Invalid rarity number');
              return;
            }
            
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give runes {type} {rarity} {number}');
              return;
            }
            
            if (runeType.toLowerCase() === 'basic') {
              if (rarity > 7) {
                console.error('❌ Basic runes only go up to 7 (Secret Rune)');
                return;
              }
              const runeIndex = rarity - 1;
              const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret'];
              console.log(`🎲 Giving ${amount}x ${rarityNames[runeIndex]} basic runes`);
              for(let i = 0; i < amount; i++) devAddRune(runeIndex);
            } else if (runeType.toLowerCase() === 'elemental') {
              if (rarity > 6) {
                console.error('❌ Elemental runes only go up to 6 (Dark)');
                return;
              }
              const runeIndex = rarity - 1;
              const elementNames = ['Air', 'Earth', 'Water', 'Fire', 'Light', 'Dark'];
              console.log(`⚡ Giving ${amount}x ${elementNames[runeIndex]} elemental runes`);
              for(let i = 0; i < amount; i++) devAddElementalRune(runeIndex);
            }
            break;
          }
          
          default:
            console.error(`❌ Unknown item: ${thing}. Use: money, rp, gem, clicks, runes`);
            (window as any).MoneyClicker.help();
        }
      },
      
      // Legacy-Befehle (für Rückwärtskompatibilität)
      addMoney: (amount: number) => {
        console.warn('⚠️ Deprecated: Use "give money {amount}" instead');
        (window as any).MoneyClicker.give('money', amount);
      },
      addRP: (amount: number) => {
        console.warn('⚠️ Deprecated: Use "give rp {amount}" instead');
        (window as any).MoneyClicker.give('rp', amount);
      },
      addGems: (amount: number) => {
        console.warn('⚠️ Deprecated: Use "give gem {amount}" instead');
        (window as any).MoneyClicker.give('gem', amount);
      },
      addRune: (runeIndex: number, amount: number = 1) => {
        console.warn('⚠️ Deprecated: Use "give runes basic {rarity} {amount}" instead');
        if (runeIndex >= 0 && runeIndex <= 6) {
          (window as any).MoneyClicker.give('runes', 'basic', runeIndex + 1, amount);
        } else {
          console.error('❌ Invalid rune index. Use 0-6 for basic runes');
        }
      },
      
      // Click-Befehle
      addClicks: (amount: number) => {
        console.log(`👆 Adding ${amount} total clicks`);
        for(let i = 0; i < amount; i++) devAddClick();
      },
      
      // Effekt-Befehle
      toggleMoneyEffects: () => {
        const newState = !gameState.disableMoneyEffects;
        console.log(`💰 Money effects ${newState ? 'DISABLED' : 'ENABLED'}`);
        toggleMoneyEffects();
      },
      
      toggleDiamondEffects: () => {
        const newState = !gameState.disableDiamondEffects;
        console.log(`💎 Diamond effects ${newState ? 'DISABLED' : 'ENABLED'}`);
        toggleDiamondEffects();
      },
      
      // Spiel-Befehle
      rebirth: () => {
        console.log('🔄 Performing rebirth');
        performRebirth();
      },
      reset: () => {
        console.log('🔥 Resetting game');
        resetGame();
      },
      
      // Info-Befehle
      gameState: () => {
        console.log('📊 Current game state:', gameState);
        return gameState;
      },
      help: () => {
        console.log(`
🎮 Money Clicker Console Commands:

🎯 MAIN COMMAND (give):
  MoneyClicker.give("money", amount)                    - Give money
  MoneyClicker.give("rp", amount)                       - Give Rebirth Points  
  MoneyClicker.give("gem", amount)                      - Give gems
  MoneyClicker.give("clicks", amount)                   - Give total clicks
  MoneyClicker.give("runes", type, rarity, amount)     - Give runes

🎲 Rune Types & Rarities:
  BASIC RUNES:
    1 = Common      4 = Epic       7 = Secret
    2 = Uncommon    5 = Legendary  
    3 = Rare        6 = Mythic
  
  ELEMENTAL RUNES:
    1 = Air         4 = Fire
    2 = Earth       5 = Light
    3 = Water       6 = Dark

👆 Other Commands:
  MoneyClicker.rebirth()               - Perform rebirth
  MoneyClicker.reset()                 - Reset entire game
  MoneyClicker.gameState()             - Show current game state
  MoneyClicker.toggleMoneyEffects()    - Toggle money floating animations
  MoneyClicker.toggleDiamondEffects()  - Toggle diamond floating animations
  MoneyClicker.help()                  - Show this help

📝 Examples:
  MoneyClicker.give("money", 1000000)              // Give 1M money
  MoneyClicker.give("rp", 100)                     // Give 100 RP
  MoneyClicker.give("gem", 50)                     // Give 50 gems
  MoneyClicker.give("clicks", 1000)                // Give 1000 clicks
  MoneyClicker.give("runes", "basic", 6, 5)        // 5x Mythic basic runes
  MoneyClicker.give("runes", "basic", 7, 1)        // 1x Secret rune
  MoneyClicker.give("runes", "elemental", 1, 10)   // 10x Air runes
  MoneyClicker.give("runes", "elemental", 5, 3)    // 3x Light runes
  MoneyClicker.toggleMoneyEffects()                // Disable/enable money animations
  MoneyClicker.toggleDiamondEffects()              // Disable/enable diamond animations
        `);
      }
    };

    // Cleanup beim unmount
    return () => {
      delete (window as any).MoneyClicker;
    };
  }, [gameState, devAddMoney, devAddMoneyDirect, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, devAddElementalRune, performRebirth, resetGame, toggleMoneyEffects, toggleDiamondEffects]);

  return (
    <div className="app">
      {/* Flash overlay for rebirth effect */}
      {isFlashing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(124, 58, 237, 0.8) 100%)',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'rebirthFlash 0.8s ease-out forwards'
        }} />
      )}
      <header className="app-header">
        <h1>💰 Money Clicker</h1>
        <p>Click to earn money, buy upgrades, and grow your fortune!</p>
      </header>

      <main className="game-container">
        {/* Desktop Layout */}
        <div className="desktop-layout">
          {/* Gem Panel - Permanent, wenn beide Unlocks gekauft */}
          {bothUnlocksOwned && (
            <div className="gem-panel" style={{
            minWidth: '320px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #3165f3ff 0%, #153ca7ff 30%, #000000ff 100%)',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #60a5fa) 1',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            color: 'white',
            position: 'relative',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <h2 style={{ 
              color: '#60a5fa', 
              textAlign: 'center', 
              marginBottom: '24px',
              fontSize: '20px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
              position: 'relative'
            }}>💎 Runes</h2>
            
            {/* Gems Display */}
            <div style={{ 
              marginBottom: '24px', 
              textAlign: 'center',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#60a5fa',
                textShadow: '0 0 8px rgba(96, 165, 250, 0.6)'
              }}>
                💎 {gameState.gems}
              </div>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Gems you own</div>
            </div>

            {/* Buy Pack Button */}
            <div style={{ marginBottom: '24px' }}>
              <button
                onClick={openRunePack}
                disabled={
                  gameState.currentRuneType === 'basic' 
                    ? gameState.gems < 5 
                    : gameState.money < 10000000
                }
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: (
                    gameState.currentRuneType === 'basic' 
                      ? gameState.gems >= 5 
                      : gameState.money >= 10000000
                  )
                    ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)'
                    : 'linear-gradient(135deg, #374151, #4b5563)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (
                    gameState.currentRuneType === 'basic' 
                      ? gameState.gems >= 5 
                      : gameState.money >= 10000000
                  ) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: (
                    gameState.currentRuneType === 'basic' 
                      ? gameState.gems >= 5 
                      : gameState.money >= 10000000
                  )
                    ? '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  transform: (
                    gameState.currentRuneType === 'basic' 
                      ? gameState.gems >= 5 
                      : gameState.money >= 10000000
                  ) ? 'none' : 'scale(0.95)',
                  opacity: (
                    gameState.currentRuneType === 'basic' 
                      ? gameState.gems >= 5 
                      : gameState.money >= 10000000
                  ) ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  const canAfford = gameState.currentRuneType === 'basic' 
                    ? gameState.gems >= 5 
                    : gameState.money >= 10000000;
                  if (canAfford) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  const canAfford = gameState.currentRuneType === 'basic' 
                    ? gameState.gems >= 5 
                    : gameState.money >= 10000000;
                  if (canAfford) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                ✨ {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Rune-Pack ✨<br/>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  {gameState.currentRuneType === 'basic' 
                    ? '💎 5 Gems' 
                    : '💰 10M Money'
                  }
                </span>
              </button>
            </div>

            {/* Rune Collection */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Rune Type Switch Button */}
              <button
                onClick={switchRuneType}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  background: `linear-gradient(135deg, ${
                    gameState.currentRuneType === 'basic'
                      ? '#1d4ed8 0%, #3b82f6 50%, #60a5fa 100%'
                      : '#7c3aed 0%, #a855f7 50%, #c084fc 100%'
                  })`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0,0,0,0.3)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  🎲 {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Rune Collection
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                    Click to switch • {gameState.currentRuneType === 'basic' ? 'Showing Basic Runes' : 'Showing Elemental Runes'}
                  </div>
                </div>
                {/* Animated background effect */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: gameState.currentRuneType === 'basic' ? '-100%' : '0%',
                  width: '100%',
                  height: '2px',
                  background: 'rgba(255,255,255,0.6)',
                  transition: 'left 0.3s ease',
                  transform: 'translateY(-50%)'
                }} />
              </button>
              
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                paddingRight: '8px'
              }}>
                {currentRunes.map((rune: Rune, index: number) => {
                  const runeAmount = currentRuneAmounts[index];
                  const individualBonuses = [];
                  
                  if (rune.moneyBonus && runeAmount > 0) {
                    individualBonuses.push(`💰 +${formatNumberGerman((rune.moneyBonus * runeAmount) * 100, 2)}% Money`);
                  }
                  if (rune.rpBonus && runeAmount > 0) {
                    individualBonuses.push(`🔄 +${formatNumberGerman((rune.rpBonus * runeAmount) * 100, 2)}% Rebirth Points`);
                  }
                  if (rune.gemBonus && runeAmount > 0) {
                    individualBonuses.push(`💎 +${formatNumberGerman((rune.gemBonus * runeAmount) * 100, 3)}% Gem Chance`);
                  }
                  if (rune.producing && runeAmount > 0) {
                    individualBonuses.push(`⚡ Produces ${formatNumberGerman((rune.produceAmount || 0) * runeAmount, 0)} ${rune.producing}/tick`);
                  }
                  
                  return (
                  <div 
                    key={rune.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '12px',
                      background: runeAmount > 0 
                        ? `linear-gradient(135deg, ${rune.color}20, ${rune.color}10)` 
                        : 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      border: runeAmount > 0 
                        ? `1px solid ${rune.color}60` 
                        : '1px solid rgba(255,255,255,0.1)',
                      opacity: runeAmount > 0 ? 1 : 0.6,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      cursor: runeAmount > 0 ? 'help' : 'default',
                      transform: hoveredRune === index ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setHoveredRune(index)}
                    onMouseLeave={() => setHoveredRune(null)}
                  >
                    {runeAmount > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: `linear-gradient(135deg, ${rune.color}15, transparent)`,
                        pointerEvents: 'none'
                      }} />
                    )}
                    <div style={{ zIndex: 1 }}>
                      <div style={{ 
                        color: rune.color, 
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>
                        {rune.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: runeAmount > 0 ? '#e5e7eb' : '#9ca3af'
                      }}>
                        Amount: {runeAmount}x
                      </div>
                      {/* Merge Buttons - nur für Basic Runes und wenn genug vorhanden */}
                      {gameState.currentRuneType === 'basic' && runeAmount >= 3 && index < 5 && (
                        <div style={{ 
                          marginTop: '6px', 
                          display: 'flex', 
                          gap: '4px', 
                          flexWrap: 'wrap'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              mergeRunes(index);
                            }}
                            style={{
                              padding: '3px 6px',
                              fontSize: '9px',
                              background: `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`,
                              border: `1px solid ${rune.color}`,
                              borderRadius: '3px',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '45px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}60, ${rune.color}40)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`;
                            }}
                          >
                            🔄 3→1
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              mergeAllRunes(index);
                            }}
                            style={{
                              padding: '3px 6px',
                              fontSize: '9px',
                              background: `linear-gradient(135deg, ${rune.color}60, ${rune.color}30)`,
                              border: `1px solid ${rune.color}`,
                              borderRadius: '3px',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '45px',
                              fontWeight: 'bold'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}80, ${rune.color}50)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}60, ${rune.color}30)`;
                            }}
                            title={`Merge all possible (${Math.floor(runeAmount / 3)} merges)`}
                          >
                            ⚡ ALL
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#3b82f6',
                      textAlign: 'right',
                      zIndex: 1
                    }}>
                      <div>{(rune.dropRate / 10).toFixed(1)}%</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>Drop Rate</div>
                    </div>
                    
                    {/* Custom Tooltip */}
                    {hoveredRune === index && runeAmount > 0 && individualBonuses.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-100%)',
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        border: `2px solid ${rune.color}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${rune.color}40`,
                        zIndex: 1000,
                        minWidth: '200px',
                        animation: 'tooltipFadeIn 0.2s ease-out',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{
                          color: rune.color,
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '8px',
                          textAlign: 'center',
                          textShadow: `0 0 8px ${rune.color}`
                        }}>
                          ✨ Active Effects ✨
                        </div>
                        {individualBonuses.map((bonus, bonusIndex) => (
                          <div key={bonusIndex} style={{
                            color: '#e2e8f0',
                            fontSize: '12px',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}>
                            {bonus}
                          </div>
                        ))}
                        
                        {/* Tooltip Arrow */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0',
                          height: '0',
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `8px solid ${rune.color}`
                        }} />
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Active Bonuses */}
            {(runeBonuses.totalMoneyBonus > 0 || runeBonuses.totalRpBonus > 0 || runeBonuses.totalGemBonus > 0) && (
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                marginTop: '16px'
              }}>
                <div style={{ 
                  color: '#60a5fa', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontSize: '16px',
                  textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚡ Activ Bonus
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {runeBonuses.totalMoneyBonus > 0 && (
                    <div style={{ 
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span>💰</span>
                      <span>+{formatNumberGerman(runeBonuses.totalMoneyBonus * 100, 2)}% Money</span>
                    </div>
                  )}
                  {runeBonuses.totalRpBonus > 0 && (
                    <div style={{ 
                      color: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <span>🔄</span>
                      <span>+{formatNumberGerman(runeBonuses.totalRpBonus * 100, 2)}% Rebirth Points</span>
                    </div>
                  )}
                  {runeBonuses.totalGemBonus > 0 && (
                    <div style={{ 
                      color: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <span>💎</span>
                      <span>+{formatNumberGerman(runeBonuses.totalGemBonus * 100, 3)}% Gem Chance</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

          <div className="left-panel">
          {/* Normale Stats - nur anzeigen wenn Elemental Stats nicht aktiv sind */}
          {!gameState.showElementalStats && (
            <GameStats 
              gameState={gameState} 
            />
          )}

          {/* Elemental Stats Panel - ersetzt normale Stats wenn aktiv */}
          {gameState.showElementalStats && hasElementalRunes && (
            <div className="elemental-stats-panel" style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 30%, #3b82f6 100%)',
              border: '3px solid',
              borderImage: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc) 1',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: 'white',
              position: 'relative'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
              
              <h3 style={{
                color: '#c084fc',
                textAlign: 'center',
                marginBottom: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
                position: 'relative'
              }}>⚡ Elemental Production</h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '12px',
                position: 'relative'
              }}>
                {elementalStats.map((stat, index) => (
                  <div key={index} style={{
                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                    border: `1px solid ${stat.color}60`,
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: stat.runeCount > 0 ? 'help' : 'default',
                    opacity: stat.runeCount > 0 ? 1 : 0.6
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: stat.color,
                      marginBottom: '4px',
                      textShadow: `0 0 6px ${stat.color}`
                    }}>
                      {stat.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#e2e8f0',
                      marginBottom: '2px'
                    }}>
                      Stored: {formatNumberGerman(stat.currentAmount)}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#cbd5e1',
                      marginBottom: '2px'
                    }}>
                      +{stat.totalProducing}/tick
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: stat.color,
                      opacity: 0.8
                    }}>
                      {stat.runeCount} rune{stat.runeCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Elemental Stats Button - appears when first elemental rune is obtained */}
          {hasElementalRunes && (
            <div className="Elemental-Stats-Switch" style={{ marginBottom: '16px' }}>
              <button
                onClick={toggleElementalStats}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: gameState.showElementalStats
                    ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)'
                    : 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0,0,0,0.3)',
                  boxShadow: gameState.showElementalStats
                    ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                    : '0 4px 12px rgba(107, 114, 128, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = gameState.showElementalStats
                    ? '0 6px 20px rgba(124, 58, 237, 0.4)'
                    : '0 6px 20px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = gameState.showElementalStats
                    ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                    : '0 4px 12px rgba(107, 114, 128, 0.3)';
                }}
              >
                <span>⚡</span>
                <span>{gameState.showElementalStats ? 'Hide' : 'Show'} Elemental Stats</span>
                <span style={{ 
                  fontSize: '12px', 
                  opacity: 0.8,
                  marginLeft: '4px'
                }}>
                  {gameState.showElementalStats ? '👁️' : '👁️‍🗨️'}
                </span>
              </button>
            </div>
          )}

          {(gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) && (
            <div className="Upgrade/Rebirth-Switch">
              <SwitchButton
                label1="Upgrades"
                label2="Rebirth"
                onSwitch={setActivePanel}
                activePanel={activePanel}
                />
            </div>
          )}
          
          <div className="click-area">
            <MoneyButton 
              onClick={clickMoney} 
              gameState={gameState}
              onGemDrop={() => {
                // Optional: Add sound effect or additional visual feedback here
                console.log('💎 Gem obtained!');
              }}
            />
          </div>

          <ActionButtons
            money={gameState.money}
            onRebirth={handleRebirth}
            onReset={resetGame}
            onCheat={cheatMoney}
            moneyPerClick={gameState.moneyPerClick}
            gameState={gameState}
          />
        </div>

        <div className="right-Upgrade-panel">
          {activePanel === 'upgrades' ? (
            <UpgradesPanel 
              gameState={gameState} 
              buyUpgrade={buyUpgrade} 
            />
          ) : (gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) ? (
            <RebirthPanel
              gameState={gameState}
              buyRebirthUpgrade={buyRebirthUpgrade}
            />
          ) : (
            <UpgradesPanel 
              gameState={gameState} 
              buyUpgrade={buyUpgrade} 
            />
          )}
        </div>
        </div>

        {/* Mobile Layout */}
        <div className="mobile-layout">
          <MobileTabNavigation
            activeTab={mobileActiveTab}
            onTabChange={setMobileActiveTab}
            hasGems={bothUnlocksOwned}
            hasRebirth={isRebirthUnlocked}
            showDev={import.meta.env.DEV}
          />

          <div className="mobile-tab-content">
            {mobileActiveTab === 'stats' && (
              <div className="mobile-stats-tab">
                {/* Mobile Stats - nur anzeigen wenn Elemental Stats nicht aktiv sind */}
                {!gameState.showElementalStats && (
                  <GameStats 
                    gameState={gameState} 
                  />
                )}

                {/* Mobile Elemental Stats Panel - ersetzt normale Stats wenn aktiv */}
                {gameState.showElementalStats && hasElementalRunes && (
                  <div className="elemental-stats-panel" style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 30%, #3b82f6 100%)',
                    border: '3px solid',
                    borderImage: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc) 1',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    position: 'relative'
                  }}>
                    {/* Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      bottom: '0',
                      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
                      pointerEvents: 'none'
                    }} />
                    
                    <h3 style={{
                      color: '#c084fc',
                      textAlign: 'center',
                      marginBottom: '16px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
                      position: 'relative'
                    }}>⚡ Elemental Production</h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                      gap: '12px',
                      position: 'relative'
                    }}>
                      {elementalStats.map((stat, index) => (
                        <div key={index} style={{
                          background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                          border: `1px solid ${stat.color}60`,
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          cursor: stat.runeCount > 0 ? 'help' : 'default',
                          opacity: stat.runeCount > 0 ? 1 : 0.6
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: stat.color,
                            marginBottom: '4px',
                            textShadow: `0 0 6px ${stat.color}`
                          }}>
                            {stat.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#e2e8f0',
                            marginBottom: '2px'
                          }}>
                            Stored: {formatNumberGerman(stat.currentAmount)}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#cbd5e1',
                            marginBottom: '2px'
                          }}>
                            +{stat.totalProducing}/tick
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: stat.color,
                            opacity: 0.8
                          }}>
                            {stat.runeCount} rune{stat.runeCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Elemental Stats Button - appears when first elemental rune is obtained */}
                {hasElementalRunes && (
                  <div className="mobile-elemental-stats-switch" style={{ marginBottom: '16px' }}>
                    <button
                      onClick={toggleElementalStats}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: gameState.showElementalStats
                          ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)'
                          : 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textShadow: '0 0 8px rgba(0,0,0,0.3)',
                        boxShadow: gameState.showElementalStats
                          ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                          : '0 4px 12px rgba(107, 114, 128, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = gameState.showElementalStats
                          ? '0 6px 20px rgba(124, 58, 237, 0.4)'
                          : '0 6px 20px rgba(107, 114, 128, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = gameState.showElementalStats
                          ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                          : '0 4px 12px rgba(107, 114, 128, 0.3)';
                      }}
                    >
                      <span>⚡</span>
                      <span>{gameState.showElementalStats ? 'Hide' : 'Show'} Elemental Stats</span>
                      <span style={{ 
                        fontSize: '12px', 
                        opacity: 0.8,
                        marginLeft: '4px'
                      }}>
                        {gameState.showElementalStats ? '👁️' : '👁️‍🗨️'}
                      </span>
                    </button>
                  </div>
                )}
                
                <div className="mobile-click-area" style={{ position: 'relative', zIndex: 1 }}>
                  <MoneyButton 
                    onClick={clickMoney} 
                    gameState={gameState}
                    onGemDrop={() => {
                      console.log('💎 Gem obtained!');
                    }}
                  />
                </div>

                <ActionButtons
                  money={gameState.money}
                  onRebirth={handleRebirth}
                  onReset={resetGame}
                  onCheat={cheatMoney}
                  moneyPerClick={gameState.moneyPerClick}
                  gameState={gameState}
                />
              </div>
            )}

            {mobileActiveTab === 'upgrades' && (
              <UpgradesPanel 
                gameState={gameState} 
                buyUpgrade={buyUpgrade} 
              />
            )}

            {mobileActiveTab === 'rebirth' && isRebirthUnlocked && (
              <RebirthPanel
                gameState={gameState}
                buyRebirthUpgrade={buyRebirthUpgrade}
              />
            )}

            {mobileActiveTab === 'gems' && bothUnlocksOwned && (
              <div className="mobile-gem-panel">
                {/* Gem Panel Content für Mobile */}
                <h2 style={{ 
                  color: '#60a5fa', 
                  textAlign: 'center', 
                  marginBottom: '24px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }}>💎 Runes</h2>
                
                {/* Gems Display */}
                <div style={{ 
                  marginBottom: '24px', 
                  textAlign: 'center',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: '#60a5fa',
                    textShadow: '0 0 8px rgba(96, 165, 250, 0.6)'
                  }}>
                    💎 {gameState.gems}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Gems you own</div>
                </div>

                {/* Buy Pack Button */}
                <div style={{ marginBottom: '24px' }}>
                  <button
                    onClick={openRunePack}
                    disabled={
                      gameState.currentRuneType === 'basic' 
                        ? gameState.gems < 5 
                        : gameState.money < 10000000
                    }
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      background: (
                        gameState.currentRuneType === 'basic' 
                          ? gameState.gems >= 5 
                          : gameState.money >= 10000000
                      )
                        ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)'
                        : 'linear-gradient(135deg, #374151, #4b5563)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (
                        gameState.currentRuneType === 'basic' 
                          ? gameState.gems >= 5 
                          : gameState.money >= 10000000
                      ) ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      opacity: (
                        gameState.currentRuneType === 'basic' 
                          ? gameState.gems >= 5 
                          : gameState.money >= 10000000
                      ) ? 1 : 0.6
                    }}
                  >
                    ✨ {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Rune-Pack ✨<br/>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>
                      {gameState.currentRuneType === 'basic' 
                        ? '💎 5 Gems' 
                        : '💰 10M Money'
                      }
                    </span>
                  </button>
                </div>

                {/* Mobile Rune Collection */}
                <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  paddingBottom: '20px'
                }}>
                  {/* Mobile Rune Type Switch Button */}
                  <button
                    onClick={switchRuneType}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: `linear-gradient(135deg, ${
                        gameState.currentRuneType === 'basic'
                          ? '#1d4ed8 0%, #3b82f6 50%, #60a5fa 100%'
                          : '#7c3aed 0%, #a855f7 50%, #c084fc 100%'
                      })`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0,0,0,0.3)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🎲 {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Runes
                  </button>
                  
                  {currentRunes.map((rune: Rune, index: number) => {
                    const runeAmount = currentRuneAmounts[index];
                    return (
                      <div 
                        key={rune.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          background: runeAmount > 0 
                            ? `linear-gradient(135deg, ${rune.color}20, ${rune.color}10)` 
                            : 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          border: runeAmount > 0 
                            ? `1px solid ${rune.color}60` 
                            : '1px solid rgba(255,255,255,0.1)',
                          opacity: runeAmount > 0 ? 1 : 0.6,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => setHoveredRune(index)}
                        onMouseLeave={() => setHoveredRune(null)}
                        onTouchStart={() => setHoveredRune(index)}
                        onTouchEnd={() => setTimeout(() => setHoveredRune(null), 2000)}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            color: rune.color, 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginBottom: '2px'
                          }}>
                            {rune.name}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#94a3b8',
                            lineHeight: 1.3,
                            marginBottom: '4px'
                          }}>
                            {rune.rarity} Rune • {(rune.dropRate / 10)}% drop
                          </div>
                          
                          {/* Bonus Information */}
                          {hoveredRune === index && (
                            <div style={{
                              fontSize: '10px',
                              color: '#60a5fa',
                              lineHeight: 1.2,
                              marginTop: '4px',
                              padding: '4px 6px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '4px',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                              {rune.moneyBonus && `💰 +${(rune.moneyBonus * 100)}% Money`}
                              {rune.rpBonus && `${rune.moneyBonus ? ' • ' : ''}🔄 +${(rune.rpBonus * 100)}% RP`}
                              {rune.gemBonus && `${(rune.moneyBonus || rune.rpBonus) ? ' • ' : ''}💎 +${(rune.gemBonus * 100)}% Gem`}
                              {rune.producing && `🌟 Produces ${rune.producing} (+${rune.produceAmount}/tick)`}
                              {rune.tickBonus && `${(rune.moneyBonus || rune.rpBonus || rune.gemBonus) ? ' • ' : ''}⚡ -${rune.tickBonus}ms tick`}
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '4px'
                        }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#60a5fa',
                            fontSize: '16px'
                          }}>
                            {runeAmount}
                          </div>
                          {/* Mobile Merge Buttons - nur für Basic Runes */}
                          {gameState.currentRuneType === 'basic' && runeAmount >= 3 && index < 5 && (
                            <div style={{ display: 'flex', gap: '3px', flexDirection: 'column' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mergeRunes(index);
                                }}
                                style={{
                                  padding: '2px 5px',
                                  fontSize: '8px',
                                  background: `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`,
                                  border: `1px solid ${rune.color}`,
                                  borderRadius: '3px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '35px'
                                }}
                              >
                                🔄 3→1
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mergeAllRunes(index);
                                }}
                                style={{
                                  padding: '2px 5px',
                                  fontSize: '8px',
                                  background: `linear-gradient(135deg, ${rune.color}60, ${rune.color}30)`,
                                  border: `1px solid ${rune.color}`,
                                  borderRadius: '3px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '35px',
                                  fontWeight: 'bold'
                                }}
                                title={`Merge all (${Math.floor(runeAmount / 3)})`}
                              >
                                ⚡ ALL
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Active Bonuses für Mobile */}
                {(runeBonuses.totalMoneyBonus > 0 || runeBonuses.totalRpBonus > 0 || runeBonuses.totalGemBonus > 0) && (
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    marginTop: '16px'
                  }}>
                    <div style={{ 
                      color: '#60a5fa', 
                      fontWeight: 'bold', 
                      marginBottom: '12px',
                      fontSize: '16px',
                      textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      ⚡ Active Bonus
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {runeBonuses.totalMoneyBonus > 0 && (
                        <div style={{ 
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          <span>💰</span>
                          <span>+{formatNumberGerman(runeBonuses.totalMoneyBonus * 100, 2)}% Money</span>
                        </div>
                      )}
                      {runeBonuses.totalRpBonus > 0 && (
                        <div style={{ 
                          color: '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <span>🔄</span>
                          <span>+{formatNumberGerman(runeBonuses.totalRpBonus * 100, 2)}% Rebirth Points</span>
                        </div>
                      )}
                      {runeBonuses.totalGemBonus > 0 && (
                        <div style={{ 
                          color: '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          <span>💎</span>
                          <span>+{formatNumberGerman(runeBonuses.totalGemBonus * 100, 3)}% Gem Chance</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {mobileActiveTab === 'dev' && import.meta.env.DEV && (
              <div className="mobile-dev-panel">
                <h2 style={{ 
                  color: '#ff6b6b', 
                  textAlign: 'center', 
                  marginBottom: '24px',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>🔧 Dev Tools</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={devAddMoney}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    💰 +100K Money
                  </button>
                  <button 
                    onClick={devAddRebirthPoint}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    🔄 +10 Rebirth Points
                  </button>
                  <button 
                    onClick={devAddGem}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#9c27b0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    💎 +10 Gems
                  </button>
                  <button
                    onClick={devAddClick}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#504f4fff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    👆 +100 Clicks
                  </button>
                  
                  {/* Rune Buttons */}
                  <div style={{ 
                    borderTop: '2px solid rgba(255, 255, 255, 0.3)', 
                    marginTop: '16px', 
                    paddingTop: '16px'
                  }}>
                    <h3 style={{ 
                      fontSize: '16px',
                      color: '#60a5fa',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      🎲 Add Basic Runes
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                      {RUNES_1.map((rune, index) => (
                        <button 
                          key={rune.id}
                          onClick={() => devAddRune(index)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: rune.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                          }}
                          title={`Add 1x ${rune.name}`}
                        >
                          +{rune.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    
                    <h3 style={{ 
                      fontSize: '16px',
                      color: '#c084fc',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      ⚡ Add Elemental Runes
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {RUNES_2.map((rune, index) => (
                        <button 
                          key={rune.id}
                          onClick={() => devAddElementalRune(index)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: rune.color,
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                          }}
                          title={`Add 1x ${rune.name}`}
                        >
                          +{rune.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Development Panel - Nur in Dev Mode sichtbar und nur auf Desktop */}
      {import.meta.env.DEV && (
        <div className="dev-panel" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#ff6b6b',
          border: '2px solid #ff5252',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
          zIndex: 1000,
          display: window.innerWidth <= 1400 ? 'none' : 'block'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '14px' }}>🔧 Dev Tools</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={devAddMoney}
              style={{
                padding: '6px 12px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              +100K Money
            </button>
            <button 
              onClick={devAddRebirthPoint}
              style={{
                padding: '6px 12px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              +10 Rebirth Point
            </button>
            <button 
              onClick={devAddGem}
              style={{
                padding: '6px 12px',
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              +10 Gem
            </button>
            <button
              onClick={devAddClick}
              style={{
                padding: '6px 12px',
                backgroundColor: '#504f4fff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize:'12px'
              }}
            >
              +100 Clicks
            </button>
            
            {/* Rune Buttons */}
            <div style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.3)', 
              marginTop: '8px', 
              paddingTop: '8px',
              fontSize: '11px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              🎲 Basic Runes:
            </div>
            {RUNES_1.map((rune, index) => (
              <button 
                key={rune.id}
                onClick={() => devAddRune(index)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: rune.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  marginBottom: '2px'
                }}
                title={`Add 1x ${rune.name}`}
              >
                +{rune.name.split(' ')[0]}
              </button>
            ))}
            <div style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.3)', 
              marginTop: '4px', 
              paddingTop: '4px',
              fontSize: '11px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ⚡ Elemental Runes:
            </div>
            {RUNES_2.map((rune, index) => (
              <button 
                key={rune.id}
                onClick={() => devAddElementalRune(index)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: rune.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  marginBottom: '2px'
                }}
                title={`Add 1x ${rune.name}`}
              >
                +{rune.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>React Money Clicker v0.0.5 | Your progress is automatically saved!</p>
      </footer>
      
      {/* Tooltip Animation CSS */}
      <style>{`
        @keyframes tooltipFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
