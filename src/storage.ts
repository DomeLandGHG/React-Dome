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
      // Ensure compatibility with older saves
      return {
        ...INITIAL_GAME_STATE,
        ...parsed,
        upgradePrices: parsed.upgradePrices?.length === 4 ? parsed.upgradePrices : [10, 100, 1000, 2500],
        upgradeAmounts: parsed.upgradeAmounts?.length === 4 ? parsed.upgradeAmounts : [0, 0, 0, 0],
        maxUpgradeAmounts: parsed.maxUpgradeAmounts?.length === 4 ? parsed.maxUpgradeAmounts : [10, 10, 10, 10],
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