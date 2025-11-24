import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { GameState } from '../types';
import { formatNumberGerman } from '../types/German_number';
import { RUNES_1 } from '../types/Runes';
import { REBIRTHUPGRADES } from '../types/Rebirth_Upgrade';


interface GameStatsProps {
  gameState: GameState;
}

const GameStats = ({ gameState }: GameStatsProps) => {
  const [hoveredStat, setHoveredStat] = useState<'click' | 'tick' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipBelow, setTooltipBelow] = useState(true); // Standardmäßig unten
  const [showTooltip, setShowTooltip] = useState(false);
  const clickRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = useCallback((element: HTMLDivElement | null, statType: 'click' | 'tick') => {
    if (element) {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 280; // minWidth des Tooltips
      const tooltipHeight = 200; // geschätzte Höhe
      const margin = 20; // Mindestabstand vom Bildschirmrand
      
      let x = rect.left + rect.width / 2;
      let y = rect.bottom + 10; // Standardmäßig unter dem Element
      let showBelow = true; // Standardmäßig unten anzeigen
      
      // Nur wenn nicht genug Platz unten ist, nach oben wechseln
      if (rect.bottom + tooltipHeight + 10 > window.innerHeight - margin) {
        y = rect.top - 10; // Über dem Element anzeigen wenn zu wenig Platz unten
        showBelow = false;
      }
      
      // Horizontale Grenze prüfen
      if (x - tooltipWidth / 2 < margin) {
        x = margin + tooltipWidth / 2; // Links begrenzen
      } else if (x + tooltipWidth / 2 > window.innerWidth - margin) {
        x = window.innerWidth - margin - tooltipWidth / 2; // Rechts begrenzen
      }
      
      // Alle States in einem Update setzen um Flackern zu vermeiden
      setTooltipPosition({ x, y });
      setTooltipBelow(showBelow);
      setHoveredStat(statType);
      setShowTooltip(true); // Sofort anzeigen
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredStat(null);
    setShowTooltip(false);
  }, []);

  // Calculate all multipliers exactly like in the game logic
  const calculateActualValues = () => {
    // Rebirth Upgrade 0 multiplier (Total Clicks multiplier)
    let clickMultiplier = 1;
    if (gameState.rebirth_upgradeAmounts[0] > 0) {
      const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
      clickMultiplier = Math.pow(gameState.clicksTotal + 1, exponent); // +1 for next click
    }

    // Rune bonuses
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

    const runeMultiplier = 1 + totalMoneyBonus;

    // Rebirth Upgrade 4 multiplier (Rebirth Points money boost)
    let rebirthPointMultiplier = 1;
    if (gameState.rebirth_upgradeAmounts[4] > 0) {
      const effectValue = REBIRTHUPGRADES[4].effect; // 0.05
      const bonus = Math.log(gameState.rebirthPoints + 1) * effectValue; // log(RP + 1) * 0.05 als Decimal
      rebirthPointMultiplier = 1 + bonus;
    }

    // Calculate final values
    const perClickTotal = gameState.moneyPerClick * clickMultiplier * runeMultiplier * rebirthPointMultiplier;
    const perTickTotal = gameState.moneyPerTick * clickMultiplier * runeMultiplier * rebirthPointMultiplier;

    return { 
      perClickTotal, 
      perTickTotal, 
      totalMoneyBonus, 
      totalRpBonus, 
      totalGemBonus,
      clickMultiplier,
      runeMultiplier,
      rebirthPointMultiplier
    };
  };

  const values = calculateActualValues();
  
  // Zeige Gems nur wenn das dritte Rebirth-Upgrade gekauft wurde
  const showGems = gameState.rebirth_upgradeAmounts && gameState.rebirth_upgradeAmounts[2] > 0;
  
  // Calculate gem chance if gems are unlocked
  const calculateGemChance = () => {
    if (!showGems) return 0;
    const baseGemChance = 0.005; // 0.5% base chance
    const bonusGemChance = values.totalGemBonus;
    return baseGemChance + bonusGemChance;
  };
  
  const gemChance = calculateGemChance();

  return (
    <div className="game-stats" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      border: '2px solid #64748b',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      color: 'white',
      marginBottom: '20px'
    }}>
      <h1 className="money-display" style={{
        color: '#22c55e',
        fontSize: '28px',
        fontWeight: 'bold',
        textShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
        textAlign: 'center',
        marginBottom: '20px'
      }}>💰 {formatNumberGerman(gameState.money)}$</h1>
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        <div 
          ref={clickRef}
          className="stat-item" 
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'help',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={() => updateTooltipPosition(clickRef.current, 'click')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="stat-label" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Per Click:</span>
          <span className="stat-value" style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(values.perClickTotal)}$
            {(values.clickMultiplier > 1 || values.runeMultiplier > 1 || values.rebirthPointMultiplier > 1) && (
              <span style={{ fontSize: '0.9em', color: '#94a3b8' }}> ({formatNumberGerman(gameState.moneyPerClick)}$)</span>
            )}
          </span>
        </div>
        
        <div 
          ref={tickRef}
          className="stat-item" 
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'help',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={() => updateTooltipPosition(tickRef.current, 'tick')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="stat-label" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Per Tick:</span>
          <span className="stat-value" style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(values.perTickTotal)}$/s
            {(values.clickMultiplier > 1 || values.runeMultiplier > 1 || values.rebirthPointMultiplier > 1) && (
              <span style={{ fontSize: '0.9em', color: '#94a3b8' }}> ({formatNumberGerman(gameState.moneyPerTick)}$)</span>
            )}
          </span>
        </div>
        {(gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) && (
          <div className="stat-item" style={{
            background: 'rgba(147, 51, 234, 0.2)',
            border: '2px solid rgba(147, 51, 234, 0.5)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span className="stat-label" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Rebirth Points:</span>
            <span className="stat-value" style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(Math.floor(gameState.rebirthPoints))}</span>
          </div>
        )}
        {showGems && (
          <div className="stat-item" style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span className="stat-label" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>💎 Gems:</span>
            <span className="stat-value" style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(gameState.gems)}</span>
          </div>
        )}
        {showGems && (
          <div className="stat-item" style={{
            background: 'rgba(245, 158, 11, 0.2)',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span className="stat-label" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>💎 Chance:</span>
            <span className="stat-value" style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '16px' }}>
              {formatNumberGerman(gemChance * 100, 2)}%
              {values.totalGemBonus > 0 && (
                <span style={{ fontSize: '0.9em', color: '#94a3b8' }}> (0,5%)</span>
              )}
            </span>
          </div>
        )}
        <div className="stat-item" style={{
          background: 'rgba(100, 116, 139, 0.25)',
          border: '2px solid rgba(100, 116, 139, 0.6)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <span className="stat-label" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Total Clicks:</span>
          <span className="stat-value" style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(gameState.clicksTotal)}</span>
        </div>
      </div>
      
      {/* Portal Tooltips - werden am document.body angehängt */}
      {hoveredStat && showTooltip && typeof document !== 'undefined' && (
        <>
          {createPortal(
            <div style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: tooltipBelow ? 'translateX(-50%) translateY(0%)' : 'translateX(-50%) translateY(-100%)',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '2px solid #22c55e',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(34, 197, 94, 0.4)',
              zIndex: 9999,
              minWidth: '280px',
              animation: `tooltipFadeIn${tooltipBelow ? 'Below' : 'Above'} 0.2s ease-out`,
              backdropFilter: 'blur(10px)',
              pointerEvents: 'none'
            }}>
              <div style={{
                color: '#22c55e',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '12px',
                textAlign: 'center',
                textShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
              }}>
                {hoveredStat === 'click' ? '💰 Money per Click Breakdown' : '⏰ Money per Tick Breakdown'}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  color: '#e2e8f0',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span>🔨 Base Amount:</span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                    {formatNumberGerman(hoveredStat === 'click' ? gameState.moneyPerClick : gameState.moneyPerTick)}$
                  </span>
                </div>
                
                {values.clickMultiplier > 1 && (
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    background: 'rgba(147, 51, 234, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}>
                    <span>🔄 Click Multiplier (Level {gameState.rebirth_upgradeAmounts[0]}):</span>
                    <span style={{ color: '#9333ea', fontWeight: 'bold' }}>×{formatNumberGerman(values.clickMultiplier, 2)}</span>
                  </div>
                )}
                
                {values.runeMultiplier > 1 && (
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <span>🎲 Rune Bonus:</span>
                    <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>×{formatNumberGerman(values.runeMultiplier, 2)}</span>
                  </div>
                )}
                
                {values.rebirthPointMultiplier > 1 && (
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                  }}>
                    <span>⚡ RP Multiplier (Level {gameState.rebirth_upgradeAmounts[4]}):</span>
                    <span style={{ color: '#a855f7', fontWeight: 'bold' }}>×{formatNumberGerman(values.rebirthPointMultiplier, 2)}</span>
                  </div>
                )}
                
                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  marginTop: '8px',
                  paddingTop: '8px'
                }}>
                  <div style={{
                    color: '#22c55e',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
                  }}>
                    <span>{hoveredStat === 'click' ? '💰 Total per Click:' : '⏰ Total per Tick:'}</span>
                    <span>{formatNumberGerman(hoveredStat === 'click' ? values.perClickTotal : values.perTickTotal)}$</span>
                  </div>
                </div>
              </div>
              
              {/* Tooltip Arrow */}
              <div style={{
                position: 'absolute',
                [tooltipBelow ? 'top' : 'bottom']: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                [tooltipBelow ? 'borderBottom' : 'borderTop']: '8px solid #22c55e'
              }} />
            </div>,
            document.body
          )}
        </>
      )}
      
      {/* Tooltip Animation CSS */}
      <style>{`
        @keyframes tooltipFadeInBelow {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0%) scale(1);
          }
        }
        
        @keyframes tooltipFadeInAbove {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-80%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default GameStats;