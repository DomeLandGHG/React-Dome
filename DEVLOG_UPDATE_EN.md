# 🎮 Money Clicker - Update v0.1.2

## 🔥 New Features

### ☁️ Cloud Save & Cross-Device Sync
- **Automatic Cloud Save**: Your progress is saved to the cloud every 5 minutes
- **Manual Sync Buttons**:
  - "Save to Cloud" - Save your progress at any time
  - "Load from Cloud" - Load your save on another device
- **Account Code System**: Generate a code on one device and log in on another
- **Play Across Devices**: Seamlessly continue on PC or mobile

### 🏆 Leaderboards
- **Global Rankings**: Compete with players worldwide
- **Multiple Categories**:
  - All-Time Money
  - Total Tiers (Upgrade Levels)
  - Money per Click
  - Playtime
  - Rebirths
  - Gems
- **Real-Time Updates**: Leaderboards update every minute
- **Your Position**: Instantly see your rank in each category
- **Top 100 Display**: View the best players

### ⚠️ Multi-Instance Protection
- **Warning System**: Prevents playing on multiple tabs/devices at once
- **Data Loss Protection**: Safeguards your save from accidental overwrites
- **Device Detection**: Shows which device (desktop/mobile) the other instance is running on
- **Automatic Detection**: Detects another active instance within 3 seconds

### 🔧 Improvements

#### Username System
- **Unique Names**: Every player has a unique username
- **Change Name**: Change your name anytime in settings
- **Availability Check**: Instantly see if a name is taken

#### Settings Menu
- **More Organized**: New structured layout
- **Mobile Optimized**: Scrollable menu on small screens
- **Account Management**: All cloud features in one place
- **Debug Info**: Detailed feedback when loading/saving

#### Mobile Navigation
- **Leaderboard Tab**: New tab for quick leaderboard access
- **Optimized UI**: Better display on smartphones and tablets

## 🐛 Bugfixes
- Username validation now works correctly
- User ID is preserved when loading from cloud (no more account switching)
- Leaderboard no longer shows NaN values
- Mobile settings are now scrollable
- Settings menu closes correctly

## 🔒 Technical Details
- **Firebase Integration**: Realtime Database for cloud sync and leaderboards
- **Security**: Firebase Security Rules for protected data
- **Performance**: Optimized sync intervals (Leaderboard: 1min, Save: 5min)
- **Error Handling**: Robust error handling for network issues

## 📱 How to Use the New Features?

### Set Up Cloud Sync:
1. Open Settings (⚙️)
2. Choose a username
3. Click "Save to Cloud"
4. Done! Your progress is safe

### Continue on Another Device:
1. On the first device: "Get Account Code" → Copy code
2. On the second device: "Login with Code" → Paste code
3. Your full progress will be loaded!

### Use Leaderboards:
1. Just keep playing
2. Your stats are uploaded every minute
3. Switch to the leaderboard tab to see your rank

## 🎯 Known Limitations
- Do not play on multiple devices at the same time (multi-instance warning will appear)
- Internet connection required for cloud sync and leaderboards
- Leaderboard updates every 1 minute

**Version**: v0.1.2  
**Release Date**: November 29, 2025  
**Build**: Production-Ready

Have fun clicking! 💰✨
