# onmathe-reviews

Backend für das Google-Bewertungs-Widget auf [onmathe.de](https://onmathe.de).

**Endpoint:** https://onmathe-coding.github.io/onmathe-reviews/reviews.json

## So funktioniert es

1. Die GitHub Action **Reviews aktualisieren** läuft alle 6 Stunden und bei jeder Änderung am Script.
2. `scripts/update-reviews.mjs` holt die Bewertungen über die Google Places API (zweimal: relevanteste und neueste), führt sie zusammen und wählt aus: nur 5 Sterne, mindestens 145 Zeichen, neueste zuerst. Bleiben weniger als 3, wird mit den längsten kürzeren 5-Sterne-Bewertungen (ab 50 Zeichen) auf 5 aufgefüllt.
3. Das Ergebnis landet in `public/reviews.json` und wird über GitHub Pages ausgeliefert. Das Widget rendert genau diese Liste.

Schlägt der Google-Abruf fehl, bleibt die letzte `reviews.json` online und der Lauf wird rot markiert.

## Einrichtung

- Repository-Secret `GOOGLE_PLACES_API_KEY` unter Settings → Secrets and variables → Actions
- Settings → Pages → Source: **GitHub Actions**

## Manuell aktualisieren

Actions → Reviews aktualisieren → Run workflow
