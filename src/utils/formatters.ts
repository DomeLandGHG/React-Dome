/**
 * Number Formatting Utilities
 * Zentralisierte Formatierung für Zahlen, Währungen, etc.
 */

import { formatNumberGerman } from '../types/German_number';

/**
 * Formatiert Money mit German Number System
 */
export const formatMoney = (value: number): string => {
  return formatNumberGerman(value);
};

/**
 * Formatiert Gems (immer als Integer)
 */
export const formatGems = (value: number): string => {
  return Math.floor(value).toLocaleString('de-DE');
};

/**
 * Formatiert Rebirth Points
 */
export const formatRP = (value: number): string => {
  return Math.floor(value).toLocaleString('de-DE');
};

/**
 * Formatiert Gold RP
 */
export const formatGoldRP = (value: number): string => {
  return Math.floor(value).toLocaleString('de-DE');
};

/**
 * Formatiert Prozentsätze
 */
export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatiert Multiplier (z.B. 2.5x)
 */
export const formatMultiplier = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}×`;
};

/**
 * Formatiert Zeit in Sekunden zu MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formatiert Zeit in Sekunden zu menschenlesbarem Format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Kürzt große Zahlen (1000 -> 1K, 1000000 -> 1M)
 */
export const formatCompact = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(0);
};
