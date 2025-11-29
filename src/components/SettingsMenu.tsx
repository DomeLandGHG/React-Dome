import { checkUsernameAvailability, reserveUsername, generateAccountCode, loginWithCode, saveGameDataToFirebase, loadGameDataFromFirebase, getUserId } from '../leaderboard';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  onOpenAnimationSettings: () => void;
  disableMoneyEffects: boolean;
  disableDiamondEffects: boolean;
  disablePackAnimations: boolean;
  username: string;
  onUsernameChange: (newUsername: string) => void;
  gameState: any;
}

const SettingsMenu = ({ isOpen, onClose, onReset, onOpenAnimationSettings, disableMoneyEffects, disableDiamondEffects, disablePackAnimations, username, onUsernameChange, gameState }: SettingsMenuProps) => {
  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      onReset();
      onClose();
    }
  };

  const handleManualSave = async () => {
    const userId = getUserId();
    alert(`Saving to cloud...\n\nUser ID: ${userId}\nUsername: ${username}\nMoney: ${gameState.money}\nRebirth Points: ${gameState.rebirthPoints}`);
    
    try {
      const success = await saveGameDataToFirebase(gameState);
      
      if (success) {
        alert(`✅ Successfully saved to cloud!\n\nUser ID: ${userId}\nUsername: ${username}\nMoney: ${gameState.money}\nRebirth Points: ${gameState.rebirthPoints}\n\nYour data is now in Firebase.`);
      } else {
        alert(`❌ Failed to save to cloud!\n\nPlease check your internet connection and Firebase settings.`);
      }
    } catch (error) {
      alert(`❌ Error saving to cloud!\n\n${error}`);
    }
  };

  const handleManualLoad = async () => {
    const userId = getUserId();
    const currentData = `Current Data:\nUser ID: ${userId}\nUsername: ${username}\nMoney: ${gameState.money}\nRebirth Points: ${gameState.rebirthPoints}`;
    
    // First, show what's in the cloud
    try {
      const cloudData = await loadGameDataFromFirebase();
      
      if (!cloudData) {
        alert(`⚠️ No cloud data found!\n\nUser ID: ${userId}\n\nThere is no saved data in Firebase for this account.\n\nUse "Save to Cloud Now" first to create a cloud save.`);
        return;
      }
      
      const cloudInfo = `Cloud Data:\nUsername: ${cloudData.username}\nMoney: ${cloudData.money}\nRebirth Points: ${cloudData.rebirthPoints}`;
      
      if (!window.confirm(`${currentData}\n\n${cloudInfo}\n\nLoad data from cloud?\n\nThis will REPLACE your current local data!`)) {
        return;
      }
      
      let debugLog = "🔍 DEBUG LOG:\n\n";
      
      // Step 0: Save User ID (WICHTIG!)
      const savedUserId = localStorage.getItem('money_clicker_user_id');
      debugLog += `0️⃣ User ID gesichert:\n   ${savedUserId}\n\n`;
      
      // Step 1: Check old data
      const oldSave = localStorage.getItem('moneyClickerSave');
      if (oldSave) {
        const oldParsed = JSON.parse(oldSave);
        debugLog += `1️⃣ Alte Daten gefunden:\n   Geld: ${oldParsed.money}\n   Rebirths: ${oldParsed.rebirthPoints}\n\n`;
      } else {
        debugLog += `1️⃣ Keine alten Daten\n\n`;
      }
      
      // Step 2: Clear localStorage completely
      debugLog += `2️⃣ LocalStorage wird gelöscht...\n`;
      localStorage.clear();
      const afterClear = localStorage.length;
      debugLog += `   Items übrig: ${afterClear}\n\n`;
      
      // Step 2.5: Restore User ID!
      if (savedUserId) {
        localStorage.setItem('money_clicker_user_id', savedUserId);
        debugLog += `2.5️⃣ User ID wiederhergestellt:\n   ${savedUserId}\n\n`;
      }
      
      // Step 3: Save cloud data
      debugLog += `3️⃣ Cloud-Daten werden gespeichert:\n   Geld: ${cloudData.money}\n   Rebirths: ${cloudData.rebirthPoints}\n\n`;
      localStorage.setItem('moneyClickerSave', JSON.stringify(cloudData));
      localStorage.setItem('firebase_data_loaded', 'true');
      
      // Step 4: Verify
      const newSave = localStorage.getItem('moneyClickerSave');
      if (newSave) {
        const newParsed = JSON.parse(newSave);
        debugLog += `4️⃣ ✅ GESPEICHERT:\n   Geld: ${newParsed.money}\n   Rebirths: ${newParsed.rebirthPoints}\n\n`;
      } else {
        debugLog += `4️⃣ ❌ FEHLER beim Speichern!\n\n`;
      }
      
      debugLog += `Seite wird in 5 Sekunden neu geladen...`;
      
      alert(debugLog);
      
      // Reload with delay so user can read
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      
    } catch (error) {
      console.error('[Manual Load] Error:', error);
      alert(`❌ Error loading from cloud!\n\n${error}\n\nPlease check:\n1. Internet connection\n2. Firebase is configured\n3. You saved data to cloud first`);
    }
  };

  const handleUsernameChange = async () => {
    const newUsername = window.prompt('Enter your new username (max 20 characters):', username);
    if (newUsername !== null && newUsername.trim() !== '') {
      const trimmed = newUsername.trim().slice(0, 20);
      
      // Check if username is available
      const isAvailable = await checkUsernameAvailability(trimmed);
      
      if (!isAvailable) {
        alert(`Username "${trimmed}" is already taken. Please choose another name.`);
        return;
      }
      
      // Reserve username in Firebase
      const reserved = await reserveUsername(trimmed);
      
      if (reserved) {
        onUsernameChange(trimmed);
        alert(`Username successfully changed to "${trimmed}"!`);
      } else {
        alert('Failed to reserve username. Please try again.');
      }
    }
  };

  const handleGetAccountCode = () => {
    const code = generateAccountCode();
    const userId = localStorage.getItem('money_clicker_user_id') || 'unknown';
    
    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        alert(`✅ Code copied to clipboard!\n\nYour Account Code:\n${code}\n\nUser ID: ${userId}\nUsername: ${username}\n\nUse this code to login on another device.`);
      }).catch((err) => {
        console.error('Clipboard error:', err);
        // Fallback if clipboard fails
        showCodeManually(code, userId);
      });
    } else {
      // Fallback for browsers that don't support clipboard API
      showCodeManually(code, userId);
    }
  };

  const showCodeManually = (code: string, userId: string) => {
    const message = `Your Account Code:\n\n${code}\n\nUser ID: ${userId}\nUsername: ${username}\n\nCopy this code manually to use on another device.`;
    
    // Create a textarea to allow manual copying
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.top = '50%';
    textarea.style.left = '50%';
    textarea.style.transform = 'translate(-50%, -50%)';
    textarea.style.width = '80%';
    textarea.style.padding = '20px';
    textarea.style.fontSize = '16px';
    textarea.style.zIndex = '10000';
    document.body.appendChild(textarea);
    textarea.select();
    
    alert(message + '\n\nThe code is now selected - you can copy it manually.');
    
    setTimeout(() => {
      document.body.removeChild(textarea);
    }, 30000); // Remove after 30 seconds
  };

  const handleLoginWithCode = async () => {
    const currentUserId = localStorage.getItem('money_clicker_user_id') || 'none';
    const code = window.prompt(`Enter your account code:\n\nCurrent User ID: ${currentUserId}\nCurrent Username: ${username}\n\nWarning: This will replace your current account!`);
    
    if (code && code.trim() !== '') {
      // Show loading message
      const loadingMessage = 'Logging in... Please wait...';
      alert(loadingMessage);
      
      const result = await loginWithCode(code.trim());
      
      if (result.success) {
        // Show detailed success info
        const successInfo = `✅ Login Successful!\n\nOld User ID: ${currentUserId}\nOld Username: ${username}\n\nNew User ID: ${result.userId}\n\nThe page will now reload to load your account data.`;
        alert(successInfo);
        
        // Wait a bit before reload so user can read the message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert(`❌ Login Failed!\n\nError: ${result.error}\n\nPlease check:\n1. The code is correct\n2. You have internet connection\n3. The account exists in Firebase`);
      }
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
        maxHeight: '90vh',
        overflowY: 'auto',
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
          {/* Version Section */}
          <div style={{
            background: 'rgba(100, 116, 139, 0.1)',
            border: '2px solid rgba(100, 116, 139, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#60a5fa',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              🎮 Money Clicker
            </div>
            <div style={{
              color: '#94a3b8',
              fontSize: '13px'
            }}>
              Version V.0.1.1
            </div>
          </div>

          {/* Username Section */}
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
              👤 Player Profile
            </h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#94a3b8',
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                Current Username
              </div>
              <div style={{
                color: '#ffd700',
                fontSize: '18px',
                fontWeight: 'bold',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
              }}>
                {username}
              </div>
            </div>
            <button
              onClick={handleUsernameChange}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: '2px solid #34d399',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              ✏️ Change Username
            </button>
          </div>

          {/* Account Sync Section */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{
              color: '#c4b5fd',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 12px 0'
            }}>
              🔄 Account Sync
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '13px',
              margin: '0 0 12px 0',
              lineHeight: '1.5'
            }}>
              Play on multiple devices with the same account!
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                onClick={handleManualSave}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: '2px solid #34d399',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }}
              >
                💾 Save to Cloud Now
              </button>
              <button
                onClick={handleManualLoad}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: 'white',
                  border: '2px solid #38bdf8',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.4)';
                }}
              >
                ☁️ Load from Cloud
              </button>
              <button
                onClick={handleGetAccountCode}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  border: '2px solid #a78bfa',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }}
              >
                📋 Get Account Code
              </button>
              <button
                onClick={handleLoginWithCode}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: 'white',
                  border: '2px solid #22d3ee',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(6, 182, 212, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.4)';
                }}
              >
                🔑 Login with Code
              </button>
            </div>
          </div>

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

          {/* Discord Section */}
          <div style={{
            background: 'rgba(88, 101, 242, 0.1)',
            border: '2px solid rgba(88, 101, 242, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h3 style={{
              color: '#a5b4fc',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '0 0 12px 0'
            }}>
              💬 Community
            </h3>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              margin: '0 0 12px 0',
              lineHeight: '1.5'
            }}>
              Join our Discord server for updates, bug reports, and feature suggestions!
            </p>
            <button
              onClick={() => window.open('https://discord.gg/rgvnzbeB', '_blank')}
              style={{
                background: 'linear-gradient(135deg, #5865f2, #4752c4)',
                color: 'white',
                border: '2px solid #4752c4',
                padding: '12px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(88, 101, 242, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(88, 101, 242, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(88, 101, 242, 0.4)';
              }}
            >
              💬 Join Discord Server
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
