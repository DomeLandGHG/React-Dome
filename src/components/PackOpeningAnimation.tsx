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
  index?: number;
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
  totalPacksOpened?: number;
  actualRuneCounts?: number[] | null;
}

const groupResults = (results: PackResult[], actualCounts?: number[] | null): GroupedResult[] => {
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
  
  // If we have actual counts from distribution, replace the counts
  if (actualCounts && actualCounts.length > 0) {
    // Create a map of rarity name to actual count
    const countByIndex = new Map<number, number>();
    results.forEach(result => {
      if (result.index !== undefined && actualCounts[result.index] !== undefined) {
        countByIndex.set(result.index, actualCounts[result.index]);
      }
    });
    
    // Update the grouped results with actual counts
    const groupedArray = Array.from(grouped.entries());
    groupedArray.forEach(([key, group]) => {
      // Find the first result with this rarity to get its index
      const matchingResult = results.find(r => `${r.rarity}-${r.bonuses.join(',')}` === key);
      if (matchingResult && matchingResult.index !== undefined) {
        const actualCount = countByIndex.get(matchingResult.index);
        if (actualCount !== undefined) {
          group.count = actualCount;
        }
      }
    });
  }
  
  // Sortiere nach Seltenheit (seltenste zuerst)
  const rarityOrder: string[] = ['secret', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  return Array.from(grouped.values()).sort((a, b) => {
    const aIndex = rarityOrder.findIndex(r => a.rarity.toLowerCase().includes(r));
    const bIndex = rarityOrder.findIndex(r => b.rarity.toLowerCase().includes(r));
    return aIndex - bIndex;
  });
};

export const PackOpeningAnimation: React.FC<PackOpeningAnimationProps> = ({ 
  results, 
  onComplete,
  totalPacksOpened,
  actualRuneCounts
}) => {
  const [phase, setPhase] = useState<'opening' | 'revealing' | 'complete'>('opening');
  const [groupedResults, setGroupedResults] = useState<GroupedResult[]>([]);

  useEffect(() => {
    // Gruppiere Ergebnisse sofort
    const grouped = groupResults(results, actualRuneCounts);
    
    // Phase 1: Pack öffnet sich (500ms)
    const openTimer = setTimeout(() => {
      setPhase('revealing');
      setGroupedResults(grouped);
    }, 500);

    // Phase 2: Karten werden nacheinander aufgedeckt
    const revealDuration = Math.max(grouped.length * 200, 1000);
    const completeTimer = setTimeout(() => {
      setPhase('complete');
    }, 500 + revealDuration + 1000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, []); // Nur einmal beim Mount ausführen

  const packsCount = totalPacksOpened || results.length;

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
              <p>{packsCount.toLocaleString()} {packsCount === 1 ? 'Pack' : 'Packs'} opened</p>
            </div>
            
            <div className="cards-grid">
              {groupedResults.map((result, index) => (
                <RuneCard
                  key={`${result.rarity}-${result.bonuses.join('-')}-${index}`}
                  rarity={result.rarity}
                  bonuses={result.bonuses}
                  count={result.count}
                  isRevealing={false}
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
