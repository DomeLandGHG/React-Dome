import { useState } from 'react';
import type { GoldSkill } from '../types/GoldSkillTree';
import { canUnlockSkill, calculateGoldSkillBonuses } from '../types/GoldSkillTree';

interface GoldSkillTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: GoldSkill[];
  availableGoldRP: number;
  onUnlockSkill: (skillId: number) => void;
}

export const GoldSkillTreeModal = ({ 
  isOpen, 
  onClose, 
  skills, 
  availableGoldRP,
  onUnlockSkill 
}: GoldSkillTreeModalProps) => {
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [celebratingSkill, setCelebratingSkill] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleUnlockSkill = (skillId: number) => {
    onUnlockSkill(skillId);
    setCelebratingSkill(skillId);
    setTimeout(() => setCelebratingSkill(null), 1500);
  };

  // Tier colors for visual hierarchy
  const getTierColor = (y: number) => {
    switch(y) {
      case 0: return { 
        primary: '#fbbf24', 
        secondary: '#f59e0b', 
        glow: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.3)'
      };
      case 1: return { 
        primary: '#60a5fa', 
        secondary: '#3b82f6', 
        glow: '#60a5fa',
        bg: 'rgba(96, 165, 250, 0.1)',
        border: 'rgba(96, 165, 250, 0.3)'
      };
      case 2: return { 
        primary: '#a78bfa', 
        secondary: '#8b5cf6', 
        glow: '#a78bfa',
        bg: 'rgba(167, 139, 250, 0.1)',
        border: 'rgba(167, 139, 250, 0.3)'
      };
      case 3: return { 
        primary: '#f472b6', 
        secondary: '#ec4899', 
        glow: '#f472b6',
        bg: 'rgba(244, 114, 182, 0.1)',
        border: 'rgba(244, 114, 182, 0.3)'
      };
      default: return { 
        primary: '#fbbf24', 
        secondary: '#f59e0b', 
        glow: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.1)',
        border: 'rgba(251, 191, 36, 0.3)'
      };
    }
  };

  return (
    <>
      {/* Fullscreen Glass Morphism Background */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(135deg, 
              rgba(15, 23, 42, 0.97) 0%, 
              rgba(30, 27, 75, 0.97) 25%,
              rgba(15, 23, 42, 0.97) 50%,
              rgba(20, 30, 60, 0.97) 75%,
              rgba(15, 23, 42, 0.97) 100%
            )
          `,
          backdropFilter: 'blur(20px)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Animated gradient orbs */}
        <div style={{
          position: 'fixed',
          top: '10%',
          left: '10%',
          width: '30vw',
          height: '30vw',
          maxWidth: '500px',
          maxHeight: '500px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'fixed',
          bottom: '10%',
          right: '10%',
          width: '35vw',
          height: '35vw',
          maxWidth: '600px',
          maxHeight: '600px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 25s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'fixed',
          top: '50%',
          right: '5%',
          width: '25vw',
          height: '25vw',
          maxWidth: '400px',
          maxHeight: '400px',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'float 30s ease-in-out infinite',
          pointerEvents: 'none'
        }} />
      
      {/* Fullscreen Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '3rem 4rem',
        gap: '3rem'
      }}>
        {/* Modern Header */}
        <div style={{
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Title with animated gradient */}
          <h1 style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #60a5fa 25%, #a78bfa 50%, #f472b6 75%, #fbbf24 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '800',
            margin: '0 0 1.5rem 0',
            letterSpacing: '0.15em',
            animation: 'rainbowShift 6s linear infinite',
            textTransform: 'uppercase',
            filter: 'drop-shadow(0 0 2rem rgba(251, 191, 36, 0.5))'
          }}>
            Gold Skill Tree
          </h1>
          
          {/* Subtitle */}
          <p style={{
            color: '#94a3b8',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            letterSpacing: '0.05em'
          }}>
            Unlock celestial powers with your Gold Rebirth Points
          </p>
          
          {/* Available RP Counter */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            backdropFilter: 'blur(10px)',
            border: '2px solid',
            borderImage: 'linear-gradient(90deg, #fbbf24, #a78bfa) 1',
            borderRadius: '1.5rem',
            padding: '1rem 2.5rem',
            boxShadow: '0 0.5rem 2rem rgba(251, 191, 36, 0.3), inset 0 0 2rem rgba(251, 191, 36, 0.05)'
          }}>
            <span style={{ 
              color: '#cbd5e1',
              fontSize: '1.25rem',
              fontWeight: '600',
              letterSpacing: '0.05em'
            }}>
              Available Points:
            </span>
            <span style={{
              color: '#fbbf24',
              fontSize: '2rem',
              fontWeight: 'bold',
              textShadow: '0 0 1.5rem rgba(251, 191, 36, 1), 0 0 3rem rgba(251, 191, 36, 0.5)',
              animation: 'numberGlow 2s ease-in-out infinite'
            }}>
              {availableGoldRP}
            </span>
            <span style={{
              fontSize: '1.75rem',
              filter: 'drop-shadow(0 0 0.5rem #fbbf24)',
              animation: 'spinSlow 4s linear infinite'
            }}>
              ⭐
            </span>
          </div>
        </div>

        {/* Skill Tree - Tier-based Rows with Connection Lines */}
        <div style={{
          flex: 1,
          maxWidth: '120rem',
          margin: '0 auto',
          width: '100%',
          padding: '2rem',
          position: 'relative'
        }}>
          {/* Group skills by tier */}
          {[0, 1, 2, 3].map(tierLevel => {
            const tierSkills = skills.filter(s => s.position.y === tierLevel);
            if (tierSkills.length === 0) return null;
            
            const tierColor = getTierColor(tierLevel);

            return (
              <div key={tierLevel} style={{ marginBottom: '4rem', position: 'relative' }}>
                {/* Tier Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    display: 'inline-block',
                    background: `linear-gradient(135deg, ${tierColor.primary}, ${tierColor.secondary})`,
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    padding: '0.75rem 2.5rem',
                    borderRadius: '2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    boxShadow: `0 0 2rem ${tierColor.glow}99, 0 0.5rem 1.5rem ${tierColor.glow}66`,
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}>
                    Tier {tierLevel + 1}
                  </div>
                </div>

                {/* Connection Lines SVG */}
                <svg 
                  style={{
                    position: 'absolute',
                    top: '6rem',
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                >
                  {tierSkills.map(skill => {
                    if (!skill.requires || skill.requires.length === 0) return null;
                    
                    return skill.requires.map(reqId => {
                      const requiredSkill = skills.find(s => s.id === reqId);
                      if (!requiredSkill) return null;
                      
                      // Calculate positions based on grid layout
                      const fromIndex = skills.filter(s => s.position.y === requiredSkill.position.y).findIndex(s => s.id === reqId);
                      const toIndex = tierSkills.findIndex(s => s.id === skill.id);
                      
                      const tierSkillsCount = skills.filter(s => s.position.y === requiredSkill.position.y).length;
                      const currentTierCount = tierSkills.length;
                      
                      // Calculate center positions
                      const fromX = ((fromIndex + 0.5) / tierSkillsCount) * 100;
                      const toX = ((toIndex + 0.5) / currentTierCount) * 100;
                      
                      const isUnlocked = requiredSkill.currentLevel > 0;
                      const lineColor = isUnlocked ? tierColor.primary : 'rgba(71, 85, 105, 0.3)';
                      
                      return (
                        <g key={`${reqId}-${skill.id}`}>
                          {/* Glow effect for unlocked connections */}
                          {isUnlocked && (
                            <line
                              x1={`${fromX}%`}
                              y1="-4rem"
                              x2={`${toX}%`}
                              y2="0"
                              stroke={tierColor.glow}
                              strokeWidth="8"
                              opacity="0.3"
                              filter="blur(8px)"
                            />
                          )}
                          {/* Main line */}
                          <line
                            x1={`${fromX}%`}
                            y1="-4rem"
                            x2={`${toX}%`}
                            y2="0"
                            stroke={lineColor}
                            strokeWidth="3"
                            strokeDasharray={isUnlocked ? "none" : "10,5"}
                            opacity={isUnlocked ? "1" : "0.4"}
                          />
                          {/* Arrow marker */}
                          {isUnlocked && (
                            <circle
                              cx={`${toX}%`}
                              cy="0"
                              r="6"
                              fill={tierColor.primary}
                              filter={`drop-shadow(0 0 8px ${tierColor.glow})`}
                            />
                          )}
                        </g>
                      );
                    });
                  })}
                </svg>

                {/* Skills Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${tierSkills.length}, 1fr)`,
                  gap: '2rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {tierSkills.map(skill => {
                    const canUnlock = canUnlockSkill(skill, skills, availableGoldRP);
                    const isMaxed = skill.currentLevel >= skill.maxLevel;
                    const isLocked = skill.currentLevel === 0 && !canUnlock;
                    const isCelebrating = celebratingSkill === skill.id;

            return (
              <div
                key={skill.id}
                onMouseEnter={() => setHoveredSkill(skill.id)}
                onMouseLeave={() => setHoveredSkill(null)}
                style={{
                  position: 'relative',
                  background: isMaxed
                    ? `linear-gradient(135deg, ${tierColor.bg}, ${tierColor.bg})`
                    : skill.currentLevel > 0
                    ? `linear-gradient(135deg, ${tierColor.bg}, rgba(15, 23, 42, 0.8))`
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${
                    isMaxed ? tierColor.primary
                    : skill.currentLevel > 0 ? tierColor.border
                    : canUnlock ? 'rgba(148, 163, 184, 0.4)'
                    : 'rgba(71, 85, 105, 0.3)'
                  }`,
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  cursor: canUnlock ? 'pointer' : 'not-allowed',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  opacity: isLocked ? 0.5 : 1,
                  boxShadow: isMaxed
                    ? `0 0 2rem ${tierColor.glow}, 0 1rem 3rem rgba(0,0,0,0.4), inset 0 0 2rem ${tierColor.bg}`
                    : hoveredSkill === skill.id && canUnlock
                    ? `0 0 2rem ${tierColor.glow}, 0 1rem 3rem rgba(0,0,0,0.5)`
                    : '0 0.5rem 2rem rgba(0,0,0,0.3)',
                  transform: hoveredSkill === skill.id && canUnlock
                    ? 'translateY(-0.5rem) scale(1.02)'
                    : isCelebrating
                    ? 'scale(1.05)'
                    : 'translateY(0) scale(1)',
                  animation: isMaxed ? 'cardPulse 3s ease-in-out infinite' : 'none'
                }}
                onClick={() => canUnlock && handleUnlockSkill(skill.id)}
              >
                {/* Celebration effect */}
                {isCelebrating && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '1.5rem',
                    background: `radial-gradient(circle, ${tierColor.primary}44 0%, transparent 70%)`,
                    animation: 'celebrationPulse 1.5s ease-out',
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Tier badge */}
                <div style={{
                  position: 'absolute',
                  top: '-0.75rem',
                  left: '1.5rem',
                  background: `linear-gradient(135deg, ${tierColor.primary}, ${tierColor.secondary})`,
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  padding: '0.375rem 1rem',
                  borderRadius: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  boxShadow: `0 0.25rem 1rem ${tierColor.glow}99`,
                  border: '2px solid rgba(255,255,255,0.2)'
                }}>
                  Tier {skill.position.y + 1}
                </div>

                {/* Level badge */}
                {skill.currentLevel > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-0.75rem',
                    right: '1.5rem',
                    background: isMaxed 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    boxShadow: isMaxed
                      ? '0 0.25rem 1rem rgba(16, 185, 129, 0.5)'
                      : '0 0.25rem 1rem rgba(59, 130, 246, 0.5)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    animation: isMaxed ? 'badgePulse 2s ease-in-out infinite' : 'none'
                  }}>
                    Level {skill.currentLevel}/{skill.maxLevel}
                  </div>
                )}

                {/* Icon and title section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    filter: isMaxed || skill.currentLevel > 0
                      ? `drop-shadow(0 0 1rem ${tierColor.glow})`
                      : 'grayscale(100%) opacity(0.5)',
                    transition: 'all 0.3s ease'
                  }}>
                    {skill.icon}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      color: isMaxed ? tierColor.primary : skill.currentLevel > 0 ? '#e2e8f0' : '#94a3b8',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0',
                      textShadow: isMaxed ? `0 0 1rem ${tierColor.glow}` : 'none'
                    }}>
                      {skill.name}
                    </h3>
                    
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '0.9375rem',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {skill.description}
                    </p>
                  </div>
                </div>

                {/* Active bonus display */}
                {skill.currentLevel > 0 && (() => {
                  const totalBonus = skill.bonusPerLevel * skill.currentLevel;
                  const goldSkillBonuses = calculateGoldSkillBonuses(skills);
                  let bonusText = '';
                  
                  // Skill-specific bonus display with Golden Ascension applied
                  switch(skill.id) {
                    case 1: // Golden Touch
                      const effectiveClickPower = ((goldSkillBonuses.clickPowerMultiplier - 1) * 100);
                      bonusText = `+${effectiveClickPower.toFixed(0)}% Money from Clicks & Ticks`;
                      break;
                    case 2: // Divine Rebirth
                      const effectiveRpGain = ((goldSkillBonuses.rpGainMultiplier - 1) * 100);
                      bonusText = `+${effectiveRpGain.toFixed(0)}% RP from Rebirth`;
                      break;
                    case 3: // Gem Mastery
                      const effectiveGemGain = ((goldSkillBonuses.gemGainMultiplier - 1) * 100);
                      bonusText = `+${effectiveGemGain.toFixed(0)}% Gem Drop Chance`;
                      break;
                    case 4: // Fortune's Favor
                      bonusText = `+${(totalBonus * 100).toFixed(0)}% Better Rune Drops`;
                      break;
                    case 5: // Elemental Harmony
                      const effectiveElementalGain = ((goldSkillBonuses.elementalGainMultiplier - 1) * 100);
                      bonusText = `+${effectiveElementalGain.toFixed(0)}% Elemental Production`;
                      break;
                    case 6: // Diamond Rain
                      bonusText = `${totalBonus.toFixed(0)}x Gem Multiplier`;
                      break;
                    case 7: // Auto Clicker
                      bonusText = `+${totalBonus.toFixed(0)} Auto Clicks per Tick`;
                      break;
                    case 8: // Critical Strike
                      bonusText = `${(totalBonus * 100).toFixed(1)}% Chance for 10x Money`;
                      break;
                    case 9: // Elemental Fusion
                      bonusText = `Converter Unlocked (80% efficiency)`;
                      break;
                    case 10: // Golden Ascension
                      bonusText = `${((1 + totalBonus) * 100 - 100).toFixed(0)}% Stronger Gold Skills`;
                      break;
                    default:
                      bonusText = `+${(totalBonus * 100).toFixed(0)}% Active Bonus`;
                  }
                  
                  return (
                    <div style={{
                      background: `linear-gradient(135deg, ${tierColor.bg}, ${tierColor.bg})`,
                      border: `2px solid ${tierColor.border}`,
                      borderRadius: '1rem',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        color: tierColor.primary,
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textShadow: `0 0 1rem ${tierColor.glow}`
                      }}>
                        🌟 {bonusText}
                      </div>
                    </div>
                  );
                })()}

                {/* Requirements section */}
                {skill.requires && skill.requires.length > 0 && (
                  <div style={{
                    borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                    paddingTop: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.5rem'
                    }}>
                      Requires:
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {skill.requires.map(reqId => {
                        const reqSkill = skills.find(s => s.id === reqId);
                        const isUnlocked = reqSkill && reqSkill.currentLevel > 0;
                        return (
                          <div
                            key={reqId}
                            style={{
                              background: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: isUnlocked ? '#10b981' : '#ef4444',
                              fontSize: '0.8125rem',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${isUnlocked ? '#10b981' : '#ef4444'}44`
                            }}
                          >
                            {isUnlocked ? '✓' : '✗'} {reqSkill?.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom action section */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(148, 163, 184, 0.2)'
                }}>
                  {skill.currentLevel >= skill.maxLevel ? (
                    <div style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      padding: '0.875rem 1.5rem',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      boxShadow: '0 0 1.5rem rgba(16, 185, 129, 0.5)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      ⭐ MAXED OUT ⭐
                    </div>
                  ) : (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#fbbf24',
                        textShadow: '0 0 1rem rgba(251, 191, 36, 0.5)'
                      }}>
                        <span>⭐</span>
                        <span>{skill.cost}</span>
                      </div>

                      <button
                        disabled={!canUnlock}
                        style={{
                          background: canUnlock
                            ? `linear-gradient(135deg, ${tierColor.primary}, ${tierColor.secondary})`
                            : 'linear-gradient(135deg, #475569, #334155)',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          padding: '0.875rem 2rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          cursor: canUnlock ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          boxShadow: canUnlock ? `0 0.5rem 1.5rem ${tierColor.glow}66` : '0 0.25rem 0.75rem rgba(0,0,0,0.3)',
                          opacity: canUnlock ? 1 : 0.5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canUnlock) handleUnlockSkill(skill.id);
                        }}
                        onMouseEnter={(e) => {
                          if (canUnlock) {
                            e.currentTarget.style.transform = 'translateY(-0.125rem)';
                            e.currentTarget.style.boxShadow = `0 0.75rem 2rem ${tierColor.glow}`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = canUnlock ? `0 0.5rem 1.5rem ${tierColor.glow}66` : '0 0.25rem 0.75rem rgba(0,0,0,0.3)';
                        }}
                      >
                        {canUnlock ? 'Unlock' : 'Locked'}
                      </button>
                    </>
                  )}
                </div>
              </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button - Fixed Bottom */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '0.125rem solid transparent',
          borderImage: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent) 1',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '1.25rem 3.5rem',
              background: 'linear-gradient(135deg, #475569 0%, #334155 50%, #475569 100%)',
              border: '0.1875rem solid #64748b',
              borderRadius: '1.25rem',
              color: '#f1f5f9',
              fontSize: '1.375rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.6), inset 0 0.125rem 0.625rem rgba(255, 255, 255, 0.1)',
              textShadow: '0 0.125rem 0.375rem rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.125rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 50%, #64748b 100%)';
              e.currentTarget.style.transform = 'translateY(-0.3125rem) scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0.75rem 2.25rem rgba(0, 0, 0, 0.7), inset 0 0.125rem 0.875rem rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #475569 0%, #334155 50%, #475569 100%)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0.5rem 1.5rem rgba(0, 0, 0, 0.6), inset 0 0.125rem 0.625rem rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = '#64748b';
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>✕ Close Skill Tree</span>
          </button>
        </div>
      </div>
      </div>

      {/* Enhanced Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: translate(-50%, -60%) scale(0.85) rotateX(15deg);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotateX(0deg);
          }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        
        @keyframes cosmicFloat {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.4;
          }
          33% {
            transform: translateY(-40px) translateX(25px) scale(1.2);
            opacity: 0.8;
          }
          66% {
            transform: translateY(-20px) translateX(-15px) scale(0.9);
            opacity: 0.6;
          }
        }
        
        @keyframes iconOrbit {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-5deg) scale(1.1);
          }
          50% {
            transform: rotate(0deg) scale(1.15);
          }
          75% {
            transform: rotate(5deg) scale(1.1);
          }
        }
        
        @keyframes rainbowShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        
        @keyframes numberGlow {
          0%, 100% {
            text-shadow: 0 0 25px rgba(251, 191, 36, 1), 0 0 50px rgba(251, 191, 36, 0.6);
          }
          50% {
            text-shadow: 0 0 35px rgba(251, 191, 36, 1), 0 0 70px rgba(251, 191, 36, 0.8), 0 0 100px rgba(251, 191, 36, 0.4);
          }
        }
        
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes hexagonPulse {
          0%, 100% {
            filter: brightness(1.15);
          }
          50% {
            filter: brightness(1.35);
          }
        }
        
        @keyframes innerPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes hexagonShine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes iconBounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.08);
          }
        }
        
        @keyframes badgeSpin {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.15);
          }
        }
        
        @keyframes explode {
          from {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateY(-6.25rem) scale(0.5);
          }
        }
      `}</style>
    </>
  );
};
