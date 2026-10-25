/* GRS: Google Reviews Server fuer das Bewertungs-Widget auf onmathe.de
   Laeuft als GitHub Action alle 6 h (.github/workflows/update-reviews.yml).
   Holt die Reviews von der Places API (Legacy Place Details), zweimal:
   reviews_sort=most_relevant und reviews_sort=newest. Beide Ergebnisse werden
   zusammengefuehrt, nach Autor + Zeitstempel dedupliziert und hier fertig
   ausgewaehlt: nur 5-Sterne-Bewertungen mit Mindestlaenge, neueste zuerst;
   bleiben zu wenige, wird mit den laengsten kuerzeren 5-Sterne-Bewertungen
   aufgefuellt. Ergebnis: public/reviews.json, ausgeliefert ueber GitHub Pages.
   Das Widget rendert genau das, was ankommt, und enthaelt selbst keine Filterlogik.
   Der API-Key kommt aus dem Repository-Secret GOOGLE_PLACES_API_KEY, nie aus dem Code.
   Schlaegt der Abruf fehl oder ist die Auswahl leer, bleibt die alte Datei unveraendert
   und das Script endet mit Fehlercode (Lauf wird rot, GitHub schickt eine Mail).
   Seit 25.10.2026 zusaetzlich public/reviews_alle.json: alle Bewertungen dieses Laufs ohne Auswahl
   (bis zu 10, neueste zuerst, mit author_url als festem Erkennungszeichen der Bewertenden) fuer den
   Abgleich in der Kundenerfassung (56_Bewertung_Abgleich.gs). Geschrieben nur, wenn sich die Liste
   aendert; das Widget nutzt diese Datei nicht. */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRS_PLACE_ID = 'ChIJ64cXfskXmUcRHkjn2GnPST8';
const GRS_SORTS    = ['most_relevant', 'newest'];

/* Auswahlkriterien (unveraendert aus dem bisherigen Apps Script) */
const GRS_MIN_RATING = 5;   /* Mindest-Sterne */
const GRS_MIN_LEN    = 145; /* Mindest-Textlaenge in Zeichen */
const GRS_MIN_CARDS  = 3;   /* darunter wird aufgefuellt */
const GRS_FILL_LEN   = 50;  /* Mindestlaenge fuers Auffuellen */
const GRS_FILL_TO    = 5;   /* Zielanzahl beim Auffuellen */

/* Ausgabe */
const GRS_OUT = fileURLToPath(new URL('../public/reviews.json', import.meta.url));
const GRS_OUT_ALLE = fileURLToPath(new URL('../public/reviews_alle.json', import.meta.url));
/* Spaetestens nach so vielen Tagen wird die Datei auch ohne inhaltliche Aenderung neu geschrieben.
   Der Commit haelt den Zeitplan aktiv: GitHub pausiert Zeitplaene in oeffentlichen Repos nach 60 Tagen ohne Aktivitaet */
const GRS_HEARTBEAT_DAYS = 25;

/* ===== Ein Place-Details-Abruf mit gewuenschter Sortierung, bis zu 3 Versuche ===== */
async function GRS_fetchSorted(sort, apiKey) {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + '?place_id=' + encodeURIComponent(GRS_PLACE_ID)
    + '&fields=reviews,rating,user_ratings_total'
    + '&language=de'
    + '&reviews_sort=' + sort
    + '&key=' + encodeURIComponent(apiKey);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.status !== 'OK' || !data.result) {
        throw new Error('Status ' + data.status + (data.error_message ? ' (' + data.error_message + ')' : ''));
      }
      return data.result;
    } catch (e) {
      console.warn('GRS: ' + sort + ', Versuch ' + attempt + ' fehlgeschlagen: ' + e.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
}

/* ===== Auswahl: 5 Sterne + Mindestlaenge, neueste zuerst; sonst auffuellen ===== */
export function GRS_select(list) {
  const len = r => (r.text || '').trim().length;
  const five = list.filter(r => Number(r.rating) >= GRS_MIN_RATING);

  const good = five
    .filter(r => len(r) >= GRS_MIN_LEN)
    .sort((a, b) => (b.time || 0) - (a.time || 0));

  if (good.length < GRS_MIN_CARDS) {
    const rest = five
      .filter(r => len(r) < GRS_MIN_LEN && len(r) >= GRS_FILL_LEN)
      .sort((a, b) => len(b) - len(a));
    for (let i = 0; i < rest.length && good.length < GRS_FILL_TO; i++) {
      good.push(rest[i]);
    }
  }
  return good;
}

/* ===== Alle Bewertungen des Laufs ungefiltert, neueste zuerst; nur bei Aenderung schreiben ===== */
async function GRS_writeAlle(alle, rating, total) {
  if (!alle.length) return false;
  const liste = alle.slice().sort((a, b) => (b.time || 0) - (a.time || 0));
  let old = null;
  try { old = JSON.parse(await readFile(GRS_OUT_ALLE, 'utf8')); } catch (e) { old = null; }
  if (old && JSON.stringify([old.rating, old.total, old.reviews]) === JSON.stringify([rating, total, liste])) return false;
  await mkdir(dirname(GRS_OUT_ALLE), { recursive: true });
  await writeFile(GRS_OUT_ALLE, JSON.stringify({ rating: rating, total: total, updated: new Date().toISOString(), reviews: liste }, null, 2) + '\n');
  console.log('GRS: ' + liste.length + ' Reviews ungefiltert geschrieben (reviews_alle.json)');
  return true;
}

/* ===== Bisherige Datei lesen (fuer Vergleich und Heartbeat) ===== */
async function GRS_readOld() {
  try { return JSON.parse(await readFile(GRS_OUT, 'utf8')); } catch (e) { return null; }
}

/* ===== Hauptlauf ===== */
export async function GRS_main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY fehlt, bitte als Repository-Secret anlegen');

  const merged = [], alle = [], seen = new Set();
  let rating = null, total = null, okCount = 0;

  for (const sort of GRS_SORTS) {
    const result = await GRS_fetchSorted(sort, apiKey);
    if (!result) continue;
    okCount++;
    if (result.rating) rating = result.rating;
    if (result.user_ratings_total) total = result.user_ratings_total;

    for (const r of result.reviews || []) {
      const key = (r.author_name || '') + '|' + (r.time || '');
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relative_time_description: r.relative_time_description,
        profile_photo_url: r.profile_photo_url
      });
      alle.push({
        author_name: r.author_name,
        author_url: r.author_url || '',
        rating: r.rating,
        text: r.text,
        time: r.time
      });
    }
  }
  if (!okCount) throw new Error('kein Places-Abruf erfolgreich, alte reviews.json bleibt');

  /* Ungefilterte Liste fuer die Kundenerfassung, unabhaengig von der Auswahl fuers Widget */
  await GRS_writeAlle(alle, rating, total);

  const selected = GRS_select(merged);
  /* Alte Daten nie mit einer leeren Auswahl ueberschreiben */
  if (!selected.length) throw new Error('Auswahl leer, alte reviews.json bleibt');

  const next = {
    rating: rating,
    total: total,
    user_ratings_total: total,
    updated: new Date().toISOString(),
    reviews: selected
  };

  /* Nur schreiben, wenn sich etwas geaendert hat oder der Heartbeat faellig ist */
  const old = await GRS_readOld();
  const core = d => JSON.stringify([d.rating, d.total, d.reviews]);
  const ageDays = old && old.updated ? (Date.now() - Date.parse(old.updated)) / 86400000 : Infinity;
  if (old && core(old) === core(next) && ageDays < GRS_HEARTBEAT_DAYS) {
    console.log('GRS: unveraendert (' + selected.length + ' Reviews), nichts zu tun');
    return false;
  }

  await mkdir(dirname(GRS_OUT), { recursive: true });
  await writeFile(GRS_OUT, JSON.stringify(next, null, 2) + '\n');
  console.log('GRS: ' + selected.length + ' von ' + merged.length + ' Reviews geschrieben, Schnitt ' + rating + ', gesamt ' + total);
  return true;
}

/* Direkt ausgefuehrt (node scripts/update-reviews.mjs): Hauptlauf starten */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  GRS_main().catch(e => {
    console.error('GRS: ' + e.message);
    process.exit(1);
  });
}
