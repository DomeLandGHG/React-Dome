interface SwitchButtonProps {
  onSwitch: (selected: 'upgrades' | 'rebirth' | 'achievements') => void;
  label1: string;
  label2: string;
  label3?: string;
  activePanel?: 'upgrades' | 'rebirth' | 'achievements';
  showThirdButton?: boolean;
}

const SwitchButton =({ onSwitch, label1, label2, label3 = 'Achievements', activePanel = 'upgrades', showThirdButton = false }: SwitchButtonProps) => {
    return ( 
        <div className="switch-button-container" style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          padding: '4px',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          marginBottom: '20px'
        }}>
            <button 
                className={`switch-button ${activePanel === 'upgrades' ? 'active' : ''}`}
                onClick={() => onSwitch('upgrades')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  background: activePanel === 'upgrades' 
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'transparent',
                  color: activePanel === 'upgrades' ? 'white' : '#94a3b8',
                  boxShadow: activePanel === 'upgrades' 
                    ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                    : 'none'
                }}
            >
                {label1}
            </button>
            <button 
                className={`switch-button ${activePanel === 'rebirth' ? 'active' : ''}`}
                onClick={() => onSwitch('rebirth')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  background: activePanel === 'rebirth' 
                    ? 'linear-gradient(135deg, #9333ea, #7c3aed)'
                    : 'transparent',
                  color: activePanel === 'rebirth' ? 'white' : '#94a3b8',
                  boxShadow: activePanel === 'rebirth' 
                    ? '0 4px 12px rgba(147, 51, 234, 0.3)'
                    : 'none'
                }}
            >
                {label2}
            </button>
            {showThirdButton && (
              <button 
                  className={`switch-button ${activePanel === 'achievements' ? 'active' : ''}`}
                  onClick={() => onSwitch('achievements')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    background: activePanel === 'achievements' 
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'transparent',
                    color: activePanel === 'achievements' ? 'white' : '#94a3b8',
                    boxShadow: activePanel === 'achievements' 
                      ? '0 4px 12px rgba(245, 158, 11, 0.3)'
                      : 'none'
                  }}
              >
                  {label3}
              </button>
            )}
        </div>
    )
}

export default SwitchButton;