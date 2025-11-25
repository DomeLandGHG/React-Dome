interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  onOpenAnimationSettings: () => void;
  disableMoneyEffects: boolean;
  disableDiamondEffects: boolean;
  disablePackAnimations: boolean;
}

const SettingsMenu = ({ isOpen, onClose, onReset, onOpenAnimationSettings, disableMoneyEffects, disableDiamondEffects, disablePackAnimations }: SettingsMenuProps) => {
  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      onReset();
      onClose();
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />
      
      {/* Settings Menu */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        border: '3px solid #64748b',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        minWidth: '400px',
        maxWidth: '90vw',
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
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Animations Section */}
          <div style={{
            background: 'rgba(100, 116, 139, 0.1)',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{
              color: '#a0a0c0',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 12px 0'
            }}>
              🎬 Animationen
            </h3>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                background: disablePackAnimations ? 'rgba(220, 38, 38, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: disablePackAnimations ? '#fca5a5' : '#86efac',
                border: `1px solid ${disablePackAnimations ? 'rgba(220, 38, 38, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
              }}>
                📦 Packs: {disablePackAnimations ? 'AUS' : 'AN'}
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                background: disableMoneyEffects ? 'rgba(220, 38, 38, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: disableMoneyEffects ? '#fca5a5' : '#86efac',
                border: `1px solid ${disableMoneyEffects ? 'rgba(220, 38, 38, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
              }}>
                💰 Geld: {disableMoneyEffects ? 'AUS' : 'AN'}
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                background: disableDiamondEffects ? 'rgba(220, 38, 38, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: disableDiamondEffects ? '#fca5a5' : '#86efac',
                border: `1px solid ${disableDiamondEffects ? 'rgba(220, 38, 38, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
              }}>
                💎 Diamanten: {disableDiamondEffects ? 'AUS' : 'AN'}
              </span>
            </div>
            <button
              onClick={() => {
                onOpenAnimationSettings();
                onClose();
              }}
              style={{
                background: 'linear-gradient(135deg, #4a9eff, #357abd)',
                color: 'white',
                border: '2px solid #2563eb',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(74, 158, 255, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 158, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 158, 255, 0.4)';
              }}
            >
              ⚙️ Animationen Anpassen
            </button>
          </div>

          {/* Reset Section */}
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '2px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{
              color: '#fca5a5',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 12px 0'
            }}>
              ⚠️ Danger Zone
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              margin: '0 0 12px 0',
              lineHeight: '1.5'
            }}>
              Reset all progress and start over from the beginning.
            </p>
            <button
              onClick={handleReset}
              style={{
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: 'white',
                border: '2px solid #b91c1c',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
              }}
            >
              ⚠️ Reset All Progress
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

export default SettingsMenu;
