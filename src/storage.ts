import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';

const SAVE_KEY = 'moneyClickerSave';

// Deep merge helper function
const deepMerge = (target: any, source: any): any => {
  if (!source || typeof source !== 'object') return target;
  
  const output = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        // Recursively merge nested objects
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        // Use source value if defined
        output[key] = source[key];
      }
    }
  }
  
  return output;
};

export const saveGameState = (state: GameState): void => {
  try {
    // Update lastSaveTime before saving
    const stateWithTimestamp = {
      ...state,
      lastSaveTime: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

export const loadGameState = (): GameState => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Erweitere Arrays statt sie zu ersetzen, um Fortschritt zu bewahren
      const extendArray = (savedArray: any[], defaultArray: any[]) => {
        if (!Array.isArray(savedArray)) return defaultArray;
        // Verwende die größere Länge um neue Elemente zu unterstützen
        const maxLength = Math.max(savedArray.length, defaultArray.length);
        const result = [...defaultArray];
        
        // Erweitere das Array falls neue Elemente hinzugefügt wurden
        while (result.length < maxLength) {
          result.push(0);
        }
        
        // Übernehme gespeicherte Werte
        for (let i = 0; i < savedArray.length && i < result.length; i++) {
          result[i] = savedArray[i];
        }
        return result;
      };

      // Spezielle Behandlung für maxUpgradeAmounts - immer die neuesten Werte verwenden
      const updateMaxAmounts = (savedAmounts: any[], newMax: any[]) => {
        if (!Array.isArray(savedAmounts)) return newMax;
        // Verwende immer die neuesten max Werte, aber behalte gespeicherte Amounts bei
        return newMax;
      };
      
      // Merge base game state with saved state
      const mergedState = deepMerge(INITIAL_GAME_STATE, parsed);
      
      // Recalculate stats based on current game state to fix missing/incorrect stats
      const recalculatedStats = {
        ...mergedState.stats,
        // Recalculate total upgrades purchased from current amounts
        totalUpgradesPurchased: (parsed.upgradeAmounts || []).reduce((sum: number, amount: number) => sum + amount, 0),
        totalRebirthUpgradesPurchased: (parsed.rebirth_upgradeAmounts || []).reduce((sum: number, amount: number) => sum + amount, 0),
      };
      
      // Add current rune counts to runesObtained if stats are missing
      if (parsed.runes && Array.isArray(parsed.runes)) {
        const runeNames = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
        runeNames.forEach((name, index) => {
          if (parsed.runes[index] > 0 && recalculatedStats.runesObtained[name] === 0) {
            // If player has runes but stats show 0, assume they obtained at least as many as they currently have
            recalculatedStats.runesObtained[name] = parsed.runes[index];
          }
        });
      }
      
      // Add current elemental rune counts to elementalRunesObtained if stats are missing
      if (parsed.elementalRunes && Array.isArray(parsed.elementalRunes)) {
        const elementNames = ['air', 'earth', 'water', 'fire', 'light', 'dark'] as const;
        elementNames.forEach((name, index) => {
          if (parsed.elementalRunes[index] > 0 && recalculatedStats.elementalRunesObtained[name] === 0) {
            recalculatedStats.elementalRunesObtained[name] = parsed.elementalRunes[index];
          }
        });
      }
      
      return {
        ...mergedState,
        upgradePrices: extendArray(parsed.upgradePrices, INITIAL_GAME_STATE.upgradePrices),
        upgradeAmounts: extendArray(parsed.upgradeAmounts, INITIAL_GAME_STATE.upgradeAmounts),
        maxUpgradeAmounts: updateMaxAmounts(parsed.maxUpgradeAmounts, INITIAL_GAME_STATE.maxUpgradeAmounts),
        rebirth_upgradePrices: extendArray(parsed.rebirth_upgradePrices, INITIAL_GAME_STATE.rebirth_upgradePrices),
        rebirth_upgradeAmounts: extendArray(parsed.rebirth_upgradeAmounts, INITIAL_GAME_STATE.rebirth_upgradeAmounts),
        rebirth_maxUpgradeAmounts: updateMaxAmounts(parsed.rebirth_maxUpgradeAmounts, INITIAL_GAME_STATE.rebirth_maxUpgradeAmounts),
        clicksInRebirth: typeof parsed.clicksInRebirth === 'number' ? parsed.clicksInRebirth : INITIAL_GAME_STATE.clicksInRebirth,
        clicksTotal: typeof parsed.clicksTotal === 'number' ? parsed.clicksTotal : INITIAL_GAME_STATE.clicksTotal,
        runes: extendArray(parsed.runes, INITIAL_GAME_STATE.runes),
        elementalRunes: extendArray(parsed.elementalRunes, INITIAL_GAME_STATE.elementalRunes),
        elementalResources: extendArray(parsed.elementalResources, INITIAL_GAME_STATE.elementalResources),
        currentRuneType: (parsed.currentRuneType === 'basic' || parsed.currentRuneType === 'elemental') 
          ? parsed.currentRuneType 
          : INITIAL_GAME_STATE.currentRuneType,
        showElementalStats: typeof parsed.showElementalStats === 'boolean' 
          ? parsed.showElementalStats 
          : INITIAL_GAME_STATE.showElementalStats,
        gems: typeof parsed.gems === 'number' ? parsed.gems : 0,
        // Stats with recalculated values
        stats: recalculatedStats,
      };
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return INITIAL_GAME_STATE;
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};