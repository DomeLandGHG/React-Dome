import type { GameState } from '../types';
import { formatNumberGerman } from '../types/German_number';
import { RUNES_1 } from '../types/Runes';
import { calculateElementalBonuses } from '../types/ElementalPrestige';

interface ActionButtonsProps {
  money: number;
  onRebirth: () => void;
  onCheat: () => void;
  onReset: () => void;
  moneyPerClick: number;
  gameState: GameState;
}

const ActionButtons = ({ money, onRebirth, gameState /* onCheat, moneyPerClick */}: ActionButtonsProps) => {
  const canRebirth = money >= 1000;
  const baseRebirthPoints = Math.floor(money / 1000);
  
  // Safety check: return early if gameState is not fully loaded
  if (gameState.achievements === undefined || gameState.runes === undefined) {
    return null;
  }
  
  // Calculate achievement RP bonus
  const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
  const achievementRpBonus = totalAchievementTiers * 0.01; // 1% per tier
  const achievementRpMultiplier = 1 + achievementRpBonus;
  
  // Calculate rune RP bonus
  const calculateRuneRpBonus = () => {
    let totalRpBonus = 0;
    gameState.runes.forEach((amount, index) => {
      const rune = RUNES_1[index];
      if (amount > 0) {
        totalRpBonus += (rune.rpBonus || 0) * amount;
      }
    });
    return totalRpBonus;
  };
  
  const runeRpBonus = calculateRuneRpBonus();
  const runeRpMultiplier = 1 + runeRpBonus;
  
  // Calculate elemental prestige RP bonus
  const elementalBonuses = calculateElementalBonuses(gameState.elementalPrestige || null);
  const elementalRpBonus = elementalBonuses.rpGainBonus - 1; // Convert multiplier to bonus percentage
  
  const totalRebirthPoints = Math.floor(baseRebirthPoints * runeRpMultiplier * achievementRpMultiplier * elementalBonuses.rpGainBonus);

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
            {(runeRpBonus > 0 || achievementRpBonus > 0 || elementalRpBonus > 0) && (
              <span style={{ fontSize: '0.9em', color: '#c4b5fd', display: 'block' }}>
                {runeRpBonus > 0 && `+${formatNumberGerman(runeRpBonus * 100)}% from runes`}
                {runeRpBonus > 0 && (achievementRpBonus > 0 || elementalRpBonus > 0) && ', '}
                {achievementRpBonus > 0 && `+${formatNumberGerman(achievementRpBonus * 100)}% from achievements`}
                {achievementRpBonus > 0 && elementalRpBonus > 0 && ', '}
                {elementalRpBonus > 0 && `+${formatNumberGerman(elementalRpBonus * 100)}% from prestige`}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default ActionButtons;