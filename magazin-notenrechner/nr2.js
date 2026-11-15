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

  /* Ausgleichsmöglichkeiten für ein Fach unter 4 (GymVersV BW § 1 Abs. 2 Nr. 4) */
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
  /* § 2: Sport, Musik, Bildende Kunst zählen nur mit der besten Note, wenn es sonst nicht reicht */
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
  /* Faustregel für alle anderen Schulen und Länder */
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
    /* Schlechtere Noten helfen nie, deshalb genügen günstigster und ungünstigster Fall */
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
