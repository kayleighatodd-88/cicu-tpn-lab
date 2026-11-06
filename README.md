# TPN Lab

Pediatric cardiac parenteral nutrition simulator: **Teach → Learn → Check-off**. Static pages (vanilla JS, no framework), same pattern as the other Pulse Lab sims.

| Page | What it does |
|---|---|
| `index.html` | Home |
| `teach.html` | Sandbox calculator with "show the math", optional labs → teaching-default suggestions, 4 worked day-by-day cases, reference card |
| `learn.html` | 10 modules (dextrose/GIR, protein, lipid/TG/L-carnitine, calories & fluids, electrolytes, day-by-day advancement, special considerations) with tasks and quizzes; practice cases; progress in this browser (localStorage) |
| `check.html` | Blinded assessment: 8 calculations, 3 order-building cases (weighted rubric, critical errors, multi-selects), 16 knowledge questions, scored report, JSON/text transcript |

## Develop
```
python3 build.py          # inlines src/ into the four self-contained pages
node test/engine.test.js  # formulas vs the cheat sheet (47 assertions)
node test/content.test.js # rubric fairness, Learn tasks solvable, reactive labs (105)
node test/ui.test.js      # Playwright run-through, desktop + phone, no console errors
```
Layout: `src/engine.js` (calculations, ranges, flags, suggestions) · `src/content-*.js` (cases, modules, check-off) · `src/ui.js` (workspace, case runner) · `src/teach.js`/`learn.js`/`check.js` · `src/style.css`.

## Important
Educational use only; all patients fictional. Rules are tagged **sheet** (TCPCHD TPN & TF cheat sheet, 6/30/23), **verify** (commonly cited; check locally) or **default** (teaching default). Check-off pass criteria are **provisional and unvalidated**. See `docs/CLINICAL_REVIEW_NOTES.md`.
