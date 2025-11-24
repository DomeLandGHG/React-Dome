import React from 'react';
import type { GameState } from '../types';
import { ACHIEVEMENTS } from '../types/Achievement';
import { formatNumberGerman } from '../types/German_number';

interface AchievementsPanelProps {
  gameState: GameState;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ gameState }) => {
  // Calculate total bonuses from achievements
  const achievementCount = gameState.achievements.length;
  const moneyBonus = achievementCount * 1; // 1% per achievement
  const rpBonus = achievementCount * 1; // 1% per achievement
  const elementalBonus = achievementCount * 1; // 1% per achievement
  const gemBonus = achievementCount * 0.1; // 0.1% per achievement

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
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            position: 'relative'
          }}
        >
          <div
            style={{
              color: '#fbbf24',
              fontWeight: 'bold',
              marginBottom: '12px',
              fontSize: '16px',
              textAlign: 'center',
              textShadow: '0 0 8px rgba(251, 191, 36, 0.4)'
            }}
          >
            ⭐ Active Bonuses ({achievementCount} Achievement{achievementCount !== 1 ? 's' : ''})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span>💰 Money:</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{formatNumberGerman(moneyBonus)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span>🔄 Rebirth Points:</span>
              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>+{formatNumberGerman(rpBonus)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span>⚡ Elemental Production:</span>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>+{formatNumberGerman(elementalBonus)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span>💎 Gem Chance:</span>
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>+{formatNumberGerman(gemBonus, 1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div
        style={{
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '16px',
          color: '#fcd34d',
          position: 'relative'
        }}
      >
        Progress: {achievementCount} / {ACHIEVEMENTS.length} unlocked
      </div>

      {/* Achievements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = gameState.achievements.includes(achievement.id);
          
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
                    textShadow: isUnlocked ? '0 0 8px rgba(251, 191, 36, 0.4)' : 'none'
                  }}
                >
                  {achievement.name}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: isUnlocked ? '#fcd34d' : '#6b7280',
                    lineHeight: '1.4'
                  }}
                >
                  {achievement.description}
                </div>
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
