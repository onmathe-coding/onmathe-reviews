/**
 * OnMathe Blog-Sicherung: Zugriff auf die Webflow-API, die Live-Seiten und die Dateien im Webflow-CDN.
 */

function BLS_token_() {
  const t = PropertiesService.getScriptProperties().getProperty(BLS.P_TOKEN);
  return t ? String(t).trim() : '';
}

/** GET auf die Webflow-API v2 mit Wartezeit bei 429 und Wiederholung bei Serverfehlern. */
function BLS_api_(pfad) {
  const token = BLS_token_();
  if (!token) throw BLS_stopp_('Die Skripteigenschaft ' + BLS.P_TOKEN + ' fehlt.');
  for (let versuch = 1; versuch <= 6; versuch++) {
    let r;
    try {
      r = UrlFetchApp.fetch(BLS.API + pfad, {
        method: 'get',
        headers: { Authorization: 'Bearer ' + token, accept: 'application/json' },
        muteHttpExceptions: true
      });
    } catch (e) {
      if (versuch === 6) throw e;
      Utilities.sleep(2000 * versuch);
      continue;
    }
    const code = r.getResponseCode();
    if (code === 200) {
      Utilities.sleep(BLS.API_PAUSE_MS);
      return JSON.parse(r.getContentText('UTF-8'));
    }
    if (code === 401 || code === 403) {
      throw BLS_stopp_('Webflow lehnt den Token ab (HTTP ' + code + '). Er muss für die Website OnMathe erstellt sein und Leserecht für CMS haben.');
    }
    if (code === 404) {
      throw BLS_stopp_('Webflow kennt ' + pfad + ' nicht (HTTP 404).');
    }
    if (code === 429 || code >= 500) {
      const h = r.getHeaders() || {};
      const sek = parseInt(h['Retry-After'] || h['retry-after'] || '0', 10) || versuch * 5;
      Utilities.sleep(Math.min(Math.max(sek, 2), 60) * 1000);
      continue;
    }
    throw new Error('Webflow-API HTTP ' + code + ' für ' + pfad + ': ' + r.getContentText().slice(0, 300));
  }
  throw new Error('Webflow-API antwortet nicht für ' + pfad);
}

/** Alle gespeicherten Einträge einer Sammlung, inklusive Entwürfe und archivierte. */
function BLS_alleItems_(collectionId) {
  const alle = [];
  let offset = 0;
  let total = 0;
  do {
    const r = BLS_api_('/collections/' + collectionId + '/items?offset=' + offset + '&limit=100');
    const items = r.items || [];
    items.forEach(function (x) { alle.push(x); });
    total = r.pagination && typeof r.pagination.total === 'number' ? r.pagination.total : alle.length;
    offset += 100;
    if (!items.length) break;
  } while (offset < total);
  return alle;
}

/** Lädt eine Seite (Text) oder Datei (Blob). Liefert { ok, text | blob, typ } oder { ok: false, info }. */
function BLS_holen_(url, binaer) {
  let info = '';
  let sicher = url;
  try {
    sicher = encodeURI(decodeURI(url)); // Leerzeichen und Umlaute in Adressen lehnt UrlFetchApp sonst ab
  } catch (e) {
    sicher = encodeURI(url);
  }
  for (let v = 1; v <= 3; v++) {
    try {
      const r = UrlFetchApp.fetch(sicher, { muteHttpExceptions: true, followRedirects: true });
      const code = r.getResponseCode();
      if (code === 200) {
        const h = r.getHeaders() || {};
        const typ = String(h['Content-Type'] || h['content-type'] || '').split(';')[0].trim().toLowerCase();
        return binaer ? { ok: true, blob: r.getBlob(), typ: typ } : { ok: true, text: r.getContentText('UTF-8'), typ: typ };
      }
      info = 'HTTP ' + code;
      if (code === 403 || code === 404 || code === 410) break;
    } catch (e) {
      info = String(e && e.message ? e.message : e).slice(0, 150);
    }
    Utilities.sleep(1500 * v);
  }
  return { ok: false, info: info };
}

/** Dateien im Webflow-CDN (Bilder, PDFs, Stylesheets). */
function BLS_istCdn_(url) {
  return /^https?:\/\/(cdn\.prod\.website-files\.com|assets(-global)?\.website-files\.com|uploads-ssl\.webflow\.com|global-uploads\.webflow\.com|daks2k3a4ib2z\.cloudfront\.net)\//i.test(url);
}

/** Eigener Code außerhalb von Webflow, zum Beispiel Rechner aus dem GitHub-Repo onmathe-coding. */
function BLS_istEigenerCode_(url) {
  return /^https?:\/\/(onmathe-coding\.github\.io\/|raw\.githubusercontent\.com\/onmathe-coding\/|cdn\.jsdelivr\.net\/gh\/onmathe-coding\/)/i.test(url);
}

/** Stylesheets aus dem Webflow-CDN, die eine Seite einbindet. */
function BLS_cssLinks_(html) {
  const out = [];
  const re = /<link\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']?stylesheet/i.test(tag)) continue;
    const h = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (!h) continue;
    const url = h[1].replace(/&amp;/g, '&');
    if (BLS_istCdn_(url) && out.indexOf(url) < 0) out.push(url);
  }
  return out;
}
