import type { GameState } from '../types';

interface RebirthUpgradeButtonProps {
  name: string;
  price: number;
  amount: number;
  maxAmount: number;
  canAfford: boolean;
  isMaxed: boolean;
  onClick: () => void;
}

const RebirthUpgradeButton = ({ 
  name, 
  price,
  amount,
  maxAmount,
  canAfford,
  isMaxed,
  onClick
}: RebirthUpgradeButtonProps) => {
  const getButtonClass = () => {
    if (isMaxed) return 'rebirth-upgrade-button maxed';
    if (canAfford) return 'rebirth-upgrade-button affordable';
    return 'rebirth-upgrade-button expensive';
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={isMaxed}
      type="button"
    >   
        <div className="rebirth-upgrade-name">{name}</div>
        <div className="rebirth-upgrade-info">
            {isMaxed ? ( 
                <span className="maxed-text">MAXED ({amount}/{maxAmount})</span>
            ) : (
                <>
                    <span className="Rebirth-Upgrade-price">Price: {price}</span>
                    <span className="Rebirth-Upgrade-count">Amount: {amount}</span>
                </>
            )}  
        </div>
    </button>
  );
};

interface RebirthPanelProps {
  gameState: GameState;
  buyRebirthUpgrade: (index: number) => void;
}

const RebirthPanel = ({ gameState, buyRebirthUpgrade }: RebirthPanelProps) => {
    const upgrade = [
        { name: 'Money x Total Clicks^0,01', index: 0 },

    ];

    return (
        <div className="rebirth-upgrade-panel">
            <h2>Rebirth Upgrades</h2>
            <div className="rebirth-upgrade-list">
                {upgrade.map(({ name, index }) => (
                    <RebirthUpgradeButton
                        key={index}
                        name={name}
                        price={gameState.upgradePrices[index]}
                        amount={gameState.upgradeAmounts[index]}
                        maxAmount={gameState.maxUpgradeAmounts[index]}
                        canAfford={gameState.rebirthPoints >= gameState.upgradePrices[index]}
                        isMaxed={gameState.upgradeAmounts[index] >= gameState.maxUpgradeAmounts[index]}
                        onClick={() => buyRebirthUpgrade(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default RebirthPanel;