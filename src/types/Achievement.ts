export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  // Bedingungen für das Achievement können später hinzugefügt werden
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 0,
    name: 'First Rebirth',
    description: 'Perform your first rebirth',
    icon: '🔄',
    unlocked: false,
  },
];
