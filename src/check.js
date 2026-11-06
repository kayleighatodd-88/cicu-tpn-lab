/* Check-off mode: blinded calculations, order-building cases, knowledge check; scored report + transcript.
   PASS CRITERIA ARE PROVISIONAL. Not a validated competency instrument. */
(function () {
  'use strict';
  const T = TPN, C = TPNC, U = TPNUI, K = C.CHECK, $ = U.$, esc = U.esc;
  TPNShell.mount('check');
  const app = $('#app');
  const S = { name: '', id: '', ref: false, calc: [], cases: [], multis: {}, mcq: [], started: null, step: 0 };
  const steps = ['calc', ...K.CASES.map((c, i) => 'case' + i), 'mcq', 'report'];
  const bar = () => `<div class="prog"><i style="width:${S.step / (steps.length - 1) * 100}%"></i></div>`;

  function start() {
    app.innerHTML = `<div class="card"><h1>Check-off</h1><p class="lede">A blinded assessment: no targets, flags or suggestions are shown while you work. You will complete ${K.CALC.length} calculations, ${K.CASES.length} order-building cases, and ${K.MCQ.length} knowledge questions.</p>
      <div class="callout"><b>Provisional.</b> Scoring thresholds are drafts for local educators to set and validate. Do not use as a formal competency determination without local approval.</div>
      <div class="row two" style="margin-top:12px"><div><label for="nm">Name</label><input id="nm" type="text" autocomplete="off"></div><div><label for="sid">Learner ID (optional)</label><input id="sid" type="text" autocomplete="off"></div></div>
      <label class="chk"><input type="checkbox" id="rf"> Allow the quick reference card (formulas, goals, ranges) during the assessment</label>
      <div class="actions"><button class="primary" id="go">Begin</button></div></div>`;
    $('#go').onclick = () => { S.name = $('#nm').value.trim(); S.id = $('#sid').value.trim(); S.ref = $('#rf').checked; S.started = new Date().toISOString(); S.step = 0; next(0); };
  }
  function refCard() {
    if (!S.ref) return '';
    const A = T.AGES;
    return `<details class="card"><summary>Reference card</summary><ul><li>GIR = dex% × mL/hr ÷ kg ÷ 6</li><li>Dextrose 3.4 · protein 4 · lipid 10 kcal/g (20% = 2 kcal/mL, 5 mL/g)</li><li>mEq/kg/day = mEq/L × L/day ÷ kg</li><li>K-phos 1 mmol = 1.5 mEq K · Ca gluconate mEq ÷ 2 = mmol</li><li>GIR goal: infant ${A.infant.gir.join('–')}, child ${A.child.gir.join('–')}, adolescent ${A.adolescent.gir.join('–')}</li><li>TG 200–300 hold advancing · &gt;300 hold lipid · BUN ≥30 reduce protein 0.5–1 · phos &lt;2 mmol/100 mL</li></ul></details>`;
  }
  function next(n) { S.step = n; const s = steps[n]; if (s === 'calc') calc(); else if (s === 'mcq') mcq(); else if (s === 'report') report(); else casePage(+s.slice(4)); window.scrollTo(0, 0); }

  function calc() {
    app.innerHTML = `${bar()}<div class="card"><h2>Part A: Calculations</h2><p class="small muted">Enter numbers only. Answers within ~3% are accepted.</p>${refCard()}
      ${K.CALC.map((q, i) => `<div style="margin:14px 0"><p><b>${i + 1}.</b> ${esc(q.prompt)}</p><div class="row two"><div><label for="c${i}">Answer <span class="unit">${esc(q.unit)}</span></label><input id="c${i}" type="number" inputmode="decimal" step="any"></div></div></div>`).join('')}
      <div class="actions"><button class="primary" id="nx">Continue to cases →</button></div></div>`;
    $('#nx').onclick = () => { S.calc = K.CALC.map((q, i) => { const v = parseFloat($('#c' + i).value), a = q.ans(); return { id: q.id, prompt: q.prompt, unit: q.unit, given: isFinite(v) ? v : null, answer: a, ok: isFinite(v) && Math.abs(v - a) <= Math.abs(a) * q.tol }; }); next(1); };
  }

  function casePage(ci) {
    const cs = K.CASES[ci], base = cs.start;
    app.innerHTML = `${bar()}<div class="card"><h2>Part B: ${esc(cs.title)}</h2><div class="story">${cs.story}</div><div class="small muted" style="margin:8px 0 4px">Labs</div>${U.labsHtml(cs.labs, cs.patient.age, null)}
      ${cs.prev ? '<p class="small"><b>Yesterday\'s order is pre-loaded.</b> Edit it to today\'s order.</p>' : ''}</div>${refCard()}<div id="ws"></div>
      ${cs.multis.map((m, mi) => `<div class="card" data-m="${mi}"><p>${m.prompt}</p>${m.options.map((o, oi) => `<label class="opt"><input type="checkbox" value="${oi}"><span>${esc(o.t)}</span></label>`).join('')}</div>`).join('')}
      <div class="actions"><button class="primary" id="nx">${ci === K.CASES.length - 1 ? 'Continue to knowledge check →' : 'Continue to next case →'}</button></div>`;
    const ws = U.Workspace($('#ws'), { blind: true, math: false, flags: false, targets: false, lockPatient: true, lockAccess: true, showRef: S.ref });
    ws.setCase({ pt: cs.patient, o: cs.prev || base, ctx: cs.labs, extra: { fluidGoal: cs.fluidGoal, prevOrder: cs.prev || null } });
    $('#nx').onclick = () => {
      const s = ws.getState(); if (!(num(s.o.rate) > 0) && !confirm('The TPN rate is blank/zero. Submit this order as-is?')) return;
      const r = K.scoreCase(cs, s.o);
      const mres = cs.multis.map((m, mi) => { const picked = Array.from(document.querySelectorAll(`[data-m="${mi}"] input:checked`)).map(x => +x.value); return { id: m.id, picked, score: K.scoreMulti(m, picked), def: m }; });
      S.cases[ci] = { cs, order: s.o, res: r, multis: mres }; next(S.step + 1);
    };
  }
  const num = T.num;

  function mcq() {
    app.innerHTML = `${bar()}<div class="card"><h2>Part C: Knowledge check</h2>${refCard()}
      ${K.MCQ.map((q, i) => `<div style="margin:14px 0"><p><b>${i + 1}.</b> ${esc(q.q)}</p>${q.opts.map((o, oi) => `<label class="opt"><input type="radio" name="m${i}" value="${oi}"><span>${esc(o)}</span></label>`).join('')}</div>`).join('')}
      <div class="actions"><button class="primary" id="nx">Submit and see report</button></div></div>`;
    $('#nx').onclick = () => { S.mcq = K.MCQ.map((q, i) => { const sel = document.querySelector(`input[name=m${i}]:checked`); return { q, given: sel ? +sel.value : null, ok: !!sel && +sel.value === q.ans }; }); next(S.step + 1); };
  }

  function totals() {
    const calcGot = S.calc.filter(x => x.ok).length, mcqGot = S.mcq.filter(x => x.ok).length;
    let caseGot = 0, caseMax = 0; const crits = [];
    S.cases.forEach(c => { caseGot += c.res.earned; caseMax += c.res.max; c.multis.forEach(m => { caseGot += m.score.got; caseMax += m.score.max; }); c.res.crits.forEach(x => crits.push({ caseTitle: c.cs.title, ...x })); });
    const sum = K.summarize({ calcGot, calcMax: K.CALC.length, mcqGot, mcqMax: K.MCQ.length, caseGot, caseMax, crits });
    return { calcGot, mcqGot, caseGot, caseMax, crits, sum };
  }
  const pct = (x) => Math.round(x * 100) + '%';

  function report() {
    const t = totals(), s = t.sum;
    app.innerHTML = `<div class="card"><h1>Report</h1><p>${esc(S.name || 'Unnamed learner')}${S.id ? ' · ' + esc(S.id) : ''} · ${new Date(S.started).toLocaleString()}${S.ref ? ' · reference card allowed' : ''}</p>
      <div class="tiles"><div class="tile"><div class="k">Calculations</div><div class="v">${t.calcGot}/${K.CALC.length}</div><div class="s">need ${Math.ceil(K.PASS.calc * K.CALC.length - 1e-9)}</div></div>
      <div class="tile"><div class="k">Cases</div><div class="v">${pct(s.caseFrac)}</div><div class="s">need ${pct(K.PASS.cases)}</div></div>
      <div class="tile"><div class="k">Knowledge</div><div class="v">${t.mcqGot}/${K.MCQ.length}</div><div class="s">need ${pct(K.PASS.mcq)}</div></div>
      <div class="tile"><div class="k">Critical errors</div><div class="v">${s.crit}</div><div class="s">need 0</div></div></div>
      <p class="score ${s.pass ? 'pass' : 'fail'}">${s.pass ? 'Meets provisional criteria' : 'Does not yet meet provisional criteria'}</p>
      <p class="small muted">Provisional, unvalidated thresholds. Final determination belongs to a qualified local educator.</p>
      <div class="actions"><button class="primary" id="dj">Download transcript (JSON)</button><button id="dt">Download transcript (text)</button><button class="ghost" id="rs">Start over</button></div></div>
      ${t.crits.length ? `<div class="card"><h3 style="margin-top:0">Critical errors</h3>${t.crits.map(x => `<div class="flag crit"><b>⛔ ${esc(x.label)}</b><div class="why">${esc(x.caseTitle)}</div></div>`).join('')}</div>` : ''}
      <div class="card"><h3 style="margin-top:0">Calculations</h3><div class="scroll"><table><tr><th>#</th><th class="n">Yours</th><th class="n">Answer</th><th></th></tr>${S.calc.map((x, i) => `<tr><td>${i + 1}</td><td class="n">${x.given == null ? '—' : T.r(x.given, 2)}</td><td class="n">${T.r(x.answer, 2)} ${esc(x.unit)}</td><td>${x.ok ? '✓' : '✗'}</td></tr>`).join('')}</table></div></div>
      ${S.cases.map(c => `<div class="card"><h3 style="margin-top:0">${esc(c.cs.title)}: ${T.r(c.res.earned, 1)}/${c.res.max}</h3><div class="scroll"><table><tr><th>Item</th><th class="n">Pts</th><th>Why</th></tr>${c.res.items.map(it => `<tr><td>${esc(it.label)}</td><td class="n">${T.r(it.got, 1)}/${it.pts}</td><td class="small muted">${it.f < 1 ? esc(it.why) : ''}</td></tr>`).join('')}</table></div>
        ${c.multis.map(m => `<p class="small"><b>${esc(m.id)}:</b> ${T.r(m.score.got, 1)}/${m.score.max} (${m.score.hits} right, ${m.score.wrong} wrong picks)</p>`).join('')}
        <p class="small muted">Your order: rate ${c.order.rate}, D${c.order.dex}, AA ${c.order.aa}, lipid ${c.order.il}; GIR ${T.r(c.res.calc.gir)}, ${T.r(c.res.calc.totalKcalKg, 0)} kcal/kg, ${T.r(c.res.calc.totalFluids, 0)} mL/kg.</p></div>`).join('')}
      <div class="card"><h3 style="margin-top:0">Knowledge check</h3>${S.mcq.map((x, i) => `<div class="small" style="margin:8px 0"><b>${i + 1}. ${x.ok ? '✓' : '✗'}</b> ${esc(x.q.q)}${x.ok ? '' : `<br>Correct: ${esc(x.q.opts[x.q.ans])}. ${esc(x.q.why)}`}</div>`).join('')}</div>`;
    const payload = () => ({ tool: 'TPN Lab check-off (provisional)', learner: S.name, id: S.id, started: S.started, finished: new Date().toISOString(), referenceAllowed: S.ref, passCriteria: K.PASS, result: { calcGot: t.calcGot, calcMax: K.CALC.length, mcqGot: t.mcqGot, mcqMax: K.MCQ.length, caseFrac: s.caseFrac, criticalErrors: t.crits, meetsProvisional: s.pass },
      calculations: S.calc.map(x => ({ id: x.id, given: x.given, answer: x.answer, ok: x.ok })), cases: S.cases.map(c => ({ id: c.cs.id, order: c.order, earned: c.res.earned, max: c.res.max, items: c.res.items.map(i => ({ id: i.id, got: i.got, pts: i.pts })), crits: c.res.crits, multis: c.multis.map(m => ({ id: m.id, picked: m.picked, got: m.score.got })) })), mcq: S.mcq.map(x => ({ id: x.q.id, given: x.given, ok: x.ok })) });
    const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
    $('#dj').onclick = () => dl('tpn-checkoff-transcript.json', JSON.stringify(payload(), null, 2), 'application/json');
    $('#dt').onclick = () => { const p = payload(); dl('tpn-checkoff-transcript.txt', [`TPN Lab check-off (PROVISIONAL, unvalidated)`, `Learner: ${p.learner} ${p.id}`, `Started: ${p.started}`, `Calculations: ${t.calcGot}/${K.CALC.length}`, `Cases: ${pct(s.caseFrac)}`, `Knowledge: ${t.mcqGot}/${K.MCQ.length}`, `Critical errors: ${t.crits.map(x => x.label).join('; ') || 'none'}`, `Meets provisional criteria: ${s.pass}`].join('\n'), 'text/plain'); };
    $('#rs').onclick = () => { S.calc = []; S.cases = []; S.mcq = []; start(); };
  }
  start();
})();
