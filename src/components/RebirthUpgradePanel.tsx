import type { GameState } from '../types';
import { REBIRTHUPGRADES, formatNumberGerman } from '../types';

interface RebirthUpgradeButtonProps {
  name: string;
  price: number;
  priceText: string;
  amount: number;
  maxAmount: number;
  canAfford: boolean;
  isMaxed: boolean;
  onClick: () => void;
  bonus?: number;
  upgradeId?: number;
  upgradeType?: string;
}

const RebirthUpgradeButton = ({ 
  name, 
  price,
  priceText,
  amount,
  maxAmount,
  canAfford,
  isMaxed,
  onClick,
  bonus,
  upgradeId,
  upgradeType
}: RebirthUpgradeButtonProps) => {
  const getButtonClass = () => {
    if (isMaxed) return 'rebirth-upgrade-button maxed';
    if (isNaN(price)) return 'rebirth-upgrade-button locked';
    if (canAfford) return 'rebirth-upgrade-button affordable';
    return 'rebirth-upgrade-button expensive';
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={isMaxed || isNaN(price)}
      type="button"
      style={{ position: 'relative' }}
    >   
        <div className="rebirth-upgrade-name">{name}</div>
        <div className="rebirth-upgrade-info">
            {isMaxed ? ( 
                <span className="maxed-text">MAXED ({amount}/{maxAmount})</span>
            ) : (
                <>
                    <span className="rebirth-upgrade-price">
                      {upgradeType === 'Unlock' && !isNaN(price) ? priceText : `${priceText} Rebirth Points`}
                    </span>
                    <span className="rebirth-upgrade-count">({amount}/{maxAmount})</span>
                </>
            )}  
        </div>
        {bonus !== undefined && (
          <span style={{ position: 'absolute', right: '1rem', bottom: '0.7rem', fontSize: '0.95em', color: '#ffd700', fontWeight: 600 }}>
            {upgradeId === 1 ? `+${formatNumberGerman(bonus)} Clicks/Tick` : upgradeId === 2 ? `${formatNumberGerman(bonus, 1)}% chance` : upgradeId === 4 ? `x${formatNumberGerman(bonus, 2)} Money` : `Bonus: x${formatNumberGerman(bonus, 3)}`}
          </span>
        )}
    </button>
  );
};

interface RebirthPanelProps {
  gameState: GameState;
  buyRebirthUpgrade: (index: number) => void;
}

const RebirthPanel = ({ gameState, buyRebirthUpgrade }: RebirthPanelProps) => {
    return (
        <div className="rebirth-upgrade-panel" style={{
          background: 'rgba(147, 51, 234, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(147, 51, 234, 0.3)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#9333ea',
              fontSize: '20px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
              marginBottom: '10px'
            }}>🔄 Rebirth Upgrades</h2>
            <div style={{
              background: 'rgba(147, 51, 234, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(147, 51, 234, 0.3)'
            }}>
              <div style={{
                color: '#a855f7',
                fontSize: '18px',
                fontWeight: 'bold',
                textShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
              }}>
                🔄 {formatNumberGerman(gameState.rebirthPoints)} RP
              </div>
              <div style={{ fontSize: '12px', color: '#9333ea', marginTop: '4px' }}>Rebirth Points</div>
            </div>
          </div>
          <div className="rebirth-upgrade-list">
            {REBIRTHUPGRADES.map((upgrade, index: number) => {
              let bonus: number | undefined = undefined;
              
              // Dynamische Namen für Upgrade 0 basierend auf Level
              let displayName = upgrade.name;
              if (upgrade.id === 0 && gameState.rebirth_upgradeAmounts[0] > 0) {
                const currentLevel = gameState.rebirth_upgradeAmounts[0];
                const currentExponent = 0.01 + (currentLevel - 1) * 0.01;
                displayName = `Money Income x Total Clicks^${currentExponent.toFixed(2)}`;      //1.Rebirth Upgrade Name after Buy
              }
              
              // Dynamische Namen für Unlock-Upgrades basierend auf Gems
              let displayPrice = gameState.rebirth_upgradePrices[index];
              let canAfford = gameState.rebirthPoints >= gameState.rebirth_upgradePrices[index];
              let isDisabled = false;
              let priceText = displayPrice.toString();
              
              if (upgrade.type === 'Unlock') {
                if (gameState.gems === 0 && gameState.rebirth_upgradeAmounts[index] === 0) {
                  // Nur verstecken wenn noch nicht gekauft UND keine Gems vorhanden
                  displayName = '???';
                  displayPrice = NaN;
                  canAfford = false;
                  isDisabled = true;
                  priceText = '???';
                } else {
                  // Multi-Währungs-Prüfung für freigeschaltete Unlock-Upgrades
                  canAfford = gameState.money >= 1000 && gameState.rebirthPoints >= 1 && gameState.gems >= 1;
                  priceText = '1000$ + 1 Rebirth Point + 1 💎';
                }
              }
              
              // Berechne Bonus für jedes Upgrade
              if (upgrade.id === 0 && gameState.rebirth_upgradeAmounts[0] > 0) {
                // Money Multiplier basierend auf Total Clicks mit korrekt skaliertem Exponent
                const currentLevel = gameState.rebirth_upgradeAmounts[0];
                const currentExponent = 0.01 + (currentLevel - 1) * 0.01;
                bonus = Math.pow(gameState.clicksTotal, currentExponent);
              } else if (upgrade.id === 1 && gameState.rebirth_upgradeAmounts[1] > 0) {
                // Zeige Clicks per Second für das Auto-Click Upgrade
                bonus = gameState.rebirth_upgradeAmounts[1];
              } else if (upgrade.id === 2 && gameState.rebirth_upgradeAmounts[2] > 0) {
                // Zeige Gem-Chance in Prozent
                bonus = REBIRTHUPGRADES[2].effect * 100; // 0.005 * 100 = 0.5
              } else if (upgrade.id === 4 && gameState.rebirth_upgradeAmounts[4] > 0) {
                // Zeige Rebirth Point Multiplikator mit logarithmischer Berechnung
                const effectValue = REBIRTHUPGRADES[4].effect; // 0.05
                const bonus_calc = Math.log(gameState.rebirthPoints + 1) * effectValue;
                bonus = 1 + bonus_calc;
              }
              
              return (
                <RebirthUpgradeButton
                  key={upgrade.id}
                  name={displayName}
                  price={displayPrice}
                  priceText={priceText}
                  amount={gameState.rebirth_upgradeAmounts[index]}
                  maxAmount={gameState.rebirth_maxUpgradeAmounts[index]}
                  canAfford={canAfford && !isDisabled}
                  isMaxed={gameState.rebirth_upgradeAmounts[index] >= gameState.rebirth_maxUpgradeAmounts[index]}
                  onClick={() => !isDisabled && buyRebirthUpgrade(index)}
                  bonus={bonus}
                  upgradeId={upgrade.id}
                  upgradeType={upgrade.type}
                />
              );
            })}
          </div>
        </div>
    );
};

export default RebirthPanel;