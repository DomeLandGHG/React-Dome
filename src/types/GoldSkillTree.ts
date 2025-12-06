export interface GoldSkill {
  id: number;
  name: string;
  description: string;
  icon: string;
  cost: number; // Gold RP cost
  maxLevel: number;
  currentLevel: number;
  requires?: number[]; // IDs of skills that must be unlocked first
  position: { x: number; y: number }; // Position in skill tree
  bonusType: 'rpGain' | 'gemGain' | 'runeChance' | 'elementalGain' | 'clickPower' | 'autoClicker' | 'specialUnlock';
  bonusPerLevel: number; // Bonus amount per level (e.g., 0.1 = 10%)
}

export const GOLD_SKILLS: GoldSkill[] = [
  // Tier 1 - Starting skills (top row)
  {
    id: 1,
    name: 'Golden Touch',
    description: 'Increases money from clicks and ticks by 50% per level',
    icon: '💰',
    cost: 1,
    maxLevel: 5,
    currentLevel: 0,
    position: { x: 2, y: 0 },
    bonusType: 'clickPower',
    bonusPerLevel: 0.5, // +50% per level
  },
  {
    id: 2,
    name: 'Divine Rebirth',
    description: 'Increases RP gain from rebirth by 25% per level',
    icon: '🔄',
    cost: 1,
    maxLevel: 5,
    currentLevel: 0,
    position: { x: 4, y: 0 },
    bonusType: 'rpGain',
    bonusPerLevel: 0.25, // +25% per level
  },
  {
    id: 3,
    name: 'Gem Mastery',
    description: 'Increases gem drop chance from clicks by 20% per level',
    icon: '💎',
    cost: 1,
    maxLevel: 5,
    currentLevel: 0,
    position: { x: 6, y: 0 },
    bonusType: 'gemGain',
    bonusPerLevel: 0.2, // +20% per level
  },

  // Tier 2 - Middle skills
  {
    id: 4,
    name: 'Fortune\'s Favor',
    description: 'Increases better rune drop rates from packs by 10% per level',
    icon: '🎲',
    cost: 2,
    maxLevel: 3,
    currentLevel: 0,
    requires: [1],
    position: { x: 1, y: 1 },
    bonusType: 'runeChance',
    bonusPerLevel: 0.1, // +10% per level
  },
  {
    id: 5,
    name: 'Elemental Harmony',
    description: 'Increases elemental resource production by 30% per level',
    icon: '⚡',
    cost: 2,
    maxLevel: 5,
    currentLevel: 0,
    requires: [2],
    position: { x: 4, y: 1 },
    bonusType: 'elementalGain',
    bonusPerLevel: 0.3, // +30% per level
  },
  {
    id: 6,
    name: 'Diamond Rain',
    description: 'Multiplies all gem drops by the skill level (up to 3x at level 3)',
    icon: '💠',
    cost: 2,
    maxLevel: 3,
    currentLevel: 0,
    requires: [3],
    position: { x: 7, y: 1 },
    bonusType: 'specialUnlock',
    bonusPerLevel: 1, // Multiplier per level
  },

  // Tier 3 - Advanced skills
  {
    id: 7,
    name: 'Auto Clicker',
    description: 'Generates 5 automatic clicks per tick per level (passive income)',
    icon: '🤖',
    cost: 3,
    maxLevel: 10,
    currentLevel: 0,
    requires: [1, 4],
    position: { x: 0, y: 2 },
    bonusType: 'autoClicker',
    bonusPerLevel: 5, // +5 clicks per tick per level
  },
  {
    id: 8,
    name: 'Critical Strike',
    description: 'Each level gives 5% chance for clicks to earn 10x money',
    icon: '⚡',
    cost: 3,
    maxLevel: 5,
    currentLevel: 0,
    requires: [2, 5],
    position: { x: 4, y: 2 },
    bonusType: 'specialUnlock',
    bonusPerLevel: 0.05, // +5% crit chance per level
  },
  {
    id: 9,
    name: 'Elemental Fusion',
    description: 'Unlocks Converter to transform elements (opens button below Trader)',
    icon: '🔮',
    cost: 3,
    maxLevel: 1,
    currentLevel: 0,
    requires: [5, 6],
    position: { x: 6, y: 2 },
    bonusType: 'specialUnlock',
    bonusPerLevel: 1, // Unlock feature
  },

  // Tier 4 - Ultimate skill
  {
    id: 10,
    name: 'Golden Ascension',
    description: 'Each level multiplies ALL other Gold Skill bonuses by 1.1x (stacking)',
    icon: '🌟',
    cost: 5,
    maxLevel: 3,
    currentLevel: 0,
    requires: [7, 8, 9],
    position: { x: 4, y: 3 },
    bonusType: 'specialUnlock',
    bonusPerLevel: 0.1, // +10% to ALL bonuses per level
  },
];

export interface GoldSkillTreeState {
  skills: GoldSkill[];
  totalGoldRPSpent: number;
}

export const INITIAL_GOLD_SKILL_TREE: GoldSkillTreeState = {
  skills: GOLD_SKILLS.map(skill => ({ ...skill, currentLevel: 0 })),
  totalGoldRPSpent: 0,
};

export const canUnlockSkill = (skill: GoldSkill, skillTree: GoldSkill[], availableGoldRP: number): boolean => {
  // Check if player has enough Gold RP
  if (availableGoldRP < skill.cost) return false;
  
  // Check if skill is already maxed
  if (skill.currentLevel >= skill.maxLevel) return false;
  
  // Check if requirements are met
  if (skill.requires) {
    for (const reqId of skill.requires) {
      const reqSkill = skillTree.find(s => s.id === reqId);
      if (!reqSkill || reqSkill.currentLevel === 0) {
        return false;
      }
    }
  }
  
  return true;
};

export const calculateGoldSkillBonuses = (skillTree: GoldSkill[]) => {
  const bonuses = {
    clickPowerMultiplier: 1,
    rpGainMultiplier: 1,
    gemGainMultiplier: 1,
    runeChanceBonus: 0,
    elementalGainMultiplier: 1,
    autoClicksPerTick: 0,
    criticalStrikeChance: 0,
    bonusGemMultiplier: 1,
    elementalFusionUnlocked: false,
    goldenAscensionMultiplier: 1,
  };

  skillTree.forEach(skill => {
    if (skill.currentLevel === 0) return;

    const totalBonus = skill.bonusPerLevel * skill.currentLevel;

    switch (skill.bonusType) {
      case 'clickPower':
        bonuses.clickPowerMultiplier += totalBonus;
        break;
      case 'rpGain':
        bonuses.rpGainMultiplier += totalBonus;
        break;
      case 'gemGain':
        bonuses.gemGainMultiplier += totalBonus;
        break;
      case 'runeChance':
        bonuses.runeChanceBonus += totalBonus;
        break;
      case 'elementalGain':
        bonuses.elementalGainMultiplier += totalBonus;
        break;
      case 'autoClicker':
        bonuses.autoClicksPerTick += totalBonus;
        break;
      case 'specialUnlock':
        if (skill.id === 8) { // Critical Strike
          bonuses.criticalStrikeChance += totalBonus;
        } else if (skill.id === 6) { // Diamond Rain
          bonuses.bonusGemMultiplier *= totalBonus;
        } else if (skill.id === 9) { // Elemental Fusion
          bonuses.elementalFusionUnlocked = true;
        } else if (skill.id === 10) { // Golden Ascension
          bonuses.goldenAscensionMultiplier += totalBonus;
        }
        break;
    }
  });

  // Apply Golden Ascension multiplier to all percentage bonuses
  if (bonuses.goldenAscensionMultiplier > 1) {
    bonuses.clickPowerMultiplier = 1 + ((bonuses.clickPowerMultiplier - 1) * bonuses.goldenAscensionMultiplier);
    bonuses.rpGainMultiplier = 1 + ((bonuses.rpGainMultiplier - 1) * bonuses.goldenAscensionMultiplier);
    bonuses.gemGainMultiplier = 1 + ((bonuses.gemGainMultiplier - 1) * bonuses.goldenAscensionMultiplier);
    bonuses.elementalGainMultiplier = 1 + ((bonuses.elementalGainMultiplier - 1) * bonuses.goldenAscensionMultiplier);
  }

  return bonuses;
};
