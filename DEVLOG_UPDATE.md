# 🎮 Money Clicker - Update v0.1.1

## 🔥 Neue Features

### ☁️ Cloud-Speicherung & Cross-Device Sync
- **Automatische Cloud-Speicherung**: Dein Spielstand wird jetzt alle 5 Minuten automatisch in der Cloud gesichert
- **Manuelle Sync-Buttons**: 
  - "In Cloud speichern" - Speichere deinen Fortschritt jederzeit manuell
  - "Aus Cloud laden" - Lade deinen Spielstand von einem anderen Gerät
- **Account-Code System**: Generiere einen Code auf einem Gerät und logge dich damit auf anderen Geräten ein
- **Geräteübergreifend spielen**: Spiele auf PC, dann nahtlos auf dem Handy weiter (und umgekehrt)

### 🏆 Leaderboards
- **Globale Ranglisten**: Vergleiche dich mit anderen Spielern weltweit
- **Mehrere Kategorien**:
  - Gesamt-Geld (All-Time)
  - Total Tiers (Upgrade-Level)
  - Geld pro Klick
  - Spielzeit
  - Rebirths
  - Edelsteine
- **Echtzeit-Updates**: Leaderboards aktualisieren sich automatisch jede Minute
- **Deine Position**: Sieh sofort, wo du in jeder Kategorie stehst
- **Top 100 Anzeige**: Schau dir die besten Spieler an

### ⚠️ Multi-Instance Schutz
- **Warnsystem**: Verhindert, dass das Spiel gleichzeitig auf mehreren Tabs/Geräten läuft
- **Datenverlust-Schutz**: Schützt deinen Spielstand vor versehentlichem Überschreiben
- **Geräte-Erkennung**: Zeigt dir an, auf welchem Gerät (Desktop/Mobile) die andere Instanz läuft
- **Automatische Erkennung**: Erkennt innerhalb von 3 Sekunden, ob eine andere Instanz aktiv ist

### 🔧 Verbesserungen

#### Benutzernamen-System
- **Eindeutige Namen**: Jeder Spieler hat einen einzigartigen Benutzernamen
- **Namen ändern**: Ändere deinen Namen jederzeit in den Einstellungen
- **Verfügbarkeitsprüfung**: Sofortige Überprüfung ob ein Name bereits vergeben ist

#### Einstellungsmenü
- **Übersichtlicher**: Neue strukturierte Darstellung
- **Mobile-optimiert**: Scrollbares Menü auf kleinen Bildschirmen
- **Account-Verwaltung**: Alle Cloud-Funktionen an einem Ort
- **Debug-Informationen**: Detaillierte Feedback-Meldungen beim Laden/Speichern

#### Mobile Navigation
- **Leaderboard-Tab**: Neuer Tab für schnellen Zugriff auf Ranglisten
- **Optimierte UI**: Bessere Darstellung auf Smartphones und Tablets

## 🐛 Bugfixes
- Benutzernamen-Validierung funktioniert jetzt korrekt
- User ID bleibt beim Cloud-Load erhalten (kein Account-Wechsel mehr)
- Leaderboard zeigt keine NaN-Werte mehr
- Mobile Settings sind jetzt scrollbar
- Einstellungsmenü schließt sich korrekt

## 🔒 Technische Details
- **Firebase Integration**: Realtime Database für Cloud-Sync und Leaderboards
- **Sicherheit**: Firebase Security Rules für geschützte Daten
- **Performance**: Optimierte Sync-Intervalle (Leaderboard: 1min, Spielstand: 5min)
- **Fehlerbehandlung**: Robuste Error-Handling für Netzwerkprobleme

## 📱 Wie nutze ich die neuen Features?

### Cloud-Sync einrichten:
1. Öffne die Einstellungen (⚙️)
2. Gib dir einen Benutzernamen
3. Klicke auf "In Cloud speichern"
4. Fertig! Dein Spielstand ist gesichert

### Auf anderem Gerät weiterspielen:
1. Auf dem ersten Gerät: "Get Account Code" → Code kopieren
2. Auf dem zweiten Gerät: "Login with Code" → Code einfügen
3. Dein kompletter Spielstand wird geladen!

### Leaderboards nutzen:
1. Spiele normal weiter
2. Deine Stats werden automatisch jede Minute hochgeladen
3. Wechsle zum Leaderboard-Tab, um deine Position zu sehen

## 🎯 Bekannte Einschränkungen
- Spiele nicht gleichzeitig auf mehreren Geräten (Multi-Instance Warnung erscheint)
- Internetverbindung erforderlich für Cloud-Sync und Leaderboards
- Leaderboard-Updates erfolgen im 1-Minuten-Intervall

**Version**: v0.1.2  
**Release Date**: 29. November 2025  
**Build**: Production-Ready

Viel Spaß beim Klicken! 💰✨
