import { useState, useRef, useEffect } from 'react';
import type { GameState } from '../types';
import { RUNES_1, RUNES_2 } from '../types/Runes';
import { ACHIEVEMENTS } from '../types/Achievement';

interface DevModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  devSimulateOfflineTime: (minutes: number) => void;
  setOfflineProgress: (progress: { time: number; money: number; clicks?: number } | null) => void;
}

const DevModal = ({ isOpen, onClose, gameState, setGameState, setOfflineProgress }: DevModalProps) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showRunesPage, setShowRunesPage] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { cmd: 'addMoney(amount)', desc: 'Add money to your balance' },
    { cmd: 'addRP(amount)', desc: 'Add Rebirth Points' },
    { cmd: 'addGems(amount)', desc: 'Add gems' },
    { cmd: 'addClicks(amount)', desc: 'Add clicks to total' },
    { cmd: 'setMoneyPerClick(amount)', desc: 'Set money per click' },
    { cmd: 'setMoneyPerTick(amount)', desc: 'Set money per tick' },
    { cmd: 'simulateOffline(minutes)', desc: 'Simulate offline time (no cap)' },
    { cmd: 'resetGame()', desc: 'Reset entire game' },
    { cmd: 'maxUpgrade(index)', desc: 'Max buy upgrade by index (0-4)' },
    { cmd: 'setAllAchievements(tier)', desc: 'Set all achievements to tier' },
    { cmd: 'unlockAchievement(id)', desc: 'Unlock achievement by id (0-8)' },
    { cmd: 'setAchievementTier(id, tier)', desc: 'Set achievement tier (id: 0-8)' },
    { cmd: 'addRune(id, amount)', desc: 'Add base rune (id: 0-6)' },
    { cmd: 'addElementalRune(id, amount)', desc: 'Add elemental rune (id: 0-5)' },
    { cmd: '.help()', desc: 'Show all available commands' },
    { cmd: '.achievements()', desc: 'Show achievement list with IDs' },
    { cmd: '.clear()', desc: 'Clear command history' },
  ];

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    setCommandHistory(prev => [...prev, `> ${trimmedCmd}`]);
    
    try {
      // Help command
      if (trimmedCmd === '.help()') {
        setShowHelp(true);
        setCommandHistory(prev => [...prev, '📋 Available commands displayed above']);
        return;
      }

      // Achievements list command
      if (trimmedCmd === '.achievements()') {
        setShowAchievements(true);
        setCommandHistory(prev => [...prev, '🏆 Achievement list displayed above']);
        return;
      }

      // Clear command
      if (trimmedCmd === '.clear()') {
        setCommandHistory([]);
        setShowHelp(false);
        setShowAchievements(false);
        return;
      }

      // Parse command with regex
      const addMoneyMatch = trimmedCmd.match(/^addMoney\(([^)]+)\)$/);
      if (addMoneyMatch) {
        const amount = parseFloat(addMoneyMatch[1]);
        if (isNaN(amount)) throw new Error('Invalid amount');
        setGameState(prev => ({ ...prev, money: prev.money + amount }));
        setCommandHistory(prev => [...prev, `✅ Added ${amount}$ to balance`]);
        return;
      }

      const addRPMatch = trimmedCmd.match(/^addRP\(([^)]+)\)$/);
      if (addRPMatch) {
        const amount = parseFloat(addRPMatch[1]);
        if (isNaN(amount)) throw new Error('Invalid amount');
        setGameState(prev => ({ ...prev, rebirthPoints: prev.rebirthPoints + amount }));
        setCommandHistory(prev => [...prev, `✅ Added ${amount} Rebirth Points`]);
        return;
      }

      const addGemsMatch = trimmedCmd.match(/^addGems\(([^)]+)\)$/);
      if (addGemsMatch) {
        const amount = parseInt(addGemsMatch[1]);
        if (isNaN(amount)) throw new Error('Invalid amount');
        setGameState(prev => ({ ...prev, gems: prev.gems + amount }));
        setCommandHistory(prev => [...prev, `✅ Added ${amount} gems`]);
        return;
      }

      const addClicksMatch = trimmedCmd.match(/^addClicks\(([^)]+)\)$/);
      if (addClicksMatch) {
        const amount = parseInt(addClicksMatch[1]);
        if (isNaN(amount)) throw new Error('Invalid amount');
        setGameState(prev => ({ ...prev, clicksTotal: prev.clicksTotal + amount }));
        setCommandHistory(prev => [...prev, `✅ Added ${amount} clicks`]);
        return;
      }

      const setMoneyPerClickMatch = trimmedCmd.match(/^setMoneyPerClick\(([^)]+)\)$/);
      if (setMoneyPerClickMatch) {
        const amount = parseFloat(setMoneyPerClickMatch[1]);
        if (isNaN(amount)) throw new Error('Invalid amount');
        setGameState(prev => ({ ...prev, moneyPerClick: amount }));
        setCommandHistory(prev => [...prev, `✅ Set money per click to ${amount}$`]);
        return;
      }

      const setMoneyPerTickMatch = trimmedCmd.match(/^setMoneyPerTick\(([^)]+)\)$/);
      if (setMoneyPerTickMatch) {
        const amount = parseFloat(setMoneyPerTickMatch[1]);
        if (isNaN(amount)) throw new Error('Invalid amount');
        setGameState(prev => ({ ...prev, moneyPerTick: amount }));
        setCommandHistory(prev => [...prev, `✅ Set money per tick to ${amount}$`]);
        return;
      }

      const simulateOfflineMatch = trimmedCmd.match(/^simulateOffline\(([^)]+)\)$/);
      if (simulateOfflineMatch) {
        const minutes = parseFloat(simulateOfflineMatch[1]);
        if (isNaN(minutes)) throw new Error('Invalid minutes');
        
        // Calculate offline progress without cap
        const seconds = minutes * 60;
        const offlineTime = seconds; // No MAX_OFFLINE_TIME cap
        
        // Calculate offline clicks
        let offlineClicks = 0;
        if (gameState.rebirth_upgradeAmounts[1] > 0) {
          offlineClicks = Math.floor(gameState.rebirth_upgradeAmounts[1] * offlineTime * 0.5);
        }
        
        // Calculate money
        if (gameState.moneyPerTick > 0 || offlineClicks > 0) {
          const totalAchievementTiers = gameState.achievements.reduce((sum, a) => sum + (a.tier || 0), 0);
          const achievementMoneyBonus = totalAchievementTiers * 0.01;
          const achievementMoneyMultiplier = 1 + achievementMoneyBonus;
          
          const totalClicksForMultiplier = gameState.clicksTotal + offlineClicks;
          
          let clickMultiplier = 1;
          if (gameState.rebirth_upgradeAmounts[0] > 0) {
            const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
            clickMultiplier = Math.pow(totalClicksForMultiplier + 1, exponent);
          }
          
          let totalMoneyBonus = 0;
          gameState.runes.forEach((amount, index) => {
            const rune = RUNES_1[index];
            if (amount > 0 && rune.moneyBonus) {
              totalMoneyBonus += rune.moneyBonus * amount;
            }
          });
          const runeMultiplier = 1 + totalMoneyBonus;
          
          let rebirthPointMultiplier = 1;
          if (gameState.rebirth_upgradeAmounts[4] > 0) {
            const bonus = Math.log(gameState.rebirthPoints + 1) * 0.05;
            rebirthPointMultiplier = 1 + bonus;
          }
          
          const actualMoneyPerTick = gameState.moneyPerTick * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier;
          const moneyEarned = (actualMoneyPerTick * offlineTime) * 0.5;
          
          // Set offline progress to show modal
          setOfflineProgress({
            time: offlineTime,
            money: moneyEarned,
            clicks: offlineClicks,
          });
          
          setGameState(prev => ({
            ...prev,
            money: prev.money + moneyEarned,
            clicksTotal: prev.clicksTotal + offlineClicks,
            stats: {
              ...prev.stats,
              offlineTime: prev.stats.offlineTime + offlineTime,
              devStats: {
                ...prev.stats.devStats,
                offlineTimeAdded: prev.stats.devStats.offlineTimeAdded + offlineTime,
              },
            },
          }));
          
          setCommandHistory(prev => [...prev, `✅ Simulated ${minutes} minutes offline (+${moneyEarned.toFixed(2)}$, +${offlineClicks} clicks)`]);
        } else {
          setCommandHistory(prev => [...prev, `⚠️ No passive income or auto clicker active`]);
        }
        return;
      }

      if (trimmedCmd === 'resetGame()') {
        if (confirm('Are you sure you want to reset the entire game?')) {
          localStorage.removeItem('moneyClickerGameState');
          window.location.reload();
        }
        return;
      }

      const unlockAllMatch = trimmedCmd.match(/^setAllAchievements\(([^)]+)\)$/);
      if (unlockAllMatch) {
        const tier = parseInt(unlockAllMatch[1]);
        if (isNaN(tier) || tier < 1) throw new Error('Invalid tier (must be >= 1)');
        
        setGameState(prev => ({
          ...prev,
          achievements: ACHIEVEMENTS.map((_, index) => ({ id: index, tier: tier }))
        }));
        setCommandHistory(prev => [...prev, `✅ Set all achievements to Tier ${tier}`]);
        return;
      }

      const unlockAchievementMatch = trimmedCmd.match(/^unlockAchievement\(([^)]+)\)$/);
      if (unlockAchievementMatch) {
        const id = parseInt(unlockAchievementMatch[1]);
        if (isNaN(id) || id < 0 || id > 8) throw new Error('Invalid achievement id (0-8)');
        
        setGameState(prev => {
          // Check if achievement already exists
          const existingIndex = prev.achievements.findIndex(a => a.id === id);
          
          if (existingIndex >= 0) {
            // Already unlocked, just ensure it has at least tier 1
            const updated = [...prev.achievements];
            if (!updated[existingIndex].tier) {
              updated[existingIndex] = { ...updated[existingIndex], tier: 1 };
            }
            return { ...prev, achievements: updated };
          } else {
            // Add new achievement with tier 1
            return {
              ...prev,
              achievements: [...prev.achievements, { id, tier: 1 }]
            };
          }
        });
        
        setCommandHistory(prev => [...prev, `✅ Unlocked achievement #${id}`]);
        return;
      }

      const setAchievementTierMatch = trimmedCmd.match(/^setAchievementTier\(([^,]+),\s*([^)]+)\)$/);
      if (setAchievementTierMatch) {
        const id = parseInt(setAchievementTierMatch[1]);
        const tierInput = setAchievementTierMatch[2].trim();
        if (isNaN(id) || id < 0 || id > 8) throw new Error('Invalid achievement id (0-8)');
        
        let tier: number;
        if (tierInput.toLowerCase() === 'max') {
          tier = ACHIEVEMENTS[id].maxTier || 100;
        } else {
          tier = parseInt(tierInput);
          if (isNaN(tier) || tier < 1) throw new Error('Invalid tier (must be >= 1 or "max")');
        }
        
        setGameState(prev => {
          const existingIndex = prev.achievements.findIndex(a => a.id === id);
          
          if (existingIndex >= 0) {
            // Update existing achievement
            const updated = [...prev.achievements];
            updated[existingIndex] = { id, tier };
            return { ...prev, achievements: updated };
          } else {
            // Add new achievement
            return {
              ...prev,
              achievements: [...prev.achievements, { id, tier }]
            };
          }
        });
        
        setCommandHistory(prev => [...prev, `✅ Set achievement #${id} to tier ${tier}`]);
        return;
      }

      const addRuneMatch = trimmedCmd.match(/^addRune\(([^,]+),\s*([^)]+)\)$/);
      if (addRuneMatch) {
        const id = parseInt(addRuneMatch[1]);
        const amount = parseInt(addRuneMatch[2]);
        if (isNaN(id) || isNaN(amount) || id < 0 || id > 6) throw new Error('Invalid rune id (0-6) or amount');
        
        setGameState(prev => {
          const newRunes = [...prev.runes];
          newRunes[id] += amount;
          return { ...prev, runes: newRunes };
        });
        setCommandHistory(prev => [...prev, `✅ Added ${amount}x ${RUNES_1[id].name}`]);
        return;
      }

      const addElementalRuneMatch = trimmedCmd.match(/^addElementalRune\(([^,]+),\s*([^)]+)\)$/);
      if (addElementalRuneMatch) {
        const id = parseInt(addElementalRuneMatch[1]);
        const amount = parseInt(addElementalRuneMatch[2]);
        if (isNaN(id) || isNaN(amount) || id < 0 || id > 5) throw new Error('Invalid elemental rune id (0-5) or amount');
        
        setGameState(prev => {
          const newElementalRunes = [...prev.elementalRunes];
          newElementalRunes[id] += amount;
          return { ...prev, elementalRunes: newElementalRunes };
        });
        setCommandHistory(prev => [...prev, `✅ Added ${amount}x ${RUNES_2[id].name}`]);
        return;
      }

      // If no command matched
      throw new Error('Unknown command. Type .help() for available commands.');
      
    } catch (error) {
      setCommandHistory(prev => [...prev, `❌ Error: ${(error as Error).message}`]);
    }
  };

  const handleDevButton = (commandTemplate: string, description: string) => {
    setCommandHistory(prev => [...prev, `💬 ${description}: Type command in console below`]);
    setCommandInput(commandTemplate);
    if (commandInputRef.current) {
      commandInputRef.current.focus();
    }
  };

  // Runes Page
  if (showRunesPage) {
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowRunesPage(false)}
        />
        
        {/* Runes Modal */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '3px solid #8b5cf6',
          borderRadius: '24px',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(139, 92, 246, 0.4)',
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
            marginBottom: '24px'
          }}>
            <h2 style={{
              color: '#8b5cf6',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              textShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
            }}>
              📜 Runes Manager
            </h2>
            <button
              onClick={() => setShowRunesPage(false)}
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
              ✕ Back
            </button>
          </div>

          {/* Base Runes */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#22c55e', margin: '0 0 12px 0', fontSize: '16px' }}>💎 Base Runes:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {RUNES_1.map((rune, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowRunesPage(false);
                    handleDevButton(`addRune(${index}, amount)`, `Add ${rune.name}`);
                  }}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderColor: '#15803d',
                    fontSize: '12px',
                    padding: '12px 8px'
                  }}
                >
                  {rune.name}
                  <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
                    Current: {gameState.runes[index]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Elemental Runes */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{ color: '#60a5fa', margin: '0 0 12px 0', fontSize: '16px' }}>⚡ Elemental Runes:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {RUNES_2.map((rune, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowRunesPage(false);
                    handleDevButton(`addElementalRune(${index}, amount)`, `Add ${rune.name}`);
                  }}
                  style={{
                    ...buttonStyle,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderColor: '#1d4ed8',
                    fontSize: '12px',
                    padding: '12px 8px'
                  }}
                >
                  {rune.name}
                  <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
                    Current: {gameState.elementalRunes[index]}
                  </div>
                </button>
              ))}
            </div>
          </div>
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
      </>
    );
  }

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
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        border: '3px solid #f59e0b',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.4)',
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
          marginBottom: '24px'
        }}>
          <h2 style={{
            color: '#f59e0b',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 20px rgba(245, 158, 11, 0.6)'
          }}>
            🛠️ Developer Console
          </h2>
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

        {/* Help Panel */}
        {showHelp && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#60a5fa', margin: '0 0 12px 0', fontSize: '16px' }}>📋 Available Commands:</h3>
            <div style={{ 
              display: 'grid', 
              gap: '8px',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}>
              {commands.map((cmd, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setCommandInput(cmd.cmd);
                    commandInputRef.current?.focus();
                  }}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{cmd.cmd}</span>
                  <span style={{ color: '#94a3b8' }}>{cmd.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Panel */}
        {showAchievements && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid rgba(251, 191, 36, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#fbbf24', margin: '0 0 12px 0', fontSize: '16px' }}>🏆 Achievements:</h3>
            <div style={{ 
              display: 'grid', 
              gap: '6px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {ACHIEVEMENTS.map((ach) => (
                <div 
                  key={ach.id}
                  onClick={() => {
                    setCommandInput(`setAchievementTier(${ach.id}, tier)`);
                    commandInputRef.current?.focus();
                  }}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', minWidth: '30px' }}>#{ach.id}</span>
                    <span style={{ fontSize: '16px' }}>{ach.icon}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{ach.name}</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                    Max Tier: {ach.maxTier || 100}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#22c55e', margin: '0 0 12px 0', fontSize: '16px' }}>⚡ Quick Actions:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button onClick={() => handleDevButton('addMoney(amount)', 'Add Money')} style={buttonStyle}>💰 Add Money</button>
            <button onClick={() => handleDevButton('addRP(amount)', 'Add Rebirth Points')} style={buttonStyle}>🔄 Add RP</button>
            <button onClick={() => handleDevButton('addGems(amount)', 'Add Gems')} style={buttonStyle}>💎 Add Gems</button>
            <button onClick={() => handleDevButton('addClicks(amount)', 'Add Clicks')} style={buttonStyle}>👆 Add Clicks</button>
            <button onClick={() => handleDevButton('setMoneyPerClick(amount)', 'Set Money Per Click')} style={buttonStyle}>💵 Set $/Click</button>
            <button onClick={() => handleDevButton('setMoneyPerTick(amount)', 'Set Money Per Tick')} style={buttonStyle}>⏱️ Set $/Tick</button>
            <button onClick={() => handleDevButton('simulateOffline(minutes)', 'Simulate Offline (minutes)')} style={buttonStyle}>💤 Offline Time</button>
            <button onClick={() => handleDevButton('setAllAchievements(tier)', 'Set All Achievements')} style={buttonStyle}>🏆 Set Achievements</button>
            <button onClick={() => setShowRunesPage(true)} style={{...buttonStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderColor: '#6d28d9'}}>📜 Runes Manager</button>
            <button onClick={() => executeCommand('resetGame()')} style={{...buttonStyle, background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderColor: '#7f1d1d'}}>🔥 Reset Game</button>
          </div>
        </div>

        {/* Command Line */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '2px solid rgba(148, 163, 184, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          <h3 style={{ color: '#94a3b8', margin: '0 0 12px 0', fontSize: '14px' }}>💻 Command Line:</h3>
          
          {/* Command History */}
          <div style={{
            background: '#000',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '12px',
            minHeight: '150px',
            maxHeight: '200px',
            overflowY: 'auto',
            marginBottom: '12px',
            color: '#22c55e'
          }}>
            {commandHistory.length === 0 ? (
              <div style={{ color: '#64748b' }}>Type .help() for available commands...</div>
            ) : (
              commandHistory.map((line, i) => (
                <div key={i} style={{ marginBottom: '4px' }}>{line}</div>
              ))
            )}
          </div>

          {/* Command Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={commandInputRef}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commandInput.trim()) {
                  executeCommand(commandInput);
                  setCommandInput('');
                }
              }}
              placeholder="Enter command... (e.g., addMoney(1000) or .help())"
              style={{
                flex: 1,
                background: '#000',
                border: '2px solid #334155',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#22c55e',
                fontSize: '14px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <button
              onClick={() => {
                if (commandInput.trim()) {
                  executeCommand(commandInput);
                  setCommandInput('');
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: '2px solid #15803d',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
              }}
            >
              Execute
            </button>
          </div>
        </div>
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
    </>
  );
};

const buttonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  border: '2px solid #1d4ed8',
  borderRadius: '8px',
  padding: '10px',
  cursor: 'pointer',
  color: 'white',
  fontSize: '13px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap'
};

export default DevModal;
