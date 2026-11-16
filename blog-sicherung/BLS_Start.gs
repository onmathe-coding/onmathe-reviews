/**
 * OnMathe Blog-Sicherung, Stand 16.11.2026
 *
 * Sichert alle Beiträge aus /blog und /magazin in Google Drive: je Beitrag ein Ordner mit Posts, FAQs,
 * Aufgaben, Bildern, dem Code aller Rich-Text-Felder, den Webflow-Daten und der Live-Seite.
 * Dazu die kompletten CMS-Rohdaten aller Sammlungen, das Stylesheet der Website und eine Übersichtstabelle.
 *
 * Einrichtung, einmalig:
 *   Projekteinstellungen > Skripteigenschaften > Eigenschaft BLS_WEBFLOW_TOKEN, Wert: Webflow-Site-Token
 *   (Webflow: Site settings > Apps & integrations > API access, Leserecht für CMS genügt).
 *
 * Bedienung im Editor:
 *   BLS_sicherungStarten  legt eine neue Sicherung an. Sie läuft in Etappen von gut 4 Minuten und setzt
 *                         sich selbst fort. Fertig ist sie, sobald im Sicherungsordner die Tabelle "Übersicht" liegt.
 *   BLS_status            zeigt, wie weit die Sicherung ist.
 *   BLS_weiter            setzt eine angehaltene Sicherung fort, zum Beispiel nach einem Token-Fehler.
 *   BLS_abbrechen         beendet eine laufende Sicherung.
 */

const BLS = {
  SITE_ID: '65f5a102f6a2ab9750c03dfb',
  DOMAIN: 'https://www.onmathe.de',
  API: 'https://api.webflow.com/v2',
  SAMMLUNG: {
    BLOG: '677e30f065483fe5cf6d45ef',
    MAGAZIN: '682c3143d54614a46d64587f',
    POSTS: '678625b491dde4146cb6ab13',
    FAQS: '6776eb03184334b5bfa87583',
    AUFGABEN: '6783f2823d06b1859409fcbc'
  },
  ELTERNORDNER: 'OnMathe Sicherungen',
  TZ: 'Europe/Berlin',
  BUDGET_MS: 250000,   // neue Beiträge nur bis gut 4 Minuten Laufzeit beginnen
  GRENZE_MS: 300000,   // nach 5 Minuten bricht ein Beitrag ab und wird im nächsten Lauf neu angelegt
  API_PAUSE_MS: 1100,  // Webflow erlaubt 60 Anfragen pro Minute
  MAX_FEHLER: 3,
  P_TOKEN: 'BLS_WEBFLOW_TOKEN',
  P_JOB: 'BLS_JOB',
  P_LETZTE: 'BLS_LETZTE_SICHERUNG',
  P_ERG: 'BLS_E_'
};

const BLS_PHASEN = {
  rohdaten: 'Webflow-Daten laden',
  website: 'Website-Code sichern',
  beitraege: 'Beiträge sichern',
  abschluss: 'Übersicht anlegen'
};

function BLS_sicherungStarten() {
  if (!BLS_token_()) {
    throw new Error('Die Skripteigenschaft ' + BLS.P_TOKEN + ' fehlt. Leg sie unter Projekteinstellungen > Skripteigenschaften an und trag dort den Webflow-Token ein.');
  }
  const alt = BLS_jobLaden_();
  if (alt) {
    throw new Error('Es läuft schon eine Sicherung (' + alt.name + '). Stand mit BLS_status prüfen, fortsetzen mit BLS_weiter, beenden mit BLS_abbrechen.');
  }
  BLS_triggerLoeschen_();
  BLS_ergebnisseLoeschen_();
  BLS_api_('/collections/' + BLS.SAMMLUNG.BLOG); // prüft den Token, bevor Ordner entstehen

  const jetzt = new Date();
  const name = 'OnMathe Blog-Sicherung ' + Utilities.formatDate(jetzt, BLS.TZ, 'yyyy-MM-dd, HH.mm') + ' Uhr';
  const root = BLS_elternordner_().createFolder(name);
  const job = {
    name: name,
    start: jetzt.toISOString(),
    root: root.getId(),
    phase: 'rohdaten',
    f: {
      raw: root.createFolder('_Rohdaten').getId(),
      code: root.createFolder('_Website-Code').getId(),
      blog: root.createFolder('Blog').getId(),
      mag: root.createFolder('Magazin').getId()
    },
    log: root.createFile('_Protokoll.txt', name + '\n\n', MimeType.PLAIN_TEXT).getId(),
    cols: null,
    col: 0,
    raw: {},
    css: null,
    thema: {},
    art: 0,
    gesamt: 0,
    cur: null,
    fehler: 0,
    stopp: null
  };
  BLS_jobSpeichern_(job);
  console.log('Sicherung angelegt: ' + root.getUrl());
  BLS_arbeiten_();
}

function BLS_weiter() {
  const job = BLS_jobLaden_();
  if (job && job.stopp) {
    job.stopp = null;
    job.fehler = 0;
    BLS_jobSpeichern_(job);
  }
  BLS_arbeiten_();
}

function BLS_status() {
  const job = BLS_jobLaden_();
  if (!job) {
    const letzte = PropertiesService.getScriptProperties().getProperty(BLS.P_LETZTE);
    if (letzte) {
      const l = JSON.parse(letzte);
      console.log('Keine Sicherung aktiv. Letzte Sicherung: ' + l.name + ', ' + l.beitraege + ' Beiträge, fertig am ' + BLS_datum_(l.ende) + '\n' + l.url);
    } else {
      console.log('Keine Sicherung aktiv und noch keine abgeschlossen.');
    }
    return;
  }
  const geplant = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'BLS_weiter'; });
  const zeilen = [
    job.name,
    'Schritt: ' + (BLS_PHASEN[job.phase] || job.phase) +
      (job.phase === 'beitraege' && job.gesamt ? ', ' + job.art + ' von ' + job.gesamt + ' Beiträgen fertig' : ''),
    'Ordner: https://drive.google.com/drive/folders/' + job.root
  ];
  if (job.stopp) {
    zeilen.push('Angehalten: ' + job.stopp, 'Nach dem Beheben BLS_weiter ausführen.');
  } else {
    zeilen.push(geplant ? 'Der nächste Lauf startet automatisch in etwa einer Minute.' : 'Kein Lauf geplant. Mit BLS_weiter fortsetzen.');
  }
  console.log(zeilen.join('\n'));
}

function BLS_abbrechen() {
  BLS_triggerLoeschen_();
  const job = BLS_jobLaden_();
  if (!job) {
    console.log('Es läuft keine Sicherung.');
    return;
  }
  try {
    const ordner = DriveApp.getFolderById(job.root);
    ordner.setName(ordner.getName() + ' (abgebrochen)');
  } catch (e) {
    // Ordner wurde schon gelöscht
  }
  BLS_jobLoeschen_();
  BLS_ergebnisseLoeschen_();
  console.log('Sicherung abgebrochen. Der angefangene Ordner bleibt mit dem Zusatz (abgebrochen) erhalten.');
}

/* ---------- Ablauf ---------- */

function BLS_arbeiten_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log('Ein anderer Lauf ist noch aktiv.');
    return;
  }
  const ctx = { t0: Date.now(), log: [], daten: null, job: null };
  let gestoppt = null;
  try {
    BLS_triggerLoeschen_();
    ctx.job = BLS_jobLaden_();
    if (!ctx.job) {
      console.log('Keine offene Sicherung.');
      return;
    }
    if (ctx.job.stopp) {
      console.log('Die Sicherung ist angehalten: ' + ctx.job.stopp + '\nFortsetzen mit BLS_weiter.');
      ctx.job = null;
      return;
    }
    // Sicherheitsnetz: Bricht Google diesen Lauf nach 6 Minuten hart ab, macht dieser Trigger trotzdem weiter.
    ScriptApp.newTrigger('BLS_weiter').timeBased().after(8 * 60 * 1000).create();
    const job = ctx.job;
    while (job.phase !== 'fertig' && !BLS_zeitUm_(ctx)) {
      if (job.phase === 'rohdaten') BLS_phaseRohdaten_(ctx);
      else if (job.phase === 'website') BLS_phaseWebsite_(ctx);
      else if (job.phase === 'beitraege') BLS_phaseBeitraege_(ctx);
      else if (job.phase === 'abschluss') BLS_phaseAbschluss_(ctx);
      else throw BLS_stopp_('Unbekannter Schritt ' + job.phase);
      BLS_jobSpeichern_(job);
    }
    job.fehler = 0;
  } catch (e) {
    if (e && e.blsZeit) {
      BLS_log_(ctx, 'Zeitgrenze erreicht. Der angefangene Beitrag wird im nächsten Lauf neu angelegt.');
    } else {
      console.error(e && e.stack ? e.stack : e);
      const text = e && e.message ? e.message : String(e);
      if (ctx.job) {
        ctx.job.fehler = (ctx.job.fehler || 0) + 1;
        BLS_log_(ctx, 'Fehler: ' + text);
        if ((e && e.blsStopp) || ctx.job.fehler >= BLS.MAX_FEHLER) {
          ctx.job.stopp = text;
          gestoppt = e;
          BLS_log_(ctx, 'Sicherung angehalten. Nach dem Beheben BLS_weiter ausführen, beenden mit BLS_abbrechen.');
        } else {
          BLS_log_(ctx, 'Neuer Versuch im nächsten Lauf.');
        }
      } else {
        gestoppt = e;
      }
    }
  } finally {
    const job = ctx.job;
    if (job) {
      if (job.phase === 'fertig') {
        BLS_triggerLoeschen_();
        BLS_protokollSchreiben_(ctx);
        BLS_jobLoeschen_();
      } else if (job.stopp) {
        BLS_triggerLoeschen_();
        BLS_protokollSchreiben_(ctx);
        BLS_jobSpeichern_(job);
      } else {
        BLS_triggerSetzen_();
        BLS_log_(ctx, 'Pause, weiter in etwa einer Minute: ' + (BLS_PHASEN[job.phase] || job.phase) +
          (job.phase === 'beitraege' && job.gesamt ? ', ' + job.art + ' von ' + job.gesamt + ' Beiträgen fertig' : ''));
        BLS_protokollSchreiben_(ctx);
        BLS_jobSpeichern_(job);
      }
    }
    lock.releaseLock();
  }
  if (gestoppt) throw gestoppt;
}

function BLS_phaseRohdaten_(ctx) {
  const job = ctx.job;
  const ordner = DriveApp.getFolderById(job.f.raw);
  if (!job.cols) {
    const antwort = BLS_api_('/sites/' + BLS.SITE_ID + '/collections');
    BLS_jsonDateiNeu_(ordner, '_Sammlungen.json', antwort);
    job.cols = (antwort.collections || []).map(function (c) { return { id: c.id, n: c.displayName }; });
    BLS_jobSpeichern_(job);
  }
  while (job.col < job.cols.length) {
    if (BLS_zeitUm_(ctx)) return;
    const c = job.cols[job.col];
    const schema = BLS_api_('/collections/' + c.id);
    const items = BLS_alleItems_(c.id);
    const basis = BLS_name_(c.n, 80);
    const fs = BLS_jsonDateiNeu_(ordner, basis + ' (Felder).json', schema);
    const fi = BLS_jsonDateiNeu_(ordner, basis + ' (Einträge).json', {
      sammlung: { id: c.id, name: c.n },
      abgerufen: new Date().toISOString(),
      anzahl: items.length,
      items: items
    });
    job.raw[c.id] = { s: fs.getId(), i: fi.getId(), n: items.length };
    job.col++;
    BLS_jobSpeichern_(job);
    BLS_log_(ctx, 'Rohdaten: ' + c.n + ', ' + items.length + ' Einträge');
  }
  Object.keys(BLS.SAMMLUNG).forEach(function (k) {
    if (!job.raw[BLS.SAMMLUNG[k]]) {
      throw BLS_stopp_('Die Sammlung ' + k + ' (' + BLS.SAMMLUNG[k] + ') fehlt in den Webflow-Daten.');
    }
  });
  job.phase = 'website';
}

function BLS_phaseWebsite_(ctx) {
  const job = ctx.job;
  const ordner = DriveApp.getFolderById(job.f.code);
  const css = [];
  [['/blog', 'Blog-Übersicht (live).html'], ['/magazin', 'Magazin-Übersicht (live).html']].forEach(function (s) {
    const r = BLS_holen_(BLS.DOMAIN + s[0], false);
    if (!r.ok) {
      BLS_log_(ctx, 'Hinweis: ' + s[0] + ' nicht abrufbar (' + r.info + ')');
      return;
    }
    BLS_htmlDatei_(ordner, s[1], r.text);
    BLS_cssLinks_(r.text).forEach(function (u) { if (css.indexOf(u) < 0) css.push(u); });
  });
  let gesichert = 0;
  css.forEach(function (u) {
    const r = BLS_holen_(u, true);
    if (r.ok) {
      ordner.createFile(r.blob.setName(BLS_dateinameAusUrl_(u, r.typ || 'text/css')));
      gesichert++;
    } else {
      BLS_log_(ctx, 'Hinweis: Stylesheet nicht geladen: ' + u + ' (' + r.info + ')');
    }
  });
  job.css = css[0] || null;
  BLS_log_(ctx, 'Website-Code: Übersichtsseiten und ' + gesichert + ' Stylesheet' + (gesichert === 1 ? '' : 's'));
  job.phase = 'beitraege';
}

function BLS_phaseBeitraege_(ctx) {
  const job = ctx.job;
  const d = BLS_daten_(ctx);
  const plan = BLS_plan_(d);
  job.gesamt = plan.length;
  const props = PropertiesService.getScriptProperties();
  while (job.art < plan.length) {
    if (BLS_zeitUm_(ctx)) return;
    const e = plan[job.art];
    if (job.cur && job.cur.i === job.art) {
      try {
        DriveApp.getFolderById(job.cur.f).setTrashed(true);
        BLS_log_(ctx, 'Unvollständigen Ordner verworfen: ' + e.titel);
      } catch (x) {
        // schon weg
      }
    }
    const eltern = BLS_beitragsEltern_(ctx, e);
    const ordner = eltern.createFolder(e.ordner);
    job.cur = { i: job.art, f: ordner.getId() };
    BLS_jobSpeichern_(job);

    const erg = BLS_beitragSichern_(ctx, d, e, ordner);
    props.setProperty(BLS.P_ERG + job.art, JSON.stringify(erg));
    job.cur = null;
    job.art++;
    BLS_jobSpeichern_(job);
    BLS_log_(ctx, e.bereich + ' ' + job.art + '/' + plan.length + ': ' + e.titel + ' (' + erg.p + ' Posts, ' + erg.q + ' FAQs, ' +
      erg.a + ' Aufgaben, ' + erg.b + ' Dateien' + (erg.w ? ', ' + erg.w + ' Hinweis' + (erg.w === 1 ? '' : 'e') : '') + ')');
  }
  job.phase = 'abschluss';
}

function BLS_phaseAbschluss_(ctx) {
  const job = ctx.job;
  const d = BLS_daten_(ctx);
  const plan = BLS_plan_(d);
  const root = DriveApp.getFolderById(job.root);
  const summe = BLS_uebersichtAnlegen_(job, d, plan, root);
  const rest = BLS_nichtZugeordnet_(d, plan);
  root.createFile('LIESMICH.txt', BLS_liesmich_(job, d, plan, summe, rest), MimeType.PLAIN_TEXT);
  if (rest.length) BLS_log_(ctx, 'Nicht im Blog oder Magazin verwendet (nur in _Rohdaten): ' + rest.join('; '));
  PropertiesService.getScriptProperties().setProperty(BLS.P_LETZTE, JSON.stringify({
    name: job.name, url: root.getUrl(), ende: new Date().toISOString(), beitraege: plan.length
  }));
  BLS_ergebnisseLoeschen_();
  job.phase = 'fertig';
  BLS_log_(ctx, 'Fertig: ' + plan.length + ' Beiträge, ' + summe.p + ' Posts, ' + summe.q + ' FAQs, ' + summe.a + ' Aufgaben, ' +
    summe.b + ' Bilder und Dateien' + (summe.w ? ', ' + summe.w + ' Hinweise' : '') + '. ' + root.getUrl());
}

/* ---------- Zeit, Job, Trigger ---------- */

function BLS_zeitUm_(ctx) {
  return Date.now() - ctx.t0 > BLS.BUDGET_MS;
}

function BLS_grenze_(ctx) {
  if (Date.now() - ctx.t0 > BLS.GRENZE_MS) {
    const e = new Error('Zeitgrenze');
    e.blsZeit = true;
    throw e;
  }
}

function BLS_stopp_(text) {
  const e = new Error(text);
  e.blsStopp = true;
  return e;
}

function BLS_jobLaden_() {
  const s = PropertiesService.getScriptProperties().getProperty(BLS.P_JOB);
  return s ? JSON.parse(s) : null;
}

function BLS_jobSpeichern_(job) {
  PropertiesService.getScriptProperties().setProperty(BLS.P_JOB, JSON.stringify(job));
}

function BLS_jobLoeschen_() {
  PropertiesService.getScriptProperties().deleteProperty(BLS.P_JOB);
}

function BLS_ergebnisseLoeschen_() {
  const props = PropertiesService.getScriptProperties();
  Object.keys(props.getProperties()).forEach(function (k) {
    if (k.indexOf(BLS.P_ERG) === 0) props.deleteProperty(k);
  });
}

function BLS_triggerLoeschen_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'BLS_weiter') ScriptApp.deleteTrigger(t);
  });
}

function BLS_triggerSetzen_() {
  BLS_triggerLoeschen_();
  ScriptApp.newTrigger('BLS_weiter').timeBased().after(60 * 1000).create();
}
