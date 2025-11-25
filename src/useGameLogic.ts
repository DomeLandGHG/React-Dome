import { useState, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';
import { saveGameState, loadGameState } from './storage';
import { RUNES_1, RUNES_2 } from './types/Runes';
import { UPGRADES } from './types/Upgrade';
import { REBIRTHUPGRADES } from './types/Rebirth_Upgrade';
import { ACHIEVEMENTS } from './types/Achievement';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());

  // Check and unlock achievements based on current game state
  const checkAchievements = useCallback((currentState: GameState): Array<{ id: number; tier: number }> => {
    const newAchievements: Array<{ id: number; tier: number }> = [...currentState.achievements];
    
    ACHIEVEMENTS.forEach(achievement => {
      // For dynamic tier achievements (e.g., Money Maker)
      if (achievement.maxTier && achievement.tierMultiplier && achievement.requirement) {
        const { type, value: baseValue } = achievement.requirement;
        
        // Find current tier for this achievement
        const existingAchievement = newAchievements.find(a => a.id === achievement.id);
        const currentTier = existingAchievement ? existingAchievement.tier : 0;
        
        // Check if we can unlock the next tier
        const nextTier = currentTier + 1;
        if (nextTier <= achievement.maxTier) {
          const requiredValue = baseValue * Math.pow(achievement.tierMultiplier, nextTier - 1);
          let currentValue = 0;
          
          switch (type) {
            case 'money':
              currentValue = currentState.money;
              break;
            case 'rebirth':
              currentValue = currentState.rebirthPoints;
              break;
            case 'clicks':
              currentValue = currentState.clicksTotal;
              break;
            case 'gems':
              currentValue = currentState.gems;
              break;
            case 'upgrades':
              currentValue = currentState.upgradeAmounts.reduce((a, b) => a + b, 0);
              break;
            case 'elements':
              currentValue = currentState.stats?.allTimeElementsProduced 
                ? Object.values(currentState.stats.allTimeElementsProduced).reduce((a, b) => a + b, 0)
                : 0;
              break;
            case 'runespurchased':
              currentValue = (currentState.stats?.baseRunePacksPurchased || 0) + (currentState.stats?.elementalRunePacksPurchased || 0);
              break;
          }
          
          if (currentValue >= requiredValue) {
            if (existingAchievement) {
              existingAchievement.tier = nextTier;
            } else {
              newAchievements.push({ id: achievement.id, tier: nextTier });
            }
          }
        }
      } else {
        // Static achievements (e.g., First Rebirth)
        const alreadyUnlocked = newAchievements.some(a => a.id === achievement.id);
        if (alreadyUnlocked) return;
        
        // Check requirements
        if (achievement.requirement) {
          const { type, value } = achievement.requirement;
          let conditionMet = false;
          
          switch (type) {
            case 'money':
              conditionMet = currentState.money >= value;
              break;
            case 'rebirth':
              conditionMet = currentState.rebirthPoints >= value;
              break;
            case 'clicks':
              conditionMet = currentState.clicksTotal >= value;
              break;
            case 'gems':
              conditionMet = currentState.gems >= value;
              break;
            case 'upgrades':
              conditionMet = currentState.upgradeAmounts.reduce((a, b) => a + b, 0) >= value;
              break;
            case 'elements':
              const totalElements = currentState.stats?.allTimeElementsProduced 
                ? Object.values(currentState.stats.allTimeElementsProduced).reduce((a, b) => a + b, 0)
                : 0;
              conditionMet = totalElements >= value;
              break;
            case 'runespurchased':
              const totalPacks = (currentState.stats?.baseRunePacksPurchased || 0) + (currentState.stats?.elementalRunePacksPurchased || 0);
              conditionMet = totalPacks >= value;
              break;
          }
          
          if (conditionMet) {
            newAchievements.push({ id: achievement.id, tier: 1 });
          }
        } else {
          // Special case: First Rebirth (no requirement object)
          if (achievement.id === 1 && currentState.rebirthPoints > 0) {
            newAchievements.push({ id: achievement.id, tier: 1 });
          }
        }
      }
    });
    
    return newAchievements;
  }, []);

  // Calculate Achievement Bonuses
  // Pro Achievement Tier: +1% Money, +1% RP, +1% Elemental Production, +0.1% Gem Chance
  // ABER: Gem Bonus nur wenn Gem-Unlock Upgrade gekauft wurde
  const calculateAchievementBonuses = useCallback((totalTiers: number, hasGemUnlock: boolean) => {
    const moneyBonus = totalTiers * 0.01; // 1% per achievement tier
    const rpBonus = totalTiers * 0.01; // 1% per achievement tier
    const elementalBonus = totalTiers * 0.01; // 1% per achievement tier
    const gemBonus = hasGemUnlock ? totalTiers * 0.001 : 0; // 0.1% per achievement tier, nur wenn Gem Unlock aktiv
    
    return {
      moneyMultiplier: 1 + moneyBonus,
      rpMultiplier: 1 + rpBonus,
      elementalMultiplier: 1 + elementalBonus,
      gemBonusChance: gemBonus
    };
  }, []);

  // Auto-save when state changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Auto money generation & Rebirth-Upgrade: +1 Click per Tick & Elemental Rune Production
  useEffect(() => {
    if (gameState.moneyPerTick > 0 || gameState.rebirth_upgradeAmounts[1] > 0 || gameState.elementalRunes.some(amount => amount > 0)) {
      const interval = setInterval(() => {
        setGameState(prev => {
          // Achievement bonuses
          const hasGemUnlock = prev.rebirth_upgradeAmounts[2] > 0;
          const totalAchievementTiers = prev.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
          const achievementBonuses = calculateAchievementBonuses(totalAchievementTiers, hasGemUnlock);
          
          let multiplier = 1;
          if (prev.rebirth_upgradeAmounts[0] > 0) {
            // Berechne den Exponent: 0.01 + (upgradeAmount - 1) * 0.01
            // Level 1: 0.01, Level 2: 0.02, Level 3: 0.03, Level 4: 0.04, Level 5: 0.05
            const exponent = 0.01 + (prev.rebirth_upgradeAmounts[0] - 1) * 0.01;
            // +1, weil der Bonus immer mit dem nächsten Klick steigt
            multiplier = Math.pow(prev.clicksTotal + 1, exponent);
          }
          
          // Calculate rune money bonus at runtime
          let totalMoneyBonus = 0;
          prev.runes.forEach((amount, index) => {
            const rune = RUNES_1[index];
            if (amount > 0) {
              totalMoneyBonus += (rune.moneyBonus || 0) * amount;
            }
          });
          
          // Geld generieren wie gehabt
          let newMoney = prev.money;
          let moneyFromTicks = 0;
          if (prev.moneyPerTick > 0) {
            const runeMultiplier = 1 + totalMoneyBonus;
            let rebirthPointMultiplier = 1;
            // Effekt des letzten Rebirth-Upgrades: Einkommen mit log(rebirthPoints + 1) * effect% multiplizieren
            if (prev.rebirth_upgradeAmounts[4] > 0) {
              const effectValue = REBIRTHUPGRADES[4].effect; // 0.05
              const bonus = Math.log(prev.rebirthPoints + 1) * effectValue; // log(RP + 1) * 0.05 als Decimal
              rebirthPointMultiplier = 1 + bonus;
            }
            // Apply achievement bonus to money
            moneyFromTicks = prev.moneyPerTick * multiplier * runeMultiplier * rebirthPointMultiplier * achievementBonuses.moneyMultiplier;
            newMoney += moneyFromTicks;
          }
          
          // Elemental Rune Production (with achievement bonus)
          const newElementalResources = [...prev.elementalResources];
          const elementsProduced = { air: 0, earth: 0, water: 0, fire: 0, light: 0, dark: 0 };
          prev.elementalRunes.forEach((amount, index) => {
            if (amount > 0) {
              const rune = RUNES_2[index];
              const baseProduction = (rune.produceAmount || 0) * amount;
              const productionAmount = baseProduction * achievementBonuses.elementalMultiplier;
              newElementalResources[index] += productionAmount;
              
              // Track production per element
              const elementNames = ['air', 'earth', 'water', 'fire', 'light', 'dark'] as const;
              if (index < elementNames.length) {
                elementsProduced[elementNames[index]] = productionAmount;
              }
            }
          });
          
          // Rebirth-Upgrade: +1 Klick pro Tick (aber kein Geld)
          let newClicksTotal = prev.clicksTotal;
          let newClicksInRebirth = prev.clicksInRebirth;
          let clicksFromTicksAmount = 0;
          if (prev.rebirth_upgradeAmounts[1] > 0) {
            clicksFromTicksAmount = prev.rebirth_upgradeAmounts[1];
            newClicksTotal += clicksFromTicksAmount;
            newClicksInRebirth += clicksFromTicksAmount;
          }
          return {
            ...prev,
            money: newMoney,
            clicksTotal: newClicksTotal,
            clicksInRebirth: newClicksInRebirth,
            elementalResources: newElementalResources,
            stats: {
              ...prev.stats,
              allTimeMoneyEarned: prev.stats.allTimeMoneyEarned + moneyFromTicks,
              moneyFromTicks: prev.stats.moneyFromTicks + moneyFromTicks,
              allTimeClicksTotal: prev.stats.allTimeClicksTotal + clicksFromTicksAmount,
              clicksFromTicks: prev.stats.clicksFromTicks + clicksFromTicksAmount,
              allTimeElementsProduced: {
                air: prev.stats.allTimeElementsProduced.air + elementsProduced.air,
                earth: prev.stats.allTimeElementsProduced.earth + elementsProduced.earth,
                water: prev.stats.allTimeElementsProduced.water + elementsProduced.water,
                fire: prev.stats.allTimeElementsProduced.fire + elementsProduced.fire,
                light: prev.stats.allTimeElementsProduced.light + elementsProduced.light,
                dark: prev.stats.allTimeElementsProduced.dark + elementsProduced.dark,
              },
            },
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.moneyPerTick, gameState.rebirth_upgradeAmounts, gameState.clicksTotal, gameState.elementalRunes, calculateAchievementBonuses]);

  const clickMoney = useCallback(() => {
    setGameState(prev => {
      // Achievement bonuses
      const hasGemUnlock = prev.rebirth_upgradeAmounts[2] > 0;
      const totalAchievementTiers = prev.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
      const achievementBonuses = calculateAchievementBonuses(totalAchievementTiers, hasGemUnlock);
      
      const newClicksTotal = prev.clicksTotal + 1;
      let multiplier = 1;
      if (prev.rebirth_upgradeAmounts[0] > 0) {
        // Berechne den Exponent: 0.01 + (upgradeAmount - 1) * 0.01
        // Level 1: 0.01, Level 2: 0.02, Level 3: 0.03, Level 4: 0.04, Level 5: 0.05
        const exponent = 0.01 + (prev.rebirth_upgradeAmounts[0] - 1) * 0.01;
        multiplier = Math.pow(newClicksTotal, exponent);
      }
      
      // Calculate rune bonuses at runtime
      let totalMoneyBonus = 0;
      let totalGemBonus = 0;
      prev.runes.forEach((amount, index) => {
        const rune = RUNES_1[index];
        if (amount > 0) {
          totalMoneyBonus += (rune.moneyBonus || 0) * amount;
          totalGemBonus += (rune.gemBonus || 0) * amount;
        }
      });
      
      let newGems = prev.gems;
      let gemsEarned = 0;
      // Gem Drop Chance wenn das dritte Rebirth-Upgrade gekauft wurde
      if (prev.rebirth_upgradeAmounts[2] > 0) {
        const baseGemChance = REBIRTHUPGRADES[2].effect; // 0.005 = 0.5%
        const totalGemChance = baseGemChance + totalGemBonus + achievementBonuses.gemBonusChance;
        
        // Wenn Chance über 100%, garantiert mindestens 1 Gem + Chance für mehr
        if (totalGemChance >= 1.0) {
          const guaranteedGems = Math.floor(totalGemChance);
          const remainingChance = totalGemChance - guaranteedGems;
          gemsEarned = guaranteedGems;
          if (Math.random() < remainingChance) {
            gemsEarned += 1;
          }
        } else {
          // Normale Chance unter 100%
          if (Math.random() < totalGemChance) {
            gemsEarned = 1;
          }
        }
        newGems += gemsEarned;
      }
      
      const runeMoneyMultiplier = 1 + totalMoneyBonus;
      
      let rebirthPointMultiplier = 1;
      // Effekt des letzten Rebirth-Upgrades: Einkommen mit log(rebirthPoints + 1) * effect% multiplizieren
      if (prev.rebirth_upgradeAmounts[4] > 0) {
        const effectValue = REBIRTHUPGRADES[4].effect; // 0.05
        const bonus = Math.log(prev.rebirthPoints + 1) * effectValue; // log(RP + 1) * 0.05 als Decimal
        rebirthPointMultiplier = 1 + bonus;
      }
      
      const moneyEarned = prev.moneyPerClick * multiplier * runeMoneyMultiplier * rebirthPointMultiplier * achievementBonuses.moneyMultiplier;
      
      const newState = {
        ...prev,
        money: prev.money + moneyEarned,
        gems: newGems,
        clicksInRebirth: prev.clicksInRebirth + 1,
        clicksTotal: newClicksTotal,
        stats: {
          ...prev.stats,
          allTimeMoneyEarned: prev.stats.allTimeMoneyEarned + moneyEarned,
          moneyFromClicks: prev.stats.moneyFromClicks + moneyEarned,
          allTimeGemsEarned: prev.stats.allTimeGemsEarned + gemsEarned,
          allTimeClicksTotal: prev.stats.allTimeClicksTotal + 1,
          clicksFromManual: prev.stats.clicksFromManual + 1,
        },
      };
      
      // Check for new achievements
      const updatedAchievements = checkAchievements(newState);
      
      return {
        ...newState,
        achievements: updatedAchievements
      };
    });
  }, [calculateAchievementBonuses, checkAchievements]);

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
            stats: {
              ...prev.stats,
              totalUpgradesPurchased: prev.stats.totalUpgradesPurchased + 1,
              allTimeMoneySpent: prev.stats.allTimeMoneySpent + 1000,
              allTimeRebirthPointsSpent: prev.stats.allTimeRebirthPointsSpent + 1,
              allTimeGemsSpent: prev.stats.allTimeGemsSpent + 1,
            },
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
        if (upgradeIndex === 0) { // +1$ per click
          newMoneyPerClick += 1;
        } else if (upgradeIndex === 1) { // +1$ per tick
          newMoneyPerTick += 1;
        } else if (upgradeIndex === 2) { // +10$  per click
          newMoneyPerClick += 10;
        } else if (upgradeIndex === 3) { // +10$ per tick
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
          stats: {
            ...prev.stats,
            totalUpgradesPurchased: prev.stats.totalUpgradesPurchased + 1,
            allTimeMoneySpent: prev.stats.allTimeMoneySpent + currentPrice,
          },
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
            stats: {
              ...prev.stats,
              totalRebirthUpgradesPurchased: prev.stats.totalRebirthUpgradesPurchased + 1,
              allTimeMoneySpent: prev.stats.allTimeMoneySpent + 1000,
              allTimeRebirthPointsSpent: prev.stats.allTimeRebirthPointsSpent + 1,
              allTimeGemsSpent: prev.stats.allTimeGemsSpent + 1,
            },
          };
        }
        return prev;
      }

      // Spezielle Logik für das 5. Rebirth-Upgrade (Index 4) - Multiplier-Upgrade
      if (upgradeIndex === 4) {
        if (prev.rebirthPoints >= rebirth_currentPrice && rebirth_currentAmount < rebirth_maxAmount) {
          const rebirth_newUpgradePrices = [...prev.rebirth_upgradePrices];
          const rebirth_newUpgradeAmounts = [...prev.rebirth_upgradeAmounts];

          rebirth_newUpgradeAmounts[upgradeIndex] = rebirth_currentAmount + 1;

          return {
            ...prev,
            rebirthPoints: prev.rebirthPoints - rebirth_currentPrice,
            rebirth_upgradePrices: rebirth_newUpgradePrices,
            rebirth_upgradeAmounts: rebirth_newUpgradeAmounts,
            stats: {
              ...prev.stats,
              totalRebirthUpgradesPurchased: prev.stats.totalRebirthUpgradesPurchased + 1,
              allTimeRebirthPointsSpent: prev.stats.allTimeRebirthPointsSpent + rebirth_currentPrice,
            },
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
          stats: {
            ...prev.stats,
            totalRebirthUpgradesPurchased: prev.stats.totalRebirthUpgradesPurchased + 1,
            allTimeRebirthPointsSpent: prev.stats.allTimeRebirthPointsSpent + rebirth_currentPrice,
          },
        };
      }
      return prev;
    });
  }, []);

  const performRebirth = useCallback(() => {
    setGameState(prev => {
      // Achievement bonuses
      const hasGemUnlock = prev.rebirth_upgradeAmounts[2] > 0;
      const totalAchievementTiers = prev.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
      const achievementBonuses = calculateAchievementBonuses(totalAchievementTiers, hasGemUnlock);
      
      // Calculate rune bonuses at the time of rebirth
      let totalRpBonus = 0;
      prev.runes.forEach((amount, index) => {
        const rune = RUNES_1[index];
        if (amount > 0) {
          totalRpBonus += (rune.rpBonus || 0) * amount;
        }
      });
      
      const baseRebirthPoints = Math.floor(prev.money / 1000);
      const runeRpMultiplier = 1 + totalRpBonus;
      const rpEarned = Math.floor(baseRebirthPoints * runeRpMultiplier * achievementBonuses.rpMultiplier);
      const newRebirthPoints = prev.rebirthPoints + rpEarned;
      
      // Unlock "First Rebirth" achievement (ID 1) if not already unlocked
      const newAchievements = [...prev.achievements];
      if (!newAchievements.some(a => a.id === 1)) {
        newAchievements.push({ id: 1, tier: 1 });
      }
      
      return {
        ...INITIAL_GAME_STATE,
        rebirthPoints: newRebirthPoints,
        gems: prev.gems, // Gems bleiben bei Rebirth erhalten
        runes: prev.runes, // Runen bleiben bei Rebirth erhalten
        elementalRunes: prev.elementalRunes, // Elemental Runen bleiben bei Rebirth erhalten
        elementalResources: prev.elementalResources, // Elemental Resources bleiben bei Rebirth erhalten
        currentRuneType: prev.currentRuneType, // UI state stays
        showElementalStats: prev.showElementalStats, // UI state stays
        elementalRunesUnlocked: prev.elementalRunesUnlocked, // Permanent unlock stays
        achievements: newAchievements, // Achievements bleiben bei Rebirth erhalten
        clicksTotal: prev.clicksTotal,
        rebirth_upgradePrices: prev.rebirth_upgradePrices,
        rebirth_upgradeAmounts: prev.rebirth_upgradeAmounts,
        rebirth_maxUpgradeAmounts: prev.rebirth_maxUpgradeAmounts,
        stats: {
          ...prev.stats,
          allTimeRebirthPointsEarned: prev.stats.allTimeRebirthPointsEarned + rpEarned,
          totalRebirths: prev.stats.totalRebirths + 1,
        },
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
  }, [calculateAchievementBonuses]);

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
      money: prev.money + 100000, // Add 100K instead of 10 trillion
      stats: {
        ...prev.stats,
        devStats: {
          ...prev.stats.devStats,
          moneyAdded: prev.stats.devStats.moneyAdded + 100000,
        },
      },
    }));
  }, []);

  // Direct money addition for console commands
  const devAddMoneyDirect = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + amount,
      stats: {
        ...prev.stats,
        devStats: {
          ...prev.stats.devStats,
          moneyAdded: prev.stats.devStats.moneyAdded + amount,
        },
      },
    }));
  }, []);

  const devAddRebirthPoint = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      rebirthPoints: prev.rebirthPoints + 10,
      stats: {
        ...prev.stats,
        devStats: {
          ...prev.stats.devStats,
          rebirthPointsAdded: prev.stats.devStats.rebirthPointsAdded + 10,
        },
      },
    }));
  }, []);

  const devAddGem = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gems: prev.gems + 10,
      stats: {
        ...prev.stats,
        devStats: {
          ...prev.stats.devStats,
          gemsAdded: prev.stats.devStats.gemsAdded + 10,
        },
      },
    }));
  }, []);

  const devAddClick = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      clicksTotal: prev.clicksTotal + 100,
      stats: {
        ...prev.stats,
        devStats: {
          ...prev.stats.devStats,
          clicksAdded: prev.stats.devStats.clicksAdded + 100,
        },
      },
    }))
  }, []);

  const devAddRune = useCallback((runeIndex: number) => {
    setGameState(prev => {
      const newRunes = [...prev.runes];
      newRunes[runeIndex] = (newRunes[runeIndex] || 0) + 1;
      
      const runeNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'secret'] as const;
      const runeName = runeNames[runeIndex];
      
      return {
        ...prev,
        runes: newRunes,
        stats: {
          ...prev.stats,
          devStats: {
            ...prev.stats.devStats,
            runesAdded: {
              ...prev.stats.devStats.runesAdded,
              [runeName]: prev.stats.devStats.runesAdded[runeName] + 1,
            },
          },
        },
      };
    });
  }, []);

  const devAddElementalRune = useCallback((runeIndex: number) => {
    setGameState(prev => {
      const newElementalRunes = [...prev.elementalRunes];
      newElementalRunes[runeIndex] = (newElementalRunes[runeIndex] || 0) + 1;
      
      const elementNames = ['air', 'earth', 'water', 'fire', 'light', 'dark'] as const;
      const elementName = elementNames[runeIndex];
      
      return {
        ...prev,
        elementalRunes: newElementalRunes,
        showElementalStats: true, // Auto-show stats when elemental runes are added
        elementalRunesUnlocked: true, // Mark as unlocked
        stats: {
          ...prev.stats,
          devStats: {
            ...prev.stats.devStats,
            elementalRunesAdded: {
              ...prev.stats.devStats.elementalRunesAdded,
              [elementName]: prev.stats.devStats.elementalRunesAdded[elementName] + 1,
            },
          },
        },
      };
    });
  }, []);

  const mergeRunes = useCallback((runeIndex: number) => {
    setGameState(prev => {
      // Prüfe ob genug Runen vorhanden sind (mindestens 3)
      if (prev.runes[runeIndex] < 3) return prev;
      
      // Prüfe ob eine höhere Stufe existiert (max ist Mythic = Index 5)
      if (runeIndex >= 5) return prev;
      
      const newRunes = [...prev.runes];
      newRunes[runeIndex] -= 3; // Entferne 3 Runen der aktuellen Stufe
      newRunes[runeIndex + 1] += 1; // Füge 1 Rune der nächsten Stufe hinzu
      
      // Track crafted rune
      const runeNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
      const craftedRuneName = runeNames[runeIndex + 1];
      
      return {
        ...prev,
        runes: newRunes,
        stats: {
          ...prev.stats,
          runesCrafted: {
            ...prev.stats.runesCrafted,
            [craftedRuneName]: prev.stats.runesCrafted[craftedRuneName] + 1,
          },
        },
      };
    });
  }, []);

  const mergeAllRunes = useCallback((runeIndex: number) => {
    setGameState(prev => {
      // Prüfe ob genug Runen vorhanden sind (mindestens 3)
      if (prev.runes[runeIndex] < 3) return prev;
      
      // Prüfe ob eine höhere Stufe existiert (max ist Mythic = Index 5)
      if (runeIndex >= 5) return prev;
      
      const newRunes = [...prev.runes];
      
      // Berechne wie viele Merges möglich sind
      const possibleMerges = Math.floor(newRunes[runeIndex] / 3);
      
      if (possibleMerges > 0) {
        newRunes[runeIndex] -= possibleMerges * 3; // Entferne alle möglichen 3er Gruppen
        newRunes[runeIndex + 1] += possibleMerges; // Füge entsprechend viele höhere Runen hinzu
        
        // Track crafted runes
        const runeNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
        const craftedRuneName = runeNames[runeIndex + 1];
        
        return {
          ...prev,
          runes: newRunes,
          stats: {
            ...prev.stats,
            runesCrafted: {
              ...prev.stats.runesCrafted,
              [craftedRuneName]: prev.stats.runesCrafted[craftedRuneName] + possibleMerges,
            },
          },
        };
      }
      
      return {
        ...prev,
        runes: newRunes
      };
    });
  }, []);

  const openRunePack = useCallback(() => {
    // Check if player can afford the pack based on rune type
    const canAfford = gameState.currentRuneType === 'basic' 
      ? gameState.gems >= 5 
      : gameState.money >= 10000000; // 10 million for elemental packs
    
    if (!canAfford) return;

    setGameState(prev => {
      const currentRunes = prev.currentRuneType === 'basic' ? RUNES_1 : RUNES_2;
      const newRunes = prev.currentRuneType === 'basic' ? [...prev.runes] : [...prev.elementalRunes];
      
      // Roll for a rune (out of 1000)
      const roll = Math.floor(Math.random() * 1000);
      let droppedRune = -1;
      
      // Check from most common to rarest (cumulative)
      let cumulativeRate = 0;
      for (let i = 0; i < currentRunes.length; i++) {
        cumulativeRate += currentRunes[i].dropRate;
        if (roll < cumulativeRate) {
          droppedRune = i;
          break;
        }
      }
      
      // If we got a rune, add it
      if (droppedRune !== -1) {
        newRunes[droppedRune]++;
      }
      
      // Track obtained rune
      let updatedStats = { ...prev.stats };
      if (droppedRune !== -1) {
        if (prev.currentRuneType === 'basic') {
          const runeNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
          const obtainedRuneName = runeNames[droppedRune];
          updatedStats = {
            ...updatedStats,
            runesObtained: {
              ...updatedStats.runesObtained,
              [obtainedRuneName]: updatedStats.runesObtained[obtainedRuneName] + 1,
            },
          };
        } else {
          const elementNames = ['air', 'earth', 'water', 'fire', 'light', 'dark'] as const;
          const obtainedElementName = elementNames[droppedRune];
          updatedStats = {
            ...updatedStats,
            elementalRunesObtained: {
              ...updatedStats.elementalRunesObtained,
              [obtainedElementName]: updatedStats.elementalRunesObtained[obtainedElementName] + 1,
            },
          };
        }
      }
      
      // Check if we should show elemental stats (first elemental rune obtained)
      let newShowElementalStats = prev.showElementalStats;
      let newElementalRunesUnlocked = prev.elementalRunesUnlocked;
      if (prev.currentRuneType === 'elemental' && droppedRune !== -1) {
        if (!prev.showElementalStats) {
          newShowElementalStats = true;
        }
        if (!prev.elementalRunesUnlocked) {
          newElementalRunesUnlocked = true;
        }
      }
      
      // Deduct the appropriate cost
      const newGems = prev.currentRuneType === 'basic' ? prev.gems - 5 : prev.gems;
      const newMoney = prev.currentRuneType === 'elemental' ? prev.money - 10000000 : prev.money;
      
      return {
        ...prev,
        money: newMoney,
        gems: newGems,
        runes: prev.currentRuneType === 'basic' ? newRunes : prev.runes,
        elementalRunes: prev.currentRuneType === 'elemental' ? newRunes : prev.elementalRunes,
        showElementalStats: newShowElementalStats,
        elementalRunesUnlocked: newElementalRunesUnlocked,
        stats: {
          ...updatedStats,
          baseRunePacksPurchased: prev.currentRuneType === 'basic' 
            ? updatedStats.baseRunePacksPurchased + 1 
            : updatedStats.baseRunePacksPurchased,
          elementalRunePacksPurchased: prev.currentRuneType === 'elemental' 
            ? updatedStats.elementalRunePacksPurchased + 1 
            : updatedStats.elementalRunePacksPurchased,
          allTimeGemsSpent: prev.currentRuneType === 'basic' 
            ? updatedStats.allTimeGemsSpent + 5 
            : updatedStats.allTimeGemsSpent,
          allTimeMoneySpent: prev.currentRuneType === 'elemental' 
            ? updatedStats.allTimeMoneySpent + 10000000 
            : updatedStats.allTimeMoneySpent,
        },
      };
    });
  }, [gameState.gems, gameState.money, gameState.currentRuneType]);

  const switchRuneType = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentRuneType: prev.currentRuneType === 'basic' ? 'elemental' : 'basic',
    }));
  }, []);

  const toggleElementalStats = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showElementalStats: !prev.showElementalStats,
    }));
  }, []);

  const toggleMoneyEffects = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      disableMoneyEffects: !prev.disableMoneyEffects,
    }));
  }, []);

  const toggleDiamondEffects = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      disableDiamondEffects: !prev.disableDiamondEffects,
    }));
  }, []);

  const craftSecretRune = useCallback(() => {
    setGameState(prev => {
      // Prüfe ob mindestens 1 von jeder Basic Rune vorhanden ist (IDs 0-5)
      const hasAllBasicRunes = prev.runes.slice(0, 6).every(amount => amount >= 1);
      
      // Prüfe ob mindestens 1 von jeder Elemental Rune vorhanden ist (IDs 0-5)
      const hasAllElementalRunes = prev.elementalRunes.slice(0, 6).every(amount => amount >= 1);
      
      // Wenn nicht alle vorhanden sind, keine Aktion
      if (!hasAllBasicRunes || !hasAllElementalRunes) {
        return prev;
      }
      
      // Kopiere Arrays und verbrauche je 1 Rune
      const newRunes = [...prev.runes];
      const newElementalRunes = [...prev.elementalRunes];
      
      // Entferne je 1 von jeder Basic Rune (IDs 0-5)
      for (let i = 0; i < 6; i++) {
        newRunes[i] -= 1;
      }
      
      // Entferne je 1 von jeder Elemental Rune (IDs 0-5)
      for (let i = 0; i < 6; i++) {
        newElementalRunes[i] -= 1;
      }
      
      // Füge 1 Secret Rune hinzu (ID 6)
      newRunes[6] = (newRunes[6] || 0) + 1;
      
      return {
        ...prev,
        runes: newRunes,
        elementalRunes: newElementalRunes,
        stats: {
          ...prev.stats,
          runesCrafted: {
            ...prev.stats.runesCrafted,
            secret: prev.stats.runesCrafted.secret + 1,
          },
        },
      };
    });
  }, []);

  const toggleDevStats = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      includeDevStats: !prev.includeDevStats,
    }));
  }, []);

  return {
    gameState,
    clickMoney,
    buyUpgrade,
    buyRebirthUpgrade,
    performRebirth,
    resetGame,
    cheatMoney,
    devAddMoney,
    devAddMoneyDirect,
    devAddRebirthPoint,
    devAddGem,
    devAddClick,
    devAddRune,
    devAddElementalRune,
    openRunePack,
    mergeRunes,
    mergeAllRunes,
    switchRuneType,
    toggleElementalStats,
    toggleMoneyEffects,
    toggleDiamondEffects,
    toggleDevStats,
    craftSecretRune,
  };
};