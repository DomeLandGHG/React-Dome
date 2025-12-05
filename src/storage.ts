import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';

// localStorage is now ONLY used for user ID
// All game data is stored in Firebase

export const saveGameState = (_state: GameState): void => {
  // This function is now deprecated - use saveGameDataToFirebase instead
  // Kept for backwards compatibility, does nothing
  console.log('[Storage] saveGameState is deprecated - data should be saved to Firebase');
};

export const loadGameState = (): GameState => {
  // Return initial state - actual data will be loaded from Firebase
  console.log('[Storage] loadGameState returning INITIAL_GAME_STATE - Firebase will load actual data');
  return INITIAL_GAME_STATE;
};

export const clearGameState = (): void => {
  // Only clear user ID from localStorage
  try {
    localStorage.removeItem('money_clicker_user_id');
    console.log('[Storage] Cleared user ID from localStorage');
  } catch (error) {
    console.error('Failed to clear user ID:', error);
  }
};