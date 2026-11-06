#!/usr/bin/env python3
"""Inline src/ into self-contained pages: index/teach/learn/check.html."""
import pathlib
R = pathlib.Path(__file__).parent; S = R / 'src'
rd = lambda n: (S / n).read_text(encoding='utf-8')
CORE = ['engine.js', 'content-cases.js', 'content-learn.js', 'content-check.js', 'ui.js', 'shell.js']
PAGES = {
  'teach': ('Teach', 'teach.js'), 'learn': ('Learn', 'learn.js'), 'check': ('Check-off', 'check.js')}
def page(title, body, scripts):
    js = '\n'.join(f'<script>\n{rd(s)}\n</script>' for s in scripts)
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TPN Lab — {title}</title><meta name="theme-color" content="#333F48"><style>
{rd('style.css')}
</style></head><body><main id="app"></main>
{js}
</body></html>'''
for k, (t, f) in PAGES.items():
    (R / f'{k}.html').write_text(page(t, '', CORE + [f]), encoding='utf-8')
home = '''<main id="app"><div class="card"><h1>TPN Lab</h1><p class="lede">A pediatric cardiac parenteral nutrition simulator: calculate macros and micros, advance TPN day by day, and check your skills. Teach, Learn, then Check-off.</p></div>
<div class="hero"><a class="tilecard" href="teach.html"><h2>Teach</h2><p>Live calculator sandbox with the math shown, plus worked day-by-day cases and a reference card.</p></a>
<a class="tilecard" href="learn.html"><h2>Learn</h2><p>Ten guided modules (dextrose, protein, lipid and L-carnitine, electrolytes, advancement) with tasks and quizzes.</p></a>
<a class="tilecard" href="check.html"><h2>Check-off</h2><p>Blinded calculations, order-building cases and a knowledge check with a scored report.</p></a></div></main>
<script>
'''
(R / 'index.html').write_text(f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TPN Lab</title><meta name="theme-color" content="#333F48"><style>
{rd('style.css')}
</style></head><body>{home}{rd('shell.js')}
TPNShell.mount('home');
</script></body></html>''', encoding='utf-8')
print('built', [p.name for p in R.glob('*.html')])
