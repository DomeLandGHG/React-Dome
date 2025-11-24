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
  achievements: number[]; // Array of unlocked achievement IDs
  disableMoneyEffects?: boolean; // whether to disable money floating animations
  disableDiamondEffects?: boolean; // whether to disable diamond floating animations
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
};
