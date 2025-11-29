interface MobileTabNavigationProps {
  activeTab: 'stats' | 'upgrades' | 'rebirth' | 'gems' | 'achievements' | 'statistics' | 'leaderboard' | 'settings' | 'dev' | 'trader' | 'prestige';
  onTabChange: (tab: 'stats' | 'upgrades' | 'rebirth' | 'gems' | 'achievements' | 'statistics' | 'leaderboard' | 'settings' | 'dev' | 'trader' | 'prestige') => void;
  hasGems: boolean;
  hasRebirth: boolean;
  hasElementalRunes: boolean;
}

const MobileTabNavigation = ({ activeTab, onTabChange, hasGems, hasRebirth, hasElementalRunes }: MobileTabNavigationProps) => {
  const tabs = [
    { id: 'stats' as const, label: '🏠 Main', icon: '🏠' },
    { id: 'upgrades' as const, label: '⬆️ Upgrades', icon: '⬆️' },
    ...(hasRebirth ? [{ id: 'rebirth' as const, label: '🔄 Rebirth', icon: '🔄' }] : []),
    ...(hasRebirth ? [{ id: 'achievements' as const, label: '🏆 Achiev', icon: '🏆' }] : []),
    ...(hasRebirth ? [{ id: 'statistics' as const, label: '📊 Stats', icon: '📊' }] : []),
    ...(hasRebirth ? [{ id: 'leaderboard' as const, label: '🏅 Leader', icon: '🏅' }] : []),
    ...(hasGems ? [{ id: 'gems' as const, label: '💎 Runes', icon: '💎' }] : []),
    ...(hasElementalRunes ? [{ id: 'trader' as const, label: '⚡ Trader', icon: '⚡' }] : []),
    ...(hasElementalRunes ? [{ id: 'prestige' as const, label: '🌟 Prestige', icon: '🌟' }] : []),
    { id: 'settings' as const, label: '⚙️ Settings', icon: '⚙️' },
    ...(import.meta.env.DEV ? [{ id: 'dev' as const, label: '🛠️ Dev', icon: '🛠️' }] : []),
  ];

  return (
    <div className="mobile-tab-navigation" style={{
      display: 'flex',
      overflowX: 'auto',
      background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '12px',
      padding: '4px',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      marginBottom: '12px',
      gap: '2px',
      scrollbarWidth: 'thin',
      WebkitOverflowScrolling: 'touch'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
          style={{
            flex: 1,
            padding: '8px 4px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            background: activeTab === tab.id 
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              : 'transparent',
            color: activeTab === tab.id ? 'white' : '#94a3b8',
            boxShadow: activeTab === tab.id 
              ? '0 2px 8px rgba(59, 130, 246, 0.3)'
              : 'none',
            textAlign: 'center',
            minWidth: '60px'
          }}
        >
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>{tab.icon}</div>
          <div style={{ fontSize: '10px' }}>{tab.label.split(' ')[1]}</div>
        </button>
      ))}
    </div>
  );
};

export default MobileTabNavigation;