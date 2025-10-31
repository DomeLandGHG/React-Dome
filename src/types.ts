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
  disableMoneyEffects?: boolean; // whether to disable money floating animations
  disableDiamondEffects?: boolean; // whether to disable diamond floating animations
}

export interface Rune {
  id: number;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Secret';
  color: string;
  dropRate: number; // out of 1000 (so 500 = 50%, 10 = 1%)
  moneyBonus?: number;
  rpBonus?: number;
  gemBonus?: number;
  tickBonus?: number;
  producing?: string;   //Elemental Rune produce their type (Air produces Air)
  produceAmount?: number;   //Amount produced per tick 
}

export interface Upgrade {
  id: number;
  name: string;
  description: string;
  price: number;
  amount: number;
  maxAmount: number;
  effect: number;
  type: 'click' | 'auto' | 'Multiplier' | 'Unlock';
}

export const INITIAL_GAME_STATE: GameState = {
  money: 0,
  rebirthPoints: 0,
  gems: 0,
  moneyPerClick: 1,
  moneyPerTick: 0,
  upgradePrices: [10, 100, 1000, 2500, 1000],
  rebirth_upgradePrices: [1, 5, 15, 1, 20],
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
  disableMoneyEffects: false,
  disableDiamondEffects: false,
};

export const UPGRADES: Upgrade[] = [
  {
    id: 0,
    name: '+1$ per Click',
    description: 'Increases money per click by 1$',
    price: 10,
    amount: 0,
    maxAmount: 10,
    effect: 1,
    type: 'click',
  },
  {
    id: 1,
    name: '+1$ per Tick',
    description: 'Automatically generates 1$ per tick',
    price: 100,
    amount: 0,
    maxAmount: 10,
    effect: 1,
    type: 'auto',
  },
  {
    id: 2,
    name: '+10$ per Click',
    description: 'Increases money per click by 10$',
    price: 1000,
    amount: 0,
    maxAmount: 10,
    effect: 10,
    type: 'click',
  },
  {
    id: 3,
    name: '+10$ per Tick',
    description: 'Increases money per tick by 10$',
    price: 2500,
    amount: 0,
    maxAmount: 10,
    effect: 10,
    type: 'auto',
  },
  {
    id: 4,
    name: 'Unlock Gem Powers',
    description: 'Unlocks advanced gameplay features',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 1,
    type: 'Unlock'
  },
];

export const REBIRTHUPGRADES: Upgrade[] = [
  {
    id: 0,
    name: 'Click Multiplier',
    description: 'Multiplies all money gains based on your total clicks. Each level increases the power',
    price: 1,
    amount: 0,
    maxAmount: 5,
    effect: 0.01, // Der Basis-Exponent für die Berechnung
    type: 'Multiplier',
  },
  {
    id: 1,
    name: 'Auto Clicker',
    description: 'Automatically adds 1 click to your total every tick (gives no money)',
    price: 5,
    amount: 0,
    maxAmount: 5,
    effect: 1,
    type: 'auto',
  },
  {
    id: 2,
    name: 'Unlock Gems',
    description: '0.5% chance to find a gem per click',
    price: 15,
    amount: 0,
    maxAmount: 1,
    effect: 0.005, // 0.5% chance
    type: 'click',
  },
  {
    id: 3,
    name: 'Gem Powers',
    description: 'Unlocks gem-powered enhancements',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 1,
    type: 'Unlock'
  },
  {
    id: 4,
    name: 'Rebirth Bonus',
    description: 'Boosts your income by log(Rebirth Points + 1) × 5%',
    price: 25,
    amount: 0,
    maxAmount: 1,
    effect: 0.05, // Moderater Multiplikator für die Logarithmus-Berechnung
    type: 'Multiplier'
  },
];

// German number formatting function with scientific notation for large numbers
export const formatNumberGerman = (num: number, decimalPlaces?: number): string => {
  // Ab 100 Millionen: Wissenschaftliche Notation
  if (num >= 100_000_000) {
    return num.toExponential(2).replace('.', ',');
  }
  
  // Unter 100 Millionen: Normale deutsche Formatierung mit Punkten
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces ?? (num >= 1000 ? 0 : 2)
  });
};

export const RUNES_1: Rune[] = [  //Basic Rune
  {
    id: 0,
    name: 'Common Rune',
    rarity: 'Common',
    color: '#9CA3AF', // Gray
    dropRate: 500, // 50%
    moneyBonus: 0.05, // +5% money
  },
  {
    id: 1,
    name: 'Uncommon Rune',
    rarity: 'Uncommon',
    color: '#10B981', // Green
    dropRate: 300, // 30%
    moneyBonus: 0.10, // +10% money
  },
  {
    id: 2,
    name: 'Rare Rune',
    rarity: 'Rare',
    color: '#3B82F6', // Blue
    dropRate: 140, // 14%
    rpBonus: 0.05, // +5% RP
    moneyBonus: 0.15, // +15% money
  },
  {
    id: 3,
    name: 'Epic Rune',
    rarity: 'Epic',
    color: '#8B5CF6', // Purple
    dropRate: 50, // 5%
    rpBonus: 0.10, // +10% RP
    moneyBonus: 0.20, // +20% money
  },
  {
    id: 4,
    name: 'Legendary Rune',
    rarity: 'Legendary',
    color: '#F59E0B', // Orange
    dropRate: 9, // 0.9%
    rpBonus: 0.15, // +15% RP
    moneyBonus: 0.30, // +30% money
    gemBonus: 0.0001, // +0.01% gem chance (higher chance but more reasonable)
  },
  {
    id: 5,
    name: 'Mythic Rune',
    rarity: 'Mythic',
    color: '#EF4444', // Red
    dropRate: 1, // 0.1%
    rpBonus: 0.25, // +25% RP
    moneyBonus: 0.50, // +50% money
    gemBonus: 0.001, // +0.1% gem chance (highest gem chance boost)
  },
  {
    id: 6,
    name: 'Secret Rune',
    rarity: 'Secret',
    color: '#404040ff', // Grey
    dropRate: 0, // Not obtainable through normal means
    rpBonus: 0.50, // +50% RP
    moneyBonus: 1.00, // +100% money
    gemBonus: 0.005, // +0.5% gem chance
    tickBonus: 1, // -1 millisecond per tick
  },      //Tick is standard at 1 second/100 miliseconds
];

export const RUNES_2: Rune[] = [  //Elemental Runes
  {                               //Elemental Runes have no money/rp/gem bonus but produce their type
    id: 0,
    name: 'Air Rune',
    rarity: 'Common',
    color: '#34fafaff',
    dropRate: 200, // 20%
    producing: 'Air',
    produceAmount: 1,
  },
  {
    id: 1,
    name: 'Earth Rune',
    rarity: 'Common',
    color: '#a0522dff',
    dropRate: 200, // 20%
    producing: 'Earth',
    produceAmount: 1,
  },
  {
    id: 2,
    name: 'Water Rune',
    rarity: 'Common',
    color: '#1e90ff',
    dropRate: 200, // 20%
    producing: 'Water',
    produceAmount: 1,
  },
  {
    id: 3,
    name: 'Fire Rune',
    rarity: 'Common',
    color: '#ff4500',
    dropRate: 200, // 20%
    producing: 'Fire',
    produceAmount: 1,
  },
  {
    id: 4,
    name: 'Light Rune',
    rarity: 'Rare',
    color: '#fffb1fff',
    dropRate: 100, // 10%
    producing: 'Light',
    produceAmount: 1,
  },
  {
    id: 5,
    name: 'Dark Rune',
    rarity: 'Rare',
    color: '#36005cff',
    dropRate: 100, // 10%
    producing: 'Dark',
    produceAmount: 1,
  },
];