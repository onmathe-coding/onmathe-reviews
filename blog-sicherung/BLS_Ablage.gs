/**
 * OnMathe Blog-Sicherung: Ablage in Google Drive, Datei- und Ordnernamen, Protokoll.
 */

/** Ordner "OnMathe Sicherungen" in Meine Ablage, wird bei Bedarf angelegt. */
function BLS_elternordner_() {
  const root = DriveApp.getRootFolder();
  const it = root.getFoldersByName(BLS.ELTERNORDNER);
  return it.hasNext() ? it.next() : root.createFolder(BLS.ELTERNORDNER);
}

/** Code-Datei mit UTF-8-Kennung, damit Umlaute auch beim direkten Öffnen im Browser stimmen. */
function BLS_codeDatei_(ordner, name, inhalt) {
  return ordner.createFile(Utilities.newBlob('\uFEFF' + inhalt, 'text/html', name));
}

function BLS_htmlDatei_(ordner, name, inhalt) {
  return ordner.createFile(Utilities.newBlob(inhalt, 'text/html', name));
}

function BLS_jsonDatei_(ordner, name, obj) {
  return ordner.createFile(Utilities.newBlob(JSON.stringify(obj, null, 2), 'application/json', name));
}

/** Wie BLS_jsonDatei_, ersetzt aber eine gleichnamige Datei aus einem abgebrochenen Lauf. */
function BLS_jsonDateiNeu_(ordner, name, obj) {
  const alt = ordner.getFilesByName(name);
  while (alt.hasNext()) alt.next().setTrashed(true);
  return BLS_jsonDatei_(ordner, name, obj);
}

/** Name, der in Drive und beim Herunterladen unter Windows und macOS funktioniert. */
function BLS_name_(text, max) {
  let s = String(text === null || text === undefined ? '' : text)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s*:\s*/g, ' - ')
    .replace(/\?\s+(?=\S)/g, ' - ')
    .replace(/[?*"<>]+/g, '')
    .replace(/\s*[\\\/|]+\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
  if (max && s.length > max) {
    s = s.slice(0, max);
    const leer = s.lastIndexOf(' ');
    if (leer > max * 0.6) s = s.slice(0, leer);
  }
  s = s.replace(/[\s.\-]+$/, '').replace(/^[\s\-]+/, '');
  return s || 'ohne Namen';
}

/** Dateiname aus einer CDN-Adresse, ohne die vorangestellten Webflow-IDs. */
function BLS_dateinameAusUrl_(url, typ) {
  const pfad = String(url).split(/[?#]/)[0];
  let n = pfad.substring(pfad.lastIndexOf('/') + 1) || 'datei';
  try {
    n = decodeURIComponent(n);
  } catch (e) {
    // Name bleibt kodiert
  }
  n = n.replace(/^([0-9a-f]{24}_)+/i, '');
  n = BLS_name_(n, 100);
  if (!/\.[a-z0-9]{2,5}$/i.test(n)) {
    const endung = BLS_endung_(typ);
    if (endung) n += '.' + endung;
  }
  return n;
}

function BLS_endung_(typ) {
  const t = String(typ || '').toLowerCase();
  const map = {
    'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg',
    'image/avif': 'avif', 'application/pdf': 'pdf', 'text/css': 'css', 'application/javascript': 'js',
    'text/javascript': 'js', 'text/html': 'html', 'application/json': 'json', 'video/mp4': 'mp4'
  };
  return map[t] || '';
}

/** Hängt (2), (3) an, falls ein Name im selben Unterordner schon vergeben ist. */
function BLS_eindeutig_(namen, bereich, name) {
  const punkt = name.lastIndexOf('.');
  const stamm = punkt > 0 ? name.slice(0, punkt) : name;
  const endung = punkt > 0 ? name.slice(punkt) : '';
  let kandidat = name;
  let i = 2;
  while (namen[(bereich + '/' + kandidat).toLowerCase()]) {
    kandidat = stamm + ' (' + i + ')' + endung;
    i++;
  }
  namen[(bereich + '/' + kandidat).toLowerCase()] = true;
  return kandidat;
}

/** HTML-Kommentar als Kopf einer Code-Datei. */
function BLS_kommentar_(zeilen) {
  return '<!-- OnMathe Blog-Sicherung\n     ' + zeilen.map(function (z) {
    return String(z).replace(/--/g, '- -').replace(/\s*\n\s*/g, ' ');
  }).join('\n     ') + ' -->\n';
}

function BLS_esc_(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function BLS_datum_(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return Utilities.formatDate(d, BLS.TZ, 'dd.MM.yyyy, HH:mm') + ' Uhr';
}

function BLS_pad_(n) {
  return (n < 10 ? '0' : '') + n;
}

/** Relativer Link aus einer Gesamtansicht auf eine Datei im Beitragsordner. */
function BLS_relPfad_(datei) {
  return datei.split('/').map(encodeURIComponent).join('/');
}

function BLS_log_(ctx, text) {
  ctx.log.push(Utilities.formatDate(new Date(), BLS.TZ, 'dd.MM. HH:mm:ss') + '  ' + text);
  console.log(text);
}

function BLS_protokollSchreiben_(ctx) {
  if (!ctx.job || !ctx.job.log || !ctx.log.length) return;
  try {
    const f = DriveApp.getFileById(ctx.job.log);
    f.setContent(f.getBlob().getDataAsString('UTF-8') + ctx.log.join('\n') + '\n');
    ctx.log = [];
  } catch (e) {
    console.error('Protokoll nicht geschrieben: ' + e);
  }
}
