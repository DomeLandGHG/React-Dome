# 🌟 **Elemental System – Readme**  
*Version 1.0 – Design Draft*

Dieses Dokument beschreibt alle zentralen Systeme des **Elemental Progression Frameworks** für das Spiel: *Ressourcenhändler, Prestige, Welt-Events und Portal-Mechaniken*.

---

## 4️⃣ **Elemental Trading – Der Ressourcenhändler**

Sobald der Spieler **mindestens eine Elemental-Rune** gekauft hat, kann nach **random(10–20 Minuten)** ein **Elemental Trader** erscheinen.

- Der Trader zeigt **3 zufällige Angebote** an.  
- Alle **10–20 Minuten** werden die 3 Angebote neu gewürfelt.  
- Preise und Belohnungen müssen gebalanced werden.

**Beispiel-Angebote (Platzhalter!):**

5.000 Fire          → 50 Gems
10.000 Air          → 1 Legendary Rune
100.000 Dark        → 1 Secret Rune Fragment
20.000 Earth        → 10 RP

Die finalen Werte werden im Balancing-Prozess festgelegt.

---

## 5️⃣ **Elemental Ascension – Elementbasiertes Prestige**

Jedes Element besitzt ein **eigenes Prestige-System**.  
Wenn ein Element einen bestimmten Ressourcenwert erreicht (z. B. *100.000 Fire*), kann der Spieler **Fire Prestige 1** aktivieren.

### 🔁 **Prestige Reset:**
- Setzt **nur die Ressource des spezifischen Elements** auf `0`.
- Verleiht dauerhaft einen **permanenten Element-Bonus pro Prestige-Level**.
- Boni sind *multiplikativ stapelbar*.

### 📈 **Prestige-Boni pro Element:**

| Element | Bonus |
|--------|-------|
| **Air** | +0.5% Auto-Speed pro Level |
| **Earth** | +2% Auto-Income pro Level |
| **Water** | +1% Click-Power pro Level |
| **Fire** | +1% Rune-Pack-Luck pro Level |
| **Light** | +1% RP-Gain pro Level |
| **Dark** | +1% Upgrade-Discount pro Level |

---

## 8️⃣ **Elemental World Events – Automatische Passivevents**

Alle **random(10–20 Minuten)** startet ein zufälliges **10-Minuten-Event**.  
Ein Event kann **nur erscheinen**, wenn das entsprechende Element bereits freigeschaltet wurde.

### 🌍 **Mögliche Events & Effekte (10 Minuten Dauer):**

| Event | Effekt |
|--------|--------|
| **Fire Storm** | Klicken gibt **2× Gems** |
| **Earthquake** | Auto Income **×5** |
| **Solar Flare** | Auto Speed **×2** (1s → 0.5s) |
| **Tsunami** | Click Power **×5** |
| **Darkness** | Upgrade Kosten **−25%** |
| **Tempest** | Gems droppen **2× so oft** |

---

## 9️⃣ **Elemental Portal – Zugang zu *World 2*** (Mega-Late-Game)

Wenn der Spieler **je 10.000.000 eines Elements** besitzt, kann das **Elemental Portal** aktiviert werden.

### 🔓 **Aktivierung:**
- Setzt **alle Element-Ressourcen auf 0**.
- Öffnet den Zugang zu **World 2**.
- **Elemental Prestige bleibt erhalten!**

### 🌌 **World 2 Inhalte (Factory_Readme.md):**


Das Factory-System besteht aus:
- Separaten spezialisierten Maschinen  
- Minecraft-ähnlichem Crafting Grid  
- Automatisierter und manueller Produktion  
- Fortschritt über Upgrades und Prestige  
- Globale Boni durch Produkte  
- Synergien mit bestehenden Spielsystemen  
- Erweiterbarer und modularer Architektur  

Dies bildet die Grundlage für ein tiefes, motivierendes
und endgamefähiges Produktionssystem.