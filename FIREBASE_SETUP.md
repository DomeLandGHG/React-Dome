# Firebase Setup Instructions

## 🔥 Firebase Realtime Database Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `money-clicker` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

### Step 2: Enable Realtime Database
1. In your Firebase project, click **"Realtime Database"** in left menu
2. Click **"Create Database"**
3. Choose location: **United States** (or closest to your users)
4. Start in **"Test mode"** (we'll secure it later)
5. Click **"Enable"**

### Step 3: Get Configuration
1. Click the **⚙️ Settings icon** → **Project settings**
2. Scroll to **"Your apps"** section
3. Click the **</>** icon (Web)
4. Register app with nickname: `money-clicker-web`
5. **Copy the firebaseConfig object**

### Step 4: Update src/firebase.ts
Replace the placeholder values in `src/firebase.ts` with your config:

```typescript
const firebaseConfig = {
  apiKey: "AIza...",  // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 5: Security Rules (Important!)
1. Go to **Realtime Database** → **Rules** tab
2. Replace with these rules:

```json
{
  "rules": {
    "usernames": {
      ".read": true,
      ".indexOn": ["username"],
      "$userId": {
        ".write": "$userId === auth.uid || auth == null",
        ".validate": "newData.hasChildren(['username', 'timestamp'])"
      }
    },
    "users": {
      ".read": true,
      "$userId": {
        ".write": "$userId === auth.uid || auth == null"
      }
    },
    "gameData": {
      ".read": true,
      "$userId": {
        ".write": "$userId === auth.uid || auth == null"
      }
    },
    "activeInstances": {
      ".read": true,
      "$userId": {
        "$instanceId": {
          ".write": true
        }
      }
    },
    "leaderboard": {
      ".read": true,
      ".indexOn": ["allTimeMoney", "totalTiers", "moneyPerClick", "onlineTime", "totalRebirths", "totalGems"],
      "$userId": {
        ".write": "$userId === auth.uid || auth == null",
        ".validate": "newData.hasChildren(['userId', 'username', 'allTimeMoney', 'totalTiers', 'moneyPerClick', 'timestamp'])"
      }
    }
  }
}
```

3. Click **"Publish"**

### Step 6: Test Connection
1. Run `npm run dev`
2. Open the game
3. Try changing your username in Settings
4. Check Firebase Console → Realtime Database
5. You should see data appearing under `usernames/` and `users/`

---

## 📊 Database Structure

```
money-clicker/
├── usernames/
│   └── {userId}/
│       ├── username: "Player123"
│       └── timestamp: 1234567890
├── users/
│   └── {userId}/
│       └── username: "Player123"
└── leaderboard/
    └── {userId}/
        ├── userId: "user_..."
        ├── username: "Player123"
        ├── allTimeMoney: 1000000
        ├── totalTiers: 50
        ├── moneyPerClick: 1500
        ├── totalRebirths: 10
        ├── totalGems: 200
        └── timestamp: 1234567890
```

---

## 🔒 Production Security (Later)

When ready to deploy, enable **Firebase Authentication** and update rules:

```json
{
  "rules": {
    "usernames": {
      ".read": true,
      "$userId": {
        ".write": "$userId === auth.uid"
      }
    },
    "leaderboard": {
      ".read": true,
      "$userId": {
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

---

## ✅ Current Features

- ✅ Unique username validation
- ✅ Username reservation system
- ✅ Leaderboard submission
- ✅ Top 100 rankings (per category)
- ✅ User rank calculation
- ✅ Persistent user IDs

---

## 🚀 Next Steps

1. **Complete Firebase setup** (follow steps above)
2. **Test username changes**
3. **Build Leaderboard UI component**
4. **Auto-submit scores on milestones**
5. **Add authentication** (optional, for production)

---

**Need help?** Check the Firebase docs: https://firebase.google.com/docs/database
