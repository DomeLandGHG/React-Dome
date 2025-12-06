import React, { useState } from 'react';
import type { GameState } from '../types';
import { formatNumberGerman } from '../types/German_number';
import { REBIRTHUPGRADES } from '../types/Rebirth_Upgrade';
import { RUNES_1 } from '../types/Runes';
import { EVENT_CONFIG } from '../types/ElementalEvent';
import { calculateGoldSkillBonuses } from '../types/GoldSkillTree';

interface FloatingMoney {
  id: number;
  x: number;
  y: number;
  amount: string;
}

interface FloatingGem {
  id: number;
  x: number;
  y: number;
}

interface MoneyButtonProps {
  onClick: () => void;
  gameState: GameState;
  onGemDrop?: () => void; // Callback for when a gem is obtained
}

const MoneyButton = ({ onClick, gameState, onGemDrop }: MoneyButtonProps) => {
  const [floatingMoneys, setFloatingMoneys] = useState<FloatingMoney[]>([]);
  const [floatingGems, setFloatingGems] = useState<FloatingGem[]>([]);
  const MAX_FLOATING_ELEMENTS = 2; // Reduced to 2 for ultra-fast clicking
  
  // Get active event if any
  const activeEvent = gameState.activeEvent 
    ? EVENT_CONFIG.find(e => e.id === gameState.activeEvent)
    : null;
  
  // Calculate actual money per click with all bonuses (same as GameStats) - MEMOIZED
  const totalMoneyPerClick = React.useMemo(() => {
    // Safety check: return base value if gameState is not fully loaded
    if (gameState.achievements === undefined || gameState.rebirth_upgradeAmounts === undefined || gameState.runes === undefined) {
      return gameState.moneyPerClick || 1;
    }
    
    // Achievement bonuses
    const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
    const achievementMoneyBonus = totalAchievementTiers * 0.01; // 1% per tier
    const achievementMoneyMultiplier = 1 + achievementMoneyBonus;

    // Rebirth Upgrade 0 multiplier (Total Clicks multiplier)
    let clickMultiplier = 1;
    if (gameState.rebirth_upgradeAmounts[0] > 0) {
      const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
      clickMultiplier = Math.pow(gameState.clicksTotal + 1, exponent); // +1 for next click
    }

    // Rune bonuses
    let totalMoneyBonus = 0;
    gameState.runes.forEach((amount, index) => {
      const rune = RUNES_1[index];
      if (amount > 0) {
        totalMoneyBonus += (rune.moneyBonus || 0) * amount;
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

    // Event bonus multiplier (Tsunami: ×5 Click Power)
    const eventMultiplier = activeEvent?.effects?.clickPowerMultiplier || 1;

    // Gold Skill bonuses
    const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);

    // Calculate final value with achievement bonus, gold skills, and event bonus
    return gameState.moneyPerClick * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier * goldSkillBonuses.clickPowerMultiplier * eventMultiplier;
  }, [
    gameState.moneyPerClick,
    gameState.clicksTotal,
    gameState.rebirthPoints,
    gameState.achievements,
    gameState.rebirth_upgradeAmounts,
    gameState.runes,
    gameState.goldSkills,
    activeEvent
  ]);

  // Track previous gems to detect new gem drops
  const [prevGems, setPrevGems] = useState(gameState.gems);

  // Detect gem drops and trigger animation
  React.useEffect(() => {
    if (gameState.gems > prevGems) {
      // Check if diamond effects are disabled
      if (gameState.disableDiamondEffects) {
        setPrevGems(gameState.gems);
        onGemDrop?.(); // Still call the callback
        return; // Skip floating gem animation
      }
      
      // A gem was obtained, trigger floating gem animation
      const container = document.querySelector('.money-button-container');
      const button = container?.querySelector('.money-button');
      
      if (container && button) {
        const isMobile = window.innerWidth <= 1400;
        
        let buttonCenterX: number;
        let buttonCenterY: number;
        
        if (isMobile) {
          // Mobile: Use simpler relative positioning
          const buttonRect = button.getBoundingClientRect();
          buttonCenterX = buttonRect.width / 2;
          buttonCenterY = buttonRect.height / 2;
        } else {
          // Desktop: Use container-relative positioning
          const containerRect = container.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2;
          buttonCenterY = buttonRect.top - containerRect.top + buttonRect.height / 2;
        }
        
        const newFloatingGem: FloatingGem = {
          id: Date.now() + Math.random(),
          x: buttonCenterX + (Math.random() - 0.5) * (isMobile ? 80 : 100),
          y: buttonCenterY + (Math.random() - 0.5) * (isMobile ? 20 : 30),
        };
        
        setFloatingGems(prev => {
          // Limit to MAX_FLOATING_ELEMENTS for performance
          const updated = [...prev, newFloatingGem];
          return updated.length > MAX_FLOATING_ELEMENTS ? updated.slice(-MAX_FLOATING_ELEMENTS) : updated;
        });
        
        // Remove after animation
        setTimeout(() => {
          setFloatingGems(prev => prev.filter(fg => fg.id !== newFloatingGem.id));
        }, 3000);
        
        // Call the callback if provided
        onGemDrop?.();
      }
    }
    setPrevGems(gameState.gems);
  }, [gameState.gems, gameState.disableDiamondEffects, prevGems, onGemDrop]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Call the original onClick
    onClick();
    
    // ULTRA OPTIMIZATION: Completely disable animations at high click rates
    const now = Date.now();
    
    // Track click rate efficiently (rolling window of last second)
    const clickRate = (window as any).__clickRateMoneyBtn || [];
    clickRate.push(now);
    // Remove clicks older than 1 second
    while (clickRate.length > 0 && clickRate[0] < now - 1000) {
      clickRate.shift();
    }
    (window as any).__clickRateMoneyBtn = clickRate;
    
    // Calculate current clicks per second
    const clicksPerSecond = clickRate.length;
    
    // Skip ALL animations if:
    // - Clicking more than 20 times per second (ultra-fast)
    // - Effects disabled
    // - Already at max floating elements
    if (gameState.disableMoneyEffects || clicksPerSecond > 20 || floatingMoneys.length >= MAX_FLOATING_ELEMENTS) {
      return; // Skip animation completely for maximum performance
    }
    
    (window as any).__lastAnimationTime = now;
    
    // Create floating money animation
    const button = e.currentTarget;
    const container = button.closest('.money-button-container');
    
    if (!container) return;
    
    // For mobile devices, use simpler relative positioning
    const isMobile = window.innerWidth <= 1400;
    
    let buttonCenterX: number;
    let buttonCenterY: number;
    
    if (isMobile) {
      // Mobile: Use button's own dimensions for simpler calculation
      const buttonRect = button.getBoundingClientRect();
      buttonCenterX = buttonRect.width / 2;
      buttonCenterY = buttonRect.height / 2;
    } else {
      // Desktop: Use the existing method
      const rect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      buttonCenterX = rect.left - containerRect.left + rect.width / 2;
      buttonCenterY = rect.top - containerRect.top + rect.height / 2;
    }
    
    // Check for Critical Strike (Gold Skill)
    const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
    const isCritical = goldSkillBonuses.criticalStrikeChance > 0 && Math.random() < goldSkillBonuses.criticalStrikeChance;
    const displayAmount = totalMoneyPerClick * (isCritical ? 10 : 1);
    
    const newFloatingMoney: FloatingMoney = {
      id: Date.now() + Math.random(),
      x: buttonCenterX + (Math.random() - 0.5) * (isMobile ? 120 : 200), // Smaller spread on mobile
      y: buttonCenterY + (Math.random() - 0.5) * (isMobile ? 30 : 50), // Smaller spread on mobile
      amount: (isCritical ? '⚡CRIT! +' : '+') + formatNumberGerman(displayAmount) + '$'
    };
    
    setFloatingMoneys(prev => {
      // Limit to MAX_FLOATING_ELEMENTS for performance
      const updated = [...prev, newFloatingMoney];
      return updated.length > MAX_FLOATING_ELEMENTS ? updated.slice(-MAX_FLOATING_ELEMENTS) : updated;
    });
    
    // Remove after animation
    setTimeout(() => {
      setFloatingMoneys(prev => prev.filter(fm => fm.id !== newFloatingMoney.id));
    }, 2000);
  };

  return (
    <div className="money-button-container" style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
      position: 'relative' // Make this a positioned container for absolute children
    }}>
      <button 
        className="money-button"
        onClick={handleClick}
        type="button"
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 25%, #34d399 75%, #6ee7b7 100%)',
          border: 'none',
          borderRadius: '24px',
          padding: '24px 48px',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
          color: 'white',
          fontSize: '20px',
          fontWeight: '800',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.3)',
          transform: 'scale(1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(16, 185, 129, 0.7), 0 0 0 4px rgba(16, 185, 129, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
      >
        <div className="money-icon" style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
        <div className="money-text" style={{ fontSize: '16px', marginBottom: '8px' }}>CLICK FOR MONEY!</div>
        <div className="money-amount" style={{ fontSize: '20px', color: '#dcfce7' }}>+{formatNumberGerman(totalMoneyPerClick)}$</div>
      </button>
      
      {/* Floating Money Animations */}
      {!gameState.disableMoneyEffects && floatingMoneys.map(floatingMoney => (
        <div
          key={floatingMoney.id}
          style={{
            position: 'absolute',
            left: floatingMoney.x,
            top: floatingMoney.y,
            fontSize: '28px',
            fontWeight: '900',
            color: '#34d399',
            textShadow: '0 0 20px rgba(52, 211, 153, 1), 0 0 40px rgba(52, 211, 153, 0.6), 0 4px 8px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none',
            zIndex: 1000,
            animation: 'floatMoney 2s ease-out forwards',
            userSelect: 'none',
            filter: 'drop-shadow(0 0 10px rgba(52, 211, 153, 0.8))'
          }}
        >
          💰 {floatingMoney.amount}
        </div>
      ))}
      
      {/* Floating Gem Animations - More prominent */}
      {!gameState.disableDiamondEffects && floatingGems.map(floatingGem => (
        <div
          key={floatingGem.id}
          style={{
            position: 'absolute',
            left: floatingGem.x,
            top: floatingGem.y,
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#3b82f6',
            textShadow: '0 0 20px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 1001,
            animation: 'floatGem 3s ease-out forwards',
            userSelect: 'none',
            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))'
          }}
        >
          💎
        </div>
      ))}
      
      <style>{`
        @keyframes floatMoney {
          0% {
            opacity: 0;
            transform: translateY(0px) scale(0.5);
            filter: brightness(2) drop-shadow(0 0 20px rgba(52, 211, 153, 1));
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1.3);
            filter: brightness(1.8) drop-shadow(0 0 25px rgba(52, 211, 153, 0.9));
          }
          50% {
            opacity: 1;
            transform: translateY(-60px) scale(1.1);
            filter: brightness(1.2) drop-shadow(0 0 15px rgba(52, 211, 153, 0.7));
          }
          100% {
            opacity: 0;
            transform: translateY(-140px) scale(0.7);
            filter: brightness(0.8) drop-shadow(0 0 5px rgba(52, 211, 153, 0.3));
          }
        }
        
        @keyframes floatGem {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(0.5) rotate(0deg);
            filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.8)) brightness(1.5);
          }
          25% {
            opacity: 1;
            transform: translateY(-30px) scale(1.8) rotate(90deg);
            filter: drop-shadow(0 0 25px rgba(59, 130, 246, 1)) brightness(2);
          }
          50% {
            opacity: 1;
            transform: translateY(-80px) scale(1.5) rotate(180deg);
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.9)) brightness(1.8);
          }
          75% {
            opacity: 0.8;
            transform: translateY(-130px) scale(1.2) rotate(270deg);
            filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.7)) brightness(1.3);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.8) rotate(360deg);
            filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)) brightness(1);
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(MoneyButton, (prevProps, nextProps) => {
  // Ultra-aggressive memo - avoid re-renders during rapid clicking
  // Only re-render if moneyPerClick changes (upgrades) or settings change
  // Ignore money/gems/clicksTotal changes to prevent constant re-renders
  return (
    prevProps.gameState.moneyPerClick === nextProps.gameState.moneyPerClick &&
    prevProps.gameState.disableMoneyEffects === nextProps.gameState.disableMoneyEffects &&
    prevProps.gameState.disableDiamondEffects === nextProps.gameState.disableDiamondEffects &&
    prevProps.gameState.rebirth_upgradeAmounts?.[0] === nextProps.gameState.rebirth_upgradeAmounts?.[0] &&
    prevProps.gameState.activeEvent === nextProps.gameState.activeEvent
  );
});