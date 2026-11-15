/* OnMathe Notenrechner für /magazin/notenrechner (Stand 15.11.2026).
   Quelle: magazin-notenrechner/ im Repo onmathe-coding/onmathe-reviews. Baut Stil und Oberfläche in #mnr-app ein,
   danach laufen Teil 1 (Tabs, Fachnote, Zielnote, Punkte) und Teil 2 (Zeugnis und Versetzung). Speichert nichts. */
(function () {
var host = document.getElementById("mnr-app");
if (!host || host.getAttribute("data-ok")) return;
var st = document.createElement("style");
st.textContent = ".mnr{--ok:#067647;--okb:#ecfdf3;--okl:#abefc6;--wa:#b54708;--wab:#fffaeb;--wal:#fedf89;--ba:#b42318;--bab:#fef3f2;--bal:#fecdca}\n.mnr-tabs{display:flex;gap:6px;max-width:1000px;margin:28px auto 0;padding:6px;background:#fff;border:1px solid var(--ml);border-radius:999px;box-shadow:0 10px 28px rgba(32,43,62,.06)}\n.mnr-tab{flex:1 1 0;min-width:0;min-height:46px;margin:0;padding:8px 12px;border:0;border-radius:999px;background:transparent;font:600 15px/1.25 var(--mb);color:var(--mt);cursor:pointer;text-align:center}\n.mnr-tab:hover{background:var(--ml2);color:var(--mi)}\n.mnr-tab[aria-selected=\"true\"]{background:var(--mi);color:#fff}\n.mnr-tab:focus-visible,.mnr-lbtn:focus-visible,.mnr-go:focus-visible,.mnr-zdel:focus-visible,.mnr-zk input:focus-visible{outline:3px solid var(--mo);outline-offset:2px}\n.mnr-panel[hidden]{display:none!important}\n.mnr .mag-calc{margin-top:16px}\n.mnr-wide{grid-column:1/-1}\n.mnr-chips{display:flex;flex-wrap:wrap;gap:6px;min-height:26px}\n.mnr-chip{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;background:var(--ml2);font:600 13px/1 var(--mh);color:var(--mi);font-variant-numeric:tabular-nums}\n.mnr-chip.bad{background:var(--bab);color:var(--ba)}\n.mag-richtext .mnr p{margin:0}\n.mag-richtext .mnr .mnr-say{padding:14px 16px;border:1px solid var(--ml);border-radius:14px;background:#fff;font:500 15px/1.55 var(--mb);color:var(--mi)}\n.mnr-sub{display:block;margin-top:6px;font:500 14px/1.4 var(--mb);color:var(--mot)}\n.mnr-st{grid-column:1/-1;padding:18px 18px 16px;border:1px solid var(--okl);border-radius:16px;background:var(--okb)}\n.mnr-st[data-s=\"warn\"]{border-color:var(--wal);background:var(--wab)}\n.mnr-st[data-s=\"bad\"]{border-color:var(--bal);background:var(--bab)}\n.mnr-st[data-s=\"none\"]{border-color:var(--ml);background:var(--mbg)}\n.mnr-st-k{display:block;margin:0 0 6px;font:500 13.5px/1.3 var(--mb);color:var(--mm)}\n.mnr-st-t{display:flex;align-items:center;gap:10px;font:700 26px/1.15 var(--mh);letter-spacing:-.02em;color:var(--ok)}\n.mnr-st-t::before{content:\"\";flex:none;width:12px;height:12px;border-radius:50%;background:currentColor}\n.mnr-st[data-s=\"warn\"] .mnr-st-t{color:var(--wa)}\n.mnr-st[data-s=\"bad\"] .mnr-st-t{color:var(--ba)}\n.mnr-st[data-s=\"none\"] .mnr-st-t{color:var(--mi)}\n.mag-richtext .mnr .mnr-st p{margin-top:8px;font:400 15px/1.55 var(--mb);color:var(--mi)}\n.mag-richtext .mnr-why{grid-column:1/-1;list-style:none;margin:0;padding:0;display:grid;gap:8px}\n.mag-richtext .mnr-why li{position:relative;margin:0;padding:0 0 0 18px;font:400 14.5px/1.5 var(--mb);color:var(--mt)}\n.mnr-why li::before{content:\"\";position:absolute;left:2px;top:9px;width:6px;height:6px;border-radius:50%;background:var(--mm)}\n.mnr-zhead,.mnr-zrow{display:grid;grid-template-columns:minmax(0,1fr) 96px 72px 36px;gap:8px;align-items:center}\n.mnr-zhead{margin-top:18px;padding:0 0 6px;font:600 13px/1.3 var(--mb);color:var(--mm)}\n.mnr-zhead span:nth-child(3){text-align:center}\n.mnr-zrow{padding:6px 0;border-top:1px solid var(--ml2)}\n.mnr-zrow input[type=\"text\"],.mnr-zrow select{width:100%;height:40px;margin:0;padding:0 10px;border:1px solid #d6dce5;border-radius:10px;background:#fff;font:500 15px/1 var(--mb);color:var(--mi)}\n.mnr-zrow input[type=\"text\"]:focus,.mnr-zrow select:focus{outline:none;border-color:var(--mi);box-shadow:0 0 0 3px rgba(255,144,0,.35)}\n.mnr-zk{display:flex;align-items:center;justify-content:center;margin:0;cursor:pointer}\n.mnr-zk input{width:20px;height:20px;margin:0;accent-color:var(--mi);cursor:pointer}\n.mnr-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n.mnr-zdel{width:36px;height:36px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;font:400 22px/1 var(--mb);color:var(--mm);cursor:pointer}\n.mnr-zdel:hover{background:var(--bab);color:var(--ba)}\n.mnr-fr .mnr-zhead span:nth-child(3),.mnr-fr .mnr-zk{visibility:hidden}\n.mnr-fr .mnr-kbox{display:none}\n.mnr-zbtns{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}\n.mnr-lbtn{min-height:40px;margin:0;padding:0 16px;border:1.5px solid #d6dce5;border-radius:999px;background:#fff;font:600 14.5px/1 var(--mb);color:var(--mi);cursor:pointer}\n.mnr-lbtn:hover{border-color:var(--mi)}\n.mnr-go{grid-column:1/-1;min-height:48px;margin:0;padding:0 18px;border:0;border-radius:999px;background:var(--mo);font:600 15.5px/1.2 var(--mb);color:var(--mi);cursor:pointer}\n.mnr-go:hover{background:#ffa52e}\n.mag-richtext .mnr .mnr-hint{margin-top:12px;font:400 13.5px/1.55 var(--mb);color:var(--mm)}\n.mnr-mb{display:none}\n@media (min-width:992px){#mnr-zbox .mag-outs{position:sticky;top:120px;align-self:start}}\n@media (max-width:767px){\n.mnr-fr .mnr-abox{grid-column:1/-1}\n.mnr-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-radius:20px}\n.mnr-tab{border-radius:14px;font-size:14.5px}\n.mnr-zhead,.mnr-zrow{grid-template-columns:minmax(0,1fr) 84px 40px 32px;gap:6px}\n.mnr-zdel{width:32px;height:32px}\n.mnr-dk{display:none}.mnr-mb{display:inline}\n.mnr-st-t{font-size:23px}\n}";
document.head.appendChild(st);
host.innerHTML = "<div class=\"mnr-tabs\" role=\"tablist\" aria-label=\"Was willst du berechnen?\">\n<button type=\"button\" class=\"mnr-tab\" role=\"tab\" id=\"mnr-t-fachnote\" aria-controls=\"mnr-p-fachnote\" aria-selected=\"true\">Fachnote</button>\n<button type=\"button\" class=\"mnr-tab\" role=\"tab\" id=\"mnr-t-zeugnis\" aria-controls=\"mnr-p-zeugnis\" aria-selected=\"false\" tabindex=\"-1\">Zeugnis und Versetzung</button>\n<button type=\"button\" class=\"mnr-tab\" role=\"tab\" id=\"mnr-t-zielnote\" aria-controls=\"mnr-p-zielnote\" aria-selected=\"false\" tabindex=\"-1\">Zielnote</button>\n<button type=\"button\" class=\"mnr-tab\" role=\"tab\" id=\"mnr-t-punkte\" aria-controls=\"mnr-p-punkte\" aria-selected=\"false\" tabindex=\"-1\">Punkte in Note</button>\n</div>\n\n<div class=\"mnr-panel\" role=\"tabpanel\" id=\"mnr-p-fachnote\" aria-labelledby=\"mnr-t-fachnote\">\n<div class=\"mag-calc\">\n<div class=\"mag-fields\">\n<label class=\"mag-fld mnr-wide\">Noten in Klassenarbeiten<input id=\"mnr-f-s\" type=\"text\" autocomplete=\"off\" spellcheck=\"false\" value=\"3 2- 4\" placeholder=\"z. B. 3 2- 4 3+\"></label>\n<div class=\"mnr-chips mnr-wide\" id=\"mnr-f-sc\" aria-hidden=\"true\"></div>\n<label class=\"mag-fld mnr-wide\">Mündliche und sonstige Noten<input id=\"mnr-f-m\" type=\"text\" autocomplete=\"off\" spellcheck=\"false\" value=\"3+\" placeholder=\"z. B. 3+ 2\"></label>\n<div class=\"mnr-chips mnr-wide\" id=\"mnr-f-mc\" aria-hidden=\"true\"></div>\n<label class=\"mag-fld\">Gewicht der Arbeiten<select id=\"mnr-f-w\"><option value=\"50\">50 %, gleich viel</option><option value=\"60\">60 %</option><option value=\"66.6667\">67 %, doppelt so viel</option><option value=\"70\">70 %</option><option value=\"75\">75 %</option></select></label>\n<label class=\"mag-fld\">Plus und Minus zählen<select class=\"mnr-tsel\"><option value=\"0.25\">0,25 (2- = 2,25)</option><option value=\"0.3\" selected>0,3 (2- = 2,3)</option><option value=\"0.3333\">0,33 (2- = 2,33)</option></select></label>\n</div>\n<div class=\"mag-outs\" aria-live=\"polite\">\n<div class=\"mag-out main\"><span class=\"mag-out-k\">Fachnote rechnerisch</span><span class=\"mag-out-v\" id=\"mnr-f-o\">-</span></div>\n<div class=\"mag-out\"><span class=\"mag-out-k\">Schnitt der Arbeiten</span><span class=\"mag-out-v\" id=\"mnr-f-oa\">-</span></div>\n<div class=\"mag-out\"><span class=\"mag-out-k\">Schnitt mündlich</span><span class=\"mag-out-v\" id=\"mnr-f-ob\">-</span></div>\n<p class=\"mnr-say mnr-wide\" id=\"mnr-f-v\"></p>\n</div>\n</div>\n<p class=\"mag-calc-hint\">Noten trennst du mit Leerzeichen. Erlaubt sind ganze Noten, Plus und Minus (2-), Zwischennoten (2-3) und Dezimalzahlen (2,5).</p>\n</div>\n\n<div class=\"mnr-panel\" role=\"tabpanel\" id=\"mnr-p-zeugnis\" aria-labelledby=\"mnr-t-zeugnis\" hidden>\n<div class=\"mag-calc\" id=\"mnr-zbox\">\n<div>\n<label class=\"mag-fld\">Deine Schule<select id=\"mnr-z-rule\"><option value=\"fr\">Alle Bundesländer (Faustregel)</option><option value=\"bw\">Gymnasium in Baden-Württemberg (genau)</option></select></label>\n<div class=\"mnr-zhead\" aria-hidden=\"true\"><span>Fach</span><span>Note</span><span><span class=\"mnr-dk\">Kernfach</span><span class=\"mnr-mb\">Kern</span></span><span></span></div>\n<div id=\"mnr-z-rows\"></div>\n<div class=\"mnr-zbtns\"><button type=\"button\" class=\"mnr-lbtn\" id=\"mnr-z-add\">Fach hinzufügen</button><button type=\"button\" class=\"mnr-lbtn\" id=\"mnr-z-clr\">Noten leeren</button></div>\n<p class=\"mnr-hint\">Mit Beispielnoten vorausgefüllt. Steht eine Note noch zwischen zwei Stufen, wähle zum Beispiel 4-5: Der Rechner prüft dann beide Fälle.</p>\n</div>\n<div class=\"mag-outs\" aria-live=\"polite\">\n<div class=\"mnr-st\" id=\"mnr-z-st\" data-s=\"none\"><span class=\"mnr-st-k\">Versetzung</span><span class=\"mnr-st-t\" id=\"mnr-z-t\">-</span><p id=\"mnr-z-d\"></p></div>\n<div class=\"mag-out mnr-abox\"><span class=\"mag-out-k\">Schnitt aller Fächer</span><span class=\"mag-out-v\" id=\"mnr-z-a\">-</span></div>\n<div class=\"mag-out mnr-kbox\"><span class=\"mag-out-k\">Schnitt der Kernfächer</span><span class=\"mag-out-v\" id=\"mnr-z-k\">-</span></div>\n<ul class=\"mnr-why\" id=\"mnr-z-w\"></ul>\n<button type=\"button\" class=\"mnr-go\" data-go=\"zielnote\">Welche Note brauche ich noch?</button>\n</div>\n</div>\n</div>\n\n<div class=\"mnr-panel\" role=\"tabpanel\" id=\"mnr-p-zielnote\" aria-labelledby=\"mnr-t-zielnote\" hidden>\n<div class=\"mag-calc\">\n<div class=\"mag-fields\">\n<label class=\"mag-fld mnr-wide\">Bisherige Noten in Arbeiten<input id=\"mnr-g-s\" type=\"text\" autocomplete=\"off\" spellcheck=\"false\" value=\"5 4- 5\" placeholder=\"z. B. 5 4-\"></label>\n<div class=\"mnr-chips mnr-wide\" id=\"mnr-g-sc\" aria-hidden=\"true\"></div>\n<label class=\"mag-fld\">Mündliche Note<input id=\"mnr-g-m\" type=\"text\" autocomplete=\"off\" spellcheck=\"false\" value=\"5+\" placeholder=\"z. B. 4\"></label>\n<label class=\"mag-fld\">Arbeiten bis zum Zeugnis<select id=\"mnr-g-k\"><option value=\"1\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option></select></label>\n<label class=\"mag-fld\">Ziel auf dem Zeugnis<select id=\"mnr-g-z\"><option value=\"1\">eine 1</option><option value=\"2\">eine 2</option><option value=\"3\">eine 3</option><option value=\"4\" selected>eine 4</option></select></label>\n<label class=\"mag-fld\">Gewicht der Arbeiten<select id=\"mnr-g-w\"><option value=\"50\">50 %, gleich viel</option><option value=\"60\">60 %</option><option value=\"66.6667\">67 %, doppelt so viel</option><option value=\"70\">70 %</option><option value=\"75\">75 %</option></select></label>\n<label class=\"mag-fld mnr-wide\">Plus und Minus zählen<select class=\"mnr-tsel\"><option value=\"0.25\">0,25 (2- = 2,25)</option><option value=\"0.3\" selected>0,3 (2- = 2,3)</option><option value=\"0.3333\">0,33 (2- = 2,33)</option></select></label>\n</div>\n<div class=\"mag-outs\" aria-live=\"polite\">\n<div class=\"mag-out main\"><span class=\"mag-out-k\" id=\"mnr-g-ok\">Nötig in der nächsten Arbeit</span><span class=\"mag-out-v\" id=\"mnr-g-o\">-</span><span class=\"mnr-sub\" id=\"mnr-g-ol\"></span></div>\n<div class=\"mag-out mnr-wide\"><span class=\"mag-out-k\">Fachnote bisher</span><span class=\"mag-out-v\" id=\"mnr-g-now\">-</span></div>\n<p class=\"mnr-say mnr-wide\" id=\"mnr-g-v\"></p>\n</div>\n</div>\n<p class=\"mag-calc-hint\">Ziel heißt: rechnerisch unter x,5, also zum Beispiel unter 4,5 für eine 4. Die Zeugnisnote legt am Ende die Lehrkraft in einer Gesamtwertung fest.</p>\n</div>\n\n<div class=\"mnr-panel\" role=\"tabpanel\" id=\"mnr-p-punkte\" aria-labelledby=\"mnr-t-punkte\" hidden>\n<div class=\"mag-calc\">\n<div class=\"mag-fields\">\n<label class=\"mag-fld\">Erreichte Punkte<input id=\"mnr-p-a\" type=\"number\" inputmode=\"decimal\" min=\"0\" step=\"0.5\" value=\"34\"></label>\n<label class=\"mag-fld\">Mögliche Punkte<input id=\"mnr-p-b\" type=\"number\" inputmode=\"decimal\" min=\"1\" step=\"0.5\" value=\"50\"></label>\n<label class=\"mag-fld mnr-wide\">Notenschlüssel<select id=\"mnr-p-s\"><option value=\"ihk\">IHK-Schlüssel (Noten 1 bis 6)</option><option value=\"kmk\">Oberstufe und Abitur (15 bis 0 Punkte)</option></select></label>\n</div>\n<div class=\"mag-outs\" aria-live=\"polite\">\n<div class=\"mag-out main\"><span class=\"mag-out-k\">Ergebnis</span><span class=\"mag-out-v\" id=\"mnr-p-o\">-</span><span class=\"mnr-sub\" id=\"mnr-p-ol\"></span></div>\n<div class=\"mag-out\"><span class=\"mag-out-k\">Anteil</span><span class=\"mag-out-v\" id=\"mnr-p-pc\">-</span></div>\n<div class=\"mag-out\"><span class=\"mag-out-k\">Nächste Stufe</span><span class=\"mag-out-v\" id=\"mnr-p-nx\">-</span></div>\n</div>\n</div>\n<p class=\"mag-calc-hint\">Deine Lehrkraft kann einen eigenen Schlüssel verwenden. Maßgeblich ist der Schlüssel unter deiner Arbeit.</p>\n</div>";
host.setAttribute("data-ok", "1");
host.style.minHeight = "";
})();
(function () {
var root = document.getElementById('mnr');
if (!root || window.MNR) return;
function $(id) { return document.getElementById(id); }
function fmt(x, d) { d = d === undefined ? 2 : d; return x.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function mean(a) { if (!a.length) return null; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
function step() { var s = root.querySelector('.mnr-tsel'); return s ? parseFloat(s.value) : 0.3; }
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
/* OnMathe Notenrechner, Teil 2: Zeugnis und Versetzung (Stand 15.11.2026)
Gymnasium Baden-Württemberg nach § 1 und § 2 der Versetzungsordnung, sonst Faustregel. */
(function () {
var N = window.MNR;
if (!N || N.z) return;
N.z = 1;
var $ = N.$, fmt = N.fmt, mean = N.mean;
var G = ['', '1', '1-2', '2', '2-3', '3', '3-4', '4', '4-5', '5', '5-6', '6'];
var DEF = [['Deutsch', 1, '3'], ['Mathematik', 1, '4-5'], ['Englisch', 1, '3'], ['Französisch', 1, '4'], ['Biologie', 0, '2'], ['Physik', 0, '5'], ['Chemie', 0, '3'], ['Geschichte', 0, '3'], ['Geographie', 0, '3'], ['Gemeinschaftskunde', 0, '2'], ['Religion', 0, '2'], ['Sport', 0, '2'], ['Musik', 0, '3'], ['Bildende Kunst', 0, '2']];
var rows = $('mnr-z-rows'), box = $('mnr-zbox'), rule = $('mnr-z-rule');
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function addRow(name, kern, g) {
var d = document.createElement('div');
d.className = 'mnr-zrow';
d.innerHTML = '<input type="text" class="mnr-zn" value="' + esc(name) + '" aria-label="Fach" autocomplete="off" placeholder="Fach">' +
'<select class="mnr-zg" aria-label="Note">' + G.map(function (x) { return '<option value="' + x + '"' + (x === g ? ' selected' : '') + '>' + (x || '-') + '</option>'; }).join('') + '</select>' +
'<label class="mnr-zk"><input type="checkbox"' + (kern ? ' checked' : '') + '><span class="mnr-vh">Kernfach</span></label>' +
'<button type="button" class="mnr-zdel" aria-label="Fach entfernen">×</button>';
rows.appendChild(d);
return d;
}
DEF.forEach(function (r) { addRow(r[0], r[1], r[2]); });
function read() {
var out = [];
Array.prototype.forEach.call(rows.children, function (r) {
var nm = r.querySelector('.mnr-zn').value.trim() || 'Fach', sel = r.querySelector('.mnr-zg'), cb = r.querySelector('.mnr-zk input');
sel.setAttribute('aria-label', 'Note ' + nm);
cb.setAttribute('aria-label', nm + ' ist Kernfach');
r.querySelector('.mnr-zdel').setAttribute('aria-label', nm + ' entfernen');
if (!sel.value) return;
var p = sel.value.split('-');
out.push({ n: nm, k: cb.checked, smk: /sport|musik|kunst/i.test(nm), lo: +p[0], hi: +(p[1] || p[0]) });
});
return out;
}
function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' und ' + a[a.length - 1]; }
function lab(s) { return s.n + ' (' + s.g + ')'; }
function labK(s) { return s.n + ' (' + s.g + (s.k ? ', Kernfach' : '') + ')'; }
function grades(a) { return a.map(function (s) { return s.g; }); }
function pairs(a) { var r = []; for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) r.push([a[i], a[j]]); return r; }
function opts(all, bad, low) {
var o = all.filter(function (s) { return low.indexOf(s) < 0; }), r = [];
if (bad.k) o.forEach(function (s) { if (s.k && s.g <= 2) r.push([s]); });
else if (bad.g === 5) {
o.forEach(function (s) { if (s.g <= 2) r.push([s]); });
pairs(o.filter(function (s) { return s.g <= 3; })).forEach(function (p) { r.push(p); });
} else {
o.forEach(function (s) { if (s.g === 1) r.push([s]); });
pairs(o.filter(function (s) { return s.g <= 2; })).forEach(function (p) { r.push(p); });
}
return r;
}
function needTxt(s) {
return s.k ? 'mindestens eine 2 in einem anderen Kernfach' : s.g === 5 ? 'eine 2 oder besser in einem anderen Fach oder zwei Fächer mit mindestens 3' : 'eine 1 in einem anderen Fach oder zwei Fächer mit mindestens 2';
}
function core(all) {
var r = { why: [], ok: [] }, ker = all.filter(function (s) { return s.k; });
var k6 = ker.filter(function (s) { return s.g === 6; }), low = all.filter(function (s) { return s.g >= 5; });
r.a = mean(grades(all));
r.ka = ker.length ? mean(grades(ker)) : null;
if (k6.length) r.why.push(list(k6.map(lab)) + ': Eine 6 in einem Kernfach lässt sich nicht ausgleichen.');
if (r.a > 4 + 1e-9) r.why.push('Schnitt aller Fächer ' + fmt(r.a) + ': schlechter als 4,0.');
if (r.ka !== null && r.ka > 4 + 1e-9) r.why.push('Schnitt der Kernfächer ' + fmt(r.ka) + ': schlechter als 4,0.');
if (low.length > 2) r.why.push(low.length + ' Fächer unter 4: Erlaubt sind höchstens zwei, und nur mit Ausgleich.');
else if (low.length === 2 && !k6.length) {
var A = opts(all, low[0], low), B = opts(all, low[1], low), hit = null;
for (var i = 0; i < A.length && !hit; i++) {
for (var j = 0; j < B.length; j++) {
if (B[j].every(function (s) { return A[i].indexOf(s) < 0; })) { hit = [A[i], B[j]]; break; }
}
}
if (hit) r.ok.push('Ausgeglichen: ' + lab(low[0]) + ' durch ' + list(hit[0].map(lab)) + ', ' + lab(low[1]) + ' durch ' + list(hit[1].map(lab)) + '.');
else {
var miss = [];
if (!A.length) miss.push(labK(low[0]) + ': Es fehlt ' + needTxt(low[0]) + '.');
if (!B.length) miss.push(labK(low[1]) + ': Es fehlt ' + needTxt(low[1]) + '.');
r.why.push(miss.length ? miss.join(' ') : 'Die guten Noten reichen nicht, um beide Fächer gleichzeitig auszugleichen.');
}
}
if (low.length === 1 && !r.why.length) r.ok.push(lab(low[0]) + ' ist das einzige Fach unter 4. Das ist erlaubt, weil beide Schnitte bei 4,0 oder besser liegen.');
r.pass = !r.why.length;
return r;
}
function bw(all) {
var r = core(all);
if (r.pass) return r;
var smk = all.filter(function (s) { return s.smk && !s.k; });
if (smk.length > 1) {
var best = smk.reduce(function (a, b) { return b.g < a.g ? b : a; });
var r2 = core(all.filter(function (s) { return !(s.smk && !s.k) || s === best; }));
if (r2.pass) { r2.ok.unshift('Sport, Musik und Kunst zählen hier nur mit der besten dieser Noten, ' + lab(best) + '. Das sieht die Versetzungsordnung vor, wenn es sonst nicht reicht.'); return r2; }
}
return r;
}
function fr(all) {
var g = grades(all), n5 = g.filter(function (x) { return x === 5; }).length, n6 = g.filter(function (x) { return x === 6; }).length;
return { a: mean(g), lv: !n5 && !n6 ? 0 : !n6 && n5 === 1 ? 1 : (n5 === 2 && !n6) || (!n5 && n6 === 1) ? 2 : 3 };
}
var FT = ['Versetzt', 'Meist versetzt', 'Gefährdet', 'Nicht versetzt'], FS = ['ok', 'warn', 'bad', 'bad'];
var FK = ['versetzt', 'meist versetzt', 'nur mit Ausgleich versetzt', 'nicht versetzt'];
var FD = [
'Keine Note unter 4: Damit wirst du in der Regel versetzt.',
'Eine 5 ist in den meisten Ländern erlaubt. Am Gymnasium in NRW braucht eine 5 in Deutsch, Mathe oder einer Fremdsprache aber eine 3 in einem anderen dieser Fächer.',
'Zwei Fünfer oder eine 6: In den meisten Ländern wirst du nur mit Ausgleich durch bessere Noten in anderen Fächern versetzt.',
'Nach den Regeln fast aller Länder reicht das nicht. Je nach Land bleiben Nachprüfung, Versetzung auf Probe oder eine Ausnahme der Klassenkonferenz.'
];
function run() {
var isBW = rule.value === 'bw', it = read();
box.classList.toggle('mnr-fr', !isBW);
var st = $('mnr-z-st'), T = $('mnr-z-t'), D = $('mnr-z-d'), W = $('mnr-z-w');
if (!it.length) {
st.setAttribute('data-s', 'none'); T.textContent = 'Noten fehlen'; D.textContent = 'Wähle für jedes Fach eine Note aus.';
$('mnr-z-a').textContent = '-'; $('mnr-z-k').textContent = '-'; W.innerHTML = '';
return;
}
var U = [];
it.forEach(function (x, i) { if (x.hi !== x.lo) U.push(i); });
function sc(worse) { return it.map(function (x, i) { return { n: x.n, k: x.k, smk: x.smk, g: worse.indexOf(i) >= 0 ? x.hi : x.lo }; }); }
var ev = isBW ? bw : fr, good = ev(sc([])), bad = ev(sc(U));
var crit = U.filter(function (i) { var r = ev(sc([i])); return isBW ? !r.pass : r.lv > good.lv; });
function critTxt(f, end) {
if (crit.length === 1) return 'Entscheidend ist ' + it[crit[0]].n + ': ' + f(crit[0]) + '.';
if (crit.length > 1) return 'Entscheidend sind ' + list(crit.map(function (i) { return it[i].n; })) + '. Fällt eines davon auf die schlechtere Note, ' + end + '.';
return 'Es wird eng, wenn mehrere offene Noten auf die schlechtere Stufe fallen.';
}
var s, t, d, why = [];
if (isBW) {
if (bad.pass) { s = 'ok'; t = 'Versetzt'; d = U.length ? 'Du erfüllst alle Bedingungen, auch wenn die offenen Noten schlechter ausfallen.' : 'Du erfüllst alle Bedingungen der Versetzungsordnung.'; why = bad.ok; }
else if (good.pass) { s = 'warn'; t = 'Knapp'; d = critTxt(function (i) { return 'mit ' + it[i].lo + ' versetzt, mit ' + it[i].hi + ' nicht'; }, 'reicht es nicht'); why = bad.why.map(function (w) { return 'Im ungünstigen Fall: ' + w; }); }
else { s = 'bad'; t = 'Nicht versetzt'; d = 'Nach diesen Noten fehlt mindestens eine Bedingung. Möglich bleiben eine Entscheidung der Klassenkonferenz oder die Versetzung auf Probe.'; why = good.why; }
} else {
s = FS[bad.lv]; t = FT[bad.lv]; d = FD[bad.lv];
if (bad.lv !== good.lv) {
s = 'warn'; t = 'Knapp';
d = critTxt(function (i) { return 'mit ' + it[i].lo + ' ' + FK[good.lv] + ', mit ' + it[i].hi + ' ' + FK[ev(sc([i])).lv]; }, 'wird es eng');
why = ['Im ungünstigen Fall: ' + FD[bad.lv]];
}
}
st.setAttribute('data-s', s); T.textContent = t; D.textContent = d;
W.innerHTML = why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('');
function rng(a, b) { return a === null || a === undefined ? '-' : Math.abs(a - b) < 0.005 ? fmt(a) : fmt(a) + ' bis ' + fmt(b); }
$('mnr-z-a').textContent = rng(good.a, bad.a);
$('mnr-z-k').textContent = isBW ? rng(good.ka, bad.ka) : '-';
}
rows.addEventListener('input', run);
rows.addEventListener('change', run);
rows.addEventListener('click', function (e) { var b = e.target.closest('.mnr-zdel'); if (b) { b.parentNode.parentNode.removeChild(b.parentNode); run(); } });
rule.addEventListener('change', run);
$('mnr-z-add').addEventListener('click', function () { addRow('', 0, '').querySelector('.mnr-zn').focus(); run(); });
$('mnr-z-clr').addEventListener('click', function () { Array.prototype.forEach.call(rows.querySelectorAll('.mnr-zg'), function (x) { x.value = ''; }); run(); });
run();
})();
