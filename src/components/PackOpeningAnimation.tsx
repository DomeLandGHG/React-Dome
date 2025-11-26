import React, { useState, useEffect } from 'react';
import { RuneCard, type RuneRarity } from './RuneCard';
import '../styles/PackOpeningAnimation.css';

export interface PackResult {
  rarity: RuneRarity | string;
  bonus: number;
  bonusType?: 'money' | 'rp' | 'gem' | 'producing';
  producing?: string;
  bonuses: string[];
  elementType?: string;
}

export interface GroupedResult {
  rarity: RuneRarity | string;
  bonus: number;
  count: number;
  bonusType?: 'money' | 'rp' | 'gem' | 'producing';
  producing?: string;
  bonuses: string[];
  elementType?: string;
}

interface PackOpeningAnimationProps {
  results: PackResult[];
  onComplete: () => void;
}

const groupResults = (results: PackResult[]): GroupedResult[] => {
  const grouped = new Map<string, GroupedResult>();
  
  results.forEach(result => {
    const key = `${result.rarity}-${result.bonuses.join(',')}`;
    const existing = grouped.get(key);
    
    if (existing) {
      existing.count++;
    } else {
      grouped.set(key, {
        rarity: result.rarity,
        bonus: result.bonus,
        count: 1,
        bonusType: result.bonusType,
        producing: result.producing,
        bonuses: result.bonuses,
        elementType: result.elementType
      });
    }
  });
  
  // Sortiere nach Seltenheit (seltenste zuerst)
  const rarityOrder: string[] = ['secret', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  return Array.from(grouped.values()).sort((a, b) => {
    const aIndex = rarityOrder.findIndex(r => a.rarity.toLowerCase().includes(r));
    const bIndex = rarityOrder.findIndex(r => b.rarity.toLowerCase().includes(r));
    return aIndex - bIndex;
  });
};

export const PackOpeningAnimation: React.FC<PackOpeningAnimationProps> = ({ 
  results, 
  onComplete 
}) => {
  const [phase, setPhase] = useState<'opening' | 'revealing' | 'complete'>('opening');
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);

  useEffect(() => {
    // Phase 1: Pack öffnet sich (500ms)
    const openTimer = setTimeout(() => {
      setPhase('revealing');
      setGroupedResults(groupResults(results));
    }, 500);

    // Phase 2: Karten werden nacheinander aufgedeckt
    const revealDuration = Math.max(groupedResults.length * 200, 1000);
    const completeTimer = setTimeout(() => {
      setPhase('complete');
    }, 500 + revealDuration + 1000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [results, onComplete]);

  return (
    <div className="pack-opening-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="pack-opening-container" onClick={(e) => e.stopPropagation()}>
        {phase === 'opening' && (
          <div className="pack-opening-animation">
            <div className="pack-box">
              <div className="pack-lid"></div>
              <div className="pack-body">
                <div className="pack-shine"></div>
                <div className="pack-question">?</div>
              </div>
            </div>
          </div>
        )}

        {(phase === 'revealing' || phase === 'complete') && (
          <div className="cards-container">
            <div className="pack-results-header">
              <h2>Pack Opening Results!</h2>
              <p>{results.length} {results.length === 1 ? 'Rune' : 'Runes'} obtained</p>
            </div>
            
            <div className="cards-grid">
              {groupedResults.map((result, index) => (
                <RuneCard
                  key={`${result.rarity}-${result.bonuses.join('-')}-${index}`}
                  rarity={result.rarity}
                  bonuses={result.bonuses}
                  count={result.count}
                  isRevealing={true}
                  delay={index * 200}
                  elementType={result.elementType}
                />
              ))}
            </div>

            {phase === 'complete' && (
              <div className="pack-complete-message">
                <button className="close-pack-button" onClick={onComplete}>
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
