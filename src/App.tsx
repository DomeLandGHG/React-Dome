//verbindet alle scripte


//imports der Libarys
import React, { useState } from 'react';
import { useGameLogic } from './useGameLogic';
import GameStats from './components/GameStats';
import MoneyButton from './components/MoneyButton';
import SwitchButton from './components/Panel-switchButton';
import UpgradesPanel from './components/UpgradesPanel';
import RebirthPanel from './components/RebirthUpgradePanel';
import AchievementsPanel from './components/AchievementsPanel';
import StatisticsPanel from './components/StatisticsPanel';
import LeaderboardPanel from './components/LeaderboardPanel';
import ActionButtons from './components/ActionButtons';
import MobileTabNavigation from './components/MobileTabNavigation';
import SettingsMenu from './components/SettingsMenu';
import OfflineProgressModal from './components/OfflineProgressModal';
import DevModal from './components/DevModal';
import { SettingsModal } from './components/SettingsModal';
import { EventNotification } from './components/EventNotification';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import ElementalTraderModal from './components/ElementalTraderModal';
import ElementalPrestigeModal from './components/ElementalPrestigeModal';
import { GoldSkillTreeModal } from './components/GoldSkillTreeModal';
import { ElementalConverterModal } from './components/ElementalConverterModal';
import { PackOpeningAnimation, type PackResult } from './components/PackOpeningAnimation';
import { SecretRuneCraftAnimation } from './components/SecretRuneCraftAnimation';
import { MultiInstanceWarning } from './components/MultiInstanceWarning';
import { formatNumberGerman } from './types/German_number';
import { RUNES_1, RUNES_2, type Rune } from './types/Runes';
import { TRADER_OFFERS, type TraderOffer, generateRandomOffers } from './types/ElementalTrader';
import { EVENT_CONFIG } from './types/ElementalEvent';
import { calculateGoldSkillBonuses } from './types/GoldSkillTree';
import { getUserId } from './leaderboard';
import './App.css';

function App() {
  const { gameState, setGameState, isLoading, offlineProgress, setOfflineProgress, claimOfflineProgress, clickMoney, buyUpgrade, buyMaxUpgrades, buyRebirthUpgrade, buyMaxRebirthUpgrades, performRebirth, resetGame, cheatMoney, devAddMoney, devAddMoneyDirect, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, devAddElementalRune, openRunePack, mergeRunes, mergeAllRunes, switchRuneType, toggleElementalStats, toggleMoneyEffects, toggleDiamondEffects, toggleDevStats, devSimulateOfflineTime, craftSecretRune, manualSave, unlockGoldSkill, checkAchievements } = useGameLogic();
  const [activePanel, setActivePanel] = useState<'upgrades' | 'rebirth' | 'achievements'>('upgrades');
  const [secondPanelView, setSecondPanelView] = useState<'achievements' | 'statistics' | 'leaderboard'>('achievements');
  const [mobileActiveTab, setMobileActiveTab] = useState<'stats' | 'upgrades' | 'rebirth' | 'gems' | 'achievements' | 'statistics' | 'leaderboard' | 'settings' | 'dev' | 'trader' | 'prestige'>('stats');
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnimationSettingsOpen, setIsAnimationSettingsOpen] = useState(false);
  const [hoveredRune, setHoveredRune] = useState<number | null>(null);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [isTraderOpen, setIsTraderOpen] = useState(false);
  const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);
  const [isGoldSkillTreeOpen, setIsGoldSkillTreeOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [packResults, setPackResults] = useState<PackResult[] | null>(null);
  const [totalPacksOpened, setTotalPacksOpened] = useState<number>(0);
  const [actualRuneCounts, setActualRuneCounts] = useState<number[] | null>(null);
  const [isCraftingSecret, setIsCraftingSecret] = useState<'single' | 'all' | false>(false);
  
  // Handle multi-pack purchase with animation
  const handleBuyRunePacks = React.useCallback((count: number) => {
    try {
      console.log('Buying', count, 'packs...');
      const results: PackResult[] = [];
      
      // Call openRunePack with count parameter and request results
      const packOpenResults = openRunePack(count, true);
      console.log('Pack open results:', packOpenResults);
      
      if (packOpenResults && Array.isArray(packOpenResults) && packOpenResults.length > 0) {
        // Convert results to PackResult format
        packOpenResults.forEach((result: any) => {
          if (result && result.rarity && typeof result.bonus === 'number') {
            results.push({
              rarity: result.rarity as any,
              bonus: result.bonus,
              bonusType: result.bonusType,
              producing: result.producing,
              bonuses: result.bonuses || [],
              elementType: result.elementType,
              index: result.index
            });
          }
        });
        
        console.log('Converted results:', results);
        
        // Show pack opening animation only if enabled and we have valid results
        if (results.length > 0 && !gameState.disablePackAnimations) {
          console.log('Setting pack results to show animation');
          setPackResults(results);
          setTotalPacksOpened(count);
          // Extract actual counts if available (for large pack purchases)
          setActualRuneCounts((packOpenResults as any).__actualCounts || null);
        } else if (gameState.disablePackAnimations) {
          console.log('Pack animations disabled, skipping animation');
        } else {
          console.log('No valid results to show');
        }
      } else {
        console.log('No pack results or empty array');
      }
    } catch (error) {
      console.error('Error buying rune packs:', error);
    }
  }, [openRunePack, gameState.disablePackAnimations]);
  
  const closePackAnimation = React.useCallback(() => {
    setPackResults(null);
    setActualRuneCounts(null);
  }, []);
  
  // Trader auto-refresh timer
  React.useEffect(() => {
    // Only start timer if player has at least one elemental rune
    const hasAnyElementalRune = gameState.elementalRunes.some(amount => amount > 0);
    if (!hasAnyElementalRune) return;

    const now = Date.now();
    const nextRefresh = gameState.traderNextRefresh || 0;

    // Initialize trader if not yet done
    if (!gameState.traderOffers || gameState.traderOffers.length === 0) {
      const newOffers = generateRandomOffers(3);
      const refreshInterval = Math.random() * (10 * 60 * 1000) + (5 * 60 * 1000); // 5-15 minutes
      
      setGameState(prev => ({
        ...prev,
        traderOffers: newOffers.map((o: any) => o.id),
        traderLastRefresh: now,
        traderNextRefresh: now + refreshInterval
      }));
      return;
    }

    // Check if it's time to refresh
    if (now >= nextRefresh) {
      const newOffers = generateRandomOffers(3);
      const refreshInterval = Math.random() * (10 * 60 * 1000) + (5 * 60 * 1000); // 5-15 minutes
      
      setGameState(prev => ({
        ...prev,
        traderOffers: newOffers.map((o: any) => o.id),
        traderLastRefresh: now,
        traderNextRefresh: now + refreshInterval
      }));
    }

    // Set up interval to check every minute
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const nextRefreshTime = gameState.traderNextRefresh || 0;
      
      if (currentTime >= nextRefreshTime) {
        const newOffers = generateRandomOffers(3);
        const refreshInterval = Math.random() * (10 * 60 * 1000) + (5 * 60 * 1000); // 5-15 minutes
        
        setGameState(prev => ({
          ...prev,
          traderOffers: newOffers.map((o: any) => o.id),
          traderLastRefresh: currentTime,
          traderNextRefresh: currentTime + refreshInterval
        }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [gameState.elementalRunes, gameState.traderNextRefresh]);
  
  // Check if rebirth is unlocked
  const isRebirthUnlocked = gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0);
  
  // Reset to upgrades if rebirth becomes locked
  React.useEffect(() => {
    if (!isRebirthUnlocked && activePanel === 'rebirth') {
      setActivePanel('upgrades');
    }
  }, [isRebirthUnlocked, activePanel]);
  
  // Prüfe ob beide Unlock-Upgrades gekauft wurden
  const bothUnlocksOwned = gameState.upgradeAmounts[4] > 0 && gameState.rebirth_upgradeAmounts[3] > 0;

  // Calculate total rune bonuses
  const calculateRuneBonuses = () => {
    let totalMoneyBonus = 0;
    let totalRpBonus = 0;
    let totalGemBonus = 0;

    gameState.runes.forEach((amount, index) => {
      const rune = RUNES_1[index];
      if (amount > 0) {
        totalMoneyBonus += (rune.moneyBonus || 0) * amount;
        totalRpBonus += (rune.rpBonus || 0) * amount;
        totalGemBonus += (rune.gemBonus || 0) * amount;
      }
    });

    return { totalMoneyBonus, totalRpBonus, totalGemBonus };
  };

  // Calculate elemental production stats
  const calculateElementalStats = () => {
    const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
    const elementalStats = RUNES_2.map((rune, index) => ({
      name: rune.producing || 'Unknown',
      color: rune.color,
      totalProducing: gameState.elementalRunes[index] * (rune.produceAmount || 0) * goldSkillBonuses.elementalGainMultiplier,
      currentAmount: gameState.elementalResources[index] || 0,
      runeCount: gameState.elementalRunes[index]
    }));
    
    return elementalStats;
  };

  const runeBonuses = calculateRuneBonuses();
  const elementalStats = calculateElementalStats();
  const currentRunes = gameState.currentRuneType === 'basic' ? RUNES_1 : RUNES_2;
  const currentRuneAmounts = gameState.currentRuneType === 'basic' ? gameState.runes : gameState.elementalRunes;
  
  // Check if player can craft Secret Rune (1 of each Basic & Elemental Rune)
  const canCraftSecretRune = 
    gameState.runes.slice(0, 6).every(amount => amount >= 1) && 
    gameState.elementalRunes.slice(0, 6).every(amount => amount >= 1);
  
  // Check how many Secret Runes can be crafted
  const maxCraftableSecretRunes = Math.min(
    ...gameState.runes.slice(0, 6),
    ...gameState.elementalRunes.slice(0, 6)
  );
  
  // Check if elemental runes have ever been unlocked (permanent unlock)
  const hasElementalRunes = gameState.elementalRunesUnlocked;

  // Handle rebirth with flash effect
  const handleRebirth = () => {
    setIsFlashing(true);
    performRebirth();
    setTimeout(() => setIsFlashing(false), 800);
  };

  // Handle trader offer acceptance
  const handleAcceptTraderOffer = (offer: TraderOffer) => {
    // Support bulk trades
    const bulkAmount = (offer as any).bulkAmount ?? 1;
    const totalElementCost = offer.elementAmount * bulkAmount;
    const currentAmount = gameState.elementalResources[offer.elementType] || 0;
    if (currentAmount < totalElementCost || bulkAmount < 1) {
      console.error('Not enough resources for bulk trade');
      return;
    }

    // Deduct total element cost
    const newResources = [...gameState.elementalResources];
    newResources[offer.elementType] -= totalElementCost;

    // Apply rewards in bulk
    let newState = { ...gameState, elementalResources: newResources };
    switch (offer.rewardType) {
      case 'gems':
        newState.gems += offer.rewardAmount * bulkAmount;
        break;
      case 'rp':
        newState.rebirthPoints += offer.rewardAmount * bulkAmount;
        break;
      case 'money':
        newState.money += offer.rewardAmount * bulkAmount;
        break;
      case 'rune':
        if (offer.rewardRuneId !== undefined) {
          const newRunes = [...newState.runes];
          newRunes[offer.rewardRuneId] += offer.rewardAmount * bulkAmount;
          newState.runes = newRunes;
        }
        break;
    }

    setGameState(newState);
  };

  // Get current trader offers
  const getCurrentTraderOffers = (): TraderOffer[] => {
    const offerIds = gameState.traderOffers || [];
    return TRADER_OFFERS.filter(o => offerIds.includes(o.id));
  };

  // Handle elemental prestige
  const handleElementalPrestige = (elementId: number) => {
    const prestigeLevels = gameState.elementalPrestige || {
      air: 0,
      earth: 0,
      water: 0,
      fire: 0,
      light: 0,
      dark: 0
    };

    // Reset element resource to 0 and increase prestige level
    const newResources = [...gameState.elementalResources];
    newResources[elementId] = 0;

    const elementNames = ['air', 'earth', 'water', 'fire', 'light', 'dark'] as const;
    const elementName = elementNames[elementId];

    const newPrestige = {
      ...prestigeLevels,
      [elementName]: prestigeLevels[elementName] + 1
    };

    setGameState({
      ...gameState,
      elementalResources: newResources,
      elementalPrestige: newPrestige
    });
  };

  // Handle elemental conversion
  const handleElementalConvert = (fromIndex: number, toIndex: number, amount: number) => {
    if (gameState.elementalResources[fromIndex] < amount || fromIndex === toIndex) {
      return;
    }

    const convertedAmount = Math.floor(amount * 0.8); // 80% conversion rate
    const newResources = [...gameState.elementalResources];
    newResources[fromIndex] -= amount;
    newResources[toIndex] += convertedAmount;

    setGameState({
      ...gameState,
      elementalResources: newResources
    });
  };

  // Console Commands für Developer/Cheat Funktionen
  React.useEffect(() => {
    // Füge Console-Befehle zum globalen Window-Objekt hinzu
    (window as any).MoneyClicker = {
      // Hauptbefehl: give
      give: (thing: string, ...args: any[]) => {
        const thingLower = thing.toLowerCase();
        
        switch(thingLower) {
          case 'money': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give money {number}');
              return;
            }
            console.log(`💰 Giving ${amount} money`);
            devAddMoneyDirect(amount);
            break;
          }
          
          case 'rp': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give rp {number}');
              return;
            }
            console.log(`🔄 Giving ${amount} Rebirth Points`);
            for(let i = 0; i < amount; i++) devAddRebirthPoint();
            break;
          }
          
          case 'gem':
          case 'gems': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give gem {number}');
              return;
            }
            console.log(`💎 Giving ${amount} gems`);
            for(let i = 0; i < amount; i++) devAddGem();
            break;
          }
          
          case 'clicks':
          case 'click': {
            const amount = args[0];
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give clicks {number}');
              return;
            }
            console.log(`👆 Giving ${amount} total clicks`);
            for(let i = 0; i < Math.ceil(amount / 100); i++) devAddClick();
            break;
          }
          
          case 'runes':
          case 'rune': {
            const runeType = args[0]; // 'basic' or 'elemental'
            const rarity = args[1];
            const amount = args[2] || 1;
            
            if (!runeType || !['basic', 'elemental'].includes(runeType.toLowerCase())) {
              console.error('❌ Usage: give runes {type} {rarity} {number}');
              console.error('Types: basic, elemental');
              console.error('Basic rarities: 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary, 6=Mythic, 7=Secret');
              console.error('Elemental rarities: 1=Air, 2=Earth, 3=Water, 4=Fire, 5=Light, 6=Dark');
              return;
            }
            
            if (typeof rarity !== 'number' || rarity < 1) {
              console.error('❌ Invalid rarity number');
              return;
            }
            
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give runes {type} {rarity} {number}');
              return;
            }
            
            if (runeType.toLowerCase() === 'basic') {
              if (rarity > 7) {
                console.error('❌ Basic runes only go up to 7 (Secret Rune)');
                return;
              }
              const runeIndex = rarity - 1;
              const rarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Secret'];
              console.log(`🎲 Giving ${amount}x ${rarityNames[runeIndex]} basic runes`);
              for(let i = 0; i < amount; i++) devAddRune(runeIndex);
            } else if (runeType.toLowerCase() === 'elemental') {
              if (rarity > 6) {
                console.error('❌ Elemental runes only go up to 6 (Dark)');
                return;
              }
              const runeIndex = rarity - 1;
              const elementNames = ['Air', 'Earth', 'Water', 'Fire', 'Light', 'Dark'];
              console.log(`⚡ Giving ${amount}x ${elementNames[runeIndex]} elemental runes`);
              for(let i = 0; i < amount; i++) devAddElementalRune(runeIndex);
            }
            break;
          }
          
          case 'materials': {
            const runeName = args[0];
            const amount = args[1] || 1;
            
            if (!runeName || typeof runeName !== 'string') {
              console.error('❌ Usage: give materials {runeName} {amount}');
              console.error('Available: "secret rune"');
              return;
            }
            
            if (typeof amount !== 'number' || amount <= 0) {
              console.error('❌ Usage: give materials {runeName} {amount}');
              return;
            }
            
            if (runeName.toLowerCase() === 'secret rune') {
              console.log(`🌑 Giving materials to craft ${amount}x Secret Rune`);
              console.log(`   - Giving ${amount}x of each Basic Rune (Common to Mythic)`);
              console.log(`   - Giving ${amount}x of each Elemental Rune (Air to Dark)`);
              
              // Give all basic runes (0-5: Common to Mythic)
              for (let runeIndex = 0; runeIndex < 6; runeIndex++) {
                for (let i = 0; i < amount; i++) {
                  devAddRune(runeIndex);
                }
              }
              
              // Give all elemental runes (0-5: Air to Dark)
              for (let runeIndex = 0; runeIndex < 6; runeIndex++) {
                for (let i = 0; i < amount; i++) {
                  devAddElementalRune(runeIndex);
                }
              }
            } else {
              console.error(`❌ Unknown rune: ${runeName}. Available: "secret rune"`);
            }
            break;
          }
          
          default:
            console.error(`❌ Unknown item: ${thing}. Use: money, rp, gem, clicks, runes, materials`);
            (window as any).MoneyClicker.help();
        }
      },
      
      // Legacy-Befehle (für Rückwärtskompatibilität)
      addMoney: (amount: number) => {
        console.warn('⚠️ Deprecated: Use "give money {amount}" instead');
        (window as any).MoneyClicker.give('money', amount);
      },
      addRP: (amount: number) => {
        console.warn('⚠️ Deprecated: Use "give rp {amount}" instead');
        (window as any).MoneyClicker.give('rp', amount);
      },
      addGems: (amount: number) => {
        console.warn('⚠️ Deprecated: Use "give gem {amount}" instead');
        (window as any).MoneyClicker.give('gem', amount);
      },
      addRune: (runeIndex: number, amount: number = 1) => {
        console.warn('⚠️ Deprecated: Use "give runes basic {rarity} {amount}" instead');
        if (runeIndex >= 0 && runeIndex <= 6) {
          (window as any).MoneyClicker.give('runes', 'basic', runeIndex + 1, amount);
        } else {
          console.error('❌ Invalid rune index. Use 0-6 for basic runes');
        }
      },
      
      // Click-Befehle
      addClicks: (amount: number) => {
        console.log(`👆 Adding ${amount} total clicks`);
        for(let i = 0; i < amount; i++) devAddClick();
      },
      
      // Effekt-Befehle
      toggleMoneyEffects: () => {
        const newState = !gameState.disableMoneyEffects;
        console.log(`💰 Money effects ${newState ? 'DISABLED' : 'ENABLED'}`);
        toggleMoneyEffects();
      },
      
      toggleDiamondEffects: () => {
        const newState = !gameState.disableDiamondEffects;
        console.log(`💎 Diamond effects ${newState ? 'DISABLED' : 'ENABLED'}`);
        toggleDiamondEffects();
      },
      
      // Spiel-Befehle
      rebirth: () => {
        console.log('🔄 Performing rebirth');
        performRebirth();
      },
      reset: () => {
        console.log('🔥 Resetting game');
        resetGame();
      },
      
      // Info-Befehle
      gameState: () => {
        console.log('📊 Current game state:', gameState);
        return gameState;
      },
      help: () => {
        console.log(`
🎮 Money Clicker Console Commands:

🎯 MAIN COMMAND (give):
  MoneyClicker.give("money", amount)                       - Give money
  MoneyClicker.give("rp", amount)                          - Give Rebirth Points  
  MoneyClicker.give("gem", amount)                         - Give gems
  MoneyClicker.give("clicks", amount)                      - Give total clicks
  MoneyClicker.give("runes", type, rarity, amount)         - Give runes
  MoneyClicker.give("materials", "secret rune", amount)    - Give materials to craft Secret Rune

🎲 Rune Types & Rarities:
  BASIC RUNES:
    1 = Common      4 = Epic       7 = Secret
    2 = Uncommon    5 = Legendary  
    3 = Rare        6 = Mythic
  
  ELEMENTAL RUNES:
    1 = Air         4 = Fire
    2 = Earth       5 = Light
    3 = Water       6 = Dark

👆 Other Commands:
  MoneyClicker.rebirth()               - Perform rebirth
  MoneyClicker.reset()                 - Reset entire game
  MoneyClicker.gameState()             - Show current game state
  MoneyClicker.toggleMoneyEffects()    - Toggle money floating animations
  MoneyClicker.toggleDiamondEffects()  - Toggle diamond floating animations
  MoneyClicker.help()                  - Show this help

📝 Examples:
  MoneyClicker.give("money", 1000000)                  // Give 1M money
  MoneyClicker.give("rp", 100)                         // Give 100 RP
  MoneyClicker.give("gem", 50)                         // Give 50 gems
  MoneyClicker.give("clicks", 1000)                    // Give 1000 clicks
  MoneyClicker.give("runes", "basic", 6, 5)            // 5x Mythic basic runes
  MoneyClicker.give("runes", "basic", 7, 1)            // 1x Secret rune
  MoneyClicker.give("runes", "elemental", 1, 10)       // 10x Air runes
  MoneyClicker.give("runes", "elemental", 5, 3)        // 3x Light runes
  MoneyClicker.give("materials", "secret rune", 2)     // Materials for 2x Secret Rune crafts
  MoneyClicker.toggleMoneyEffects()                    // Disable/enable money animations
  MoneyClicker.toggleDiamondEffects()                  // Disable/enable diamond animations
        `);
      }
    };

    // Cleanup beim unmount
    return () => {
      delete (window as any).MoneyClicker;
    };
  }, [gameState, devAddMoney, devAddMoneyDirect, devAddRebirthPoint, devAddGem, devAddClick, devAddRune, devAddElementalRune, performRebirth, resetGame, toggleMoneyEffects, toggleDiamondEffects]);

  // Get active event background
  const activeEvent = gameState.activeEvent ? EVENT_CONFIG.find(e => e.id === gameState.activeEvent) : null;
  const appStyle = activeEvent 
    ? { background: activeEvent.backgroundGradient, transition: 'background 2s ease' }
    : {};

  // Show loading screen while data is being fetched from Firebase
  if (isLoading) {
    return (
      <div className="app" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>💰</div>
          <div>Loading Money Clicker...</div>
          <div style={{ fontSize: '16px', marginTop: '10px', opacity: 0.8 }}>
            Fetching your data from cloud...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={appStyle}>
      {/* Multi-Instance Warning */}
      <MultiInstanceWarning userId={getUserId()} />
      
      {/* Performance Monitor - Toggle with Ctrl+Shift+P */}
      <PerformanceMonitor />
      
      {/* Flash overlay for rebirth effect */}
      {isFlashing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(124, 58, 237, 0.8) 100%)',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'rebirthFlash 0.8s ease-out forwards'
        }} />
      )}
      
      {/* Event Notification */}
      <EventNotification 
        eventId={gameState.activeEvent as any}
        eventEndTime={gameState.eventEndTime || null}
      />
      
      <header className="app-header">
        <h1>💰 Money Clicker</h1>
        <p>Click to earn money, buy upgrades, and grow your fortune!</p>
        
        {/* Settings Button (Top Right) - Hidden on Mobile */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="desktop-only-button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
        >
          <span style={{
            fontSize: '28px',
            color: 'white',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
          }}>⚙️</span>
        </button>

        {/* Dev Icon (next to Settings) - Only in Development Mode */}
        {import.meta.env.DEV && (
          <button
            onClick={() => setIsDevOpen(true)}
            className="desktop-only-button"
            style={{
              position: 'absolute',
              top: '20px',
              right: '78px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: '2px solid #b45309',
              borderRadius: '12px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
            }}
          >
            <span style={{
              fontSize: '28px',
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
            }}>🛠️</span>
          </button>
        )}
      </header>
      
      {/* Settings Menu */}
      <SettingsMenu 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onReset={resetGame}
        onOpenAnimationSettings={() => setIsAnimationSettingsOpen(true)}
        disableMoneyEffects={gameState.disableMoneyEffects || false}
        disableDiamondEffects={gameState.disableDiamondEffects || false}
        disablePackAnimations={gameState.disablePackAnimations || false}
        disableCraftAnimations={gameState.disableCraftAnimations || false}
        username={gameState.username || 'Player'}
        onUsernameChange={(newUsername) => setGameState(prev => ({ ...prev, username: newUsername }))}
        onManualSave={manualSave}
      />

      {/* Animation Settings Modal */}
      <SettingsModal
        isOpen={isAnimationSettingsOpen}
        onClose={() => setIsAnimationSettingsOpen(false)}
        disableMoneyEffects={gameState.disableMoneyEffects || false}
        disableDiamondEffects={gameState.disableDiamondEffects || false}
        disablePackAnimations={gameState.disablePackAnimations || false}
        disableCraftAnimations={gameState.disableCraftAnimations || false}
        onToggleMoneyEffects={(disabled) => setGameState(prev => ({ ...prev, disableMoneyEffects: disabled }))}
        onToggleDiamondEffects={(disabled) => setGameState(prev => ({ ...prev, disableDiamondEffects: disabled }))}
        onTogglePackAnimations={(disabled) => setGameState(prev => ({ ...prev, disablePackAnimations: disabled }))}
        onToggleCraftAnimations={(disabled) => setGameState(prev => ({ ...prev, disableCraftAnimations: disabled }))}
        onManualSave={manualSave}
      />
      
      {/* Offline Progress Modal */}
      <OfflineProgressModal
        isOpen={offlineProgress !== null}
        onClose={claimOfflineProgress}
        offlineTime={offlineProgress?.time || 0}
        moneyEarned={offlineProgress?.money || 0}
      />

      {/* Dev Modal */}
      <DevModal
        isOpen={isDevOpen}
        onClose={() => setIsDevOpen(false)}
        gameState={gameState}
        setGameState={setGameState}
        devSimulateOfflineTime={devSimulateOfflineTime}
        setOfflineProgress={setOfflineProgress}
        onOpenTrader={() => setIsTraderOpen(true)}
      />

      {/* Elemental Trader Modal */}
      <ElementalTraderModal
        isOpen={isTraderOpen}
        onClose={() => setIsTraderOpen(false)}
        offers={getCurrentTraderOffers()}
        gameState={gameState}
        onAcceptOffer={handleAcceptTraderOffer}
      />

      {/* Elemental Prestige Modal */}
      <ElementalPrestigeModal
        isOpen={isPrestigeOpen}
        onClose={() => setIsPrestigeOpen(false)}
        gameState={gameState}
        onPrestige={handleElementalPrestige}
      />

      {/* Gold Skill Tree Modal */}
      <GoldSkillTreeModal
        isOpen={isGoldSkillTreeOpen}
        onClose={() => setIsGoldSkillTreeOpen(false)}
        skills={gameState.goldSkills || []}
        availableGoldRP={gameState.goldRP || 0}
        onUnlockSkill={unlockGoldSkill}
      />

      {/* Secret Rune Craft Animation */}
      {(isCraftingSecret === 'single' || isCraftingSecret === 'all') && !gameState.disableCraftAnimations && (
        <SecretRuneCraftAnimation
          mode={isCraftingSecret}
          count={isCraftingSecret === 'all' ? maxCraftableSecretRunes : 1}
          onComplete={() => {
            if (isCraftingSecret === 'all') {
              craftSecretRune(maxCraftableSecretRunes);
            } else if (isCraftingSecret === 'single') {
              craftSecretRune(1);
            }
            setIsCraftingSecret(false);
          }}
        />
      )}

      {/* Instant craft if animations disabled */}
      {(isCraftingSecret === 'single' || isCraftingSecret === 'all') && gameState.disableCraftAnimations && (() => {
        if (isCraftingSecret === 'all') {
          craftSecretRune(maxCraftableSecretRunes);
        } else if (isCraftingSecret === 'single') {
          craftSecretRune(1);
        }
        setIsCraftingSecret(false);
        return null;
      })()}

      <main className="game-container">
        {/* Desktop Layout */}
        <div className="desktop-layout">
          {/* Gem Panel - Permanent, wenn beide Unlocks gekauft */}
          {bothUnlocksOwned && (
            <div className="gem-panel" style={{
            minWidth: '320px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #3165f3ff 0%, #153ca7ff 30%, #000000ff 100%)',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #1d4ed8, #3b82f6, #60a5fa) 1',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            color: 'white',
            position: 'relative',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <h2 style={{ 
              color: '#60a5fa', 
              textAlign: 'center', 
              marginBottom: '24px',
              fontSize: '20px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(96, 165, 250, 0.5)',
              position: 'relative'
            }}>💎 Runes</h2>
            
            {/* Gems Display */}
            <div style={{ 
              marginBottom: '24px', 
              textAlign: 'center',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#60a5fa',
                textShadow: '0 0 8px rgba(96, 165, 250, 0.6)'
              }}>
                💎 {formatNumberGerman(gameState.gems)}
              </div>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Gems you own</div>
            </div>

            {/* Multi-Pack Purchase Buttons */}
            <div style={{ 
              marginBottom: '24px',
              background: 'rgba(147, 51, 234, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(147, 51, 234, 0.3)'
            }}>
              <h3 style={{
                color: '#9333ea',
                fontSize: '16px',
                fontWeight: 'bold',
                textShadow: '0 0 8px rgba(147, 51, 234, 0.5)',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                📦 {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Rune Packs
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                {[1, 'max'].map(count => {
                  const isMax = count === 'max';
                  const costPerPack = gameState.currentRuneType === 'basic' ? 5 : 250000;
                  const currency = gameState.currentRuneType === 'basic' ? gameState.gems : gameState.money;
                  const maxCount = isMax ? Math.floor(currency / costPerPack) : (count as number);
                  const totalCost = costPerPack * maxCount;
                  const canAfford = currency >= totalCost && maxCount > 0;
                  
                  return (
                    <button
                      key={count}
                      onClick={() => handleBuyRunePacks(maxCount)}
                      disabled={!canAfford}
                      style={{
                        padding: '14px 20px',
                        background: canAfford 
                          ? (isMax 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                            : 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)')
                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        border: canAfford 
                          ? (isMax ? '2px solid #fbbf24' : '2px solid #a855f7')
                          : '2px solid #6b7280',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        boxShadow: canAfford 
                          ? (isMax 
                            ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                            : '0 4px 12px rgba(147, 51, 234, 0.4)')
                          : '0 2px 6px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                        opacity: canAfford ? 1 : 0.5,
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (canAfford) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = isMax 
                            ? '0 6px 16px rgba(245, 158, 11, 0.6)'
                            : '0 6px 16px rgba(147, 51, 234, 0.6)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canAfford) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = isMax
                            ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                            : '0 4px 12px rgba(147, 51, 234, 0.4)';
                        }
                      }}
                    >
                      <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                        ✨ {isMax ? `${formatNumberGerman(maxCount)}x Packs (MAX)` : `${count}x Pack`} ✨
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.9 }}>
                        {gameState.currentRuneType === 'basic' 
                          ? `💎 ${formatNumberGerman(totalCost)} Gems`
                          : `💰 ${formatNumberGerman(totalCost)}$`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secret Rune Craft Buttons - nur sichtbar wenn alle Runen vorhanden */}
            {canCraftSecretRune && (
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Craft 1 Button */}
                <button
                  onClick={() => {
                    setIsCraftingSecret('single');
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #404040 0%, #1a1a1a 50%, #000000 100%)',
                    color: '#d4d4d4',
                    border: '2px solid #404040',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(64, 64, 64, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(64, 64, 64, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = '#606060';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(64, 64, 64, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = '#404040';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    animation: 'shimmer 3s infinite'
                  }} />
                  🌑 Craft 1x Secret Rune 🌑
                </button>

                {/* Craft All Button - nur sichtbar wenn mehr als 1 craftbar */}
                {maxCraftableSecretRunes > 1 && (
                  <button
                    onClick={() => {
                      setIsCraftingSecret('all');
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #606060 0%, #303030 50%, #1a1a1a 100%)',
                      color: '#ffffff',
                      border: '2px solid #808080',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 6px 20px rgba(128, 128, 128, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(128, 128, 128, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.borderColor = '#a0a0a0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(128, 128, 128, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.borderColor = '#808080';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shimmer 3s infinite'
                    }} />
                    🌑 Craft {formatNumberGerman(maxCraftableSecretRunes)}x Secret Runes (ALL) 🌑
                  </button>
                )}
              </div>
            )}

            {/* Rune Collection */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Rune Type Switch Button */}
              <button
                onClick={switchRuneType}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  background: `linear-gradient(135deg, ${
                    gameState.currentRuneType === 'basic'
                      ? '#1d4ed8 0%, #3b82f6 50%, #60a5fa 100%'
                      : '#7c3aed 0%, #a855f7 50%, #c084fc 100%'
                  })`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0,0,0,0.3)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                <div style={{ position: 'relative', zIndex: 1 }}>
                  🎲 {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Rune Collection
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                    Click to switch • {gameState.currentRuneType === 'basic' ? 'Showing Basic Runes' : 'Showing Elemental Runes'}
                  </div>
                </div>
                {/* Animated background effect */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: gameState.currentRuneType === 'basic' ? '-100%' : '0%',
                  width: '100%',
                  height: '2px',
                  background: 'rgba(255,255,255,0.6)',
                  transition: 'left 0.3s ease',
                  transform: 'translateY(-50%)'
                }} />
              </button>
              
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                paddingRight: '8px'
              }}>
                {currentRunes.map((rune: Rune, index: number) => {
                  const runeAmount = currentRuneAmounts[index];
                  const individualBonuses = [];
                  
                  // Calculate modified drop rate with Fire Prestige (only for basic runes)
                  const isBasicRunes = gameState.currentRuneType === 'basic';
                  const firePrestigeLevel = gameState.elementalPrestige?.fire || 0;
                  const luckBonus = isBasicRunes && firePrestigeLevel > 0 ? 1 + (firePrestigeLevel * 0.01) : 1;
                  
                  // Calculate Gold Skill bonuses
                  const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
                  
                  // Calculate Fortune's Favor bonus
                  const fortuneFavorBonus = goldSkillBonuses.runeChanceBonus;
                  
                  let displayedDropRate = rune.dropRate / 10; // Convert to percentage
                  
                  // Secret Rune never drops from packs
                  if (rune.dropRate === 0) {
                    displayedDropRate = 0;
                  } else if (isBasicRunes && (luckBonus > 1 || fortuneFavorBonus > 0)) {
                    // Calculate modified rate like in openRunePack
                    const runesWithDrops = currentRunes.filter(r => r.dropRate > 0);
                    const maxIndex = runesWithDrops.length - 1;
                    
                    // Find this rune's position among droppable runes
                    const droppableIndex = runesWithDrops.findIndex(r => r.id === rune.id);
                    const rarityFactor = droppableIndex / maxIndex;
                    
                    // Apply both Fire Ascension and Fortune's Favor
                    const combinedLuckBonus = luckBonus * (1 + fortuneFavorBonus);
                    
                    const luckFactor = (rarityFactor * 2) - 0.5;
                    const adjustment = (combinedLuckBonus - 1) * luckFactor * 2.0;
                    const modifiedRate = Math.max(1, rune.dropRate * (1 + adjustment));
                    
                    // Normalize to get actual percentage
                    const allModifiedRates = currentRunes.map((r) => {
                      if (r.dropRate === 0) return 0;
                      const dIndex = runesWithDrops.findIndex(rd => rd.id === r.id);
                      const rf = dIndex / maxIndex;
                      const lf = (rf * 2) - 0.5;
                      const adj = (combinedLuckBonus - 1) * lf * 2.0;
                      return Math.max(1, r.dropRate * (1 + adj));
                    });
                    const totalRate = allModifiedRates.reduce((sum, rate) => sum + rate, 0);
                    displayedDropRate = (modifiedRate / totalRate) * 100;
                  }
                  
                  if (rune.moneyBonus && runeAmount > 0) {
                    const baseBonus = (rune.moneyBonus * runeAmount) * 100;
                    const totalBonus = baseBonus * goldSkillBonuses.clickPowerMultiplier;
                    individualBonuses.push(`💰 +${formatNumberGerman(totalBonus, 2)}% Money`);
                  }
                  if (rune.rpBonus && runeAmount > 0) {
                    const baseBonus = (rune.rpBonus * runeAmount) * 100;
                    const totalBonus = baseBonus * goldSkillBonuses.rpGainMultiplier;
                    individualBonuses.push(`🔄 +${formatNumberGerman(totalBonus, 2)}% Rebirth Points`);
                  }
                  if (rune.gemBonus && runeAmount > 0) {
                    const baseBonus = (rune.gemBonus * runeAmount) * 100;
                    const totalBonus = baseBonus * goldSkillBonuses.gemGainMultiplier;
                    individualBonuses.push(`💎 +${formatNumberGerman(totalBonus, 3)}% Gem Chance`);
                  }
                  if (rune.producing && runeAmount > 0) {
                    individualBonuses.push(`⚡ Produces ${formatNumberGerman((rune.produceAmount || 0) * runeAmount, 0)} ${rune.producing}/tick`);
                  }
                  
                  return (
                  <div 
                    key={rune.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '12px',
                      background: runeAmount > 0 
                        ? `linear-gradient(135deg, ${rune.color}20, ${rune.color}10)` 
                        : 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      border: runeAmount > 0 
                        ? `1px solid ${rune.color}60` 
                        : '1px solid rgba(255,255,255,0.1)',
                      opacity: runeAmount > 0 ? 1 : 0.6,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      cursor: runeAmount > 0 ? 'help' : 'default',
                      transform: hoveredRune === index ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setHoveredRune(index)}
                    onMouseLeave={() => setHoveredRune(null)}
                  >
                    {runeAmount > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: `linear-gradient(135deg, ${rune.color}15, transparent)`,
                        pointerEvents: 'none'
                      }} />
                    )}
                    <div style={{ zIndex: 1 }}>
                      <div style={{ 
                        color: rune.color, 
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>
                        {rune.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: runeAmount > 0 ? '#e5e7eb' : '#9ca3af'
                      }}>
                        Amount: {formatNumberGerman(runeAmount)}x
                      </div>
                      {/* Merge Buttons - nur für Basic Runes und wenn genug vorhanden */}
                      {gameState.currentRuneType === 'basic' && runeAmount >= 3 && index < 5 && (
                        <div style={{ 
                          marginTop: '6px', 
                          display: 'flex', 
                          gap: '4px', 
                          flexWrap: 'wrap'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              mergeRunes(index);
                            }}
                            style={{
                              padding: '3px 6px',
                              fontSize: '9px',
                              background: `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`,
                              border: `1px solid ${rune.color}`,
                              borderRadius: '3px',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '45px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}60, ${rune.color}40)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`;
                            }}
                          >
                            🔄 3→1
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              mergeAllRunes(index);
                            }}
                            style={{
                              padding: '3px 6px',
                              fontSize: '9px',
                              background: `linear-gradient(135deg, ${rune.color}60, ${rune.color}30)`,
                              border: `1px solid ${rune.color}`,
                              borderRadius: '3px',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minWidth: '45px',
                              fontWeight: 'bold'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}80, ${rune.color}50)`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.background = `linear-gradient(135deg, ${rune.color}60, ${rune.color}30)`;
                            }}
                            title={`Merge all possible (${Math.floor(runeAmount / 3)} merges)`}
                          >
                            ⚡ ALL
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#3b82f6',
                      textAlign: 'right',
                      zIndex: 1
                    }}>
                      <div>
                        {displayedDropRate.toFixed(1)}%
                        {isBasicRunes && (luckBonus > 1 || fortuneFavorBonus > 0) && rune.dropRate > 0 && (
                          <span style={{ 
                            fontSize: '10px', 
                            color: luckBonus > 1 && fortuneFavorBonus > 0 ? '#fbbf24' : 
                                   luckBonus > 1 ? '#fb923c' : '#8b5cf6',
                            marginLeft: '4px'
                          }}>
                            {luckBonus > 1 && fortuneFavorBonus > 0 ? '🔥🎯' : 
                             luckBonus > 1 ? '🔥' : '🎯'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>Drop Rate</div>
                    </div>
                    
                    {/* Hover Tooltip - Desktop only */}
                    {hoveredRune === index && runeAmount > 0 && individualBonuses.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-100%)',
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        border: `2px solid ${rune.color}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${rune.color}40`,
                        zIndex: 1000,
                        minWidth: '200px',
                        backdropFilter: 'blur(10px)',
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          color: rune.color,
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '8px',
                          textAlign: 'center',
                          textShadow: `0 0 8px ${rune.color}`
                        }}>
                          ✨ Active Effects ✨
                        </div>
                        {individualBonuses.map((bonus, bonusIndex) => (
                          <div key={bonusIndex} style={{
                            color: '#e2e8f0',
                            fontSize: '12px',
                            marginBottom: '4px',
                            padding: '4px 8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px'
                          }}>
                            {bonus}
                          </div>
                        ))}
                        <div style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0',
                          height: '0',
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `8px solid ${rune.color}`
                        }} />
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Active Bonuses */}
            {(runeBonuses.totalMoneyBonus > 0 || runeBonuses.totalRpBonus > 0 || runeBonuses.totalGemBonus > 0) && (() => {
              const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
              const totalMoneyWithGoldSkills = runeBonuses.totalMoneyBonus * goldSkillBonuses.clickPowerMultiplier;
              const totalRpWithGoldSkills = runeBonuses.totalRpBonus * goldSkillBonuses.rpGainMultiplier;
              const totalGemWithGoldSkills = runeBonuses.totalGemBonus * goldSkillBonuses.gemGainMultiplier;
              const totalRuneChanceBonus = goldSkillBonuses.runeChanceBonus;
              
              return (
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                marginTop: '16px'
              }}>
                <div style={{ 
                  color: '#60a5fa', 
                  fontWeight: 'bold', 
                  marginBottom: '12px',
                  fontSize: '16px',
                  textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚡ Activ Bonus
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {runeBonuses.totalMoneyBonus > 0 && (
                    <div style={{ 
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span>💰</span>
                      <span>+{formatNumberGerman(totalMoneyWithGoldSkills * 100, 2)}% Money</span>
                    </div>
                  )}
                  {runeBonuses.totalRpBonus > 0 && (
                    <div style={{ 
                      color: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <span>🔄</span>
                      <span>+{formatNumberGerman(totalRpWithGoldSkills * 100, 2)}% Rebirth Points</span>
                    </div>
                  )}
                  {runeBonuses.totalGemBonus > 0 && (
                    <div style={{ 
                      color: '#F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <span>💎</span>
                      <span>+{formatNumberGerman(totalGemWithGoldSkills * 100, 3)}% Gem Chance</span>
                    </div>
                  )}
                  {totalRuneChanceBonus > 0 && (
                    <div style={{ 
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                      <span>🎯</span>
                      <span>+{formatNumberGerman(totalRuneChanceBonus * 100, 1)}% Rune Chance</span>
                    </div>
                  )}
                </div>
              </div>
              );
            })()}
          </div>
        )}

          <div className="left-panel">
          {/* Normale Stats - nur anzeigen wenn Elemental Stats nicht aktiv sind */}
          {!gameState.showElementalStats && (
            <GameStats 
              gameState={gameState}
              onOpenGoldSkillTree={() => setIsGoldSkillTreeOpen(true)}
            />
          )}

          {/* Elemental Stats Panel - ersetzt normale Stats wenn aktiv */}
          {gameState.showElementalStats && hasElementalRunes && (
            <div className="elemental-stats-panel" style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
              border: '2px solid #64748b',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(15, 23, 42, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: 'white',
              marginBottom: '20px'
            }}>
              <h3 style={{
                color: '#c084fc',
                textAlign: 'center',
                marginBottom: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(192, 132, 252, 0.5)'
              }}>⚡ Elemental Production</h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '16px'
              }}>
                {elementalStats.map((stat, index) => {
                  // Calculate achievement bonus
                  const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
                  const achievementMultiplier = 1 + totalAchievementTiers * 0.01; // 1% per tier
                  const productionWithBonus = stat.totalProducing * achievementMultiplier;
                  
                  // Konvertiere hex zu rgba
                  const hexToRgba = (hex: string, alpha: number) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  };
                  
                  return (
                  <div key={index} style={{
                    background: hexToRgba(stat.color, 0.2),
                    border: `2px solid ${hexToRgba(stat.color, 0.5)}`,
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    cursor: stat.runeCount > 0 ? 'help' : 'default',
                    opacity: stat.runeCount > 0 ? 1 : 0.6
                  }}>                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: stat.color,
                      marginBottom: '4px',
                      textShadow: `0 0 6px ${stat.color}`,
                      filter: 'brightness(1.3)'
                    }}>
                      {stat.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#f1f5f9',
                      marginBottom: '2px',
                      fontWeight: '500'
                    }}>
                      Stored: {formatNumberGerman(stat.currentAmount)}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#e2e8f0',
                      marginBottom: '2px',
                      fontWeight: '500'
                    }}>
                      +{formatNumberGerman(productionWithBonus)}/tick
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: stat.color,
                      opacity: 0.9,
                      filter: 'brightness(1.2)'
                    }}>
                      {formatNumberGerman(stat.runeCount)} rune{stat.runeCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Elemental Stats Button - appears when first elemental rune is obtained */}
          {hasElementalRunes && (
            <div className="Elemental-Stats-Switch" style={{ marginBottom: '16px' }}>
              <button
                onClick={toggleElementalStats}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: gameState.showElementalStats
                    ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)'
                    : 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0,0,0,0.3)',
                  boxShadow: gameState.showElementalStats
                    ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                    : '0 4px 12px rgba(107, 114, 128, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = gameState.showElementalStats
                    ? '0 6px 20px rgba(124, 58, 237, 0.4)'
                    : '0 6px 20px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = gameState.showElementalStats
                    ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                    : '0 4px 12px rgba(107, 114, 128, 0.3)';
                }}
              >
                <span>⚡</span>
                <span>{gameState.showElementalStats ? 'Hide' : 'Show'} Elemental Stats</span>
                <span style={{ 
                  fontSize: '12px', 
                  opacity: 0.8,
                  marginLeft: '4px'
                }}>
                  {gameState.showElementalStats ? '👁️' : '👁️‍🗨️'}
                </span>
              </button>
            </div>
          )}

          {(gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) && (
            <div className="Upgrade/Rebirth-Switch">
              <SwitchButton
                label1="Upgrades"
                label2="Rebirth"
                onSwitch={setActivePanel}
                activePanel={activePanel}
                showThirdButton={false}
                />
            </div>
          )}

          {/* Gold Skill Tree Button - permanently visible if player has ever earned Gold RP */}
          {gameState.goldRP >= 0 && (gameState.goldRP > 0 || gameState.goldSkills?.some(s => s.currentLevel > 0)) && (
            <button
              onClick={() => setIsGoldSkillTreeOpen(true)}
              style={{
                width: '100%',
                padding: '14px 20px',
                marginTop: '16px',
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)',
                border: '3px solid #fbbf24',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.35) 100%)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(251, 191, 36, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(251, 191, 36, 0.4)';
              }}
            >
              <span style={{ 
                fontSize: '24px',
                filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
              }}>🌟</span>
              <span style={{ 
                color: '#fbbf24',
                textShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
              }}>Gold Skill Tree</span>
              <span style={{ 
                color: '#f59e0b',
                fontSize: '18px',
                textShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
              }}>({gameState.goldRP})</span>
            </button>
          )}

          {/* Second Panel Switch Button - nach dem Switch Button und vor dem Money Button */}
          {(gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) && (
            <div className="Second-Panel-Switch" style={{ marginTop: '16px', marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(100, 116, 139, 0.3)'
              }}>
                <button
                  onClick={() => setSecondPanelView('achievements')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: secondPanelView === 'achievements'
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)'
                      : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(0,0,0,0.3)',
                    boxShadow: secondPanelView === 'achievements'
                      ? '0 2px 8px rgba(245, 158, 11, 0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🏆
                </button>
                <button
                  onClick={() => setSecondPanelView('statistics')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: secondPanelView === 'statistics'
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)'
                      : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(0,0,0,0.3)',
                    boxShadow: secondPanelView === 'statistics'
                      ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📊
                </button>
                <button
                  onClick={() => setSecondPanelView('leaderboard')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: secondPanelView === 'leaderboard'
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)'
                      : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(0,0,0,0.3)',
                    boxShadow: secondPanelView === 'leaderboard'
                      ? '0 2px 8px rgba(139, 92, 246, 0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  👑
                </button>
              </div>
            </div>
          )}

          {/* Elemental Trader Button - appears when player has elemental runes */}
          {hasElementalRunes && (
            <div className="Trader-Button" style={{ marginTop: '16px', marginBottom: '8px' }}>
              <button
                onClick={() => setIsTraderOpen(true)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)',
                  color: 'white',
                  border: '2px solid #6b21a8',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(0,0,0,0.5)',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)';
                }}
              >
                <span style={{ fontSize: '20px' }}>⚡</span>
                <span>Elemental Trader</span>
                <span style={{
                  fontSize: '12px',
                  opacity: 0.9,
                  background: 'rgba(0,0,0,0.3)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginLeft: 'auto'
                }}>
                  {gameState.traderOffers && gameState.traderOffers.length > 0 ? `${gameState.traderOffers.length} offers` : 'New!'}
                </span>
              </button>
            </div>
          )}

          {/* Elemental Converter Button - appears when Elemental Fusion is unlocked */}
          {hasElementalRunes && calculateGoldSkillBonuses(gameState.goldSkills || []).elementalFusionUnlocked && (
            <div className="Converter-Button" style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setIsConverterOpen(true)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                  color: 'white',
                  border: '2px solid #155e75',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(0,0,0,0.5)',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.4)';
                }}
              >
                <span style={{ fontSize: '20px' }}>🔮</span>
                <span>Elemental Converter</span>
                <span style={{
                  fontSize: '10px',
                  opacity: 0.9,
                  background: 'rgba(0,0,0,0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginLeft: 'auto'
                }}>
                  80% rate
                </span>
              </button>
            </div>
          )}

          {/* Elemental Prestige Active Bonuses Display */}
          {hasElementalRunes && gameState.elementalPrestige && Object.values(gameState.elementalPrestige).some(level => level > 0) && (
            <div style={{
              marginTop: '16px',
              marginBottom: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#60a5fa',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                ⚡ Active Prestige Bonuses
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
                fontSize: '11px'
              }}>
                {gameState.elementalPrestige.air > 0 && (
                  <div style={{ 
                    background: 'rgba(125, 211, 252, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(125, 211, 252, 0.4)',
                    color: '#7dd3fc'
                  }}>
                    💨 +{(gameState.elementalPrestige.air * 0.5).toFixed(1)}% Speed
                  </div>
                )}
                {gameState.elementalPrestige.earth > 0 && (
                  <div style={{ 
                    background: 'rgba(134, 239, 172, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(134, 239, 172, 0.4)',
                    color: '#86efac'
                  }}>
                    🌍 +{(gameState.elementalPrestige.earth * 2).toFixed(0)}% Income
                  </div>
                )}
                {gameState.elementalPrestige.water > 0 && (
                  <div style={{ 
                    background: 'rgba(96, 165, 250, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    color: '#60a5fa'
                  }}>
                    💧 +{(gameState.elementalPrestige.water * 1).toFixed(0)}% Click
                  </div>
                )}
                {gameState.elementalPrestige.fire > 0 && (
                  <div style={{ 
                    background: 'rgba(251, 146, 60, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(251, 146, 60, 0.4)',
                    color: '#fb923c'
                  }}>
                    🔥 +{(gameState.elementalPrestige.fire * 1).toFixed(0)}% Luck
                  </div>
                )}
                {gameState.elementalPrestige.light > 0 && (
                  <div style={{ 
                    background: 'rgba(253, 224, 71, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(253, 224, 71, 0.4)',
                    color: '#fde047'
                  }}>
                    ✨ +{(gameState.elementalPrestige.light * 1).toFixed(0)}% RP
                  </div>
                )}
                {gameState.elementalPrestige.dark > 0 && (
                  <div style={{ 
                    background: 'rgba(167, 139, 250, 0.2)', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid rgba(167, 139, 250, 0.4)',
                    color: '#a78bfa'
                  }}>
                    🌑 -{((1 - (1 / (1 + gameState.elementalPrestige.dark * 0.01))) * 100).toFixed(0)}% Cost
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Elemental Prestige Button - appears when player has elemental runes */}
          {hasElementalRunes && (
            <div className="Prestige-Button" style={{ marginTop: '16px', marginBottom: '16px' }}>
              <button
                onClick={() => setIsPrestigeOpen(true)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                  color: 'white',
                  border: '2px solid #b45309',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(0,0,0,0.5)',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 191, 36, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.4)';
                }}
              >
                <span style={{ fontSize: '20px' }}>✨</span>
                <span>Elemental Ascension</span>
              </button>
            </div>
          )}
          
          <div className="click-area">
            <MoneyButton 
              onClick={clickMoney} 
              gameState={gameState}
              onGemDrop={() => {
                // Optional: Add sound effect or additional visual feedback here
                // console.log('💎 Gem obtained!');
              }}
            />
          </div>

          <ActionButtons
            money={gameState.money}
            onRebirth={handleRebirth}
            onReset={resetGame}
            onCheat={cheatMoney}
            moneyPerClick={gameState.moneyPerClick}
            gameState={gameState}
          />
        </div>

        <div className="right-Upgrade-panel">
          {activePanel === 'upgrades' ? (
            <UpgradesPanel 
              gameState={gameState} 
              buyUpgrade={buyUpgrade}
              buyMaxUpgrades={buyMaxUpgrades}
            />
          ) : (gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) ? (
            <RebirthPanel
              gameState={gameState}
              buyRebirthUpgrade={buyRebirthUpgrade}
              buyMaxRebirthUpgrades={buyMaxRebirthUpgrades}
            />
          ) : (
            <UpgradesPanel 
              gameState={gameState} 
              buyUpgrade={buyUpgrade}
              buyMaxUpgrades={buyMaxUpgrades}
            />
          )}
        </div>
        
        {/* Second Panel - Achievements oder Statistics */}
        {(gameState.rebirthPoints > 0 || gameState.rebirth_upgradeAmounts.some(amount => amount > 0)) && (
          <div className="second-panel-container" style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '16px',
            padding: '12px',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            minWidth: '350px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
            width: '420px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {secondPanelView === 'achievements' ? (
              <AchievementsPanel 
                gameState={gameState} 
                checkAchievements={checkAchievements}
                setGameState={setGameState}
              />
            ) : secondPanelView === 'statistics' ? (
              <StatisticsPanel gameState={gameState} onToggleDevStats={toggleDevStats} />
            ) : (
              <LeaderboardPanel gameState={gameState} />
            )}
          </div>
        )}
        </div>

        {/* Mobile Layout */}
        <div className="mobile-layout">
          <MobileTabNavigation
            activeTab={mobileActiveTab}
            onTabChange={setMobileActiveTab}
            hasGems={bothUnlocksOwned}
            hasRebirth={isRebirthUnlocked}
            hasElementalRunes={hasElementalRunes}
          />

          <div className="mobile-tab-content">
            {mobileActiveTab === 'stats' && (
              <div className="mobile-stats-tab">
                {/* Mobile Stats - nur anzeigen wenn Elemental Stats nicht aktiv sind */}
                {!gameState.showElementalStats && (
                  <GameStats 
                    gameState={gameState}
                    onOpenGoldSkillTree={() => setIsGoldSkillTreeOpen(true)}
                  />
                )}

                {/* Mobile Elemental Stats Panel - ersetzt normale Stats wenn aktiv */}
                {gameState.showElementalStats && hasElementalRunes && (
                  <div className="elemental-stats-panel" style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    border: '2px solid #64748b',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{
                      color: '#c084fc',
                      textAlign: 'center',
                      marginBottom: '16px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textShadow: '0 0 10px rgba(192, 132, 252, 0.5)'
                    }}>⚡ Elemental Production</h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px'
                    }}>
                      {elementalStats.map((stat, index) => {
                        // Calculate achievement bonus
                        const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
                        const achievementMultiplier = 1 + totalAchievementTiers * 0.01; // 1% per tier
                        const productionWithBonus = stat.totalProducing * achievementMultiplier;
                        
                        // Konvertiere hex zu rgba
                        const hexToRgba = (hex: string, alpha: number) => {
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        };
                        
                        return (
                        <div key={index} style={{
                          background: hexToRgba(stat.color, 0.2),
                          border: `2px solid ${hexToRgba(stat.color, 0.5)}`,
                          borderRadius: '8px',
                          padding: '12px',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          cursor: stat.runeCount > 0 ? 'help' : 'default',
                          opacity: stat.runeCount > 0 ? 1 : 0.6
                        }}>                          <div style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: stat.color,
                            marginBottom: '4px',
                            textShadow: `0 0 6px ${stat.color}`,
                            filter: 'brightness(1.3)'
                          }}>
                            {stat.name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#f1f5f9',
                            marginBottom: '2px',
                            fontWeight: '500'
                          }}>
                            Stored: {formatNumberGerman(stat.currentAmount)}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#e2e8f0',
                            marginBottom: '2px',
                            fontWeight: '500'
                          }}>
                            +{formatNumberGerman(productionWithBonus)}/tick
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: stat.color,
                            opacity: 0.9,
                            filter: 'brightness(1.2)'
                          }}>
                            {formatNumberGerman(stat.runeCount)} rune{stat.runeCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mobile Elemental Stats Button - appears when first elemental rune is obtained */}
                {hasElementalRunes && (
                  <div className="mobile-elemental-stats-switch" style={{ marginBottom: '16px' }}>
                    <button
                      onClick={toggleElementalStats}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: gameState.showElementalStats
                          ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)'
                          : 'linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #9ca3af 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textShadow: '0 0 8px rgba(0,0,0,0.3)',
                        boxShadow: gameState.showElementalStats
                          ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                          : '0 4px 12px rgba(107, 114, 128, 0.3)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = gameState.showElementalStats
                          ? '0 6px 20px rgba(124, 58, 237, 0.4)'
                          : '0 6px 20px rgba(107, 114, 128, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = gameState.showElementalStats
                          ? '0 4px 12px rgba(124, 58, 237, 0.3)'
                          : '0 4px 12px rgba(107, 114, 128, 0.3)';
                      }}
                    >
                      <span>⚡</span>
                      <span>{gameState.showElementalStats ? 'Hide' : 'Show'} Elemental Stats</span>
                      <span style={{ 
                        fontSize: '12px', 
                        opacity: 0.8,
                        marginLeft: '4px'
                      }}>
                        {gameState.showElementalStats ? '👁️' : '👁️‍🗨️'}
                      </span>
                    </button>
                  </div>
                )}
                
                {/* Event Notification - Fixed above MoneyButton */}
                {gameState.activeEvent && (
                  <EventNotification 
                    eventId={gameState.activeEvent as any}
                    eventEndTime={gameState.eventEndTime || null}
                  />
                )}

                <ActionButtons
                  money={gameState.money}
                  onRebirth={handleRebirth}
                  onReset={resetGame}
                  onCheat={cheatMoney}
                  moneyPerClick={gameState.moneyPerClick}
                  gameState={gameState}
                />
              </div>
            )}

            {mobileActiveTab === 'upgrades' && (
              <UpgradesPanel 
                gameState={gameState} 
                buyUpgrade={buyUpgrade}
                buyMaxUpgrades={buyMaxUpgrades}
              />
            )}

            {mobileActiveTab === 'rebirth' && isRebirthUnlocked && (
              <RebirthPanel
                gameState={gameState}
                buyRebirthUpgrade={buyRebirthUpgrade}
                buyMaxRebirthUpgrades={buyMaxRebirthUpgrades}
              />
            )}

            {mobileActiveTab === 'achievements' && isRebirthUnlocked && (
              <AchievementsPanel
                gameState={gameState}
                checkAchievements={checkAchievements}
                setGameState={setGameState}
              />
            )}

            {mobileActiveTab === 'statistics' && isRebirthUnlocked && (
              <StatisticsPanel gameState={gameState} onToggleDevStats={toggleDevStats} />
            )}

            {mobileActiveTab === 'leaderboard' && isRebirthUnlocked && (
              <LeaderboardPanel gameState={gameState} />
            )}

            {mobileActiveTab === 'settings' && (
              <SettingsMenu 
                isOpen={true}
                onClose={() => setMobileActiveTab('stats')}
                onReset={resetGame}
                onOpenAnimationSettings={() => setIsAnimationSettingsOpen(true)}
                disableMoneyEffects={gameState.disableMoneyEffects || false}
                disableDiamondEffects={gameState.disableDiamondEffects || false}
                disablePackAnimations={gameState.disablePackAnimations || false}
                disableCraftAnimations={gameState.disableCraftAnimations || false}
                username={gameState.username || 'Player'}
                onUsernameChange={(newUsername) => setGameState(prev => ({ ...prev, username: newUsername }))}
              />
            )}

            {mobileActiveTab === 'dev' && import.meta.env.DEV && (
              <DevModal 
                isOpen={true}
                onClose={() => setMobileActiveTab('stats')}
                gameState={gameState}
                setGameState={setGameState}
                devSimulateOfflineTime={devSimulateOfflineTime}
                setOfflineProgress={setOfflineProgress}
                onOpenTrader={() => setIsTraderOpen(true)}
              />
            )}

            {mobileActiveTab === 'trader' && hasElementalRunes && (
              <ElementalTraderModal 
                isOpen={true}
                onClose={() => setMobileActiveTab('stats')}
                offers={getCurrentTraderOffers()}
                gameState={gameState}
                onAcceptOffer={handleAcceptTraderOffer}
              />
            )}

            {mobileActiveTab === 'prestige' && hasElementalRunes && (
              <ElementalPrestigeModal 
                isOpen={true}
                onClose={() => setMobileActiveTab('stats')}
                gameState={gameState}
                onPrestige={handleElementalPrestige}
              />
            )}

            {mobileActiveTab === 'gems' && bothUnlocksOwned && (
              <div className="mobile-gem-panel">
                {/* Gem Panel Content für Mobile */}
                <h2 style={{ 
                  color: '#60a5fa', 
                  textAlign: 'center', 
                  marginBottom: '24px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }}>💎 Runes</h2>
                
                {/* Gems Display */}
                <div style={{ 
                  marginBottom: '24px', 
                  textAlign: 'center',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: '#60a5fa',
                    textShadow: '0 0 8px rgba(96, 165, 250, 0.6)'
                  }}>
                    💎 {formatNumberGerman(gameState.gems)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Gems you own</div>
                </div>

                {/* Multi-Pack Purchase Buttons - Mobile */}
                <div style={{ 
                  marginBottom: '24px',
                  background: 'rgba(147, 51, 234, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(147, 51, 234, 0.3)'
                }}>
                  <h3 style={{
                    color: '#9333ea',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textShadow: '0 0 8px rgba(147, 51, 234, 0.5)',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    📦 {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Rune Packs
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    {[1, 'max'].map(count => {
                      const isMax = count === 'max';
                      const costPerPack = gameState.currentRuneType === 'basic' ? 5 : 250000;
                      const currency = gameState.currentRuneType === 'basic' ? gameState.gems : gameState.money;
                      const maxCount = isMax ? Math.floor(currency / costPerPack) : (count as number);
                      const totalCost = costPerPack * maxCount;
                      const canAfford = currency >= totalCost && maxCount > 0;
                      
                      return (
                        <button
                          key={count}
                          onClick={() => handleBuyRunePacks(maxCount)}
                          disabled={!canAfford}
                          style={{
                            padding: '14px 20px',
                            background: canAfford 
                              ? (isMax 
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)')
                              : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            border: canAfford 
                              ? (isMax ? '2px solid #fbbf24' : '2px solid #a855f7')
                              : '2px solid #6b7280',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            boxShadow: canAfford 
                              ? (isMax 
                                ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                                : '0 4px 12px rgba(147, 51, 234, 0.4)')
                              : '0 2px 6px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.2s ease',
                            opacity: canAfford ? 1 : 0.5,
                            width: '100%'
                          }}
                        >
                          <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                            ✨ {isMax ? `${formatNumberGerman(maxCount)}x Packs (MAX)` : `${count}x Pack`} ✨
                          </div>
                          <div style={{ fontSize: '13px', opacity: 0.9 }}>
                            {gameState.currentRuneType === 'basic' 
                              ? `💎 ${formatNumberGerman(totalCost)} Gems`
                              : `💰 ${formatNumberGerman(totalCost)}$`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secret Rune Craft Buttons - Mobile */}
                {canCraftSecretRune && (
                  <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Craft 1 Button */}
                    <button
                      onClick={() => {
                        setIsCraftingSecret('single');
                      }}
                      style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #404040 0%, #1a1a1a 50%, #000000 100%)',
                        color: '#d4d4d4',
                        border: '2px solid #404040',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 6px 20px rgba(64, 64, 64, 0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        animation: 'shimmer 3s infinite'
                      }} />
                      🌑 Craft 1x Secret Rune 🌑
                    </button>

                    {/* Craft All Button - nur sichtbar wenn mehr als 1 craftbar */}
                    {maxCraftableSecretRunes > 1 && (
                      <button
                        onClick={() => {
                          setIsCraftingSecret('all');
                        }}
                        style={{
                          width: '100%',
                          padding: '16px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #606060 0%, #303030 50%, #1a1a1a 100%)',
                          color: '#ffffff',
                          border: '2px solid #808080',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 6px 20px rgba(128, 128, 128, 0.6)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                          animation: 'shimmer 3s infinite'
                        }} />
                        🌑 Craft {formatNumberGerman(maxCraftableSecretRunes)}x Secret Runes (ALL) 🌑
                      </button>
                    )}
                  </div>
                )}

                {/* Mobile Rune Collection */}
                <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  paddingBottom: '20px'
                }}>
                  {/* Mobile Rune Type Switch Button */}
                  <button
                    onClick={switchRuneType}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: `linear-gradient(135deg, ${
                        gameState.currentRuneType === 'basic'
                          ? '#1d4ed8 0%, #3b82f6 50%, #60a5fa 100%'
                          : '#7c3aed 0%, #a855f7 50%, #c084fc 100%'
                      })`,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(0,0,0,0.3)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🎲 {gameState.currentRuneType === 'basic' ? 'Basic' : 'Elemental'} Runes
                  </button>
                  
                  {currentRunes.map((rune: Rune, index: number) => {
                    const runeAmount = currentRuneAmounts[index];
                    return (
                      <div 
                        key={rune.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          background: runeAmount > 0 
                            ? `linear-gradient(135deg, ${rune.color}20, ${rune.color}10)` 
                            : 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          border: runeAmount > 0 
                            ? `1px solid ${rune.color}60` 
                            : '1px solid rgba(255,255,255,0.1)',
                          opacity: runeAmount > 0 ? 1 : 0.6,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            color: rune.color, 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginBottom: '2px'
                          }}>
                            {rune.name}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#94a3b8',
                            lineHeight: 1.3,
                            marginBottom: '4px'
                          }}>
                            {rune.rarity} Rune • {(rune.dropRate / 10)}% drop
                          </div>
                          
                          {/* Mobile Bonus Display - Always visible if rune amount > 0 */}
                          {runeAmount > 0 && (
                            <div style={{
                              fontSize: '10px',
                              color: '#60a5fa',
                              lineHeight: 1.3,
                              marginTop: '4px',
                              padding: '4px 6px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '4px',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                              {rune.moneyBonus && `💰 +${(rune.moneyBonus * runeAmount * 100).toFixed(1)}%`}
                              {rune.rpBonus && `${rune.moneyBonus ? ' • ' : ''}🔄 +${(rune.rpBonus * runeAmount * 100).toFixed(1)}%`}
                              {rune.gemBonus && `${(rune.moneyBonus || rune.rpBonus) ? ' • ' : ''}💎 +${(rune.gemBonus * runeAmount * 100).toFixed(2)}%`}
                              {rune.producing && `🌟 ${rune.producing} +${(rune.produceAmount || 0) * runeAmount}/tick`}
                              {rune.tickBonus && `${(rune.moneyBonus || rune.rpBonus || rune.gemBonus) ? ' • ' : ''}⚡ -${rune.tickBonus}ms`}
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '4px'
                        }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#60a5fa',
                            fontSize: '16px'
                          }}>
                            {formatNumberGerman(runeAmount)}
                          </div>
                          {/* Mobile Merge Buttons - nur für Basic Runes */}
                          {gameState.currentRuneType === 'basic' && runeAmount >= 3 && index < 5 && (
                            <div style={{ display: 'flex', gap: '3px', flexDirection: 'column' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mergeRunes(index);
                                }}
                                style={{
                                  padding: '2px 5px',
                                  fontSize: '8px',
                                  background: `linear-gradient(135deg, ${rune.color}40, ${rune.color}20)`,
                                  border: `1px solid ${rune.color}`,
                                  borderRadius: '3px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '35px'
                                }}
                              >
                                🔄 3→1
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  mergeAllRunes(index);
                                }}
                                style={{
                                  padding: '2px 5px',
                                  fontSize: '8px',
                                  background: `linear-gradient(135deg, ${rune.color}60, ${rune.color}30)`,
                                  border: `1px solid ${rune.color}`,
                                  borderRadius: '3px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minWidth: '35px',
                                  fontWeight: 'bold'
                                }}
                                title={`Merge all (${Math.floor(runeAmount / 3)})`}
                              >
                                ⚡ ALL
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Active Bonuses für Mobile */}
                {(runeBonuses.totalMoneyBonus > 0 || runeBonuses.totalRpBonus > 0 || runeBonuses.totalGemBonus > 0) && (() => {
                  const goldSkillBonuses = calculateGoldSkillBonuses(gameState.goldSkills || []);
                  const totalRuneChanceBonus = goldSkillBonuses.runeChanceBonus;
                  
                  return (
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    marginTop: '16px'
                  }}>
                    <div style={{ 
                      color: '#60a5fa', 
                      fontWeight: 'bold', 
                      marginBottom: '12px',
                      fontSize: '16px',
                      textShadow: '0 0 8px rgba(96, 165, 250, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      ⚡ Active Bonus
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {runeBonuses.totalMoneyBonus > 0 && (
                        <div style={{ 
                          color: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          <span>💰</span>
                          <span>+{formatNumberGerman(runeBonuses.totalMoneyBonus * 100, 2)}% Money</span>
                        </div>
                      )}
                      {runeBonuses.totalRpBonus > 0 && (
                        <div style={{ 
                          color: '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                          <span>🔄</span>
                          <span>+{formatNumberGerman(runeBonuses.totalRpBonus * 100, 2)}% Rebirth Points</span>
                        </div>
                      )}
                      {runeBonuses.totalGemBonus > 0 && (
                        <div style={{ 
                          color: '#F59E0B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          <span>💎</span>
                          <span>+{formatNumberGerman(runeBonuses.totalGemBonus * 100, 3)}% Gem Chance</span>
                        </div>
                      )}
                      {totalRuneChanceBonus > 0 && (
                        <div style={{ 
                          color: '#8B5CF6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          borderRadius: '6px',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                          <span>🎯</span>
                          <span>+{formatNumberGerman(totalRuneChanceBonus * 100, 1)}% Rune Chance</span>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>React Money Clicker v0.2.0 | Your progress is automatically saved!</p>
      </footer>
      
      {/* Pack Opening Animation */}
      {packResults && (
        <PackOpeningAnimation 
          results={packResults}
          onComplete={closePackAnimation}
          totalPacksOpened={totalPacksOpened}
          actualRuneCounts={actualRuneCounts}
        />
      )}

      {/* Elemental Converter Modal */}
      <ElementalConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        elementalResources={gameState.elementalResources}
        onConvert={handleElementalConvert}
      />
      
      {/* Tooltip Animation CSS */}
      <style>{`
        @keyframes tooltipFadeIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
