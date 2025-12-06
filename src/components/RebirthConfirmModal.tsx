import { createPortal } from 'react-dom';
import { formatNumberGerman } from '../types/German_number';

interface RebirthConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  rebirthPoints: number;
  currentMoney: number;
}

export const RebirthConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  rebirthPoints,
  currentMoney 
}: RebirthConfirmModalProps) => {
  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '3px solid #7c3aed',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(124, 58, 237, 0.5)',
        zIndex: 10001,
        width: '90vw',
        maxWidth: '500px',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px'
          }}>🔄</div>
          <h2 style={{
            color: '#a855f7',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            textShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
          }}>
            Confirm Rebirth
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            margin: 0
          }}>
            Are you sure you want to rebirth?
          </p>
        </div>

        {/* Reward Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
          border: '2px solid #7c3aed',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#c4b5fd',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            You will receive:
          </div>
          <div style={{
            color: '#a855f7',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
          }}>
            {formatNumberGerman(rebirthPoints)} RP
          </div>
        </div>

        {/* Reset Warning */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            color: '#fca5a5',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            ⚠️ This will reset:
          </div>
          <div style={{
            color: '#cbd5e1',
            fontSize: '13px',
            lineHeight: '1.8'
          }}>
            • All money ({formatNumberGerman(currentMoney)}$)<br/>
            • All normal upgrades<br/>
            • All clicks in this run
          </div>
        </div>

        {/* Keep Info */}
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            color: '#86efac',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}>
            ✓ You will keep:
          </div>
          <div style={{
            color: '#cbd5e1',
            fontSize: '13px',
            lineHeight: '1.8'
          }}>
            • Rebirth Points & Rebirth Upgrades<br/>
            • Gems & All Runes<br/>
            • Elemental Resources & Prestige<br/>
            • All Achievements
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              background: 'rgba(148, 163, 184, 0.2)',
              border: '2px solid #475569',
              borderRadius: '12px',
              color: '#cbd5e1',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
              border: '2px solid #6d28d9',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
            }}
          >
            🔄 Confirm Rebirth
          </button>
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

  // Render modal directly to document.body using portal to ensure it's on top
  return createPortal(modalContent, document.body);
};
