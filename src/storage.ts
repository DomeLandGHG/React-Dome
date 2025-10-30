import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';

const SAVE_KEY = 'moneyClickerSave';

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
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
        const result = [...defaultArray];
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
      
      return {
        ...INITIAL_GAME_STATE,
        ...parsed,
        upgradePrices: extendArray(parsed.upgradePrices, INITIAL_GAME_STATE.upgradePrices),
        upgradeAmounts: extendArray(parsed.upgradeAmounts, INITIAL_GAME_STATE.upgradeAmounts),
        maxUpgradeAmounts: updateMaxAmounts(parsed.maxUpgradeAmounts, INITIAL_GAME_STATE.maxUpgradeAmounts),
        rebirth_upgradePrices: extendArray(parsed.rebirth_upgradePrices, INITIAL_GAME_STATE.rebirth_upgradePrices),
        rebirth_upgradeAmounts: extendArray(parsed.rebirth_upgradeAmounts, INITIAL_GAME_STATE.rebirth_upgradeAmounts),
        rebirth_maxUpgradeAmounts: updateMaxAmounts(parsed.rebirth_maxUpgradeAmounts, INITIAL_GAME_STATE.rebirth_maxUpgradeAmounts),
        clicksInRebirth: typeof parsed.clicksInRebirth === 'number' ? parsed.clicksInRebirth : INITIAL_GAME_STATE.clicksInRebirth,
        clicksTotal: typeof parsed.clicksTotal === 'number' ? parsed.clicksTotal : INITIAL_GAME_STATE.clicksTotal,
        runes: extendArray(parsed.runes, INITIAL_GAME_STATE.runes),
        gems: typeof parsed.gems === 'number' ? parsed.gems : 0,
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