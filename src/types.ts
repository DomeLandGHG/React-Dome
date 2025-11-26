export interface GameState {
  money: number;
  rebirthPoints: number;
  gems: number;
  moneyPerClick: number;
  moneyPerTick: number;
  upgradePrices: number[];
  rebirth_upgradePrices: number[];
  upgradeAmounts: number[];
  rebirth_upgradeAmounts: number[];
  maxUpgradeAmounts: number[];
  rebirth_maxUpgradeAmounts: number[];
  clicksInRebirth: number;
  clicksTotal: number;
  runes: number[]; // [common, uncommon, rare, epic, legendary, mythic]
  elementalRunes: number[]; // [air, earth, water, fire, light, dark]
  elementalResources: number[]; // [air, earth, water, fire, light, dark] - resources produced by elemental runes
  currentRuneType: 'basic' | 'elemental'; // which rune collection is currently selected
  showElementalStats: boolean; // whether to show elemental stats panel
  elementalRunesUnlocked: boolean; // whether elemental runes have ever been obtained (permanent unlock)
  achievements: Array<{ id: number; tier: number }>; // Array of unlocked achievements with their tier
  disableMoneyEffects?: boolean; // whether to disable money floating animations
  disableDiamondEffects?: boolean; // whether to disable diamond floating animations
  disablePackAnimations?: boolean; // whether to disable pack opening animations
  includeDevStats?: boolean; // whether to include dev command stats in statistics display (default: false)
  lastSaveTime?: number; // timestamp of last save for offline progress (in milliseconds)
  
  // Elemental Trader
  traderOffers?: string[]; // IDs of current trader offers
  traderLastRefresh?: number; // timestamp of last trader refresh
  traderNextRefresh?: number; // timestamp when trader will refresh next
  
  // Elemental Prestige
  elementalPrestige?: {
    air: number;
    earth: number;
    water: number;
    fire: number;
    light: number;
    dark: number;
  };
  
  // Elemental Events
  activeEvent?: string | null; // ID of currently active event (fireStorm, earthquake, etc.)
  eventEndTime?: number | null; // timestamp when current event ends
  nextEventTime?: number | null; // timestamp when next event should start
  
  // Statistics
  stats: {
    allTimeMoneyEarned: number;
    moneyFromClicks: number;
    moneyFromTicks: number;
    allTimeRebirthPointsEarned: number;
    totalRebirths: number;
    allTimeGemsEarned: number;
    allTimeClicksTotal: number;
    clicksFromManual: number;
    clicksFromTicks: number;
    baseRunePacksPurchased: number;
    elementalRunePacksPurchased: number;
    totalUpgradesPurchased: number;
    totalRebirthUpgradesPurchased: number;
    allTimeMoneySpent: number;
    allTimeRebirthPointsSpent: number;
    allTimeGemsSpent: number;
    onlineTime: number; // Total time spent online (in seconds)
    offlineTime: number; // Total time spent offline (in seconds)
    allTimeElementsProduced: {
      air: number;
      earth: number;
      water: number;
      fire: number;
      light: number;
      dark: number;
    };
    runesCrafted: {
      common: number;
      uncommon: number;
      rare: number;
      epic: number;
      legendary: number;
      mythic: number;
      secret: number;
    };
    runesObtained: {
      common: number;
      uncommon: number;
      rare: number;
      epic: number;
      legendary: number;
      mythic: number;
    };
    elementalRunesObtained: {
      air: number;
      earth: number;
      water: number;
      fire: number;
      light: number;
      dark: number;
    };
    // Dev Command Stats (separate tracking)
    devStats: {
      moneyAdded: number;
      rebirthPointsAdded: number;
      gemsAdded: number;
      clicksAdded: number;
      offlineTimeAdded: number; // Simulated offline time in seconds
      runesAdded: {
        common: number;
        uncommon: number;
        rare: number;
        epic: number;
        legendary: number;
        mythic: number;
        secret: number;
      };
      elementalRunesAdded: {
        air: number;
        earth: number;
        water: number;
        fire: number;
        light: number;
        dark: number;
      };
      elementsAdded: {
        air: number;
        earth: number;
        water: number;
        fire: number;
        light: number;
        dark: number;
      };
    };
  };
}

export const INITIAL_GAME_STATE: GameState = {
  money: 0,
  rebirthPoints: 0,
  gems: 0,
  moneyPerClick: 1,
  moneyPerTick: 0,
  upgradePrices: [10, 100, 1000, 2500, 1000],
  rebirth_upgradePrices: [1, 5, 15, 1, 25],
  upgradeAmounts: [0, 0, 0, 0, 0],
  rebirth_upgradeAmounts: [0, 0, 0, 0, 0],
  maxUpgradeAmounts: [10, 10, 10, 10, 1],
  rebirth_maxUpgradeAmounts: [5, 5, 1, 1, 1],
  clicksInRebirth: 0,
  clicksTotal: 0,
  runes: [0, 0, 0, 0, 0, 0, 0], // Start with 0 of each rune type (including Secret Rune)
  elementalRunes: [0, 0, 0, 0, 0, 0], // Start with 0 of each elemental rune type
  elementalResources: [0, 0, 0, 0, 0, 0], // Start with 0 of each elemental resource
  currentRuneType: 'basic',
  showElementalStats: false,
  elementalRunesUnlocked: false,
  achievements: [],
  disableMoneyEffects: false,
  disableDiamondEffects: false,
  disablePackAnimations: false,
  includeDevStats: false,
  lastSaveTime: Date.now(),
  elementalPrestige: {
    air: 0,
    earth: 0,
    water: 0,
    fire: 0,
    light: 0,
    dark: 0
  },
  activeEvent: null,
  eventEndTime: null,
  nextEventTime: null,
  stats: {
    allTimeMoneyEarned: 0,
    moneyFromClicks: 0,
    moneyFromTicks: 0,
    allTimeRebirthPointsEarned: 0,
    totalRebirths: 0,
    allTimeGemsEarned: 0,
    allTimeClicksTotal: 0,
    clicksFromManual: 0,
    clicksFromTicks: 0,
    baseRunePacksPurchased: 0,
    elementalRunePacksPurchased: 0,
    totalUpgradesPurchased: 0,
    totalRebirthUpgradesPurchased: 0,
    allTimeMoneySpent: 0,
    allTimeRebirthPointsSpent: 0,
    allTimeGemsSpent: 0,
    onlineTime: 0,
    offlineTime: 0,
    allTimeElementsProduced: {
      air: 0,
      earth: 0,
      water: 0,
      fire: 0,
      light: 0,
      dark: 0,
    },
    runesCrafted: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
      secret: 0,
    },
    runesObtained: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
    elementalRunesObtained: {
      air: 0,
      earth: 0,
      water: 0,
      fire: 0,
      light: 0,
      dark: 0,
    },
    devStats: {
      moneyAdded: 0,
      rebirthPointsAdded: 0,
      gemsAdded: 0,
      clicksAdded: 0,
      offlineTimeAdded: 0,
      runesAdded: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
        secret: 0,
      },
      elementalRunesAdded: {
        air: 0,
        earth: 0,
        water: 0,
        fire: 0,
        light: 0,
        dark: 0,
      },
      elementsAdded: {
        air: 0,
        earth: 0,
        water: 0,
        fire: 0,
        light: 0,
        dark: 0,
      },
    },
  },
};
