// Elemental World Events Configuration

export type ElementalEventType = 'fireStorm' | 'earthquake' | 'solarFlare' | 'tsunami' | 'darkness' | 'tempest';
export type ElementType = 'fire' | 'earth' | 'light' | 'water' | 'dark' | 'air';

export interface ElementalEvent {
  id: ElementalEventType;
  name: string;
  element: ElementType;
  icon: string;
  description: string;
  effects: {
    gemMultiplier?: number;        // Fire Storm: 2× Gems from clicks
    autoIncomeMultiplier?: number; // Earthquake: ×5 Auto Income
    autoSpeedMultiplier?: number;  // Solar Flare: ×2 Auto Speed (1s → 0.5s)
    clickPowerMultiplier?: number; // Tsunami: ×5 Click Power
    upgradeDiscount?: number;      // Darkness: -25% Upgrade Costs
    gemDropMultiplier?: number;    // Tempest: 2× Gem Drop Rate
  };
  backgroundGradient: string;      // Dynamic background gradient for the event
  duration: number;                 // Duration in milliseconds (10 minutes)
}

export const EVENT_CONFIG: ElementalEvent[] = [
  {
    id: 'fireStorm',
    name: 'Fire Storm',
    element: 'fire',
    icon: '🔥',
    description: 'Klicken gibt 2× Gems',
    effects: {
      gemMultiplier: 2
    },
    backgroundGradient: 'linear-gradient(135deg, #1a0505 0%, #4a0000 20%, #1e1e2e 60%, #0a0a0a 100%)',
    duration: 10 * 60 * 1000 // 10 minutes
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    element: 'earth',
    icon: '🌍',
    description: 'Auto Income ×5',
    effects: {
      autoIncomeMultiplier: 5
    },
    backgroundGradient: 'linear-gradient(135deg, #1a1205 0%, #3d2a0a 20%, #1e1e2e 60%, #0a0a0a 100%)',
    duration: 10 * 60 * 1000
  },
  {
    id: 'solarFlare',
    name: 'Solar Flare',
    element: 'light',
    icon: '☀️',
    description: 'Auto Speed ×2',
    effects: {
      autoSpeedMultiplier: 2
    },
    backgroundGradient: 'linear-gradient(135deg, #1a1a05 0%, #4a4a00 20%, #1e1e2e 60%, #0a0a0a 100%)',
    duration: 10 * 60 * 1000
  },
  {
    id: 'tsunami',
    name: 'Tsunami',
    element: 'water',
    icon: '🌊',
    description: 'Click Power ×5',
    effects: {
      clickPowerMultiplier: 5
    },
    backgroundGradient: 'linear-gradient(135deg, #051a1a 0%, #0a3d3d 20%, #1e1e2e 60%, #0a0a0a 100%)',
    duration: 10 * 60 * 1000
  },
  {
    id: 'darkness',
    name: 'Darkness',
    element: 'dark',
    icon: '🌑',
    description: 'Upgrade Kosten -25%',
    effects: {
      upgradeDiscount: 0.25
    },
    backgroundGradient: 'linear-gradient(135deg, #0a0014 0%, #1a0a2a 20%, #1e1e2e 60%, #000000 100%)',
    duration: 10 * 60 * 1000
  },
  {
    id: 'tempest',
    name: 'Tempest',
    element: 'air',
    icon: '💨',
    description: 'Gems droppen 2× so oft',
    effects: {
      gemDropMultiplier: 2
    },
    backgroundGradient: 'linear-gradient(135deg, #051a1a 0%, #0a2a4a 20%, #1e1e2e 60%, #0a0a0a 100%)',
    duration: 10 * 60 * 1000
  }
];

// Helper to get random event that matches unlocked elements
export function getRandomEvent(unlockedElements: ElementType[]): ElementalEvent | null {
  const availableEvents = EVENT_CONFIG.filter(event => 
    unlockedElements.includes(event.element)
  );
  
  if (availableEvents.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableEvents.length);
  return availableEvents[randomIndex];
}

// Helper to check which elements are unlocked based on elemental runes
export function getUnlockedElements(elementalRunes: number[]): ElementType[] {
  const elements: ElementType[] = [];
  const elementMap: ElementType[] = ['air', 'earth', 'water', 'fire', 'light', 'dark'];
  
  elementalRunes.forEach((count, index) => {
    if (count > 0) {
      elements.push(elementMap[index]);
    }
  });
  
  return elements;
}
