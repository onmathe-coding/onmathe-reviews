# onmathe-reviews

Backend für das Google-Bewertungs-Widget auf [onmathe.de](https://onmathe.de).

**Endpoint:** https://onmathe-coding.github.io/onmathe-reviews/reviews.json

**Für die Kundenerfassung:** https://onmathe-coding.github.io/onmathe-reviews/reviews_alle.json (alle Bewertungen des letzten Abrufs ohne Auswahl, siehe unten) und https://onmathe-coding.github.io/onmathe-reviews/reviews_augustin_alle.json (dasselbe für den Standort Augustin Heidenheim)

## So funktioniert es

1. Die GitHub Action **Reviews aktualisieren** läuft alle 6 Stunden und bei jeder Änderung am Script.
2. `scripts/update-reviews.mjs` holt die Bewertungen über die Google Places API (zweimal: relevanteste und neueste), führt sie zusammen und wählt aus: nur 5 Sterne, mindestens 145 Zeichen, neueste zuerst. Bleiben weniger als 3, wird mit den längsten kürzeren 5-Sterne-Bewertungen (ab 50 Zeichen) auf 5 aufgefüllt.
3. Das Ergebnis landet in `public/reviews.json` und wird über GitHub Pages ausgeliefert. Das Widget rendert genau diese Liste.
4. Daneben schreibt das Script `public/reviews_alle.json`: alle Bewertungen des Abrufs ohne Auswahl (bis zu 10, neueste zuerst, mit `author_url`), nur wenn sich etwas ändert. Die Kundenerfassung ordnet damit neue Bewertungen den Kunden zu (`56_Bewertung_Abgleich.gs`). Das Widget nutzt diese Datei nicht.

5. Seit 07.11.2026 holt das Script dasselbe für das Google-Profil von Augustin Nachhilfe Heidenheim (Place-ID `ChIJn-0Q_3QWmUcRj9nsBrp6IVA`) und schreibt `public/reviews_augustin_alle.json` (Format wie `reviews_alle.json`, dazu `standort` und `place_id`). Für den Abgleich der Kundenerfassung je Standort; das Widget bleibt OnMathe.

Schlägt der Google-Abruf fehl, bleibt die letzte `reviews.json` online und der Lauf wird rot markiert. Schlägt nur der Abruf für Augustin fehl, gehen die OnMathe-Dateien trotzdem raus und der Lauf wird danach rot (Schritt „Fehlgeschlagenen Augustin-Abruf melden“).

## Frontend

`widget/` enthält den aktuellen Stand der beiden Webflow-Embeds, die diesen Endpoint nutzen:

- `reviews-widget.html`: Bewertungs-Slider (Komponente „reviews-widget“, 1 s simulierter Loader)
- `rating-box.html`: Google-Rating-Box (Komponente „reviews“)

Beide teilen sich den Browser-Cache `grsReviewsV6` (24 h).

## Einrichtung

- Repository-Secret `GOOGLE_PLACES_API_KEY` unter Settings → Secrets and variables → Actions
- Settings → Pages → Source: **GitHub Actions**

## Manuell aktualisieren

Actions → Reviews aktualisieren → Run workflow
