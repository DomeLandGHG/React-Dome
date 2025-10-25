import { useState, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE, REBIRTHUPGRADES, UPGRADES, RUNES } from './types';
import { saveGameState, loadGameState } from './storage';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());

  // Auto-save when state changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Auto money generation & Rebirth-Upgrade: +1 Click per Tick
  useEffect(() => {
    if (gameState.moneyPerTick > 0 || gameState.rebirth_upgradeAmounts[1] > 0) {
      const interval = setInterval(() => {
        setGameState(prev => {
          let multiplier = 1;
          if (prev.rebirth_upgradeAmounts[0] > 0) {
            // +1, weil der Bonus immer mit dem nächsten Klick steigt
            multiplier = Math.pow(prev.clicksTotal + 1, REBIRTHUPGRADES[0].effect);
          }
          
          // Calculate rune money bonus at runtime
          let totalMoneyBonus = 0;
          prev.runes.forEach((amount, index) => {
            const rune = RUNES[index];
            if (amount > 0) {
              totalMoneyBonus += (rune.moneyBonus || 0) * amount;
            }
          });
          
          // Geld generieren wie gehabt
          let newMoney = prev.money;
          if (prev.moneyPerTick > 0) {
            const runeMultiplier = 1 + totalMoneyBonus;
            newMoney += prev.moneyPerTick * multiplier * runeMultiplier;
          }
          // Rebirth-Upgrade: +1 Klick pro Tick (aber kein Geld)
          let newClicksTotal = prev.clicksTotal;
          let newClicksInRebirth = prev.clicksInRebirth;
          if (prev.rebirth_upgradeAmounts[1] > 0) {
            newClicksTotal += prev.rebirth_upgradeAmounts[1];
            newClicksInRebirth += prev.rebirth_upgradeAmounts[1];
          }
          return {
            ...prev,
            money: newMoney,
            clicksTotal: newClicksTotal,
            clicksInRebirth: newClicksInRebirth,
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.moneyPerTick, gameState.rebirth_upgradeAmounts, gameState.clicksTotal]);

  const clickMoney = useCallback(() => {
    setGameState(prev => {
      const newClicksTotal = prev.clicksTotal + 1;
      let multiplier = 1;
      if (prev.rebirth_upgradeAmounts[0] > 0) {
        multiplier = Math.pow(newClicksTotal, REBIRTHUPGRADES[0].effect);
      }
      
      // Calculate rune bonuses at runtime
      let totalMoneyBonus = 0;
      let totalGemBonus = 0;
      prev.runes.forEach((amount, index) => {
        const rune = RUNES[index];
        if (amount > 0) {
          totalMoneyBonus += (rune.moneyBonus || 0) * amount;
          totalGemBonus += (rune.gemBonus || 0) * amount;
        }
      });
      
      let newGems = prev.gems;
      // Gem Drop Chance wenn das dritte Rebirth-Upgrade gekauft wurde
      if (prev.rebirth_upgradeAmounts[2] > 0) {
        const baseGemChance = REBIRTHUPGRADES[2].effect; // 0.005 = 0.5%
        const totalGemChance = baseGemChance + totalGemBonus;
        if (Math.random() < totalGemChance) {
          newGems += 1;
        }
      }
      
      const runeMoneyMultiplier = 1 + totalMoneyBonus;
      
      return {
        ...prev,
        money: prev.money + (prev.moneyPerClick * multiplier * runeMoneyMultiplier),
        gems: newGems,
        clicksInRebirth: prev.clicksInRebirth + 1,
        clicksTotal: newClicksTotal,
      };
    });
  }, []);

  const buyUpgrade = useCallback((upgradeIndex: number) => {
    setGameState(prev => {
      const currentPrice = prev.upgradePrices[upgradeIndex];
      const currentAmount = prev.upgradeAmounts[upgradeIndex];
      const maxAmount = prev.maxUpgradeAmounts[upgradeIndex];

      // Spezielle Logik für Unlock-Upgrades (Index 4)
      if (upgradeIndex === 4) {
        if (prev.money >= 1000 && prev.rebirthPoints >= 1 && prev.gems >= 1 && currentAmount < maxAmount) {
          const newUpgradePrices = [...prev.upgradePrices];
          const newUpgradeAmounts = [...prev.upgradeAmounts];
          
          newUpgradeAmounts[upgradeIndex] = currentAmount + 1;

          return {
            ...prev,
            money: prev.money - 1000,
            rebirthPoints: prev.rebirthPoints - 1,
            gems: prev.gems - 1,
            upgradePrices: newUpgradePrices,
            upgradeAmounts: newUpgradeAmounts,
          };
        }
        return prev;
      }
      
      // Normale Upgrade-Logik
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
        // Upgrade 4 ist ein Unlock-Upgrade - keine direkten Effekte nötig
        

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

      // Spezielle Logik für Unlock-Upgrades (Index 3)
      if (upgradeIndex === 3) {
        if (prev.money >= 1000 && prev.rebirthPoints >= 1 && prev.gems >= 1 && rebirth_currentAmount < rebirth_maxAmount) {
          const rebirth_newUpgradePrices = [...prev.rebirth_upgradePrices];
          const rebirth_newUpgradeAmounts = [...prev.rebirth_upgradeAmounts];

          rebirth_newUpgradeAmounts[upgradeIndex] = rebirth_currentAmount + 1;

          return {
            ...prev,
            money: prev.money - 1000,
            rebirthPoints: prev.rebirthPoints - 1,
            gems: prev.gems - 1,
            rebirth_upgradePrices: rebirth_newUpgradePrices,
            rebirth_upgradeAmounts: rebirth_newUpgradeAmounts,
          };
        }
        return prev;
      }
      
      // Normale Rebirth-Upgrade-Logik
      if (prev.rebirthPoints >= rebirth_currentPrice && rebirth_currentAmount < rebirth_maxAmount) {
        const rebirth_newUpgradePrices = [...prev.rebirth_upgradePrices];
        const rebirth_newUpgradeAmounts = [...prev.rebirth_upgradeAmounts];

        const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : 3.0;

        const rebirth_basePrice = REBIRTHUPGRADES[upgradeIndex].price;
        const rebirth_nextAmount = rebirth_currentAmount + 1;
        rebirth_newUpgradePrices[upgradeIndex] = Math.floor(rebirth_basePrice * Math.pow(priceMultiplier, rebirth_nextAmount));

        rebirth_newUpgradeAmounts[upgradeIndex] = rebirth_currentAmount + 1;

        // Upgrade 0: Multipliziert alle Geldgewinne mit clicksTotal^0.01 (wird in clickMoney und Auto-Money angewendet)

        return {
          ...prev,
          rebirthPoints: prev.rebirthPoints - rebirth_currentPrice,
          rebirth_upgradePrices: rebirth_newUpgradePrices,
          rebirth_upgradeAmounts: rebirth_newUpgradeAmounts,
        };
      }
      return prev;
    });
  }, []);

  const performRebirth = useCallback(() => {
    setGameState(prev => {
      // Calculate rune bonuses at the time of rebirth
      let totalRpBonus = 0;
      prev.runes.forEach((amount, index) => {
        const rune = RUNES[index];
        if (amount > 0) {
          totalRpBonus += (rune.rpBonus || 0) * amount;
        }
      });
      
      const baseRebirthPoints = Math.floor(prev.money / 1000);
      const runeRpMultiplier = 1 + totalRpBonus;
      const newRebirthPoints = prev.rebirthPoints + Math.floor(baseRebirthPoints * runeRpMultiplier);
      return {
        ...INITIAL_GAME_STATE,
        rebirthPoints: newRebirthPoints,
        gems: prev.gems, // Gems bleiben bei Rebirth erhalten
        runes: prev.runes, // Runen bleiben bei Rebirth erhalten
        clicksTotal: prev.clicksTotal,
        rebirth_upgradePrices: prev.rebirth_upgradePrices,
        rebirth_upgradeAmounts: prev.rebirth_upgradeAmounts,
        rebirth_maxUpgradeAmounts: prev.rebirth_maxUpgradeAmounts,
        // Normale Upgrades die Gems kosten bleiben auch erhalten
        upgradeAmounts: prev.upgradeAmounts.map((amount, index) => 
          UPGRADES[index]?.type === 'Unlock' ? amount : 0
        ),
        upgradePrices: prev.upgradePrices.map((price, index) => 
          UPGRADES[index]?.type === 'Unlock' ? price : INITIAL_GAME_STATE.upgradePrices[index]
        ),
        maxUpgradeAmounts: prev.maxUpgradeAmounts.map((maxAmount, index) => 
          UPGRADES[index]?.type === 'Unlock' ? maxAmount : INITIAL_GAME_STATE.maxUpgradeAmounts[index]
        ),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
  }, []);

  const cheatMoney = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + (1000 * prev.moneyPerClick),
    }));
  }, []);

  // Development cheat functions
  const devAddMoney = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + 100000,
    }));
  }, []);

  const devAddRebirthPoint = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      rebirthPoints: prev.rebirthPoints + 10,
    }));
  }, []);

  const devAddGem = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gems: prev.gems + 10,
    }));
  }, []);

  const devAddRune = useCallback((runeIndex: number) => {
    setGameState(prev => {
      const newRunes = [...prev.runes];
      newRunes[runeIndex] = (newRunes[runeIndex] || 0) + 1;
      return {
        ...prev,
        runes: newRunes,
      };
    });
  }, []);

  const openRunePack = useCallback(() => {
    if (gameState.gems < 5) return;

    setGameState(prev => {
      const newRunes = [...prev.runes];
      
      // Roll for a rune (out of 1000)
      const roll = Math.floor(Math.random() * 1000);
      let droppedRune = -1;
      
      // Check from most common to rarest (cumulative)
      let cumulativeRate = 0;
      for (let i = 0; i < RUNES.length; i++) {
        cumulativeRate += RUNES[i].dropRate;
        if (roll < cumulativeRate) {
          droppedRune = i;
          break;
        }
      }
      
      // If we got a rune, add it
      if (droppedRune !== -1) {
        newRunes[droppedRune]++;
      }
      
      return {
        ...prev,
        gems: prev.gems - 5,
        runes: newRunes,
      };
    });
  }, [gameState.gems]);

  return {
    gameState,
    clickMoney,
    buyUpgrade,
    buyRebirthUpgrade,
    performRebirth,
    resetGame,
    cheatMoney,
    devAddMoney,
    devAddRebirthPoint,
    devAddGem,
    devAddRune,
    openRunePack,
  };
};