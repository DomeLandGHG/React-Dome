import type { GameState } from '../types';

interface GameStatsProps {
  gameState: GameState;
}

const GameStats = ({ gameState }: GameStatsProps) => {
  return (
    <div className="game-stats">
      <h1 className="money-display">💰 {gameState.money.toLocaleString()}€</h1>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Per Click:</span>
          <span className="stat-value">{gameState.moneyPerClick}€</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Per Tick:</span>
          <span className="stat-value">{gameState.moneyPerTick}€</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Rebirth Points:</span>
          <span className="stat-value">{Math.floor(gameState.rebirthPoints)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Clicks:</span>
          <span className="stat-value">{gameState.clicksTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default GameStats;