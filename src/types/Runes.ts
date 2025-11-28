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

export const RUNES_1: Rune[] = [  //Basic Rune
  {    //id:0
    id: 0,
    name: 'Common Rune',
    rarity: 'Common',
    color: '#9CA3AF', // Gray
    dropRate: 500, // 50%
    moneyBonus: 0.05, // +5% money
  },
  {    //id:1
    id: 1,
    name: 'Uncommon Rune',
    rarity: 'Uncommon',
    color: '#10B981', // Green
    dropRate: 300, // 30%
    moneyBonus: 0.18, // +18% money (3x Common = 15% → +3% craft bonus)
  },
  {    //id:2
    id: 2,
    name: 'Rare Rune',
    rarity: 'Rare',
    color: '#3B82F6', // Blue
    dropRate: 140, // 14%
    rpBonus: 0.05, // +5% RP (neuer bonus)
    moneyBonus: 0.40, // +40% money (3x Uncommon = 54% → weniger wegen RP bonus)
    gemBonus: 0.0005, // +0.05% gem chance
  },
  {    //id:3
    id: 3,
    name: 'Epic Rune',
    rarity: 'Epic',
    color: '#8B5CF6', // Purple
    dropRate: 50, // 5%
    rpBonus: 0.20, // +20% RP (3x Rare = 15% → +5% bonus)
    moneyBonus: 0.80, // +80% money (3x Rare = 120% → weniger wegen RP+Gem)
    gemBonus: 0.001, // +0.1% gem chance (3x Rare = 0.15% → weniger)
  },
  {    //id:4
    id: 4,
    name: 'Legendary Rune',
    rarity: 'Legendary',
    color: '#F59E0B', // Orange
    dropRate: 9, // 0.9%
    rpBonus: 0.75, // +75% RP (3x Epic = 60% → +15% bonus)
    moneyBonus: 1.50, // +150% money (3x Epic = 240% → weniger wegen starke RP+Gem)
    gemBonus: 0.005, // +0.5% gem chance (3x Epic = 0.3% → +0.2% bonus)
  },
  {    //id:5
    id: 5,
    name: 'Mythic Rune',
    rarity: 'Mythic',
    color: '#EF4444', // Red
    dropRate: 1, // 0.1%
    rpBonus: 2.50, // +250% RP (3x Legendary = 225% → +25% bonus)
    moneyBonus: 3.00, // +300% money (3x Legendary = 450% → weniger wegen massive RP+Gem)
    gemBonus: 0.02, // +2% gem chance (3x Legendary = 1.5% → +0.5% bonus)
  },
  {    //id:6
    id: 6,
    name: 'Secret Rune',
    rarity: 'Secret',
    color: '#404040ff', // Grey
    dropRate: 0, // Not obtainable through normal means
    rpBonus: 3.50, // +350% RP
    moneyBonus: 5.00, // +500% money
    gemBonus: 0.03, // +3% gem chance
  },      //Tick is standard at 1 second/100 miliseconds
];

export const RUNES_2: Rune[] = [  //Elemental Runes
  {     //id:0                         //Elemental Runes have no money/rp/gem bonus but produce their type
    id: 0,
    name: 'Air Rune',
    rarity: 'Common',
    color: '#34fafaff',
    dropRate: 200, // 20%
    producing: 'Air',
    produceAmount: 1,
  },
  {     //id:1
    id: 1,
    name: 'Earth Rune',
    rarity: 'Common',
    color: '#a0522dff',
    dropRate: 200, // 20%
    producing: 'Earth',
    produceAmount: 1,
  },
  {     //id: 2,
    id: 2,
    name: 'Water Rune',
    rarity: 'Common',
    color: '#1e90ff',
    dropRate: 200, // 20%
    producing: 'Water',
    produceAmount: 1,
  },
  {     //id: 3,
    id: 3,
    name: 'Fire Rune',
    rarity: 'Common',
    color: '#ff4500',
    dropRate: 200, // 20%
    producing: 'Fire',
    produceAmount: 1,
  },
  {     //id: 4,
    id: 4,
    name: 'Light Rune',
    rarity: 'Rare',
    color: '#fffb1fff',
    dropRate: 100, // 10%
    producing: 'Light',
    produceAmount: 1,
  },
  {     //id: 5,
    id: 5,
    name: 'Dark Rune',
    rarity: 'Rare',
    color: '#36005cff',
    dropRate: 100, // 10%
    producing: 'Dark',
    produceAmount: 1,
  },
];

//import { RUNES_1, RUNES_2 } from './types/Runes';