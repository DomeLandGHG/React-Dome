import React, { useState } from 'react';

interface ElementalConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementalResources: number[];
  onConvert: (fromIndex: number, toIndex: number, amount: number) => void;
}

const ELEMENT_NAMES = ['Air', 'Earth', 'Water', 'Fire', 'Light', 'Dark'];
const ELEMENT_ICONS = ['💨', '🌍', '💧', '🔥', '✨', '🌑'];
const ELEMENT_COLORS = ['#60a5fa', '#a78bfa', '#3b82f6', '#f97316', '#fbbf24', '#7c3aed'];

export const ElementalConverterModal: React.FC<ElementalConverterModalProps> = ({
  isOpen,
  onClose,
  elementalResources,
  onConvert
}) => {
  const [fromElement, setFromElement] = useState(0);
  const [toElement, setToElement] = useState(1);
  const [amount, setAmount] = useState(100);

  if (!isOpen) return null;

  const conversionRate = 0.8; // 80% conversion rate (20% loss)
  const convertedAmount = Math.floor(amount * conversionRate);
  const canConvert = elementalResources[fromElement] >= amount && fromElement !== toElement;

  const handleConvert = () => {
    if (canConvert) {
      onConvert(fromElement, toElement, amount);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        border: '3px solid #64748b',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid #ef4444',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            cursor: 'pointer',
            color: '#ef4444',
            fontSize: '20px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          ✕
        </button>

        <h2 style={{
          color: '#f1f5f9',
          textAlign: 'center',
          marginBottom: '10px',
          fontSize: '28px',
          fontWeight: 'bold',
          textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
        }}>
          🔮 Elemental Converter
        </h2>

        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          Convert elements with 80% efficiency (20% loss)
        </p>

        {/* Conversion Interface */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {/* From Element */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              color: '#cbd5e1',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              From:
            </div>
            <select
              value={fromElement}
              onChange={(e) => setFromElement(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                background: '#334155',
                border: '2px solid #475569',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {ELEMENT_NAMES.map((name, index) => (
                <option key={index} value={index}>
                  {ELEMENT_ICONS[index]} {name} ({elementalResources[index].toFixed(0)})
                </option>
              ))}
            </select>
          </div>

          {/* Arrow */}
          <div style={{
            fontSize: '30px',
            color: '#64748b',
            alignSelf: 'flex-end',
            marginBottom: '12px'
          }}>
            →
          </div>

          {/* To Element */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              color: '#cbd5e1',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              To:
            </div>
            <select
              value={toElement}
              onChange={(e) => setToElement(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                background: '#334155',
                border: '2px solid #475569',
                borderRadius: '10px',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {ELEMENT_NAMES.map((name, index) => (
                <option key={index} value={index}>
                  {ELEMENT_ICONS[index]} {name} ({elementalResources[index].toFixed(0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            color: '#cbd5e1',
            marginBottom: '10px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Amount to Convert:
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            min="1"
            max={elementalResources[fromElement]}
            style={{
              width: '100%',
              padding: '12px',
              background: '#334155',
              border: '2px solid #475569',
              borderRadius: '10px',
              color: 'white',
              fontSize: '16px'
            }}
          />
          <button
            onClick={() => setAmount(Math.floor(elementalResources[fromElement]))}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#475569',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Max ({Math.floor(elementalResources[fromElement])})
          </button>
        </div>

        {/* Conversion Preview */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#cbd5e1',
            fontSize: '14px',
            marginBottom: '10px'
          }}>
            You will convert:
          </div>
          <div style={{
            color: ELEMENT_COLORS[fromElement],
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            {ELEMENT_ICONS[fromElement]} -{amount} {ELEMENT_NAMES[fromElement]}
          </div>
          <div style={{
            color: '#64748b',
            fontSize: '18px',
            margin: '10px 0'
          }}>
            ↓
          </div>
          <div style={{
            color: ELEMENT_COLORS[toElement],
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {ELEMENT_ICONS[toElement]} +{convertedAmount} {ELEMENT_NAMES[toElement]}
          </div>
          <div style={{
            color: '#94a3b8',
            fontSize: '12px',
            marginTop: '10px'
          }}>
            (80% efficiency - {amount - convertedAmount} lost)
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={!canConvert}
          style={{
            width: '100%',
            padding: '15px',
            background: canConvert
              ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
              : '#475569',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: canConvert ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: canConvert ? 1 : 0.5
          }}
          onMouseEnter={(e) => {
            if (canConvert) {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {fromElement === toElement ? '⚠️ Select different elements' : canConvert ? '🔮 Convert Elements' : '❌ Not enough resources'}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
