# Notenrechner /magazin/notenrechner

Rechner im Magazinbeitrag „Notenrechner: Notendurchschnitt berechnen und Versetzung prüfen“. Läuft komplett im Browser, speichert nichts. Stand 15.11.2026.

## Aufbau im CMS (Articlepages, Feld „Inhalt“)

Vier Code-Blöcke im Rich Text, direkt nach dem ersten Absatz, in dieser Reihenfolge:

1. `nr.css` als `<style>`: Stil, alle Klassen mit Präfix `mnr-`, Farben aus den `mag-`-Variablen der Artikelvorlage.
2. `nr.html`: Grundgerüst mit vier Tabs (Fachnote, Zeugnis und Versetzung, Zielnote, Punkte in Note).
3. `nr1.js` als `<script>`: Notenlesen, Tabs, Fachnote, Zielnote, Punkte.
4. `nr2.js` als `<script>`: Fächerliste und Versetzungsprüfung.

Jeder Block bleibt unter 10.000 Zeichen (Grenze für Code im Rich Text). Im CMS stehen die Skripte ohne Einrückung und Zeilenkommentare, hier lesbar.

## Regeln

- Plus und Minus: wählbar 0,25, 0,3 (Standard) oder 0,33.
- Zielnote: Ziel heißt rechnerisch unter x,5. Angezeigt wird der abgerundete Wert, damit er sicher reicht.
- Versetzung, Gymnasium Baden-Württemberg: § 1 Abs. 2 GymVersV (Schnitt aller Fächer und Kernfächer 4,0 oder besser, keine 6 im Kernfach, höchstens zwei Fächer unter 4 mit Ausgleich) und § 2 (Sport, Musik, Kunst nur mit der besten Note, wenn es sonst nicht reicht).
- Versetzung, alle anderen: Faustregel (keine 5: versetzt, eine 5: meist versetzt, zwei Fünfer oder eine 6: nur mit Ausgleich, mehr: nicht versetzt).
- Noten wie 4-5 gelten als offen: Der Rechner prüft günstigsten und ungünstigsten Fall und nennt das entscheidende Fach.
- Punkte in Note: IHK-Schlüssel oder KMK-Raster für die schriftliche Abiturprüfung (15 Punkte ab 95 %).

## Links im Text

`#zeugnis`, `#zielnote`, `#punkte` und `#fachnote` öffnen den passenden Tab und scrollen zum Rechner.
