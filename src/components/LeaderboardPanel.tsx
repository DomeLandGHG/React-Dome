import { useState, useEffect } from 'react';
import { getTopLeaderboard, getUserRank, getUserId } from '../leaderboard';
import type { GameState } from '../types';

interface LeaderboardPanelProps {
  gameState: GameState;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  allTimeMoney: number;
  totalTiers: number;
  moneyPerClick: number;
  onlineTime: number;
  timestamp: number;
}

type LeaderboardCategory = 'allTimeMoney' | 'totalTiers' | 'moneyPerClick' | 'onlineTime';

const LeaderboardPanel = ({ gameState }: LeaderboardPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('allTimeMoney');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const currentUserId = getUserId();

  const categories = [
    { id: 'allTimeMoney' as LeaderboardCategory, label: '💰 All Time Money', icon: '💰' },
    { id: 'totalTiers' as LeaderboardCategory, label: '🏆 Total Tiers', icon: '🏆' },
    { id: 'moneyPerClick' as LeaderboardCategory, label: '👆 Money Per Click', icon: '👆' },
    { id: 'onlineTime' as LeaderboardCategory, label: '⏰ Online Time', icon: '⏰' },
  ];

  const formatValue = (category: LeaderboardCategory, value: number): string => {
    switch (category) {
      case 'allTimeMoney':
      case 'moneyPerClick':
        return value.toLocaleString('de-DE');
      case 'totalTiers':
        return value.toString();
      case 'onlineTime':
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      default:
        return value.toString();
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        console.log('[Leaderboard Panel] Loading data for category:', selectedCategory, 'at', new Date().toLocaleTimeString());
        const data = await getTopLeaderboard(selectedCategory, 100);
        console.log('[Leaderboard Panel] Received data:', data.length, 'entries');
        
        // Don't filter out any accounts - show everyone
        setLeaderboardData(data);
        const rank = await getUserRank(currentUserId, selectedCategory);
        setUserRank(rank);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load immediately when category changes
    loadLeaderboard();
    
    // Calculate time until next full minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    console.log('[Leaderboard Panel] Next refresh in', Math.round(msUntilNextMinute / 1000), 'seconds');

    let intervalId: number | null = null;

    // Wait until the next full minute, then refresh every 60 seconds
    const timeoutId = setTimeout(() => {
      loadLeaderboard();
      intervalId = setInterval(loadLeaderboard, 60000);
    }, msUntilNextMinute);
    
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedCategory, currentUserId]);

  const getRankColor = (rank: number): string => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#94a3b8';
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '2px solid #3b82f6',
      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <h2 style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0,
        textAlign: 'center',
        textShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
        position: 'relative'
      }}>
        🏆 Leaderboard
      </h2>

      {/* Category Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              background: selectedCategory === cat.id
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'rgba(59, 130, 246, 0.1)',
              border: selectedCategory === cat.id ? '2px solid #60a5fa' : '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textShadow: selectedCategory === cat.id ? '0 0 8px rgba(0, 0, 0, 0.5)' : 'none',
              boxShadow: selectedCategory === cat.id ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none',
            }}
          >
            {cat.icon} {cat.label.replace(/💰|🏆|👆|⏰/g, '').trim()}
          </button>
        ))}
      </div>

      {/* Your Rank */}
      {userRank > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          border: '2px solid #fcd34d',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
        }}>
          <div style={{
            color: '#422006',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Your Rank: {getRankIcon(userRank)}
          </div>
          <div style={{
            color: '#422006',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {formatValue(selectedCategory, (gameState.stats as any)[selectedCategory] || (gameState as any)[selectedCategory] || 0)}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          color: '#94a3b8',
          textAlign: 'center',
          padding: '40px',
          fontSize: '14px'
        }}>
          Loading leaderboard...
        </div>
      )}

      {/* Leaderboard List */}
      {!loading && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px'
        }}>
          {leaderboardData.length === 0 ? (
            <div style={{
              color: '#94a3b8',
              textAlign: 'center',
              padding: '40px',
              fontSize: '14px'
            }}>
              No entries yet. Be the first!
            </div>
          ) : (
            leaderboardData.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.userId === currentUserId;
              
              return (
                <div
                  key={entry.userId}
                  style={{
                    background: isCurrentUser
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)'
                      : 'rgba(0, 0, 0, 0.3)',
                    border: isCurrentUser ? '2px solid #fbbf24' : '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: isCurrentUser ? '0 0 15px rgba(251, 191, 36, 0.3)' : 'none'
                  }}
                >
                  {/* Top Row: Rank + Username */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {/* Rank */}
                    <div style={{
                      minWidth: '50px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: getRankColor(rank),
                      textShadow: rank <= 3 ? `0 0 10px ${getRankColor(rank)}` : 'none',
                      flexShrink: 0
                    }}>
                      {getRankIcon(rank)}
                    </div>

                    {/* Username */}
                    <div style={{
                      flex: 1,
                      color: isCurrentUser ? '#fbbf24' : '#e2e8f0',
                      fontSize: '14px',
                      fontWeight: isCurrentUser ? 'bold' : 'normal',
                      wordBreak: 'break-word',
                      lineHeight: '1.3'
                    }}>
                      {entry.username}
                      {isCurrentUser && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '12px',
                          color: '#fbbf24',
                          opacity: 0.8
                        }}>
                          (You)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Value + Timestamp */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: '62px'
                  }}>
                    {/* Value */}
                    <div style={{
                      color: isCurrentUser ? '#fbbf24' : '#60a5fa',
                      fontSize: '15px',
                      fontWeight: 'bold'
                    }}>
                      {formatValue(selectedCategory, (entry as any)[selectedCategory] || 0)}
                    </div>

                    {/* Timestamp */}
                    <div style={{
                      color: '#64748b',
                      fontSize: '11px'
                    }}>
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPanel;
