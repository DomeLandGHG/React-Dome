/**
 * useBonusCalculations Hook
 * Memoized calculations für alle Bonusse
 */

import { useMemo } from 'react';
import type { GameState } from '../types';
import { RUNES_1 } from '../types/Runes';
import { calculateGoldSkillBonuses } from '../types/GoldSkillTree';
import { calculateElementalBonuses } from '../types/ElementalPrestige';

export const useBonusCalculations = (gameState: GameState) => {
  // Achievement Bonuses
  const achievementBonuses = useMemo(() => {
    const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
    const hasGemUnlock = gameState.rebirth_upgradeAmounts[2] > 0;
    
    const achievementMoneyBonus = totalAchievementTiers * 0.01;
    const achievementGemBonus = hasGemUnlock ? totalAchievementTiers * 0.0001 : 0;
    const achievementRpBonus = totalAchievementTiers * 0.05;

    return {
      moneyMultiplier: 1 + achievementMoneyBonus,
      gemBonus: achievementGemBonus,
      rpMultiplier: 1 + achievementRpBonus,
    };
  }, [gameState.achievements, gameState.rebirth_upgradeAmounts]);

  // Rune Bonuses
  const runeBonuses = useMemo(() => {
    let totalMoneyBonus = 0;
    let totalGemBonus = 0;
    let totalRpBonus = 0;
    let totalTickBonus = 0;

    gameState.runes.forEach((amount, index) => {
      const rune = RUNES_1[index];
      if (amount > 0) {
        totalMoneyBonus += (rune.moneyBonus || 0) * amount;
        totalGemBonus += (rune.gemBonus || 0) * amount;
        totalRpBonus += (rune.rpBonus || 0) * amount;
        totalTickBonus += (rune.tickBonus || 0) * amount;
      }
    });

    return {
      moneyMultiplier: 1 + totalMoneyBonus,
      gemBonus: totalGemBonus,
      rpMultiplier: 1 + totalRpBonus,
      tickBonus: totalTickBonus,
    };
  }, [gameState.runes]);

  // Gold Skill Bonuses
  const goldSkillBonuses = useMemo(() => {
    return calculateGoldSkillBonuses(gameState.goldSkills || []);
  }, [gameState.goldSkills]);

  // Elemental Prestige Bonuses
  const elementalBonuses = useMemo(() => {
    return calculateElementalBonuses(gameState.elementalPrestige || null);
  }, [gameState.elementalPrestige]);

  // Rebirth Point Multiplier (from Rebirth Upgrade 5)
  const rebirthPointMultiplier = useMemo(() => {
    if (gameState.rebirth_upgradeAmounts[4] > 0) {
      const effectValue = 0.05; // REBIRTHUPGRADES[4].effect
      const bonus = Math.log(gameState.rebirthPoints + 1) * effectValue;
      return 1 + bonus;
    }
    return 1;
  }, [gameState.rebirth_upgradeAmounts, gameState.rebirthPoints]);

  // Click Multiplier (from Rebirth Upgrade 1)
  const clickMultiplier = useMemo(() => {
    if (gameState.rebirth_upgradeAmounts[0] > 0) {
      const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
      return Math.pow(gameState.clicksTotal + 1, exponent);
    }
    return 1;
  }, [gameState.rebirth_upgradeAmounts, gameState.clicksTotal]);

  // Total Money Multiplier
  const totalMoneyMultiplier = useMemo(() => {
    return (
      achievementBonuses.moneyMultiplier *
      runeBonuses.moneyMultiplier *
      goldSkillBonuses.clickPowerMultiplier *
      elementalBonuses.clickPowerBonus *
      rebirthPointMultiplier *
      clickMultiplier
    );
  }, [
    achievementBonuses.moneyMultiplier,
    runeBonuses.moneyMultiplier,
    goldSkillBonuses.clickPowerMultiplier,
    elementalBonuses.clickPowerBonus,
    rebirthPointMultiplier,
    clickMultiplier,
  ]);

  // Total Gem Chance
  const totalGemChance = useMemo(() => {
    const baseChance = 0.05;
    const bonusChance = achievementBonuses.gemBonus + runeBonuses.gemBonus;
    return Math.min((baseChance + bonusChance) * goldSkillBonuses.gemGainMultiplier, 1);
  }, [achievementBonuses.gemBonus, runeBonuses.gemBonus, goldSkillBonuses.gemGainMultiplier]);

  return {
    achievementBonuses,
    runeBonuses,
    goldSkillBonuses,
    elementalBonuses,
    rebirthPointMultiplier,
    clickMultiplier,
    totalMoneyMultiplier,
    totalGemChance,
  };
};
