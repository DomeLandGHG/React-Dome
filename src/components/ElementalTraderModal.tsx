import { useState } from 'react';
import type { GameState } from '../types';
import type { TraderOffer } from '../types/ElementalTrader';
import { RUNES_1, RUNES_2 } from '../types/Runes';

interface ElementalTraderModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: TraderOffer[];
  gameState: GameState;
  onAcceptOffer: (offer: TraderOffer) => void;
}

const ElementalTraderModal = ({ isOpen, onClose, offers, gameState, onAcceptOffer }: ElementalTraderModalProps) => {
  const [selectedOffer, setSelectedOffer] = useState<TraderOffer | null>(null);

  if (!isOpen) return null;

  const getElementName = (type: number): string => {
    const names = ['Air', 'Earth', 'Water', 'Fire', 'Light', 'Dark'];
    return names[type] || 'Unknown';
  };

  const getElementColor = (type: number): string => {
    return RUNES_2[type]?.color || '#94a3b8';
  };

  const getRewardText = (offer: TraderOffer): string => {
    switch (offer.rewardType) {
      case 'gems':
        return `${offer.rewardAmount} 💎 Gems`;
      case 'rp':
        return `${offer.rewardAmount} 🔄 RP`;
      case 'rune':
        if (offer.rewardRuneId !== undefined) {
          const rune = RUNES_1[offer.rewardRuneId];
          return `${offer.rewardAmount}× ${rune?.name || 'Rune'}`;
        }
        return `${offer.rewardAmount} Rune`;
      case 'money':
        return `${offer.rewardAmount.toLocaleString('de-DE')}$`;
      default:
        return 'Unknown';
    }
  };

  const canAffordOffer = (offer: TraderOffer): boolean => {
    const currentAmount = gameState.elementalResources[offer.elementType] || 0;
    return currentAmount >= offer.elementAmount;
  };

  const handleAccept = (offer: TraderOffer) => {
    if (canAffordOffer(offer)) {
      onAcceptOffer(offer);
      setSelectedOffer(null);
    }
  };

  // Buy all logic
  const handleBuyAll = (offer: TraderOffer) => {
    const currentAmount = gameState.elementalResources[offer.elementType] || 0;
    const maxTrades = Math.floor(currentAmount / offer.elementAmount);
    if (maxTrades > 0) {
      // Optimized: Only one state update for all trades
      const bulkOffer = { ...offer, bulkAmount: maxTrades };
      if (typeof onAcceptOffer === 'function') {
        onAcceptOffer(bulkOffer);
      }
      setSelectedOffer(null);
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
        border: '3px solid #a855f7',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(168, 85, 247, 0.4)',
        zIndex: 10001,
        width: '90vw',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflow: 'auto',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid rgba(168, 85, 247, 0.3)',
          paddingBottom: '16px'
        }}>
          <div>
            <h2 style={{
              color: '#a855f7',
              fontSize: '26px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
            }}>
              ⚡ Elemental Trader
            </h2>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              margin: '4px 0 0 0'
            }}>
              Trade your elemental resources for valuable rewards
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

        {/* Offers */}
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {offers.map((offer, _index) => {
            const canAfford = canAffordOffer(offer);
            const elementName = getElementName(offer.elementType);
            const elementColor = getElementColor(offer.elementType);

            return (
              <div
                key={offer.id}
                style={{
                  background: canAfford 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: canAfford 
                    ? '2px solid rgba(34, 197, 94, 0.5)' 
                    : '2px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  opacity: canAfford ? 1 : 0.6
                }}
                onClick={() => canAfford && setSelectedOffer(selectedOffer?.id === offer.id ? null : offer)}
                onMouseEnter={(e) => {
                  if (canAfford) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {/* Cost */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '4px'
                    }}>
                      Cost:
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: elementColor,
                      textShadow: `0 0 10px ${elementColor}40`
                    }}>
                      {offer.elementAmount.toLocaleString('de-DE')} {elementName}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: canAfford ? '#22c55e' : '#ef4444',
                      marginTop: '4px'
                    }}>
                      You have: {(gameState.elementalResources[offer.elementType] || 0).toLocaleString('de-DE')}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    fontSize: '32px',
                    color: '#a855f7',
                    margin: '0 20px'
                  }}>
                    →
                  </div>

                  {/* Reward */}
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '4px'
                    }}>
                      Reward:
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#fbbf24',
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.4)'
                    }}>
                      {getRewardText(offer)}
                    </div>
                  </div>
                </div>

                {/* Accept Button */}
                {selectedOffer?.id === offer.id && canAfford && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(offer);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                        border: '2px solid #16a34a',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        animation: 'fadeIn 0.2s ease-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ✓ Accept Trade
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuyAll(offer);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: '2px solid #fbbf24',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        animation: 'fadeIn 0.2s ease-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      🛒 Buy All
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timer info */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#c084fc',
          fontSize: '13px'
        }}>
          💫 New offers will appear in 10-20 minutes
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

export default ElementalTraderModal;
