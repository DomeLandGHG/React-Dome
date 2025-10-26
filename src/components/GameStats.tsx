import type { GameState } from '../types';
import { RUNES, formatNumberGerman } from '../types';

interface GameStatsProps {
  gameState: GameState;
}

const GameStats = ({ gameState }: GameStatsProps) => {
  // Multiplier für Rebirth-Upgrade 0
  const hasRebirthMultiplier = gameState.rebirth_upgradeAmounts && gameState.rebirth_upgradeAmounts[0] > 0;
  const multiplier = hasRebirthMultiplier ? Math.pow(gameState.clicksTotal, 0.01) : 1;

  // Calculate rune bonuses
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
  const runeMoneyMultiplier = 1 + runeBonuses.totalMoneyBonus;

  const perClickTotal = (gameState.moneyPerClick * multiplier * runeMoneyMultiplier);
  const perTickTotal = (gameState.moneyPerTick * multiplier * runeMoneyMultiplier);
  
  // Zeige Gems nur wenn das dritte Rebirth-Upgrade gekauft wurde
  const showGems = gameState.rebirth_upgradeAmounts && gameState.rebirth_upgradeAmounts[2] > 0;
  
  // Calculate gem chance if gems are unlocked
  const calculateGemChance = () => {
    if (!showGems) return 0;
    const baseGemChance = 0.005; // 0.5% base chance
    const bonusGemChance = runeBonuses.totalGemBonus;
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
      }}>💰 {formatNumberGerman(gameState.money)}€</h1>
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        <div className="stat-item" style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>Per Click:</span>
          <span className="stat-value" style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(perClickTotal)}€
            {(hasRebirthMultiplier || runeBonuses.totalMoneyBonus > 0) && (
              <span style={{ fontSize: '0.9em', color: '#64748b' }}> ({formatNumberGerman(gameState.moneyPerClick * (hasRebirthMultiplier ? 1 : multiplier))}€)</span>
            )}
          </span>
        </div>
        <div className="stat-item" style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>Per Tick:</span>
          <span className="stat-value" style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(perTickTotal)}€
            {(hasRebirthMultiplier || runeBonuses.totalMoneyBonus > 0) && (
              <span style={{ fontSize: '0.9em', color: '#64748b' }}> ({formatNumberGerman(gameState.moneyPerTick * (hasRebirthMultiplier ? 1 : multiplier))}€)</span>
            )}
          </span>
        </div>
        {(gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) && (
          <div className="stat-item" style={{
            background: 'rgba(147, 51, 234, 0.1)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>Rebirth Points:</span>
            <span className="stat-value" style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '16px' }}>{Math.floor(gameState.rebirthPoints)}</span>
          </div>
        )}
        {showGems && (
          <div className="stat-item" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>💎 Gems:</span>
            <span className="stat-value" style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(gameState.gems)}</span>
          </div>
        )}
        {showGems && (
          <div className="stat-item" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>💎 Chance:</span>
            <span className="stat-value" style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '16px' }}>
              {formatNumberGerman(gemChance * 100, 2)}%
              {runeBonuses.totalGemBonus > 0 && (
                <span style={{ fontSize: '0.9em', color: '#64748b' }}> (0,5%)</span>
              )}
            </span>
          </div>
        )}
        <div className="stat-item" style={{
          background: 'rgba(100, 116, 139, 0.1)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>Total Clicks:</span>
          <span className="stat-value" style={{ color: '#64748b', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(gameState.clicksTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default GameStats;