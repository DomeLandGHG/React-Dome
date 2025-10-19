export interface GameState {
  money: number;
  rebirthPoints: number;
  moneyPerClick: number;
  moneyPerTick: number;
  upgradePrices: number[];
  rebirth_upgradePrices: number[];
  upgradeAmounts: number[];
  rebirth_upgradeAmounts: number[];
  maxUpgradeAmounts: number[];
  rebirth_maxUpgradeAmounts: number[];
  clicksInRebirth: number;
  clicksTotal: number;
}

export interface Upgrade {
  id: number;
  name: string;
  description: string;
  price: number;
  amount: number;
  maxAmount: number;
  effect: number;
  type: 'click' | 'auto';
}

export interface RebirthUpgrade {
  id: number;
  name: string;
  description: string;
  price: number;
  amount: number;
  maxAmount: number;
  effect: number;
  type: 'click' | 'auto' | 'Multiplier';
}

export const INITIAL_GAME_STATE: GameState = {
  money: 0,
  rebirthPoints: 0,
  moneyPerClick: 1,
  moneyPerTick: 0,
  upgradePrices: [10, 100, 1000, 2500],
  rebirth_upgradePrices: [1],
  upgradeAmounts: [0, 0, 0, 0],
  rebirth_upgradeAmounts: [0],
  maxUpgradeAmounts: [10, 10, 10, 10],
rebirth_maxUpgradeAmounts: [1],
  clicksInRebirth: 0,
  clicksTotal: 0,
};

export const UPGRADES: Upgrade[] = [
  {
    id: 0,
    name: '+1€ per Click',
    description: 'Increases money per click by 1€',
    price: 10,
    amount: 0,
    maxAmount: 10,
    effect: 1,
    type: 'click',
  },
  {
    id: 1,
    name: '+1€ per Tick',
    description: 'Automatically generates 1€ per tick',
    price: 100,
    amount: 0,
    maxAmount: 10,
    effect: 1,
    type: 'auto',
  },
  {
    id: 2,
    name: '+10€ per Click',
    description: 'Increases money per click by 10€',
    price: 1000,
    amount: 0,
    maxAmount: 10,
    effect: 10,
    type: 'click',
  },
  {
    id: 3,
    name: '+10€ per Tick',
    description: 'Increases money per tick by 10€',
    price: 2500,
    amount: 0,
    maxAmount: 10,
    effect: 10,
    type: 'auto',
  },
];

export const REBIRTHUPGRADES: RebirthUpgrade[] = [
  {
    id: 0,
    name: 'Money x Total Clicks^0.01',
    description: 'Multiplies all money gains based on total clicks',
    price: 1,
    amount: 0,
    maxAmount: 1,
    effect: 0.01, // Der Exponent für die Berechnung von clicksTotal^0.01
    type: 'Multiplier',
  },
];