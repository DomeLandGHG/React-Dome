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
}

export interface Rune {
  id: number;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  color: string;
  dropRate: number; // out of 1000 (so 500 = 50%, 10 = 1%)
  moneyBonus?: number;
  rpBonus?: number;
  gemBonus?: number;
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
  rebirth_upgradePrices: [1, 5, 15, 1, 5],
  upgradeAmounts: [0, 0, 0, 0, 0],
  rebirth_upgradeAmounts: [0, 0, 0, 0, 0],
  maxUpgradeAmounts: [10, 10, 10, 10, 1],
  rebirth_maxUpgradeAmounts: [1, 1, 1, 1, 10],
  clicksInRebirth: 0,
  clicksTotal: 0,
  runes: [0, 0, 0, 0, 0, 0], // Start with 0 of each rune type
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
    name: 'Money Income x Total Clicks^0.01',
    description: 'Multiplies all money gains based on total clicks',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 0.01, // Der Exponent für die Berechnung von clicksTotal^0.01
    type: 'Multiplier',
  },
  {
    id: 1,
    name: '+1 Total Click per Tick',
    description: 'Adds 1 click to your total every tick (does not give money)',
    price: 5,
    amount: 0,
    maxAmount: 1,
    effect: 1,
    type: 'auto',
  },
  {
    id: 2,
    name: 'Unlock Gems',
    description: '0.5% chance to get a gem per click',
    price: 15,
    amount: 0,
    maxAmount: 1,
    effect: 0.005, // 0.5% chance
    type: 'click',
  },
  {
    id: 3,
    name: 'Unlock Gem Powers',
    description: 'Unlocks gem-powered enhancements',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 1,
    type: 'Unlock'
  },
];

// German number formatting function
export const formatNumberGerman = (num: number, decimalPlaces?: number): string => {
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces ?? (num >= 1000 ? 0 : 2)
  });
};

export const RUNES: Rune[] = [
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
];