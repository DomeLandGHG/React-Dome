import React from 'react';
import '../styles/SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  disableMoneyEffects: boolean;
  disableDiamondEffects: boolean;
  disablePackAnimations: boolean;
  onToggleMoneyEffects: (enabled: boolean) => void;
  onToggleDiamondEffects: (enabled: boolean) => void;
  onTogglePackAnimations: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  disableMoneyEffects,
  disableDiamondEffects,
  disablePackAnimations,
  onToggleMoneyEffects,
  onToggleDiamondEffects,
  onTogglePackAnimations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Einstellungen</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Animationen</h3>
            <p className="settings-description">
              Deaktiviere Animationen für bessere Performance
            </p>

            <div className="settings-option">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={!disablePackAnimations}
                  onChange={(e) => onTogglePackAnimations(!e.target.checked)}
                />
                <span className="checkbox-label">
                  <span className="checkbox-icon">📦</span>
                  Pack-Öffnungs-Animationen
                </span>
              </label>
              <p className="option-description">
                Zeigt die animierte Kartenaufdeckung beim Öffnen von Rune Packs
              </p>
            </div>

            <div className="settings-option">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={!disableMoneyEffects}
                  onChange={(e) => onToggleMoneyEffects(!e.target.checked)}
                />
                <span className="checkbox-label">
                  <span className="checkbox-icon">💰</span>
                  Geld-Animationen
                </span>
              </label>
              <p className="option-description">
                Zeigt aufsteigende Zahlen beim Verdienen von Geld
              </p>
            </div>

            <div className="settings-option">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={!disableDiamondEffects}
                  onChange={(e) => onToggleDiamondEffects(!e.target.checked)}
                />
                <span className="checkbox-label">
                  <span className="checkbox-icon">💎</span>
                  Diamant-Animationen
                </span>
              </label>
              <p className="option-description">
                Zeigt aufsteigende Zahlen beim Verdienen von Diamanten
              </p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-done-button" onClick={onClose}>
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
