# 💰 Money Clicker Game

Ein umfangreiches Idle-Clicker-Spiel mit Rebirth-Mechaniken, Runen-System, Achievements und komplexen Progression-Systemen.

🎮 **[Jetzt Spielen!](https://domelandghg.github.io/React-Dome)**

---

## 📋 Inhaltsverzeichnis

- [Spielübersicht](#-spielübersicht)
- [Zeitlicher Spielablauf](#-zeitlicher-spielablauf)
- [Kern-Mechaniken](#-kern-mechaniken)
- [Upgrade-Systeme](#-upgrade-systeme)
- [Runen-System](#-runen-system)
- [Achievement-System](#-achievement-system)
- [Statistiken](#-statistiken)
- [Technischer Aufbau](#-technischer-aufbau)
- [Features](#-features)

---

## 🎮 Spielübersicht

Money Clicker ist ein komplexes Incremental Game mit mehreren Progression-Ebenen:
- **Phase 1**: Basis-Clicking und erste Upgrades
- **Phase 2**: Rebirth-System und Multiplier
- **Phase 3**: Gem-System und Runen
- **Phase 4**: Elementare Runen und Crafting
- **Phase 5**: Achievement-System und Meta-Progression

---

## ⏱️ Zeitlicher Spielablauf

### 🟢 Start (0-5 Minuten)
**Verfügbare Aktionen:**
- Klicke den Money-Button für $1 pro Klick
- Kaufe erste Upgrades:
  - **Extra Click** (10$) - +1$ pro Klick
  - **Auto Clicker** (100$) - +1$ pro Sekunde

**Ziel:** Erreiche ~1.000$ für weitere Upgrades

---

### 🟡 Early Game (5-15 Minuten)
**Neue Features:**
- **Mega Click** (1.000$) - +10$ pro Klick
- **Passive Income** (2.500$) - +10$ pro Sekunde
- **Money Maker I** Achievement freigeschaltet bei 1.000$

**Strategie:**
- Balance zwischen Click- und Auto-Upgrades
- Erste Achievements werden freigeschaltet
- Sammle bis ~10.000$ für Rebirth-Unlock

**Ziel:** Kaufe **Rebirth Unlock** Upgrade (10.000$)

---

### 🔵 Mid Game (15-45 Minuten)
**Rebirth-System freigeschaltet:**

#### Erster Rebirth
- Verliere alle normalen Upgrades und Geld
- Behalte gekaufte Rebirth-Upgrades
- Erhalte **Rebirth Points (RP)** basierend auf Clicks
- Formel: `RP = Math.floor(Math.sqrt(clicks / 10))`

**Neue Panels verfügbar:**
- 🔄 **Rebirth** - Rebirth-Upgrades kaufen
- 🏆 **Achievements** - Fortschritt tracken

#### Rebirth-Upgrades:
1. **RP Multiplier** (1 RP)
   - Max: 1x kaufbar
   - Effekt: +5% RP bei jedem Rebirth
   
2. **Click Power** (5 RP)
   - Max: 1x kaufbar  
   - Effekt: Jedes normale Upgrade gibt +1% Money pro Klick

3. **Gem Unlock** (15 RP) ⭐
   - Max: 1x kaufbar
   - **Schaltet Gem-System frei**
   - Gem Chance: 0.1% pro Klick

**Progression:**
- Mehrere Rebirths durchführen
- RP sammeln und Multiplier steigern
- Achievements freischalten (Rebirth Master, Click Master)

**Ziel:** Kaufe Gem Unlock (15 RP)

---

### 🟣 Late Game (45+ Minuten)
**Gem-System aktiv:**

#### Gems & Runen
- **Gem Unlock** gekauft → Gems droppen beim Klicken
- Gems können für **Rune Packs** ausgegeben werden
- **Base Rune Pack** (10 💎) - Enthält zufällige Basis-Runen

**Kaufe Gem Powers** (1 RP):
- Schaltet **Elemental Runes** frei
- Neue Features:
  - Elementare Ressourcen (Air, Earth, Water, Fire, Light, Dark)
  - Elemental Rune Packs (25 💎)
  - Secret Rune Crafting

#### Rune-Typen & Boni:

**Basis-Runen** (6 Raritäten):
| Rune | Money Bonus | RP Bonus | Gem Bonus |
|------|-------------|----------|-----------|
| Common | +2% | +1% | +0.5% |
| Uncommon | +5% | +2% | +1% |
| Rare | +10% | +5% | +2% |
| Epic | +25% | +10% | +5% |
| Legendary | +50% | +25% | +10% |
| Mythic | +100% | +50% | +20% |

**Elemental Runen** (6 Elemente):
- Produzieren Ressourcen (1-5 pro Sekunde)
- Keine direkten Boni
- Benötigt für Secret Rune Crafting

**Secret Rune**:
- Crafting: 1x jede Basic + 1x jede Elemental Rune
- **+200% Money, +100% RP, +50% Gems**
- Höchster Bonus im Spiel

#### Merging-System:
- 3x gleiche Rune → 1x nächst höhere Rune
- Common → Uncommon → Rare → Epic → Legendary → Mythic
- Tracked in Statistics

**Neue Achievements:**
- **Gem Collector** - Gems sammeln
- **Element Producer** - Elemente produzieren
- **Rune Collector** - Rune Packs kaufen

---

### 💎 End Game (Unbegrenzt)
**Meta-Progression:**

#### Achievement-Hunting
- 7 verschiedene Achievements
- Jedes mit 100 Tiers
- Dynamische Ziele (z.B. Tier 1: 1.000$ → Tier 2: 1 Mio$)

**Achievement-Boni:**
- +1% Money pro Tier (außer Gems)
- +1% RP pro Tier  
- +1% Elemental Production pro Tier
- +0.1% Gem Chance pro Tier

**Gesamt mögliche Tiers:** 700 (7 Achievements × 100 Tiers)

#### Optimierungs-Strategien:
1. **Rune-Stacking**: Sammle viele Secret Runes
2. **Achievement-Grinding**: Pushe spezifische Achievements
3. **Rebirth-Timing**: Optimiere RP-Gain
4. **Resource-Management**: Balance Gems vs RP

---

## 🎯 Kern-Mechaniken

### 💵 Geld-System
**Verdienen:**
- **Manuell klicken**: Basis 1$ + Upgrades
- **Automatisch**: Passive Income Upgrades
- **Multiplier**: Rebirth-Upgrades × Runen-Boni × Achievement-Boni

**Formel:**
```
Money pro Klick = Base × Click Multiplier × Rune Bonus × RP Multiplier × Achievement Bonus
```

**Beispiel-Rechnung:**
- Base: 1$
- Click Mult: 1.5 (50% aus Upgrades)
- Rune Bonus: 2.0 (100% aus Runen)
- RP Mult: 1.2 (20% aus Rebirth)
- Achievement: 1.05 (5 Tiers)
→ **3.15$ pro Klick**

### 🔄 Rebirth-Mechanik
**Wann Rebirthen?**
- Je mehr Clicks, desto mehr RP
- Empfehlung: Ab ~1.000 Clicks

**Was bleibt erhalten:**
- ✅ Rebirth Points
- ✅ Rebirth-Upgrades (gekauft)
- ✅ Gems
- ✅ Alle Runen
- ✅ Achievements
- ✅ Statistiken

**Was wird zurückgesetzt:**
- ❌ Money (auf 0$)
- ❌ Normale Upgrades (auf Level 0)
- ❌ Clicks in diesem Rebirth

### 💎 Gem-System
**Drop-Mechanik:**
- Chance: 0.1% base + Rune Boni + Achievement Boni
- Nur nach Gem Unlock
- Pro Klick (manuell + auto)

**Verwendung:**
- **Base Rune Pack** (10 💎): 3 zufällige Basis-Runen
- **Elemental Rune Pack** (25 💎): 3 zufällige Elemental-Runen

---

## ⬆️ Upgrade-Systeme

### 🔨 Normale Upgrades (Mit Geld $)

| ID | Name | Startpreis | Max | Effekt | Typ |
|----|------|-----------|-----|--------|-----|
| 0 | Extra Click | 10$ | 10 | +1$/Klick | Click |
| 1 | Auto Clicker | 100$ | 10 | +1$/Sek | Auto |
| 2 | Mega Click | 1.000$ | 10 | +10$/Klick | Click |
| 3 | Passive Income | 2.500$ | 10 | +10$/Sek | Auto |
| 4 | Rebirth Unlock | 10.000$ | 1 | Schaltet Rebirth frei | Unlock |

**Preis-Skalierung:**
- Upgrades 0-1: `Preis × 2.0^Level`
- Upgrades 2-3: `Preis × 2.5^Level`
- Upgrade 4+: `Preis × 3.0^Level`

### 🌟 Rebirth-Upgrades (Mit RP)

| ID | Name | Startpreis | Max | Effekt | Typ |
|----|------|-----------|-----|--------|-----|
| 0 | RP Multiplier | 1 RP | 1 | +5% RP | Multiplier |
| 1 | Click Power | 5 RP | 1 | +1% Money pro normalem Upgrade | Multiplier |
| 2 | Gem Unlock | 15 RP | 1 | Schaltet Gems frei (0.1% Chance) | Unlock |
| 3 | Gem Powers | 1 RP | 1 | Schaltet Elemental Runes frei | Unlock |
| 4 | Elemental Boost | 25 RP | 1 | Elementar-Produktion ×5 | Multiplier |

---

## 🎴 Runen-System

### 📦 Basis-Runen (Common → Mythic)

**Drop-Raten (Base Rune Pack):**
- Common: 50%
- Uncommon: 25%
- Rare: 15%
- Epic: 7%
- Legendary: 2.5%
- Mythic: 0.5%

**Boni:**
```
Common:    +2% Money, +1% RP, +0.5% Gems
Uncommon:  +5% Money, +2% RP, +1% Gems
Rare:      +10% Money, +5% RP, +2% Gems
Epic:      +25% Money, +10% RP, +5% Gems
Legendary: +50% Money, +25% RP, +10% Gems
Mythic:    +100% Money, +50% RP, +20% Gems
```

**Boni stacken:** 3 Mythic = +300% Money!

### ⚡ Elemental Runen

**6 Elemente:**
- 🌪️ Air (Luft)
- 🏔️ Earth (Erde)
- 💧 Water (Wasser)
- 🔥 Fire (Feuer)
- ✨ Light (Licht)
- 🌑 Dark (Dunkelheit)

**Ressourcen-Produktion:**
- Pro Rune: 1-5 Ressourcen/Sekunde (zufällig)
- Anzeige im **Elemental Stats** Panel
- Benötigt für Secret Rune Crafting

### 🔮 Merging & Crafting

**Rune Merging:**
- **3:1 Ratio** - 3 gleiche → 1 höhere
- Common × 3 → Uncommon × 1
- Geht bis Mythic
- Tracked in Statistics

**Secret Rune Crafting:**
- Benötigt:
  - 1× Common, Uncommon, Rare, Epic, Legendary, Mythic
  - 1× Air, Earth, Water, Fire, Light, Dark Rune
- Ergebnis: 1× **Secret Rune**
- Bonus: **+200% Money, +100% RP, +50% Gems**
- Kann mehrfach gecrafted werden

**Merge All Funktion:**
- Merged automatisch alle möglichen Runen
- Startet bei Common, geht bis Mythic
- Ein Klick für maximale Effizienz

---

## 🏆 Achievement-System

### Achievement-Liste

| ID | Name | Icon | Beschreibung | Base | Mult | Bonus |
|----|------|------|--------------|------|------|-------|
| 0 | Money Maker | 💰 | Reach X$ | 1K | ×1000 | +1% Money |
| 1 | Rebirth Master | 🔄 | Reach X RP | 10 | ×10 | +1% RP |
| 2 | Gem Collector | 💎 | Reach X Gems | 10 | ×10 | +0.1% Gem Chance |
| 3 | Click Master | 👆 | Reach X Clicks | 100 | ×100 | +1% Money |
| 4 | Upgrade Enthusiast | 📈 | Reach X Upgrades | 5 | ×5 | +1% Money |
| 5 | Element Producer | ⚡ | Reach X Elements | 100 | ×100 | +1% Elements |
| 6 | Rune Collector | 📜 | Reach X Packs | 10 | ×10 | +1% Elements |

**Unlock-Bedingungen:**
- Money Maker, Rebirth Master, Click Master, Upgrade Enthusiast: **Immer sichtbar**
- Gem Collector: **Nach Gem Unlock**
- Element Producer, Rune Collector: **Nach Gem Powers**

### Tier-System

**Maximale Tiers:** 100 pro Achievement

**Beispiel Money Maker:**
- Tier 1: 1.000$ (1K)
- Tier 2: 1.000.000$ (1M) 
- Tier 3: 1.000.000.000$ (1B)
- Tier 4: 1.000.000.000.000$ (1T)
- ...bis Tier 100

**Dynamische Berechnung:**
```
Requirement = Base × Multiplier^(Tier - 1)
```

### Boni-Berechnung

**Pro Tier:**
- Money/RP/Elements: +1%
- Gems: +0.1%

**Total bei 5 Money Maker Tiers:**
```
5 Tiers × 1% = +5% Money Bonus
```

**Gesamtbonus wird angezeigt in:**
- Achievement Panel (Summary Box)
- GameStats Tooltips
- Rebirth Button

---

## 📊 Statistiken

### Statistics Panel

**11 Kategorien:**

1. **💰 All Time Money**
   - Total Money Earned
   - Money from Clicks
   - Money from Ticks
   - (Money from Dev) - optional

2. **🔄 Rebirth Statistics**
   - All Time Rebirth Points
   - Total Rebirths
   - (RP from Dev) - optional

3. **💎 All Time Gems** *(nach Gem Unlock)*
   - Total Gems Earned
   - (Gems from Dev) - optional

4. **🖱️ All Time Clicks**
   - Total Clicks
   - Clicks from Manual
   - Clicks from Ticks
   - (Clicks from Dev) - optional

5. **🎴 Runes Purchased** *(nach Gem Powers)*
   - Base Packs
   - Elemental Packs

6. **📦 Upgrades Purchased**
   - Total Upgrades
   - Total Rebirth Upgrades

7. **💸 All Time Spending**
   - Money Spent
   - Rebirth Points Spent
   - Gems Spent *(nach Gem Unlock)*

8. **⚡ All Time Elements Produced** *(nach Gem Powers)*
   - Total Elements
   - Air, Earth, Water, Fire, Light, Dark

9. **🎴 Runes Obtained** *(nach Gem Powers)*
   - Total Basic Runes
   - Common, Uncommon, Rare, Epic, Legendary, Mythic

10. **⚡ Elemental Runes Obtained** *(nach Gem Powers)*
    - Total Elemental Runes
    - Air, Earth, Water, Fire, Light, Dark

11. **🛠️ Runes Crafted** *(nach Gem Powers)*
    - Total Runes Crafted
    - Common, Uncommon, Rare, Epic, Legendary, Mythic, Secret

### Dev Stats Toggle

**🔧 Dev Stats Button:**
- Erscheint nur wenn Dev-Commands verwendet wurden
- **OFF**: Zeigt nur echte Stats
- **ON**: Zeigt echte + Dev Stats kombiniert

**Getrackte Dev-Actions:**
- Money Added
- Rebirth Points Added
- Gems Added
- Clicks Added
- Runen Added (alle Typen)
- Elemental Runen Added

---

## 🏗️ Technischer Aufbau

### Projekt-Struktur

```
React-Dome/
├── src/
│   ├── App.tsx              # Haupt-Komponente
│   ├── App.css              # Styling
│   ├── main.tsx             # Entry Point
│   ├── useGameLogic.ts      # Haupt-Game-Logik
│   ├── storage.ts           # Save/Load System
│   ├── types.ts             # Type Definitions & Constants
│   │
│   ├── components/          # React Komponenten
│   │   ├── ActionButtons.tsx         # Rebirth/Reset Buttons
│   │   ├── AchievementsPanel.tsx     # Achievement Anzeige
│   │   ├── GameStats.tsx             # Haupt-Stats Display
│   │   ├── MobileTabNavigation.tsx   # Mobile Navigation
│   │   ├── MoneyButton.tsx           # Klick-Button
│   │   ├── Panel-switchButton.tsx    # Panel-Wechsel
│   │   ├── RebirthUpgradePanel.tsx   # Rebirth Upgrades
│   │   ├── StatisticsPanel.tsx       # Detaillierte Stats
│   │   └── UpgradesPanel.tsx         # Normale Upgrades
│   │
│   └── types/               # Type Definitionen
│       ├── Achievement.ts   # Achievement Types
│       ├── German_number.ts # Number Formatting
│       ├── Rebirth_Upgrade.ts # Rebirth Upgrade Types
│       ├── Runes.ts        # Rune Definitions
│       └── Upgrade.ts      # Normal Upgrade Types
│
├── public/                  # Statische Assets
├── dist/                    # Build Output
├── package.json            # Dependencies
├── vite.config.ts          # Vite Config
├── tsconfig.json           # TypeScript Config
└── README.md               # Diese Datei
```

### Tech Stack

**Frontend:**
- ⚛️ **React 19** - UI Framework
- 📘 **TypeScript 5.9** - Type Safety
- ⚡ **Vite (Rolldown)** - Build Tool
- 🎨 **CSS3** - Styling

**State Management:**
- React Hooks (useState, useCallback, useEffect)
- Lokaler State in `useGameLogic` Hook

**Persistence:**
- LocalStorage API
- Automatisches Speichern alle 5 Sekunden
- Backup-System bei Fehlern

**Deployment:**
- 🚀 GitHub Pages
- Automatisches Deploy via `gh-pages`

### State Management

**GameState Interface:**
```typescript
{
  money: number;
  rebirthPoints: number;
  gems: number;
  clicksTotal: number;
  
  upgradePrices: number[];
  upgradeAmounts: number[];
  
  rebirth_upgradePrices: number[];
  rebirth_upgradeAmounts: number[];
  
  runes: number[];              // [Common, Uncommon, Rare, Epic, Legendary, Mythic, Secret]
  elementalRunes: number[];     // [Air, Earth, Water, Fire, Light, Dark]
  elementalResources: number[]; // Produzierte Ressourcen
  
  achievements: Array<{id: number, tier: number}>;
  
  stats: {
    allTimeMoneyEarned: number;
    clicksFromManual: number;
    // ... 20+ weitere Stats
    devStats: { ... } // Dev Command Tracking
  };
}
```

### Speicher-System

**Funktionen:**
- `saveGameState()` - Speichert in LocalStorage
- `loadGameState()` - Lädt mit Backwards Compatibility
- `deepMerge()` - Merged alte Saves mit neuen Features

**Backwards Compatibility:**
- Neue Stats werden mit 0 initialisiert
- Fehlende Arrays werden auf Standard-Länge gebracht
- Stat-Recalculation für bestehende Items

**Auto-Save:**
- Alle 5 Sekunden
- Bei wichtigen Actions (Rebirth, Rune Craft)
- Fehler-Handling mit Backup

---

## ✨ Features

### 🎮 Gameplay Features

✅ **Clicker-Mechaniken**
- Manuelles Klicken mit Multiplier
- Passives Einkommen (Auto-Clicker)
- Floating Numbers bei Geld/Gems
- Toggle für Animationen

✅ **Progression-Systeme**
- 5 Normale Upgrades
- 5 Rebirth-Upgrades
- 7 Achievements mit 100 Tiers
- Unbegrenzte Runen

✅ **Runen-System**
- 6 Basis-Rune Raritäten
- 6 Elemental Runen
- Merging (3:1)
- Secret Rune Crafting
- Merge All Funktion

✅ **Meta-Progression**
- Rebirth-System
- Achievement-Boni
- Statistik-Tracking
- Dev Stats Toggle

### 🎨 UI/UX Features

✅ **Responsive Design**
- Desktop: Dual-Panel Layout
- Mobile: Tab Navigation
- Horizontal Scroll bei vielen Tabs

✅ **Panels & Navigation**
- Main (GameStats + Money Button)
- Upgrades
- Rebirth (nach Unlock)
- Achievements (nach Rebirth)
- Statistics (nach Rebirth)
- Runes (nach Gem Powers)
- Dev (nur Dev-Modus)

✅ **Visual Feedback**
- Gradient Backgrounds
- Glow Effects
- Progress Bars
- Tooltips mit Bonus-Breakdown
- Dynamische Icons

✅ **Accessibility**
- Deutsche Zahlenformatierung (1.000 statt 1,000)
- Hover-Tooltips mit Details
- Klare Unlock-Bedingungen
- Mobile-optimierte Buttons

### 🔧 Developer Features

✅ **Dev Commands** (nur in Dev-Mode)
- Add Money (100K)
- Add RP (10)
- Add Gems (10)
- Add Clicks (100)
- Add Runen (nach Typ)
- Separate Dev-Stats Tracking

✅ **Debug Tools**
- Statistics Panel mit vollständiger Übersicht
- Dev Stats Toggle
- Reset Game Funktion
- Separate Tracking von Dev vs Real Stats

---

## 🚀 Deployment

### Lokale Entwicklung

```bash
# Installation
npm install

# Development Server starten
npm run dev

# Build erstellen
npm run build

# Preview des Builds
npm run preview
```

### GitHub Pages Deploy

```bash
# Build & Deploy in einem Schritt
npm run deploy
```

Deployed zu: `https://domelandghg.github.io/React-Dome`

---

## 📝 Tipps & Strategien

### Early Game
1. Kaufe **Extra Click** mehrmals
2. Kaufe **Auto Clicker** für passives Income
3. Balance zwischen Click und Auto
4. Spare für **Rebirth Unlock**

### Nach erstem Rebirth
1. Kaufe **RP Multiplier** zuerst
2. Dann **Click Power** für stärkeren Synergy
3. Multiple Rebirths für mehr RP
4. Spare für **Gem Unlock** (15 RP)

### Gem Phase
1. Kaufe **Base Rune Packs** für erste Boni
2. Merge Runen zu höheren Raritäten
3. Kaufe **Gem Powers** (1 RP)
4. Farme **Elemental Runes**

### Late Game Optimierung
1. Fokus auf **Secret Rune Crafting**
2. Stack mehrere Secret Runes
3. Pushe Achievements für Boni
4. Balance zwischen Gems und RP
5. Merge All für Effizienz

### Achievement-Strategie
- **Money Maker**: Wird passiv durch Spielen erreicht
- **Rebirth Master**: Multiple Rebirths durchführen
- **Gem Collector**: Farming über längere Zeit
- **Click Master**: Auto-Clicker laufen lassen
- **Upgrade Enthusiast**: Alle Upgrades maxen
- **Element Producer**: Elemental Runen sammeln
- **Rune Collector**: Regelmäßig Packs kaufen

---

## 🎯 Milestones

### Progression Checkpoints

🏁 **Tutorial (0-5 min)**
- ✅ Erste 1.000$ erreicht
- ✅ Erstes Upgrade gekauft
- ✅ Money Maker I freigeschaltet

🏁 **Early Game (5-15 min)**
- ✅ Rebirth Unlock gekauft
- ✅ 4+ verschiedene Upgrades
- ✅ ~10.000$ verdient

🏁 **Mid Game (15-45 min)**
- ✅ Erster Rebirth durchgeführt
- ✅ RP Multiplier & Click Power gekauft
- ✅ Gem Unlock erreicht (15 RP)
- ✅ Erste Gems erhalten
- ✅ 5+ Achievements freigeschaltet

🏁 **Late Game (45+ min)**
- ✅ Gem Powers gekauft
- ✅ Elemental Runes freigeschaltet
- ✅ Erste Secret Rune gecrafted
- ✅ 10+ Achievement Tiers erreicht
- ✅ 100+ Runen gesammelt

🏁 **End Game (Stunden)**
- ✅ Multiple Secret Runes
- ✅ 50+ Achievement Tiers
- ✅ Alle Upgrades maximiert
- ✅ Millionen von $ verdient
- ✅ 100+ RP gesammelt

---

## 📈 Progression-Kurve

**Mathematische Skalierung:**

```
Money Growth: Exponentiell (×2-3 pro Upgrade-Stufe)
RP Growth: Wurzel-basiert (√(Clicks/10))
Achievement Tiers: Exponentiell (Base × Mult^Tier)
Rune Merging: 3:1 Ratio (3→1→1/3)
```

**Geschätzte Spielzeit bis Ziele:**
- Erster Rebirth: 15-20 min
- Gem Unlock: 30-45 min
- Gem Powers: 45-60 min
- Erste Secret Rune: 1-2 Stunden
- 50 Achievement Tiers: 3-5 Stunden
- "Endgame": Unbegrenzt

---

## 🤝 Credits

**Entwickelt mit:**
- React 19
- TypeScript 5.9
- Vite (Rolldown)
- Liebe zum Detail ❤️

**Deployment:**
- GitHub Pages
- Automatisches CI/CD

---

## 📄 Lizenz

Dieses Projekt ist Open Source und frei verfügbar.

---

**Viel Spaß beim Spielen! 🎮💰**

*Letzte Aktualisierung: November 2025*
