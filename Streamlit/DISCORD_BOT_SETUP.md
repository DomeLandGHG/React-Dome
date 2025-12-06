# 🤖 Discord Bot Setup Guide

## 📋 Voraussetzungen
- Python 3.11 oder höher
- Discord Account
- Discord Server (wo du Admin bist)

## 🚀 Setup Schritte

### 1. Discord Bot erstellen

1. Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
2. Klicke auf **"New Application"**
3. Gib deinem Bot einen Namen (z.B. "Money Clicker Bot")
4. Gehe zum Tab **"Bot"**
5. Klicke auf **"Add Bot"**
6. Aktiviere folgende **Privileged Gateway Intents**:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2. Bot Token kopieren

1. Im **Bot** Tab, klicke auf **"Reset Token"**
2. Kopiere den Token (Du siehst ihn nur einmal!)
3. Öffne `discord_bot.py`
4. Ersetze `YOUR_BOT_TOKEN_HERE` mit deinem Token:
   ```python
   TOKEN = 'dein_bot_token_hier'
   ```

### 3. Bot zu deinem Server hinzufügen

1. Gehe zum Tab **"OAuth2"** → **"URL Generator"**
2. Wähle **Scopes**:
   - ✅ bot
   - ✅ applications.commands
3. Wähle **Bot Permissions**:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Manage Roles (optional)
4. Kopiere die generierte URL
5. Öffne die URL im Browser
6. Wähle deinen Server aus
7. Klicke auf **"Authorize"**

### 4. Python Pakete installieren

```bash
py -3.11 -m pip install discord.py
py -3.11 -m pip install firebase-admin
```

### 5. Discord Rolle erstellen

1. Gehe zu deinem Discord Server
2. Server Settings → Roles
3. Erstelle eine neue Rolle namens **"Game Admin"**
4. Gib dir selbst diese Rolle

### 6. Bot starten

```bash
py -3.11 discord_bot.py
```

Der Bot sollte jetzt online sein! 🟢

## 📝 Verfügbare Befehle

### 🎮 Für alle Spieler

| Befehl | Beschreibung | Beispiel |
|--------|--------------|----------|
| `!leaderboard [category]` | Zeigt Top 10 Spieler | `!leaderboard money` |
| `!lb [category]` | Kurzform von leaderboard | `!lb gems` |
| `!player <username>` | Zeigt Spieler-Statistiken | `!player Dome` |
| `!stats` | Zeigt globale Spiel-Statistiken | `!stats` |
| `!help` | Zeigt alle Befehle | `!help` |

**Leaderboard Kategorien:**
- `money` - Geld
- `gems` - Edelsteine
- `tier` - Höchstes Tier
- `mpc` - Geld pro Klick
- `time` - Spielzeit
- `clicks` - Gesamte Klicks

### 👑 Für Admins (Game Admin Rolle)

| Befehl | Beschreibung | Beispiel |
|--------|--------------|----------|
| `!givemoney <username> <amount>` | Gibt Geld an Spieler | `!givemoney Dome 10000` |
| `!givegems <username> <amount>` | Gibt Gems an Spieler | `!givegems Dome 500` |
| `!ban <username>` | Bannt Spieler vom Leaderboard | `!ban Cheater123` |
| `!unban <username>` | Hebt Ban auf | `!unban Cheater123` |
| `!announce <message>` | Postet Ankündigung | `!announce Update coming soon!` |

## ⚙️ Optional: Channel IDs konfigurieren

Wenn du automatische Ankündigungen möchtest:

1. Aktiviere Discord Developer Mode (User Settings → Advanced → Developer Mode)
2. Rechtsklick auf einen Channel → Copy ID
3. Füge die IDs in `discord_bot.py` ein:

```python
LEADERBOARD_CHANNEL_ID = 123456789  # Deine Channel ID
ANNOUNCEMENTS_CHANNEL_ID = 987654321  # Deine Channel ID
```

## 🎨 Bot anpassen

### Status ändern
```python
await bot.change_presence(
    activity=discord.Game(name="Dein Custom Status")
)
```

### Command Prefix ändern
```python
bot = commands.Bot(command_prefix='$', intents=intents)  # Jetzt $ statt !
```

### Rolle umbenennen
Ändere `ADMIN_ROLE_NAME` in `discord_bot.py`:
```python
ADMIN_ROLE_NAME = "Deine Rolle"
```

## 🔧 Troubleshooting

### Bot geht nicht online
- ✅ Token richtig eingefügt?
- ✅ Intents im Developer Portal aktiviert?
- ✅ Firewall blockiert nicht?

### "Missing Permissions" Error
- ✅ Bot hat richtige Permissions?
- ✅ Bot Rolle ist hoch genug in der Rollen-Hierarchie?

### Commands funktionieren nicht
- ✅ Message Content Intent aktiviert?
- ✅ Bot hat "Read Messages" Permission?
- ✅ Richtiger Prefix verwendet? (Standard: `!`)

### "Player not found"
- ✅ Username richtig geschrieben? (Case-sensitive!)
- ✅ Spieler hat schon mal gespielt?

## 🚀 Erweiterte Features (Optional)

### Automatische Leaderboard Updates
```python
@bot.event
async def on_ready():
    bot.loop.create_task(post_daily_leaderboard())

async def post_daily_leaderboard():
    await bot.wait_until_ready()
    channel = bot.get_channel(LEADERBOARD_CHANNEL_ID)
    
    while not bot.is_closed():
        # Post leaderboard
        top_players = get_leaderboard('money', 10)
        # ... create embed ...
        await channel.send(embed=embed)
        
        await asyncio.sleep(86400)  # 24 hours
```

### Achievement Notifications
```python
# In deinem Game-Code, wenn Achievement erreicht wird:
# Sende Webhook an Discord

import requests

webhook_url = "YOUR_WEBHOOK_URL"
data = {
    "content": f"🏆 {username} hat '{achievement_name}' erreicht!"
}
requests.post(webhook_url, json=data)
```

## 📚 Weitere Ressourcen

- [Discord.py Dokumentation](https://discordpy.readthedocs.io/)
- [Discord Developer Portal](https://discord.com/developers)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## 💡 Ideen für weitere Features

- [ ] Tägliche Rewards für Discord-Mitglieder
- [ ] Achievement Announcements
- [ ] Event-System (z.B. 2x Money Weekend)
- [ ] Discord-Game Verknüpfung (Login mit Discord)
- [ ] Trading System zwischen Spielern
- [ ] Minigames im Discord
- [ ] Auto-Moderation (Ban bei verdächtigem Verhalten)

---

Viel Erfolg mit deinem Bot! 🎮✨
