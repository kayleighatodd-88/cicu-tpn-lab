/* Teaching cases (Teach + Learn). All patients are fictional.
   Labs per day are scripted by the case author; `react()` then nudges them if the learner's PRIOR day order
   exceeded the patient's (hidden) tolerance, so unsafe choices have visible, teachable consequences.
   Source tags used in teaching text:  [sheet] = TCPCHD cheat sheet · [common] = commonly cited, verify locally · [default] = teaching default. */
(function (root) {
  'use strict';
  const T = root.TPN;

  const LAB_ORDER = ['na', 'k', 'cl', 'co2', 'bun', 'cr', 'glu', 'ca', 'ica', 'phos', 'mg', 'alb', 'tg', 'dbili', 'alt', 'uop'];

  function react(cs, idx, prevOrder, baseLabs) {
    const labs = Object.assign({}, baseLabs), notes = [];
    if (!prevOrder || idx === 0) return { labs, notes };
    const c = T.calc(cs.patient, prevOrder), tol = cs.tol || {};
    if (tol.gir != null && c.gir > tol.gir) {
      const add = Math.round((c.gir - tol.gir) * 18); labs.glu = baseLabs.glu + add;
      notes.push(`Glucose ${labs.glu} (vs ${baseLabs.glu} expected): yesterday's GIR ${T.r(c.gir)} mg/kg/min exceeded what this patient tolerates right now (~${tol.gir}).`);
    }
    if (tol.il != null && c.il > tol.il) {
      const add = Math.round((c.il - tol.il) * 95); labs.tg = baseLabs.tg + add;
      notes.push(`TG ${labs.tg} (vs ${baseLabs.tg} expected): lipid ${T.r(c.il, 2)} g/kg/day was above this patient's clearance (~${tol.il} g/kg/day).`);
    }
    if (tol.aa != null && c.aa > tol.aa) {
      const add = Math.round((c.aa - tol.aa) * 14); labs.bun = baseLabs.bun + add;
      notes.push(`BUN ${labs.bun} (vs ${baseLabs.bun} expected): protein ${T.r(c.aa, 2)} g/kg/day exceeded renal tolerance (~${tol.aa} g/kg/day).`);
    }
    if (tol.k != null && c.tot.k > tol.k) {
      const add = Math.round((c.tot.k - tol.k) * 0.55 * 10) / 10; labs.k = Math.round((baseLabs.k + add) * 10) / 10;
      notes.push(`K ${labs.k} (vs ${baseLabs.k} expected): K ${T.r(c.tot.k, 2)} mEq/kg/day exceeded what this patient could excrete (~${tol.k}).`);
    }
    if (tol.phos != null && c.tot.phos > tol.phos) {
      const add = Math.round((c.tot.phos - tol.phos) * 2.2 * 10) / 10; labs.phos = Math.round((baseLabs.phos + add) * 10) / 10;
      notes.push(`Phos ${labs.phos} (vs ${baseLabs.phos} expected): phosphate ${T.r(c.tot.phos, 2)} mmol/kg/day exceeded renal clearance.`);
    }
    return { labs, notes };
  }

  const L = (o) => Object.assign({ dbili: 0.4, alt: 30 }, o);

  const CASES = {
    t1: {
      id: 't1', short: 'Baby A', title: 'Neonate after arterial switch — starting and advancing PN',
      blurb: 'Day 1–5 of PN in a 3.4 kg neonate: start low, advance macros, correct a falling phosphate, start feeds, begin the wean.',
      patient: { wt: 3.4, age: 'infant' }, fluidGoal: 100, access: 'central', calciumInfusion: false,
      tol: { gir: 11, il: 2.5, aa: 4, k: 3 },
      history: '5-day-old term neonate, POD 1 after arterial switch operation for TGA. Central line in place. NPO. Making good urine. Total fluid goal 100 mL/kg/day set by the CICU team (teaching assumption).',
      days: [
        { n: 1, title: 'PN day 1 — start', labs: L({ na: 138, k: 4.4, cl: 104, co2: 21, bun: 12, cr: 0.5, glu: 96, ca: 8.6, ica: 1.18, phos: 5.6, mg: 2.0, alb: 3.0, tg: 62, uop: 2.1 }), feeds: null,
          narrative: 'NPO. No PN yet. Baseline labs back. Build the first PN order.',
          teach: ['Start low and build — GIR roughly 4–8 mg/kg/min on day 1 in a neonate [default].', 'Start amino acids early (about 2–3 g/kg/day) [common] and lipid at ~1 g/kg/day [default].', 'Infant <1 yr: add L-cysteine [sheet].', 'Hold K until urine output is established and K is known — here UOP is good and K 4.4, so a modest K dose is reasonable [default].', 'Count lipid volume (5 mL per g of 20%) toward total fluids.'],
          debrief: 'A conservative start leaves room to advance. Notice how much of the 100 mL/kg/day goal lipid and feeds will eventually need — concentrate dextrose rather than adding volume.' },
        { n: 2, title: 'PN day 2 — advance', labs: L({ na: 137, k: 4.0, cl: 103, co2: 22, bun: 14, cr: 0.5, glu: 124, ca: 8.4, ica: 1.16, phos: 5.0, mg: 1.9, alb: 2.9, tg: 104, uop: 1.9 }), feeds: null,
          narrative: 'Glucose 124, TG 104. Tolerating day 1 PN. Advance toward goal.',
          teach: ['Glucose and TG both acceptable → advance dextrose (≈1–2 mg/kg/min/day) and lipid (0.5–1 g/kg/day) [default].', 'Advance AA toward ~3 g/kg/day [common].', 'Phosphate is drifting down (5.6 → 5.0) — anticipate need.'],
          debrief: 'Advance one macronutrient decision at a time against labs: glucose gates dextrose, TG gates lipid, BUN/renal function gates protein.' },
        { n: 3, title: 'PN day 3 — low phos, trophic feeds start', labs: L({ na: 137, k: 3.6, cl: 103, co2: 22, bun: 13, cr: 0.4, glu: 138, ca: 8.5, ica: 1.12, phos: 4.2, mg: 1.7, alb: 2.9, tg: 138, uop: 2.0 }), feeds: { n: 8, vol: 4, kcalOz: 20 },
          narrative: 'Phos 4.2 (low for age), K 3.6, Mg 1.7. Trophic feeds started: 4 mL q3h of 20 kcal/oz.',
          teach: ['Phos low → minor increase +0.25 mmol/kg/day (below ~2.5 mg/dL → major +0.5) [sheet].', 'K 3.6 is low-normal — a minor increase (+1 mEq/kg/day) is reasonable if UOP stays good [sheet steps].', 'Check Ca:Phos balance (Ca gluconate mEq ÷ 2 = mmol) and phos <2 mmol/100 mL [sheet].', 'Trophic feeds give almost no calories — do not wean PN yet.'],
          debrief: 'Raising phos without keeping Ca in step risks precipitation and Ca imbalance. Trophic feeds are for gut priming, not calories.' },
        { n: 4, title: 'PN day 4 — feeds advance', labs: L({ na: 138, k: 3.9, cl: 104, co2: 23, bun: 12, cr: 0.4, glu: 146, ca: 8.7, ica: 1.16, phos: 4.8, mg: 1.9, alb: 3.0, tg: 162, uop: 2.2 }), feeds: { n: 8, vol: 12, kcalOz: 20 },
          narrative: 'Feeds now 12 mL q3h (~28 mL/kg/day). TG 162 and climbing. Glucose 146.',
          teach: ['Count enteral kcal — total kcal/kg is now PN + feeds [sheet].', 'TG is rising but below 200 — continue, but do not push lipid higher than needed; recheck.', 'Plan the wean: as feeds reach ~50% of calories reduce PN [common].'],
          debrief: 'Total energy matters — avoid overfeeding as enteral calories accumulate. Watch the TG trend, not just today\'s value.' },
        { n: 5, title: 'PN day 5 — wean', labs: L({ na: 137, k: 4.0, cl: 103, co2: 23, bun: 11, cr: 0.4, glu: 140, ca: 8.8, ica: 1.18, phos: 5.2, mg: 2.0, alb: 3.1, tg: 178, uop: 2.3 }), feeds: { n: 8, vol: 25, kcalOz: 22 },
          narrative: 'Feeds 25 mL q3h of 22 kcal/oz (~59 mL/kg/day). Labs stable. TG 178.',
          teach: ['Enteral share is climbing — reduce PN to keep total kcal at goal rather than exceeding it [default].', 'Reduce lipid first if TG still rising (TG 178 trending up) [default].', 'When feeds ≥~75% of calories consider stopping PN [common].'],
          debrief: 'Weaning is just the same arithmetic run backwards: goal total kcal/kg − enteral kcal/kg = PN kcal/kg still needed.' }
      ]
    },

    t2: {
      id: 't2', short: 'Baby B', title: 'Glenn with chylothorax on a furosemide infusion',
      blurb: 'Fluid-restricted infant losing K, Cl, Mg and albumin: concentrate PN, shift Cl/acetate, and think through lipid and feeds in chylothorax.',
      patient: { wt: 6.8, age: 'infant' }, fluidGoal: 90, access: 'central', calciumInfusion: false,
      tol: { gir: 10, il: 3, aa: 3.5, k: 4 },
      history: '8-month-old, POD 5 after bidirectional Glenn. Chest tube output turned milky — chylothorax. On a furosemide infusion for fluid balance. Total fluids restricted to 90 mL/kg/day by the team.',
      days: [
        { n: 1, title: 'PN day 1 — chylothorax, diuresis', labs: L({ na: 134, k: 3.3, cl: 96, co2: 31, bun: 14, cr: 0.3, glu: 98, ca: 8.4, ica: 1.15, phos: 4.9, mg: 1.5, alb: 2.4, tg: 70, uop: 3.0 }), feeds: null,
          narrative: 'NPO for chylothorax. Na 134, K 3.3, Cl 96, CO₂ 31 (hypochloremic metabolic alkalosis from loop diuretic), Mg 1.5, albumin 2.4.',
          teach: ['Hypochloremic alkalosis on loop diuretics → favor chloride salts over acetate [default].', 'K 3.3 and Mg 1.5 are low — minor/major increases from the sheet table [sheet].', 'Albumin 2.4: correct total Ca (measured + 0.8 × (4 − albumin)) and use ionized Ca [sheet note].', 'Fluid restriction means concentrating PN (higher dextrose %, fewer mL) — still check GIR.', 'IV lipid bypasses the gut, so it does not increase chyle flow like enteral long-chain fat; protocols vary [common — verify].'],
          debrief: 'The acid–base picture dictates the anion: chloride when alkalotic from diuretics; acetate (→ bicarbonate) when acidotic or hyperchloremic.' },
        { n: 2, title: 'PN day 2', labs: L({ na: 136, k: 3.8, cl: 99, co2: 29, bun: 15, cr: 0.3, glu: 112, ca: 8.6, ica: 1.17, phos: 4.7, mg: 1.8, alb: 2.4, tg: 96, uop: 3.1 }), feeds: null,
          narrative: 'Improving. K 3.8, Cl 99, CO₂ 29. Chest tube still milky.',
          teach: ['Do not over-correct — keep chloride-predominant while CO₂ is still high.', 'Advance macros against glucose/TG as in any PN day.', 'Fluid goal is unchanged, so rate stays tight.'],
          debrief: 'Electrolyte corrections work quickly in a patient losing them daily — re-check before the next increase.' },
        { n: 3, title: 'PN day 3 — fat-free feeds start', labs: L({ na: 137, k: 4.1, cl: 101, co2: 27, bun: 14, cr: 0.3, glu: 120, ca: 8.8, ica: 1.18, phos: 4.5, mg: 1.9, alb: 2.5, tg: 118, uop: 2.8 }), feeds: { n: 8, vol: 20, kcalOz: 20 },
          narrative: 'Fat-free (MCT-based) feeds started at 20 mL q3h (~24 mL/kg/day). Furosemide being weaned.',
          teach: ['Feeds add volume against a fixed fluid goal — PN volume must come down as feeds go up.', 'K and Cl normalized; hold further K/Cl increases if the diuretic is weaning [default].', 'Keep protein generous — albumin and protein are being lost in chyle [common].'],
          debrief: 'Whenever feeds advance under a fixed fluid goal, re-compute total fluids; calories come from concentrating, not from more volume.' },
        { n: 4, title: 'PN day 4 — wean diuretic', labs: L({ na: 138, k: 4.3, cl: 102, co2: 25, bun: 13, cr: 0.3, glu: 124, ca: 8.9, ica: 1.2, phos: 4.8, mg: 2.0, alb: 2.7, tg: 130, uop: 2.4 }), feeds: { n: 8, vol: 35, kcalOz: 20 },
          narrative: 'Chyle output falling. Feeds 35 mL q3h (~41 mL/kg/day). Electrolytes normal.',
          teach: ['With less diuretic, reduce supplemental K/Mg so levels do not overshoot [default].', 'Enteral calories are a larger share — shrink PN accordingly.'],
          debrief: 'The same electrolyte plan that fixed deficits becomes an excess a few days later if you do not de-escalate with the cause.' }
      ]
    },

    t3: {
      id: 't3', short: 'Child C', title: 'Child with AKI and steroid hyperglycemia',
      blurb: 'BUN ≥30, high K/phos/Mg, hyperglycemia, oliguria — reduce protein, remove K/phos/Mg, hold dextrose, then reintroduce as renal function recovers.',
      patient: { wt: 18, age: 'child' }, fluidGoal: 80, access: 'central', calciumInfusion: false,
      tol: { gir: 5, il: 2, aa: 1.3, k: 1, phos: 0.3 },
      history: '4-year-old, 18 kg, POD 3 after a complex repair with low cardiac output. Acute kidney injury (oliguria). Receiving dexamethasone. Fluid restricted to 80 mL/kg/day.',
      days: [
        { n: 1, title: 'PN day 1 — AKI + hyperglycemia', labs: L({ na: 139, k: 5.3, cl: 105, co2: 19, bun: 34, cr: 1.1, glu: 214, ca: 8.9, ica: 1.2, phos: 6.8, mg: 2.7, alb: 3.4, tg: 120, uop: 0.6 }), feeds: null,
          narrative: 'BUN 34, Cr 1.1, K 5.3, phos 6.8, Mg 2.7, glucose 214, UOP 0.6 mL/kg/hr.',
          teach: ['BUN ≥30 → decrease protein by 0.5–1 g/kg/day [sheet].', 'Be conservative with K, Phos and Mg in renal dysfunction — remove them while high [sheet].', 'Glucose >180: do not advance dextrose; lower GIR; consider insulin per protocol [default].', 'Fluid restriction + oliguria: avoid volume stacking.'],
          debrief: 'In AKI, you provide energy (dextrose/lipid within tolerance) while withholding what the kidney cannot clear.' },
        { n: 2, title: 'PN day 2', labs: L({ na: 138, k: 5.1, cl: 104, co2: 20, bun: 38, cr: 1.3, glu: 188, ca: 9.0, ica: 1.22, phos: 6.5, mg: 2.6, alb: 3.3, tg: 128, uop: 0.7 }), feeds: null,
          narrative: 'BUN 38, Cr 1.3, K 5.1, phos 6.5. Glucose 188. UOP 0.7.',
          teach: ['Keep K/Phos/Mg out until trending down and UOP returns.', 'Protein stays reduced.', 'Glucose improving — still hold, do not advance.'],
          debrief: 'Stable-but-abnormal means hold, not advance.' },
        { n: 3, title: 'PN day 3 — turning the corner', labs: L({ na: 137, k: 4.6, cl: 103, co2: 21, bun: 31, cr: 1.0, glu: 150, ca: 9.1, ica: 1.2, phos: 5.5, mg: 2.3, alb: 3.4, tg: 135, uop: 1.1 }), feeds: null,
          narrative: 'UOP 1.1, BUN 31, K 4.6, phos 5.5, glucose 150.',
          teach: ['BUN still ≥30 — keep protein reduced [sheet].', 'Glucose now acceptable — cautious GIR advance possible [default].', 'K normalizing — continue to hold K for now.'],
          debrief: 'Recovery is gradual: step one variable at a time.' },
        { n: 4, title: 'PN day 4 — reintroduce', labs: L({ na: 138, k: 4.3, cl: 103, co2: 22, bun: 24, cr: 0.8, glu: 142, ca: 9.2, ica: 1.2, phos: 4.8, mg: 2.1, alb: 3.5, tg: 140, uop: 1.5 }), feeds: null,
          narrative: 'BUN 24, Cr 0.8, K 4.3, phos 4.8, Mg 2.1. UOP 1.5.',
          teach: ['BUN <30 → protein can be advanced again, stepwise (~0.5 g/kg/day) [default].', 'Low-dose K/phos/Mg can be reintroduced as levels normalize and UOP is adequate [default].'],
          debrief: 'Reintroduce slowly and recheck — what you removed for the kidney comes back in small steps.' }
      ]
    },

    t4: {
      id: 't4', short: 'Baby D', title: 'Prolonged PN: rising TG and early cholestasis',
      blurb: 'PN day 21 with TG 340 and direct bilirubin 2.8 — hold lipid, add carnitine, re-balance calories, and plan for feeds and lipid alternatives.',
      patient: { wt: 5.1, age: 'infant' }, fluidGoal: 120, access: 'central', calciumInfusion: false,
      tol: { gir: 12, il: 1.5, aa: 4, k: 3.5 },
      history: '7-month-old, 5.1 kg, PN day 21 after complex repair with persistent feeding intolerance on minimal trophic feeds. TG and direct bilirubin rising.',
      days: [
        { n: 1, title: 'PN day 21 — TG 340', labs: L({ na: 138, k: 4.2, cl: 103, co2: 23, bun: 8, cr: 0.3, glu: 120, ca: 9.1, ica: 1.2, phos: 5.3, mg: 2.1, alb: 2.8, tg: 340, dbili: 2.8, alt: 88, uop: 2.3 }), feeds: { n: 8, vol: 8, kcalOz: 20 },
          narrative: 'TG 340, direct bilirubin 2.8, ALT 88. Currently on lipid 3 g/kg/day, GIR high-normal. Consider what to change.',
          teach: ['TG >300 → hold lipid [sheet].', 'L-carnitine 10 mg/kg/day (up to 20) may help lower TG in infants [sheet].', 'Direct bilirubin ≥2 suggests PN-associated cholestasis — minimize soybean-oil lipid load, advance enteral feeds if possible, discuss lipid alternatives (e.g., fish-oil-containing emulsions) with pharmacy/GI; protocols vary [common — verify].', 'Do not make up lost lipid kcal with a big dextrose jump — GIR stays within the 12–14 goal [sheet].'],
          debrief: 'Removing lipid creates a calorie gap: protein should stay protected and dextrose raised only within GIR goal and glucose tolerance.' },
        { n: 2, title: 'PN day 22', labs: L({ na: 138, k: 4.3, cl: 103, co2: 23, bun: 8, cr: 0.3, glu: 128, ca: 9.2, ica: 1.2, phos: 5.2, mg: 2.1, alb: 2.8, tg: 285, dbili: 2.8, alt: 84, uop: 2.2 }), feeds: { n: 8, vol: 10, kcalOz: 20 },
          narrative: 'TG 285 after the change. Direct bili 2.8.',
          teach: ['TG 200–300: hold lipid advancement [sheet] — do not re-advance yet.', 'Recheck TG daily until clearly below 200.'],
          debrief: 'TG responds within 24–48 h; keep the intervention steady until it clearly turns.' },
        { n: 3, title: 'PN day 23', labs: L({ na: 138, k: 4.2, cl: 103, co2: 23, bun: 8, cr: 0.3, glu: 125, ca: 9.2, ica: 1.2, phos: 5.2, mg: 2.1, alb: 2.9, tg: 210, dbili: 2.7, alt: 80, uop: 2.2 }), feeds: { n: 8, vol: 15, kcalOz: 20 },
          narrative: 'TG 210. Feeds creeping up.',
          teach: ['Still ≥200: hold advancement [sheet].', 'Enteral calories are rising — count them.'],
          debrief: 'Steady improvement does not mean re-advance immediately; wait for clearly acceptable values.' },
        { n: 4, title: 'PN day 24', labs: L({ na: 138, k: 4.2, cl: 103, co2: 24, bun: 8, cr: 0.3, glu: 122, ca: 9.3, ica: 1.2, phos: 5.3, mg: 2.1, alb: 2.9, tg: 175, dbili: 2.6, alt: 74, uop: 2.3 }), feeds: { n: 8, vol: 25, kcalOz: 22 },
          narrative: 'TG 175. Feeds ~39 mL/kg/day at 22 kcal/oz. Direct bili 2.6.',
          teach: ['TG <200: lipid may be restarted at a conservative dose rather than the old 3 g/kg/day [default].', 'Keep protecting the liver: advance feeds, minimize PN duration.'],
          debrief: 'Cholestasis management is a trajectory: less PN, more gut, smarter lipid.' }
      ]
    }
  };

  function labsFor(cs, idx, prevOrder) { return react(cs, idx, prevOrder, cs.days[idx].labs); }

  function startOrderForDay(cs, idx, prevOrder) {
    const o = prevOrder ? T.cloneOrder(prevOrder) : T.emptyOrder();
    o.access = cs.access; o.calciumInfusion = !!cs.calciumInfusion;
    const f = cs.days[idx].feeds; o.feeds = f ? { n: f.n, vol: f.vol, kcalOz: f.kcalOz } : { n: 0, vol: 0, kcalOz: 0 };
    return o;
  }

  // Sandbox patient presets for Teach mode
  const PRESETS = [
    { id: 'blank-infant', label: 'Blank infant (3.4 kg)', patient: { wt: 3.4, age: 'infant' } },
    { id: 'blank-child', label: 'Blank child (14 kg)', patient: { wt: 14, age: 'child' } },
    { id: 'blank-adol', label: 'Blank adolescent (52 kg)', patient: { wt: 52, age: 'adolescent' } }
  ];

  root.TPNC = Object.assign(root.TPNC || {}, { LAB_ORDER, CASES, PRESETS, labsFor, startOrderForDay });
})(typeof window !== 'undefined' ? window : globalThis);
