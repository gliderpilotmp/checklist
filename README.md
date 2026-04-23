# ✈ Checklisten und Infos — PWA

Offline-fähige Flug-Checklisten mit Infobseiten als Progressive Web App.

---

## Inhalt

| Datei | Beschreibung |
|---|---|
| `index.html` | App (alles drin) |
| `sw.js` | Service Worker (Offline-Caching) |
| `manifest.json` | PWA-Manifest (Name, Icon, Vollbild) |
| `icons/icon-192.png` | App-Icon 192×192 |
| `icons/icon-512.png` | App-Icon 512×512 |
| `server.py` | Lokaler Python-Server |
| `Config.csv` | Deine Checklisten und Infos im CSV Format (CSV-Import) |

---

## Installation am Handy

### https://gliderpilotmp.github.io/checklist
Die URL am Handy öffnen, zum Startbildschirm als App hinzufügen

---

## CSV-Format für config.csv

```
=== CHECKLIST ===

#Kapitelname
##Spalte1;Spalte2;Hinweis (optional)
Zeile1a;Zeile1b
!KritischeZeile;Wert

#Nächstes Kapitel
##Spalte1;Spalte2;Hinweis (optional)
...

=== INFOS ===

#Kapitelname
##Spalte1;Spalte2;Hinweis (optional)
Zeile1a;Zeile1b
!KritischeZeile;Wert

#Nächstes Kapitel
##Spalte1;Spalte2;Hinweis (optional)
...
```

- Zeile mit **#** → neues Kapitel / neue Seite
- Zeile mit **##**  → Spaltenüberschriften
- **`!`** am Zeilenanfang → rot markiert, bleibt rot bis abgehakt
- **3. Spalte** → erscheint als kursiver Hinweis unter der Zeile
- Trennzeichen: `;` `,` Tab (automatisch erkannt)

---

## Features

- ✅ Checklisten und Informationen in 2 Bereichen über config.csv editierbar
- ✅ Checklisten abhakbar
- ✅ Kritische Zeilen (rote Markierung via `!`)
- ✅ Mehrere Profile speichern/laden/exportieren (localStorage)
- ✅ Dark / Light Theme
- ✅ Bildschirm wach halten (Wake Lock API)
- ✅ Auto-Weiter wenn Kapitel bei Checklisten komplett
- ✅ Fortschrittsbalken, Häkchen-Status persistent
- ✅ Swipe-Navigation zwischen Kapiteln
- ✅ Haptisches Feedback (Android)
- ✅ Offline-fähig via Service Worker (Cache-first Strategy)
- ✅ PWA installierbar (Android Chrome-Banner, iOS Safari "Add to Homescreen")
- ✅ Safe-Area-Unterstützung (Notch, Dynamic Island)
- ✅ Update-Banner wenn neue SW-Version verfügbar
