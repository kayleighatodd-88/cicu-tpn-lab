/* Teach mode: sandbox, worked cases, reference card. */
(function () {
  'use strict';
  const T = TPN, C = TPNC, U = TPNUI, $ = U.$, esc = U.esc;
  TPNShell.mount('teach');
  const main = $('#app');
  main.innerHTML = `<div class="card"><h1>Teach mode</h1><p class="lede">Explore freely. Change any number and watch calories, GIR, fluids and electrolytes respond, with the math shown and safety flags explained. Then walk the day-by-day cases with teaching points.</p>
  <div class="days" role="tablist" id="tabs"><button data-tab="sand" aria-current="true">Sandbox</button><button data-tab="cases">Day-by-day cases</button><button data-tab="ref">Reference card</button></div></div><div id="pane"></div>`;

  const LABS = [['glu', 'Glucose'], ['tg', 'TG'], ['bun', 'BUN'], ['cr', 'Cr'], ['na', 'Na'], ['k', 'K'], ['cl', 'Cl'], ['co2', 'CO₂'], ['ca', 'Ca'], ['ica', 'iCa'], ['phos', 'Phos'], ['mg', 'Mg'], ['alb', 'Alb'], ['dbili', 'D.bili'], ['uop', 'UOP']];
  function sandbox(p) {
    p.innerHTML = `<div class="card"><div class="row two"><div><label for="pre">Start from a preset patient</label><select id="pre">${C.PRESETS.map(x => `<option value="${x.id}">${esc(x.label)}</option>`).join('')}</select></div><div><label>&nbsp;</label><button id="clr" class="ghost">Clear order</button></div></div>
      <details style="margin-top:10px"><summary>Optional: enter today's labs to get teaching-default suggestions</summary><div class="row" style="margin-top:8px" id="labs">${LABS.map(l => `<div><label for="l-${l[0]}">${l[1]} <span class="unit">${T.LAB_REF[l[0]].unit}</span></label><input id="l-${l[0]}" data-lab="${l[0]}" type="number" inputmode="decimal" step="any"></div>`).join('')}</div></details></div>
      <div id="ws"></div><div class="card" id="sug"></div>`;
    const ws = U.Workspace($('#ws', p), { math: true });
    const ctx = {};
    function sug() {
      const s = ws.getState(), list = T.suggestNext(s.pt, s.o, ctx);
      $('#sug', p).innerHTML = `<h3 style="margin-top:0">Teaching-default suggestions</h3><p class="small muted">Starting points to compare against your thinking, not a protocol.</p>` +
        (list.length ? list.map(x => `<div class="sug"><div class="a">${esc(x.area)}</div><div>${esc(x.action)}</div><div class="r">${esc(x.reason)} <span class="tag tag-${/sheet/.test(x.rule) ? 's' : /verify|common/.test(x.rule) ? 'c' : 'd'}">${esc(x.rule)}</span></div></div>`).join('') : '<p class="muted">Enter a weight and rate (and labs if you have them) to see suggestions.</p>');
    }
    const setPre = () => { const pr = C.PRESETS.find(x => x.id === $('#pre', p).value); ws.setCase({ pt: pr.patient, o: T.emptyOrder(), ctx, extra: {} }); sug(); };
    $('#pre', p).onchange = setPre; $('#clr', p).onclick = setPre;
    $('#labs', p).addEventListener('input', (e) => { const k = e.target.dataset.lab; if (!k) return; if (e.target.value === '') delete ctx[k]; else ctx[k] = +e.target.value; ws.setCtx(ctx); sug(); });
    ws.onChange(sug); setPre();
  }
  function cases(p) {
    p.innerHTML = `<div class="card"><label for="cs">Choose a case</label><select id="cs">${Object.values(C.CASES).map(c => `<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select></div><div id="run"></div>`;
    const go = () => { $('#run', p).innerHTML = ''; C.CASES[$('#cs', p).value] && U.CaseRunner($('#run', p), C.CASES[$('#cs', p).value], { mode: 'teach' }); };
    $('#cs', p).onchange = go; go();
  }
  function ref(p) {
    const row = (k, nm, u) => `<tr><td>${nm}</td>${['infant', 'child', 'adolescent'].map(a => `<td class="n">${T.rangeFor(k, a) ? T.rangeFor(k, a)[0] + '–' + T.rangeFor(k, a)[1] : '—'}</td>`).join('')}<td class="small muted">${u}</td></tr>`;
    p.innerHTML = `<div class="card"><h2>Quick reference <span class="tag tag-s">sheet</span></h2>
      <h3>Formulas</h3><ul><li>GIR (mg/kg/min) = dextrose % × mL/hr ÷ weight ÷ 6</li><li>Dextrose 3.4 kcal/g · protein 4 kcal/g · lipid 10 kcal/g (20% = 2 kcal/mL; 5 mL per g)</li><li>mEq/kg/day = mEq/L × (mL/hr × 24 ÷ 1000) ÷ weight; bag mEq/L = dose × weight ÷ L/day</li><li>Total K = KCl + K-acetate + 1.5 × K-phos (mmol)</li><li>Ca gluconate mEq ÷ 2 = mmol (match Ca:Phos about 1:1)</li></ul>
      <h3>Goals</h3><div class="scroll"><table><tr><th></th><th class="n">Infant</th><th class="n">Child</th><th class="n">Adolescent</th></tr>
        <tr><td>GIR (mg/kg/min)</td>${['infant', 'child', 'adolescent'].map(a => `<td class="n">${T.AGES[a].gir.join('–')}</td>`).join('')}</tr>
        <tr><td>Total kcal/kg/day</td>${['infant', 'child', 'adolescent'].map(a => `<td class="n">${T.AGES[a].kcal.join('–')}${T.AGES[a].verifyKcal ? '*' : ''}</td>`).join('')}</tr>
        ${row('na', 'Na (mEq/kg/d)', '')}${row('k', 'K (mEq/kg/d)', '')}${row('phos', 'Phos (mmol)', 'see units on dashboard')}${row('ca', 'Ca (mEq)', '')}${row('mg', 'Mg (mEq)', '')}</table></div><p class="small muted">*Child/adolescent kcal targets and some ranges need local verification.</p>
      <h3>Rules that gate advancement</h3><ul><li>TG 200–300: hold advancing lipid · TG &gt;300: hold lipid</li><li>BUN ≥30: decrease protein 0.5–1 g/kg/day</li><li>L-carnitine 10 mg/kg/day (infants), up to 20</li><li>L-cysteine required if &lt;1 year</li><li>Phos &lt;2 mmol/100 mL; no phos if on a CaCl drip</li></ul></div>`;
  }
  const panes = { sand: sandbox, cases, ref };
  function show(t) { $('#tabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === t ? 'true' : 'false')); $('#pane').innerHTML = ''; panes[t]($('#pane')); }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.tab); });
  show('sand');
})();
