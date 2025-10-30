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
import { RUNES, type Rune, formatNumberGerman } from './types';
import './App.css';

function App() {
  const { gameState, clickMoney, buyUpgrade, buyRebirthUpgrade, performRebirth, resetGame, cheatMoney, devAddMoney, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, openRunePack, mergeRunes } = useGameLogic();
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
      const rune = RUNES[index];
      if (amount > 0) {
        totalMoneyBonus += (rune.moneyBonus || 0) * amount;
        totalRpBonus += (rune.rpBonus || 0) * amount;
        totalGemBonus += (rune.gemBonus || 0) * amount;
      }
    });

    return { totalMoneyBonus, totalRpBonus, totalGemBonus };
  };

  const runeBonuses = calculateRuneBonuses();

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
            for(let i = 0; i < amount; i++) devAddMoney();
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
          
          case 'runes': {
            const rarity = args[0];
            const amount = args[1] || 1;
            
            if (typeof rarity !== 'number' || rarity < 1 || rarity > 6) {
              console.error('❌ Usage: give runes {rarity} {number} (rarity: 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary, 6=Mythic)');
              return;
            }
            
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give runes {rarity} {number}');
              return;
            }
            
            const runeIndex = rarity - 1; // Convert 1-6 to 0-5
            const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
            console.log(`🎲 Giving ${amount}x ${rarityNames[runeIndex]} runes`);
            for(let i = 0; i < amount; i++) devAddRune(runeIndex);
            break;
          }

          case 'gemchance':
          case 'gem-chance':
          case 'chance': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give gemchance {number} (adds temporary gem chance boost)');
              return;
            }
            console.log(`💎 Temporarily boosting gem chance by +${amount}%`);
            // This would need implementation in useGameLogic to actually work
            console.warn('⚠️ Gem chance boost not yet implemented - use runes for permanent gem chance bonus');
            break;
          }
          
          default:
            console.error(`❌ Unknown item: ${thing}. Use: money, rp, gem, runes, gemchance`);
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
        console.warn('⚠️ Deprecated: Use "give runes {rarity} {amount}" instead');
        (window as any).MoneyClicker.give('runes', runeIndex + 1, amount);
      },
      
      // Click-Befehle
      addClicks: (amount: number) => {
        console.log(`👆 Adding ${amount} total clicks`);
        for(let i = 0; i < amount; i++) devAddClick();
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
  MoneyClicker.give("money", amount)         - Give money
  MoneyClicker.give("rp", amount)            - Give Rebirth Points  
  MoneyClicker.give("gem", amount)           - Give gems
  MoneyClicker.give("runes", rarity, amount) - Give runes
  MoneyClicker.give("gemchance", amount)     - Boost gem chance (temporary)

🎲 Rune Rarities:
  1 = Common      4 = Epic
  2 = Uncommon    5 = Legendary  
  3 = Rare        6 = Mythic

👆 Other Commands:
  MoneyClicker.addClicks(amount)    - Add total clicks
  MoneyClicker.rebirth()            - Perform rebirth
  MoneyClicker.reset()              - Reset entire game
  MoneyClicker.gameState()          - Show current game state
  MoneyClicker.help()               - Show this help

📝 Examples:
  MoneyClicker.give("money", 1000000)
  MoneyClicker.give("rp", 100)
  MoneyClicker.give("gem", 50)
  MoneyClicker.give("runes", 6, 5)    // 5x Mythic runes
  MoneyClicker.give("gemchance", 10)  // +10% gem chance boost
        `);
      }
    };

    // Cleanup beim unmount
    return () => {
      delete (window as any).MoneyClicker;
    };
  }, [gameState, devAddMoney, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, performRebirth, resetGame]);

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
                disabled={gameState.gems < 5}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: gameState.gems >= 5 
                    ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)'
                    : 'linear-gradient(135deg, #374151, #4b5563)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: gameState.gems >= 5 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  boxShadow: gameState.gems >= 5 
                    ? '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                  transform: gameState.gems >= 5 ? 'none' : 'scale(0.95)',
                  opacity: gameState.gems >= 5 ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (gameState.gems >= 5) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (gameState.gems >= 5) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                ✨ Basic Rune-Pack ✨<br/>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>💎 5 Gems</span>
              </button>
            </div>

            {/* Rune Collection */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                color: '#60a5fa', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                fontSize: '16px',
                textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
                borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
                paddingBottom: '8px'
              }}>
                🎲 Rune Collection
              </div>
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                paddingRight: '8px'
              }}>
                {RUNES.map((rune: Rune, index: number) => {
                  const runeAmount = gameState.runes[index];
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
                    {gameState.runes[index] > 0 && (
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
                      {/* Merge Button - nur anzeigen wenn genug Runen vorhanden und nicht höchste Stufe */}
                      {runeAmount >= 3 && index < 5 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mergeRunes(index);
                          }}
                          style={{
                            marginTop: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            background: `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`,
                            border: `1px solid ${rune.color}`,
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
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
                          🔄 Merge 3→1
                        </button>
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
                          ✨ Activ Bonus ✨
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
          <GameStats 
            gameState={gameState} 
          />

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
                <GameStats 
                  gameState={gameState} 
                />
                
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
                    disabled={gameState.gems < 5}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      background: gameState.gems >= 5 
                        ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)'
                        : 'linear-gradient(135deg, #374151, #4b5563)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: gameState.gems >= 5 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      opacity: gameState.gems >= 5 ? 1 : 0.6
                    }}
                  >
                    ✨ Basic Rune-Pack ✨<br/>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>💎 5 Gems</span>
                  </button>
                </div>

                {/* Mobile Rune Collection */}
                <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  paddingBottom: '20px'
                }}>
                  <div style={{ 
                    color: '#60a5fa', 
                    fontWeight: 'bold', 
                    marginBottom: '8px',
                    fontSize: '16px',
                    textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
                    borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
                    paddingBottom: '8px'
                  }}>
                    🎲 Rune Collection
                  </div>
                  {RUNES.map((rune: Rune, index: number) => {
                    const runeAmount = gameState.runes[index];
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
                          opacity: runeAmount > 0 ? 1 : 0.6
                        }}
                      >
                        <div>
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
                            lineHeight: 1.3
                          }}>
                            {rune.rarity} Rune
                          </div>
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
                          {/* Mobile Merge Button */}
                          {runeAmount >= 3 && index < 5 && (
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
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              🔄 3→1
                            </button>
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
                    💰 +Money
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
                      🎲 Add Runes
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {RUNES.map((rune, index) => (
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Development Panel - Nur in Dev Mode sichtbar */}
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
          zIndex: 1000
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
              🎲 Add Runes:
            </div>
            {RUNES.map((rune, index) => (
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
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
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
        <p>React Money Clicker v0.0.4 | Your progress is automatically saved!</p>
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
