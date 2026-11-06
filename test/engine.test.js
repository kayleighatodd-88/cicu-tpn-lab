// Run: node test/engine.test.js
// Expected values below are the cached results from the TCPCHD TPN & TF Cheat Sheet (sheets "Pt 1" and "Pt 2").
const assert = require('assert');
const T = require('../src/engine.js');
let n = 0;
const close = (a, b, tol, msg) => { n++; assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`); };

// ---- Sheet "Pt 2": 8.3 kg, TPN 22 mL/hr, D10, AA 2, IL 1, IVF 4.48, feeds 24 x 25 mL @ 22 kcal/30 mL, NaCl 77 mEq/L
{
  const L = 0.528;
  const o = T.emptyOrder();
  Object.assign(o, { rate: 22, dex: 10, aa: 2, il: 1, ivf: 4.48 });
  o.feeds = { n: 24, vol: 25, kcalOz: 22 };
  o.lytes.naCl = 77 * L / 8.3;                       // sheet gives 4.898313253 mEq/kg/day
  const c = T.calc({ wt: 8.3, age: 'child' }, o);
  close(c.tpnL, 0.528, 1e-9, 'Pt2 TPN L/day');
  close(c.gir, 4.417670683, 1e-6, 'Pt2 GIR');
  close(c.dexKcal, 179.52, 1e-6, 'Pt2 dex kcal');
  close(c.aaKcal, 66.4, 1e-6, 'Pt2 AA kcal');
  close(c.ilKcal, 83, 1e-6, 'Pt2 IL kcal');
  close(c.tpnKcal, 328.92, 1e-6, 'Pt2 kcal/day');
  close(c.tpnKcalKg, 39.62891566, 1e-6, 'Pt2 TPN kcal/kg');
  close(c.feedKcalKg, 53.01204819, 1e-6, 'Pt2 feeds kcal/kg');
  close(c.totalKcalKg, 92.64096386, 1e-6, 'Pt2 total kcal/kg');
  close(c.feedMlKg, 72.28915663, 1e-6, 'Pt2 feeds mL/kg');
  close(c.tpnIvfMlKg, 76.5686747, 1e-6, 'Pt2 TPN+IVF mL/kg');
  close(c.sheetTotalFluids, 148.8578313, 1e-6, 'Pt2 total fluids (sheet)');
  close(c.tot.na, 4.898313253, 1e-6, 'Pt2 Na mEq/kg/day');
  close(c.perLiter.naCl, 77, 1e-6, 'Pt2 NaCl mEq/L round trip');
  // lipid volume is beyond the sheet: 1 g/kg x 8.3 kg x 5 mL/g / 8.3 kg = 5 mL/kg
  close(c.lipidMlKg, 5, 1e-9, 'Pt2 lipid mL/kg');
  close(c.totalFluids, 148.8578313 + 5, 1e-6, 'Pt2 total fluids incl. lipid');
}

// ---- Sheet "Pt 1": 7.5 kg, TPN 5 mL/hr, D18, AA 1, IL 2, IVF 12.54, feeds 8 x 100 mL @ 24
{
  const o = T.emptyOrder();
  Object.assign(o, { rate: 5, dex: 18, aa: 1, il: 2, ivf: 12.54 });
  o.feeds = { n: 8, vol: 100, kcalOz: 24 };
  const c = T.calc({ wt: 7.5, age: 'infant' }, o);
  close(c.gir, 2, 1e-9, 'Pt1 GIR');
  close(c.dexKcal, 73.44, 1e-6, 'Pt1 dex kcal');
  close(c.aaKcal, 30, 1e-9, 'Pt1 AA kcal');
  close(c.ilKcal, 150, 1e-9, 'Pt1 IL kcal');
  close(c.tpnKcalKg, 33.792, 1e-6, 'Pt1 TPN kcal/kg');
  close(c.feedKcalKg, 85.33333333, 1e-6, 'Pt1 feeds kcal/kg');
  close(c.totalKcalKg, 119.1253333, 1e-6, 'Pt1 total kcal/kg');
  close(c.feedMlKg, 106.6666667, 1e-6, 'Pt1 feeds mL/kg');
  close(c.tpnIvfMlKg, 56.128, 1e-6, 'Pt1 TPN+IVF mL/kg');
  close(c.sheetTotalFluids, 162.7946667, 1e-6, 'Pt1 total fluids');
}

// ---- K / phos / Ca conversions (sheet: K = KCl + KAc + 1.5 x KPhos)
{
  const o = T.emptyOrder(); Object.assign(o, { rate: 10, dex: 12, aa: 2, il: 1 });
  Object.assign(o.lytes, { kCl: 1, kAc: 0.5, kPhos: 0.4, naPhos: 0.2, ca: 1, naCl: 3 });
  const c = T.calc({ wt: 5, age: 'infant' }, o);
  close(c.tot.k, 1 + 0.5 + 1.5 * 0.4, 1e-9, 'K total');
  close(c.tot.phos, 0.6, 1e-9, 'phos total');
  close(c.tot.na, 3 + 0.2 * 4 / 3, 1e-9, 'Na incl. Na-phos');
  close(c.caMmolKg, 0.5, 1e-9, 'Ca mEq -> mmol');
  close(c.caPRatio, 0.5 / 0.6, 1e-9, 'Ca:P ratio');
  close(c.phosPer100, (0.6 * 5) / (0.24 * 10), 1e-9, 'phos mmol/100 mL');
}

// ---- Status / rules
{
  const o = T.emptyOrder(); Object.assign(o, { rate: 20, dex: 12, aa: 2, il: 2 });
  const pt = { wt: 6, age: 'infant' };
  let ev = T.evaluate(pt, o, { tg: 320 });
  assert.ok(ev.flags.some(f => f.id === 'tg-hold-il' && f.sev === 'crit')); n++;
  assert.ok(ev.flags.some(f => f.id === 'cysteine')); n++;
  o.cysteine = true;
  ev = T.evaluate(pt, o, { tg: 250 }, { prevOrder: Object.assign(T.cloneOrder(o), { il: 1 }) });
  assert.ok(ev.flags.some(f => f.id === 'adv-il-tg' && f.sev === 'crit')); n++;
  o.lytes.kPhos = 0.5; o.calciumInfusion = true;
  ev = T.evaluate(pt, o, {});
  assert.ok(ev.flags.some(f => f.id === 'ca-gtt-phos' && f.sev === 'crit')); n++;
  o.calciumInfusion = false; o.access = 'peripheral'; o.dex = 15;
  ev = T.evaluate(pt, o, {});
  assert.ok(ev.flags.some(f => f.id === 'periph-dex')); n++;
  ev = T.evaluate(pt, Object.assign(T.emptyOrder(), { rate: 20, dex: 12, aa: 2 }), { bun: 35 }, { prevOrder: Object.assign(T.emptyOrder(), { rate: 20, dex: 12, aa: 1 }) });
  assert.ok(ev.flags.some(f => f.id === 'adv-aa-bun')); n++;
  close(T.correctedCa(7.0, 2.0), 8.6, 1e-9, 'albumin-corrected Ca');
}

// ---- Suggestions respect labs
{
  const o = T.emptyOrder(); Object.assign(o, { rate: 20, dex: 10, aa: 1.5, il: 1, cysteine: true });
  const s = T.suggestNext({ wt: 6, age: 'infant' }, o, { glu: 210, tg: 320, k: 3.1, phos: 3.0, bun: 12 });
  assert.ok(s.some(x => x.area === 'Dextrose' && /Hold/.test(x.action))); n++;
  assert.ok(s.some(x => x.area === 'Lipid' && /Hold lipid/.test(x.action))); n++;
  assert.ok(s.some(x => x.area === 'Potassium' && /Minor/.test(x.action))); n++;                 // K 3.1 -> minor
  const s2 = T.suggestNext({ wt: 6, age: 'infant' }, o, { k: 2.8 });
  assert.ok(s2.some(x => x.area === 'Potassium' && /Major/.test(x.action))); n++;                // K 2.8 -> major
  assert.ok(s.some(x => x.area === 'Phosphate')); n++;
  assert.ok(s.some(x => x.area === 'Carnitine')); n++;
}

// ---- Zero / blank patient does not throw or return NaN
{
  const c = T.calc({ wt: 0, age: 'infant' }, T.emptyOrder());
  assert.ok(Object.values({ g: c.gir, k: c.totalKcalKg, f: c.totalFluids }).every(Number.isFinite)); n++;
  T.steps({ wt: 0, age: 'infant' }, T.emptyOrder()); n++;
}

console.log(`engine tests passed (${n} assertions)`);
