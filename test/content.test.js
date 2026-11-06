// Run: node test/content.test.js — checks that rubrics are fair (ideal passes, unsafe fails) and Learn tasks are solvable.
const assert = require('assert');
global.TPN = require('../src/engine.js');
require('../src/content-cases.js'); require('../src/content-learn.js'); require('../src/content-check.js');
const T = global.TPN, C = global.TPNC;
let n = 0; const ok = (v, m) => { n++; assert.ok(v, m); };
const set = (o, patch) => { const x = T.cloneOrder(o); Object.keys(patch).forEach(k => { if (k === 'lytes') Object.assign(x.lytes, patch.lytes); else x[k] = patch[k]; }); return x; };

// ---------- Check-off cases ----------
const K = C.CHECK.CASES, S = C.CHECK.scoreCase;
{ // Case 1 ideal order
  const cs = K[0];
  const good = set(cs.start, { rate: 12, dex: 12, aa: 2.5, il: 1, cysteine: true, lytes: { naCl: 3, kCl: 1, naPhos: 0, kPhos: 0, ca: 1, mg: 0.3 } });
  const r = S(cs, good);
  console.log('K1 ideal:', r.earned.toFixed(1), '/', r.max, 'GIR', T.r(r.calc.gir), 'kcal', T.r(r.calc.totalKcalKg), 'fluids', T.r(r.calc.totalFluids));
  ok(r.earned / r.max >= 0.85 && r.crits.length === 0, 'K1 ideal order should pass cleanly');
  const bad = set(cs.start, { rate: 30, dex: 25, aa: 1, il: 3.5, cysteine: false, lytes: { kCl: 6, kPhos: 3 } });
  const rb = S(cs, bad);
  ok(rb.crits.length >= 3 && rb.earned / rb.max < 0.5, 'K1 unsafe order must trigger criticals and low score');
  // K1 with the pitfall: all-zero order must not score as a pass
  const blank = S(cs, cs.start);
  ok(blank.earned / blank.max < 0.4, 'K1 blank order must score low');
}
{ // Case 2: advance
  const cs = K[1], p = T.calc(cs.patient, cs.prev);
  const good = set(cs.start, { dex: 16, aa: 1.75, il: 1.5, lytes: { naCl: 3, kCl: 2, naPhos: 0.5, ca: 1.6, mg: 0.6 } });
  const r = S(cs, good);
  console.log('K2 ideal:', r.earned.toFixed(1), '/', r.max, 'GIR', T.r(r.calc.gir), 'prev', T.r(p.gir), 'kcal', T.r(r.calc.totalKcalKg), 'fluids', T.r(r.calc.totalFluids), 'Ca:P', T.r(r.calc.caPRatio, 2));
  ok(r.earned / r.max >= 0.85 && r.crits.length === 0, 'K2 ideal advancement should pass');
  const bad = set(cs.start, { il: 2.5, dex: 20 });  // advances lipid at TG 240 and jumps GIR
  const rb = S(cs, bad);
  ok(rb.crits.some(c => c.id === 'ilAdv'), 'K2 lipid advance with TG 240 must be critical');
  ok(rb.crits.some(c => c.id === 'girJump'), 'K2 big GIR jump must be critical');
  const unchanged = S(cs, cs.start);
  ok(unchanged.earned / unchanged.max < 0.6, 'K2 unchanged order must not pass');
}
{ // Case 3: complication
  const cs = K[2];
  const good = set(cs.start, { dex: 19, il: 0, carnitine: 10, aa: 3 });
  const r = S(cs, good);
  console.log('K3 ideal:', r.earned.toFixed(1), '/', r.max, 'GIR', T.r(r.calc.gir), 'kcal', T.r(r.calc.totalKcalKg), 'fluids', T.r(r.calc.totalFluids));
  ok(r.earned / r.max >= 0.85 && r.crits.length === 0, 'K3 ideal order should pass');
  const reduced = S(cs, set(cs.start, { dex: 19, il: 1, carnitine: 10 }));
  ok(reduced.crits.length === 0 && reduced.earned / reduced.max >= 0.8, 'K3 minimized lipid (1 g/kg) should be acceptable with partial credit');
  const unchanged = S(cs, cs.start);
  ok(unchanged.crits.length >= 2, 'K3 leaving lipid and GIR unchanged must be critical');
  // multi-select
  const m = cs.multis[0], sc = C.CHECK.scoreMulti;
  ok(sc(m, [0, 1, 2, 3]).got === m.pts, 'multi all correct = full');
  ok(sc(m, [0, 1, 2, 3, 4]).got < m.pts, 'multi with wrong pick reduces score');
  ok(sc(m, [4, 5]).got === 0, 'multi all wrong = 0');
}

// ---------- Numeric questions have finite answers ----------
C.CHECK.CALC.forEach(q => ok(Number.isFinite(q.ans()) && q.ans() > 0, q.id));
ok(C.CHECK.MCQ.every(q => q.ans >= 0 && q.ans < q.opts.length && q.opts.length === 4), 'MCQ answer indices valid');
ok(new Set(C.CHECK.MCQ.map(q => q.id)).size === C.CHECK.MCQ.length, 'MCQ ids unique');

// ---------- Learn module tasks are solvable ----------
const solutions = {
  m1: { rate: 20, dex: 10, aa: 1.5, il: 0, access: 'peripheral', lytes: { naCl: 2, ca: 1 } },
  m3: { dex: 12 },
  m4: { aa: 2.5, cysteine: true },
  m5: { carnitine: 10, il: 2 },
  m6: { dex: 18, aa: 2.5, il: 1.5, rate: 12 },
  m7: { lytes: { naCl: 2, kCl: 2, kAc: 0 } },
  m8: { lytes: { ca: 1, kPhos: 0.5 } }
};
C.MODULES.forEach(m => {
  m.tasks.forEach((t, i) => {
    if (t.type === 'numeric') { ok(Number.isFinite(t.answer()), `${m.id} numeric ${i}`); return; }
    const sol = solutions[m.id]; ok(sol, `${m.id} has a test solution`);
    const o = set(t.start, sol); const res = t.check(T.calc(t.patient, o), o);
    ok(res.every(x => x.ok), `${m.id} task solvable: ` + res.filter(x => !x.ok).map(x => x.msg).join('; '));
    // and the untouched start must NOT already pass
    const res0 = t.check(T.calc(t.patient, t.start), t.start);
    ok(!res0.every(x => x.ok), `${m.id} start order should not already pass`);
  });
  m.quiz.forEach(q => ok(q.ans >= 0 && q.ans < q.opts.length, `${m.id} quiz index`));
});

// ---------- Teaching cases: reactive labs behave ----------
{
  const cs = C.CASES.t1, T1 = C.labsFor;
  const day2 = T1(cs, 1, null).labs;
  const hot = T.emptyOrder(); Object.assign(hot, { rate: 14, dex: 24, aa: 3, il: 3.5 });  // GIR way over tolerance
  const r2 = T1(cs, 1, hot);
  ok(r2.labs.glu > day2.glu && r2.labs.tg > day2.tg && r2.notes.length >= 2, 'reactive labs must punish over-delivery');
  const mild = T.emptyOrder(); Object.assign(mild, { rate: 14, dex: 8, aa: 2, il: 1 });
  ok(T1(cs, 1, mild).notes.length === 0, 'reasonable orders produce no penalties');
  Object.values(C.CASES).forEach(c => { ok(c.days.length >= 4, c.id + ' has days'); c.days.forEach((d, i) => ok(LAB_KEYS_OK(d.labs), c.id + ' day ' + (i + 1) + ' labs')); });
  function LAB_KEYS_OK(l) { return C.LAB_ORDER.every(k => l[k] != null); }
}

console.log(`content tests passed (${n} assertions)`);
