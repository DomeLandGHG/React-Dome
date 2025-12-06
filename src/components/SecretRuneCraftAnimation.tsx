import React, { useState, useEffect } from 'react';
import { RuneCard } from './RuneCard';
import '../styles/SecretRuneCraftAnimation.css';

interface SecretRuneCraftAnimationProps {
  onComplete: () => void;
  mode?: 'single' | 'all';
  count?: number;
}

const BASIC_RUNES = [
  { rarity: 'Common Rune', bonuses: ['💰 +5% Money'], color: '#9CA3AF' },
  { rarity: 'Uncommon Rune', bonuses: ['💰 +18% Money'], color: '#22c55e' },
  { rarity: 'Rare Rune', bonuses: ['💰 +40% Money', '🔄 +5% RP', '💎 +0.05% Gems'], color: '#3b82f6' },
  { rarity: 'Epic Rune', bonuses: ['💰 +80% Money', '🔄 +20% RP', '💎 +0.1% Gems'], color: '#a855f7' },
  { rarity: 'Legendary Rune', bonuses: ['💰 +150% Money', '🔄 +75% RP', '💎 +0.5% Gems'], color: '#f59e0b' },
  { rarity: 'Mythic Rune', bonuses: ['💰 +300% Money', '🔄 +250% RP', '💎 +2% Gems'], color: '#ef4444' }
];

const ELEMENTAL_RUNES = [
  { rarity: 'Common', bonuses: ['1 Air/tick'], elementType: 'Air', color: '#60a5fa' },
  { rarity: 'Common', bonuses: ['1 Earth/tick'], elementType: 'Earth', color: '#a855f7' },
  { rarity: 'Common', bonuses: ['1 Water/tick'], elementType: 'Water', color: '#3b82f6' },
  { rarity: 'Common', bonuses: ['1 Fire/tick'], elementType: 'Fire', color: '#ef4444' },
  { rarity: 'Rare', bonuses: ['1 Light/tick'], elementType: 'Light', color: '#fbbf24' },
  { rarity: 'Rare', bonuses: ['1 Dark/tick'], elementType: 'Dark', color: '#6b7280' }
];

export const SecretRuneCraftAnimation: React.FC<SecretRuneCraftAnimationProps> = ({ onComplete, mode = 'single', count = 1 }) => {
  const [phase, setPhase] = useState<'intro' | 'spreading' | 'orbiting' | 'charging' | 'merging' | 'explosion' | 'revealing' | 'done'>('intro');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    // Phase 0: Intro fade (300ms)
    const introTimer = setTimeout(() => setPhase('spreading'), 300);
    
    // Phase 1: Cards spread out (800ms)
    const spreadTimer = setTimeout(() => setPhase('orbiting'), 1100);

    // Phase 2: Cards orbit (1500ms)
    const orbitTimer = setTimeout(() => setPhase('charging'), 2600);

    // Phase 3: Energy charging (1000ms)
    const chargeTimer = setTimeout(() => {
      setPhase('merging');
      // Generate particles
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: (Math.random() - 0.5) * 800,
          y: (Math.random() - 0.5) * 800,
          color: [...BASIC_RUNES, ...ELEMENTAL_RUNES][Math.floor(Math.random() * 12)].color
        });
      }
      setParticles(newParticles);
    }, 3600);

    // Phase 4: Cards merge (1200ms)
    const mergeTimer = setTimeout(() => setPhase('explosion'), 4800);

    // Phase 5: Explosion effect (800ms)
    const explosionTimer = setTimeout(() => setPhase('revealing'), 5600);

    // Phase 6: Reveal Secret Rune (2000ms)
    const doneTimer = setTimeout(() => setPhase('done'), 7600);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(spreadTimer);
      clearTimeout(orbitTimer);
      clearTimeout(chargeTimer);
      clearTimeout(mergeTimer);
      clearTimeout(explosionTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`craft-animation-overlay phase-${phase}`}>
      <div className="craft-animation-container">
        {/* Particle System */}
        {(phase === 'charging' || phase === 'merging') && (
          <div className="craft-particles">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="craft-particle"
                style={{
                  left: `calc(50% + ${particle.x}px)`,
                  top: `calc(50% + ${particle.y}px)`,
                  background: particle.color,
                  boxShadow: `0 0 10px ${particle.color}`
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Explosion Effect */}
        {phase === 'explosion' && (
          <div className="craft-explosion">
            <div className="explosion-ring ring-1"></div>
            <div className="explosion-ring ring-2"></div>
            <div className="explosion-ring ring-3"></div>
            <div className="explosion-flash"></div>
          </div>
        )}

        {/* Energy Vortex Background */}
        {(phase === 'orbiting' || phase === 'charging' || phase === 'merging') && (
          <div className="craft-vortex">
            <div className="vortex-layer layer-1"></div>
            <div className="vortex-layer layer-2"></div>
            <div className="vortex-layer layer-3"></div>
          </div>
        )}

        {/* Basic Runes Ring */}
        {phase !== 'explosion' && phase !== 'revealing' && phase !== 'done' && (
          <div className={`craft-cards-ring basic-ring ${phase}`}>
            {BASIC_RUNES.map((rune, index) => (
              <div
                key={`basic-${index}`}
                className={`craft-card-wrapper ${phase}`}
                style={{
                  '--index': index,
                  '--total': BASIC_RUNES.length,
                  '--delay': `${index * 80}ms`,
                  '--color': rune.color
                } as React.CSSProperties}
              >
                <div className="card-glow" style={{ boxShadow: `0 0 30px ${rune.color}` }}></div>
                <RuneCard
                  rarity={rune.rarity}
                  bonuses={rune.bonuses}
                  count={1}
                  isRevealing={false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Elemental Runes Ring */}
        {phase !== 'explosion' && phase !== 'revealing' && phase !== 'done' && (
          <div className={`craft-cards-ring elemental-ring ${phase}`}>
            {ELEMENTAL_RUNES.map((rune, index) => (
              <div
                key={`elemental-${index}`}
                className={`craft-card-wrapper ${phase}`}
                style={{
                  '--index': index,
                  '--total': ELEMENTAL_RUNES.length,
                  '--delay': `${index * 80}ms`,
                  '--color': rune.color
                } as React.CSSProperties}
              >
                <div className="card-glow" style={{ boxShadow: `0 0 30px ${rune.color}` }}></div>
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
        )}

        {/* Center Energy Core */}
        {(phase === 'charging' || phase === 'merging') && (
          <div className="craft-energy-core">
            <div className="core-pulse pulse-1"></div>
            <div className="core-pulse pulse-2"></div>
            <div className="core-pulse pulse-3"></div>
            <div className="core-center"></div>
          </div>
        )}

        {/* Secret Rune Result */}
        {(phase === 'revealing' || phase === 'done') && (
          <div className="craft-result-card revealing">
            <div className="result-aura"></div>
            <RuneCard
              rarity="Secret Rune"
              bonuses={["💰 +500% Money", "🔄 +350% RP", "💎 +3% Gems"]}
              count={mode === 'all' ? count : 1}
              isRevealing={false}
            />
            {phase === 'done' && (
              <div className="result-actions">
                {mode === 'all' && count > 1 && (
                  <div className="craft-success-message">
                    ✨ Crafted {count}x Secret Runes! ✨
                  </div>
                )}
                <button
                  className="craft-continue-button"
                  onClick={onComplete}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
