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

export const UPGRADES: Upgrade[] = [
  {     // Upgrade 1
    id: 0,
    name: '+1$ per Click',
    description: 'Increases money per click by 1$',
    price: 10,
    amount: 0,
    maxAmount: 10,
    effect: 1,
    type: 'click',
  },
  {     // Upgrade 2
    id: 1,
    name: '+1$ per Tick',
    description: 'Automatically generates 1$ per tick',
    price: 100,
    amount: 0,
    maxAmount: 10,
    effect: 1,
    type: 'auto',
  },
  {     // Upgrade 3
    id: 2,
    name: '+10$ per Click',
    description: 'Increases money per click by 10$',
    price: 1000,
    amount: 0,
    maxAmount: 10,
    effect: 10,
    type: 'click',
  },
  {     // Upgrade 4
    id: 3,
    name: '+10$ per Tick',
    description: 'Increases money per tick by 10$',
    price: 2500,
    amount: 0,
    maxAmount: 10,
    effect: 10,
    type: 'auto',
  },
  {     // Upgrade 5
    id: 4,
    name: 'Unlock Gem Powers',
    description: 'Unlocks advanced gameplay features',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 1,
    type: 'Unlock'
  },
  {     // Upgrade 6
    id: 5,
    name: '+100$ per Click',
    description: 'Increases money per click by 100$',
    price: 50000,
    amount: 0,
    maxAmount: 10,
    effect: 100,
    type: 'click',
  },
  {     // Upgrade 7
    id: 6,
    name: '+100$ per Tick',
    description: 'Increases money per tick by 100$',
    price: 100000,
    amount: 0,
    maxAmount: 10,
    effect: 100,
    type: 'auto',
  },
];

//import { UPGRADES } from './types/Upgrade';