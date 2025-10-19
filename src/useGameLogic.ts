import { useState, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE, REBIRTHUPGRADES, UPGRADES } from './types';
import { saveGameState, loadGameState } from './storage';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());

  // Auto-save when state changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Auto money generation
  useEffect(() => {
    if (gameState.moneyPerTick > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          money: prev.money + prev.moneyPerTick,
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.moneyPerTick]);

  const clickMoney = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + prev.moneyPerClick,
      clicksInRebirth: prev.clicksInRebirth + 1,
      clicksTotal: prev.clicksTotal + 1,
    }));
  }, []);

  const buyUpgrade = useCallback((upgradeIndex: number) => {
    setGameState(prev => {
      const currentPrice = prev.upgradePrices[upgradeIndex];
      const currentAmount = prev.upgradeAmounts[upgradeIndex];
      const maxAmount = prev.maxUpgradeAmounts[upgradeIndex];

      if (prev.money >= currentPrice && currentAmount < maxAmount) {
        const newUpgradePrices = [...prev.upgradePrices];
        const newUpgradeAmounts = [...prev.upgradeAmounts];
        
        // Calculate new price using exponential scaling
        // Basis: 2.0 für kleine Upgrades, 2.5 für mittlere, 3.0 für große
        const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : 3.0;
        
        // Berechne neuen Preis: basePrice * (multiplier ^ amount)
        const basePrice = UPGRADES[upgradeIndex].price; // Ursprungspreis
        const nextAmount = currentAmount + 1;
        newUpgradePrices[upgradeIndex] = Math.floor(basePrice * Math.pow(priceMultiplier, nextAmount));
        
        newUpgradeAmounts[upgradeIndex] = currentAmount + 1;

        let newMoneyPerClick = prev.moneyPerClick;
        let newMoneyPerTick = prev.moneyPerTick;

        // Apply upgrade effects
        if (upgradeIndex === 0) { // +1€ per click
          newMoneyPerClick += 1;
        } else if (upgradeIndex === 1) { // +1€ per tick
          newMoneyPerTick += 1;
        } else if (upgradeIndex === 2) { // +10€ per click
          newMoneyPerClick += 10;
        } else if (upgradeIndex === 3) { // +10€ per tick
          newMoneyPerTick += 10;
        }
        

        return {
          ...prev,
          money: prev.money - currentPrice,
          moneyPerClick: newMoneyPerClick,
          moneyPerTick: newMoneyPerTick,
          upgradePrices: newUpgradePrices,
          upgradeAmounts: newUpgradeAmounts,
        };
      }
      return prev;
    });
  }, []);

  const buyRebirthUpgrade = useCallback((upgradeIndex: number) => {
    setGameState(prev => {
      const rebirth_currentPrice = prev.rebirth_upgradePrices[upgradeIndex];
      const rebirth_currentAmount = prev.rebirth_upgradeAmounts[upgradeIndex];
      const rebirth_maxAmount = prev.rebirth_maxUpgradeAmounts[upgradeIndex];

      if (prev.rebirthPoints >= rebirth_currentPrice && rebirth_currentAmount < rebirth_maxAmount) {
        const rebirth_newUpgradePrices = [...prev.rebirth_upgradePrices];
        const rebirth_newUpgradeAmounts = [...prev.rebirth_upgradeAmounts];

        const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : 3.0;

        const rebirth_basePrice = REBIRTHUPGRADES[upgradeIndex].price;
        const rebirth_nextAmount = rebirth_currentAmount + 1;
        rebirth_newUpgradePrices[upgradeIndex] = Math.floor(rebirth_basePrice * Math.pow(priceMultiplier, rebirth_nextAmount));

        rebirth_newUpgradeAmounts[upgradeIndex] = rebirth_currentAmount + 1;

        let newMoneyPerClick = prev.moneyPerClick
        let newMoneyPerTick = prev.moneyPerTick

        //Upgrade Effects
        if (upgradeIndex === 0) {
          newMoneyPerClick += 1;
        }

        return {
          ...prev,
          rebirthPoints: prev.rebirthPoints - rebirth_currentPrice,
          moneyPerClick: newMoneyPerClick,
          moneyPerTick: newMoneyPerTick,
          upgradePrices: rebirth_newUpgradePrices,
          upgradeAmounts: rebirth_newUpgradeAmounts,
        };
      }
      return prev;
    });
  }, []);

  const performRebirth = useCallback(() => {
    setGameState(prev => {
      const newRebirthPoints = prev.rebirthPoints + Math.floor(prev.money / 1000);
      
      return {
        ...INITIAL_GAME_STATE,
        rebirthPoints: newRebirthPoints,
        clicksTotal: prev.clicksTotal,
      };
    });
  }, []);

  const cheatMoney = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + (1000 * prev.moneyPerClick),
    }));
  }, []);

  return {
    gameState,
    clickMoney,
    buyUpgrade,
    buyRebirthUpgrade,
    performRebirth,
    cheatMoney,
  };
};