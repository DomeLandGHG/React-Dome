import React, { useState } from 'react';
import type { GameState } from '../types';
import { RUNES_1, REBIRTHUPGRADES, formatNumberGerman } from '../types';

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
  
  // Calculate actual money per click with all bonuses (same as GameStats)
  const calculateActualMoneyPerClick = () => {
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

    // Calculate final value
    return gameState.moneyPerClick * clickMultiplier * runeMultiplier * rebirthPointMultiplier;
  };

  const totalMoneyPerClick = calculateActualMoneyPerClick();

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
        
        setFloatingGems(prev => [...prev, newFloatingGem]);
        
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
    
    // Check if money effects are disabled
    if (gameState.disableMoneyEffects) {
      return; // Skip floating money animation
    }
    
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
    
    const newFloatingMoney: FloatingMoney = {
      id: Date.now() + Math.random(),
      x: buttonCenterX + (Math.random() - 0.5) * (isMobile ? 120 : 200), // Smaller spread on mobile
      y: buttonCenterY + (Math.random() - 0.5) * (isMobile ? 30 : 50), // Smaller spread on mobile
      amount: `+${formatNumberGerman(totalMoneyPerClick)}$`
    };
    
    setFloatingMoneys(prev => [...prev, newFloatingMoney]);
    
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
          background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
          border: '3px solid #15803d',
          borderRadius: '20px',
          padding: '20px 40px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(34, 197, 94, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
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
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#22c55e',
            textShadow: '0 0 10px rgba(34, 197, 94, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            zIndex: 1000,
            animation: 'floatMoney 2s ease-out forwards',
            userSelect: 'none'
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
            opacity: 1;
            transform: translateY(0px) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-50px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) scale(0.6);
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

export default MoneyButton;