import type { GameState } from '../types';
import { UPGRADES, formatNumberGerman } from '../types';

interface UpgradeButtonProps {
  name: string;
  price: number;
  priceText: string;
  amount: number;
  maxAmount: number;
  canAfford: boolean;
  isMaxed: boolean;
  onClick: () => void;
}

const UpgradeButton = ({ 
  name, 
  price,
  priceText, 
  amount, 
  maxAmount, 
  canAfford, 
  isMaxed, 
  onClick 
}: UpgradeButtonProps) => {
  const getButtonClass = () => {
    if (isMaxed) return 'upgrade-button maxed';
    if (isNaN(price)) return 'upgrade-button locked';
    if (canAfford) return 'upgrade-button affordable';
    return 'upgrade-button expensive';
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={isMaxed || isNaN(price)}
      type="button"
    >
      <div className="upgrade-name">{name}</div>
      <div className="upgrade-info">
        {isMaxed ? (
          <span className="maxed-text">MAXED ({amount}/{maxAmount})</span>
        ) : (
          <>
            <span className="upgrade-price">{priceText}</span>
            <span className="upgrade-count">({amount}/{maxAmount})</span>
          </>
        )}
      </div>
    </button>
  );
};

interface UpgradesPanelProps {
  gameState: GameState;
  buyUpgrade: (index: number) => void;
}

const UpgradesPanel = ({ gameState, buyUpgrade }: UpgradesPanelProps) => {
  return (
    <div className="upgrades-panel" style={{
      background: 'rgba(34, 197, 94, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(34, 197, 94, 0.3)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          color: '#22c55e',
          fontSize: '20px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
          marginBottom: '10px'
        }}>⬆️ Upgrades</h2>
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          <div style={{
            color: '#ffd700',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
          }}>
            💰 {formatNumberGerman(gameState.money)}$
          </div>
          <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>Available Money</div>
        </div>
      </div>
      <div className="upgrades-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {UPGRADES.map((upgrade, index) => {
          // Dynamische Namen für Unlock-Upgrades basierend auf Gems
          let displayName = upgrade.name;
          let displayPrice = gameState.upgradePrices[index];
          let canAfford = gameState.money >= gameState.upgradePrices[index];
          let isDisabled = false;
          let priceText = `${formatNumberGerman(displayPrice)}$`;
          
          if (upgrade.type === 'Unlock') {
            if (gameState.gems === 0 && gameState.upgradeAmounts[index] === 0) {
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
          
          return (
            <UpgradeButton
              key={upgrade.id}
              name={displayName}
              price={displayPrice}
              priceText={priceText}
              amount={gameState.upgradeAmounts[index]}
              maxAmount={gameState.maxUpgradeAmounts[index]}
              canAfford={canAfford && !isDisabled}
              isMaxed={gameState.upgradeAmounts[index] >= gameState.maxUpgradeAmounts[index]}
              onClick={() => !isDisabled && buyUpgrade(index)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default UpgradesPanel;