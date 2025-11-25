export interface TraderOffer {
  id: string;
  elementType: 0 | 1 | 2 | 3 | 4 | 5; // Air, Earth, Water, Fire, Light, Dark
  elementAmount: number;
  rewardType: 'gems' | 'rp' | 'rune' | 'money';
  rewardAmount: number;
  rewardRuneId?: number; // For rune rewards
}

export const TRADER_OFFERS: TraderOffer[] = [
  // Gems rewards
  { id: 'fire_gems_1', elementType: 3, elementAmount: 5000, rewardType: 'gems', rewardAmount: 50 },
  { id: 'fire_gems_2', elementType: 3, elementAmount: 25000, rewardType: 'gems', rewardAmount: 250 },
  { id: 'dark_gems_1', elementType: 5, elementAmount: 10000, rewardType: 'gems', rewardAmount: 100 },
  { id: 'dark_gems_2', elementType: 5, elementAmount: 50000, rewardType: 'gems', rewardAmount: 500 },
  { id: 'light_gems_1', elementType: 4, elementAmount: 8000, rewardType: 'gems', rewardAmount: 80 },
  { id: 'water_gems_1', elementType: 2, elementAmount: 15000, rewardType: 'gems', rewardAmount: 150 },
  
  // RP rewards
  { id: 'earth_rp_1', elementType: 1, elementAmount: 20000, rewardType: 'rp', rewardAmount: 10 },
  { id: 'earth_rp_2', elementType: 1, elementAmount: 100000, rewardType: 'rp', rewardAmount: 50 },
  { id: 'water_rp_1', elementType: 2, elementAmount: 30000, rewardType: 'rp', rewardAmount: 15 },
  { id: 'fire_rp_1', elementType: 3, elementAmount: 40000, rewardType: 'rp', rewardAmount: 20 },
  { id: 'light_rp_1', elementType: 4, elementAmount: 50000, rewardType: 'rp', rewardAmount: 25 },
  
  // Rune rewards (id corresponds to RUNES_1 index)
  { id: 'air_rune_rare', elementType: 0, elementAmount: 10000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 2 }, // Rare
  { id: 'air_rune_epic', elementType: 0, elementAmount: 50000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 3 }, // Epic
  { id: 'water_rune_epic', elementType: 2, elementAmount: 60000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 3 }, // Epic
  { id: 'fire_rune_legendary', elementType: 3, elementAmount: 100000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 4 }, // Legendary
  { id: 'dark_rune_legendary', elementType: 5, elementAmount: 150000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 4 }, // Legendary
  { id: 'dark_rune_mythic', elementType: 5, elementAmount: 250000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 5 }, // Mythic
  { id: 'light_rune_mythic', elementType: 4, elementAmount: 200000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 5 }, // Mythic
  
  // Secret Rune Fragment (mega expensive)
  { id: 'dark_secret_fragment', elementType: 5, elementAmount: 500000, rewardType: 'rune', rewardAmount: 1, rewardRuneId: 6 }, // Secret
  
  // Money rewards
  { id: 'earth_money_1', elementType: 1, elementAmount: 5000, rewardType: 'money', rewardAmount: 100000 },
  { id: 'earth_money_2', elementType: 1, elementAmount: 25000, rewardType: 'money', rewardAmount: 500000 },
  { id: 'air_money_1', elementType: 0, elementAmount: 10000, rewardType: 'money', rewardAmount: 200000 },
  { id: 'water_money_1', elementType: 2, elementAmount: 20000, rewardType: 'money', rewardAmount: 400000 },
];

export const generateRandomOffers = (count: number = 3): TraderOffer[] => {
  const shuffled = [...TRADER_OFFERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
