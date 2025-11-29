import { useState, useEffect, useRef } from 'react';
import { db, dbRef, dbSet, dbGet } from '../firebase';

interface MultiInstanceWarningProps {
  userId: string;
}

export const MultiInstanceWarning: React.FC<MultiInstanceWarningProps> = ({ userId }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [otherInstanceTime, setOtherInstanceTime] = useState<string>('');
  const [otherInstanceDevice, setOtherInstanceDevice] = useState<string>('');
  const instanceIdRef = useRef<string>(`instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const HEARTBEAT_INTERVAL = 3000; // Check every 3 seconds
    const TIMEOUT_THRESHOLD = 6000; // Consider dead after 6 seconds
    const myInstanceId = instanceIdRef.current;
    
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    const instancesRef = dbRef(db, `activeInstances/${userId}`);

    const updateHeartbeat = async () => {
      try {
        const myInstanceRef = dbRef(db, `activeInstances/${userId}/${myInstanceId}`);
        await dbSet(myInstanceRef, {
          timestamp: Date.now(),
          device: deviceType
        });
      } catch (error) {
        console.error('[Multi-Instance] Failed to update heartbeat:', error);
      }
    };

    const checkForOtherInstances = async () => {
      try {
        const snapshot = await dbGet(instancesRef);
        
        if (!snapshot.exists()) {
          setShowWarning(false);
          return;
        }

        const instances = snapshot.val();
        const now = Date.now();
        let foundOtherInstance = false;
        let otherDevice = '';
        let otherTime = '';

        for (const [instanceId, instanceData] of Object.entries(instances as Record<string, any>)) {
          if (instanceId === myInstanceId) {
            continue;
          }

          const timeSinceLastHeartbeat = now - instanceData.timestamp;

          if (timeSinceLastHeartbeat < TIMEOUT_THRESHOLD) {
            foundOtherInstance = true;
            otherDevice = instanceData.device || 'Unknown';
            otherTime = new Date(instanceData.timestamp).toLocaleTimeString();
            break;
          }
        }

        if (foundOtherInstance) {
          setOtherInstanceTime(otherTime);
          setOtherInstanceDevice(otherDevice);
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('[Multi-Instance] Failed to check instances:', error);
      }
    };

    // Claim instance immediately (async IIFE)
    (async () => {
      await updateHeartbeat();

      // Initial check after a delay to let heartbeat settle in Firebase
      setTimeout(() => {
        checkForOtherInstances();
      }, 2000);
    })();

    // Regular heartbeat and checking
    const heartbeatInterval = setInterval(() => {
      checkForOtherInstances(); // Check FIRST
      updateHeartbeat(); // Then update our heartbeat
    }, HEARTBEAT_INTERVAL);

    // Cleanup on unmount - remove our heartbeat
    return () => {
      clearInterval(heartbeatInterval);
      // Remove our instance from Firebase
      const myInstanceRef = dbRef(db, `activeInstances/${userId}/${myInstanceId}`);
      dbSet(myInstanceRef, null).catch((error) => {
        console.error('[Multi-Instance] Cleanup error:', error);
      });
    };
  }, [userId]);

  if (!showWarning) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        border: '3px solid #ff6b6b',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 0 50px rgba(255, 107, 107, 0.5)',
      }}>
        <h1 style={{
          color: '#ff6b6b',
          fontSize: '2em',
          marginBottom: '20px',
          textShadow: '0 0 10px rgba(255, 107, 107, 0.8)',
        }}>
          ⚠️ WARNUNG ⚠️
        </h1>
        
        <h2 style={{
          color: '#ffcc00',
          fontSize: '1.5em',
          marginBottom: '15px',
        }}>
          Mehrere Instanzen aktiv!
        </h2>
        
        <p style={{
          color: '#ffffff',
          fontSize: '1.1em',
          marginBottom: '20px',
          lineHeight: '1.6',
        }}>
          Das Spiel ist bereits in einem anderen Tab oder auf einem anderen Gerät geöffnet!
        </p>
        
        <div style={{
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: '0.9em',
            marginBottom: '10px',
          }}>
            Gerät: <strong>{otherInstanceDevice}</strong>
          </p>
          <p style={{
            color: '#ffffff',
            fontSize: '0.9em',
            marginBottom: '10px',
          }}>
            Letzte Aktivität: <strong>{otherInstanceTime}</strong>
          </p>
          <p style={{
            color: '#ffcc00',
            fontSize: '0.9em',
            fontWeight: 'bold',
          }}>
            Bitte schließe die andere Instanz, um Datenverlust zu vermeiden!
          </p>
        </div>

        <div style={{
          fontSize: '0.85em',
          color: '#888',
          marginTop: '20px',
          padding: '10px',
          borderTop: '1px solid #444',
        }}>
          <p>💡 Tipp: Wenn du sicher bist, dass keine andere Instanz läuft,</p>
          <p>warte 5 Sekunden und lade die Seite neu.</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            fontSize: '1em',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff5252';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ff6b6b';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          🔄 Seite neu laden
        </button>
      </div>
    </div>
  );
};
