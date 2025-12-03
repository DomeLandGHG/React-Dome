import React, { useState, useEffect } from 'react';
import { RuneCard } from './RuneCard';
import '../styles/SecretRuneCraftAnimation.css';

interface SecretRuneCraftAnimationProps {
  onComplete: () => void;
  mode?: 'single' | 'all';
  count?: number;
}

const BASIC_RUNES = [
  { rarity: 'Common Rune', bonuses: ['💰 +5% Money'] },
  { rarity: 'Uncommon Rune', bonuses: ['💰 +18% Money'] },
  { rarity: 'Rare Rune', bonuses: ['💰 +40% Money', '🔄 +5% RP', '💎 +0.05% Gems'] },
  { rarity: 'Epic Rune', bonuses: ['💰 +80% Money', '🔄 +20% RP', '💎 +0.1% Gems'] },
  { rarity: 'Legendary Rune', bonuses: ['💰 +150% Money', '🔄 +75% RP', '💎 +0.5% Gems'] },
  { rarity: 'Mythic Rune', bonuses: ['💰 +300% Money', '🔄 +250% RP', '💎 +2% Gems'] }
];

const ELEMENTAL_RUNES = [
  { rarity: 'Common', bonuses: ['1 Air/tick'], elementType: 'Air' },
  { rarity: 'Common', bonuses: ['1 Earth/tick'], elementType: 'Earth' },
  { rarity: 'Common', bonuses: ['1 Water/tick'], elementType: 'Water' },
  { rarity: 'Common', bonuses: ['1 Fire/tick'], elementType: 'Fire' },
  { rarity: 'Rare', bonuses: ['1 Light/tick'], elementType: 'Light' },
  { rarity: 'Rare', bonuses: ['1 Dark/tick'], elementType: 'Dark' }
];

export const SecretRuneCraftAnimation: React.FC<SecretRuneCraftAnimationProps> = ({ onComplete, mode = 'single', count = 1 }) => {
  const [phase, setPhase] = useState<'spreading' | 'merging' | 'revealing' | 'done'>('spreading');

  useEffect(() => {
    // Phase 1: Cards spread out (500ms)
    const spreadTimer = setTimeout(() => {
      setPhase('merging');
    }, 500);

    // Phase 2: Cards merge to center (2000ms)
    const mergeTimer = setTimeout(() => {
      setPhase('revealing');
    }, 2500);

    // Phase 3: Show Secret Rune (3000ms)
    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 5500);

    return () => {
      clearTimeout(spreadTimer);
      clearTimeout(mergeTimer);
      clearTimeout(doneTimer);
    };
  }, []); // Nur einmal beim Mount ausführen

  return (
    <div className="craft-animation-overlay">
      <div className="craft-animation-container">
        {/* Basic Runes */}
        <div className={`craft-cards-ring basic-ring ${phase}`}>
          {BASIC_RUNES.map((rune, index) => (
            <div
              key={`basic-${index}`}
              className="craft-card-wrapper"
              style={{
                '--index': index,
                '--total': BASIC_RUNES.length,
                '--delay': `${index * 50}ms`
              } as any}
            >
              <RuneCard
                rarity={rune.rarity}
                bonuses={rune.bonuses}
                count={1}
                isRevealing={false}
              />
            </div>
          ))}
        </div>

        {/* Elemental Runes */}
        <div className={`craft-cards-ring elemental-ring ${phase}`}>
          {ELEMENTAL_RUNES.map((rune, index) => (
            <div
              key={`elemental-${index}`}
              className="craft-card-wrapper"
              style={{
                '--index': index,
                '--total': ELEMENTAL_RUNES.length,
                '--delay': `${index * 50}ms`
              } as any}
            >
              <RuneCard
                rarity={rune.rarity}
                bonuses={rune.bonuses}
                elementType={rune.elementType}
                count={1}
                isRevealing={false}
              />
            </div>
          ))}
        </div>

        {/* Center Secret Rune */}
        {(phase === 'revealing' || phase === 'done') && (
          <div className="craft-result-card revealing">
            <RuneCard
              rarity="Secret Rune"
              bonuses={["💰 +500% Money", "🔄 +350% RP", "💎 +3% Gems"]}
              count={mode === 'all' ? count : 1}
              isRevealing={false}
            />
            {phase === 'done' && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                {mode === 'all' && count > 1 && (
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#27ae60', marginBottom: '16px' }}>
                    Crafted {count}x Secret Runes!
                  </div>
                )}
                <button
                  className="close-pack-button"
                  style={{ fontSize: '22px', padding: '18px 48px', borderRadius: '12px', background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(39, 174, 96, 0.4)' }}
                  onClick={onComplete}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Merge Effect */}
        {phase === 'merging' && (
          <div className="craft-merge-effect">
            <div className="craft-energy-burst"></div>
          </div>
        )}
      </div>
    </div>
  );
};
