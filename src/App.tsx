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
import { RUNES, type Rune, formatNumberGerman } from './types';
import './App.css';

function App() {
  const { gameState, clickMoney, buyUpgrade, buyRebirthUpgrade, performRebirth, resetGame, cheatMoney, devAddMoney, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, openRunePack } = useGameLogic();
  const [activePanel, setActivePanel] = useState<'upgrades' | 'rebirth'>('upgrades');
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

  return (
    <div className="app" style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
      <header className="app-header" style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '0 0 16px 16px',
        padding: '12px',
        textAlign: 'center',
        marginBottom: '0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.4)'
      }}>
        <h1 style={{
          color: '#22c55e',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
          margin: '0 0 4px 0'
        }}>💰 Money Clicker</h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          margin: '0'
        }}>Click to earn money, buy upgrades, and grow your fortune!</p>
      </header>

      <main className="game-container" style={{ 
        display: 'flex', 
        gap: '12px', 
        maxWidth: bothUnlocksOwned ? '1400px' : '1000px', 
        margin: '0 auto', 
        transition: 'max-width 0.3s ease',
        padding: '12px',
        background: 'rgba(15, 23, 42, 0.3)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(100, 116, 139, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        flex: 1,
        overflow: 'hidden'
      }}>
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
            overflow: 'hidden'
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

        <div className="left-panel" style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
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

        <div className="right-Upgrade-panel" style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          minWidth: '350px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
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

      <footer className="app-footer" style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '16px 16px 0 0',
        padding: '8px',
        textAlign: 'center',
        marginTop: '0',
        color: '#94a3b8'
      }}>
        <p style={{ margin: '0', fontSize: '12px' }}>React Money Clicker v0.9 | Your progress is automatically saved!</p>
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
