import { db, dbRef, dbSet, dbGet } from './firebase';
import type { GameState } from './types';
import { INITIAL_GAME_STATE } from './types';
import { RUNES_1 } from './types/Runes';
import { REBIRTHUPGRADES } from './types/Rebirth_Upgrade';
import { EVENT_CONFIG } from './types/ElementalEvent';

// User ID generation (stored in localStorage to persist across sessions)
export const getUserId = (): string => {
  let userId = localStorage.getItem('money_clicker_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('money_clicker_user_id', userId);
  }
  return userId;
};

// Set User ID (for login on another device)
export const setUserId = (userId: string): void => {
  localStorage.setItem('money_clicker_user_id', userId);
};

// Generate a shareable account code
export const generateAccountCode = (): string => {
  const userId = getUserId();
  // Create a base64-encoded version of the user ID for easier sharing
  return btoa(userId);
};

// Login with account code
export const loginWithCode = async (code: string): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    console.log('[Login] Starting login with code...');
    
    // Decode the account code
    const userId = atob(code);
    console.log('[Login] Decoded user ID:', userId);
    
    // Verify the account exists in Firebase
    const userRef = dbRef(db, `users/${userId}`);
    const snapshot = await dbGet(userRef);
    
    if (!snapshot.exists()) {
      console.log('[Login] ❌ Account not found in users/');
      return { success: false, error: 'Account not found. Make sure the code is correct.' };
    }
    
    console.log('[Login] ✅ Account found in Firebase');
    
    // Load game data from Firebase FIRST
    const gameDataRef = dbRef(db, `gameData/${userId}`);
    const gameDataSnapshot = await dbGet(gameDataRef);
    
    if (!gameDataSnapshot.exists()) {
      console.log('[Login] ⚠️ No game data found in Firebase for this account at path:', `gameData/${userId}`);
      return { success: false, error: 'No saved game data found for this account. Save to cloud first on the original device.' };
    }
    
    const gameData = gameDataSnapshot.val();
    console.log('[Login] ✅ Game data found in Firebase');
    console.log('[Login] Loaded username:', gameData.username);
    console.log('[Login] Loaded money:', gameData.money);
    console.log('[Login] Loaded rebirth points:', gameData.rebirthPoints);
    
    // Clear ALL localStorage data to ensure clean state
    console.log('[Login] Clearing localStorage...');
    localStorage.clear();
    
    // Set the new user ID
    setUserId(userId);
    console.log('[Login] ✅ User ID set in localStorage:', userId);
    
    return { success: true, userId };
  } catch (error) {
    console.error('[Login] ❌ Error during login:', error);
    return { success: false, error: 'Invalid account code format or connection error.' };
  }
};

// Create new account (similar to loginWithCode but with fresh data)
export const createNewAccount = async (): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    console.log('[New Account] Starting new account creation...');
    
    // Clear ALL localStorage data to ensure clean state
    console.log('[New Account] Clearing localStorage...');
    localStorage.clear();
    
    // Generate new user ID (getUserId will create a new one since localStorage is empty)
    const newUserId = getUserId();
    console.log('[New Account] ✅ New User ID generated:', newUserId);
    
    // Prepare initial data with current timestamp
    const initialData = {
      ...INITIAL_GAME_STATE,
      lastSaveTime: Date.now()
    };
    
    // Save initial data to Firebase
    const gameDataRef = dbRef(db, `gameData/${newUserId}`);
    await dbSet(gameDataRef, initialData);
    console.log('[New Account] ✅ Initial data saved to Firebase at path:', `gameData/${newUserId}`);
    
    // Create user entry in Firebase
    const userRef = dbRef(db, `users/${newUserId}`);
    await dbSet(userRef, {
      username: initialData.username,
      rebirthPoints: 0,
      money: 0,
      createdAt: Date.now()
    });
    console.log('[New Account] ✅ User entry created in Firebase');
    
    return { success: true, userId: newUserId };
  } catch (error) {
    console.error('[New Account] ❌ Error creating new account:', error);
    return { success: false, error: 'Failed to create new account. Please try again.' };
  }
};

// Save game data to Firebase
export const saveGameDataToFirebase = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = getUserId();
    console.log('[Firebase Save] Saving game data for user:', userId);
    console.log('[Firebase Save] Username:', gameState.username);
    console.log('[Firebase Save] Money:', gameState.money);
    console.log('[Firebase Save] Rebirth Points:', gameState.rebirthPoints);
    
    const gameDataRef = dbRef(db, `gameData/${userId}`);
    await dbSet(gameDataRef, gameState);
    console.log('[Firebase Save] ✅ Game data saved successfully to path:', `gameData/${userId}`);
    return true;
  } catch (error) {
    console.error('[Firebase Save] ❌ Error saving game data:', error);
    return false;
  }
};

// Load game data from Firebase
export const loadGameDataFromFirebase = async (): Promise<GameState | null> => {
  try {
    const userId = getUserId();
    console.log('[Firebase Load] Loading game data for user:', userId);
    
    const gameDataRef = dbRef(db, `gameData/${userId}`);
    const snapshot = await dbGet(gameDataRef);
    
    if (snapshot.exists()) {
      const gameData = snapshot.val();
      
      // Merge with INITIAL_GAME_STATE to ensure all properties exist
      const mergedData = {
        ...INITIAL_GAME_STATE,
        ...gameData,
      };
      
      // Explicitly ensure critical arrays exist (override if undefined)
      if (mergedData.achievements === undefined || mergedData.achievements === null) {
        mergedData.achievements = [];
      }
      if (mergedData.runes === undefined || mergedData.runes === null) {
        mergedData.runes = INITIAL_GAME_STATE.runes;
      }
      if (mergedData.elementalRunes === undefined || mergedData.elementalRunes === null) {
        mergedData.elementalRunes = INITIAL_GAME_STATE.elementalRunes;
      }
      if (mergedData.rebirth_upgradeAmounts === undefined || mergedData.rebirth_upgradeAmounts === null) {
        mergedData.rebirth_upgradeAmounts = INITIAL_GAME_STATE.rebirth_upgradeAmounts;
      }
      if (mergedData.upgradeAmounts === undefined || mergedData.upgradeAmounts === null) {
        mergedData.upgradeAmounts = INITIAL_GAME_STATE.upgradeAmounts;
      }
      
      return mergedData;
    }
    
    console.log('[Firebase Load] ⚠️ No game data found');
    return null;
  } catch (error) {
    console.error('[Firebase Load] ❌ Error loading game data:', error);
    return null;
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const currentUserId = getUserId();
    console.log('[Username Check] Checking availability for:', username, 'User ID:', currentUserId);
    
    // Get all usernames and check manually (no index required)
    const usernamesRef = dbRef(db, 'usernames');
    const snapshot = await dbGet(usernamesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('[Username Check] All username entries:', data);
      
      // Check each entry for matching username
      for (const [userId, entry] of Object.entries(data)) {
        if (entry && typeof entry === 'object' && 'username' in entry) {
          const entryUsername = (entry as { username: string }).username;
          console.log('[Username Check] Checking entry - userId:', userId, 'username:', entryUsername);
          
          if (entryUsername.toLowerCase() === username.toLowerCase()) {
            console.log('[Username Check] Found matching username');
            if (userId === currentUserId) {
              console.log('[Username Check] Username belongs to current user - AVAILABLE');
              return true; // It's the current user's own username
            } else {
              console.log('[Username Check] Username belongs to another user - NOT AVAILABLE');
              return false; // Username belongs to someone else
            }
          }
        }
      }
    }
    
    console.log('[Username Check] Username does not exist - AVAILABLE');
    return true; // Username doesn't exist, it's available
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

// Reserve username for user
export const reserveUsername = async (username: string): Promise<boolean> => {
  try {
    const userId = getUserId();
    console.log('[Reserve Username] Starting reservation for:', username, 'User ID:', userId);
    
    // Get old username before checking availability
    const oldUsernameRef = dbRef(db, `users/${userId}/username`);
    const oldUsernameSnapshot = await dbGet(oldUsernameRef);
    const oldUsername = oldUsernameSnapshot.exists() ? oldUsernameSnapshot.val() : null;
    console.log('[Reserve Username] Old username:', oldUsername);
    
    // If trying to set the same username as current, just return success
    if (oldUsername === username) {
      console.log('[Reserve Username] Same as current username - returning success');
      return true;
    }
    
    // Check if new username is available (this will allow current user's own username)
    const isAvailable = await checkUsernameAvailability(username);
    console.log('[Reserve Username] Availability check result:', isAvailable);
    if (!isAvailable) {
      return false;
    }
    
    // Remove old username from usernames list if exists
    if (oldUsername) {
      console.log('[Reserve Username] Removing old username entry');
      const oldUsernameEntryRef = dbRef(db, `usernames/${userId}`);
      await dbSet(oldUsernameEntryRef, null);
    }
    
    // Reserve new username
    console.log('[Reserve Username] Setting new username in usernames list');
    const usernameRef = dbRef(db, `usernames/${userId}`);
    await dbSet(usernameRef, {
      username: username,
      timestamp: Date.now()
    });
    
    // Update user's username
    console.log('[Reserve Username] Updating user profile with new username');
    const userUsernameRef = dbRef(db, `users/${userId}/username`);
    await dbSet(userUsernameRef, username);
    
    console.log('[Reserve Username] Success!');
    return true;
  } catch (error) {
    console.error('Error reserving username:', error);
    return false;
  }
};

// Submit leaderboard entry
export const submitLeaderboardEntry = async (gameState: GameState): Promise<boolean> => {
  try {
    const userId = getUserId();
    
    // Check if user is banned from leaderboard
    const bannedRef = dbRef(db, `leaderboardBans/${userId}`);
    const bannedSnapshot = await dbGet(bannedRef);
    
    if (bannedSnapshot.exists() && bannedSnapshot.val() === true) {
      console.log('[Leaderboard Submit] ❌ BLOCKED: User is banned from leaderboard');
      return false;
    }
    
    console.log('[Leaderboard Submit] Starting submission...');
    console.log('[Leaderboard Submit] devStats:', gameState.stats?.devStats);
    
    // Block dev accounts from leaderboards
    if (gameState.stats.devStats && 
        (gameState.stats.devStats.moneyAdded > 0 || 
         gameState.stats.devStats.rebirthPointsAdded > 0 || 
         gameState.stats.devStats.gemsAdded > 0)) {
      console.log('[Leaderboard Submit] ❌ BLOCKED: Dev commands used');
      console.log('[Leaderboard Submit] Money Added:', gameState.stats.devStats.moneyAdded);
      console.log('[Leaderboard Submit] Rebirth Points Added:', gameState.stats.devStats.rebirthPointsAdded);
      console.log('[Leaderboard Submit] Gems Added:', gameState.stats.devStats.gemsAdded);
      return false;
    }
    
    console.log('[Leaderboard Submit] ✅ Proceeding with submission (no dev stats detected)');
    
    const username = gameState.username || `Player_${Math.floor(Math.random() * 1000000)}`;
    
    // Calculate totalTiers safely
    const totalTiers = gameState.achievements && Array.isArray(gameState.achievements) 
      ? gameState.achievements.reduce((sum, ach) => sum + (ach?.tier || 0), 0) 
      : 0;
    
    // Calculate actual money per click with all bonuses (same as MoneyButton)
    const totalAchievementTiers = totalTiers;
    const achievementMoneyBonus = totalAchievementTiers * 0.01;
    const achievementMoneyMultiplier = 1 + achievementMoneyBonus;

    let clickMultiplier = 1;
    if (gameState.rebirth_upgradeAmounts[0] > 0) {
      const exponent = 0.01 + (gameState.rebirth_upgradeAmounts[0] - 1) * 0.01;
      clickMultiplier = Math.pow(gameState.clicksTotal + 1, exponent);
    }

    let totalMoneyBonus = 0;
    gameState.runes.forEach((amount, index) => {
      if (amount > 0 && RUNES_1[index]) {
        totalMoneyBonus += (RUNES_1[index].moneyBonus || 0) * amount;
      }
    });
    const runeMultiplier = 1 + totalMoneyBonus;

    let rebirthPointMultiplier = 1;
    if (gameState.rebirth_upgradeAmounts[4] > 0) {
      const effectValue = REBIRTHUPGRADES[4].effect;
      const bonus = Math.log(gameState.rebirthPoints + 1) * effectValue;
      rebirthPointMultiplier = 1 + bonus;
    }

    const activeEvent = gameState.activeEvent ? EVENT_CONFIG.find(e => e.id === gameState.activeEvent) : null;
    const eventMultiplier = activeEvent?.effects?.clickPowerMultiplier || 1;

    const actualMoneyPerClick = (gameState.moneyPerClick || 0) * clickMultiplier * runeMultiplier * rebirthPointMultiplier * achievementMoneyMultiplier * eventMultiplier;
    
    const leaderboardEntry = {
      userId: userId,
      username: username,
      allTimeMoney: gameState.stats?.allTimeMoneyEarned || 0,
      totalTiers: totalTiers,
      moneyPerClick: Math.floor(actualMoneyPerClick),
      onlineTime: gameState.stats?.onlineTime || 0,
      totalRebirths: gameState.stats?.totalRebirths || 0,
      totalGems: gameState.stats?.allTimeGemsEarned || 0,
      timestamp: Date.now(),
      devStats: gameState.stats?.devStats || { moneyAdded: 0, rebirthPointsAdded: 0, gemsAdded: 0, clicksAdded: 0 }
    };
    
    console.log('[Leaderboard Submit] Entry data:', leaderboardEntry);
    
    // Update user's leaderboard data
    const userLeaderboardRef = dbRef(db, `leaderboard/${userId}`);
    await dbSet(userLeaderboardRef, leaderboardEntry);
    
    return true;
  } catch (error) {
    console.error('Error submitting leaderboard entry:', error);
    return false;
  }
};

// Get top leaderboard entries for a specific category
export const getTopLeaderboard = async (category: 'allTimeMoney' | 'totalTiers' | 'moneyPerClick' | 'onlineTime', limit: number = 100): Promise<any[]> => {
  try {
    const leaderboardRef = dbRef(db, 'leaderboard');
    const bansRef = dbRef(db, 'leaderboardBans');
    
    const [snapshot, bansSnapshot] = await Promise.all([
      dbGet(leaderboardRef),
      dbGet(bansRef)
    ]);
    
    if (!snapshot.exists()) {
      console.log('[Leaderboard] ⚠️ No leaderboard data exists in Firebase');
      return [];
    }
    
    const data = snapshot.val();
    console.log('[Leaderboard] 📊 Total entries in Firebase:', Object.keys(data).length);
    
    // Get list of banned user IDs
    const bannedUsers = new Set<string>();
    if (bansSnapshot.exists()) {
      const bansData = bansSnapshot.val();
      Object.keys(bansData).forEach(userId => {
        if (bansData[userId] === true) {
          bannedUsers.add(userId);
          console.log('[Leaderboard] 🚫 Banned user:', userId);
        }
      });
    }
    
    let entries = Object.values(data) as any[];
    console.log('[Leaderboard] 📋 All entries before filtering:', entries.map(e => ({ user: e.username, hasDevStats: !!e.devStats })));
    
    // Filter out banned users and dev accounts
    entries = entries.filter(entry => {
      // Remove banned users
      if (bannedUsers.has(entry.userId)) {
        console.log('[Leaderboard] ❌ Filtering out banned user:', entry.username);
        return false;
      }
      
      // Remove entries that have dev stats with added values
      if (entry.devStats) {
        const devStats = entry.devStats;
        if (devStats.moneyAdded > 0 || 
            devStats.rebirthPointsAdded > 0 || 
            devStats.gemsAdded > 0 ||
            devStats.clicksAdded > 0) {
          console.log('[Leaderboard] ❌ Filtering out dev account:', entry.username, 'devStats:', devStats);
          return false;
        }
      }
      return true;
    });
    
    console.log('[Leaderboard] ✅ Total entries after filtering:', entries.length);
    console.log('[Leaderboard] 👥 Usernames after filter:', entries.map(e => e.username));
    
    // Sort by category value in descending order (highest first)
    entries.sort((a, b) => {
      const valueA = a[category] || 0;
      const valueB = b[category] || 0;
      return valueB - valueA; // Descending order
    });
    
    // Return top 'limit' entries
    return entries.slice(0, limit);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// Get user's rank in a category
export const getUserRank = async (userId: string, category: 'allTimeMoney' | 'totalTiers' | 'moneyPerClick' | 'onlineTime'): Promise<number> => {
  try {
    const entries = await getTopLeaderboard(category, 10000); // Get all entries
    const userIndex = entries.findIndex(entry => entry.userId === userId);
    return userIndex === -1 ? -1 : userIndex + 1; // Return 1-based rank or -1 if not found
  } catch (error) {
    console.error('Error getting user rank:', error);
    return -1;
  }
};
