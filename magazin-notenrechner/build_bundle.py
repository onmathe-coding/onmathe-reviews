#!/usr/bin/env python3
"""Baut notenrechner.js (Stil, Oberfläche, Logik in einer Datei) und den kleinen statischen Teil fürs Rich Text."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
def rd(n): return open(os.path.join(D, n), encoding='utf-8').read()

html = rd('nr.html').strip()
m = re.match(r'(<section[^>]*>\s*<div class="mag-ct">.*?</div>)\s*(.*)</section>\s*$', html, re.S)
static_head, app = m.group(1), m.group(2).strip()

def mini(src):
    out = []
    for i, line in enumerate(src.split('\n')):
        s = line.strip()
        if not s: continue
        if s.startswith('/*') and s.endswith('*/'): continue
        out.append(s)
    return '\n'.join(out)

css = '\n'.join(l.strip() for l in rd('nr.css').split('\n') if l.strip() and not l.strip().startswith('/*'))
bundle = ('/* OnMathe Notenrechner für /magazin/notenrechner (Stand 16.11.2026).\n'
          '   Quelle: magazin-notenrechner/ im Repo onmathe-coding/onmathe-reviews. Baut Stil und Oberfläche in #mnr-app ein,\n'
          '   danach läuft die Logik: Fachnote aus Klassenarbeiten und mündlicher Note für drei Gewichtungen. Speichert nichts. */\n'
          '(function () {\n'
          'var host = document.getElementById("mnr-app");\n'
          'if (!host || host.getAttribute("data-ok")) return;\n'
          'var st = document.createElement("style");\n'
          'st.textContent = ' + json.dumps(css, ensure_ascii=False) + ';\n'
          'document.head.appendChild(st);\n'
          'host.innerHTML = ' + json.dumps(app, ensure_ascii=False) + ';\n'
          'host.setAttribute("data-ok", "1");\n'
          'host.style.minHeight = "";\n'
          '})();\n'
          + mini(rd('nr.js')) + '\n')

URL = 'https://onmathe-coding.github.io/onmathe-reviews/notenrechner/notenrechner.js?v=2'
static = (static_head + '\n<div id="mnr-app"><noscript><p>Für den Notenrechner muss JavaScript aktiv sein.</p></noscript></div>\n</section>\n'
          '<style>#mnr-app{min-height:430px}@media (max-width:991px){#mnr-app{min-height:540px}}@media (max-width:767px){#mnr-app{min-height:600px}}</style>\n'
          '<script src="' + URL + '" defer data-cookieconsent="ignore"></script>')
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
open(os.path.join(D, 'out', 'notenrechner.js'), 'w', encoding='utf-8').write(bundle)
open(os.path.join(D, 'out', 'calc_static.html'), 'w', encoding='utf-8').write(static)
print('bundle', len(bundle), 'static', len(static))
