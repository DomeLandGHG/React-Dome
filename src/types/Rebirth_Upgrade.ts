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

export const REBIRTHUPGRADES: Upgrade[] = [
  {     // Rebirth Upgrade 1
    id: 0,
    name: 'Click Multiplier',
    description: 'Multiplies all money gains based on your total clicks. Each level increases the power',
    price: 1,
    amount: 0,
    maxAmount: 5,
    effect: 0.01, // Der Basis-Exponent für die Berechnung
    type: 'Multiplier',
  },
  {     // Rebirth Upgrade 2
    id: 1,
    name: 'Auto Clicker',
    description: 'Automatically adds 1 click to your total every tick (gives no money)',
    price: 5,
    amount: 0,
    maxAmount: 5,
    effect: 1,
    type: 'auto',
  },
  {     // Rebirth Upgrade 3
    id: 2,
    name: 'Unlock Gems',
    description: '0.5% chance to find a gem per click',
    price: 15,
    amount: 0,
    maxAmount: 1,
    effect: 0.005, // 0.5% chance
    type: 'click',
  },
  {     // Rebirth Upgrade 4
    id: 3,
    name: 'Gem Powers',
    description: 'Unlocks gem-powered enhancements',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 1,
    type: 'Unlock'
  },
  {     // Rebirth Upgrade 5
    id: 4,
    name: 'Rebirth Bonus',
    description: 'Boosts your income by log(Rebirth Points + 1) × 5%',
    price: 25,
    amount: 0,
    maxAmount: 1,
    effect: 0.05, // Moderater Multiplikator für die Logarithmus-Berechnung
    type: 'Multiplier'
  },
  {     // Rebirth Upgrade 6
    id: 5,
    name: 'Tier 1 Capacity',
    description: 'Increases max amount of Tier 1 upgrades (+1$ per Click/Tick) by 100',
    price: 100,
    amount: 0,
    maxAmount: 10,
    effect: 100, // Increases max by 100 per level
    type: 'Multiplier'
  },
  {     // Rebirth Upgrade 7
    id: 6,
    name: 'Tier 2 Capacity',
    description: 'Increases max amount of Tier 2 upgrades (+10$ per Click/Tick) by 10',
    price: 250,
    amount: 0,
    maxAmount: 10,
    effect: 10, // Increases max by 10 per level
    type: 'Multiplier'
  },
  {     // Rebirth Upgrade 8
    id: 7,
    name: 'Tier 3 Capacity',
    description: 'Increases max amount of Tier 3 upgrades (+100$ per Click/Tick) by 5',
    price: 500,
    amount: 0,
    maxAmount: 10,
    effect: 5, // Increases max by 5 per level
    type: 'Multiplier'
  },
];

//import { REBIRTHUPGRADES } from './types/Rebirth_Upgrade';