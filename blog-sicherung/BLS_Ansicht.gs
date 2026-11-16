/**
 * OnMathe Blog-Sicherung: lesbare Gesamtansicht je Beitrag, Übersichtstabelle und LIESMICH.
 */

const BLS_KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/';

const BLS_STIL = [
  '.bls-body{margin:0;background:#f5f6f8;color:#1c2333;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}',
  '.bls-kopf,.bls-block,.bls-fuss{box-sizing:border-box;max-width:880px;margin:0 auto 18px;padding:24px 20px}',
  '.bls-kopf{padding-top:40px;margin-bottom:8px}',
  '.bls-kopf h1{font-size:32px;line-height:1.2;margin:6px 0 10px}',
  '.bls-kopf p{margin:0;color:#556070;font-size:14px}',
  '.bls-block{background:#fff;border:1px solid #e1e5eb;border-radius:10px}',
  '.bls-block>h2{font-size:21px;line-height:1.3;margin:0 0 14px}',
  '.bls-teil+.bls-teil{border-top:1px solid #e1e5eb;margin-top:18px;padding-top:18px}',
  '.bls-teil>h3{font-size:15px;line-height:1.4;margin:0 0 4px;padding:6px 10px;background:#eef2f7;border-radius:6px;color:#2b3a52}',
  '.bls-rt h1{font-size:24px}.bls-rt h2{font-size:21px}.bls-rt h3{font-size:18px}.bls-rt h4{font-size:16px}',
  '.bls-teil>h4{font-size:15px;margin:16px 0 6px;color:#556070}',
  '.bls-meta{margin:0 0 12px;color:#556070;font-size:13px}',
  '.bls-felder{width:100%;border-collapse:collapse;font-size:14px}',
  '.bls-felder th{text-align:left;vertical-align:top;width:32%;padding:7px 12px 7px 0;color:#556070;font-weight:600}',
  '.bls-felder td{padding:7px 0;vertical-align:top;overflow-wrap:anywhere}',
  '.bls-felder tr+tr>*{border-top:1px solid #edf0f4}',
  '.bls-felder img{display:block;max-width:240px;height:auto;border-radius:6px;margin-bottom:4px}',
  '.bls-leer{color:#99a1ad}',
  '.bls-rt{overflow-x:auto}',
  '.bls-rt img{max-width:100%;height:auto}',
  '.bls-fuss{color:#556070;font-size:13px}'
].join('\n');

const BLS_KATEX_START = '<script>document.addEventListener("DOMContentLoaded",function(){if(window.renderMathInElement){renderMathInElement(document.body,{delimiters:[{left:"$$",right:"$$",display:true},{left:"\\\\[",right:"\\\\]",display:true},{left:"\\\\(",right:"\\\\)",display:false}],throwOnError:false});}});</script>';

/** Der ganze Beitrag in einer HTML-Datei: Felder, Rich-Text, Posts, FAQs, Aufgaben, Dateien. */
function BLS_gesamtansicht_(job, d, e, it, schema, teile, aufgeloest, dateien) {
  const S = BLS.SAMMLUNG;
  const fd = it.fieldData || {};
  const url = BLS.DOMAIN + e.pfad;
  const lokal = {};
  dateien.forEach(function (x) { if (x.datei) lokal[x.url] = BLS_relPfad_(x.datei); });
  const urls = Object.keys(lokal).sort(function (a, b) { return b.length - a.length; });
  function lokalisieren(html) {
    let h = String(html || '');
    urls.forEach(function (u) {
      h = h.split(u).join(lokal[u]);
      const enc = u.replace(/&/g, '&amp;');
      if (enc !== u) h = h.split(enc).join(lokal[u]);
    });
    return h;
  }
  function wert(f) {
    const v = fd[f.slug];
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return '<span class="bls-leer">leer</span>';
    if (f.type === 'Image' || f.type === 'MultiImage' || f.type === 'File') {
      return (Array.isArray(v) ? v : [v]).map(function (x) {
        const quelle = lokal[x.url] || x.url;
        const bild = f.type === 'File' ? '' : '<img src="' + BLS_esc_(quelle) + '" alt="' + BLS_esc_(x.alt || '') + '">';
        return bild + '<a href="' + BLS_esc_(quelle) + '">' + BLS_esc_(lokal[x.url] ? decodeURIComponent(lokal[x.url]) : x.url) + '</a>' +
          (x.alt ? '<br>Alt-Text: ' + BLS_esc_(x.alt) : '');
      }).join('<br>');
    }
    if (f.type === 'Option' || f.type === 'Reference' || f.type === 'MultiReference') {
      const a = aufgeloest[f.displayName];
      let s = BLS_esc_(Array.isArray(a) ? a.join(', ') : a);
      const verkn = aufgeloest[f.displayName + ', verknüpfte Beiträge'];
      if (verkn) s += '<br><span class="bls-meta">Verknüpfte Beiträge: ' + BLS_esc_(verkn.join(', ')) + '</span>';
      return s;
    }
    if (f.type === 'DateTime') return BLS_esc_(BLS_datum_(v));
    if (f.type === 'Switch') return v ? 'ja' : 'nein';
    if (f.type === 'Link' || f.type === 'VideoLink') return '<a href="' + BLS_esc_(v) + '">' + BLS_esc_(v) + '</a>';
    return BLS_esc_(v);
  }

  const zeilen = [
    ['Bereich', BLS_esc_(e.bereich + (e.thema ? ', Thema ' + e.thema + ', Nr. ' + e.nr : ''))],
    ['Live-URL', '<a href="' + BLS_esc_(url) + '">' + BLS_esc_(url) + '</a>'],
    ['Status', BLS_esc_(BLS_statusText_(it))],
    ['Erstellt', BLS_esc_(BLS_datum_(it.createdOn))],
    ['Zuletzt geändert', BLS_esc_(BLS_datum_(it.lastUpdated))],
    ['Zuletzt veröffentlicht', BLS_esc_(BLS_datum_(it.lastPublished)) || '<span class="bls-leer">nie</span>'],
    ['Webflow-ID', BLS_esc_(it.id)]
  ];
  schema.fields.forEach(function (f) {
    if (f.type !== 'RichText') zeilen.push([BLS_esc_(f.displayName), wert(f)]);
  });

  const teileHtml = [];
  schema.fields.forEach(function (f) {
    if (f.type !== 'RichText' || !fd[f.slug]) return;
    teileHtml.push('<section class="bls-block"><h2>' + BLS_esc_(f.displayName) + '</h2><div class="bls-rt w-richtext">' +
      lokalisieren(fd[f.slug]) + '</div></section>');
  });
  [
    { key: 'posts', titel: 'Posts', col: S.POSTS, titelFeld: 'post-headline', label: 'Post' },
    { key: 'faqs', titel: 'FAQs', col: S.FAQS, titelFeld: 'seo-text-heading', label: 'FAQ' },
    { key: 'aufgaben', titel: 'Aufgaben', col: S.AUFGABEN, titelFeld: 'aufgabe-uberschrift-2', label: 'Aufgabe' }
  ].forEach(function (g) {
    const liste = teile[g.key];
    if (!liste.length) return;
    const rtFelder = d.schema[g.col].fields.filter(function (f) { return f.type === 'RichText'; });
    const html = liste.map(function (x, k) {
      const xf = x.fieldData || {};
      const meta = ['Name: ' + (xf.name || ''), 'Slug: ' + (xf.slug || '')];
      if (typeof xf.position === 'number') meta.push('Position: ' + xf.position);
      meta.push('Status: ' + BLS_statusText_(x));
      let s = '<article class="bls-teil"><h3>' + g.label + ' ' + BLS_pad_(k + 1) + ': ' + BLS_esc_(xf[g.titelFeld] || xf.name || x.id) + '</h3>' +
        '<p class="bls-meta">' + BLS_esc_(meta.join(', ')) + '</p>';
      rtFelder.forEach(function (f) {
        if (rtFelder.length > 1) s += '<h4>' + BLS_esc_(f.displayName) + '</h4>';
        s += '<div class="bls-rt w-richtext">' + (xf[f.slug] ? lokalisieren(xf[f.slug]) : '<p class="bls-leer">leer</p>') + '</div>';
      });
      return s + '</article>';
    }).join('');
    teileHtml.push('<section class="bls-block"><h2>' + g.titel + ' (' + liste.length + ')</h2>' + html + '</section>');
  });
  if (dateien.length) {
    teileHtml.push('<section class="bls-block"><h2>Bilder und Dateien (' + dateien.length + ')</h2><table class="bls-felder"><tbody>' +
      dateien.map(function (x) {
        return '<tr><th>' + BLS_esc_(x.fundort) + '</th><td>' +
          (x.datei ? '<a href="' + BLS_esc_(BLS_relPfad_(x.datei)) + '">' + BLS_esc_(x.datei) + '</a><br>' : '<span class="bls-leer">nicht geladen</span><br>') +
          '<span class="bls-meta">' + BLS_esc_(x.url) + '</span></td></tr>';
      }).join('') + '</tbody></table></section>');
  }

  return '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + BLS_esc_(e.titel) + ' | Sicherung</title>\n' +
    (job.css ? '<link rel="stylesheet" href="' + BLS_esc_(job.css) + '">\n' : '') +
    '<link rel="stylesheet" href="' + BLS_KATEX + 'katex.min.css">\n' +
    '<script defer src="' + BLS_KATEX + 'katex.min.js"></script>\n' +
    '<script defer src="' + BLS_KATEX + 'contrib/auto-render.min.js"></script>\n' +
    BLS_KATEX_START + '\n<style>\n' + BLS_STIL + '\n</style>\n</head>\n<body class="bls-body">\n' +
    '<header class="bls-kopf"><p>' + BLS_esc_(e.bereich + (e.thema ? ', ' + e.thema : '')) + '</p><h1>' + BLS_esc_(e.titel) + '</h1>' +
    '<p>' + BLS_esc_(BLS_statusText_(it)) + ', <a href="' + BLS_esc_(url) + '">' + BLS_esc_(url) + '</a></p></header>\n' +
    '<section class="bls-block"><h2>Felder</h2><table class="bls-felder"><tbody>' +
    zeilen.map(function (z) { return '<tr><th>' + z[0] + '</th><td>' + z[1] + '</td></tr>'; }).join('') +
    '</tbody></table></section>\n' + teileHtml.join('\n') + '\n' +
    '<footer class="bls-fuss">Gesichert am ' + BLS_esc_(BLS_datum_(new Date().toISOString())) +
    ' aus dem Webflow-CMS, gespeicherter Stand inklusive Entwürfe. Die Originalfelder stehen in Webflow-Daten.json, ' +
    'der Code jedes Feldes in den HTML-Dateien dieses Ordners.</footer>\n</body>\n</html>\n';
}

/** Tabelle "Übersicht" im Sicherungsordner. Liefert die Summen für LIESMICH. */
function BLS_uebersichtAnlegen_(job, d, plan, root) {
  const props = PropertiesService.getScriptProperties();
  const kopf = ['Bereich', 'Thema', 'Nr.', 'Titel (H1)', 'Status', 'Live-URL', 'Posts', 'FAQs', 'Aufgaben',
    'Bilder und Dateien', 'Live-Seite', 'Hinweise', 'Zuletzt geändert', 'Ordner'];
  const werte = [kopf];
  const links = [];
  const summe = { p: 0, q: 0, a: 0, b: 0, w: 0 };
  plan.forEach(function (e, i) {
    const erg = JSON.parse(props.getProperty(BLS.P_ERG + i) || '{}');
    const it = d.byId[e.col][e.id];
    werte.push([e.bereich, e.thema || (e.bereich === 'Blog' ? '(ohne Thema)' : ''), e.nr, e.titel, BLS_statusText_(it), BLS.DOMAIN + e.pfad, erg.p || 0, erg.q || 0, erg.a || 0,
      erg.b || 0, erg.l || '', erg.w || 0, BLS_datum_(it.lastUpdated), erg.f ? 'Ordner öffnen' : 'fehlt']);
    links.push(erg.f ? 'https://drive.google.com/drive/folders/' + erg.f : '');
    summe.p += erg.p || 0;
    summe.q += erg.q || 0;
    summe.a += erg.a || 0;
    summe.b += erg.b || 0;
    summe.w += erg.w || 0;
  });
  const ss = SpreadsheetApp.create('Übersicht');
  const sh = ss.getSheets()[0];
  sh.setName('Beiträge');
  sh.getRange(1, 1, werte.length, kopf.length).setValues(werte);
  if (links.length) {
    sh.getRange(2, kopf.length, links.length, 1).setRichTextValues(links.map(function (u) {
      const b = SpreadsheetApp.newRichTextValue().setText(u ? 'Ordner öffnen' : 'fehlt');
      return [u ? b.setLinkUrl(u).build() : b.build()];
    }));
  }
  sh.getRange(1, 1, 1, kopf.length).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange(1, 1, werte.length, kopf.length).createFilter();
  sh.autoResizeColumns(1, kopf.length);
  DriveApp.getFileById(ss.getId()).moveTo(root);
  return summe;
}

/** Posts, FAQs und Aufgaben, die zu keinem Beitrag gehören (zum Beispiel FAQs der Startseite). */
function BLS_nichtZugeordnet_(d, plan) {
  const S = BLS.SAMMLUNG;
  const genutzt = {};
  plan.forEach(function (e) {
    const ref = d.byId[e.col][e.id].fieldData.pagereference;
    if (ref) genutzt[ref] = true;
  });
  const refFeld = BLS_feld_(d.schema[S.POSTS], 'pagereference');
  const refCol = refFeld && refFeld.validations ? refFeld.validations.collectionId : null;
  const out = [];
  [['Posts', S.POSTS, 'pagereference'], ['FAQs', S.FAQS, 'reference-2'], ['Aufgaben', S.AUFGABEN, 'pagereference']].forEach(function (g) {
    const zaehler = {};
    let n = 0;
    (d.items[g[1]] || []).forEach(function (x) {
      const ref = x.fieldData[g[2]];
      if (ref && genutzt[ref]) return;
      const r = ref && refCol && d.byId[refCol] ? d.byId[refCol][ref] : null;
      const name = r ? r.fieldData.name : (ref ? 'unbekannte Referenz' : 'ohne Referenz');
      zaehler[name] = (zaehler[name] || 0) + 1;
      n++;
    });
    if (n) {
      out.push(n + ' ' + g[0] + ' (' + Object.keys(zaehler).map(function (k) { return k + ': ' + zaehler[k]; }).join(', ') + ')');
    }
  });
  return out;
}

function BLS_liesmich_(job, d, plan, summe, rest) {
  const blog = plan.filter(function (e) { return e.bereich === 'Blog'; }).length;
  const mag = plan.length - blog;
  const archiviert = plan.filter(function (e) { return d.byId[e.col][e.id].isArchived; }).length;
  const entwuerfe = plan.filter(function (e) { const x = d.byId[e.col][e.id]; return x.isDraft && !x.isArchived; }).length;
  const markiert = [];
  if (entwuerfe) markiert.push(entwuerfe + (entwuerfe === 1 ? ' Entwurf' : ' Entwürfe'));
  if (archiviert) markiert.push(archiviert + ' archiviert');
  const z = [
    job.name,
    '',
    'INHALT',
    'Übersicht: Tabelle mit allen ' + plan.length + ' Beiträgen, Kennzahlen und Links zu den Ordnern.',
    'Blog: ' + blog + ' Beiträge, sortiert nach Thema wie auf /blog und innerhalb des Themas nach "Reihenfolge im Thema".',
    'Magazin: ' + mag + ' Beiträge, sortiert nach Erstelldatum.',
    markiert.length ? 'Mitgesichert und im Ordnernamen markiert: ' + markiert.join(', ') + '.' : 'Es gibt keine Entwürfe und keine archivierten Beiträge.',
    'Gesamt: ' + summe.p + ' Posts, ' + summe.q + ' FAQs, ' + summe.a + ' Aufgaben, ' + summe.b + ' Bilder und Dateien.',
    '_Rohdaten: komplette Webflow-CMS-Daten aller ' + Object.keys(job.raw).length + ' Sammlungen, je Sammlung Felder und Einträge als JSON.',
    '_Website-Code: Stylesheet der Website und die Übersichtsseiten /blog und /magazin, wie onmathe.de sie ausliefert.',
    '_Protokoll.txt: Ablauf der Sicherung mit allen Hinweisen, zum Beispiel Bildern, die nicht geladen werden konnten.',
    '',
    'AUFBAU EINES BEITRAGSORDNERS',
    'Gesamtansicht.html: der ganze Beitrag in einer Datei zum Lesen. Herunterladen und im Browser öffnen.',
    'Live-Seite.html: die Seite, wie onmathe.de sie ausliefert, mit dem kompletten Seitencode.',
    'Webflow-Daten.json: alle Felder des Beitrags, seiner Posts, FAQs und Aufgaben im Originalformat der Webflow-API.',
    'Einleitung Text.html (Blog), Inhalt.html und Kurzfassung.html (Magazin): der Code der Rich-Text-Felder.',
    'Posts: je Post eine Datei mit dem Code aus Webflow, nummeriert nach dem Feld Position.',
    'FAQs und Aufgaben: je Eintrag eine Datei, nummeriert nach Name. Bei Aufgaben stehen Aufgabe und Lösung in einer Datei.',
    'Bilder: alle Bilder des Beitrags, benannt nach ihrem Fundort, zum Beispiel "Thumbnail - ..." oder "Post 03 - ...".',
    'Dateien und Code: andere Dateien aus Webflow und eigene Skripte, zum Beispiel ein Rechner aus GitHub.',
    'Jede Code-Datei beginnt mit einem Kommentar, der sagt, woher der Inhalt stammt.',
    '',
    'WIEDERHERSTELLEN',
    'Text und Code einer HTML-Datei lassen sich in Webflow ins passende Feld kopieren. Blöcke der Form',
    '<div data-rt-embed-type=\'true\'>...</div> sind Code-Embeds und gehören in ein Embed-Element im Rich-Text.',
    'Für eine Wiederherstellung über die Webflow-API stehen alle Felder unverändert in Webflow-Daten.json.'
  ];
  if (rest.length) {
    z.push('', 'NICHT IM BLOG VERWENDET', 'Diese Einträge gehören zu anderen Seiten und stehen nur in _Rohdaten:');
    rest.forEach(function (r) { z.push(r); });
  }
  return z.join('\n') + '\n';
}
