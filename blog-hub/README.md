# Blog-Hub /blog

Suche, Themenkarten und Lernpfade auf [onmathe.de/blog](https://www.onmathe.de/blog). Läuft komplett im Browser, ohne KI und ohne externen Dienst. Stand 14.11.2026.

## Aufbau auf der Seite /blog (main-wrapper, in dieser Reihenfolge)

1. **Embed 1** `embed1_stil-geruest.html`: Stil (alles mit Präfix `obs-`), KaTeX-Einbindung (gregor346.github.io), Startwerte `OMBS_STATIC`, Grundgerüst mit H1, Foto, Suchfeld.
2. **CMS-Liste `#obs-data`** (Blogpages, unsichtbar): je Beitrag Slug, H1, Subtitle, Author, Thema, Klassenstufe, Reihenfolge im Thema, Pagereference-Slug, Thumbnail Description.
3. **Embed 2** `embed2_suchlogik.html`: Suchlogik `OMBS_ENGINE` (Normalisieren, Wortstamm, Tippfehler, Gewichtung).
4. **Embed 3** `embed3_oberflaeche.html`: Oberfläche. Liest `#obs-data`, lädt den Suchindex nach, rendert alles.
5. Alte Hero-Section `section-blog-header`: unsichtbar geschaltet.
6. Alte Beitragsliste `section-blog-posts`: bleibt im HTML, wird per CSS ausgeblendet, sobald das Script läuft (Fallback ohne JavaScript).

## Suchindex /blog-suchindex

Unsichtbare Datenseite (noindex, nicht in der Sitemap). Drei CMS-Listen: Blogpages (`#obs-ix-a`), Posts (`#obs-ix-p1`, paginiert je 100) und FAQs (`#obs-ix-f1`, paginiert je 100, mit Rich Text der Antwort). Verknüpft wird über den Slug der Pagereference. Embed 3 holt Seite 1 und die Folgeseiten parallel, sobald die Seite ruht oder jemand ins Suchfeld klickt. Wächst der Blog, kommen automatisch weitere Seiten dazu.

## Pflege im CMS (Blogpages)

- **Thema**: neue Beiträge immer zuordnen, sonst stehen sie unter „Weitere Beiträge“.
- **Klassenstufe**: wird beim Beitrag angezeigt.
- **Reihenfolge im Thema**: 10, 20, 30 … ; zum Einfügen eine Zahl dazwischen (z. B. 15).
- Ein Abschnitt (Post) gilt als **Rechner**, wenn seine Überschrift „Rechner“ enthält (nicht „Taschenrechner“, „rechnerisch“).

`OMBS_STATIC` in Embed 1 enthält nur Startwerte (Rechner, FAQ-Zahl, Suchbegriffe je Beitrag, Klicks für „Oft gesucht“). Nach dem Laden des Suchindex gelten die echten CMS-Daten. Suchbegriffe für neue Beiträge können dort unter `kw` ergänzt werden, nötig ist das nicht: Titel, Subtitle, Abschnitte und FAQ-Fragen sind ohnehin durchsuchbar.

## Zurückbauen

Embed 1, Liste `#obs-data`, Embed 2 und Embed 3 auf /blog löschen und `section-blog-header` wieder sichtbar schalten. Die alte Liste erscheint dann von selbst.
