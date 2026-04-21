# ✈ Checkliste & Info  — PWA

Offline-fähige Flug-Checkliste und Infos als Progressive Web App.

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
| `ChecklisteArcusDKJRR.csv` | Deine Arcus-M-Checkliste (CSV-Import) |

---

## Installation am Handy

### Option A – Lokaler Server (empfohlen, vollständige PWA)

1. Python auf dem Computer starten:
   ```bash
   python3 server.py
   ```
2. Angezeigt IP-Adresse im Handy-Browser öffnen:
   `http://192.168.x.x:8080`
3. **iOS Safari**: Teilen-Symbol → "Zum Home-Bildschirm"  
   **Android Chrome**: Menü → "App installieren" oder Banner antippen

> Für HTTPS (vollständige PWA-Features auf manchen Geräten):
> ```bash
> pip install cryptography
> python3 server.py --https
> ```

### Option B – Webserver (Nginx, Apache, eigenes NAS)

Alle Dateien in ein Verzeichnis legen und als statische Website ausliefern.
Der Server muss `sw.js` mit dem Header `Service-Worker-Allowed: /` ausliefern.

### Option C – GitHub Pages / Netlify / Cloudflare Pages

1. Dieses Verzeichnis in ein Git-Repository pushen
2. GitHub Pages / Netlify aktivieren → automatisch HTTPS + globales CDN
3. URL am Handy öffnen, installieren

---

## CSV-Format

```
Kapitelname
Spalte1;Spalte2;Hinweis (optional)
Zeile1a;Zeile1b
!KritischeZeile;Wert
Nächstes Kapitel
...
```

- Zeile mit **einem Feld** → neues Kapitel / neue Seite
- **`!`** am Zeilenanfang → rot markiert, bleibt rot bis abgehakt
- **3. Spalte** → erscheint als kursiver Hinweis unter der Zeile
- Trennzeichen: `;` `,` Tab (automatisch erkannt)

---

## Features

- ✅ Offline-fähig via Service Worker (Cache-first Strategy)
- ✅ PWA installierbar (Android Chrome-Banner, iOS Safari "Add to Homescreen")
- ✅ Dark / Light Theme
- ✅ Bildschirm wach halten (Wake Lock API)
- ✅ Auto-Weiter wenn Kapitel komplett
- ✅ Kritische Zeilen (rote Markierung via `!`)
- ✅ Mehrere Profile speichern/laden (localStorage)
- ✅ Fortschrittsbalken, Häkchen-Status persistent
- ✅ Swipe-Navigation zwischen Kapiteln
- ✅ Haptisches Feedback (Android)
- ✅ Safe-Area-Unterstützung (Notch, Dynamic Island)
- ✅ Update-Banner wenn neue SW-Version verfügbar

---

*Arcus M D-KJRR – Checkliste Version 8*
