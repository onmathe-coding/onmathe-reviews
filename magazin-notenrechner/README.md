# Notenrechner /magazin/notenrechner

Rechner im Magazinbeitrag „Notenrechner: Notendurchschnitt berechnen und Versetzung verstehen“. Läuft komplett im Browser, speichert nichts. Stand 16.11.2026.

## Bedienung

1. Noten der Klassenarbeiten je in einem Auswahlfeld wählen (drei Felder, mit „+ Weitere Arbeit“ bis zu acht).
2. Mündliche Note wählen.
3. „Berechnen“ tippen. Danach rechnet der Rechner bei jeder Änderung sofort neu.

Das Ergebnis zeigt die Fachnote für drei Gewichtungen der mündlichen Note: 50 %, 1/3 und 25 %. Ohne mündliche Note zeigt er nur den Schnitt der Arbeiten.

## Aufbau

- **Im CMS** (Articlepages, Feld „Inhalt“) steht nur ein kleiner Code-Block: die Section `#mnr` mit H2 und Einleitung, der leere Platzhalter `#mnr-app` mit Mindesthöhe gegen Layoutsprünge und das Script `notenrechner.js` (`defer`, `data-cookieconsent="ignore"`).
- **`public/notenrechner/notenrechner.js`** wird über GitHub Pages ausgeliefert: https://onmathe-coding.github.io/onmathe-reviews/notenrechner/notenrechner.js. Es baut Stil und Oberfläche in `#mnr-app` ein und startet die Logik.
- Eine Änderung an `public/notenrechner/` löst die Action „Reviews aktualisieren“ aus und veröffentlicht die Datei sofort. Nach einer Änderung die Version im Script-Link im CMS hochzählen (aktuell `?v=2`), damit Browser nicht die alte Datei aus dem Cache nehmen.

## Quellen in diesem Ordner

- `nr.css`: Stil, alle Klassen mit Präfix `mnr-`, Farben aus den `mag-`-Variablen der Artikelvorlage.
- `nr.html`: Oberfläche. Der Kopf bis zur Einleitung steht im CMS, der Rest wird eingebaut.
- `nr.js`: Logik (Auswahlfelder, Berechnung, Ausgabe).
- `build_bundle.py`: baut aus den drei Dateien `notenrechner.js` und den statischen CMS-Teil.

## Regeln

- Plus und Minus zählen fest 0,3: 2+ = 1,7, 2- = 2,3, 1+ = 0,7.
- Fachnote = (1 - g) × Schnitt der Arbeiten + g × mündliche Note, mit g = 1/2, 1/3 und 1/4.
- Angezeigt wird der Wert mit höchstens zwei Nachkommastellen und die ganze Note. Genau x,5 heißt „zwischen x und x+1“, weil dort die Lehrkraft entscheidet.

## Vorgänger

Bis 16.11.2026 hatte der Rechner vier Tabs (Fachnote mit Gewichtungsauswahl, Zeugnis und Versetzung, Zielnote, Punkte in Note). Er steht in der Git-Historie, zuletzt in Commit dd4750d.
