/**
 * Game Constants
 * Zentrale Konfiguration für Spielmechaniken
 */

export const GAME_CONFIG = {
  // Tick System
  BASE_TICK_INTERVAL: 1000, // 1 second
  MIN_TICK_INTERVAL: 100,   // Minimum tick speed
  
  // Offline Progress
  MAX_OFFLINE_TIME: 21600,  // 6 hours in seconds
  OFFLINE_EFFICIENCY: 0.5,  // 50% efficiency
  
  // Rebirth
  REBIRTH_COST: 1000,       // Money per RP
  INFINITY_THRESHOLD: 1e308,
  
  // Gems
  BASE_GEM_CHANCE: 0.05,    // 5% base chance
  MAX_GEM_CHANCE: 1.0,      // 100% max (with bonuses)
  
  // Rune Packs
  BASIC_PACK_COST: 5,       // Gems
  ELEMENTAL_PACK_COST: 250000, // Money
  
  // Upgrades
  UNLOCK_UPGRADE_COST: {
    money: 1000,
    rp: 1,
    gems: 1,
  },
  
  // Auto Save
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  
  // Events
  EVENT_CHECK_INTERVAL: 60000, // 1 minute
  
  // Trader
  TRADER_REFRESH_INTERVAL: 3600, // 1 hour in seconds
  TRADER_OFFER_COUNT: 3,
} as const;

export const PRICE_MULTIPLIERS = {
  TIER_1: 2.0,  // Small upgrades (0-1)
  TIER_2: 2.5,  // Medium upgrades (2-3)
  TIER_3: 3.0,  // Large upgrades (4-6)
  TIER_4: 3.5,  // Huge upgrades (7+)
} as const;

export const REBIRTH_PRICE_MULTIPLIERS = {
  TIER_1: 2.0,  // Basic (0-1)
  TIER_2: 2.5,  // Advanced (2-3)
  TIER_3: 3.0,  // Expert (4+)
} as const;
