import type { GameState } from '../types';
import { RUNES, formatNumberGerman } from '../types';

interface ActionButtonsProps {
  money: number;
  onRebirth: () => void;
  onCheat: () => void;
  onReset: () => void;
  moneyPerClick: number;
  gameState: GameState;
}

const ActionButtons = ({ money, onRebirth, onReset, gameState /* onCheat, moneyPerClick */}: ActionButtonsProps) => {
  const canRebirth = money >= 1000;
  const baseRebirthPoints = Math.floor(money / 1000);
  
  // Calculate rune RP bonus
  const calculateRuneRpBonus = () => {
    let totalRpBonus = 0;
    gameState.runes.forEach((amount, index) => {
      const rune = RUNES[index];
      if (amount > 0) {
        totalRpBonus += (rune.rpBonus || 0) * amount;
      }
    });
    return totalRpBonus;
  };
  
  const runeRpBonus = calculateRuneRpBonus();
  const runeRpMultiplier = 1 + runeRpBonus;
  const totalRebirthPoints = Math.floor(baseRebirthPoints * runeRpMultiplier);

  return (
    <div className="action-buttons">
      {canRebirth && (
        <button 
          className="rebirth-button"
          onClick={onRebirth}
          type="button"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #a855f7 100%)',
            border: '3px solid #6d28d9',
            borderRadius: '16px',
            padding: '16px 24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 20px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            marginBottom: '12px',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(147, 51, 234, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>🔄 REBIRTH</div>
          <div className="rebirth-info" style={{ fontSize: '14px', color: '#e9d5ff' }}>
            Get {formatNumberGerman(totalRebirthPoints)} Rebirth Points
            {runeRpBonus > 0 && (
              <span style={{ fontSize: '0.9em', color: '#c4b5fd', display: 'block' }}>
                (+{formatNumberGerman(runeRpBonus * 100)}% from runes)
              </span>
            )}
          </div>
        </button>
      )}
      
      <button 
        className="reset-button"
        onClick={() => {
          if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            onReset();
          }
        }}
        type="button"
        style={{
          background: 'linear-gradient(135deg, #dc2626, #ef4444)',
          color: 'white',
          border: '2px solid #b91c1c',
          padding: '12px 20px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          width: '100%'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
        }}
      >
        ⚠️ Reset All
      </button>
      
    </div>
  );
};

export default ActionButtons;