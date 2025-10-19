import type { GameState } from '../types';

interface UpgradeButtonProps {
  name: string;
  price: number;
  amount: number;
  maxAmount: number;
  canAfford: boolean;
  isMaxed: boolean;
  onClick: () => void;
}

const UpgradeButton = ({ 
  name, 
  price, 
  amount, 
  maxAmount, 
  canAfford, 
  isMaxed, 
  onClick 
}: UpgradeButtonProps) => {
  const getButtonClass = () => {
    if (isMaxed) return 'upgrade-button maxed';
    if (canAfford) return 'upgrade-button affordable';
    return 'upgrade-button expensive';
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={isMaxed}
      type="button"
    >
      <div className="upgrade-name">{name}</div>
      <div className="upgrade-info">
        {isMaxed ? (
          <span className="maxed-text">MAXED ({amount}/{maxAmount})</span>
        ) : (
          <>
            <span className="upgrade-price">{price.toLocaleString()}€</span>
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
  const upgrades = [
    { name: '+1€ per Click', index: 0 },
    { name: '+1€ per Tick', index: 1 },
    { name: '+10€ per Click', index: 2 },
    { name: '+10€ per Tick', index: 3 },
  ];

  return (
    <div className="upgrades-panel">
      <h2>Upgrades</h2>
      <div className="upgrades-list">
        {upgrades.map(({ name, index }) => (
          <UpgradeButton
            key={index}
            name={name}
            price={gameState.upgradePrices[index]}
            amount={gameState.upgradeAmounts[index]}
            maxAmount={gameState.maxUpgradeAmounts[index]}
            canAfford={gameState.money >= gameState.upgradePrices[index]}
            isMaxed={gameState.upgradeAmounts[index] >= gameState.maxUpgradeAmounts[index]}
            onClick={() => buyUpgrade(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default UpgradesPanel;