/**
 * OnMathe Blog-Sicherung: Beiträge zusammenstellen und je Beitrag einen Ordner füllen.
 *
 * Zuordnung wie auf der Website: Ein Beitrag hat im Feld Pagereference einen Eintrag aus References.
 * Posts, FAQs und Aufgaben mit derselben Pagereference gehören zu ihm.
 */

/** Lädt die gesicherten Rohdaten aus _Rohdaten (einmal pro Lauf). */
function BLS_daten_(ctx) {
  if (ctx.daten) return ctx.daten;
  const job = ctx.job;
  const d = { schema: {}, items: {}, byId: {}, beitraegeNachRef: {} };
  Object.keys(job.raw).forEach(function (cid) {
    const r = job.raw[cid];
    d.schema[cid] = JSON.parse(DriveApp.getFileById(r.s).getBlob().getDataAsString('UTF-8'));
    const inhalt = JSON.parse(DriveApp.getFileById(r.i).getBlob().getDataAsString('UTF-8'));
    d.items[cid] = inhalt.items || [];
    const m = {};
    d.items[cid].forEach(function (it) { m[it.id] = it; });
    d.byId[cid] = m;
  });
  [[BLS.SAMMLUNG.BLOG, '/blog/'], [BLS.SAMMLUNG.MAGAZIN, '/magazin/']].forEach(function (b) {
    (d.items[b[0]] || []).forEach(function (it) {
      const ref = it.fieldData && it.fieldData.pagereference;
      if (!ref) return;
      (d.beitraegeNachRef[ref] = d.beitraegeNachRef[ref] || []).push((it.fieldData.name || it.fieldData.slug) + ' (' + b[1] + it.fieldData.slug + ')');
    });
  });
  ctx.daten = d;
  return d;
}

/**
 * Feste Reihenfolge aller Beiträge. Blog nach Thema wie auf /blog (Reihenfolge der Optionen im Feld Thema),
 * innerhalb des Themas nach "Reihenfolge im Thema". Magazin nach Erstelldatum.
 */
function BLS_plan_(d) {
  const S = BLS.SAMMLUNG;
  const plan = [];
  const feld = BLS_feld_(d.schema[S.BLOG], 'thema');
  const optionen = (feld && feld.validations && feld.validations.options) || [];
  const gruppen = {};
  (d.items[S.BLOG] || []).forEach(function (it) {
    let t = (it.fieldData && it.fieldData.thema) || '';
    if (t && !optionen.some(function (o) { return o.id === t; })) t = '';
    (gruppen[t] = gruppen[t] || []).push(it);
  });
  const themen = optionen.map(function (o, i) {
    return { id: o.id, name: o.name, ordner: BLS_pad_(i + 1) + ' ' + BLS_name_(o.name, 60) };
  });
  themen.push({ id: '', name: '', ordner: 'Ohne Thema' });
  themen.forEach(function (t) {
    const liste = (gruppen[t.id] || []).slice().sort(function (a, b) {
      return BLS_zahlVergleich_(a.fieldData['reihenfolge-im-thema'], b.fieldData['reihenfolge-im-thema']) ||
        BLS_textVergleich_(a.fieldData.name, b.fieldData.name);
    });
    liste.forEach(function (it, k) {
      plan.push(BLS_planEintrag_('Blog', S.BLOG, it, '/blog/', t.name, t.ordner, k + 1));
    });
  });
  (d.items[S.MAGAZIN] || []).slice().sort(function (a, b) {
    return String(a.createdOn || '').localeCompare(String(b.createdOn || ''));
  }).forEach(function (it, k) {
    plan.push(BLS_planEintrag_('Magazin', S.MAGAZIN, it, '/magazin/', '', '', k + 1));
  });
  return plan;
}

function BLS_planEintrag_(bereich, col, it, basis, thema, themaOrdner, nr) {
  const fd = it.fieldData || {};
  let zusatz = '';
  if (it.isArchived) zusatz = ' (archiviert)';
  else if (it.isDraft) zusatz = ' (Entwurf)';
  return {
    bereich: bereich,
    col: col,
    id: it.id,
    thema: thema,
    themaOrdner: themaOrdner,
    nr: nr,
    titel: fd.name || fd.slug || it.id,
    pfad: basis + (fd.slug || ''),
    ordner: BLS_pad_(nr) + ' ' + BLS_name_(fd.name || fd.slug || it.id, 90) + zusatz
  };
}

function BLS_beitragsEltern_(ctx, e) {
  const job = ctx.job;
  if (e.bereich === 'Magazin') return DriveApp.getFolderById(job.f.mag);
  if (!job.thema[e.themaOrdner]) {
    job.thema[e.themaOrdner] = DriveApp.getFolderById(job.f.blog).createFolder(e.themaOrdner).getId();
    BLS_jobSpeichern_(job);
  }
  return DriveApp.getFolderById(job.thema[e.themaOrdner]);
}

/** Füllt den Ordner eines Beitrags. Liefert die Kennzahlen für die Übersicht. */
function BLS_beitragSichern_(ctx, d, e, ordner) {
  const S = BLS.SAMMLUNG;
  const it = d.byId[e.col][e.id];
  const schema = d.schema[e.col];
  const fd = it.fieldData || {};
  const url = BLS.DOMAIN + e.pfad;
  const kopf = 'Beitrag: ' + e.titel + ' (' + e.pfad + ')';
  const hinweise = [];
  const dateien = BLS_dateiSammler_();
  const teile = BLS_teile_(d, fd.pagereference);

  // Bild- und Dateifelder des Beitrags
  schema.fields.forEach(function (f) {
    if (['Image', 'MultiImage', 'File'].indexOf(f.type) < 0) return;
    const v = fd[f.slug];
    (Array.isArray(v) ? v : (v ? [v] : [])).forEach(function (x) {
      if (x && x.url) dateien.add(x.url, f.displayName, f.type === 'File' ? 'datei' : 'bild');
    });
  });

  // Rich-Text-Felder des Beitrags, je Feld eine Datei mit dem Code aus Webflow
  schema.fields.forEach(function (f) {
    if (f.type !== 'RichText' || !fd[f.slug]) return;
    BLS_codeDatei_(ordner, BLS_name_(f.displayName, 60) + '.html',
      BLS_kommentar_([kopf, 'Feld: ' + f.displayName + ' (' + f.slug + ')']) + fd[f.slug]);
    dateien.ausHtml(fd[f.slug], f.displayName);
    BLS_grenze_(ctx);
  });

  // Posts, FAQs und Aufgaben, je Eintrag eine Datei
  [
    { key: 'posts', ordner: 'Posts', col: S.POSTS, titelFeld: 'post-headline', label: 'Post' },
    { key: 'faqs', ordner: 'FAQs', col: S.FAQS, titelFeld: 'seo-text-heading', label: 'FAQ' },
    { key: 'aufgaben', ordner: 'Aufgaben', col: S.AUFGABEN, titelFeld: 'aufgabe-uberschrift-2', label: 'Aufgabe' }
  ].forEach(function (g) {
    const liste = teile[g.key];
    if (!liste.length) return;
    const uo = ordner.createFolder(g.ordner);
    const rtFelder = d.schema[g.col].fields.filter(function (f) { return f.type === 'RichText'; });
    liste.forEach(function (x, k) {
      const n = BLS_pad_(k + 1);
      const xf = x.fieldData || {};
      const titel = xf[g.titelFeld] || xf.name || x.id;
      let inhalt = BLS_kommentar_([
        kopf,
        g.label + ' ' + n + ' von ' + liste.length + ': ' + titel,
        'Name: ' + (xf.name || '') + ' | Slug: ' + (xf.slug || '') + (typeof xf.position === 'number' ? ' | Position: ' + xf.position : '') +
          ' | Webflow-ID: ' + x.id + ' | Status: ' + BLS_statusText_(x)
      ]);
      rtFelder.forEach(function (f) {
        const html = xf[f.slug] || '';
        if (rtFelder.length > 1) inhalt += '<!-- Feld: ' + f.displayName + ' (' + f.slug + ') -->\n' + html + '\n';
        else inhalt += html;
        dateien.ausHtml(html, g.label + ' ' + n);
      });
      BLS_codeDatei_(uo, n + ' ' + BLS_name_(titel, 80) + '.html', inhalt);
      BLS_grenze_(ctx);
    });
  });

  // Bilder, Dateien und externer Code
  const liste = dateien.liste();
  const namen = {};
  const unter = {};
  liste.forEach(function (x) {
    BLS_grenze_(ctx);
    const r = BLS_holen_(x.url, true);
    if (!r.ok) {
      hinweise.push('Datei nicht geladen: ' + x.url + ' (' + r.info + ')');
      return;
    }
    const zielName = x.art === 'code' ? 'Code' : (x.art === 'datei' || !BLS_istBild_(x.url, r.typ) ? 'Dateien' : 'Bilder');
    unter[zielName] = unter[zielName] || ordner.createFolder(zielName);
    const name = BLS_eindeutig_(namen, zielName, BLS_name_(x.fundort, 40) + ' - ' + BLS_dateinameAusUrl_(x.url, r.typ));
    unter[zielName].createFile(r.blob.setName(name));
    x.datei = zielName + '/' + name;
  });

  // Live-Seite, so wie onmathe.de sie ausliefert
  let live = 'nicht live';
  if (BLS_istLive_(it)) {
    BLS_grenze_(ctx);
    const r = BLS_holen_(url, false);
    if (r.ok) {
      BLS_htmlDatei_(ordner, 'Live-Seite.html', r.text);
      live = 'gesichert';
    } else {
      live = 'fehlt (' + r.info + ')';
      hinweise.push('Live-Seite nicht geladen: ' + url + ' (' + r.info + ')');
    }
  }

  const aufgeloest = BLS_aufloesen_(d, schema, fd);
  BLS_jsonDatei_(ordner, 'Webflow-Daten.json', {
    sicherung: { datum: new Date().toISOString(), quelle: 'Webflow CMS API v2, gespeicherter Stand inklusive Entwürfe', site: BLS.SITE_ID },
    bereich: e.bereich,
    url: url,
    sammlung: { id: e.col, name: schema.displayName },
    beitrag: it,
    aufgeloest: aufgeloest,
    posts: teile.posts,
    faqs: teile.faqs,
    aufgaben: teile.aufgaben,
    dateien: liste.map(function (x) { return { url: x.url, fundort: x.fundort, datei: x.datei || null }; }),
    hinweise: hinweise
  });
  BLS_htmlDatei_(ordner, 'Gesamtansicht.html', BLS_gesamtansicht_(ctx.job, d, e, it, schema, teile, aufgeloest, liste));

  hinweise.forEach(function (h) { BLS_log_(ctx, '  Hinweis: ' + h); });
  return {
    f: ordner.getId(),
    p: teile.posts.length,
    q: teile.faqs.length,
    a: teile.aufgaben.length,
    b: liste.filter(function (x) { return x.datei; }).length,
    l: live,
    w: hinweise.length
  };
}

/** Posts, FAQs und Aufgaben eines Beitrags in der Reihenfolge der Website. */
function BLS_teile_(d, ref) {
  const S = BLS.SAMMLUNG;
  if (!ref) return { posts: [], faqs: [], aufgaben: [] };
  return {
    posts: (d.items[S.POSTS] || []).filter(function (x) { return x.fieldData.pagereference === ref; }).sort(BLS_postSortierung_),
    faqs: (d.items[S.FAQS] || []).filter(function (x) { return x.fieldData['reference-2'] === ref; }).sort(BLS_nameSortierung_),
    aufgaben: (d.items[S.AUFGABEN] || []).filter(function (x) { return x.fieldData.pagereference === ref; }).sort(BLS_nameSortierung_)
  };
}

/** Sammelt alle Dateien, die ein Beitrag nutzt: Bilder, Dateien im Webflow-CDN und eigene Skripte. */
function BLS_dateiSammler_() {
  const bekannt = {};
  const liste = [];
  function add(url, fundort, art) {
    if (!url) return;
    url = String(url).trim().replace(/&amp;/g, '&');
    if (url.indexOf('//') === 0) url = 'https:' + url;
    if (!/^https?:\/\//i.test(url) || bekannt[url]) return;
    bekannt[url] = { url: url, fundort: fundort, art: art };
    liste.push(bekannt[url]);
  }
  function alle(re, html, fn) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(html))) fn(m[2]);
  }
  function ausHtml(html, fundort) {
    if (!html) return;
    alle(/<script\b[^>]*?\ssrc\s*=\s*(["'])(.*?)\1/gi, html, function (u) {
      if (BLS_istEigenerCode_(u) || BLS_istCdn_(u)) add(u, fundort, 'code');
    });
    alle(/<link\b[^>]*?\shref\s*=\s*(["'])(.*?)\1/gi, html, function (u) {
      if (BLS_istEigenerCode_(u) || BLS_istCdn_(u)) add(u, fundort, 'code');
    });
    alle(/<img\b[^>]*?\ssrc\s*=\s*(["'])(.*?)\1/gi, html, function (u) { add(u, fundort, 'bild'); });
    alle(/\s(?:href|src|data-src|poster)\s*=\s*(["'])(.*?)\1/gi, html, function (u) {
      if (BLS_istCdn_(u)) add(u, fundort, 'bild');
    });
    alle(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, html, function (u) {
      if (BLS_istCdn_(u)) add(u, fundort, 'bild');
    });
  }
  return { add: add, ausHtml: ausHtml, liste: function () { return liste; } };
}

/** Optionen und Referenzen in lesbare Namen übersetzen. */
function BLS_aufloesen_(d, schema, fd) {
  const out = {};
  schema.fields.forEach(function (f) {
    const v = fd[f.slug];
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return;
    if (f.type === 'Option') {
      const o = ((f.validations || {}).options || []).filter(function (x) { return x.id === v; })[0];
      out[f.displayName] = o ? o.name : v;
    } else if (f.type === 'Reference' || f.type === 'MultiReference') {
      const cid = (f.validations || {}).collectionId;
      const ids = Array.isArray(v) ? v : [v];
      const namen = ids.map(function (id) {
        const x = cid && d.byId[cid] ? d.byId[cid][id] : null;
        return x ? (x.fieldData.name || x.fieldData.slug || id) : id + ' (nicht gefunden)';
      });
      out[f.displayName] = Array.isArray(v) ? namen : namen[0];
      if (f.type === 'MultiReference') {
        const beitraege = [];
        ids.forEach(function (id) { (d.beitraegeNachRef[id] || []).forEach(function (b) { beitraege.push(b); }); });
        if (beitraege.length) out[f.displayName + ', verknüpfte Beiträge'] = beitraege;
      }
    }
  });
  return out;
}

function BLS_statusText_(it) {
  if (it.isArchived) return 'archiviert';
  if (it.isDraft) return 'Entwurf';
  if (!it.lastPublished) return 'noch nie veröffentlicht';
  if (it.lastUpdated && new Date(it.lastUpdated).getTime() > new Date(it.lastPublished).getTime() + 1000) {
    return 'veröffentlicht, mit unveröffentlichten Änderungen';
  }
  return 'veröffentlicht';
}

function BLS_istLive_(it) {
  return !it.isDraft && !it.isArchived && !!it.lastPublished;
}

function BLS_istBild_(url, typ) {
  if (typ && typ.indexOf('image/') === 0) return true;
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|tiff?)(\?|#|$)/i.test(url);
}

function BLS_feld_(schema, slug) {
  return ((schema && schema.fields) || []).filter(function (f) { return f.slug === slug; })[0] || null;
}

function BLS_postSortierung_(a, b) {
  return BLS_zahlVergleich_(a.fieldData.position, b.fieldData.position) || BLS_textVergleich_(a.fieldData.name, b.fieldData.name);
}

function BLS_nameSortierung_(a, b) {
  return BLS_textVergleich_(a.fieldData.name, b.fieldData.name);
}

function BLS_zahlVergleich_(a, b) {
  const x = typeof a === 'number' ? a : Infinity;
  const y = typeof b === 'number' ? b : Infinity;
  return x === y ? 0 : (x < y ? -1 : 1);
}

function BLS_textVergleich_(a, b) {
  a = String(a === null || a === undefined ? '' : a);
  b = String(b === null || b === undefined ? '' : b);
  try {
    return a.localeCompare(b, 'de', { numeric: true, sensitivity: 'base' });
  } catch (e) {
    return a < b ? -1 : (a > b ? 1 : 0);
  }
}
