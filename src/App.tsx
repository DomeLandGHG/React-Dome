//verbindet alle scripte


//imports der Libarys
import { useGameLogic } from './useGameLogic';
import GameStats from './components/GameStats';
import MoneyButton from './components/MoneyButton';
import SwitchButton from './components/Panel-switchButton';
import UpgradesPanel from './components/UpgradesPanel';
import RebirthPanel from './components/RebirthUpgradePanel';
import ActionButtons from './components/ActionButtons';
import './App.css';

function App() {
  const { gameState, clickMoney, buyUpgrade, buyRebirthUpgrade, performRebirth, cheatMoney } = useGameLogic();

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Money Clicker</h1>
        <p>Click to earn money, buy upgrades, and grow your fortune!</p>
      </header>

      <main className="game-container">
        <div className="left-panel">
          <GameStats 
            gameState={gameState} 
          />

          <div className="Upgrade/Rebirth-Switch">
            <SwitchButton
              label1="Upgrades"
              label2="Rebirth"
              onSwitch={(selected) => console.log('Switched to:', selected)}
              />
          </div>
          
          <div className="click-area">
            <MoneyButton 
              onClick={clickMoney} 
              moneyPerClick={gameState.moneyPerClick} 
            />
          </div>

          <ActionButtons
            money={gameState.money}
            onRebirth={performRebirth}
            onCheat={cheatMoney}
            moneyPerClick={gameState.moneyPerClick}
          />
        </div>

        <div className="right-Upgrade-panel">
          <UpgradesPanel 
            gameState={gameState} 
            buyUpgrade={buyUpgrade} 
          />

          <RebirthPanel
            gameState={gameState}
            buyRebirthUpgrade={buyRebirthUpgrade}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>React Money Clicker v0.9 | Your progress is automatically saved!</p>
      </footer>
    </div>
  );
}

export default App;
