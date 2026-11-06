/* CICU TPN Lab — calculation + rules engine.
   Formulas follow the TCPCHD "TPN & TF Cheat Sheet" (6/30/23). Where this engine goes beyond the sheet
   it is marked  [BEYOND SHEET]. Everything here is educational; pharmacy compounding values govern. */
(function (root) {
  'use strict';

  const KCAL = { dex: 3.4, aa: 4, il: 10 };      // kcal per g  (sheet)
  const IL_ML_PER_G = 5;                         // 20% lipid emulsion: 0.2 g/mL  [BEYOND SHEET]
  const NA_PER_MMOL_PHOS = 4 / 3;                // sodium phosphate: 4 mEq Na per 3 mmol phos [BEYOND SHEET]
  const K_PER_MMOL_PHOS = 1.5;                   // potassium phosphate: 1 mmol = 1.5 mEq K (sheet)

  const AGES = {
    // kcal = parenteral goal. Infant 90–110 PN-only (CCU CHD guideline; the sheet says 85–105), rising toward 120–150 when fed enterally (blend in kcalRange).
    // Child 1–7 yr 75–90, 7–12 yr 50–75 (Dell Children's TPN slides / Neo-Pedia table). Adolescent 30–50.
    infant:     { label: 'Infant (<1 yr)',      gir: [12, 14], kcal: [90, 110], kcalEnt: [120, 150], aa: [3, 4],     ilMax: 3.5, girStep: '2–4 (neonates 1–2)', verifyKcal: false },
    child:      { label: 'Child (1–10 yr)',     gir: [8, 10],  kcal: [75, 90],  kcalEnt: [75, 90],   aa: [1, 2],     ilMax: 3,   girStep: '2–4',                verifyKcal: false },
    adolescent: { label: 'Adolescent (>35 kg)', gir: [5, 6],   kcal: [30, 50],  kcalEnt: [30, 50],   aa: [0.8, 1.5], ilMax: 2.5, girStep: '1–2',                verifyKcal: false }
  };
  // gir + infant/adolescent kcal: cheat sheet. child kcal and all aa goals: commonly cited (ASPEN-style) — VERIFY locally.

  const LYTE_DEFS = [
    { id: 'naCl',   name: 'Sodium chloride',     unit: 'mEq',  grp: 'Sodium' },
    { id: 'naAc',   name: 'Sodium acetate',      unit: 'mEq',  grp: 'Sodium' },
    { id: 'kCl',    name: 'Potassium chloride',  unit: 'mEq',  grp: 'Potassium' },
    { id: 'kAc',    name: 'Potassium acetate',   unit: 'mEq',  grp: 'Potassium' },
    { id: 'naPhos', name: 'Sodium phosphate',    unit: 'mmol', grp: 'Phosphate' },
    { id: 'kPhos',  name: 'Potassium phosphate', unit: 'mmol', grp: 'Phosphate' },
    { id: 'mg',     name: 'Magnesium sulfate',   unit: 'mEq',  grp: 'Magnesium' },
    { id: 'ca',     name: 'Calcium gluconate',   unit: 'mEq',  grp: 'Calcium' }
  ];

  // Total-electrolyte ranges from the cheat sheet: [min, max, basis]  basis 'kg' = per kg/day, 'day' = per day
  const RANGES = {
    na:   { infant: [2, 5, 'kg'],     child: [2, 5, 'kg'],     adolescent: [1, 2, 'kg'] },
    k:    { infant: [2, 4, 'kg'],     child: [2, 4, 'kg'],     adolescent: [1, 2, 'kg'] },
    phos: { infant: [0.5, 2, 'kg'],   child: [0.5, 2, 'kg'],   adolescent: [10, 40, 'day'] },
    mg:   { infant: [0.3, 0.5, 'kg'], child: [0.3, 0.5, 'kg'], adolescent: [10, 30, 'day'] },
    ca:   { infant: [0.5, 4, 'kg'],   child: [0.5, 4, 'kg'],   adolescent: [10, 20, 'day'] }
  };

  // Minor / major adjustment steps from the cheat sheet ("HOW TO ADJUST ELECTROLYTES")
  const ADJUST = {
    na:      { minor: '½NS → ¾NS → NS, or +1–2 mEq/kg/day', major: '½NS → NS, or +3–4 mEq/kg/day', bolus: 'NS 20 mL/kg' },
    k:       { minor: '+1 mEq/kg/day (or +10 mEq/L)',       major: '+1.5–2 mEq/kg/day (20 mEq/L)', bolus: 'IV replacement 0.5–1 mEq/kg/dose infused at 0.3–0.5 mEq/kg/hr (max 1 mEq/kg/hr) — an infusion, never a push; the sheet table prints "1 mEq/kg/dose"' },
    acetate: { minor: '+1 mEq/kg/day',                      major: '+2 mEq/kg/day',                bolus: '1 mEq/kg/dose' },
    phos:    { minor: '+0.25 mmol/kg/day',                  major: '+0.5 mmol/kg/day',             bolus: '0.25–0.5 mmol/kg/dose' },
    mg:      { minor: '+0.3 mEq/kg/day',                    major: '+0.5 mEq/kg/day',              bolus: '25–50 mg/kg/dose of MgSO₄ salt; slides also give a 0.2–0.4 mEq/kg rider if Mg <1.5' },
    ca:      { minor: '+1 mEq/kg/day',                      major: '+2 mEq/kg/day',                bolus: '50–200 mg/kg/day of calcium gluconate SALT in 1–4 divided doses (Dell Children\'s slides) — mg of salt, not mEq of element' }
  };

  // Approximate lab reference ranges for flagging only. VERIFY against your laboratory.
  const LAB_REF = {
    na:   { label: 'Na',   unit: 'mmol/L', lo: 135, hi: 145 },
    k:    { label: 'K',    unit: 'mmol/L', lo: 3.5, hi: 5.0, hiInfant: 5.5 },
    cl:   { label: 'Cl',   unit: 'mmol/L', lo: 98,  hi: 108 },
    co2:  { label: 'CO₂',  unit: 'mmol/L', lo: 20,  hi: 28 },
    bun:  { label: 'BUN',  unit: 'mg/dL',  lo: 5,   hi: 18 },
    cr:   { label: 'Creatinine', unit: 'mg/dL', lo: 0.2, hi: 0.6, hiChild: 0.7, hiAdolescent: 1.0 },
    glu:  { label: 'Glucose', unit: 'mg/dL', lo: 70, hi: 180 },
    ca:   { label: 'Total Ca', unit: 'mg/dL', lo: 8.5, hi: 10.5 },
    ica:  { label: 'Ionized Ca', unit: 'mmol/L', lo: 1.10, hi: 1.40 },
    phos: { label: 'Phos', unit: 'mg/dL',  lo: 4.5, hi: 6.7, loChild: 4.0, hiChild: 6.0, loAdolescent: 3.0, hiAdolescent: 5.0 },
    mg:   { label: 'Mg',   unit: 'mg/dL',  lo: 1.6, hi: 2.4 },
    alb:  { label: 'Albumin', unit: 'g/dL', lo: 3.0, hi: 5.0 },
    tg:   { label: 'Triglycerides', unit: 'mg/dL', lo: 0, hi: 200 },
    dbili:{ label: 'Direct bili', unit: 'mg/dL', lo: 0, hi: 1.0 },
    alt:  { label: 'ALT',  unit: 'U/L',    lo: 0, hi: 45 },
    uop:  { label: 'Urine output', unit: 'mL/kg/hr', lo: 1, hi: 99 }
  };

  const num = (x) => { const v = parseFloat(x); return isFinite(v) ? v : 0; };
  const r = (x, d = 1) => { const m = Math.pow(10, d); return Math.round(x * m) / m; };

  function emptyOrder() {
    return {
      rate: 0, dex: 0, aa: 0, il: 0, ivf: 0, cysteine: false, carnitine: 0,
      access: 'central', calciumInfusion: false,
      lytes: { naCl: 0, naAc: 0, kCl: 0, kAc: 0, naPhos: 0, kPhos: 0, mg: 0, ca: 0 },
      feeds: { n: 0, vol: 0, kcalOz: 0 }
    };
  }
  function cloneOrder(o) { return JSON.parse(JSON.stringify(o)); }

  /** Core calculations — each line mirrors a cell formula from the cheat sheet. */
  function calc(pt, o) {
    const wt = num(pt.wt), age = pt.age || 'infant';
    const rate = num(o.rate), dex = num(o.dex), aa = num(o.aa), il = num(o.il), ivf = num(o.ivf);
    const f = o.feeds || {}, fn = num(f.n), fvol = num(f.vol), fk = num(f.kcalOz);
    const L = o.lytes || {};
    const ly = {}; LYTE_DEFS.forEach(d => { ly[d.id] = num(L[d.id]); });

    const tpnL = (rate * 24) / 1000;                                   // B4
    const gir = wt > 0 ? (dex * rate) / wt / 6 : 0;                    // E2
    const dexG = (dex / 100) * rate * 24;
    const dexKcal = dex * 0.01 * (rate * 24) * KCAL.dex;               // E4
    const aaG = aa * wt, aaKcal = aaG * KCAL.aa;                       // E5
    const ilG = il * wt, ilKcal = ilG * KCAL.il;                       // E6
    const tpnKcal = dexKcal + aaKcal + ilKcal;                         // E7
    const tpnKcalKg = wt > 0 ? tpnKcal / wt : 0;                       // E8

    const feedMl = fn * fvol;
    const feedKcalKg = wt > 0 ? (fn * fvol / 30 * fk) / wt : 0;        // E10 (kcal per 30 mL = kcal/oz)
    const feedMlKg = wt > 0 ? feedMl / wt : 0;                         // E12
    const tpnIvfMlKg = wt > 0 ? ((rate + ivf) * 24) / wt : 0;          // E14 (sheet adds IVF rate to TPN rate)
    const sheetTotalFluids = tpnIvfMlKg + feedMlKg;                    // E15
    const lipidMl = ilG * IL_ML_PER_G;                                 // [BEYOND SHEET]
    const lipidMlKg = wt > 0 ? lipidMl / wt : 0;
    const totalFluids = sheetTotalFluids + lipidMlKg;                  // incl. lipid volume
    const totalKcalKg = tpnKcalKg + feedKcalKg;                        // E11

    // Electrolytes
    const tot = {
      na: ly.naCl + ly.naAc + ly.naPhos * NA_PER_MMOL_PHOS,            // sheet omits Na from Na-phos [BEYOND SHEET]
      k: ly.kCl + ly.kAc + ly.kPhos * K_PER_MMOL_PHOS,                 // sheet: KCl + KAc + 1.5 × KPhos
      cl: ly.naCl + ly.kCl,
      acetate: ly.naAc + ly.kAc,
      phos: ly.naPhos + ly.kPhos,
      mg: ly.mg, ca: ly.ca
    };
    const perLiter = {};
    Object.keys(ly).concat(Object.keys(tot)).forEach(k => {
      const kg = (k in ly) ? ly[k] : tot[k];
      perLiter[k] = tpnL > 0 ? (kg * wt) / tpnL : 0;                    // H = I × wt / TPN L/day
    });
    const perDay = {}; Object.keys(tot).forEach(k => { perDay[k] = tot[k] * wt; });

    const caMmolKg = tot.ca / 2;                                       // Ca gluconate: 1 mmol = 2 mEq
    const caPRatio = tot.phos > 0 ? caMmolKg / tot.phos : null;        // molar Ca:Phos
    const phosPer100 = tpnL > 0 ? (tot.phos * wt) / (tpnL * 10) : 0;  // mmol phos per 100 mL TPN

    const aaPct = rate > 0 ? aaG / (rate * 24 / 100) : 0;              // g AA per 100 mL
    const osm = dex * 50.5 + aaPct * 100 + 2 * (perLiter.na + perLiter.k + perLiter.ca + perLiter.mg); // rough estimate [BEYOND SHEET]
    const cysteineMg = o.cysteine ? aaG * 40 : 0;                      // 40 mg per g amino acid (Dell Children's slides / pharmacy tips)
    const nitrogen = aaG / 6.25;
    const npcN = nitrogen > 0 ? (dexKcal + ilKcal) / nitrogen : 0;

    const kcalSplit = tpnKcal > 0 ? { dex: dexKcal / tpnKcal, aa: aaKcal / tpnKcal, il: ilKcal / tpnKcal } : { dex: 0, aa: 0, il: 0 };

    return {
      wt, age, rate, dex, aa, il, ivf, tpnL, gir, dexG, dexKcal, aaG, aaKcal, ilG, ilKcal, tpnKcal, tpnKcalKg,
      feedMl, feedKcalKg, feedMlKg, tpnIvfMlKg, sheetTotalFluids, lipidMl, lipidMlKg, totalFluids, totalKcalKg,
      tpnMlKg: wt > 0 ? rate * 24 / wt : 0, ivfMlKg: wt > 0 ? ivf * 24 / wt : 0,
      lytes: ly, tot, perLiter, perDay, caMmolKg, caPRatio, phosPer100, aaPct, osm, nitrogen, npcN, kcalSplit, cysteineMg,
      years: pt.years == null || pt.years === '' ? null : num(pt.years),
      feedPctKcal: totalKcalKg > 0 ? feedKcalKg / totalKcalKg : 0
    };
  }

  function rangeFor(key, age) { const t = RANGES[key]; return t ? t[age] : null; }
  function rangeStatus(key, age, c) {
    const rg = rangeFor(key, age); if (!rg) return null;
    const v = rg[2] === 'day' ? c.perDay[key] : c.tot[key];
    if (v <= 0) return 'none';
    return v < rg[0] ? 'low' : v > rg[1] ? 'high' : 'ok';
  }
  function girStatus(c) { const g = AGES[c.age].gir; return c.gir <= 0 ? 'none' : c.gir < g[0] ? 'low' : c.gir > g[1] ? 'high' : 'ok'; }
  /** Calorie goal for the current order. Infants blend 90–110 (PN) toward 120–150 (enteral) by the enteral share of calories.
      Children use 7–12 yr 50–75 when an age in years ≥7 is entered, otherwise 1–7 yr 75–90. */
  function kcalRange(c) {
    const A = AGES[c.age];
    if (c.age === 'child' && c.years != null && c.years >= 7) return [50, 75];
    const s = c.feedPctKcal || 0;
    return [Math.round(A.kcal[0] * (1 - s) + A.kcalEnt[0] * s), Math.round(A.kcal[1] * (1 - s) + A.kcalEnt[1] * s)];
  }
  function kcalStatus(c) { const g = kcalRange(c); return c.totalKcalKg <= 0 ? 'none' : c.totalKcalKg < g[0] ? 'low' : c.totalKcalKg > g[1] ? 'high' : 'ok'; }

  /** Albumin-corrected total calcium (mg/dL). Ionized Ca is preferred in critically ill children. */
  function correctedCa(ca, alb) { return ca + 0.8 * (4 - alb); }

  function labFlag(key, val, age) {
    const ref = LAB_REF[key]; if (!ref || val == null) return 'na';
    let lo = ref.lo, hi = ref.hi;
    if (key === 'k' && age === 'infant') hi = ref.hiInfant;
    if (key === 'cr') { if (age === 'child') hi = ref.hiChild; if (age === 'adolescent') hi = ref.hiAdolescent; if (age !== 'infant') lo = 0.3; }
    if (key === 'phos') { if (age === 'child') { lo = ref.loChild; hi = ref.hiChild; } if (age === 'adolescent') { lo = ref.loAdolescent; hi = ref.hiAdolescent; } }
    return val < lo ? 'low' : val > hi ? 'high' : 'ok';
  }

  /** Safety / consideration rules. ctx = latest labs (+ optional prior order for "advancing" checks). */
  function evaluate(pt, o, ctx, extra) {
    ctx = ctx || {}; extra = extra || {};
    const c = calc(pt, o), age = c.age, flags = [];
    const add = (sev, id, text, why) => flags.push({ sev, id, text, why });
    const prev = extra.prevOrder ? calc(pt, extra.prevOrder) : null;

    if (c.wt <= 0) { add('info', 'wt', 'Enter a dosing weight to begin.', 'Every TPN calculation is per kg.'); return { calc: c, flags }; }

    // Glucose / dextrose
    const gs = girStatus(c);
    if (gs === 'high') add('warn', 'gir-high', `GIR ${r(c.gir)} is above the ${AGES[age].gir.join('–')} mg/kg/min goal.`, 'Above oxidation capacity, excess glucose becomes fat and CO₂ — hyperglycemia, hepatic steatosis, higher CO₂ load (caution in respiratory failure).');
    if (gs === 'low' && c.dex > 0) add('info', 'gir-low', `GIR ${r(c.gir)} is below the ${AGES[age].gir.join('–')} mg/kg/min goal.`, 'Fine early in advancement — confirm you are advancing toward goal as glucose allows.');
    if (c.gir > 0 && c.gir < 2.5) add('warn', 'gir-vlow', 'GIR is very low — hypoglycemia risk if no other dextrose source.', 'Infants have limited glycogen stores and depend on a steady glucose supply.');
    if (ctx.glu != null && ctx.glu > 180 && prev && c.gir > prev.gir + 0.01) add('crit', 'adv-hyperglycemia', `Glucose ${ctx.glu} mg/dL and GIR was advanced.`, 'Hold dextrose advancement while hyperglycemic; consider lowering GIR and/or insulin per protocol.');
    else if (ctx.glu != null && ctx.glu > 180) add('warn', 'hyperglycemia', `Glucose ${ctx.glu} mg/dL (>180).`, 'Do not advance dextrose; reassess GIR, steroids, sepsis, stress response; consider insulin.');
    if (ctx.glu != null && ctx.glu < 60) add('crit', 'hypoglycemia', `Glucose ${ctx.glu} mg/dL (<60).`, 'Treat per hypoglycemia protocol and reassess dextrose delivery.');

    // Amino acids
    if (age === 'infant' && c.aa > 0 && !o.cysteine) add('warn', 'cysteine', 'Infant <1 yr on amino acids without L-cysteine.', 'Cheat sheet: if <1 year, must add L-cysteine (conditionally essential in infants; also acidifies solution, helping Ca/Phos solubility).');
    if (ctx.bun != null && ctx.bun >= 30 && c.aa > 0) add('warn', 'bun-aa', `BUN ${ctx.bun} (≥30) while on ${r(c.aa, 2)} g/kg/day amino acids.`, 'Cheat sheet: decrease protein by 0.5–1 g/kg/day when BUN ≥30; monitor closely in renal/hepatic dysfunction.');
    if (ctx.bun != null && ctx.bun >= 30 && prev && c.aa > prev.aaG / prev.wt + 0.01) add('crit', 'adv-aa-bun', 'Amino acids advanced while BUN ≥30.', 'Advancing protein in azotemia worsens BUN — reduce rather than advance.');
    const aaG = AGES[age].aa; if (c.aa > aaG[1] + 0.5) add('warn', 'aa-high', `AA ${r(c.aa, 2)} g/kg/day exceeds the usual ${aaG.join('–')} g/kg/day range for this age.`, 'Commonly cited ranges — verify against your protocol.');

    // Lipid
    if (ctx.tg != null) {
      if (ctx.tg > 300 && c.il > 0) add('crit', 'tg-hold-il', `TG ${ctx.tg} mg/dL (>300) with lipid running at ${r(c.il, 2)} g/kg/day.`, 'Cheat sheet: hold lipid if TG >300. Reassess dextrose load, sepsis, steroids, propofol/other lipid sources, and consider carnitine.');
      else if (ctx.tg >= 200 && prev && c.il > prev.ilG / prev.wt + 0.01) add('crit', 'adv-il-tg', `TG ${ctx.tg} mg/dL (200–300) and lipid was advanced.`, 'Cheat sheet: hold advancement of lipid if TG 200–300.');
      else if (ctx.tg >= 200) add('warn', 'tg-borderline', `TG ${ctx.tg} mg/dL (200–300).`, 'Hold lipid advancement; recheck TG after steady rate. Institutional thresholds vary.');
    }
    if (c.il > AGES[age].ilMax) add('crit', 'il-max', `Lipid ${r(c.il, 2)} g/kg/day is above the usual ${AGES[age].ilMax} g/kg/day ceiling for this age.`, 'Dell Children\'s slides: infants goal 3–3.5, children 2–3, adolescents 1–2.5 g/kg/day (max 500 mL/day). Higher doses risk hypertriglyceridemia and liver injury.');
    if (c.il === 0 && c.aa > 0) add('info', 'efad', 'No lipid in this order.', 'Essential fatty acid deficiency can develop if lipid is absent for more than about a week or two. Roughly 0.5 g/kg/day, or 8–10% of PN calories as fat, prevents it (pharmacy tips / Dell slides). Hold lipid for high TG, but plan a minimum dose.');
    if (ctx.tg != null && ctx.tg >= 200 && age === 'infant' && num(o.carnitine) === 0) add('info', 'carnitine', 'Consider L-carnitine 10 mg/kg/day (up to 20) for infants with elevated TG.', 'Sheet: helps lower TG. CCU CHD guideline: consider 10 mg/kg/day if TG ≥250 or the infant is NPO >14 days. PN contains no carnitine, yet long-chain fat transport needs it.');
    if (num(o.carnitine) > 20) add('warn', 'carnitine-high', 'L-carnitine above 20 mg/kg/day.', 'Cheat sheet range is 10 up to 20 mg/kg/day for infants.');

    // Calcium / phosphate
    if (o.calciumInfusion && c.tot.phos > 0) add('crit', 'ca-gtt-phos', 'Phosphate in TPN while a calcium chloride infusion is running.', 'Cheat sheet: DO NOT ADD PHOS IF ON CaCl gtt — calcium-phosphate precipitation in the line is life-threatening.');
    if (c.phosPer100 >= 2) add('crit', 'phos-100', `Phosphate ${r(c.phosPer100, 2)} mmol/100 mL (≥2).`, 'Cheat sheet: keep phos <2 mmol/100 mL — precipitates with calcium.');
    if (c.tot.ca > 0 && c.tot.phos > 0 && c.caPRatio != null && (c.caPRatio < 0.6 || c.caPRatio > 1.6)) add('info', 'cap-ratio', `Ca:Phos molar ratio ${r(c.caPRatio, 2)}:1.`, 'Cheat sheet: try to match 1:1 for bone mineralization if lytes allow. Remember Ca gluconate is mEq (1 mmol = 2 mEq) while phos is mmol.');
    if (ctx.alb != null && ctx.ca != null) { const cc = correctedCa(ctx.ca, ctx.alb); if (Math.abs(cc - ctx.ca) >= 0.4) add('info', 'alb-ca', `Albumin ${ctx.alb}: corrected Ca ≈ ${r(cc, 1)} mg/dL (measured ${ctx.ca}).`, 'Cheat sheet note: as albumin falls, more Ca is free — consider albumin correction; ionized Ca is preferred when available.'); }

    // Potassium / renal
    if (ctx.k != null && ctx.k > (age === 'infant' ? 5.5 : 5.0) && c.tot.k > 0) add('crit', 'hyperK', `K ${ctx.k} with ${r(c.tot.k, 2)} mEq/kg/day K in TPN.`, 'Remove or minimize K until K normalizes; check renal function, hemolysis, acidosis.');
    if (ctx.uop != null && ctx.uop < 1 && c.tot.k > 0) add('warn', 'oliguria-K', `Urine output ${ctx.uop} mL/kg/hr with K in TPN.`, 'Be conservative with K, phos and Mg in renal dysfunction.');
    if (ctx.cr != null && labFlag('cr', ctx.cr, age) === 'high' && (c.tot.k > 0 || c.tot.phos > 0 || c.tot.mg > 0)) add('warn', 'renal-lytes', 'Elevated creatinine with K/Phos/Mg in TPN.', 'Cheat sheet: renal dysfunction → be conservative with K, Phos, Mag.');

    // Range checks (cheat sheet)
    [['na', 'Sodium'], ['k', 'Potassium'], ['phos', 'Phosphate'], ['mg', 'Magnesium'], ['ca', 'Calcium']].forEach(([k, nm]) => {
      const st = rangeStatus(k, age, c), rg = rangeFor(k, age);
      if (st === 'high') add('warn', k + '-range-high', `${nm} above the usual range (${rg[0]}–${rg[1]} ${k === 'phos' ? 'mmol' : 'mEq'}/${rg[2] === 'day' ? 'day' : 'kg/day'}).`, 'Cheat sheet reference range for this age group.');
    });

    // Access / osmolarity
    if (o.access === 'peripheral') {
      if (c.osm > 1100) add('crit', 'periph-osm', `Estimated osmolarity ≈ ${Math.round(c.osm)} mOsm/L via peripheral line.`, 'Dell Children\'s TPN slides: peripheral limit 1100 mOsm/L (other centers use ~900). Hyperosmolar PN causes phlebitis and infiltration injury.');
      else if (c.osm >= 900) add('warn', 'periph-osm-near', `Estimated osmolarity ≈ ${Math.round(c.osm)} mOsm/L — at or above ~900.`, 'Some centers cap peripheral PN near 900 mOsm/L; Dell Children\'s slides use 1100. Know your pharmacy\'s limit.');
      if (c.perLiter.k > 40) add('crit', 'periph-k', `Potassium ${Math.round(c.perLiter.k)} mEq/L via peripheral line (limit 40).`, 'Dell Children\'s slides: peripheral PN max potassium 40 mEq/L. Concentrated potassium injures small veins.');
      if (c.perLiter.ca > 13.5) add('crit', 'periph-ca', `Calcium ${r(c.perLiter.ca, 1)} mEq/L via peripheral line (limit 13.5).`, 'Dell Children\'s slides: peripheral PN max calcium 13.5 mEq/L. Calcium extravasation causes tissue necrosis.');
      if (c.dex > 12.5) add('crit', 'periph-dex', `Dextrose ${c.dex}% via peripheral line.`, 'Peripheral PN is generally limited to ≤12.5% dextrose — VERIFY policy.');
    }

    // Fluids
    if (extra.fluidGoal && c.totalFluids > extra.fluidGoal * 1.001) add('warn', 'fluid-over', `Total fluids ${r(c.totalFluids, 0)} mL/kg/day exceed the ${extra.fluidGoal} mL/kg/day goal (includes lipid volume).`, 'Cardiac patients are often fluid-restricted — concentrate TPN, review IVF/flushes/drips, and confirm the goal with the team.');
    if (c.lipidMlKg > 0 && extra.fluidGoal) add('info', 'lipid-volume', `Lipid adds ${r(c.lipidMl, 0)} mL/day (${r(c.lipidMlKg, 1)} mL/kg/day).`, 'Lipid volume counts toward total fluids when run separately — the cheat sheet total does not include it.');

    // Calories
    if (kcalStatus(c) === 'high') add('warn', 'kcal-high', `Total ${r(c.totalKcalKg, 0)} kcal/kg/day is above the ${kcalRange(c).join('–')} goal.`, 'Overfeeding raises CO₂ production and risks steatosis. Parenteral needs run about 10% below enteral (no energy spent on digestion and absorption).');
    if (age === 'child') { /* child kcal target flagged in UI as "verify" */ }

    // Enteral transition
    if (c.feedKcalKg > 0 && c.feedPctKcal >= 0.5 && c.tpnKcalKg > 0) add('info', 'wean', `Enteral feeds provide ${Math.round(c.feedPctKcal * 100)}% of calories.`, 'Plan the TPN wean as feeds advance (commonly ≥50% enteral → wean; ≥75% → stop).');
    if (c.feedMlKg >= 80 && c.il > 1.01 && c.tpnKcalKg > 0) add('info', 'cardiac-wean-lipid', `Enteral feeds are ${r(c.feedMlKg, 0)} mL/kg/day.`, 'CCU CHD feeding guideline: at 80–100 mL/kg/day of feeds drop lipid to 1 g/kg/day; at about 120 mL/kg/day stop TPN and lipid.');
    if (c.feedMlKg >= 120 && c.tpnKcalKg > 0) add('info', 'cardiac-wean-stop', `Enteral feeds are ${r(c.feedMlKg, 0)} mL/kg/day.`, 'CCU CHD feeding guideline: stop TPN and lipid at about 120 mL/kg/day of feeds.');
    if (ctx.diuretic && c.tot.acetate > 0) add('info', 'diuretic-acetate', 'Loop diuretic on board with acetate in the PN.', 'Pharmacy tips: patients on furosemide waste chloride, so the PN should be all chloride. Use acetate only for acidosis or high chloride.');

    // Cardiac-specific reminders always shown as info when TPN running
    return { calc: c, flags };
  }

  /** Teaching-default next-day suggestion. NOT a protocol. */
  function suggestNext(pt, o, ctx) {
    ctx = ctx || {};
    const c = calc(pt, o), age = c.age, wt = c.wt, out = [];
    const sug = (area, action, reason, rule) => out.push({ area, action, reason, rule: rule || 'teaching default' });
    if (wt <= 0 || c.tpnL <= 0) return out;
    const goal = AGES[age].gir;

    // Dextrose
    if (ctx.glu != null && ctx.glu > 250) sug('Dextrose', `Reduce GIR by 1–2 mg/kg/min (from ${r(c.gir)} → ~${r(Math.max(c.gir - 1.5, 2.5))}).`, `Glucose ${ctx.glu} mg/dL — marked hyperglycemia. Consider insulin per protocol.`, 'teaching default');
    else if (ctx.glu != null && ctx.glu > 180) sug('Dextrose', `Hold GIR at ${r(c.gir)} mg/kg/min.`, `Glucose ${ctx.glu} mg/dL (>180) — do not advance.`, 'teaching default');
    else if (c.gir >= goal[1]) sug('Dextrose', `At goal — hold GIR ${r(c.gir)}.`, `Goal ${goal.join('–')} mg/kg/min for this age.`, 'cheat sheet goal');
    else { const step = age === 'adolescent' ? 1.5 : 2; const next = Math.min(c.gir + step, goal[1]); sug('Dextrose', `Advance GIR by ~${step} mg/kg/min (usual daily step ${AGES[age].girStep}; ${r(c.gir)} → ~${r(next)}; dextrose ≈ ${r((next * 6 * wt) / num(o.rate), 1)}% at ${o.rate} mL/hr).`, `Below goal ${goal.join('–')} and glucose acceptable.`, 'Dell slides (step size); goal from cheat sheet'); }

    // Amino acids
    if (ctx.bun != null && ctx.bun >= 30) sug('Amino acids', `Decrease protein by 0.5–1 g/kg/day (${r(c.aa, 2)} → ${r(Math.max(c.aa - 0.75, 0.5), 2)}).`, `BUN ${ctx.bun} ≥ 30.`, 'cheat sheet');
    else if (c.aa < AGES[age].aa[1]) sug('Amino acids', `Advance by ~0.5 g/kg/day (${r(c.aa, 2)} → ${r(Math.min(c.aa + 0.5, AGES[age].aa[1]), 2)}).`, `Goal commonly ${AGES[age].aa.join('–')} g/kg/day for this age.`, 'teaching default / commonly cited');
    else sug('Amino acids', `At goal — hold ${r(c.aa, 2)} g/kg/day.`, `Commonly ${AGES[age].aa.join('–')} g/kg/day.`, 'commonly cited');
    if (age === 'infant' && !o.cysteine && c.aa > 0) sug('Amino acids', 'Add L-cysteine.', 'Infant <1 year.', 'cheat sheet');

    // Lipid
    if (ctx.tg != null && ctx.tg > 300) sug('Lipid', `Hold lipid (TG ${ctx.tg} >300); recheck TG in 24 h.`, 'Per cheat sheet. Many centers reduce to ~0.5–1 g/kg/day instead to prevent EFAD — follow local protocol.', 'cheat sheet');
    else if (ctx.tg != null && ctx.tg >= 200) sug('Lipid', `Hold advancement at ${r(c.il, 2)} g/kg/day (TG ${ctx.tg}).`, 'TG 200–300.', 'cheat sheet');
    else if (c.il < 3) sug('Lipid', `Advance by 0.5–1 g/kg/day (${r(c.il, 2)} → ${r(Math.min(c.il + 0.5, 3), 2)}) to a usual ceiling of 3.`, 'TG acceptable.', 'teaching default');
    if (ctx.tg != null && ctx.tg >= 200 && age === 'infant' && num(o.carnitine) === 0) sug('Carnitine', 'Consider L-carnitine 10 mg/kg/day (max 20).', 'Elevated TG in an infant.', 'cheat sheet');

    // Electrolytes (cheat sheet adjustment table)
    const cur = c.tot;
    if (ctx.k != null) {
      if (ctx.k < 3.0) sug('Potassium', `Major increase: +1.5–2 mEq/kg/day (now ${r(cur.k, 2)}).`, `K ${ctx.k} (<3.0). If symptomatic, replace IV per your policy: 0.5–1 mEq/kg/dose infused at 0.3–0.5 mEq/kg/hr (max 1), never pushed.`, 'Dell slides / verify policy');
      else if (ctx.k < 3.5) sug('Potassium', `Minor increase: +1 mEq/kg/day (now ${r(cur.k, 2)}).`, `K ${ctx.k} (<3.5).`, 'cheat sheet');
      else if (ctx.k > (age === 'infant' ? 5.5 : 5.0)) sug('Potassium', 'Remove/reduce K.', `K ${ctx.k} — high.`, 'teaching default');
    }
    if (ctx.na != null) {
      if (ctx.na < 130) sug('Sodium', 'Major increase (½NS → NS, or +3–4 mEq/kg/day).', `Na ${ctx.na}.`, 'cheat sheet');
      else if (ctx.na < 135) sug('Sodium', 'Minor increase (½NS → ¾NS, or +1–2 mEq/kg/day).', `Na ${ctx.na}.`, 'cheat sheet');
      else if (ctx.na > 145) sug('Sodium', 'Reduce sodium; check free water, diuretics, insensible losses.', `Na ${ctx.na}.`, 'teaching default');
    }
    if (ctx.phos != null) {
      const f = labFlag('phos', ctx.phos, age);
      if (f === 'low') sug('Phosphate', ctx.phos < 2.5 ? 'Major increase: +0.5 mmol/kg/day.' : 'Minor increase: +0.25 mmol/kg/day.', `Phos ${ctx.phos} mg/dL — low for age. Mind Ca:Phos, <2 mmol/100 mL, no phos if on CaCl gtt.`, 'cheat sheet');
      else if (f === 'high') sug('Phosphate', 'Reduce/hold phosphate.', `Phos ${ctx.phos} mg/dL — high; check renal function.`, 'teaching default');
    }
    if (ctx.mg != null) {
      if (ctx.mg < 1.2) sug('Magnesium', 'Major increase: +0.5 mEq/kg/day.', `Mg ${ctx.mg}.`, 'cheat sheet');
      else if (ctx.mg < 1.6) sug('Magnesium', 'Minor increase: +0.3 mEq/kg/day.', `Mg ${ctx.mg}.`, 'cheat sheet');
      else if (ctx.mg > 2.6) sug('Magnesium', 'Reduce/hold Mg.', `Mg ${ctx.mg}; check renal function.`, 'teaching default');
    }
    const lowCa = ctx.ica != null ? ctx.ica < 1.10 : null;
    if (lowCa === true) sug('Calcium', ctx.ica < 1.0 ? 'Major increase: +2 mEq/kg/day.' : 'Minor increase: +1 mEq/kg/day.', `iCa ${ctx.ica} mmol/L. Consider albumin.`, 'cheat sheet');
    if (ctx.co2 != null && ctx.cl != null) {
      if (ctx.co2 < 20 && ctx.cl > 108) sug('Chloride/Acetate', `Shift chloride → acetate (+1–2 mEq/kg/day acetate; now ${r(cur.acetate, 2)}).`, `Hyperchloremic non-gap acidosis: Cl ${ctx.cl}, CO₂ ${ctx.co2}. Acetate is converted to bicarbonate.`, 'cheat sheet (acetate steps)');
      else if (ctx.co2 > 30 && cur.acetate > 0) sug('Chloride/Acetate', 'Shift acetate → chloride.', `Alkalosis: CO₂ ${ctx.co2} (common with loop diuretics).`, 'teaching default');
    }

    // Feeds / wean
    if (c.feedKcalKg > 0) {
      const goalKcal = kcalRange(c)[0];
      sug('TPN wean', `Enteral = ${r(c.feedKcalKg, 0)} kcal/kg/day (${Math.round(c.feedPctKcal * 100)}% of total). Aim TPN ≈ ${r(Math.max(goalKcal - c.feedKcalKg, 0), 0)} kcal/kg/day.`, c.feedPctKcal >= 0.75 ? 'Feeds ≥75% — consider stopping TPN.' : c.feedPctKcal >= 0.5 ? 'Feeds ≥50% — wean TPN.' : 'Continue TPN while advancing feeds.', 'commonly cited — VERIFY');
    }
    return out;
  }

  /** Build the "show the math" walkthrough with the learner's own numbers. */
  function steps(pt, o) {
    const c = calc(pt, o), wt = c.wt, rate = num(o.rate), dex = num(o.dex);
    const f2 = (x, d = 2) => r(x, d);
    const S = [];
    S.push({ t: 'TPN volume per day', f: 'L/day = mL/hr × 24 ÷ 1000', n: `${rate} × 24 ÷ 1000 = ${f2(c.tpnL, 3)} L/day`, n2: `= ${f2(c.tpnMlKg, 1)} mL/kg/day` });
    S.push({ t: 'Glucose infusion rate (GIR)', f: 'GIR (mg/kg/min) = dextrose % × mL/hr ÷ weight ÷ 6', n: `${dex} × ${rate} ÷ ${wt} ÷ 6 = ${f2(c.gir)} mg/kg/min`, why: 'The ÷6 comes from converting % (g/100 mL) and mL/hr to mg/min: 1% = 10 mg/mL, ÷60 min → ×10/60 = ÷6.' });
    S.push({ t: 'Dextrose calories', f: 'kcal/day = dextrose % × 0.01 × (mL/hr × 24) × 3.4', n: `${dex} × 0.01 × ${rate * 24} × 3.4 = ${f2(c.dexKcal, 0)} kcal/day` });
    S.push({ t: 'Amino acid calories', f: 'kcal/day = AA (g/kg/day) × weight × 4', n: `${f2(num(o.aa))} × ${wt} × 4 = ${f2(c.aaKcal, 0)} kcal/day`, why: `${f2(c.aaG, 1)} g protein per day.` });
    S.push({ t: 'Lipid calories', f: 'kcal/day = lipid (g/kg/day) × weight × 10', n: `${f2(num(o.il))} × ${wt} × 10 = ${f2(c.ilKcal, 0)} kcal/day`, why: `20% lipid = 2 kcal/mL = 10 kcal/g fat; ${f2(c.ilG, 1)} g/day = ${f2(c.lipidMl, 0)} mL/day of 20% emulsion.` });
    S.push({ t: 'TPN calories per kg', f: '(dextrose + AA + lipid kcal) ÷ weight', n: `(${f2(c.dexKcal, 0)} + ${f2(c.aaKcal, 0)} + ${f2(c.ilKcal, 0)}) ÷ ${wt} = ${f2(c.tpnKcalKg, 1)} kcal/kg/day` });
    const fd = o.feeds || {};
    if (num(fd.n) > 0) S.push({ t: 'Enteral calories per kg', f: 'feeds/day × volume ÷ 30 × (kcal per 30 mL) ÷ weight', n: `${fd.n} × ${fd.vol} ÷ 30 × ${fd.kcalOz} ÷ ${wt} = ${f2(c.feedKcalKg, 1)} kcal/kg/day`, n2: `= ${f2(c.feedMlKg, 1)} mL/kg/day` });
    S.push({ t: 'Total calories', f: 'TPN kcal/kg + enteral kcal/kg', n: `${f2(c.tpnKcalKg, 1)} + ${f2(c.feedKcalKg, 1)} = ${f2(c.totalKcalKg, 1)} kcal/kg/day` });
    S.push({ t: 'Total fluids', f: '(TPN + IVF mL/hr) × 24 ÷ weight + feeds mL/kg + lipid mL/kg', n: `(${rate} + ${num(o.ivf)}) × 24 ÷ ${wt} + ${f2(c.feedMlKg, 1)} + ${f2(c.lipidMlKg, 1)} = ${f2(c.totalFluids, 1)} mL/kg/day`, why: 'The cheat-sheet total excludes the lipid volume; it is added here because lipid is a real volume.' });
    S.push({ t: 'Electrolytes: bag ↔ patient', f: 'mEq/kg/day = mEq/L × TPN L/day ÷ weight        mEq/L = mEq/kg/day × weight ÷ TPN L/day', n: `Example (total Na ${f2(c.tot.na, 2)} mEq/kg/day): ${f2(c.tot.na, 2)} × ${wt} ÷ ${f2(c.tpnL, 3)} = ${f2(c.perLiter.na, 0)} mEq/L`, why: 'Concentration (mEq/L) depends on TPN volume; the daily dose (mEq/kg/day) does not. Change the rate and the mEq/L changes if the dose is held.' });
    S.push({ t: 'Potassium from K-phos', f: 'K (mEq) = KCl + K-acetate + 1.5 × K-phos (mmol)', n: `${f2(c.lytes.kCl)} + ${f2(c.lytes.kAc)} + 1.5 × ${f2(c.lytes.kPhos)} = ${f2(c.tot.k, 2)} mEq/kg/day`, why: '1 mmol K-phos carries 1.5 mEq K — count it toward total potassium.' });
    S.push({ t: 'Calcium : phosphate', f: 'Ca (mmol) = Ca gluconate (mEq) ÷ 2;  ratio = Ca mmol ÷ phos mmol', n: c.tot.phos > 0 ? `${f2(c.caMmolKg, 2)} ÷ ${f2(c.tot.phos, 2)} = ${f2(c.caPRatio, 2)} : 1` : 'No phosphate ordered.', why: 'Cheat sheet: try to match 1:1 if lytes allow — convert units first (phos is mmol, calcium gluconate is mEq).' });
    return S;
  }

  const api = { kcalRange, KCAL, AGES, LYTE_DEFS, RANGES, ADJUST, LAB_REF, IL_ML_PER_G, emptyOrder, cloneOrder, calc, rangeFor, rangeStatus, girStatus, kcalStatus, correctedCa, labFlag, evaluate, suggestNext, steps, r, num };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TPN = api;
})(typeof window !== 'undefined' ? window : globalThis);
