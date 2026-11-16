# Blog-Sicherung

Apps Script im Google-Konto onmathe.nachhilfe, das alle Beiträge aus [/blog](https://www.onmathe.de/blog) und [/magazin](https://www.onmathe.de/magazin) in Google Drive sichert. Stand 16.11.2026.

## Was gesichert wird

Im Drive-Ordner `OnMathe Sicherungen` entsteht pro Lauf ein Ordner `OnMathe Blog-Sicherung <Datum>, <Uhrzeit> Uhr` mit:

- `Blog/<Nr. Thema>/<Nr. Titel>/` und `Magazin/<Nr. Titel>/`: je Beitrag ein Ordner mit `Gesamtansicht.html`, `Live-Seite.html`, `Webflow-Daten.json`, dem Code jedes Rich-Text-Feldes, den Unterordnern `Posts`, `FAQs`, `Aufgaben`, `Bilder` und bei Bedarf `Dateien` und `Code`.
- `_Rohdaten/`: alle CMS-Sammlungen als JSON (Felder und Einträge, inklusive Entwürfe).
- `_Website-Code/`: Stylesheet der Website und die Übersichtsseiten /blog und /magazin.
- `Übersicht` (Tabelle mit Links), `LIESMICH.txt`, `_Protokoll.txt`.

Zuordnung wie auf der Website: Posts, FAQs und Aufgaben gehören über die gemeinsame Pagereference zu einem Beitrag.

## Dateien

- `BLS_Start.gs`: Einstellungen, Bedienung (`BLS_sicherungStarten`, `BLS_status`, `BLS_weiter`, `BLS_abbrechen`) und Ablauf in Etappen.
- `BLS_Webflow.gs`: Webflow-API v2, Live-Seiten und CDN-Dateien.
- `BLS_Beitrag.gs`: Reihenfolge der Beiträge und Inhalt eines Beitragsordners.
- `BLS_Ansicht.gs`: Gesamtansicht, Übersichtstabelle, LIESMICH.
- `BLS_Ablage.gs`: Drive-Ablage, Dateinamen, Protokoll.

## Einrichtung

1. Webflow: Site settings > Apps & integrations > API access > Generate API token, nur CMS mit Leserecht.
2. Apps-Script-Projekt anlegen, die fünf Dateien einfügen.
3. Projekteinstellungen > Skripteigenschaften: `BLS_WEBFLOW_TOKEN` mit dem Token.
4. `BLS_sicherungStarten` ausführen und Zugriff erlauben.

Ein Lauf dauert bei rund 50 Beiträgen etwa 20 Minuten in Etappen von gut 4 Minuten, die sich über einen Zeit-Trigger selbst fortsetzen. Wird ein Lauf hart abgebrochen, legt der nächste den angefangenen Beitrag neu an. Bei Token-Fehlern hält die Sicherung an, nach dem Beheben setzt `BLS_weiter` sie fort.
