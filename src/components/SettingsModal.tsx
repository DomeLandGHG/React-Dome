import React from 'react';
import '../styles/SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  disableMoneyEffects: boolean;
  disableDiamondEffects: boolean;
  disablePackAnimations: boolean;
  disableCraftAnimations: boolean;
  onToggleMoneyEffects: (enabled: boolean) => void;
  onToggleDiamondEffects: (enabled: boolean) => void;
  onTogglePackAnimations: (enabled: boolean) => void;
  onToggleCraftAnimations: (enabled: boolean) => void;
  onManualSave?: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  disableMoneyEffects,
  disableDiamondEffects,
  disablePackAnimations,
  disableCraftAnimations,
  onToggleMoneyEffects,
  onToggleDiamondEffects,
  onTogglePackAnimations,
  onToggleCraftAnimations,
  onManualSave,
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleManualSave = async () => {
    if (!onManualSave) return;
    setIsSaving(true);
    await onManualSave();
    setTimeout(() => setIsSaving(false), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Animations</h3>
            <p className="settings-description">
              Disable animations for better performance
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
                  Pack Opening Animations
                </span>
              </label>
              <p className="option-description">
                Shows animated card reveal when opening Rune Packs
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
                  Money Animations
                </span>
              </label>
              <p className="option-description">
                Shows floating numbers when earning money
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
                  Diamond Animations
                </span>
              </label>
              <p className="option-description">
                Shows floating numbers when earning diamonds
              </p>
            </div>

            <div className="settings-option">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={!disableCraftAnimations}
                  onChange={(e) => onToggleCraftAnimations(!e.target.checked)}
                />
                <span className="checkbox-label">
                  <span className="checkbox-icon">✨</span>
                  Craft Animations
                </span>
              </label>
              <p className="option-description">
                Shows animated effects when crafting Secret Runes
              </p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button 
            className="settings-save-button" 
            onClick={handleManualSave}
            disabled={isSaving || !onManualSave}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Now'}
          </button>
          <button className="settings-done-button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
