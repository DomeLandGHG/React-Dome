# 🎮 Money Clicker - Console Befehle

Diese Befehle sind für Entwickler und erfahrene Spieler gedacht, die das Spiel testen oder experimentieren möchten.

## 📖 Wie verwenden?

1. **F12** drücken (Browser Developer Tools öffnen)
2. **Console** Tab auswählen
3. Befehle eingeben und **Enter** drücken

## 🎯 Hauptbefehl: `give`

### Syntax
```javascript
MoneyClicker.give("item", amount)
MoneyClicker.give("runes", rarity, amount)
```

### 💰 Geld
```javascript
MoneyClicker.give("money", 1000000)    // Gibt 1 Million Geld
MoneyClicker.give("money", 999999999)  // Gibt fast 1 Milliarde Geld
```

### 🔄 Rebirth Points
```javascript
MoneyClicker.give("rp", 100)           // Gibt 100 Rebirth Points
MoneyClicker.give("rp", 50)            // Gibt 50 Rebirth Points
```

### 💎 Gems
```javascript
MoneyClicker.give("gem", 100)          // Gibt 100 Gems
MoneyClicker.give("gems", 50)          // Funktioniert auch mit "gems"
```

### 🎲 Runen
```javascript
MoneyClicker.give("runes", rarity, amount)
```

**Rarity Werte:**
- `1` = Common (Grau)
- `2` = Uncommon (Grün)
- `3` = Rare (Blau)
- `4` = Epic (Lila)
- `5` = Legendary (Orange)
- `6` = Mythic (Rot)

**Beispiele:**
```javascript
MoneyClicker.give("runes", 1, 10)      // 10x Common Runen
MoneyClicker.give("runes", 6, 5)       // 5x Mythic Runen
MoneyClicker.give("runes", 3, 50)      // 50x Rare Runen
```

## 🛠️ Weitere Befehle

### 👆 Clicks hinzufügen
```javascript
MoneyClicker.addClicks(10000)          // Fügt 10.000 Total Clicks hinzu
MoneyClicker.addClicks(1000000)        // Fügt 1 Million Total Clicks hinzu
```

### 🎮 Spiel-Aktionen
```javascript
MoneyClicker.rebirth()                 // Führt sofort eine Wiedergeburt durch
MoneyClicker.reset()                   // Resettet das komplette Spiel (VORSICHT!)
```

### 📊 Information
```javascript
MoneyClicker.gameState()               // Zeigt aktuellen Spielstand
MoneyClicker.help()                    // Zeigt Hilfe in der Console
```

## 🚀 Schnelle Setups

### Frühs Spiel testen
```javascript
MoneyClicker.give("money", 10000)
MoneyClicker.give("rp", 10)
```

### Mid-Game Setup
```javascript
MoneyClicker.give("money", 1000000)
MoneyClicker.give("rp", 100)
MoneyClicker.give("gem", 50)
MoneyClicker.addClicks(100000)
```

### End-Game Setup
```javascript
MoneyClicker.give("money", 999999999)
MoneyClicker.give("rp", 1000)
MoneyClicker.give("gem", 500)
MoneyClicker.give("runes", 6, 10)      // 10x Mythic
MoneyClicker.give("runes", 5, 20)      // 20x Legendary
MoneyClicker.addClicks(10000000)
```

### Runen-Testing
```javascript
// Alle Runen-Typen testen
MoneyClicker.give("runes", 1, 100)     // Common
MoneyClicker.give("runes", 2, 50)      // Uncommon
MoneyClicker.give("runes", 3, 25)      // Rare
MoneyClicker.give("runes", 4, 10)      // Epic
MoneyClicker.give("runes", 5, 5)       // Legendary
MoneyClicker.give("runes", 6, 3)       // Mythic
```

## ⚠️ Wichtige Hinweise

- **Überschreiben:** Die Befehle **überschreiben nicht** vorhandene Ressourcen, sie **addieren** sie
- **Permanenz:** Alle Änderungen werden im Local Storage gespeichert
- **Reset:** `MoneyClicker.reset()` löscht ALLES unwiderruflich
- **Case-Insensitive:** `"Money"`, `"money"`, `"MONEY"` funktionieren alle gleich

## 🔧 Rückwärtskompatibilität

Die alten Befehle funktionieren noch, zeigen aber eine Deprecation-Warnung:

```javascript
// Deprecated (funktioniert noch)
MoneyClicker.addMoney(1000)
MoneyClicker.addRP(50)
MoneyClicker.addGems(25)
MoneyClicker.addRune(5, 3)             // Index-basiert (0-5)

// Neu empfohlen
MoneyClicker.give("money", 1000)
MoneyClicker.give("rp", 50)
MoneyClicker.give("gem", 25)
MoneyClicker.give("runes", 6, 3)       // Rarity-basiert (1-6)
```

## 🎯 Tipps

1. **Kombinationen:** Du kannst mehrere Befehle hintereinander ausführen
2. **Experimentieren:** Teste verschiedene Kombinationen für Balance-Testing
3. **Sharing:** Du kannst anderen Spielern deine "Cheat-Codes" geben
4. **Backup:** Notiere dir deinen Spielstand mit `MoneyClicker.gameState()` vor großen Änderungen

---

*Diese Befehle sind für experimentelle Zwecke und sollen den Spielspaß nicht ersetzen, sondern erweitern!* 🚀