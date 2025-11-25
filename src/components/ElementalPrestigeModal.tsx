import { useState } from 'react';
import type { GameState } from '../types';
import { ELEMENTAL_PRESTIGE_CONFIG, calculatePrestigeRequirement, getBonusDescription } from '../types/ElementalPrestige';

interface ElementalPrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPrestige: (elementId: number) => void;
}

const ElementalPrestigeModal = ({ isOpen, onClose, gameState, onPrestige }: ElementalPrestigeModalProps) => {
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  if (!isOpen) return null;

  const prestigeLevels = gameState.elementalPrestige || {
    air: 0,
    earth: 0,
    water: 0,
    fire: 0,
    light: 0,
    dark: 0
  };

  const canPrestige = (elementId: number): boolean => {
    const currentResource = gameState.elementalResources[elementId] || 0;
    const currentLevel = Object.values(prestigeLevels)[elementId];
    const requirement = calculatePrestigeRequirement(elementId, currentLevel);
    return currentResource >= requirement;
  };

  const handlePrestige = (elementId: number) => {
    if (canPrestige(elementId)) {
      onPrestige(elementId);
      setSelectedElement(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '3px solid #fbbf24',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(251, 191, 36, 0.4)',
        zIndex: 10001,
        minWidth: '700px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid rgba(251, 191, 36, 0.3)',
          paddingBottom: '16px'
        }}>
          <div>
            <h2 style={{
              color: '#fbbf24',
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '0 0 20px rgba(251, 191, 36, 0.6)'
            }}>
              ✨ Elemental Ascension
            </h2>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              margin: '4px 0 0 0'
            }}>
              Prestige your elements for permanent bonuses
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#fca5a5',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Elements Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {ELEMENTAL_PRESTIGE_CONFIG.map((config) => {
            const currentLevel = Object.values(prestigeLevels)[config.elementId];
            const currentResource = gameState.elementalResources[config.elementId] || 0;
            const requirement = calculatePrestigeRequirement(config.elementId, currentLevel);
            const canDoPrestige = canPrestige(config.elementId);
            const totalBonus = currentLevel * config.bonusPerLevel;

            return (
              <div
                key={config.elementId}
                style={{
                  background: canDoPrestige
                    ? `linear-gradient(135deg, ${config.color}20 0%, ${config.color}10 100%)`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: canDoPrestige
                    ? `2px solid ${config.color}`
                    : '2px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  cursor: canDoPrestige ? 'pointer' : 'default',
                  opacity: canDoPrestige ? 1 : 0.7
                }}
                onClick={() => canDoPrestige && setSelectedElement(selectedElement === config.elementId ? null : config.elementId)}
                onMouseEnter={(e) => {
                  if (canDoPrestige) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${config.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: config.color,
                    textShadow: `0 0 10px ${config.color}60`
                  }}>
                    {config.icon} {config.elementName}
                  </div>
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#fbbf24'
                  }}>
                    Level {currentLevel}
                  </div>
                </div>

                {/* Current Bonus */}
                <div style={{
                  marginBottom: '12px',
                  padding: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    Current Bonus:
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#22c55e'
                  }}>
                    +{totalBonus.toFixed(1)}% {getBonusDescription(config.bonusType)}
                  </div>
                </div>

                {/* Resources */}
                <div style={{
                  marginBottom: '12px',
                  fontSize: '13px'
                }}>
                  <div style={{
                    color: canDoPrestige ? '#22c55e' : '#ef4444',
                    marginBottom: '4px'
                  }}>
                    You have: {currentResource.toLocaleString('de-DE')}
                  </div>
                  <div style={{ color: '#94a3b8' }}>
                    Required: {requirement.toLocaleString('de-DE')}
                  </div>
                </div>

                {/* Next Bonus Preview */}
                <div style={{
                  padding: '8px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#60a5fa'
                }}>
                  Next Level: +{((currentLevel + 1) * config.bonusPerLevel).toFixed(1)}% {getBonusDescription(config.bonusType)}
                </div>

                {/* Prestige Button */}
                {selectedElement === config.elementId && canDoPrestige && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrestige(config.elementId);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '12px',
                      background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}CC 100%)`,
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      animation: 'fadeIn 0.2s ease-out',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ⚡ Prestige to Level {currentLevel + 1}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#fbbf24',
          fontSize: '13px'
        }}>
          💡 Prestiging resets only that element's resources but grants permanent bonuses!
        </div>

        {/* Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -60%) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ElementalPrestigeModal;
