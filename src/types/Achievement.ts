export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  tier?: number; // Für mehrstufige Achievements (z.B. Money I, Money II)
  requirement?: {
    type: 'money' | 'rebirth' | 'clicks' | 'gems' | 'upgrades' | 'elements' | 'runespurchased' | 'onlinetime' | 'offlinetime' | 'ascensions';
    value: number;
  };
  requiresUnlock?: boolean; // z.B. Gem-Achievements brauchen Gem-Unlock Upgrade
  maxTier?: number; // Maximale Anzahl an Tiers für dynamische Achievements
  tierMultiplier?: number; // Multiplikator für den Wert pro Tier
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 0,
    name: 'Money Maker',
    description: 'Reach',
    icon: '💰',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'money',
      value: 1000
    },
    maxTier: 100,
    tierMultiplier: 2
  },
  {
    id: 1,
    name: 'Rebirth Master',
    description: 'Reach',
    icon: '🔄',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'rebirth',
      value: 10
    },
    maxTier: 100,
    tierMultiplier: 2
  },
  {
    id: 2,
    name: 'Gem Collector',
    description: 'Reach',
    icon: '💎',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'gems',
      value: 10
    },
    requiresUnlock: true,
    maxTier: 100,
    tierMultiplier: 2
  },
  {
    id: 3,
    name: 'Click Master',
    description: 'Reach',
    icon: '�️',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'clicks',
      value: 10
    },
    maxTier: 100,
    tierMultiplier: 2
  },
  {
    id: 4,
    name: 'Upgrade Enthusiast',
    description: 'Reach',
    icon: '📈',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'upgrades',
      value: 77
    },
    maxTier: 100,
    tierMultiplier: 1.05
  },
  {
    id: 5,
    name: 'Element Producer',
    description: 'Reach',
    icon: '⚡',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'elements',
      value: 100
    },
    requiresUnlock: true,
    maxTier: 100,
    tierMultiplier: 2
  },
  {
    id: 6,
    name: 'Rune Collector',
    description: 'Reach',
    icon: '📜',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'runespurchased',
      value: 5
    },
    requiresUnlock: true,
    maxTier: 100,
    tierMultiplier: 2
  },
  {
    id: 7,
    name: 'Ascension Master',
    description: 'Reach',
    icon: '✨',
    unlocked: false,
    tier: 1,
    requirement: {
      type: 'ascensions',
      value: 1
    },
    requiresUnlock: true,
    maxTier: 100,
    tierMultiplier: 1
  },
];
