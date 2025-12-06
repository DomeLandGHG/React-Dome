/**
 * Calculation Utilities
 * Zentralisierte Berechnungslogik
 */



/**
 * Berechnet den nächsten Upgrade-Preis mit exponentiellem Scaling
 */
export const calculateUpgradePrice = (
  basePrice: number,
  currentAmount: number,
  multiplier: number
): number => {
  return Math.floor(basePrice * Math.pow(multiplier, currentAmount));
};

/**
 * Berechnet wie viele Upgrades für ein Budget kaufbar sind
 */
export const calculateMaxAffordable = (
  currentPrice: number,
  currentAmount: number,
  maxAmount: number,
  availableMoney: number,
  multiplier: number
): number => {
  let count = 0;
  let totalCost = 0;
  let price = currentPrice;
  
  while (
    currentAmount + count < maxAmount &&
    totalCost + price <= availableMoney
  ) {
    totalCost += price;
    count++;
    price = Math.floor(price * multiplier);
  }
  
  return count;
};

/**
 * Berechnet Offline-Progression
 */
export const calculateOfflineProgress = (
  secondsOffline: number,
  moneyPerTick: number,
  multipliers: {
    clickMultiplier: number;
    runeMultiplier: number;
    rebirthMultiplier: number;
    achievementMultiplier: number;
    goldSkillMultiplier: number;
  }
): { money: number; clicks: number } => {
  const MAX_OFFLINE_TIME = 21600; // 6 hours
  const OFFLINE_EFFICIENCY = 0.5; // 50% efficiency
  
  const cappedTime = Math.min(secondsOffline, MAX_OFFLINE_TIME);
  
  const totalMultiplier = 
    multipliers.clickMultiplier *
    multipliers.runeMultiplier *
    multipliers.rebirthMultiplier *
    multipliers.achievementMultiplier *
    multipliers.goldSkillMultiplier;
  
  const moneyEarned = moneyPerTick * totalMultiplier * cappedTime * OFFLINE_EFFICIENCY;
  
  return {
    money: moneyEarned,
    clicks: 0,
  };
};

/**
 * Berechnet Rebirth Points basierend auf Money
 */
export const calculateRebirthPoints = (
  money: number,
  totalBonus: number
): number => {
  const baseRP = Math.floor(money / 1000);
  const rpEarned = Math.floor(baseRP * totalBonus);
  return isFinite(rpEarned) ? rpEarned : 0;
};

/**
 * Prüft ob Infinity erreicht wurde (triggert Gold RP)
 */
export const shouldTriggerGoldRP = (value: number): boolean => {
  return !isFinite(value);
};

/**
 * Berechnet Upgrade-Preis Multiplier basierend auf Upgrade-Typ
 */
export const getUpgradePriceMultiplier = (upgradeIndex: number): number => {
  if (upgradeIndex <= 1) return 2.0;
  if (upgradeIndex <= 3) return 2.5;
  if (upgradeIndex <= 6) return 3.0;
  return 3.5;
};

/**
 * Berechnet Rebirth-Upgrade-Preis Multiplier
 */
export const getRebirthUpgradePriceMultiplier = (upgradeIndex: number): number => {
  if (upgradeIndex <= 1) return 2.0;
  if (upgradeIndex <= 3) return 2.5;
  return 3.0;
};
