import React from 'react';
import type { GameState } from '../types';
import { ACHIEVEMENTS } from '../types/Achievement';
import { formatNumberGerman } from '../types/German_number';

// Helper function to convert number to Roman numerals
const toRomanNumeral = (num: number): string => {
  const romanNumerals: [number, string][] = [
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
};

interface AchievementsPanelProps {
  gameState: GameState;
  checkAchievements?: (currentState: GameState) => Array<{ id: number; tier: number }>;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ gameState, checkAchievements, setGameState }) => {
  // Calculate total bonuses from achievements
  const achievementCount = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0); // Total tiers unlocked
  const moneyBonus = achievementCount * 1; // 1% per achievement tier
  const rpBonus = achievementCount * 1; // 1% per achievement tier
  const elementalBonus = achievementCount * 1; // 1% per achievement tier
  const hasGemUnlock = gameState.rebirth_upgradeAmounts[2] > 0; // Gem Unlock Upgrade
  const gemBonus = hasGemUnlock ? achievementCount * 0.1 : 0; // 0.1% per achievement tier, nur wenn Gem Unlock aktiv

  // Calculate total possible tiers (nur freigeschaltete Achievements)
  const totalPossibleTiers = ACHIEVEMENTS
    .filter(achievement => {
      if (!achievement.requiresUnlock) return true;
      if (achievement.requirement?.type === 'gems') {
        return gameState.rebirth_upgradeAmounts[2] > 0;
      }
      if (achievement.requirement?.type === 'elements' || achievement.requirement?.type === 'runespurchased') {
        return gameState.rebirth_upgradeAmounts[3] > 0;
      }
      return true;
    })
    .reduce((sum, achievement) => {
      if (achievement.maxTier) {
        return sum + achievement.maxTier;
      }
      return sum + 1; // Static achievements count as 1
    }, 0);

  // Calculate individual achievement progress (nur freigeschaltete)
  const achievementProgress = ACHIEVEMENTS
    .filter(achievement => {
      if (!achievement.requiresUnlock) return true;
      if (achievement.requirement?.type === 'gems') {
        return gameState.rebirth_upgradeAmounts[2] > 0;
      }
      if (achievement.requirement?.type === 'elements' || achievement.requirement?.type === 'runespurchased') {
        return gameState.rebirth_upgradeAmounts[3] > 0;
      }
      return true;
    })
    .map(achievement => {
      const unlockedAchievement = gameState.achievements.find(a => a.id === achievement.id);
      const currentTier = unlockedAchievement ? unlockedAchievement.tier : 0;
      const maxTier = achievement.maxTier || 1;
      return {
        id: achievement.id,
        name: achievement.name,
        currentTier,
        maxTier,
        progress: (currentTier / maxTier) * 100
      };
    });

  return (
    <div
      className="achievements-panel"
      style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 30%, #92400e 100%)',
        border: '3px solid',
        borderImage: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706) 1',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        color: 'white',
        height: '100%',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <h2
        style={{
          color: '#fbbf24',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
          position: 'relative'
        }}
      >
        🏆 Achievements
      </h2>

      {/* Achievement Bonuses Summary */}
      {achievementCount > 0 && (
        <div
          style={{
            background: 'rgba(251, 191, 36, 0.15)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '2px solid rgba(251, 191, 36, 0.4)',
            position: 'relative'
          }}
        >
          <div
            style={{
              color: '#fbbf24',
              fontWeight: 'bold',
              marginBottom: '12px',
              fontSize: '18px',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
            }}
          >
            ⭐ Total Active Bonuses
          </div>
          <div
            style={{
              fontSize: '13px',
              textAlign: 'center',
              color: '#fcd34d',
              marginBottom: '12px'
            }}
          >
            ({achievementCount} Achievement Tier{achievementCount !== 1 ? 's' : ''} Unlocked)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 12px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{ fontWeight: '500' }}>💰 Money Bonus:</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '15px' }}>+{formatNumberGerman(moneyBonus)}%</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 12px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{ fontWeight: '500' }}>🔄 Rebirth Points Bonus:</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '15px' }}>+{formatNumberGerman(rpBonus)}%</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 12px', 
              background: 'rgba(168, 85, 247, 0.15)', 
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <span style={{ fontWeight: '500' }}>⚡ Elemental Production Bonus:</span>
              <span style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '15px' }}>+{formatNumberGerman(elementalBonus)}%</span>
            </div>
            {hasGemUnlock && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '6px 12px', 
                background: 'rgba(245, 158, 11, 0.15)', 
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <span style={{ fontWeight: '500' }}>💎 Gem Chance Bonus:</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '15px' }}>+{formatNumberGerman(gemBonus, 1)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Achievement Progress */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          position: 'relative'
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fbbf24',
            marginBottom: '8px',
            textAlign: 'center'
          }}
        >
          📊 Overall Progress
        </div>
        <div
          style={{
            fontSize: '13px',
            textAlign: 'center',
            color: '#fcd34d',
            marginBottom: '10px'
          }}
        >
          {achievementCount} / {totalPossibleTiers} Total Tiers ({((achievementCount / totalPossibleTiers) * 100).toFixed(1)}%)
        </div>
        
        {/* Overall Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '20px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            marginBottom: '12px'
          }}
        >
          <div
            style={{
              width: `${(achievementCount / totalPossibleTiers) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
            }}
          />
        </div>

        {/* Individual Achievement Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          {achievementProgress.map(progress => (
            <div key={progress.id}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '4px',
                color: '#cbd5e1'
              }}>
                <span>{progress.name}</span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                  {progress.currentTier} / {progress.maxTier}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid rgba(100, 116, 139, 0.3)'
                }}
              >
                <div
                  style={{
                    width: `${progress.progress}%`,
                    height: '100%',
                    background: progress.progress === 100 
                      ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Achievement Reload Button */}
      {checkAchievements && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            position: 'relative'
          }}
        >
          <button
            onClick={() => {
              if (checkAchievements && setGameState) {
                const updatedAchievements = checkAchievements(gameState);
                setGameState(prev => ({
                  ...prev,
                  achievements: updatedAchievements
                }));
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
              textShadow: '0 0 8px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
            }}
          >
            🔄 Reload Achievements
          </button>
          <div
            style={{
              fontSize: '12px',
              color: '#fcd34d',
              textAlign: 'center',
              marginTop: '8px',
              opacity: 0.8
            }}
          >
            Manually recalculate all achievement progress
          </div>
        </div>
      )}

      {/* Achievements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
        {ACHIEVEMENTS
          .filter(achievement => {
            // Zeige Achievement nur wenn es keine Unlock-Voraussetzung hat ODER die Voraussetzung erfüllt ist
            if (!achievement.requiresUnlock) return true;
            
            // Prüfe ob Gem Unlock aktiv ist (für Gem Collector)
            if (achievement.requirement?.type === 'gems') {
              return gameState.rebirth_upgradeAmounts[2] > 0; // Gem Unlock
            }
            
            // Prüfe ob Elemental Runes freigeschaltet sind (für Element Producer und Rune Collector)
            if (achievement.requirement?.type === 'elements' || achievement.requirement?.type === 'runespurchased') {
              return gameState.rebirth_upgradeAmounts[3] > 0; // Gem Powers (schaltet Elemental Runes frei)
            }
            
            return true;
          })
          .map((achievement) => {
          const unlockedAchievement = gameState.achievements.find(a => a.id === achievement.id);
          const currentTier = unlockedAchievement ? unlockedAchievement.tier : 0;
          const isUnlocked = currentTier > 0;
          
          // For dynamic achievements, calculate next tier requirement
          let nextTierValue = 0;
          let progressText = '';
          
          if (achievement.maxTier && achievement.tierMultiplier && achievement.requirement) {
            const nextTier = currentTier + 1;
            if (nextTier <= achievement.maxTier) {
              // Special case for Ascension Master: linear progression
              if (achievement.requirement.type === 'ascensions') {
                nextTierValue = nextTier;
              } else {
                nextTierValue = achievement.requirement.value * Math.pow(achievement.tierMultiplier, nextTier - 1);
              }
              const { type } = achievement.requirement;
              let currentValue = 0;
              
              switch (type) {
                case 'money':
                  currentValue = gameState.money;
                  progressText = `${formatNumberGerman(currentValue)}$ / ${formatNumberGerman(nextTierValue)}$`;
                  break;
                case 'rebirth':
                  currentValue = gameState.rebirthPoints;
                  progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(nextTierValue)} RP`;
                  break;
                case 'clicks':
                  currentValue = gameState.clicksTotal;
                  progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(nextTierValue)} clicks`;
                  break;
                case 'gems':
                  currentValue = gameState.gems;
                  progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(nextTierValue)} gems`;
                  break;
                case 'upgrades':
                  currentValue = gameState.stats?.totalUpgradesPurchased || 0;
                  progressText = `${currentValue} / ${nextTierValue} upgrades`;
                  break;
                case 'elements':
                  currentValue = gameState.stats?.allTimeElementsProduced 
                    ? Object.values(gameState.stats.allTimeElementsProduced).reduce((a, b) => a + b, 0)
                    : 0;
                  progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(nextTierValue)} elements`;
                  break;
                case 'runespurchased':
                  currentValue = (gameState.stats?.baseRunePacksPurchased || 0) + (gameState.stats?.elementalRunePacksPurchased || 0);
                  progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(nextTierValue)} packs`;
                  break;
                case 'ascensions':
                  currentValue = gameState.elementalPrestige 
                    ? Object.values(gameState.elementalPrestige).reduce((a, b) => a + b, 0)
                    : 0;
                  progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(nextTierValue)} ascensions`;
                  break;
              }
            }
          } else if (achievement.requirement && !isUnlocked) {
            // Static achievements
            const { type, value } = achievement.requirement;
            let currentValue = 0;
            
            switch (type) {
              case 'money':
                currentValue = gameState.money;
                progressText = `${formatNumberGerman(currentValue)}$ / ${formatNumberGerman(value)}$`;
                break;
              case 'rebirth':
                currentValue = gameState.rebirthPoints;
                progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(value)} RP`;
                break;
              case 'clicks':
                currentValue = gameState.clicksTotal;
                progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(value)} clicks`;
                break;
              case 'gems':
                currentValue = gameState.gems;
                progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(value)} gems`;
                break;
              case 'upgrades':
                currentValue = gameState.stats?.totalUpgradesPurchased || 0;
                progressText = `${currentValue} / ${value} upgrades`;
                break;
              case 'elements':
                currentValue = gameState.stats?.allTimeElementsProduced 
                  ? Object.values(gameState.stats.allTimeElementsProduced).reduce((a, b) => a + b, 0)
                  : 0;
                progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(value)} elements`;
                break;
              case 'runespurchased':
                currentValue = (gameState.stats?.baseRunePacksPurchased || 0) + (gameState.stats?.elementalRunePacksPurchased || 0);
                progressText = `${formatNumberGerman(currentValue)} / ${formatNumberGerman(value)} packs`;
                break;
            }
          }
          
          // Generate dynamic name and description
          let displayName = achievement.name;
          let displayDescription = achievement.description;
          
          if (achievement.maxTier && achievement.tierMultiplier && achievement.requirement) {
            const { type } = achievement.requirement;
            let suffix = '';
            
            // Bestimme das richtige Suffix basierend auf dem Typ
            switch (type) {
              case 'money':
                suffix = '$';
                break;
              case 'rebirth':
                suffix = ' RP';
                break;
              case 'clicks':
                suffix = ' clicks';
                break;
              case 'gems':
                suffix = ' gems';
                break;
              case 'upgrades':
                suffix = ' upgrades';
                break;
              case 'elements':
                suffix = ' elements';
                break;
              case 'runespurchased':
                suffix = ' packs';
                break;
              case 'onlinetime':
                suffix = ' minutes';
                break;
              case 'ascensions':
                suffix = ' ascensions';
                break;
            }
            
            if (currentTier > 0) {
              // Zeige den Namen des aktuellen Tiers
              displayName = `${achievement.name} ${toRomanNumeral(currentTier)}`;
              // Zeige das Ziel des NÄCHSTEN Tiers
              if (achievement.requirement.type === 'ascensions') {
                // Special case: Ascension Master requires linear progression (1, 2, 3, ...)
                displayDescription = `${achievement.description} ${formatNumberGerman(currentTier + 1)}${suffix}`;
              } else {
                displayDescription = `${achievement.description} ${formatNumberGerman(achievement.requirement.value * Math.pow(achievement.tierMultiplier, currentTier))}${suffix}`;
              }
            } else {
              displayName = `${achievement.name} I`;
              displayDescription = `${achievement.description} ${formatNumberGerman(achievement.requirement.value)}${suffix}`;
            }
          }
          
          return (
            <div
              key={achievement.id}
              style={{
                background: isUnlocked
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%)'
                  : 'rgba(0, 0, 0, 0.3)',
                border: isUnlocked
                  ? '2px solid #fbbf24'
                  : '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Shine effect for unlocked achievements */}
              {isUnlocked && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 3s infinite'
                  }}
                />
              )}

              {/* Icon */}
              <div
                style={{
                  fontSize: '36px',
                  minWidth: '50px',
                  textAlign: 'center',
                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  opacity: isUnlocked ? 1 : 0.5,
                  position: 'relative'
                }}
              >
                {achievement.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: isUnlocked ? '#fbbf24' : '#9ca3af',
                    marginBottom: '4px',
                    textShadow: isUnlocked ? '0 0 8px rgba(251, 191, 36, 0.4)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {displayName}
                  {achievement.maxTier && currentTier > 0 && currentTier < achievement.maxTier && (
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      background: 'rgba(251, 191, 36, 0.2)',
                      borderRadius: '12px',
                      border: '1px solid rgba(251, 191, 36, 0.4)'
                    }}>
                      Next: {toRomanNumeral(currentTier + 1)}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: isUnlocked ? '#fcd34d' : '#6b7280',
                    lineHeight: '1.4'
                  }}
                >
                  {displayDescription}
                </div>
                {progressText && (achievement.maxTier ? currentTier < achievement.maxTier : !isUnlocked) && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}
                  >
                    Progress: {progressText}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: isUnlocked
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(107, 114, 128, 0.5)',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;
