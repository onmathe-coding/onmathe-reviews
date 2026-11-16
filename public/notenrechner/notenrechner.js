/* OnMathe Notenrechner für /magazin/notenrechner (Stand 16.11.2026).
   Quelle: magazin-notenrechner/ im Repo onmathe-coding/onmathe-reviews. Baut Stil und Oberfläche in #mnr-app ein,
   danach läuft die Logik: Fachnote aus Klassenarbeiten und mündlicher Note für drei Gewichtungen. Speichert nichts. */
(function () {
var host = document.getElementById("mnr-app");
if (!host || host.getAttribute("data-ok")) return;
var st = document.createElement("style");
st.textContent = ".mnr [hidden]{display:none!important}\n.mnr-in{display:grid;gap:24px;align-content:start;min-width:0}\n.mnr-step{min-width:0}\n.mag-richtext .mnr .mnr-lab{display:flex;align-items:center;gap:10px;margin:0 0 12px;font:600 16px/1.3 var(--mb);color:var(--mi)}\n.mnr-nr{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:var(--mi);font:700 14px/1 var(--mh);color:#fff}\n.mnr-noten{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}\n.mnr-sel{display:flex;flex-direction:column;gap:6px;margin:0;min-width:0;font:500 13.5px/1.3 var(--mb);color:var(--mm)}\n.mnr-sel select{width:100%;height:52px;margin:0;padding:0 12px;border:1px solid #d6dce5;border-radius:12px;background-color:#fff;font:600 17px/1 var(--mb);color:var(--mi);cursor:pointer}\n.mnr-sel select.mnr-ohne{font-weight:500;color:var(--mm)}\n.mnr-sel select:focus{outline:none;border-color:var(--mi);box-shadow:0 0 0 3px rgba(255,144,0,.35)}\n.mnr-add{margin:12px 0 0;min-height:40px;padding:0 16px;border:1.5px dashed #c5cdd9;border-radius:999px;background:#fff;font:600 14.5px/1 var(--mb);color:var(--mi);cursor:pointer}\n.mnr-add:hover{border-color:var(--mi)}\n.mnr-go{min-height:56px;margin:0;padding:0 20px;border:0;border-radius:999px;background:var(--mo);font:700 17px/1.2 var(--mb);color:var(--mi);cursor:pointer}\n.mnr-go:hover{background:#ffa52e}\n.mnr-add:focus-visible,.mnr-go:focus-visible{outline:3px solid var(--mi);outline-offset:2px}\n.mnr-out{display:grid;gap:12px;align-content:start;min-width:0}\n.mag-richtext .mnr .mnr-leer{margin:0;padding:28px 18px;border:1.5px dashed #d6dce5;border-radius:16px;font:500 15px/1.5 var(--mb);color:var(--mm);text-align:center}\n.mnr-res{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;border-radius:16px;background:var(--mbg)}\n.mnr-res-k{font:600 15px/1.35 var(--mb);color:var(--mt)}\n.mnr-res-v{flex:none;text-align:right}\n.mnr-res-v b{display:block;font:700 30px/1.05 var(--mh);letter-spacing:-.02em;color:var(--mi);font-variant-numeric:tabular-nums}\n.mnr-res-v small{display:block;margin-top:3px;font:500 13.5px/1.3 var(--mb);color:var(--mm)}\n.mag-richtext .mnr .mnr-info{margin:2px 0 0;font:400 14px/1.55 var(--mb);color:var(--mm)}\n.mag-richtext .mnr .mnr-warn{margin:0;padding:16px 18px;border:1px solid #fedf89;border-radius:16px;background:#fffaeb;font:500 15px/1.5 var(--mb);color:#93370d}\n@media (max-width:767px){\n.mnr-noten{grid-template-columns:repeat(2,minmax(0,1fr))}\n.mnr-res{padding:14px 16px}\n.mnr-res-v b{font-size:26px}\n}";
document.head.appendChild(st);
host.innerHTML = "<div class=\"mag-calc mnr-calc\">\n<div class=\"mnr-in\">\n<div class=\"mnr-step\" role=\"group\" aria-labelledby=\"mnr-l1\">\n<p class=\"mnr-lab\" id=\"mnr-l1\"><span class=\"mnr-nr\" aria-hidden=\"true\">1</span>Noten deiner Klassenarbeiten</p>\n<div class=\"mnr-noten\" id=\"mnr-arb\"></div>\n<button type=\"button\" class=\"mnr-add\" id=\"mnr-add\">+ Weitere Arbeit</button>\n</div>\n<div class=\"mnr-step\">\n<label class=\"mnr-lab\" for=\"mnr-m\"><span class=\"mnr-nr\" aria-hidden=\"true\">2</span>Deine mündliche Note</label>\n<div class=\"mnr-noten\"><span class=\"mnr-sel\"><select id=\"mnr-m\"></select></span></div>\n</div>\n<button type=\"button\" class=\"mnr-go\" id=\"mnr-go\">Berechnen</button>\n</div>\n<div class=\"mnr-out\" id=\"mnr-out\" aria-live=\"polite\"><p class=\"mnr-leer\">Hier siehst du gleich deine Fachnote.</p></div>\n</div>";
host.setAttribute("data-ok", "1");
host.style.minHeight = "";
})();
/* Notenrechner: Fachnote aus Klassenarbeiten und mündlicher Note.
Plus und Minus zählen fest 0,3 (2+ = 1,7, 2- = 2,3). Ergebnis für drei Gewichtungen der mündlichen Note. */
(function () {
var app = document.getElementById('mnr-app');
if (!app || app.getAttribute('data-js')) return;
app.setAttribute('data-js', '1');
var NOTEN = ['1+', '1', '1-', '2+', '2', '2-', '3+', '3', '3-', '4+', '4', '4-', '5+', '5', '5-', '6'];
var GEWICHTE = [[1 / 2, 'Mündlich zählt 50 %'], [1 / 3, 'Mündlich zählt 1/3'], [1 / 4, 'Mündlich zählt 25 %']];
var START = 3;
var MAX = 8;
var liste = document.getElementById('mnr-arb');
var mue = document.getElementById('mnr-m');
var add = document.getElementById('mnr-add');
var go = document.getElementById('mnr-go');
var out = document.getElementById('mnr-out');
var gerechnet = false;
function optionen() {
var s = '<option value="">Note wählen</option>';
for (var i = 0; i < NOTEN.length; i++) s += '<option value="' + NOTEN[i] + '">' + NOTEN[i] + '</option>';
return s;
}
function wert(note) {
var g = parseInt(note, 10);
if (note.charAt(1) === '+') return g - 0.3;
if (note.charAt(1) === '-') return g + 0.3;
return g;
}
function zahl(v) {
var s = (Math.round(v * 100) / 100).toFixed(2);
if (s.charAt(s.length - 1) === '0') s = s.slice(0, -1);
return s.replace('.', ',');
}
function ganzeNote(v) {
var r = Math.round(v * 100) / 100;
var unten = Math.floor(r);
if (Math.abs(r - unten - 0.5) < 0.001) return 'zwischen ' + unten + ' und ' + (unten + 1);
return 'also eine ' + Math.max(1, Math.min(6, Math.round(r)));
}
function neueArbeit() {
var nr = liste.children.length + 1;
var feld = document.createElement('label');
feld.className = 'mnr-sel';
feld.innerHTML = '<span>' + nr + '. Arbeit</span><select>' + optionen() + '</select>';
liste.appendChild(feld);
if (nr >= MAX) add.hidden = true;
return feld.querySelector('select');
}
function zeile(text, v) {
return '<div class="mnr-res"><span class="mnr-res-k">' + text + '</span><span class="mnr-res-v"><b>' + zahl(v) +
'</b><small>' + ganzeNote(v) + '</small></span></div>';
}
function rechnen() {
var felder = liste.querySelectorAll('select');
var summe = 0;
var anzahl = 0;
for (var i = 0; i < felder.length; i++) {
if (felder[i].value) {
summe += wert(felder[i].value);
anzahl++;
}
}
if (!anzahl) {
out.innerHTML = '<p class="mnr-warn">Wähle zuerst bei mindestens einer Klassenarbeit deine Note aus.</p>';
return;
}
var schnitt = summe / anzahl;
if (!mue.value) {
out.innerHTML = zeile('Schnitt deiner Arbeiten', schnitt) +
'<p class="mnr-info">Wähle noch deine mündliche Note aus, dann siehst du deine Fachnote.</p>';
return;
}
var m = wert(mue.value);
var html = '';
for (var j = 0; j < GEWICHTE.length; j++) {
var w = GEWICHTE[j][0];
html += zeile(GEWICHTE[j][1], (1 - w) * schnitt + w * m);
}
out.innerHTML = html + '<p class="mnr-info">Schnitt deiner Arbeiten: ' + zahl(schnitt) +
'. Wie stark die mündliche Note zählt, legt deine Lehrkraft fest.</p>';
}
for (var i = 0; i < START; i++) neueArbeit();
mue.innerHTML = optionen();
go.addEventListener('click', function () {
gerechnet = true;
rechnen();
if (window.innerWidth < 992 && out.scrollIntoView) out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
function markieren() {
var felder = app.querySelectorAll('select');
for (var i = 0; i < felder.length; i++) felder[i].className = felder[i].value ? '' : 'mnr-ohne';
}
markieren();
app.addEventListener('change', function () {
markieren();
if (gerechnet) rechnen();
});
add.addEventListener('click', function () {
var feld = neueArbeit();
feld.className = 'mnr-ohne';
feld.focus();
});
})();
