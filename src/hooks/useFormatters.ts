/**
 * useFormatters Hook
 * Custom Hook für alle Formatierungs-Funktionen
 */

import { useCallback } from 'react';
import * as formatters from '../utils/formatters';

export const useFormatters = () => {
  const formatMoney = useCallback((value: number) => formatters.formatMoney(value), []);
  const formatGems = useCallback((value: number) => formatters.formatGems(value), []);
  const formatRP = useCallback((value: number) => formatters.formatRP(value), []);
  const formatGoldRP = useCallback((value: number) => formatters.formatGoldRP(value), []);
  const formatPercent = useCallback((value: number, decimals?: number) => 
    formatters.formatPercent(value, decimals), []);
  const formatMultiplier = useCallback((value: number, decimals?: number) => 
    formatters.formatMultiplier(value, decimals), []);
  const formatTime = useCallback((seconds: number) => formatters.formatTime(seconds), []);
  const formatDuration = useCallback((seconds: number) => formatters.formatDuration(seconds), []);
  const formatCompact = useCallback((value: number) => formatters.formatCompact(value), []);

  return {
    formatMoney,
    formatGems,
    formatRP,
    formatGoldRP,
    formatPercent,
    formatMultiplier,
    formatTime,
    formatDuration,
    formatCompact,
  };
};
