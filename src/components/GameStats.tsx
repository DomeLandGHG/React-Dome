import type { GameState } from '../types';
import { RUNES, REBIRTHUPGRADES, formatNumberGerman } from '../types';

interface GameStatsProps {
  gameState: GameState;
}

const GameStats = ({ gameState }: GameStatsProps) => {
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
      const rune = RUNES[index];
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
        <div className="stat-item" style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>Per Click:</span>
          <span className="stat-value" style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(values.perClickTotal)}€
            {(values.clickMultiplier > 1 || values.runeMultiplier > 1 || values.rebirthPointMultiplier > 1) && (
              <span style={{ fontSize: '0.9em', color: '#64748b' }}> ({formatNumberGerman(gameState.moneyPerClick)}€)</span>
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
          <span className="stat-value" style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '16px' }}>{formatNumberGerman(values.perTickTotal)}€
            {(values.clickMultiplier > 1 || values.runeMultiplier > 1 || values.rebirthPointMultiplier > 1) && (
              <span style={{ fontSize: '0.9em', color: '#64748b' }}> ({formatNumberGerman(gameState.moneyPerTick)}€)</span>
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
              {values.totalGemBonus > 0 && (
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