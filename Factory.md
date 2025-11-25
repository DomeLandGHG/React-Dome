# 🏭 Factory System – Design Dokumentation

Dieses Dokument beschreibt das vollständige Konzept des Factory-Systems,
welches im späteren Spielverlauf freigeschaltet wird und den Spieler
komplexe Ressourcenketten, Maschinenverarbeitung und ein Minecraft-ähnliches
3×3 Crafting-Grid nutzen lässt.

Ziel: Ein tiefes, aber einfach zu bedienendes Produktionssystem, das sowohl
manuelles Crafting als auch automatisierte Verarbeitung unterstützt.


---

# 📌 1. Freischaltung & Grundwährung

## 1.1 Freischaltung
Die Factory wird freigeschaltet, sobald der Spieler ein bestimmtes
Spätspiel-Ziel erfüllt (z. B. Elemental Portal / Plan 9).

## 1.2 Factory Resource Income
Nach Freischaltung erhält der Spieler eine neue Ressource („Factory Resource“),
die passiv generiert wird.

Weitere Erhöhungen dieser Rate können durch spätere Abgaben oder Upgrades
freigeschaltet werden.

Diese Ressource dient als:
- Grund-Investment für Maschinen
- Energiequelle für Produktion
- Basis-Materialquelle für einfache Produktionsschritte


---

# ⚙️ 2. Maschinen-System (Separate Panels)

Die Factory nutzt ein **maschinenbasiertes Produktionssystem ohne Grid**.
Jede Maschine ist ein eigenständiges Element mit eigenen Funktionen,
Werten und Upgrades.

## 2.1 Maschinenstruktur
Jede Maschine besitzt:
- Input-Slots  
- Output-Slots  
- Geschwindigkeit / Prozessdauer  
- Effizienzwerte  
- Automatisierungsoptionen  
- Level und Upgrades  

## 2.2 Maschinentypen (konzeptionell)
Maschinen sind spezialisiert auf bestimmte Aufgaben, unter anderem:
- Schmelzen  
- Pressen / Formen  
- Mischen / Legieren  
- Zusammenbauen komplexer Items  
- Energieerzeugung oder Verarbeitung  
- Zerlegen / Zermahlen  

Keine spezifischen Rezepte oder Inhalte werden hier definiert.


---

# 🧪 3. Ressourcenfluss

## 3.1 Grundproduktion
Maschinen verarbeiten einfache Ressourcen und erzeugen fortgeschrittene Materialien.

## 3.2 Weiterverarbeitung
Mehrere Maschinenprozesse können hintereinander geschaltet sein:
- Basisrohstoff → verarbeiteter Rohstoff → Material → Komponente → High-End Produkt  
(ohne physikalisches Grid, rein logische Produktionsketten)

## 3.3 Automatische und manuelle Interaktion
Spieler können:
- Maschinen vollständig automatisch laufen lassen  
- Zwischendurch manuell produzieren  
- Ressourcen zwischen Maschinen verschieben  
- Maschinen individuell konfigurieren  


---

# 🔧 4. Crafting Grid (Minecraft-Stil)

Die Factory besitzt ein **3×3 Crafting-Grid**, das wie eine klassische
Werkbank funktioniert.

## 4.1 Funktionsweise
- Spieler ziehen Materialien in ein 3×3 Raster  
- Das System matcht das Muster gegen bekannte Crafting-Pattern  
- Wenn ein gültiges Rezept erkannt wird, wird ein Output angezeigt  
- Spieler können ein Item einzeln oder mehrfach craften  

## 4.2 Crafting Grid Use Cases
Das Grid dient zum Craften von:
- Maschinen  
- Upgrades  
- Komponenten  
- Werkstoffen  
- Endgame-Produkten  
- Sonstigen strukturellen Items  

Das Grid ist der zentrale Weg, um komplexe Items herzustellen,
während Maschinen die „Rohteile“ produzieren.


---

# 🖱️ 5. Manuelles Craften & Farming

Die Factory erlaubt aktive Einbindung durch den Spieler.

## 5.1 Manuelles Crafting
Jedes Grid-Rezept kann sofort manuell ausgelöst werden.
Upgrades können die Effizienz des manuellen Craftings erhöhen.

## 5.2 Manuelles Ressourcenfarmen
Der Spieler erhält einen separaten manuellen Farm-Button,
der einfache Factory-Ressourcen liefert und eine Chance auf seltene
Materialien bietet.


---

# 📦 6. Produkt-System (Globale Boni)

Alle produzierten Items können globale Boni gewähren.

## 6.1 Produktkategorien
Produkte können eingeteilt werden in:
- Grundmaterialien  
- Verarbeitete Materialien  
- Komponenten  
- Maschinenbauteile  
- High-Tech Items  
- Prestige- oder Spezialsachen  

## 6.2 Globale Effekte
Produkte können dem gesamten Spiel Vorteile bringen, z. B.:
- Erhöhte Einnahmen  
- Schnellere Elementproduktion  
- Verbesserte Rune- oder Gem-Raten  
- Höhere Automatisierungsgrade  
- Factory-interne Boni  

(Keine konkreten Werte werden hier festgelegt.)


---

# 🔁 7. Factory Prestige

Ein optionales System erlaubt es dem Spieler,
Produktionsfortschritt zurückzusetzen, um dauerhafte Boni zu erhalten.

## 7.1 Prestige-Effekt
Prestige kann globale Verbesserungen bieten wie:
- Erhöhte Maschinengeschwindigkeit  
- Bessere Ressourcenrate  
- Erhöhte Chancen auf Bonusprodukte  
- Qualitätsverbesserungen  

## 7.2 Reset-Logik
Beim Prestige werden nur bestimmte Teile zurückgesetzt:
- Produktionsspeicher  
- Zwischenprodukte  
- Aktive Prozesse  

Dinge wie freigeschaltete Maschinen, Grid-Rezepte oder Systemverbesserungen
können erhalten bleiben.


---

# 🌐 8. Synergien mit anderen Spielsystemen

Die Factory interagiert mit dem bestehenden Spiel.

## 8.1 Elemente
Elemente können der Factory verschiedene Vorteile geben, z. B.:
- Verarbeitungsspeed  
- Bonusproduktionen  
- Ressourceneffizienz  
- Qualitätssteigerung  

## 8.2 Runen
Runen beeinflussen Factory-Systeme wie:
- Seltenheit von Drop-Ressourcen  
- Bonusproduktion  
- Crafting-Kosten  

## 8.3 Achievements
Fortschritte in der Factory können Achievements freischalten,
die wiederum neue Boni geben.

## 8.4 Endgame / Portal Systeme
Viele Factory-Features können als Endgame-Schritte dienen.


---

# 🏗️ 9. Erweiterbarkeit

Die Factory ist modular aufgebaut, sodass folgende Erweiterungen möglich sind:
- Neue Maschinentypen  
- Saisonale oder dauerhafte neue Ressourcenketten  
- Neue Rezeptsets  
- Neue Grid-Pattern  
- Limitierte oder geheime Craftingkombinationen  
- Blueprint-Systeme für Maschinen-Layouts  
- Zusätzliche Produktionsstufen  

Alle Systeme sind darauf ausgelegt, langfristig skalierbar zu bleiben.


---

# ✔️ 10. Zusammenfassung

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