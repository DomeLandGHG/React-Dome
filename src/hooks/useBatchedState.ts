/**
 * Batch State Update Hook
 * Batches multiple state updates to reduce re-renders
 */

import { useState, useCallback, useRef } from 'react';

export function useBatchedState<T>(initialState: T, batchDelay: number = 16) {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Array<(prev: T) => T>>([]);
  const timeoutRef = useRef<number | null>(null);

  const batchedSetState = useCallback((updater: T | ((prev: T) => T)) => {
    const updateFn = typeof updater === 'function' 
      ? (updater as (prev: T) => T)
      : () => updater;

    pendingUpdates.current.push(updateFn);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        let result = prev;
        pendingUpdates.current.forEach(fn => {
          result = fn(result);
        });
        pendingUpdates.current = [];
        return result;
      });
    }, batchDelay);
  }, [batchDelay]);

  return [state, batchedSetState] as const;
}
