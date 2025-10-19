interface MoneyButtonProps {
  onClick: () => void;
  moneyPerClick: number;
}

const MoneyButton = ({ onClick, moneyPerClick }: MoneyButtonProps) => {
  return (
    <div className="money-button-container">
      <button 
        className="money-button"
        onClick={onClick}
        type="button"
      >
        <div className="money-icon">💰</div>
        <div className="money-text">CLICK FOR MONEY!</div>
        <div className="money-amount">+{moneyPerClick}€</div>
      </button>
    </div>
  );
};

export default MoneyButton;