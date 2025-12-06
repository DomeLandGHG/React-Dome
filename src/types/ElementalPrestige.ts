export interface ElementalPrestige {
  air: number;
  earth: number;
  water: number;
  fire: number;
  light: number;
  dark: number;
}

export interface ElementalPrestigeRequirement {
  elementId: 0 | 1 | 2 | 3 | 4 | 5;
  elementName: string;
  baseRequirement: number; // Base amount needed for first prestige
  scalingFactor: number; // Multiplier for each subsequent prestige
  bonusType: 'autoSpeed' | 'autoIncome' | 'clickPower' | 'runePackLuck' | 'rpGain' | 'upgradeDiscount';
  bonusPerLevel: number; // Bonus percentage per prestige level
  icon: string;
  color: string;
}

export const ELEMENTAL_PRESTIGE_CONFIG: ElementalPrestigeRequirement[] = [
  {
    elementId: 0,
    elementName: 'Air',
    baseRequirement: 100000,
    scalingFactor: 2.5,
    bonusType: 'autoSpeed',
    bonusPerLevel: 0.5, // +0.5% Auto-Speed per level
    icon: '💨',
    color: '#7dd3fc'
  },
  {
    elementId: 1,
    elementName: 'Earth',
    baseRequirement: 100000,
    scalingFactor: 2.5,
    bonusType: 'autoIncome',
    bonusPerLevel: 2, // +2% Auto-Income per level
    icon: '🌍',
    color: '#86efac'
  },
  {
    elementId: 2,
    elementName: 'Water',
    baseRequirement: 100000,
    scalingFactor: 2.5,
    bonusType: 'clickPower',
    bonusPerLevel: 1, // +1% Click-Power per level
    icon: '💧',
    color: '#60a5fa'
  },
  {
    elementId: 3,
    elementName: 'Fire',
    baseRequirement: 100000,
    scalingFactor: 2.5,
    bonusType: 'runePackLuck',
    bonusPerLevel: 1, // +1% Rune-Pack-Luck per level
    icon: '🔥',
    color: '#fb923c'
  },
  {
    elementId: 4,
    elementName: 'Light',
    baseRequirement: 100000,
    scalingFactor: 2.5,
    bonusType: 'rpGain',
    bonusPerLevel: 1, // +1% RP-Gain per level
    icon: '✨',
    color: '#fde047'
  },
  {
    elementId: 5,
    elementName: 'Dark',
    baseRequirement: 100000,
    scalingFactor: 2.5,
    bonusType: 'upgradeDiscount',
    bonusPerLevel: 1, // +1% Upgrade-Discount per level
    icon: '🌑',
    color: '#a78bfa'
  }
];

export const calculatePrestigeRequirement = (elementId: number, currentLevel: number): number => {
  const config = ELEMENTAL_PRESTIGE_CONFIG[elementId];
  if (!config) return 0;
  
  return Math.floor(config.baseRequirement * Math.pow(config.scalingFactor, currentLevel));
};

export const getBonusDescription = (bonusType: string): string => {
  switch (bonusType) {
    case 'autoSpeed': return 'Auto-Speed';
    case 'autoIncome': return 'Auto-Income';
    case 'clickPower': return 'Click Power';
    case 'runePackLuck': return 'Rune Pack Luck';
    case 'rpGain': return 'RP Gain';
    case 'upgradeDiscount': return 'Upgrade Discount';
    default: return 'Unknown';
  }
};

export const calculateElementalBonuses = (elementalPrestige: ElementalPrestige | null) => {
  if (!elementalPrestige) return {
    clickPowerBonus: 1,
    autoIncomeBonus: 1,
    autoSpeedBonus: 1,
    rpGainBonus: 1,
    runePackLuckBonus: 1,
    upgradeDiscountBonus: 1
  };

  let clickPowerBonus = 1;
  let autoIncomeBonus = 1;
  let autoSpeedBonus = 1;
  let rpGainBonus = 1;
  let runePackLuckBonus = 1;
  let upgradeDiscountBonus = 1;

  ELEMENTAL_PRESTIGE_CONFIG.forEach(config => {
    const level = elementalPrestige[config.elementName.toLowerCase() as keyof ElementalPrestige] || 0;
    if (level > 0) {
      const bonus = 1 + (config.bonusPerLevel * level / 100);
      switch (config.bonusType) {
        case 'clickPower': clickPowerBonus *= bonus; break;
        case 'autoIncome': autoIncomeBonus *= bonus; break;
        case 'autoSpeed': autoSpeedBonus *= bonus; break;
        case 'rpGain': rpGainBonus *= bonus; break;
        case 'runePackLuck': runePackLuckBonus *= bonus; break;
        case 'upgradeDiscount': 
          // For discount, we REDUCE the multiplier (1.0 = no discount, 0.5 = 50% off)
          upgradeDiscountBonus *= (1 - (config.bonusPerLevel * level / 100)); 
          break;
      }
    }
  });

  return { clickPowerBonus, autoIncomeBonus, autoSpeedBonus, rpGainBonus, runePackLuckBonus, upgradeDiscountBonus };
};
