# Notenrechner /magazin/notenrechner

Rechner im Magazinbeitrag „Notenrechner: Notendurchschnitt berechnen und Versetzung prüfen“. Läuft komplett im Browser, speichert nichts. Stand 15.11.2026.

## Aufbau

- **Im CMS** (Articlepages, Feld „Inhalt“) steht nur ein kleiner Code-Block: die Section `#mnr` mit H2 und Einleitung, der leere Platzhalter `#mnr-app` und das Script `notenrechner.js` (`defer`, `data-cookieconsent="ignore"`).
- **`public/notenrechner/notenrechner.js`** wird über GitHub Pages ausgeliefert: https://onmathe-coding.github.io/onmathe-reviews/notenrechner/notenrechner.js. Es baut Stil und Oberfläche in `#mnr-app` ein und startet die Logik.
- Eine Änderung an `public/notenrechner/` löst die Action „Reviews aktualisieren“ aus und veröffentlicht die Datei sofort. Nach einer Änderung im CMS die Version im Script-Link hochzählen (`?v=2`), damit Browser nicht die alte Datei aus dem Cache nehmen.

## Quellen in diesem Ordner

- `nr.css`: Stil, alle Klassen mit Präfix `mnr-`, Farben aus den `mag-`-Variablen der Artikelvorlage.
- `nr.html`: Oberfläche mit vier Tabs (Fachnote, Zeugnis und Versetzung, Zielnote, Punkte in Note). Der Kopf bis zur Einleitung steht im CMS, der Rest wird eingebaut.
- `nr1.js`: Notenlesen, Tabs, Fachnote, Zielnote, Punkte.
- `nr2.js`: Fächerliste und Versetzungsprüfung.
- `build_bundle.py`: baut aus den vier Dateien `notenrechner.js` und den statischen CMS-Teil.

## Regeln

- Plus und Minus: wählbar 0,25, 0,3 (Standard) oder 0,33.
- Zielnote: Ziel heißt rechnerisch unter x,5. Angezeigt wird der abgerundete Wert, damit er sicher reicht.
- Versetzung, Gymnasium Baden-Württemberg: § 1 Abs. 2 GymVersV (Schnitt aller Fächer und Kernfächer 4,0 oder besser, keine 6 im Kernfach, höchstens zwei Fächer unter 4 mit Ausgleich) und § 2 (Sport, Musik, Kunst nur mit der besten Note, wenn es sonst nicht reicht).
- Versetzung, alle anderen: Faustregel (keine 5: versetzt, eine 5: meist versetzt, zwei Fünfer oder eine 6: nur mit Ausgleich, mehr: nicht versetzt).
- Noten wie 4-5 gelten als offen: Der Rechner prüft günstigsten und ungünstigsten Fall und nennt das entscheidende Fach.
- Punkte in Note: IHK-Schlüssel oder KMK-Raster für die schriftliche Abiturprüfung (15 Punkte ab 95 %).

## Links im Text

`#zeugnis`, `#zielnote`, `#punkte` und `#fachnote` öffnen den passenden Tab und scrollen zum Rechner.
