// Typing for pack opening results (sync with PackOpeningAnimation.tsx)
export interface PackResult {
  rarity: string;
  bonus: number;
  index: number;
  elementType?: string;
}
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';
import { submitLeaderboardEntry, saveGameDataToFirebase, loadGameDataFromFirebase } from './leaderboard';
import { RUNES_1, RUNES_2 } from './types/Runes';
import { UPGRADES } from './types/Upgrade';
import { REBIRTHUPGRADES } from './types/Rebirth_Upgrade';
import { ACHIEVEMENTS } from './types/Achievement';
import { calculateElementalBonuses } from './types/ElementalPrestige';
import { EVENT_CONFIG, getRandomEvent, getUnlockedElements } from './types/ElementalEvent';
import { GOLD_SKILLS, calculateGoldSkillBonuses } from './types/GoldSkillTree';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineProgress, setOfflineProgress] = useState<{ time: number; money: number; clicks: number } | null>(null);

  // Load initial game state from Firebase on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // console.log('[useGameLogic] Loading initial data from Firebase...');
      const firebaseData = await loadGameDataFromFirebase();
      
      if (firebaseData) {
        // Migration: Stelle sicher, dass neue Rebirth Upgrades existieren
        const migratedData = { ...firebaseData };
        
        // Safety check: fix infinity values
        if (!isFinite(migratedData.rebirthPoints)) {
          console.warn('[Migration] Detected infinity RP, resetting to 0');
          migratedData.rebirthPoints = 0;
        }
        if (!isFinite(migratedData.money)) {
          console.warn('[Migration] Detected infinity money, resetting to 0');
          migratedData.money = 0;
        }
        if (!isFinite(migratedData.gems)) {
          console.warn('[Migration] Detected infinity gems, resetting to 0');
          migratedData.gems = 0;
        }
        
        // Initialize Gold Skills if not present
        if (!migratedData.goldSkills || migratedData.goldSkills.length === 0) {
          // console.log('[Migration] Initializing Gold Skills');
          migratedData.goldSkills = GOLD_SKILLS.map(skill => ({ ...skill, currentLevel: 0 }));
        } else {
          // Migration: Fix Gold Skills with wrong bonusPerLevel values
          // console.log('[Migration] Syncing Gold Skills with correct definitions');
          migratedData.goldSkills = migratedData.goldSkills.map(savedSkill => {
            const correctSkill = GOLD_SKILLS.find(s => s.id === savedSkill.id);
            if (!correctSkill) return savedSkill;
            
            // Keep currentLevel from saved data, but use all other values from definition
            return {
              ...correctSkill,
              currentLevel: Math.min(savedSkill.currentLevel, correctSkill.maxLevel) // Cap at maxLevel
            };
          });
        }
        
        // Check if upgrade arrays need migration (should have 7 entries for normal upgrades)
        if (!migratedData.upgradeAmounts || migratedData.upgradeAmounts.length < 7) {
          // console.log('[Migration] Updating upgradeAmounts to length 7');
          migratedData.upgradeAmounts = [
            ...(migratedData.upgradeAmounts || [0, 0, 0, 0, 0]),
            0, 0 // Add entries for Tier 3 upgrades
          ];
        }
        
        if (!migratedData.maxUpgradeAmounts || migratedData.maxUpgradeAmounts.length < 7) {
          // console.log('[Migration] Updating maxUpgradeAmounts to length 7');
          migratedData.maxUpgradeAmounts = [
            ...(migratedData.maxUpgradeAmounts || [10, 10, 10, 10, 1]),
            10, 10 // Add max entries for Tier 3 upgrades
          ];
        }
        
        if (!migratedData.upgradePrices || migratedData.upgradePrices.length < 7) {
          // console.log('[Migration] Updating upgradePrices to length 7');
          migratedData.upgradePrices = [
            ...(migratedData.upgradePrices || [10, 100, 1000, 2500, 1000]),
            50000, 100000 // Add prices for Tier 3 upgrades
          ];
        }
        
        // Check if rebirth upgrade arrays need migration (should have 8 entries)
        if (!migratedData.rebirth_upgradeAmounts || migratedData.rebirth_upgradeAmounts.length < 8) {
          // console.log('[Migration] Updating rebirth_upgradeAmounts to length 8');
          migratedData.rebirth_upgradeAmounts = [
            ...(migratedData.rebirth_upgradeAmounts || [0, 0, 0, 0, 0]),
            0, 0, 0 // Add entries for Capacity upgrades
          ];
        }
        
        if (!migratedData.rebirth_maxUpgradeAmounts || migratedData.rebirth_maxUpgradeAmounts.length < 8) {
          // console.log('[Migration] Updating rebirth_maxUpgradeAmounts to length 8');
          migratedData.rebirth_maxUpgradeAmounts = [
            ...(migratedData.rebirth_maxUpgradeAmounts || [5, 5, 1, 1, 1]),
            10, 10, 10 // Add max entries for Capacity upgrades
          ];
        }
        
        if (!migratedData.rebirth_upgradePrices || migratedData.rebirth_upgradePrices.length < 8) {
          // console.log('[Migration] Updating rebirth_upgradePrices to length 8');
          migratedData.rebirth_upgradePrices = [
            ...(migratedData.rebirth_upgradePrices || [1, 5, 15, 1, 25]),
            100, 250, 500 // Add prices for Capacity upgrades
          ];
        }
        
        setGameState(migratedData);
      } else {
        // console.log('[useGameLogic] No Firebase data found, using INITIAL_GAME_STATE');
        // New user - save initial state to Firebase
        await saveGameDataToFirebase(INITIAL_GAME_STATE);
      }
      
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Auto-submit to leaderboard every full minute (synchronized)
  useEffect(() => {
    const submitToLeaderboard = async () => {
      // Don't submit if page is reloading for cloud data
      if (localStorage.getItem('_reloading') === 'true') {
        // console.log('[Leaderboard] Skipping auto-submit - page is reloading');
        return;
      }
      
      try {
        // console.log('[Leaderboard] Auto-submitting stats at:', new Date().toLocaleTimeString());
        // console.log('[Leaderboard] Current gameState devStats:', gameState.stats?.devStats);
        const success = await submitLeaderboardEntry(gameState);
        if (success) {
          // console.log('[Leaderboard] Successfully submitted!');
        } else {
          // console.log('[Leaderboard] Submission blocked (dev account or error)');
        }
      } catch (error) {
        console.error('[Leaderboard] Failed to submit:', error);
      }
    };

    // Calculate time until next full minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

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

  // Calculate offline progress on initial load
  useEffect(() => {
    if (isLoading) return; // Wait for data to load
    // Clear reloading flag on startup
    localStorage.removeItem('_reloading');
    
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
        // Safety check
        if (gameState.achievements === undefined || gameState.runes === undefined) {
          setIsLoading(false);
          return;
        }
        
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
        const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
        
        const actualMoneyPerTick = gameState.moneyPerTick * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier * elementalBonuses.autoIncomeBonus * goldSkillBonuses.clickPowerMultiplier;
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
          let requiredValue = baseValue * Math.pow(achievement.tierMultiplier, nextTier - 1);
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
              // Special case: Ascension Master requires linear progression (1, 2, 3, ...)
              currentValue = currentState.elementalPrestige 
                ? Object.values(currentState.elementalPrestige).reduce((a, b) => a + b, 0)
                : 0;
              requiredValue = nextTier; // Each tier requires exactly that many ascensions
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
    
    // Only return new array if something actually changed
    // Check length first (fast check)
    if (newAchievements.length !== currentState.achievements.length) {
      return newAchievements;
    }
    
    // Check if any achievement changed
    const hasChanges = newAchievements.some((newAch, index) => {
      const oldAch = currentState.achievements[index];
      return !oldAch || newAch.id !== oldAch.id || newAch.tier !== oldAch.tier;
    });
    
    if (hasChanges) {
      return newAchievements;
    }
    
    // No changes - return same reference to prevent unnecessary re-renders
    return currentState.achievements;
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

  // Auto-save to Firebase when state changes (with debounce)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    const saveTimeout = setTimeout(() => {
      saveGameDataToFirebase(gameState);
    }, 2000); // Debounce: save 2 seconds after last change
    
    return () => clearTimeout(saveTimeout);
  }, [gameState, isLoading]);

  // Auto money generation & Rebirth-Upgrade: +1 Click per Tick & Elemental Rune Production
  useEffect(() => {
    if (gameState.moneyPerTick > 0 || gameState.rebirth_upgradeAmounts[1] > 0 || gameState.elementalRunes.some(amount => amount > 0)) {
      // Auto tick interval
      const interval = setInterval(() => {
        setGameState(prev => {
          // Safety check
          if (prev.achievements === undefined || prev.runes === undefined || prev.rebirth_upgradeAmounts === undefined) {
            return prev;
          }
          
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
            
            // Gold Skill bonuses
            const goldSkillBonuses = calculateGoldSkillBonuses(prev.goldSkills || []);
            
            // Apply achievement bonus, gold skills, and event to money
            moneyFromTicks = prev.moneyPerTick * multiplier * runeMultiplier * rebirthPointMultiplier * achievementBonuses.moneyMultiplier * goldSkillBonuses.clickPowerMultiplier * eventAutoIncomeMultiplier;
            newMoney += moneyFromTicks;
          }
          
          // Elemental Rune Production (with achievement bonus and Gold Skills)
          const goldSkillBonuses = calculateGoldSkillBonuses(prev.goldSkills || []);
          const newElementalResources = [...prev.elementalResources];
          const elementsProduced = { air: 0, earth: 0, water: 0, fire: 0, light: 0, dark: 0 };
          prev.elementalRunes.forEach((amount, index) => {
            if (amount > 0) {
              const rune = RUNES_2[index];
              const baseProduction = (rune.produceAmount || 0) * amount;
              const productionAmount = baseProduction * achievementBonuses.elementalMultiplier * goldSkillBonuses.elementalGainMultiplier;
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
          
          // Auto Clicker from Gold Skills
          if (goldSkillBonuses.autoClicksPerTick > 0) {
            clicksFromTicksAmount += goldSkillBonuses.autoClicksPerTick;
            newClicksTotal += goldSkillBonuses.autoClicksPerTick;
            newClicksInRebirth += goldSkillBonuses.autoClicksPerTick;
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

  // Ultra-fast click batching with dynamic frame rate targeting
  const clickBatchRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const frameCountRef = useRef<number>(0);
  const avgFrameTimeRef = useRef<number>(16.67); // Target 60 FPS
  
  const clickMoney = useCallback(() => {
    // Simply increment the batch counter - no throttling at all
    clickBatchRef.current++;
    
    // If already scheduled, the existing RAF will process all accumulated clicks
    if (rafIdRef.current !== null) {
      return;
    }
    
    // Schedule batch processing on next animation frame
    rafIdRef.current = requestAnimationFrame(() => {
      const now = Date.now();
      const frameDelta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      
      // Track average frame time for adaptive optimization
      avgFrameTimeRef.current = avgFrameTimeRef.current * 0.9 + frameDelta * 0.1;
      frameCountRef.current++;
      
      const clicksToProcess = clickBatchRef.current;
      clickBatchRef.current = 0;
      rafIdRef.current = null;
      
      // Skip expensive operations if FPS is dropping (frame time > 20ms = under 50 FPS)
      const isLowFPS = avgFrameTimeRef.current > 20;
      
      // Process all batched clicks in one state update
      setGameState(prev => {
        // Safety check: return unchanged state if not fully loaded
        if (prev.achievements === undefined || prev.rebirth_upgradeAmounts === undefined || prev.runes === undefined) {
          return prev;
        }
        
        // Achievement bonuses
        const hasGemUnlock = prev.rebirth_upgradeAmounts[2] > 0;
        const totalAchievementTiers = prev.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
        const achievementBonuses = calculateAchievementBonuses(totalAchievementTiers, hasGemUnlock);
        
        const newClicksTotal = prev.clicksTotal + clicksToProcess;
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
      
      // Process gem drops for batched clicks - ultra-optimized for high click rates
      if (prev.rebirth_upgradeAmounts[2] > 0) {
        const goldSkillBonuses = calculateGoldSkillBonuses(prev.goldSkills || []);
        const baseGemChance = REBIRTHUPGRADES[2].effect; // 0.005 = 0.5%
        const totalGemChance = (baseGemChance + totalGemBonus + achievementBonuses.gemBonusChance) * goldSkillBonuses.gemGainMultiplier * eventGemDropMultiplier;
        
        // Ultra-optimized: Use expected value for batches > 10 clicks (reduced from 20)
        if (clicksToProcess > 10) {
          // Use pure expected value for maximum performance
          gemsEarned = Math.floor(clicksToProcess * totalGemChance);
        } else {
          // For small batches: precise calculation
          for (let i = 0; i < clicksToProcess; i++) {
            if (totalGemChance >= 1.0) {
              const guaranteedGems = Math.floor(totalGemChance);
              const remainingChance = totalGemChance - guaranteedGems;
              gemsEarned += guaranteedGems;
              if (Math.random() < remainingChance) {
                gemsEarned += 1;
              }
            } else {
              if (Math.random() < totalGemChance) {
                gemsEarned += 1;
              }
            }
          }
        }
        
        // Apply event multiplier and Diamond Rain bonus
        gemsEarned = Math.floor(gemsEarned * eventGemMultiplier);
        gemsEarned *= goldSkillBonuses.bonusGemMultiplier;
        
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
      
      // Gold Skill bonuses
      const goldSkillBonuses = calculateGoldSkillBonuses(prev.goldSkills || []);
      
      // Critical Strike check - only check once per batch for performance
      const isCritical = goldSkillBonuses.criticalStrikeChance > 0 && Math.random() < goldSkillBonuses.criticalStrikeChance;
      const critMultiplier = isCritical ? 10 : 1;
      
      const eventClickPowerMultiplier = activeEvent?.effects.clickPowerMultiplier || 1;
      
      // Multiply by clicksToProcess to get total money for all batched clicks
      const moneyEarned = prev.moneyPerClick * multiplier * runeMoneyMultiplier * rebirthPointMultiplier * achievementBonuses.moneyMultiplier * goldSkillBonuses.clickPowerMultiplier * elementalBonuses.clickPowerBonus * eventClickPowerMultiplier * critMultiplier * clicksToProcess;
      
      const newState = {
        ...prev,
        money: prev.money + moneyEarned,
        gems: newGems,
        clicksInRebirth: prev.clicksInRebirth + clicksToProcess,
        clicksTotal: newClicksTotal,
        stats: {
          ...prev.stats,
          allTimeMoneyEarned: prev.stats.allTimeMoneyEarned + moneyEarned,
          moneyFromClicks: prev.stats.moneyFromClicks + moneyEarned,
          allTimeGemsEarned: prev.stats.allTimeGemsEarned + gemsEarned,
          allTimeClicksTotal: prev.stats.allTimeClicksTotal + clicksToProcess,
          clicksFromManual: prev.stats.clicksFromManual + clicksToProcess,
        },
      };
      
      // ULTRA OPTIMIZATION: Reduce achievement check frequency dramatically
      // Only check every 1000 clicks OR every 60 seconds
      // Skip entirely if FPS is low or processing massive batches
      const shouldCheckAchievements = 
        !isLowFPS && 
        clicksToProcess < 100 && // Skip if processing massive batches (200+ clicks/sec scenarios)
        (newClicksTotal % 1000 === 0 || Date.now() - ((window as any).__lastAchievementCheck || 0) > 60000);
      
      if (shouldCheckAchievements) {
        (window as any).__lastAchievementCheck = Date.now();
        const updatedAchievements = checkAchievements(newState);
        
        if (updatedAchievements !== newState.achievements) {
          return {
            ...newState,
            achievements: updatedAchievements
          };
        }
      }
      
      return newState;
      });
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
        const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : upgradeIndex <= 6 ? 3.0 : 3.5;
        
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
        } else if (upgradeIndex === 5) { // +100$ per click
          newMoneyPerClick += 100;
        } else if (upgradeIndex === 6) { // +100$ per tick
          newMoneyPerTick += 100;
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
      
      // Spezielle Logik für Tier 1 Capacity (Index 5), Tier 2 Capacity (Index 6) und Tier 3 Capacity (Index 7)
      if (upgradeIndex === 5 || upgradeIndex === 6 || upgradeIndex === 7) {
        if (prev.rebirthPoints >= rebirth_currentPrice && rebirth_currentAmount < rebirth_maxAmount) {
          const rebirth_newUpgradePrices = [...prev.rebirth_upgradePrices];
          const rebirth_newUpgradeAmounts = [...prev.rebirth_upgradeAmounts];
          const newMaxUpgradeAmounts = [...prev.maxUpgradeAmounts];

          const priceMultiplier = 2.5;
          const rebirth_basePrice = REBIRTHUPGRADES[upgradeIndex].price;
          const rebirth_nextAmount = rebirth_currentAmount + 1;
          rebirth_newUpgradePrices[upgradeIndex] = Math.floor(rebirth_basePrice * Math.pow(priceMultiplier, rebirth_nextAmount));
          rebirth_newUpgradeAmounts[upgradeIndex] = rebirth_currentAmount + 1;

          // Tier 1 Capacity: Erhöht Max von Upgrade 0 und 1 um 100
          if (upgradeIndex === 5) {
            newMaxUpgradeAmounts[0] += 100; // +1$ per Click
            newMaxUpgradeAmounts[1] += 100; // +1$ per Tick
          }
          // Tier 2 Capacity: Erhöht Max von Upgrade 2 und 3 um 10
          else if (upgradeIndex === 6) {
            newMaxUpgradeAmounts[2] += 10; // +10$ per Click
            newMaxUpgradeAmounts[3] += 10; // +10$ per Tick
          }
          // Tier 3 Capacity: Erhöht Max von Upgrade 5 und 6 um 5
          else if (upgradeIndex === 7) {
            newMaxUpgradeAmounts[5] += 5; // +100$ per Click
            newMaxUpgradeAmounts[6] += 5; // +100$ per Tick
          }

          return {
            ...prev,
            rebirthPoints: prev.rebirthPoints - rebirth_currentPrice,
            rebirth_upgradePrices: rebirth_newUpgradePrices,
            rebirth_upgradeAmounts: rebirth_newUpgradeAmounts,
            maxUpgradeAmounts: newMaxUpgradeAmounts,
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
      // Safety check
      if (prev.achievements === undefined || prev.runes === undefined || prev.rebirth_upgradeAmounts === undefined) {
        return prev;
      }
      
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
      
      // Calculate Gold Skill bonuses
      const goldSkillBonuses = calculateGoldSkillBonuses(prev.goldSkills || []);
      
      const totalMultiplier = runeRpMultiplier * achievementBonuses.rpMultiplier * elementalBonuses.rpGainBonus * goldSkillBonuses.rpGainMultiplier;
      
      // Check if we reached infinity - trigger Gold RP prestige!
      if (!isFinite(baseRebirthPoints * totalMultiplier)) {
        // console.log('[Rebirth] 🌟 INFINITY REACHED! Triggering Gold RP Prestige!');
        
        return {
          ...INITIAL_GAME_STATE,
          username: prev.username,
          goldRP: (prev.goldRP || 0) + 1, // Award 1 Gold RP!
          goldSkills: prev.goldSkills || [], // Keep Gold Skills
          achievements: prev.achievements, // Keep achievements
          stats: {
            ...INITIAL_GAME_STATE.stats,
            totalRebirths: prev.stats.totalRebirths + 1,
          },
          // Keep all settings
          disableMoneyEffects: prev.disableMoneyEffects,
          disableDiamondEffects: prev.disableDiamondEffects,
          disablePackAnimations: prev.disablePackAnimations,
          disableCraftAnimations: prev.disableCraftAnimations,
          includeDevStats: prev.includeDevStats,
        };
      }
      
      // Normal rebirth calculation
      const cappedMultiplier = Math.min(totalMultiplier, 1e308);
      const rpEarned = Math.floor(baseRebirthPoints * cappedMultiplier);
      const safeRpEarned = isFinite(rpEarned) ? rpEarned : 0;
      const newRebirthPoints = prev.rebirthPoints + safeRpEarned;
      
      // Unlock "First Rebirth" achievement (ID 1) if not already unlocked
      const newAchievements = [...prev.achievements];
      if (!newAchievements.some(a => a.id === 1)) {
        newAchievements.push({ id: 1, tier: 1 });
      }
      
      // Preserve trader offers and refresh timers
      return {
        ...INITIAL_GAME_STATE,
        username: prev.username, // Preserve username on rebirth
        goldRP: prev.goldRP || 0, // Preserve Gold RP
        rebirthPoints: newRebirthPoints,
        gems: prev.gems, // Gems bleiben bei Rebirth erhalten
        runes: prev.runes, // Runen bleiben bei Rebirth erhalten
        elementalRunes: prev.elementalRunes, // Elemental Runen bleiben bei Rebirth erhalten
        elementalResources: prev.elementalResources, // Elemental Resources bleiben bei Rebirth erhalten
        elementalPrestige: prev.elementalPrestige, // Elemental Prestige bleibt bei Rebirth erhalten
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
          allTimeRebirthPointsEarned: prev.stats.allTimeRebirthPointsEarned + safeRpEarned,
          totalRebirths: prev.stats.totalRebirths + 1,
        },
        // Normale Upgrades die Gems kosten bleiben auch erhalten
        upgradeAmounts: prev.upgradeAmounts.map((amount, index) => 
          UPGRADES[index]?.type === 'Unlock' ? amount : 0
        ),
        upgradePrices: prev.upgradePrices.map((price, index) => 
          UPGRADES[index]?.type === 'Unlock' ? price : INITIAL_GAME_STATE.upgradePrices[index]
        ),
        maxUpgradeAmounts: prev.maxUpgradeAmounts, // Preserve capacity upgrades from Rebirth Shop
        traderOffers: prev.traderOffers,
        traderLastRefresh: prev.traderLastRefresh,
        traderNextRefresh: prev.traderNextRefresh,
        // Keep Gold Skills
        goldSkills: prev.goldSkills || [],
        // Keep all settings
        disableMoneyEffects: prev.disableMoneyEffects,
        disableDiamondEffects: prev.disableDiamondEffects,
        disablePackAnimations: prev.disablePackAnimations,
        disableCraftAnimations: prev.disableCraftAnimations,
        includeDevStats: prev.includeDevStats,
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
      // console.log('[Dev] Adding money, new devStats:', newDevStats);
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
    
    const actualCount = Math.min(count, Math.floor(currency / costPerPack));
    
    if (actualCount <= 0) return returnResults ? [] : undefined;

    const currentRunes = gameState.currentRuneType === 'basic' ? RUNES_1 : RUNES_2;
    const elementalBonuses = calculateElementalBonuses(gameState.elementalPrestige || null);
    const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
    
    // Combine luck bonuses from Elemental Prestige and Gold Skills
    const luckBonus = elementalBonuses.runePackLuckBonus * (1 + goldSkillBonuses.runeChanceBonus);
    const resultsToReturn: Array<{ rarity: string; bonus: number; index: number }> = [];

    // For very large pack counts (>10000), use probability distribution instead of simulation
    const SIMULATION_THRESHOLD = 10000;
    const useDistribution = actualCount > SIMULATION_THRESHOLD;

    if (useDistribution) {
      // Calculate modified drop rates with luck bonus
      const modifiedRates = currentRunes.map((rune, index) => {
        if (rune.dropRate === 0) return 0;
        
        if (luckBonus > 1) {
          const maxIndex = currentRunes.filter(r => r.dropRate > 0).length - 1;
          const rarityFactor = index / maxIndex;
          const luckFactor = (rarityFactor * 2) - 0.5;
          const adjustment = (luckBonus - 1) * luckFactor * 2.0;
          return Math.max(1, rune.dropRate * (1 + adjustment));
        }
        return rune.dropRate;
      });

      // Normalize rates to probabilities (sum to 1)
      const totalRate = modifiedRates.reduce((sum, rate) => sum + rate, 0);
      const probabilities = modifiedRates.map(rate => rate / totalRate);

      // Calculate expected count for each rune type based on probability
      const runeCounts: number[] = [];
      let remainingPacks = actualCount;

      probabilities.forEach((prob, index) => {
        // Skip runes with 0 drop rate (e.g., Secret Rune)
        if (modifiedRates[index] === 0) {
          runeCounts.push(0);
          return;
        }
        
        if (index === probabilities.length - 1) {
          // Last droppable rune gets all remaining packs to ensure total is exact
          runeCounts.push(remainingPacks);
        } else {
          const expectedCount = Math.floor(actualCount * prob);
          runeCounts.push(expectedCount);
          remainingPacks -= expectedCount;
        }
      });

      // Create results for animation - ensure all rune types with count > 0 are represented
      if (returnResults) {
        // Add one sample of each rune type that was actually obtained
        runeCounts.forEach((count, index) => {
          if (count > 0 && currentRunes[index]) {
            const runeData = currentRunes[index];
              resultsToReturn.push({
                rarity: runeData.name,
                bonus: runeData.moneyBonus || runeData.rpBonus || runeData.gemBonus || runeData.produceAmount || 0,
                index: index,
                elementType: runeData.producing ? runeData.producing : undefined
              } as PackResult);
          }
        });
        
        // Fill remaining slots with random samples (up to 100 total)
        const remainingSamples = Math.max(0, 100 - resultsToReturn.length);
        for (let i = 0; i < remainingSamples; i++) {
          const roll = Math.random();
          let cumulative = 0;
          let droppedRune = -1;

          for (let j = 0; j < probabilities.length; j++) {
            // Skip runes with 0 drop rate
            if (modifiedRates[j] === 0) continue;
            
            cumulative += probabilities[j];
            if (roll < cumulative) {
              droppedRune = j;
              break;
            }
          }

          if (droppedRune !== -1) {
            const runeData = currentRunes[droppedRune];
            resultsToReturn.push({
              rarity: runeData.name,
              bonus: runeData.moneyBonus || runeData.rpBonus || runeData.gemBonus || runeData.produceAmount || 0,
              index: droppedRune
            });
          }
        }
      }

      // Store rune counts for state update
      (resultsToReturn as any).__distributionCounts = runeCounts;
      (resultsToReturn as any).__actualCounts = runeCounts; // Also store for animation

    } else {
      // Original simulation for smaller pack counts
      for (let packIndex = 0; packIndex < actualCount; packIndex++) {
        const roll = Math.floor(Math.random() * 1000);
        let droppedRune = -1;
        
        const modifiedRates = currentRunes.map((rune, index) => {
          if (rune.dropRate === 0) return 0;
          
          if (luckBonus > 1) {
            const maxIndex = currentRunes.filter(r => r.dropRate > 0).length - 1;
            const rarityFactor = index / maxIndex;
            const luckFactor = (rarityFactor * 2) - 0.5;
            const adjustment = (luckBonus - 1) * luckFactor * 2.0;
            return Math.max(1, rune.dropRate * (1 + adjustment));
          }
          return rune.dropRate;
        });
        
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
            index: droppedRune,
            elementType: runeData.producing ? runeData.producing : undefined
          } as PackResult);
        }
      }
    }

    setGameState(prev => {
      const newRunes = prev.currentRuneType === 'basic' ? [...prev.runes] : [...prev.elementalRunes];
      
      let updatedStats = { ...prev.stats };
      let newShowElementalStats = prev.showElementalStats;
      let newElementalRunesUnlocked = prev.elementalRunesUnlocked;

      // Check if using distribution-based calculation
      const distributionCounts = (resultsToReturn as any).__distributionCounts;
      
      if (distributionCounts) {
        // Apply distribution counts directly
        distributionCounts.forEach((count: number, index: number) => {
          newRunes[index] += count;
          
          // Track obtained runes in stats
          if (prev.currentRuneType === 'basic') {
            const runeNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
            if (index < runeNames.length) {
              const obtainedRuneName = runeNames[index];
              updatedStats = {
                ...updatedStats,
                runesObtained: {
                  ...updatedStats.runesObtained,
                  [obtainedRuneName]: updatedStats.runesObtained[obtainedRuneName] + count,
                },
              };
            }
          } else {
            const elementNames = ['air', 'earth', 'water', 'fire', 'light', 'dark'] as const;
            if (index < elementNames.length) {
              const obtainedElementName = elementNames[index];
              updatedStats = {
                ...updatedStats,
                elementalRunesObtained: {
                  ...updatedStats.elementalRunesObtained,
                  [obtainedElementName]: updatedStats.elementalRunesObtained[obtainedElementName] + count,
                },
              };
            }
          }
        });
        
        // Enable elemental stats if elemental runes were obtained
        if (prev.currentRuneType === 'elemental') {
          newShowElementalStats = true;
          newElementalRunesUnlocked = true;
        }
      } else {
        // Apply simulated results (original behavior)
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
      }
      
      // Deduct the appropriate cost - use actualCount instead of count
      const totalCost = costPerPack * actualCount;
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
            ? updatedStats.baseRunePacksPurchased + actualCount
            : updatedStats.baseRunePacksPurchased,
          elementalRunePacksPurchased: prev.currentRuneType === 'elemental' 
            ? updatedStats.elementalRunePacksPurchased + actualCount
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
  }, [gameState.gems, gameState.money, gameState.currentRuneType, gameState.elementalPrestige]);

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

  const craftSecretRune = useCallback((count: number = 1) => {
    setGameState(prev => {
      // Berechne wie viele Secret Runes tatsächlich craftbar sind
      const maxBasicRunes = Math.min(...prev.runes.slice(0, 6));
      const maxElementalRunes = Math.min(...prev.elementalRunes.slice(0, 6));
      const maxCraftable = Math.min(maxBasicRunes, maxElementalRunes, count);
      
      // Wenn keine craftbar sind, keine Aktion
      if (maxCraftable <= 0) {
        return prev;
      }
      
      // Kopiere Arrays und verbrauche die benötigten Runen
      const newRunes = [...prev.runes];
      const newElementalRunes = [...prev.elementalRunes];
      
      // Entferne die benötigten Basic Runes (IDs 0-5)
      for (let i = 0; i < 6; i++) {
        newRunes[i] -= maxCraftable;
      }
      
      // Entferne die benötigten Elemental Runes (IDs 0-5)
      for (let i = 0; i < 6; i++) {
        newElementalRunes[i] -= maxCraftable;
      }
      
      // Füge Secret Runen hinzu (ID 6)
      newRunes[6] = (newRunes[6] || 0) + maxCraftable;
      
      return {
        ...prev,
        runes: newRunes,
        elementalRunes: newElementalRunes,
        stats: {
          ...prev.stats,
          runesCrafted: {
            ...prev.stats.runesCrafted,
            secret: prev.stats.runesCrafted.secret + maxCraftable,
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
      // Safety check
      if (gameState.achievements === undefined || gameState.runes === undefined) {
        return;
      }
      
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
      
      const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
      
      const actualMoneyPerTick = gameState.moneyPerTick * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier * goldSkillBonuses.clickPowerMultiplier;
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
            else if (upgradeIndex === 5) newMoneyPerClick += 100;
            else if (upgradeIndex === 6) newMoneyPerTick += 100;
            
            // Calculate next price
            const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : upgradeIndex <= 6 ? 3.0 : 3.5;
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
          
          // Apply capacity upgrades immediately
          if (upgradeIndex === 5) {
            // Tier 1 Capacity
            newState.maxUpgradeAmounts = [...newState.maxUpgradeAmounts];
            newState.maxUpgradeAmounts[0] += 100; // +1$ per Click
            newState.maxUpgradeAmounts[1] += 100; // +1$ per Tick
          } else if (upgradeIndex === 6) {
            // Tier 2 Capacity
            newState.maxUpgradeAmounts = [...newState.maxUpgradeAmounts];
            newState.maxUpgradeAmounts[2] += 10; // +10$ per Click
            newState.maxUpgradeAmounts[3] += 10; // +10$ per Tick
          } else if (upgradeIndex === 7) {
            // Tier 3 Capacity
            newState.maxUpgradeAmounts = [...newState.maxUpgradeAmounts];
            newState.maxUpgradeAmounts[5] += 5; // +100$ per Click
            newState.maxUpgradeAmounts[6] += 5; // +100$ per Tick
          }
          
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

  // Manual save function
  const manualSave = useCallback(async () => {
    // console.log('[Manual Save] 💾 Saving game...');
    const success = await saveGameDataToFirebase(gameState);
    if (success) {
      // console.log('[Manual Save] ✅ Game saved successfully!');
    } else {
      // console.log('[Manual Save] ❌ Save failed!');
    }
    return success;
  }, [gameState]);

  // Unlock Gold Skill
  const unlockGoldSkill = useCallback((skillId: number) => {
    setGameState(prev => {
      const skill = prev.goldSkills.find(s => s.id === skillId);
      if (!skill) return prev;

      // Check if player has enough Gold RP
      const cost = skill.cost;
      if (prev.goldRP < cost) return prev;

      // Check if skill is already maxed
      if (skill.currentLevel >= skill.maxLevel) return prev;

      // Check if requirements are met
      if (skill.requires) {
        for (const reqId of skill.requires) {
          const reqSkill = prev.goldSkills.find(s => s.id === reqId);
          if (!reqSkill || reqSkill.currentLevel === 0) {
            return prev;
          }
        }
      }

      // Unlock the skill
      const newSkills = prev.goldSkills.map(s => 
        s.id === skillId 
          ? { ...s, currentLevel: s.currentLevel + 1 }
          : s
      );

      return {
        ...prev,
        goldRP: prev.goldRP - cost,
        goldSkills: newSkills
      };
    });
  }, []);

  return {
    gameState,
    setGameState,
    isLoading,
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
    manualSave,
    unlockGoldSkill,
    checkAchievements,
  };
};