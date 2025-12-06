/**
 * Validation Utilities
 * Funktionen für Validation und Prüfungen
 */

import type { GameState } from '../types';

/**
 * Prüft ob ein Wert eine gültige Zahl ist
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
};

/**
 * Prüft ob ein Wert eine positive Zahl ist
 */
export const isPositiveNumber = (value: unknown): value is number => {
  return isValidNumber(value) && value >= 0;
};

/**
 * Clampt eine Zahl zwischen min und max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Prüft ob ein GameState valide ist
 */
export const isValidGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== 'object') return false;
  
  const s = state as Partial<GameState>;
  
  return (
    isPositiveNumber(s.money) &&
    isPositiveNumber(s.gems) &&
    isPositiveNumber(s.rebirthPoints) &&
    Array.isArray(s.runes) &&
    Array.isArray(s.upgradePrices) &&
    Array.isArray(s.upgradeAmounts)
  );
};

/**
 * Bereinigt ungültige Werte aus einem GameState
 */
export const sanitizeGameState = (state: GameState): GameState => {
  return {
    ...state,
    money: isValidNumber(state.money) ? Math.max(0, state.money) : 0,
    gems: isValidNumber(state.gems) ? Math.max(0, Math.floor(state.gems)) : 0,
    rebirthPoints: isValidNumber(state.rebirthPoints) ? Math.max(0, Math.floor(state.rebirthPoints)) : 0,
    goldRP: isValidNumber(state.goldRP) ? Math.max(0, Math.floor(state.goldRP)) : 0,
  };
};
