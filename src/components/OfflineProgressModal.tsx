import { createPortal } from 'react-dom';
import { formatNumberGerman } from '../types/German_number';

interface OfflineProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  offlineTime: number; // in seconds
  moneyEarned: number;
  clicksEarned?: number; // Optional: auto clicks from Rebirth Upgrade
}

const OfflineProgressModal = ({ isOpen, onClose, offlineTime, moneyEarned, clicksEarned }: OfflineProgressModalProps) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        border: '3px solid #22c55e',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        zIndex: 9999,
        minWidth: '450px',
        maxWidth: '90vw',
        animation: 'slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '72px',
          marginBottom: '20px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          💰
        </div>

        {/* Title */}
        <h2 style={{
          color: '#22c55e',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 16px 0',
          textShadow: '0 0 20px rgba(34, 197, 94, 0.6)'
        }}>
          Welcome Back!
        </h2>

        {/* Offline Time */}
        <p style={{
          color: '#cbd5e1',
          fontSize: '16px',
          margin: '0 0 24px 0'
        }}>
          You were away for <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{formatTime(offlineTime)}</span>
        </p>

        {/* Money Earned Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
          border: '2px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            Passive Income Earned
          </div>
          <div style={{
            color: '#22c55e',
            fontSize: '36px',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(34, 197, 94, 0.8)'
          }}>
            +{formatNumberGerman(moneyEarned)}$
          </div>
        </div>

        {/* Auto Clicks Box (if applicable) */}
        {clicksEarned && clicksEarned > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)',
            border: '2px solid rgba(147, 51, 234, 0.5)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              color: '#94a3b8',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Auto Clicker Generated
            </div>
            <div style={{
              color: '#a78bfa',
              fontSize: '28px',
              fontWeight: 'bold',
              textShadow: '0 0 15px rgba(147, 51, 234, 0.8)'
            }}>
              +{formatNumberGerman(clicksEarned)} Clicks
            </div>
          </div>
        )}

        {/* Info */}
        <p style={{
          color: '#94a3b8',
          fontSize: '13px',
          margin: '0 0 24px 0',
          fontStyle: 'italic'
        }}>
          💡 Offline progress is capped at 6 hours (50% efficiency)
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
            border: '3px solid #15803d',
            borderRadius: '16px',
            padding: '16px 40px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(34, 197, 94, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
        >
          Claim Rewards! ✨
        </button>
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
        
        @keyframes slideInBounce {
          0% {
            opacity: 0;
            transform: translate(-50%, -60%) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translate(-50%, -48%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.5));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.8));
          }
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default OfflineProgressModal;
