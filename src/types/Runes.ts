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
    moneyBonus: 0.10, // +10% money
  },
  {    //id:2
    id: 2,
    name: 'Rare Rune',
    rarity: 'Rare',
    color: '#3B82F6', // Blue
    dropRate: 140, // 14%
    rpBonus: 0.05, // +5% RP
    moneyBonus: 0.15, // +15% money
  },
  {    //id:3
    id: 3,
    name: 'Epic Rune',
    rarity: 'Epic',
    color: '#8B5CF6', // Purple
    dropRate: 50, // 5%
    rpBonus: 0.10, // +10% RP
    moneyBonus: 0.20, // +20% money
  },
  {    //id:4
    id: 4,
    name: 'Legendary Rune',
    rarity: 'Legendary',
    color: '#F59E0B', // Orange
    dropRate: 9, // 0.9%
    rpBonus: 0.15, // +15% RP
    moneyBonus: 0.30, // +30% money
    gemBonus: 0.0001, // +0.01% gem chance (higher chance but more reasonable)
  },
  {    //id:5
    id: 5,
    name: 'Mythic Rune',
    rarity: 'Mythic',
    color: '#EF4444', // Red
    dropRate: 1, // 0.1%
    rpBonus: 0.25, // +25% RP
    moneyBonus: 0.50, // +50% money
    gemBonus: 0.001, // +0.1% gem chance (highest gem chance boost)
  },
  {    //id:6
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