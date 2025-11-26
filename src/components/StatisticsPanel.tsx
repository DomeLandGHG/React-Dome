import React from 'react';
import type { GameState } from '../types';
import { formatNumberGerman } from '../types/German_number';
import { ACHIEVEMENTS } from '../types/Achievement';

interface StatisticsPanelProps {
  gameState: GameState;
  onToggleDevStats: () => void;
}

const formatTime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ gameState, onToggleDevStats }) => {
  const { stats } = gameState;
  const includeDevStats = gameState.includeDevStats || false;
  
  // Berechne Werte mit oder ohne Dev Stats
  const totalMoneyEarned = includeDevStats 
    ? stats.allTimeMoneyEarned + (stats.devStats?.moneyAdded || 0)
    : stats.allTimeMoneyEarned;
  const totalRPEarned = includeDevStats
    ? stats.allTimeRebirthPointsEarned + (stats.devStats?.rebirthPointsAdded || 0)
    : stats.allTimeRebirthPointsEarned;
  const totalGemsEarned = includeDevStats
    ? stats.allTimeGemsEarned + (stats.devStats?.gemsAdded || 0)
    : stats.allTimeGemsEarned;
  const totalClicksTotal = includeDevStats
    ? stats.allTimeClicksTotal + (stats.devStats?.clicksAdded || 0)
    : stats.allTimeClicksTotal;
  
  // Prüfe Unlock-Status
  const hasGemUnlock = gameState.rebirth_upgradeAmounts[2] > 0;
  const hasElementalUnlock = gameState.rebirth_upgradeAmounts[3] > 0;

  // Statistik-Kategorien
  const statisticSections = [
    {
      title: '💰 All Time Money',
      stats: [
        { label: 'Total Money Earned', value: formatNumberGerman(totalMoneyEarned) + '$' },
        { label: '  - Money from Clicks', value: formatNumberGerman(stats.moneyFromClicks) + '$', isSubItem: true },
        { label: '  - Money from Ticks', value: formatNumberGerman(stats.moneyFromTicks) + '$', isSubItem: true },
        ...(includeDevStats && (stats.devStats?.moneyAdded || 0) > 0 ? [{ label: '  - Money from Dev', value: formatNumberGerman(stats.devStats.moneyAdded) + '$', isSubItem: true }] : []),
      ]
    },
    {
      title: '🔄 Rebirth Statistics',
      stats: [
        { label: 'All Time Rebirth Points', value: formatNumberGerman(totalRPEarned) },
        { label: 'Total Rebirths', value: formatNumberGerman(stats.totalRebirths) },
        ...(includeDevStats && (stats.devStats?.rebirthPointsAdded || 0) > 0 ? [{ label: '  - RP from Dev', value: formatNumberGerman(stats.devStats.rebirthPointsAdded), isSubItem: true }] : []),
      ]
    },
    ...(hasGemUnlock ? [{
      title: '💎 All Time Gems',
      stats: [
        { label: 'Total Gems Earned', value: formatNumberGerman(totalGemsEarned) },
        ...(includeDevStats && (stats.devStats?.gemsAdded || 0) > 0 ? [{ label: '  - Gems from Dev', value: formatNumberGerman(stats.devStats.gemsAdded), isSubItem: true }] : []),
      ]
    }] : []),
    {
      title: '🖱️ All Time Clicks',
      stats: [
        { label: 'Total Clicks', value: formatNumberGerman(totalClicksTotal) },
        { label: '  - Clicks from Manual', value: formatNumberGerman(stats.clicksFromManual), isSubItem: true },
        { label: '  - Clicks from Ticks', value: formatNumberGerman(stats.clicksFromTicks), isSubItem: true },
        ...(includeDevStats && (stats.devStats?.clicksAdded || 0) > 0 ? [{ label: '  - Clicks from Dev', value: formatNumberGerman(stats.devStats.clicksAdded), isSubItem: true }] : []),
      ]
    },
    ...(hasElementalUnlock ? [{
      title: '🎴 Runes Purchased',
      stats: [
        { label: 'Base Packs', value: formatNumberGerman(stats.baseRunePacksPurchased) },
        { label: 'Elemental Packs', value: formatNumberGerman(stats.elementalRunePacksPurchased) },
      ]
    }] : []),
    {
      title: '📦 Upgrades Purchased',
      stats: [
        { label: 'Total Upgrades', value: formatNumberGerman(stats.totalUpgradesPurchased) },
        { label: 'Total Rebirth Upgrades', value: formatNumberGerman(stats.totalRebirthUpgradesPurchased) },
      ]
    },
    {
      title: '🏆 Records',
      stats: [
        { label: 'Highest Money (Single Rebirth)', value: formatNumberGerman(stats.highestMoneyInSingleRebirth || 0) + '$' },
        { label: 'Fastest Rebirth', value: stats.fastestRebirthTime ? formatTime(stats.fastestRebirthTime) : 'N/A' },
        { label: 'Total Achievements Unlocked', value: formatNumberGerman(gameState.achievements.filter(a => a.tier > 0).length) + ' / ' + formatNumberGerman(ACHIEVEMENTS.length) },
      ]
    },
    {
      title: '💸 All Time Spending',
      stats: [
        { label: 'Money Spent', value: formatNumberGerman(stats.allTimeMoneySpent) + '$' },
        { label: 'Rebirth Points Spent', value: formatNumberGerman(stats.allTimeRebirthPointsSpent) + ' RP' },
        ...(hasGemUnlock ? [{ label: 'Gems Spent', value: formatNumberGerman(stats.allTimeGemsSpent) + ' 💎' }] : []),
      ]
    },
    {
      title: '⏰ Play Time',
      stats: [
        { label: 'Online Time', value: formatTime(stats.onlineTime || 0) },
        { label: 'Offline Time', value: formatTime(stats.offlineTime || 0) },
        ...(includeDevStats && (stats.devStats?.offlineTimeAdded || 0) > 0 ? [{ label: '  - Offline Time (Dev)', value: formatTime(stats.devStats.offlineTimeAdded), isSubItem: true }] : []),
        { label: 'Total Time', value: formatTime((stats.onlineTime || 0) + (stats.offlineTime || 0)) },
      ]
    },
    ...(hasElementalUnlock ? [{
      title: '⚡ All Time Elements Produced',
      stats: [
        { label: 'Total Elements', value: formatNumberGerman(
          stats.allTimeElementsProduced.air +
          stats.allTimeElementsProduced.earth +
          stats.allTimeElementsProduced.water +
          stats.allTimeElementsProduced.fire +
          stats.allTimeElementsProduced.light +
          stats.allTimeElementsProduced.dark
        ) },
        { label: '  - Air Produced', value: formatNumberGerman(stats.allTimeElementsProduced.air), isSubItem: true },
        { label: '  - Earth Produced', value: formatNumberGerman(stats.allTimeElementsProduced.earth), isSubItem: true },
        { label: '  - Water Produced', value: formatNumberGerman(stats.allTimeElementsProduced.water), isSubItem: true },
        { label: '  - Fire Produced', value: formatNumberGerman(stats.allTimeElementsProduced.fire), isSubItem: true },
        { label: '  - Light Produced', value: formatNumberGerman(stats.allTimeElementsProduced.light), isSubItem: true },
        { label: '  - Dark Produced', value: formatNumberGerman(stats.allTimeElementsProduced.dark), isSubItem: true },
      ]
    }] : []),
    ...(hasElementalUnlock ? [{
      title: '🎴 Runes Obtained',
      stats: [
        { label: 'Total Basic Runes', value: formatNumberGerman(
          stats.runesObtained.common +
          stats.runesObtained.uncommon +
          stats.runesObtained.rare +
          stats.runesObtained.epic +
          stats.runesObtained.legendary +
          stats.runesObtained.mythic +
          (includeDevStats ? (
            (stats.devStats?.runesAdded?.common || 0) +
            (stats.devStats?.runesAdded?.uncommon || 0) +
            (stats.devStats?.runesAdded?.rare || 0) +
            (stats.devStats?.runesAdded?.epic || 0) +
            (stats.devStats?.runesAdded?.legendary || 0) +
            (stats.devStats?.runesAdded?.mythic || 0)
          ) : 0)
        ) },
        { label: '  - Common', value: formatNumberGerman(stats.runesObtained.common + (includeDevStats ? (stats.devStats?.runesAdded?.common || 0) : 0)), isSubItem: true },
        { label: '  - Uncommon', value: formatNumberGerman(stats.runesObtained.uncommon + (includeDevStats ? (stats.devStats?.runesAdded?.uncommon || 0) : 0)), isSubItem: true },
        { label: '  - Rare', value: formatNumberGerman(stats.runesObtained.rare + (includeDevStats ? (stats.devStats?.runesAdded?.rare || 0) : 0)), isSubItem: true },
        { label: '  - Epic', value: formatNumberGerman(stats.runesObtained.epic + (includeDevStats ? (stats.devStats?.runesAdded?.epic || 0) : 0)), isSubItem: true },
        { label: '  - Legendary', value: formatNumberGerman(stats.runesObtained.legendary + (includeDevStats ? (stats.devStats?.runesAdded?.legendary || 0) : 0)), isSubItem: true },
        { label: '  - Mythic', value: formatNumberGerman(stats.runesObtained.mythic + (includeDevStats ? (stats.devStats?.runesAdded?.mythic || 0) : 0)), isSubItem: true },
      ]
    }] : []),
    ...(hasElementalUnlock ? [{
      title: '⚡ Elemental Runes Obtained',
      stats: [
        { label: 'Total Elemental Runes', value: formatNumberGerman(
          stats.elementalRunesObtained.air +
          stats.elementalRunesObtained.earth +
          stats.elementalRunesObtained.water +
          stats.elementalRunesObtained.fire +
          stats.elementalRunesObtained.light +
          stats.elementalRunesObtained.dark +
          (includeDevStats ? (
            (stats.devStats?.elementalRunesAdded?.air || 0) +
            (stats.devStats?.elementalRunesAdded?.earth || 0) +
            (stats.devStats?.elementalRunesAdded?.water || 0) +
            (stats.devStats?.elementalRunesAdded?.fire || 0) +
            (stats.devStats?.elementalRunesAdded?.light || 0) +
            (stats.devStats?.elementalRunesAdded?.dark || 0)
          ) : 0)
        ) },
        { label: '  - Air', value: formatNumberGerman(stats.elementalRunesObtained.air + (includeDevStats ? (stats.devStats?.elementalRunesAdded?.air || 0) : 0)), isSubItem: true },
        { label: '  - Earth', value: formatNumberGerman(stats.elementalRunesObtained.earth + (includeDevStats ? (stats.devStats?.elementalRunesAdded?.earth || 0) : 0)), isSubItem: true },
        { label: '  - Water', value: formatNumberGerman(stats.elementalRunesObtained.water + (includeDevStats ? (stats.devStats?.elementalRunesAdded?.water || 0) : 0)), isSubItem: true },
        { label: '  - Fire', value: formatNumberGerman(stats.elementalRunesObtained.fire + (includeDevStats ? (stats.devStats?.elementalRunesAdded?.fire || 0) : 0)), isSubItem: true },
        { label: '  - Light', value: formatNumberGerman(stats.elementalRunesObtained.light + (includeDevStats ? (stats.devStats?.elementalRunesAdded?.light || 0) : 0)), isSubItem: true },
        { label: '  - Dark Runes', value: formatNumberGerman(stats.elementalRunesObtained.dark + (includeDevStats ? (stats.devStats?.elementalRunesAdded?.dark || 0) : 0)), isSubItem: true },
      ]
    }] : []),
    ...(hasElementalUnlock ? [{
      title: '�️ Runes Crafted',
      stats: [
        { label: 'Total Runes Crafted', value: formatNumberGerman(
          stats.runesCrafted.common +
          stats.runesCrafted.uncommon +
          stats.runesCrafted.rare +
          stats.runesCrafted.epic +
          stats.runesCrafted.legendary +
          stats.runesCrafted.mythic +
          stats.runesCrafted.secret
        ) },
        { label: '  - Common', value: formatNumberGerman(stats.runesCrafted.common), isSubItem: true },
        { label: '  - Uncommon', value: formatNumberGerman(stats.runesCrafted.uncommon), isSubItem: true },
        { label: '  - Rare', value: formatNumberGerman(stats.runesCrafted.rare), isSubItem: true },
        { label: '  - Epic', value: formatNumberGerman(stats.runesCrafted.epic), isSubItem: true },
        { label: '  - Legendary', value: formatNumberGerman(stats.runesCrafted.legendary), isSubItem: true },
        { label: '  - Mythic', value: formatNumberGerman(stats.runesCrafted.mythic), isSubItem: true },
        { label: '  - Secret Runes', value: formatNumberGerman(stats.runesCrafted.secret), isSubItem: true },
      ]
    }] : []),
  ];

  return (
    <div
      className="statistics-panel"
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 30%, #1e3a8a 100%)',
        border: '3px solid',
        borderImage: 'linear-gradient(135deg, #60a5fa, #3b82f6, #1d4ed8) 1',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      />

      <h2
        style={{
          color: '#60a5fa',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
          position: 'relative'
        }}
      >
        📊 Game Statistics
      </h2>

      {/* Dev Stats Toggle Button */}
      {(stats.devStats?.moneyAdded || 0) > 0 || (stats.devStats?.rebirthPointsAdded || 0) > 0 || (stats.devStats?.gemsAdded || 0) > 0 ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px',
            position: 'relative',
          }}
        >
          <button
            onClick={onToggleDevStats}
            style={{
              background: includeDevStats
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: includeDevStats ? '2px solid #fbbf24' : '2px solid #60a5fa',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
              boxShadow: includeDevStats
                ? '0 0 15px rgba(251, 191, 36, 0.4)'
                : '0 0 15px rgba(96, 165, 250, 0.4)',
            }}
          >
            {includeDevStats ? '🔧 Dev Stats: ON' : '🔧 Dev Stats: OFF'}
          </button>
        </div>
      ) : null}

      {/* Statistics Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {statisticSections.map((section, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#60a5fa',
                marginBottom: '12px',
                textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
              }}
            >
              {section.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.stats.map((stat, statIndex) => (
                <div
                  key={statIndex}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    background: stat.isSubItem ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '6px',
                    fontSize: stat.isSubItem ? '13px' : '14px',
                  }}
                >
                  <span style={{ color: stat.isSubItem ? '#cbd5e1' : '#e2e8f0' }}>
                    {stat.label}
                  </span>
                  <span style={{ 
                    color: stat.isSubItem ? '#93c5fd' : '#60a5fa',
                    fontWeight: 'bold' 
                  }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsPanel;
