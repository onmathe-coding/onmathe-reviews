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
