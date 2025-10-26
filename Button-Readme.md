# Button & Upgrade System Guide

Diese Anleitung erklärt, wie du normale Upgrades und Rebirth-Upgrades im Money Clicker Game hinzufügst oder änderst.

## 📋 Normale Upgrades

### 1. Upgrade Definition (`src/types.ts`)

**Wo:** Im `UPGRADES` Array
**Was hinzufügen:**
```typescript
{
  id: 4, // Nächste verfügbare ID
  name: 'Upgrade Name',
  description: 'Beschreibung des Upgrades',
  price: 5000, // Startpreis
  amount: 0,
  maxAmount: 15, // Maximale Anzahl kaufbar
  effect: 50, // Effekt-Wert
  type: 'click' // oder 'auto'
}
```

### 2. Initialer Spielzustand (`src/types.ts`)

**Wo:** Im `INITIAL_GAME_STATE` Objekt
**Was ändern:**
```typescript
upgradePrices: [10, 100, 1000, 2500, 5000], // Neuen Preis hinzufügen
upgradeAmounts: [0, 0, 0, 0, 0], // Neue 0 hinzufügen
maxUpgradeAmounts: [10, 10, 10, 10, 15], // Neues Maximum hinzufügen
```

### 3. Upgrade-Logik (`src/useGameLogic.ts`)

**Wo:** In der `buyUpgrade` Funktion, nach den bestehenden `else if` Blöcken
**Was hinzufügen:**
```typescript
} else if (upgradeIndex === 4) { // Neue Upgrade ID
  // Für Click-Upgrades:
  newMoneyPerClick += 50;
  
  // Für Auto-Upgrades:
  newMoneyPerTick += 50;
}
```

### 4. Speicher-Kompatibilität (`src/storage.ts`)

**Wo:** In der `loadGameState` Funktion
**Was ändern:**
```typescript
upgradePrices: parsed.upgradePrices?.length === 5 ? parsed.upgradePrices : [10, 100, 1000, 2500, 5000],
upgradeAmounts: parsed.upgradeAmounts?.length === 5 ? parsed.upgradeAmounts : [0, 0, 0, 0, 0],
maxUpgradeAmounts: parsed.maxUpgradeAmounts?.length === 5 ? parsed.maxUpgradeAmounts : [10, 10, 10, 10, 15],
```

---

## 🔄 Rebirth Upgrades

### 1. Rebirth-Upgrade Definition (`src/types.ts`)

**Wo:** Im `REBIRTHUPGRADES` Array
**Was hinzufügen:**
```typescript
{
  id: 2, // Nächste verfügbare ID
  name: 'Rebirth Upgrade Name',
  description: 'Beschreibung des Rebirth-Upgrades',
  price: 10, // Startpreis in Rebirth Points
  amount: 0,
  maxAmount: 5, // Maximale Anzahl kaufbar
  effect: 0.05, // Effekt-Wert
  type: 'Multiplier' // oder 'auto', 'click'
}
```

### 2. Initialer Spielzustand (`src/types.ts`)

**Wo:** Im `INITIAL_GAME_STATE` Objekt
**Was ändern:**
```typescript
rebirth_upgradePrices: [1, 5, 10], // Neuen Preis hinzufügen
rebirth_upgradeAmounts: [0, 0, 0], // Neue 0 hinzufügen
rebirth_maxUpgradeAmounts: [1, 1, 5], // Neues Maximum hinzufügen
```

### 3. Rebirth-Upgrade Logik (`src/useGameLogic.ts`)

**Wo:** In der Auto-Money Generation (useEffect) oder clickMoney Funktion
**Was hinzufügen:**

**Für Multiplier-Upgrades:**
```typescript
// In clickMoney und Auto-Money Generation
if (prev.rebirth_upgradeAmounts[2] > 0) {
  // Beispiel: Bonus basierend auf gekauften normalen Upgrades
  const normalUpgradeBonus = prev.upgradeAmounts.reduce((sum, amount) => sum + amount, 0);
  multiplier *= Math.pow(1 + normalUpgradeBonus * 0.01, prev.rebirth_upgradeAmounts[2]);
}
```

**Für Auto-Effekte:**
```typescript
// In der Auto-Money Generation
if (prev.rebirth_upgradeAmounts[2] > 0) {
  // Beispiel: Zusätzliches passives Einkommen
  newMoney += prev.rebirth_upgradeAmounts[2] * 0.1;
}
```

### 4. UI Bonus-Anzeige (`src/components/RebirthUpgradePanel.tsx`)

**Wo:** In der Bonus-Berechnung
**Was hinzufügen:**
```typescript
} else if (upgrade.id === 2 && gameState.rebirth_upgradeAmounts[2] > 0) {
  // Beispiel: Zeige den aktuellen Multiplier
  const normalUpgradeBonus = gameState.upgradeAmounts.reduce((sum, amount) => sum + amount, 0);
  bonus = Math.pow(1 + normalUpgradeBonus * 0.01, gameState.rebirth_upgradeAmounts[2]);
}
```

### 5. Speicher-Kompatibilität (`src/storage.ts`)

**Wo:** In der `loadGameState` Funktion
**Was ändern:**
```typescript
rebirth_upgradePrices: Array.isArray(parsed.rebirth_upgradePrices) && parsed.rebirth_upgradePrices.length === 3 ? parsed.rebirth_upgradePrices : [1, 5, 10],
rebirth_upgradeAmounts: Array.isArray(parsed.rebirth_upgradeAmounts) && parsed.rebirth_upgradeAmounts.length === 3 ? parsed.rebirth_upgradeAmounts : [0, 0, 0],
rebirth_maxUpgradeAmounts: Array.isArray(parsed.rebirth_maxUpgradeAmounts) && parsed.rebirth_maxUpgradeAmounts.length === 3 ? parsed.rebirth_maxUpgradeAmounts : [1, 1, 5],
```

---

## 🛠️ Wichtige Hinweise

### Array-Längen synchron halten
- Alle Upgrade-Arrays müssen die gleiche Länge haben
- Beim Hinzufügen eines Upgrades, überall einen Wert hinzufügen

### ID-System
- Normale Upgrades: IDs 0, 1, 2, 3, 4...
- Rebirth-Upgrades: IDs 0, 1, 2, 3...
- IDs müssen fortlaufend sein (keine Lücken)

### Preis-Skalierung
Die Preise steigen automatisch basierend auf:
```typescript
const priceMultiplier = upgradeIndex <= 1 ? 2.0 : upgradeIndex <= 3 ? 2.5 : 3.0;
newPrice = basePrice * Math.pow(priceMultiplier, currentAmount + 1);
```

### Effekt-Typen
- **'click'**: Erhöht Geld pro Klick
- **'auto'**: Erhöht passives Einkommen
- **'Multiplier'**: Multipliziert bestehende Werte

### Testing
Nach Änderungen:
1. Teste das Kaufen des neuen Upgrades
2. Überprüfe, ob der Effekt korrekt angewendet wird
3. Teste Speichern/Laden
4. Teste Rebirth (bei Rebirth-Upgrades)