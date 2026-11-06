/* Shared UI: Workspace (order entry + live results), LabsPanel, CaseRunner. */
(function (root) {
  'use strict';
  const T = root.TPN, C = root.TPNC;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const f = (x, d = 1) => (typeof x === 'number' && isFinite(x)) ? T.r(x, d).toFixed(d) : '—';
  const num = T.num;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const STAT = { ok: ['ok', 'in range'], low: ['low', 'below'], high: ['high', 'above'] };
  const RANGE_TXT = (k, age) => { const r = T.rangeFor(k, age); return r ? `${r[0]}–${r[1]} ${k === 'phos' ? 'mmol' : 'mEq'}/${r[2] === 'day' ? 'day' : 'kg/d'}` : '—'; };

  /* ---------------- Workspace ---------------- */
  function Workspace(rootEl, cfg) {
    cfg = Object.assign({ blind: false, math: false, flags: true, targets: true, lockPatient: false, lockAccess: false, showRef: true }, cfg || {});
    const S = { pt: { wt: '', age: 'infant' }, o: T.emptyOrder(), ctx: {}, extra: {}, unit: 'kg', raw: {} };
    let readOnly = false;

    const wtN = () => num(S.pt.wt), litersDay = () => num(S.o.rate) * 24 / 1000;
    function rawFromCanon() { T.LYTE_DEFS.forEach(d => { const kg = num(S.o.lytes[d.id]); S.raw[d.id] = S.unit === 'kg' ? kg : (litersDay() > 0 && wtN() > 0 ? kg * wtN() / litersDay() : 0); }); }
    function canonFromRaw() { T.LYTE_DEFS.forEach(d => { const v = num(S.raw[d.id]); S.o.lytes[d.id] = S.unit === 'kg' ? v : (wtN() > 0 && litersDay() > 0 ? v * litersDay() / wtN() : 0); }); }
    const val = (x) => (x === 0 || x === '' || x == null) ? '' : (typeof x === 'number' ? T.r(x, 3) : x);

    function inputField(k, label, unit, o) {
      o = o || {}; const v = k.startsWith('raw.') ? S.raw[k.slice(4)] : k.split('.').reduce((a, p) => a && a[p], S);
      return `<div><label for="f-${k}">${label} ${unit ? `<span class="unit">${unit}</span>` : ''}</label><input id="f-${k}" data-k="${k}" type="number" inputmode="decimal" step="${o.step || 'any'}" min="0" value="${esc(val(v))}" ${o.ph ? `placeholder="${o.ph}"` : ''}></div>`;
    }
    function renderIn() {
      const u = S.unit === 'kg';
      const ly = (ids) => ids.map(d => `<div class="nm">${d.name}<span class="unit"> ${d.unit}</span></div><input data-k="raw.${d.id}" aria-label="${d.name}" type="number" inputmode="decimal" step="any" min="0" value="${esc(val(S.raw[d.id]))}"><div class="bag" data-bag="${d.id}"></div>`).join('');
      rootEl.querySelector('.ws-in').innerHTML = `
      <div class="grp"><div class="grp-t">Patient</div><div class="row two">
        ${inputField('pt.wt', 'Dosing weight', 'kg', { ph: 'e.g. 5.2' })}
        <div><label for="f-pt.age">Age group</label><select id="f-pt.age" data-k="pt.age">${Object.keys(T.AGES).map(a => `<option value="${a}" ${S.pt.age === a ? 'selected' : ''}>${T.AGES[a].label}</option>`).join('')}</select></div></div></div>
      <div class="grp"><div class="grp-t">TPN</div><div class="row">
        ${inputField('o.rate', 'TPN rate', 'mL/hr')}${inputField('o.dex', 'Dextrose', '%')}${inputField('o.aa', 'Amino acids', 'g/kg/day')}${inputField('o.il', 'Lipid (20%)', 'g/kg/day')}</div>
        <label class="chk"><input type="checkbox" data-k="o.cysteine" ${S.o.cysteine ? 'checked' : ''}> L-cysteine added</label>
        <div class="row two" style="margin-top:6px">${inputField('o.carnitine', 'L-carnitine', 'mg/kg/day')}
          <div><label for="f-o.access">Access</label><select id="f-o.access" data-k="o.access"><option value="central" ${S.o.access === 'central' ? 'selected' : ''}>Central</option><option value="peripheral" ${S.o.access === 'peripheral' ? 'selected' : ''}>Peripheral</option></select></div></div>
        <label class="chk"><input type="checkbox" data-k="o.calciumInfusion" ${S.o.calciumInfusion ? 'checked' : ''}> Calcium chloride infusion running</label></div>
      <div class="grp"><div class="grp-t">Other fluids &amp; feeds</div><div class="row">${inputField('o.ivf', 'IVF rate', 'mL/hr')}${inputField('o.feeds.n', 'Feeds / 24 h', '#')}${inputField('o.feeds.vol', 'Volume / feed', 'mL')}${inputField('o.feeds.kcalOz', 'Density', 'kcal/30 mL')}</div></div>
      <div class="grp"><div class="grp-t">Electrolytes <span class="seg" role="group" aria-label="Electrolyte entry units"><button type="button" data-unit="kg" aria-pressed="${u}">per kg/day</button><button type="button" data-unit="L" aria-pressed="${!u}">bag mEq/L</button></span></div>
        <div class="lytes">${ly(T.LYTE_DEFS)}</div>
        <div class="small muted" style="margin-top:6px">${u ? 'Dose entered per kg/day; the right column shows the bag concentration.' : 'Entering the bag label (per L); the right column shows the resulting dose per kg/day.'} Phosphate is mmol; the rest mEq.</div></div>`;
      applyLock();
    }
    function applyLock() {
      $$('input,select,button[data-unit]', rootEl.querySelector('.ws-in')).forEach(el => {
        const k = el.dataset.k; let dis = readOnly;
        if (cfg.lockPatient && (k === 'pt.wt' || k === 'pt.age')) dis = true;
        if (cfg.lockAccess && k === 'o.access') dis = true;
        el.disabled = dis;
      });
    }

    function renderOut() {
      const pt = { wt: wtN(), age: S.pt.age }, o = S.o, blind = cfg.blind;
      const ev = T.evaluate(pt, o, S.ctx, S.extra), c = ev.calc, age = c.age, A = T.AGES[age];
      // bag labels beside lyte inputs
      T.LYTE_DEFS.forEach(d => { const e = rootEl.querySelector(`[data-bag="${d.id}"]`); if (!e) return; e.textContent = S.unit === 'kg' ? (c.perLiter[d.id] > 0 ? f(c.perLiter[d.id], 0) + '/L' : '') : (c.lytes[d.id] > 0 ? f(c.lytes[d.id], 2) + '/kg' : ''); });
      const showT = cfg.targets && !blind;
      const gs = T.girStatus(c), ks = T.kcalStatus(c);
      const tile = (k, v, s, cls) => `<div class="tile ${showT && cls ? cls : ''}"><div class="k">${k}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
      const girBadge = showT && gs !== 'none' ? `<span class="badge b-${gs}">${STAT[gs][1]}</span>` : '';
      const fluidOver = S.extra.fluidGoal && c.totalFluids > S.extra.fluidGoal * 1.001;
      const crits = ev.flags.filter(x => x.sev === 'crit').length;
      const tot = c.tpnKcalKg + c.feedKcalKg || 1;
      const seg = (cls, v) => `<span class="${cls}" style="width:${(v / tot * 100).toFixed(1)}%" title="${f(v, 1)} kcal/kg"></span>`;
      const row = (a, b, cc) => `<tr><td>${a}</td><td class="n">${b}</td><td class="n">${cc}</td></tr>`;
      const lyRow = (nm, key, unitTxt, perLk) => {
        const per = (T.rangeFor(key, age) && T.rangeFor(key, age)[2] === 'day') ? c.perDay[key] : c.tot[key], st = T.rangeStatus(key, age, c);
        const rgTxt = (!blind || cfg.showRef) && T.rangeFor(key, age) ? RANGE_TXT(key, age) : '';
        const b = st && st !== 'none' && showT ? `<span class="badge b-${st === 'ok' ? 'ok' : st === 'low' ? 'low' : 'high'}">${st === 'ok' ? '✓' : st === 'low' ? '▼' : '▲'}</span>` : '';
        return `<tr><td>${nm}</td><td class="n">${f(per, 2)} <span class="unit">${unitTxt}${T.rangeFor(key, age) && T.rangeFor(key, age)[2] === 'day' ? '/day' : '/kg/d'}</span> ${b}</td><td class="n">${perLk > 0 ? f(perLk, 0) : '—'}</td><td class="small muted">${rgTxt}</td></tr>`;
      };
      const flagsHtml = (cfg.flags && !blind) ? (() => {
        const order = { crit: 0, warn: 1, info: 2 };
        const fl = ev.flags.slice().sort((a, b) => order[a.sev] - order[b.sev]);
        return fl.length ? fl.map(x => `<div class="flag ${x.sev}"><b>${x.sev === 'crit' ? '⛔ ' : x.sev === 'warn' ? '⚠ ' : 'ℹ '}${esc(x.text)}</b><div class="why">${esc(x.why)}</div></div>`).join('') : '<div class="callout good">No safety flags for the current order.</div>';
      })() : '';
      const mathHtml = cfg.math ? `<details class="math" open><summary>Show the math (with your numbers)</summary>${T.steps(pt, o).map(s => `<div class="step"><div class="t">${esc(s.t)}</div><div class="f">${esc(s.f)}</div><div class="n">${esc(s.n)}${s.n2 ? '<br>' + esc(s.n2) : ''}</div>${s.why ? `<div class="why">${esc(s.why)}</div>` : ''}</div>`).join('')}</details>` : '';
      rootEl.querySelector('.ws-out').innerHTML = `
      <div class="sticky-sum"><span>GIR ${f(c.gir)}</span><span>${f(c.totalKcalKg, 0)} kcal/kg</span><span>${f(c.totalFluids, 0)} mL/kg${S.extra.fluidGoal ? ' / ' + S.extra.fluidGoal : ''}</span>${(!blind && crits) ? `<span style="color:var(--crit)">⛔ ${crits}</span>` : ''}</div>
      <div class="tiles">
        ${tile('GIR', f(c.gir), `mg/kg/min ${girBadge}${showT ? `<br>goal ${A.gir.join('–')}` : ''}`, gs !== 'none' ? gs : '')}
        ${tile('Total kcal/kg', f(c.totalKcalKg, 0), `PN ${f(c.tpnKcalKg, 0)} + enteral ${f(c.feedKcalKg, 0)}${showT ? `<br>goal ${A.kcal.join('–')}${A.verifyKcal ? ' (verify)' : ''}` : ''}`, ks !== 'none' ? ks : '')}
        ${tile('Total fluids', f(c.totalFluids, 0), `mL/kg/day incl. lipid${S.extra.fluidGoal && showT ? `<br>goal ≤ ${S.extra.fluidGoal}` : ''}`, fluidOver ? 'high' : (S.extra.fluidGoal && c.totalFluids > 0 ? 'ok' : ''))}
        ${tile('Protein / Lipid', `${f(c.aa, 2)} / ${f(c.il, 2)}`, 'g/kg/day', '')}
        ${tile('Est. osmolarity', f(c.osm, 0), `mOsm/L (rough)${o.access === 'peripheral' && showT ? '<br>periph limit ~900' : ''}`, o.access === 'peripheral' && c.osm > 900 ? 'crit' : '')}
      </div>
      <div class="card" style="margin-top:14px"><h3 style="margin-top:0">Where the calories come from</h3>
        <div class="bar" role="img" aria-label="Calorie split">${seg('dex', c.dexKcal / (c.wt || 1))}${seg('aa', c.aaKcal / (c.wt || 1))}${seg('il', c.ilKcal / (c.wt || 1))}${seg('ent', c.feedKcalKg)}</div>
        <div class="legend"><span><i style="background:var(--dex)"></i>Dextrose ${f(c.dexKcal / (c.wt || 1), 0)}</span><span><i style="background:var(--aa)"></i>Protein ${f(c.aaKcal / (c.wt || 1), 0)}</span><span><i style="background:var(--il)"></i>Lipid ${f(c.ilKcal / (c.wt || 1), 0)}</span><span><i style="background:var(--ent)"></i>Enteral ${f(c.feedKcalKg, 0)}</span><span>kcal/kg/day · NPC:N ${c.npcN ? f(c.npcN, 0) + ':1' : '—'}</span></div>
        <div class="scroll"><table style="margin-top:10px"><tr><th></th><th class="n">per day</th><th class="n">per kg/day</th></tr>
          ${row('Dextrose (' + f(c.dexG, 0) + ' g)', f(c.dexKcal, 0) + ' kcal', f(c.dexKcal / (c.wt || 1), 1))}${row('Amino acids (' + f(c.aaG, 1) + ' g)', f(c.aaKcal, 0) + ' kcal', f(c.aaKcal / (c.wt || 1), 1))}${row('Lipid (' + f(c.ilG, 1) + ' g = ' + f(c.lipidMl, 0) + ' mL)', f(c.ilKcal, 0) + ' kcal', f(c.ilKcal / (c.wt || 1), 1))}${row('<b>TPN total</b>', f(c.tpnKcal, 0) + ' kcal', f(c.tpnKcalKg, 1))}${row('Enteral', f(c.feedMl, 0) + ' mL', f(c.feedKcalKg, 1) + ' kcal')}</table></div></div>
      <div class="card"><h3 style="margin-top:0">Fluids (mL/kg/day)</h3><div class="scroll"><table>
          <tr><td>TPN</td><td class="n">${f(c.tpnMlKg, 1)}</td></tr><tr><td>IVF</td><td class="n">${f(c.ivfMlKg, 1)}</td></tr><tr><td>Feeds</td><td class="n">${f(c.feedMlKg, 1)}</td></tr><tr><td>Lipid volume</td><td class="n">${f(c.lipidMlKg, 1)}</td></tr>
          <tr><td><b>Total</b> <span class="unit">(cheat-sheet total ${f(c.sheetTotalFluids, 1)} + lipid)</span></td><td class="n"><b>${f(c.totalFluids, 1)}</b></td></tr></table></div></div>
      <div class="card"><h3 style="margin-top:0">Electrolytes</h3><div class="scroll"><table>
        <tr><th>Total</th><th class="n">Dose</th><th class="n">Bag /L</th><th>${(!blind || cfg.showRef) ? 'Reference' : ''}</th></tr>
        ${lyRow('Sodium', 'na', 'mEq', c.perLiter.na)}${lyRow('Potassium', 'k', 'mEq', c.perLiter.k)}
        <tr><td>Chloride</td><td class="n">${f(c.tot.cl, 2)} <span class="unit">mEq/kg/d</span></td><td class="n">${c.perLiter.cl > 0 ? f(c.perLiter.cl, 0) : '—'}</td><td></td></tr>
        <tr><td>Acetate</td><td class="n">${f(c.tot.acetate, 2)} <span class="unit">mEq/kg/d</span></td><td class="n">${c.perLiter.acetate > 0 ? f(c.perLiter.acetate, 0) : '—'}</td><td></td></tr>
        ${lyRow('Phosphate', 'phos', 'mmol', c.perLiter.phos)}${lyRow('Calcium', 'ca', 'mEq', c.perLiter.ca)}${lyRow('Magnesium', 'mg', 'mEq', c.perLiter.mg)}</table></div>
        <div class="small muted" style="margin-top:8px">Ca:Phos (molar) <b class="mono">${c.caPRatio == null ? '—' : f(c.caPRatio, 2) + ' : 1'}</b> · Phos <b class="mono">${f(c.phosPer100, 2)}</b> mmol/100 mL${(!blind || cfg.showRef) ? ' (keep &lt;2)' : ''}</div></div>
      ${(cfg.flags && !blind) ? `<div class="card"><h3 style="margin-top:0">Safety &amp; considerations ${crits ? `<span class="badge b-crit">${crits} critical</span>` : ''}</h3>${flagsHtml}</div>` : ''}
      ${mathHtml ? `<div class="card">${mathHtml}</div>` : ''}`;
    }

    rootEl.innerHTML = '<div class="ws"><section class="ws-in card"></section><section class="ws-out"></section></div>';
    renderIn(); renderOut();

    const onInput = (e) => {
      const t = e.target, k = t.dataset && t.dataset.k; if (!k) return;
      const v = t.type === 'checkbox' ? t.checked : t.value;
      if (k.startsWith('raw.')) { S.raw[k.slice(4)] = v; canonFromRaw(); }
      else {
        const parts = k.split('.'); let obj = S; for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]; obj[parts[parts.length - 1]] = v;
        if (S.unit === 'L' && (k === 'o.rate' || k === 'pt.wt')) canonFromRaw();
        else if (S.unit === 'kg' && (k === 'o.rate' || k === 'pt.wt')) { /* dose fixed */ }
      }
      renderOut(); api.emit();
    };
    rootEl.addEventListener('input', onInput); rootEl.addEventListener('change', (e) => { if (e.target.tagName === 'SELECT') onInput(e); });
    rootEl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-unit]'); if (!b || readOnly) return;
      const nu = b.dataset.unit; if (nu === S.unit) return;
      canonFromRaw(); S.unit = nu; rawFromCanon(); renderIn(); renderOut();
    });

    const listeners = [];
    const api = {
      cfg, emit() { listeners.forEach(fn => fn(api)); },
      onChange(fn) { listeners.push(fn); },
      getState() { canonFromRaw(); return { pt: { wt: wtN(), age: S.pt.age }, o: T.cloneOrder(S.o) }; },
      calc() { canonFromRaw(); return T.calc({ wt: wtN(), age: S.pt.age }, S.o); },
      setCase(p) {
        if (p.pt) S.pt = { wt: p.pt.wt === 0 ? '' : p.pt.wt, age: p.pt.age };
        if (p.o) S.o = T.cloneOrder(p.o);
        if (p.ctx !== undefined) S.ctx = p.ctx || {};
        if (p.extra !== undefined) S.extra = p.extra || {};
        if (p.unit) S.unit = p.unit;
        rawFromCanon(); renderIn(); renderOut();
      },
      setCtx(ctx) { S.ctx = ctx || {}; renderOut(); },
      setExtra(x) { S.extra = x || {}; renderOut(); },
      setReadOnly(v) { readOnly = !!v; applyLock(); },
      refresh() { renderOut(); }
    };
    return api;
  }

  /* ---------------- Labs panel ---------------- */
  function labsHtml(labs, age, prev) {
    return `<div class="labs">${C.LAB_ORDER.map(k => {
      const ref = T.LAB_REF[k], v = labs[k]; if (v == null) return '';
      const fl = T.labFlag(k, v, age); const p = prev && prev[k] != null ? prev[k] : null;
      const d = p != null && p !== v ? (v > p ? `<span class="d">▲ ${f(v - p, 1)}</span>` : `<span class="d">▼ ${f(p - v, 1)}</span>`) : '';
      return `<div class="lab ${fl === 'low' ? 'low' : fl === 'high' ? 'high' : ''}"><div class="k">${ref.label}</div><div class="v">${v} ${d}</div><div class="r">${ref.unit}${fl === 'low' ? ' · low' : fl === 'high' ? ' · high' : ''}</div></div>`;
    }).join('')}</div><div class="small muted" style="margin-top:6px">Reference ranges are approximate flags only — use your laboratory's ranges.${labs.alb != null && labs.ca != null ? ` Albumin-corrected Ca ≈ ${f(T.correctedCa(labs.ca, labs.alb), 1)} mg/dL.` : ''}</div>`;
  }

  /* ---------------- Case runner (Teach + Learn) ---------------- */
  function CaseRunner(rootEl, cs, opts) {
    opts = Object.assign({ mode: 'teach', onDone: null }, opts || {});
    const learn = opts.mode === 'learn';
    const st = { idx: 0, orders: [], labs: [], notes: [], flags: [] };
    rootEl.innerHTML = `
      <div class="card"><h2>${esc(cs.title)}</h2><p class="lede">${esc(cs.history)}</p>
        <div class="small muted">Fluid goal ${cs.fluidGoal} mL/kg/day (teaching assumption) · ${cs.access} access · all patients fictional</div></div>
      <div class="days" role="tablist"></div><div class="dayinfo"></div><div class="ws-host"></div><div class="actions"></div><div class="feedback"></div>`;
    const ws = Workspace($('.ws-host', rootEl), { math: opts.mode === 'teach' || true, flags: true, targets: true, lockPatient: true, lockAccess: true });
    ws.cfg.math = true;

    function days() {
      $('.days', rootEl).innerHTML = cs.days.map((d, i) => {
        const done = !!st.orders[i], locked = learn && i > st.orders.length;
        return `<button type="button" class="${done ? 'done' : ''}" data-day="${i}" ${i === st.idx ? 'aria-current="true"' : ''} ${locked ? 'disabled' : ''}>Day ${d.n}</button>`;
      }).join('');
    }
    function load(i) {
      st.idx = i;
      const prevOrder = i > 0 ? st.orders[i - 1] || null : null;
      const r = C.labsFor(cs, i, prevOrder); st.labs[i] = r.labs; st.notes[i] = r.notes;
      const d = cs.days[i], committed = st.orders[i];
      const start = committed || C.startOrderForDay(cs, i, prevOrder);
      ws.setCase({ pt: cs.patient, o: start, ctx: r.labs, extra: { fluidGoal: cs.fluidGoal, prevOrder } });
      ws.setReadOnly(!!committed);
      days();
      $('.dayinfo', rootEl).innerHTML = `<div class="card"><h3 style="margin-top:0">${esc(d.title)}</h3>
        <div class="story">${esc(d.narrative)}</div>
        ${r.notes.length ? `<div class="callout bad"><b>Overnight consequences of yesterday's order</b><ul>${r.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
        <div class="small muted" style="margin:8px 0 4px">Labs this morning${i > 0 ? ' (▲▼ = change from yesterday)' : ''}</div>${labsHtml(r.labs, cs.patient.age, i > 0 ? st.labs[i - 1] : null)}
        ${d.feeds ? `<div class="small" style="margin-top:8px"><b>Feeds today:</b> ${d.feeds.n} × ${d.feeds.vol} mL of ${d.feeds.kcalOz} kcal/oz (pre-filled)</div>` : '<div class="small" style="margin-top:8px"><b>Feeds today:</b> NPO</div>'}</div>`;
      actions(); $('.feedback', rootEl).innerHTML = committed ? feedbackHtml(i) : '';
    }
    function actions() {
      const i = st.idx, committed = !!st.orders[i], last = i === cs.days.length - 1;
      $('.actions', rootEl).innerHTML = committed
        ? `${!last ? `<button class="primary" data-act="next">Go to Day ${cs.days[i + 1].n} →</button>` : `<button class="primary" data-act="summary">See case summary</button>`}<button data-act="redo" class="ghost">Redo this day (clears later days)</button>`
        : `<button class="primary" data-act="commit">Commit order for Day ${cs.days[i].n}</button>${!learn || true ? '<button data-act="suggest" class="ghost">Show teaching-default suggestions</button><button data-act="points" class="ghost">Teaching points</button>' : ''}`;
    }
    function feedbackHtml(i) {
      const d = cs.days[i], fl = st.flags[i] || [];
      const crit = fl.filter(x => x.sev === 'crit'), warn = fl.filter(x => x.sev === 'warn');
      return `<div class="card"><h3 style="margin-top:0">Feedback on your Day ${d.n} order</h3>
        ${crit.length ? `<div class="callout bad"><b>${crit.length} critical issue${crit.length > 1 ? 's' : ''}</b>${crit.map(x => `<div>⛔ ${esc(x.text)}<div class="small muted">${esc(x.why)}</div></div>`).join('')}</div>` : '<div class="callout good">No critical safety issues in your order.</div>'}
        ${warn.length ? `<div class="callout"><b>Worth a second look</b>${warn.map(x => `<div>⚠ ${esc(x.text)}<div class="small muted">${esc(x.why)}</div></div>`).join('')}</div>` : ''}
        <details open><summary>Teaching points for this day</summary><ul>${d.teach.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p><b>Debrief:</b> ${esc(d.debrief)}</p></details>
        <details><summary>Teaching-default suggestions for the labs you saw</summary>${sugHtml(st.orders[i], st.labs[i])}</details></div>`;
    }
    function sugHtml(order, labs) {
      const s = T.suggestNext(cs.patient, order, labs);
      return s.length ? s.map(x => `<div class="sug"><div class="a">${esc(x.area)}</div><div>${esc(x.action)}</div><div class="r">${esc(x.reason)} <span class="tag tag-${/sheet/.test(x.rule) ? 's' : /verify|common/.test(x.rule) ? 'c' : 'd'}">${esc(x.rule)}</span></div></div>`).join('') : '<p class="muted">Enter a weight and rate to see suggestions.</p>';
    }
    function summary() {
      const rows = cs.days.map((d, i) => { const c = T.calc(cs.patient, st.orders[i]); const fl = st.flags[i] || [];
        return `<tr><td>Day ${d.n}</td><td class="n">${f(c.gir)}</td><td class="n">${f(c.aa, 2)}</td><td class="n">${f(c.il, 2)}</td><td class="n">${f(c.totalKcalKg, 0)}</td><td class="n">${f(c.totalFluids, 0)}</td><td class="n">${fl.filter(x => x.sev === 'crit').length}</td></tr>`; }).join('');
      const totalCrit = st.flags.reduce((a, fl) => a + (fl || []).filter(x => x.sev === 'crit').length, 0);
      $('.feedback', rootEl).innerHTML = `<div class="card"><h2>Case summary</h2><div class="scroll"><table><tr><th>Day</th><th class="n">GIR</th><th class="n">AA</th><th class="n">Lipid</th><th class="n">kcal/kg</th><th class="n">mL/kg</th><th class="n">Critical</th></tr>${rows}</table></div>
        <p class="${totalCrit ? 'fail' : 'pass'}"><b>${totalCrit ? totalCrit + ' critical flag(s) across the case — review the days above.' : 'No critical safety flags across the case.'}</b></p></div>`;
      if (opts.onDone) opts.onDone({ crit: totalCrit });
    }

    rootEl.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || !rootEl.contains(b)) return;
      if (b.dataset.day != null) { load(+b.dataset.day); return; }
      const act = b.dataset.act, i = st.idx;
      if (act === 'commit') {
        const s = ws.getState(); if (!(s.pt.wt > 0) || !(num(s.o.rate) > 0)) { $('.feedback', rootEl).innerHTML = '<div class="callout bad">Enter a TPN rate before committing the order.</div>'; return; }
        st.orders[i] = s.o; st.flags[i] = T.evaluate(cs.patient, s.o, st.labs[i], { fluidGoal: cs.fluidGoal, prevOrder: i > 0 ? st.orders[i - 1] : null }).flags;
        // drop stale later days if redoing
        st.orders.length = i + 1; ws.setReadOnly(true); days(); actions(); $('.feedback', rootEl).innerHTML = feedbackHtml(i);
      } else if (act === 'next') { load(i + 1); window.scrollTo({ top: rootEl.offsetTop - 10, behavior: 'smooth' }); }
      else if (act === 'redo') { st.orders.length = i; st.flags.length = i; load(i); }
      else if (act === 'summary') summary();
      else if (act === 'suggest') { const s = ws.getState(); $('.feedback', rootEl).innerHTML = `<div class="card"><h3 style="margin-top:0">Teaching-default suggestions (based on today's labs and your current order)</h3><p class="small muted">Defaults to compare your thinking against — not a protocol. Replace with TCPCHD / Dell Children's guidance.</p>${sugHtml(s.o, st.labs[i])}</div>`; }
      else if (act === 'points') { const d = cs.days[i]; $('.feedback', rootEl).innerHTML = `<div class="card"><h3 style="margin-top:0">Teaching points — Day ${d.n}</h3><ul>${d.teach.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`; }
    });
    load(0);
    return { load, state: st, ws };
  }

  root.TPNUI = { esc, f, $, $$, Workspace, labsHtml, CaseRunner, RANGE_TXT };
})(typeof window !== 'undefined' ? window : globalThis);
