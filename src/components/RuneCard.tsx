import React from 'react';
import '../styles/RuneCard.css';

export type RuneRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'secret';

interface RuneCardProps {
  rarity: RuneRarity | string;
  bonuses: string[];
  count?: number;
  isRevealing?: boolean;
  delay?: number;
  elementType?: string;
}

const RUNE_SYMBOLS: Record<RuneRarity, string> = {
  common: '●',
  uncommon: '◆',
  rare: '▲',
  epic: '◈',
  legendary: '★',
  mythic: '◉',
  secret: '✦'
};

const ELEMENT_SYMBOLS: Record<string, string> = {
  'Air': '💨',
  'Earth': '🌍',
  'Water': '💧',
  'Fire': '🔥',
  'Light': '✨',
  'Dark': '🌑'
};

const RUNE_NAMES: Record<RuneRarity, string> = {
  common: 'Common Rune',
  uncommon: 'Uncommon Rune',
  rare: 'Rare Rune',
  epic: 'Epic Rune',
  legendary: 'Legendary Rune',
  mythic: 'Mythic Rune',
  secret: 'Secret Rune'
};

export const RuneCard: React.FC<RuneCardProps> = ({ 
  rarity, 
  bonuses,
  count = 1,
  isRevealing = false,
  delay = 0,
  elementType
}) => {
  const isElemental = !!elementType;
  
  // Normalisiere rarity zu lowercase für Lookup
  const normalizedRarity = rarity.toLowerCase().replace(' rune', '') as RuneRarity;
  
  const symbol = isElemental 
    ? ELEMENT_SYMBOLS[elementType] 
    : RUNE_SYMBOLS[normalizedRarity] || '◆';
    
  const displayName = isElemental 
    ? `${elementType} Rune` 
    : RUNE_NAMES[normalizedRarity] || rarity;
  
  // Map 'mythic' to 'mythical' for CSS class to match existing styles
  // Also use specific element names for elemental runes
  let rarityClass = isElemental ? elementType.toLowerCase() : normalizedRarity;
  if (rarityClass === 'mythic') {
    rarityClass = 'mythical';
  }
  
  return (
    <div 
      className={`rune-card rune-card-${rarityClass} ${isRevealing ? 'revealing' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="rune-card-inner">
        <div className="rune-card-back">
          <div className="rune-pack-logo">?</div>
        </div>
        <div className="rune-card-front">
          <div className="rune-card-header">
            <div className="rune-symbol">{symbol}</div>
            <div className="rune-name">{displayName}</div>
          </div>
          
          <div className="rune-card-body">
            <div className="rune-mega-symbol">{symbol}</div>
            
            {/* Zeige alle Boni */}
            <div className="rune-bonuses-list">
              {bonuses.map((bonus, index) => (
                <div key={index} className="rune-bonus-item">
                  {bonus}
                </div>
              ))}
            </div>
          </div>
          
          {count > 1 && (
            <div className="rune-count-badge">×{count}</div>
          )}
          
          <div className="rune-card-shine"></div>
        </div>
      </div>
    </div>
  );
};
