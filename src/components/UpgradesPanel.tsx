import type { GameState } from '../types';
import { formatNumberGerman } from '../types/German_number';
import { UPGRADES } from '../types/Upgrade';
import { EVENT_CONFIG } from '../types/ElementalEvent';
import { calculateElementalBonuses } from '../types/ElementalPrestige';

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
  buyMaxUpgrades: (index: number) => void;
}

const UpgradesPanel = ({ gameState, buyUpgrade, buyMaxUpgrades }: UpgradesPanelProps) => {
  // Calculate upgrade discount from Darkness event and Elemental Prestige
  const activeEvent = gameState.activeEvent ? EVENT_CONFIG.find(e => e.id === gameState.activeEvent) : null;
  const eventUpgradeDiscount = activeEvent?.effects.upgradeDiscount || 0;
  const elementalBonuses = calculateElementalBonuses(gameState.elementalPrestige || null);
  const totalDiscount = elementalBonuses.upgradeDiscountBonus * (1 - eventUpgradeDiscount);
  
  return (
    <div className="upgrades-panel" style={{
      background: 'rgba(34, 197, 94, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
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
          // Sicherheitsprüfung: Skip wenn Array-Index außerhalb liegt
          if (gameState.upgradeAmounts[index] === undefined) {
            return null;
          }
          if (!gameState.maxUpgradeAmounts[index]) {
            return null;
          }
          if (!gameState.upgradePrices[index]) {
            return null;
          }
          
          // Dynamische Namen für Unlock-Upgrades basierend auf Gems
          let displayName = upgrade.name;
          let basePrice = gameState.upgradePrices[index];
          let displayPrice = Math.floor(basePrice * totalDiscount);
          let canAfford = gameState.money >= displayPrice;
          let isDisabled = false;
          let priceText = `${formatNumberGerman(displayPrice)}$`;
          
          // Show discount indicator if active
          if (totalDiscount < 1) {
            const discountPercent = Math.round((1 - totalDiscount) * 100);
            priceText = `${formatNumberGerman(displayPrice)}$ (-${discountPercent}%)`;
          }
          
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
            <div key={upgrade.id} style={{ 
              display: 'flex',
              gap: '8px',
              alignItems: 'stretch'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <UpgradeButton
                  name={displayName}
                  price={displayPrice}
                  priceText={priceText}
                  amount={gameState.upgradeAmounts[index]}
                  maxAmount={gameState.maxUpgradeAmounts[index]}
                  canAfford={canAfford && !isDisabled}
                  isMaxed={gameState.upgradeAmounts[index] >= gameState.maxUpgradeAmounts[index]}
                  onClick={() => !isDisabled && buyUpgrade(index)}
                />
              </div>
              {gameState.maxUpgradeAmounts[index] > 1 && gameState.upgradeAmounts[index] < gameState.maxUpgradeAmounts[index] && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) buyMaxUpgrades(index);
                  }}
                  disabled={isDisabled}
                  style={{
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    border: '2px solid #d97706',
                    borderRadius: '12px',
                    color: '#78350f',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(251, 191, 36, 0.4)',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(251, 191, 36, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(251, 191, 36, 0.4)';
                  }}
                >
                  MAX
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradesPanel;