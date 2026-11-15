/* OnMathe Notenrechner, Teil 1: Grundfunktionen, Tabs, Fachnote, Zielnote, Punkte (Stand 15.11.2026) */
(function () {
  var root = document.getElementById('mnr');
  if (!root || window.MNR) return;
  function $(id) { return document.getElementById(id); }
  function fmt(x, d) { d = d === undefined ? 2 : d; return x.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function mean(a) { if (!a.length) return null; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function step() { var s = root.querySelector('.mnr-tsel'); return s ? parseFloat(s.value) : 0.3; }

  /* Noten lesen: 3, 2-, 3+, 2-3, 2,5 oder 2.5; getrennt durch Leerzeichen oder Semikolon */
  function parse(str, t) {
    var ok = [], bad = [];
    String(str || '').replace(/[\u2013\u2014]/g, '-').split(/[\s;]+/).forEach(function (tok) {
      tok = tok.replace(/[,.]+$/, '');
      if (!tok) return;
      var m;
      if (/^\d(,\d)+,\d$/.test(tok)) { tok.split(',').forEach(function (x) { var v = +x; if (v >= 1 && v <= 6) ok.push(v); else bad.push(x); }); return; }
      if ((m = tok.match(/^([1-5])-([2-6])$/)) && +m[2] === +m[1] + 1) { ok.push(+m[1] + 0.5); return; }
      if ((m = tok.match(/^([1-6])([+-])$/))) {
        var v = +m[1] + (m[2] === '+' ? -t : t);
        if (v <= 6) { ok.push(v); return; }
      }
      if (/^[1-6]([.,]\d{1,2})?$/.test(tok)) { var w = parseFloat(tok.replace(',', '.')); if (w >= 1 && w <= 6) { ok.push(w); return; } }
      bad.push(tok);
    });
    return { v: ok, bad: bad };
  }
  function chips(id, p) {
    var el = $(id); if (!el) return;
    var h = '';
    p.v.forEach(function (v) { h += '<span class="mnr-chip">' + fmt(v, v % 1 ? 2 : 0).replace(/,?0+$/, '') + '</span>'; });
    p.bad.forEach(function (b) { h += '<span class="mnr-chip bad">' + b.replace(/[<>&"]/g, '') + ' ?</span>'; });
    el.innerHTML = h;
  }
  /* Notenbezeichnung zu einem Wert, z. B. 2,3 -> 2- */
  function labels(t) {
    var L = [];
    for (var n = 1; n <= 6; n++) {
      L.push([n - t, n + '+']); L.push([n, '' + n]);
      if (n < 6) L.push([n + t, n + '-']);
    }
    return L;
  }
  function nameOf(v, t) {
    var L = labels(t);
    for (var i = 0; i < L.length; i++) if (Math.abs(L[i][0] - v) < 0.011) return L[i][1];
    if (Math.abs(v % 1 - 0.5) < 0.011) return Math.floor(v) + '-' + (Math.floor(v) + 1);
    return fmt(v);
  }
  /* schlechteste Bezeichnung, die noch reicht (Wert <= x) */
  function atLeast(x, t) {
    var L = labels(t), best = null;
    for (var i = 0; i < L.length; i++) if (L[i][0] <= x + 1e-9) best = L[i];
    return best;
  }
  function lean(x) {
    var n = Math.floor(x + 1e-9), f = x - n;
    if (x >= 6) return 'Das ergibt eine 6.';
    if (n < 1) return 'Das spricht für eine 1 auf dem Zeugnis.';
    if (f < 0.4) return 'Das spricht für eine ' + n + ' auf dem Zeugnis.';
    if (f <= 0.6) return 'Das liegt auf der Kippe zwischen ' + n + ' und ' + (n + 1) + '. Hier entscheidet deine Lehrkraft in ihrer Gesamtwertung.';
    return 'Das spricht für eine ' + (n + 1) + ' auf dem Zeugnis.';
  }

  /* Fachnote */
  function fach() {
    var t = step(), S = parse($('mnr-f-s').value, t), M = parse($('mnr-f-m').value, t), w = parseFloat($('mnr-f-w').value) / 100;
    chips('mnr-f-sc', S); chips('mnr-f-mc', M);
    var a = mean(S.v), b = mean(M.v), x, note = '';
    $('mnr-f-oa').textContent = a === null ? '-' : fmt(a);
    $('mnr-f-ob').textContent = b === null ? '-' : fmt(b);
    if (a === null && b === null) { $('mnr-f-o').textContent = '-'; $('mnr-f-v').textContent = 'Trag mindestens eine Note ein.'; return; }
    if (a !== null && b !== null) x = w * a + (1 - w) * b;
    else if (a !== null) { x = a; note = ' Ohne mündliche Noten gerechnet.'; }
    else { x = b; note = ' Nur mündliche Noten eingetragen.'; }
    $('mnr-f-o').textContent = fmt(x);
    $('mnr-f-v').textContent = lean(x) + note;
  }

  /* Zielnote: welche Note brauche ich im Schnitt in den restlichen Arbeiten? */
  function need(sum, n, k, M, w, T) {
    if (M === null) return (T * (n + k) - sum) / k;
    return ((T - (1 - w) * M) / w * (n + k) - sum) / k;
  }
  function ziel() {
    var t = step(), S = parse($('mnr-g-s').value, t), Mp = parse($('mnr-g-m').value, t);
    chips('mnr-g-sc', S);
    var M = mean(Mp.v), w = parseFloat($('mnr-g-w').value) / 100, k = +$('mnr-g-k').value, z = +$('mnr-g-z').value, T = z + 0.5 - 1e-6;
    var n = S.v.length, sum = 0; S.v.forEach(function (v) { sum += v; });
    var now = n ? (M === null ? sum / n : w * sum / n + (1 - w) * M) : M;
    $('mnr-g-now').textContent = now === null ? '-' : fmt(now);
    $('mnr-g-ok').textContent = k === 1 ? 'Nötig in der nächsten Arbeit' : 'Nötig im Schnitt der nächsten ' + k + ' Arbeiten';
    var x = need(sum, n, k, M, w, T), o = $('mnr-g-o'), ol = $('mnr-g-ol'), v = $('mnr-g-v');
    if (x >= 6) { o.textContent = 'jede Note'; ol.textContent = 'Selbst mit einer 6 bleibst du rechnerisch unter ' + z + ',5.'; }
    else if (x < 1 - t - 1e-9) {
      var reach = (M === null ? (sum + k * 1) / (n + k) : w * (sum + k * 1) / (n + k) + (1 - w) * M);
      o.textContent = 'nicht erreichbar'; ol.textContent = 'Selbst mit lauter Einsen kommst du rechnerisch auf ' + fmt(reach) + '.';
    } else {
      var shown = Math.floor(x * 10 + 1e-9) / 10, L = atLeast(shown, t);
      o.textContent = fmt(shown, 1); ol.textContent = L ? 'also mindestens eine ' + L[1] : '';
    }
    if (M !== null && M > 1.05 && x < 6) {
      var M2 = Math.max(1, M - 1), x2 = need(sum, n, k, M2, w, T), nm = nameOf(M2, t);
      if (x2 >= 6) v.textContent = 'Wird deine mündliche Note eine Stufe besser (' + nm + '), reicht rechnerisch jede Note.';
      else if (x2 < 1 - t) v.textContent = 'Auch mit einer mündlichen ' + nm + ' bleibt das Ziel rechnerisch außer Reichweite. Frag deine Lehrkraft, wie du noch punkten kannst.';
      else { var s2 = Math.floor(x2 * 10 + 1e-9) / 10, L2 = atLeast(s2, t); v.textContent = 'Wird deine mündliche Note eine Stufe besser (' + nm + '), reicht im Schnitt eine ' + fmt(s2, 1) + (L2 ? ', also mindestens eine ' + L2[1] : '') + '.'; }
    } else v.textContent = M === null ? 'Trag deine mündliche Note ein, dann siehst du, wie viel sie ausmacht.' : 'Mündlich stehst du schon sehr gut. Halte das bis zum Zeugnis.';
  }

  /* Punkte in Note */
  var IHK = [[92, 1], [81, 2], [67, 3], [50, 4], [30, 5], [0, 6]];
  var KMK = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 33, 27, 20, 0];
  var PN = ['1+', '1', '1-', '2+', '2', '2-', '3+', '3', '3-', '4+', '4', '4-', '5+', '5', '5-', '6'];
  function punkte() {
    var a = parseFloat($('mnr-p-a').value), b = parseFloat($('mnr-p-b').value), s = $('mnr-p-s').value;
    var o = $('mnr-p-o'), ol = $('mnr-p-ol'), pc = $('mnr-p-pc'), nx = $('mnr-p-nx');
    if (!(b > 0) || isNaN(a) || a < 0 || a > b) { o.textContent = '-'; ol.textContent = 'Erreichte Punkte dürfen nicht über den möglichen liegen.'; pc.textContent = '-'; nx.textContent = '-'; return; }
    var p = a / b * 100, i, gap = function (thr) { return Math.max(0, Math.ceil((thr * b / 100 - a) * 2 - 1e-9) / 2); };
    pc.textContent = fmt(p, 1).replace(',0', '') + ' %';
    if (s === 'ihk') {
      for (i = 0; i < IHK.length; i++) if (p >= IHK[i][0] - 1e-9) break;
      o.textContent = 'Note ' + IHK[i][1]; ol.textContent = 'nach IHK-Schlüssel';
      nx.textContent = i ? 'noch ' + fmt(gap(IHK[i - 1][0]), gap(IHK[i - 1][0]) % 1 ? 1 : 0) + ' P.' : 'Bestnote';
    } else {
      for (i = 0; i < KMK.length; i++) if (p >= KMK[i] - 1e-9) break;
      var P = 15 - i;
      o.textContent = P + (P === 1 ? ' Punkt' : ' Punkte'); ol.textContent = 'entspricht ' + PN[i] + ', als Dezimalnote ' + fmt((17 - P) / 3, 1);
      nx.textContent = i ? 'noch ' + fmt(gap(KMK[i - 1]), gap(KMK[i - 1]) % 1 ? 1 : 0) + ' P.' : 'Bestnote';
    }
  }

  /* Tabs */
  var TABS = ['fachnote', 'zeugnis', 'zielnote', 'punkte'];
  function show(k, focus) {
    TABS.forEach(function (x) {
      var on = x === k, tb = $('mnr-t-' + x);
      tb.setAttribute('aria-selected', on ? 'true' : 'false'); tb.tabIndex = on ? 0 : -1;
      $('mnr-p-' + x).hidden = !on;
    });
    if (focus) $('mnr-t-' + k).focus();
  }
  function jump(k) { show(k); var h = $('notenrechner'); if (h && h.scrollIntoView) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  TABS.forEach(function (x, i) {
    var tb = $('mnr-t-' + x);
    tb.addEventListener('click', function () { show(x); });
    tb.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); show(TABS[(i + d + TABS.length) % TABS.length], true); }
    });
  });
  root.addEventListener('click', function (e) { var g = e.target.closest('[data-go]'); if (g) jump(g.getAttribute('data-go')); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var k = a.getAttribute('href').slice(1);
    if (TABS.indexOf(k) < 0) return;
    e.preventDefault(); jump(k);
    if (history.replaceState) history.replaceState(null, '', '#' + k);
  });
  window.addEventListener('hashchange', function () { var k = location.hash.slice(1); if (TABS.indexOf(k) >= 0) jump(k); });

  /* Eingaben verbinden */
  function on(ids, fn) { ids.forEach(function (id) { var el = $(id); if (el) { el.addEventListener('input', fn); el.addEventListener('change', fn); } }); }
  on(['mnr-f-s', 'mnr-f-m', 'mnr-f-w'], fach);
  on(['mnr-g-s', 'mnr-g-m', 'mnr-g-w', 'mnr-g-k', 'mnr-g-z'], ziel);
  on(['mnr-p-a', 'mnr-p-b', 'mnr-p-s'], punkte);
  Array.prototype.forEach.call(root.querySelectorAll('.mnr-tsel'), function (sel) {
    sel.addEventListener('change', function () {
      Array.prototype.forEach.call(root.querySelectorAll('.mnr-tsel'), function (o) { o.value = sel.value; });
      fach(); ziel();
    });
  });
  fach(); ziel(); punkte();
  var h0 = location.hash.slice(1);
  if (TABS.indexOf(h0) >= 0) setTimeout(function () { jump(h0); }, 60);

  window.MNR = { $: $, fmt: fmt, mean: mean, show: show, root: root };
})();
