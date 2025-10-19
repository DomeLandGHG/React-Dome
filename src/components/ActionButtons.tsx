interface ActionButtonsProps {
  money: number;
  onRebirth: () => void;
  onCheat: () => void;
  moneyPerClick: number;
}

const ActionButtons = ({ money, onRebirth, /* onCheat, moneyPerClick */}: ActionButtonsProps) => {
  const canRebirth = money >= 1000;
  const rebirthPoints = Math.floor(money / 1000);

  return (
    <div className="action-buttons">
      {canRebirth && (
        <button 
          className="rebirth-button"
          onClick={onRebirth}
          type="button"
        >
          <div>🔄 REBIRTH</div>
          <div className="rebirth-info">
            Get {rebirthPoints} Rebirth Points
          </div>
        </button>
      )}
      
      {/* <button 
        className="cheat-button"
        onClick={onCheat}
        type="button"
        title="Development cheat button"
      >
        💎 +{(1000 * moneyPerClick).toLocaleString()}€
      </button> */}
    </div>
  );
};

export default ActionButtons;