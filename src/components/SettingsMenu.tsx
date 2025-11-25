interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

const SettingsMenu = ({ isOpen, onClose, onReset }: SettingsMenuProps) => {
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

          {/* Placeholder for future settings */}
          <div style={{
            background: 'rgba(100, 116, 139, 0.1)',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              margin: 0,
              fontStyle: 'italic'
            }}>
              More settings coming soon...
            </p>
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
