import { useState, useEffect, useCallback } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';
import { saveGameState, loadGameState } from './storage';
import { submitLeaderboardEntry, saveGameDataToFirebase } from './leaderboard';
import { RUNES_1, RUNES_2 } from './types/Runes';
import { UPGRADES } from './types/Upgrade';
import { REBIRTHUPGRADES } from './types/Rebirth_Upgrade';
import { ACHIEVEMENTS } from './types/Achievement';
import { calculateElementalBonuses } from './types/ElementalPrestige';
import { EVENT_CONFIG, getRandomEvent, getUnlockedElements } from './types/ElementalEvent';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState());
  const [offlineProgress, setOfflineProgress] = useState<{ time: number; money: number; clicks: number } | null>(null);

  // Auto-submit to leaderboard every full minute (synchronized)
  useEffect(() => {
    const submitToLeaderboard = async () => {
      try {
        console.log('[Leaderboard] Auto-submitting stats at:', new Date().toLocaleTimeString());
        console.log('[Leaderboard] Current gameState devStats:', gameState.stats?.devStats);
        const success = await submitLeaderboardEntry(gameState);
        if (success) {
          console.log('[Leaderboard] Successfully submitted!');
        } else {
          console.log('[Leaderboard] Submission blocked (dev account or error)');
        }
      } catch (error) {
        console.error('[Leaderboard] Failed to submit:', error);
      }
    };

    // Calculate time until next full minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    console.log('[Leaderboard] Next sync in', Math.round(msUntilNextMinute / 1000), 'seconds');

    let intervalId: number | null = null;

    // Wait until the next full minute, then submit every 60 seconds
    const timeoutId = setTimeout(() => {
      submitToLeaderboard();
      intervalId = setInterval(submitToLeaderboard, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameState]); // UPDATE: Include gameState in dependencies!

  // Auto-save game data to Firebase every 5 minutes
  useEffect(() => {
    const autoSaveToCloud = async () => {
      try {
        console.log('[Auto-Save] Saving game data to cloud at:', new Date().toLocaleTimeString());
        await saveGameDataToFirebase(gameState);
        console.log('[Auto-Save] Successfully saved!');
      } catch (error) {
        console.error('[Auto-Save] Failed to save:', error);
      }
    };

    // Save every 5 minutes (300000ms)
    const saveInterval = setInterval(autoSaveToCloud, 300000);

    return () => {
      clearInterval(saveInterval);
    };
  }, [gameState]);

  // Calculate offline progress on initial load
  useEffect(() => {
    const calculateOfflineProgress = () => {
      const now = Date.now();
      const lastSave = gameState.lastSaveTime || now;
      const timeDiff = (now - lastSave) / 1000; // Convert to seconds
      
      // Track offline time in stats
      if (timeDiff >= 60) {
        const MAX_OFFLINE_TIME = 21600; // 6 hours cap
        const actualOfflineTime = Math.min(timeDiff, MAX_OFFLINE_TIME);
        
        setGameState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            offlineTime: prev.stats.offlineTime + actualOfflineTime,
          },
        }));
      }
      
      // Only show offline progress if away for more than 60 seconds (1 minute)
      if (timeDiff < 60) return;
      
      // Cap at 6 hours (21600 seconds)
      const MAX_OFFLINE_TIME = 21600;
      const offlineTime = Math.min(timeDiff, MAX_OFFLINE_TIME);
      
      // Calculate money earned from moneyPerTick during offline time
      // Also add clicks from Auto Clicker upgrade (Rebirth Upgrade 2)
      if (gameState.moneyPerTick > 0 || gameState.rebirth_upgradeAmounts[1] > 0) {
        // Calculate all multipliers
        const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
        const achievementMoneyBonus = totalAchievementTiers * 0.01;
        const achievementMoneyMultiplier = 1 + achievementMoneyBonus;
        
        // Calculate clicks that would have been generated offline
        let offlineClicks = 0;
        if (gameState.rebirth_upgradeAmounts[1] > 0) {
          offlineClicks = gameState.rebirth_upgradeAmounts[1] * offlineTime; // clicks per second × seconds
        }
        
        // Use total clicks + offline clicks for multiplier calculation
        const totalClicksForMultiplier = gameState.clicksTotal + offlineClicks;
        
        let clickMultiplier = 1;
        if (gameState.rebirth_upgradeAmounts[0] > 0) {
          const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
          clickMultiplier = Math.pow(totalClicksForMultiplier + 1, exponent);
        }
        
        let totalMoneyBonus = 0;
        gameState.runes.forEach((amount, index) => {
          const rune = RUNES_1[index];
          if (amount > 0) {
            totalMoneyBonus += (rune.moneyBonus || 0) * amount;
          }
        });
        const runeMultiplier = 1 + totalMoneyBonus;
        
        let rebirthPointMultiplier = 1;
        if (gameState.rebirth_upgradeAmounts[4] > 0) {
          const effectValue = REBIRTHUPGRADES[4].effect;
          const bonus = Math.log(gameState.rebirthPoints + 1) * effectValue;
          rebirthPointMultiplier = 1 + bonus;
        }
        
        const elementalBonuses = calculateElementalBonuses(gameState.elementalPrestige || null);
        
        const actualMoneyPerTick = gameState.moneyPerTick * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier * elementalBonuses.autoIncomeBonus;
        const moneyEarned = (actualMoneyPerTick * offlineTime) * 0.5; // 50% offline efficiency
        const adjustedClicks = Math.floor(offlineClicks * 0.5); // 50% offline efficiency
        
        setOfflineProgress({ time: offlineTime, money: moneyEarned, clicks: adjustedClicks });
      }
    };
    
    calculateOfflineProgress();
  }, []); // Only run once on mount
  
  // Track online time
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          onlineTime: prev.stats.onlineTime + 1, // Add 1 second
        },
      }));
    }, 1000); // Every second
    
    return () => clearInterval(interval);
  }, []);

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
              currentValue = currentState.stats?.totalUpgradesPurchased || 0;
              break;
            case 'elements':
              currentValue = currentState.stats?.allTimeElementsProduced 
                ? Object.values(currentState.stats.allTimeElementsProduced).reduce((a, b) => a + b, 0)
                : 0;
              break;
            case 'runespurchased':
              currentValue = (currentState.stats?.baseRunePacksPurchased || 0) + (currentState.stats?.elementalRunePacksPurchased || 0);
              break;
            case 'onlinetime':
              currentValue = currentState.stats?.onlineTime || 0;
              break;
            case 'offlinetime':
              currentValue = currentState.stats?.offlineTime || 0;
              break;
            case 'ascensions':
              currentValue = currentState.elementalPrestige 
                ? Object.values(currentState.elementalPrestige).reduce((a, b) => a + b, 0)
                : 0;
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
              conditionMet = (currentState.stats?.totalUpgradesPurchased || 0) >= value;
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
            case 'onlinetime':
              conditionMet = (currentState.stats?.onlineTime || 0) >= value;
              break;
            case 'offlinetime':
              conditionMet = (currentState.stats?.offlineTime || 0) >= value;
              break;
            case 'ascensions':
              const totalAscensions = currentState.elementalPrestige 
                ? Object.values(currentState.elementalPrestige).reduce((a, b) => a + b, 0)
                : 0;
              conditionMet = totalAscensions >= value;
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
      // Auto tick interval
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
            // Event bonuses: Earthquake (×5 Auto Income)
            const activeEvent = prev.activeEvent ? EVENT_CONFIG.find(e => e.id === prev.activeEvent) : null;
            const eventAutoIncomeMultiplier = activeEvent?.effects.autoIncomeMultiplier || 1;
            
            // Apply achievement bonus to money
            moneyFromTicks = prev.moneyPerTick * multiplier * runeMultiplier * rebirthPointMultiplier * achievementBonuses.moneyMultiplier * eventAutoIncomeMultiplier;
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

  // Elemental Events System
  useEffect(() => {
    const now = Date.now();
    
    // Initialize event timers if not set
    if (!gameState.nextEventTime) {
      // Schedule first event in 10-20 minutes
      const firstEventDelay = (10 + Math.random() * 10) * 60 * 1000;
      setGameState(prev => ({
        ...prev,
        nextEventTime: now + firstEventDelay
      }));
      return;
    }
    
    // Check if we need to start a new event
    if (gameState.nextEventTime && now >= gameState.nextEventTime && !gameState.activeEvent) {
      const unlockedElements = getUnlockedElements(gameState.elementalRunes);
      
      if (unlockedElements.length > 0) {
        const newEvent = getRandomEvent(unlockedElements);
        
        if (newEvent) {
          setGameState(prev => ({
            ...prev,
            activeEvent: newEvent.id,
            eventEndTime: now + newEvent.duration,
            nextEventTime: null
          }));
        }
      } else {
        // No unlocked elements, schedule next check
        const nextCheckDelay = (10 + Math.random() * 10) * 60 * 1000;
        setGameState(prev => ({
          ...prev,
          nextEventTime: now + nextCheckDelay
        }));
      }
    }
    
    // Check if current event should end
    if (gameState.activeEvent && gameState.eventEndTime && now >= gameState.eventEndTime) {
      // End current event and schedule next one
      const nextEventDelay = (10 + Math.random() * 10) * 60 * 1000;
      setGameState(prev => ({
        ...prev,
        activeEvent: null,
        eventEndTime: null,
        nextEventTime: now + nextEventDelay
      }));
    }
    
    // Check every second for event transitions
    const interval = setInterval(() => {
      const currentTime = Date.now();
      
      // Check if event should start
      if (gameState.nextEventTime && currentTime >= gameState.nextEventTime && !gameState.activeEvent) {
        const unlockedElements = getUnlockedElements(gameState.elementalRunes);
        
        if (unlockedElements.length > 0) {
          const newEvent = getRandomEvent(unlockedElements);
          
          if (newEvent) {
            setGameState(prev => ({
              ...prev,
              activeEvent: newEvent.id,
              eventEndTime: currentTime + newEvent.duration,
              nextEventTime: null
            }));
          }
        }
      }
      
      // Check if event should end
      if (gameState.activeEvent && gameState.eventEndTime && currentTime >= gameState.eventEndTime) {
        const nextEventDelay = (10 + Math.random() * 10) * 60 * 1000;
        setGameState(prev => ({
          ...prev,
          activeEvent: null,
          eventEndTime: null,
          nextEventTime: currentTime + nextEventDelay
        }));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.nextEventTime, gameState.activeEvent, gameState.eventEndTime, gameState.elementalRunes]);

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
      
      // Event bonuses
      const activeEvent = prev.activeEvent ? EVENT_CONFIG.find(e => e.id === prev.activeEvent) : null;
      const eventGemMultiplier = activeEvent?.effects.gemMultiplier || 1;
      const eventGemDropMultiplier = activeEvent?.effects.gemDropMultiplier || 1;
      
      let newGems = prev.gems;
      let gemsEarned = 0;
      // Gem Drop Chance wenn das dritte Rebirth-Upgrade gekauft wurde
      if (prev.rebirth_upgradeAmounts[2] > 0) {
        const baseGemChance = REBIRTHUPGRADES[2].effect; // 0.005 = 0.5%
        const totalGemChance = (baseGemChance + totalGemBonus + achievementBonuses.gemBonusChance) * eventGemDropMultiplier;
        
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
        gemsEarned = Math.floor(gemsEarned * eventGemMultiplier); // Fire Storm: 2× Gems
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
      
      // Elemental Prestige Boni
      const elementalBonuses = calculateElementalBonuses(prev.elementalPrestige || null);
      
      const eventClickPowerMultiplier = activeEvent?.effects.clickPowerMultiplier || 1;
      const moneyEarned = prev.moneyPerClick * multiplier * runeMoneyMultiplier * rebirthPointMultiplier * achievementBonuses.moneyMultiplier * elementalBonuses.clickPowerBonus * eventClickPowerMultiplier;
      
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
      // Event bonuses: Darkness (-25% Upgrade Costs)
      const activeEvent = prev.activeEvent ? EVENT_CONFIG.find(e => e.id === prev.activeEvent) : null;
      const eventUpgradeDiscount = activeEvent?.effects.upgradeDiscount || 0;
      
      const elementalBonuses = calculateElementalBonuses(prev.elementalPrestige || null);
      const totalDiscount = elementalBonuses.upgradeDiscountBonus * (1 - eventUpgradeDiscount);
      const discountedPrice = Math.floor(currentPrice * totalDiscount);
      
      if (prev.money >= discountedPrice && currentAmount < maxAmount) {
        
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
          money: prev.money - discountedPrice,
          moneyPerClick: newMoneyPerClick,
          moneyPerTick: newMoneyPerTick,
          upgradePrices: newUpgradePrices,
          upgradeAmounts: newUpgradeAmounts,
          stats: {
            ...prev.stats,
            totalUpgradesPurchased: prev.stats.totalUpgradesPurchased + 1,
            allTimeMoneySpent: prev.stats.allTimeMoneySpent + discountedPrice,
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
      const elementalBonuses = calculateElementalBonuses(prev.elementalPrestige || null);
      const rpEarned = Math.floor(baseRebirthPoints * runeRpMultiplier * achievementBonuses.rpMultiplier * elementalBonuses.rpGainBonus);
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
    setGameState(prev => {
      const newDevStats = {
        ...prev.stats.devStats,
        moneyAdded: prev.stats.devStats.moneyAdded + 100000,
      };
      console.log('[Dev] Adding money, new devStats:', newDevStats);
      return {
        ...prev,
        money: prev.money + 100000,
        stats: {
          ...prev.stats,
          devStats: newDevStats,
        },
      };
    });
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

  const openRunePack = useCallback((count: number = 1, returnResults: boolean = false): any => {
    // Check if player can afford the pack(s) based on rune type
    const costPerPack = gameState.currentRuneType === 'basic' ? 5 : 250000;
    const currency = gameState.currentRuneType === 'basic' ? gameState.gems : gameState.money;
    const canAfford = currency >= costPerPack * count;
    
    if (!canAfford) return returnResults ? [] : undefined;

    const currentRunes = gameState.currentRuneType === 'basic' ? RUNES_1 : RUNES_2;
    const elementalBonuses = calculateElementalBonuses(gameState.elementalPrestige || null);
    const luckBonus = elementalBonuses.runePackLuckBonus;
    const resultsToReturn: Array<{ rarity: string; bonus: number; index: number }> = [];

    // Generate results BEFORE setState
    for (let packIndex = 0; packIndex < count; packIndex++) {
      const roll = Math.floor(Math.random() * 1000);
      let droppedRune = -1;
      
      // Apply luck bonus ONLY for basic runes (not elemental)
      const isBasicRunes = gameState.currentRuneType === 'basic';
      const modifiedRates = currentRunes.map((rune, index) => {
        // Secret Rune (dropRate = 0) should never drop from packs
        if (rune.dropRate === 0) return 0;
        
        if (isBasicRunes && luckBonus > 1) {
          // rarityFactor: 0 for common, increases to 1 for highest rarity
          const maxIndex = currentRunes.filter(r => r.dropRate > 0).length - 1;
          const rarityFactor = index / maxIndex;
          
          // Common (index 0) gets penalty, higher rarities get bonus
          // Factor ranges from -0.5 (common) to +1.5 (legendary/mythic)
          const luckFactor = (rarityFactor * 2) - 0.5;
          const adjustment = (luckBonus - 1) * luckFactor * 2.0; // Increased from 0.3 to 2.0 for visible effect
          
          return Math.max(1, rune.dropRate * (1 + adjustment));
        }
        return rune.dropRate;
      });
      
      // Normalize rates to sum to 1000
      const totalRate = modifiedRates.reduce((sum, rate) => sum + rate, 0);
      const normalizedRates = modifiedRates.map(rate => (rate / totalRate) * 1000);
      
      let cumulativeRate = 0;
      for (let i = 0; i < currentRunes.length; i++) {
        cumulativeRate += normalizedRates[i];
        if (roll < cumulativeRate) {
          droppedRune = i;
          break;
        }
      }
      
      if (droppedRune !== -1 && returnResults) {
        const runeData = currentRunes[droppedRune];
        const bonuses: string[] = [];
        
        // Sammle alle Boni der Rune
        if (runeData.moneyBonus) {
          bonuses.push(`💰 +${(runeData.moneyBonus * 100).toFixed(2)}% Money`);
        }
        if (runeData.rpBonus) {
          bonuses.push(`🔄 +${(runeData.rpBonus * 100).toFixed(2)}% RP`);
        }
        if (runeData.gemBonus) {
          bonuses.push(`💎 +${(runeData.gemBonus * 100).toFixed(4)}% Gems`);
        }
        if (runeData.tickBonus) {
          bonuses.push(`⚡ -${runeData.tickBonus}ms Tick Speed`);
        }
        if (runeData.producing && runeData.produceAmount) {
          bonuses.push(`${runeData.produceAmount} ${runeData.producing}/tick`);
        }
        
        resultsToReturn.push({
          rarity: runeData.name,
          bonus: runeData.moneyBonus || runeData.rpBonus || runeData.gemBonus || runeData.produceAmount || 0,
          index: droppedRune
        });
      }
    }

    setGameState(prev => {
      const newRunes = prev.currentRuneType === 'basic' ? [...prev.runes] : [...prev.elementalRunes];
      
      let updatedStats = { ...prev.stats };
      let newShowElementalStats = prev.showElementalStats;
      let newElementalRunesUnlocked = prev.elementalRunesUnlocked;

      // Apply results to state
      resultsToReturn.forEach(result => {
        const droppedRune = result.index;
        newRunes[droppedRune]++;
          
        // Track obtained rune
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
        
        // Check if we should show elemental stats (first elemental rune obtained)
        if (prev.currentRuneType === 'elemental') {
          if (!newShowElementalStats) {
            newShowElementalStats = true;
          }
          if (!newElementalRunesUnlocked) {
            newElementalRunesUnlocked = true;
          }
        }
      });
      
      // Deduct the appropriate cost
      const totalCost = costPerPack * count;
      const newGems = prev.currentRuneType === 'basic' ? prev.gems - totalCost : prev.gems;
      const newMoney = prev.currentRuneType === 'elemental' ? prev.money - totalCost : prev.money;
      
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
            ? updatedStats.baseRunePacksPurchased + count
            : updatedStats.baseRunePacksPurchased,
          elementalRunePacksPurchased: prev.currentRuneType === 'elemental' 
            ? updatedStats.elementalRunePacksPurchased + count
            : updatedStats.elementalRunePacksPurchased,
          allTimeGemsSpent: prev.currentRuneType === 'basic' 
            ? updatedStats.allTimeGemsSpent + totalCost
            : updatedStats.allTimeGemsSpent,
          allTimeMoneySpent: prev.currentRuneType === 'elemental' 
            ? updatedStats.allTimeMoneySpent + totalCost
            : updatedStats.allTimeMoneySpent,
        },
      };
    });

    return returnResults ? resultsToReturn : undefined;
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

  const devSimulateOfflineTime = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    
    // Cap at 6 hours (21600 seconds)
    const MAX_OFFLINE_TIME = 21600;
    const offlineTime = Math.min(seconds, MAX_OFFLINE_TIME);
    
    // Calculate money earned from moneyPerTick during offline time
    // Also add clicks from Auto Clicker upgrade
    if (gameState.moneyPerTick > 0 || gameState.rebirth_upgradeAmounts[1] > 0) {
      // Calculate all multipliers (same as in initial load)
      const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
      const achievementMoneyBonus = totalAchievementTiers * 0.01;
      const achievementMoneyMultiplier = 1 + achievementMoneyBonus;
      
      // Calculate clicks that would have been generated offline
      let offlineClicks = 0;
      if (gameState.rebirth_upgradeAmounts[1] > 0) {
        offlineClicks = gameState.rebirth_upgradeAmounts[1] * offlineTime;
      }
      
      // Use total clicks + offline clicks for multiplier calculation
      const totalClicksForMultiplier = gameState.clicksTotal + offlineClicks;
      
      let clickMultiplier = 1;
      if (gameState.rebirth_upgradeAmounts[0] > 0) {
        const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
        clickMultiplier = Math.pow(totalClicksForMultiplier + 1, exponent);
      }
      
      let totalMoneyBonus = 0;
      gameState.runes.forEach((amount, index) => {
        const rune = RUNES_1[index];
        if (amount > 0) {
          totalMoneyBonus += (rune.moneyBonus || 0) * amount;
        }
      });
      const runeMultiplier = 1 + totalMoneyBonus;
      
      let rebirthPointMultiplier = 1;
      if (gameState.rebirth_upgradeAmounts[4] > 0) {
        const effectValue = REBIRTHUPGRADES[4].effect;
        const bonus = Math.log(gameState.rebirthPoints + 1) * effectValue;
        rebirthPointMultiplier = 1 + bonus;
      }
      
      const actualMoneyPerTick = gameState.moneyPerTick * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier;
      const moneyEarned = (actualMoneyPerTick * offlineTime) * 0.5; // 50% offline efficiency
      const adjustedClicks = Math.floor(offlineClicks * 0.5); // 50% offline efficiency
      
      // Update dev stats and show modal
      setGameState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          devStats: {
            ...prev.stats.devStats,
            offlineTimeAdded: prev.stats.devStats.offlineTimeAdded + offlineTime,
          },
          offlineTime: prev.stats.offlineTime + offlineTime,
        },
      }));
      
      // Show offline progress modal
      setOfflineProgress({ time: offlineTime, money: moneyEarned, clicks: adjustedClicks });
    }
  }, [gameState]);

  const claimOfflineProgress = useCallback(() => {
    if (!offlineProgress) return;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + offlineProgress.money,
      clicksTotal: prev.clicksTotal + (offlineProgress.clicks || 0),
      stats: {
        ...prev.stats,
        allTimeMoneyEarned: prev.stats.allTimeMoneyEarned + offlineProgress.money,
        moneyFromTicks: prev.stats.moneyFromTicks + offlineProgress.money,
        allTimeClicksTotal: prev.stats.allTimeClicksTotal + (offlineProgress.clicks || 0),
        clicksFromTicks: prev.stats.clicksFromTicks + (offlineProgress.clicks || 0),
      },
    }));
    
    setOfflineProgress(null);
  }, [offlineProgress]);
  
  const buyMaxUpgrades = useCallback((upgradeIndex: number) => {
    setGameState(prev => {
      const maxAmount = prev.maxUpgradeAmounts[upgradeIndex];
      let purchaseCount = 0;
      
      // Create mutable copies of arrays and values
      const newUpgradeAmounts = [...prev.upgradeAmounts];
      const newUpgradePrices = [...prev.upgradePrices];
      let newMoney = prev.money;
      let newRebirthPoints = prev.rebirthPoints;
      let newGems = prev.gems;
      let newMoneyPerClick = prev.moneyPerClick;
      let newMoneyPerTick = prev.moneyPerTick;
      let totalMoneySpent = 0;
      let totalRPSpent = 0;
      let totalGemsSpent = 0;
      
      // Kaufe so viele wie möglich
      while (newUpgradeAmounts[upgradeIndex] < maxAmount) {
        const currentPrice = newUpgradePrices[upgradeIndex];
        
        // Spezielle Logik für Unlock-Upgrades (Index 4)
        if (upgradeIndex === 4) {
          if (newMoney >= 1000 && newRebirthPoints >= 1 && newGems >= 1) {
            newMoney -= 1000;
            newRebirthPoints -= 1;
            newGems -= 1;
            newUpgradeAmounts[upgradeIndex] += 1;
            purchaseCount++;
            totalMoneySpent += 1000;
            totalRPSpent += 1;
            totalGemsSpent += 1;
          } else {
            break;
          }
        } else {
          // Normale Upgrades
          if (newMoney >= currentPrice) {
            newMoney -= currentPrice;
            newUpgradeAmounts[upgradeIndex] += 1;
            purchaseCount++;
            totalMoneySpent += currentPrice;
            
            // Apply upgrade effects
            if (upgradeIndex === 0) newMoneyPerClick += 1;
            else if (upgradeIndex === 1) newMoneyPerTick += 1;
            else if (upgradeIndex === 2) newMoneyPerClick += 10;
            else if (upgradeIndex === 3) newMoneyPerTick += 10;
            
            // Calculate next price
            const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : 3.0;
            const basePrice = UPGRADES[upgradeIndex].price;
            const nextAmount = newUpgradeAmounts[upgradeIndex];
            newUpgradePrices[upgradeIndex] = Math.floor(basePrice * Math.pow(priceMultiplier, nextAmount));
          } else {
            break;
          }
        }
      }
      
      // Only update state if purchases were made
      if (purchaseCount === 0) return prev;
      
      const newState = {
        ...prev,
        money: newMoney,
        rebirthPoints: newRebirthPoints,
        gems: newGems,
        moneyPerClick: newMoneyPerClick,
        moneyPerTick: newMoneyPerTick,
        upgradeAmounts: newUpgradeAmounts,
        upgradePrices: newUpgradePrices,
        stats: {
          ...prev.stats,
          totalUpgradesPurchased: prev.stats.totalUpgradesPurchased + purchaseCount,
          allTimeMoneySpent: prev.stats.allTimeMoneySpent + totalMoneySpent,
          allTimeRebirthPointsSpent: prev.stats.allTimeRebirthPointsSpent + totalRPSpent,
          allTimeGemsSpent: prev.stats.allTimeGemsSpent + totalGemsSpent,
        },
      };
      
      // Check achievements after bulk purchase
      const updatedAchievements = checkAchievements(newState);
      return { ...newState, achievements: updatedAchievements };
    });
  }, [checkAchievements]);

  const buyMaxRebirthUpgrades = useCallback((upgradeIndex: number) => {
    setGameState(prev => {
      let newState = { ...prev };
      const maxAmount = prev.rebirth_maxUpgradeAmounts[upgradeIndex];
      let purchaseCount = 0;
      
      // Kaufe so viele wie möglich
      while (newState.rebirth_upgradeAmounts[upgradeIndex] < maxAmount) {
        const currentPrice = newState.rebirth_upgradePrices[upgradeIndex];
        
        if (newState.rebirthPoints >= currentPrice) {
          newState.rebirthPoints -= currentPrice;
          newState.rebirth_upgradeAmounts[upgradeIndex] += 1;
          purchaseCount++;
          newState.stats.totalRebirthUpgradesPurchased++;
          newState.stats.allTimeRebirthPointsSpent += currentPrice;
          
          // Calculate next price (nur für upgrades die mehr als 1x kaufbar sind)
          if (maxAmount > 1) {
            const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : 3.0;
            const basePrice = REBIRTHUPGRADES[upgradeIndex].price;
            const nextAmount = newState.rebirth_upgradeAmounts[upgradeIndex];
            newState.rebirth_upgradePrices[upgradeIndex] = Math.floor(basePrice * Math.pow(priceMultiplier, nextAmount));
          }
        } else {
          break;
        }
      }
      
      // Check achievements after bulk purchase
      const updatedAchievements = checkAchievements(newState);
      return { ...newState, achievements: updatedAchievements };
    });
  }, [checkAchievements]);

  return {
    gameState,
    setGameState,
    offlineProgress,
    setOfflineProgress,
    claimOfflineProgress,
    clickMoney,
    buyUpgrade,
    buyMaxUpgrades,
    buyRebirthUpgrade,
    buyMaxRebirthUpgrades,
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
    devSimulateOfflineTime,
    craftSecretRune,
  };
};