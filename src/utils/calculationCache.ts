/**
 * Ultra-Performance Calculation Cache
 * Pre-calculates and caches expensive multipliers for rapid clicking scenarios
 */

interface CachedBonuses {
  runeMoneyMultiplier: number;
  goldSkillBonuses: any;
  achievementBonuses: any;
  timestamp: number;
}

class CalculationCache {
  private cache: Map<string, CachedBonuses> = new Map();
  private readonly CACHE_TTL = 100; // Cache for 100ms during rapid clicking

  /**
   * Get cached bonuses or calculate if expired
   */
  getCachedBonuses(
    key: string,
    calculator: () => CachedBonuses
  ): CachedBonuses {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached if still valid (within TTL)
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached;
    }

    // Calculate and cache new values
    const newBonuses = {
      ...calculator(),
      timestamp: now
    };
    
    this.cache.set(key, newBonuses);
    return newBonuses;
  }

  /**
   * Invalidate cache (call when upgrades/skills change)
   */
  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const calculationCache = new CalculationCache();

// Clean up cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => calculationCache.cleanup(), 5000);
}
