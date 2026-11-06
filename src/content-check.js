/* Check-off content: blinded calculations, knowledge check, and order-building cases with weighted rubrics.
   PASS CRITERIA ARE PROVISIONAL — local educators must set and validate them (see docs/CLINICAL_REVIEW_NOTES.md). */
(function (root) {
  'use strict';
  const T = root.TPN;
  const ord = (o) => Object.assign(T.emptyOrder(), o || {});
  const between = (v, a, b) => v >= a && v <= b;

  // ---------- A. Calculations (numeric, tolerance-based) ----------
  const CALC = [
    { id: 'c1', prompt: 'TPN D12.5 at 18 mL/hr in a 6.4 kg infant. What is the GIR?', unit: 'mg/kg/min', ans: () => 12.5 * 18 / 6.4 / 6, tol: 0.03 },
    { id: 'c2', prompt: 'A 9.2 kg child: TPN 24 mL/hr, D15, AA 2.5 g/kg/day, lipid 2 g/kg/day. What are the TPN kcal/kg/day?', unit: 'kcal/kg/day',
      ans: () => T.calc({ wt: 9.2, age: 'child' }, ord({ rate: 24, dex: 15, aa: 2.5, il: 2 })).tpnKcalKg, tol: 0.03 },
    { id: 'c3', prompt: 'The bag label reads K 30 mEq/L. Rate 20 mL/hr, weight 7.0 kg. What is the potassium dose?', unit: 'mEq/kg/day', ans: () => 30 * (20 * 24 / 1000) / 7, tol: 0.03 },
    { id: 'c4', prompt: 'You want sodium 4 mEq/kg/day in a 5 kg infant on 12 mL/hr. What concentration should the bag contain?', unit: 'mEq/L', ans: () => 4 * 5 / (12 * 24 / 1000), tol: 0.03 },
    { id: 'c5', prompt: '4.5 kg infant: TPN 14 mL/hr, IVF 2 mL/hr, feeds 8 × 20 mL, lipid 2 g/kg/day (20%). What are the total fluids, including the lipid volume?', unit: 'mL/kg/day',
      ans: () => T.calc({ wt: 4.5, age: 'infant' }, ord({ rate: 14, ivf: 2, il: 2, feeds: { n: 8, vol: 20, kcalOz: 20 } })).totalFluids, tol: 0.03 },
    { id: 'c6', prompt: 'Orders: KCl 0.8 mEq/kg/day, K-phos 0.6 mmol/kg/day, no K-acetate. What is the total potassium?', unit: 'mEq/kg/day', ans: () => 0.8 + 0.6 * 1.5, tol: 0.03 },
    { id: 'c7', prompt: 'Calcium gluconate 2 mEq/kg/day and phosphate 0.8 mmol/kg/day. What is the Ca:Phos molar ratio (as X : 1)?', unit: ': 1', ans: () => (2 / 2) / 0.8, tol: 0.04 },
    { id: 'c8', prompt: '4.2 kg infant on lipid 1.5 g/kg/day of 20% emulsion. How many mL of lipid per day?', unit: 'mL/day', ans: () => 1.5 * 4.2 * T.IL_ML_PER_G, tol: 0.03 }
  ];

  // ---------- B. Knowledge check (MCQ) ----------
  const MCQ = [
    { id: 'q1', topic: 'Dextrose', q: 'GIR is 10 mg/kg/min and glucose is 240 mg/dL. Best next step?', opts: ['Advance dextrose by 2 mg/kg/min as planned', 'Hold/reduce GIR and look for contributors', 'Increase lipid to add non-glucose calories', 'Add potassium to the next PN bag'], ans: 1, why: 'Hyperglycemia gates dextrose: do not advance; reduce and assess steroids, sepsis, stress (insulin per protocol).' },
    { id: 'q2', topic: 'Lipid', q: 'TG 285 mg/dL on lipid 2 g/kg/day. According to the cheat sheet:', opts: ['Hold advancement', 'Hold lipid completely', 'Double the dose', 'No action'], ans: 0, why: 'TG 200–300 → hold advancement. TG >300 → hold lipid.' },
    { id: 'q3', topic: 'Lipid', q: 'Which statement about L-carnitine in the cheat sheet is correct?', opts: ['It raises TG and should be avoided in PN', '10 mg/kg/day, up to 20, may lower TG', '100 mg/kg/day is the routine dose for all ages', 'It replaces L-cysteine in infant PN'], ans: 1, why: 'L-carnitine 10 mg/kg/day for infants (up to 20) to help lower TG.' },
    { id: 'q4', topic: 'Protein', q: 'BUN 32 on 2 g/kg/day protein. Which is correct?', opts: ['Advance AA by 0.5 g/kg/day as usual', 'Decrease protein by 0.5–1 g/kg/day and monitor', 'Stop dextrose until BUN improves', 'Switch to a lipid-only regimen'], ans: 1, why: 'BUN ≥30 → decrease protein by 0.5–1 g/kg/day.' },
    { id: 'q5', topic: 'Protein', q: 'Which additive is required for infants under 1 year per the sheet?', opts: ['L-carnitine', 'L-cysteine', 'Insulin', 'Heparin'], ans: 1, why: 'If <1 year: must add L-cysteine.' },
    { id: 'q6', topic: 'Calcium/Phos', q: 'What is the Ca:Phos target?', opts: ['Ca 2 : phos 1, comparing mEq to mEq', 'Match ~1:1 after converting Ca to mmol', 'Phosphate about 5 times the calcium', 'There is no target relationship'], ans: 1, why: 'Try to match 1:1 for bone mineralization, converting Ca gluconate mEq to mmol (÷2) before comparing with phos mmol.' },
    { id: 'q7', topic: 'Calcium/Phos', q: 'Patient has a CaCl infusion running. PN phosphate should be:', opts: ['Increased', 'Unchanged', 'Not added', 'Replaced by acetate'], ans: 2, why: 'DO NOT ADD PHOS IF ON CaCl gtt — precipitation risk.' },
    { id: 'q8', topic: 'Calcium/Phos', q: 'Phosphate in the bag must stay below:', opts: ['0.5 mmol/100 mL', '2 mmol/100 mL', '10 mmol/100 mL', '50 mmol/100 mL'], ans: 1, why: 'Keep phos <2 mmol/100 mL; it can precipitate with calcium.' },
    { id: 'q9', topic: 'Electrolytes', q: 'K-phos 0.5 mmol/kg/day contributes how much potassium?', opts: ['About 0.5 mEq per mmol', '0.75 mEq', 'About 1.5 mEq per mmol', 'About 2 mEq per mmol'], ans: 1, why: '1 mmol K-phos = 1.5 mEq K → 0.75 mEq/kg/day.' },
    { id: 'q10', topic: 'Electrolytes', q: 'Na 130 (major hyponatremia correction step) per the sheet:', opts: ['+0.25 mEq/kg/day, a small bump', '½NS → NS or +3–4 mEq/kg/day', '+0.5 mmol/kg/day, a phosphate step', 'Hold sodium and recheck in a week'], ans: 1, why: 'Sodium major adjustment: ½NS → NS, or +3–4 mEq/kg/day; bolus NS 20 mL/kg if indicated.' },
    { id: 'q11', topic: 'Electrolytes', q: 'Oliguric AKI with K 5.4. PN potassium should be:', opts: ['Increased 1 mEq/kg/day', 'Continued unchanged', 'Removed/minimized', 'Switched to acetate'], ans: 2, why: 'Renal dysfunction → be conservative with K, Phos, Mg.' },
    { id: 'q12', topic: 'Acid–base', q: 'Hyperchloremic metabolic acidosis (Cl 112, CO₂ 16) on PN. The best electrolyte shift is:', opts: ['More chloride and less acetate', 'More acetate, less chloride', 'Stop sodium entirely tonight', 'Add phosphate to the next bag'], ans: 1, why: 'Acetate is metabolized to bicarbonate; reduce chloride load.' },
    { id: 'q13', topic: 'Calcium', q: 'Albumin 2.0, total Ca 7.0. The most useful action is to:', opts: ['Give a calcium bolus right away', 'Check ionized calcium', 'Stop all calcium in the PN', 'Increase phosphate to balance it'], ans: 1, why: 'Low albumin lowers total Ca without lowering free Ca; check ionized Ca.' },
    { id: 'q14', topic: 'Fluids', q: 'Fluid-restricted infant, TG 150, glucose 130, GIR 7. To add calories you should:', opts: ['Raise the PN rate 30% to add calories', 'Concentrate dextrose within the GIR goal', 'Stop protein to save volume', 'Add free-water boluses for hydration'], ans: 1, why: 'Concentrate rather than add volume; stay within GIR and access limits.' },
    { id: 'q15', topic: 'Safety', q: 'Peripheral IV with D15 PN is ordered. The issue is:', opts: ['The calories are too low for age', 'Exceeds peripheral dextrose/osmolarity limits', 'The lipid dose is too high', 'The sodium dose is too low'], ans: 1, why: 'Peripheral PN is generally limited to ~12.5% dextrose and ~900 mOsm/L (verify policy).' },
    { id: 'q16', topic: 'Transition', q: 'Enteral feeds provide 80% of goal calories. PN should:', opts: ['Be advanced', 'Be stopped/weaned off', 'Be converted to peripheral', 'Increase lipid'], ans: 1, why: 'At ~75% enteral (protocol dependent) PN is typically stopped.' },
    { id: 'q17', topic: 'Cardiac', q: 'A 3.5 kg infant is on post-bypass day 2, on furosemide, with CO₂ 31 and Cl 94. Which PN change fits best?', opts: ['Favor chloride salts over acetate', 'Add more acetate to the next bag', 'Remove all sodium from the PN', 'Stop protein for 48 hours'], ans: 0, why: 'Loop diuretics waste chloride and cause alkalosis; chloride salts help, acetate adds to it.' },
    { id: 'q18', topic: 'Cardiac', q: 'K is 3.0 in a post-op infant on diuretics. How should replacement be given?', opts: ['A fast IV push over 1 minute', 'As a slow infusion rate over hours, with monitoring', 'Double the PN potassium in tonight\'s bag', 'Give nothing until K falls below 2.5'], ans: 1, why: 'Potassium is never pushed. Replacement runs as an infusion rate; peripheral concentration is also capped (~40 mEq/L).' },
    { id: 'q19', topic: 'Cardiac', q: 'Post-bypass infant, PN day 1. Which lipid start matches the CCU table?', opts: ['3 g/kg/day', '1 g/kg/day', 'None for 2 weeks', '4 g/kg/day'], ans: 1, why: 'The CCU table starts lipid at 1 g/kg and steps toward 3 as TG allows.' },
    { id: 'q20', topic: 'Cardiac', q: 'Feeds reach 120 mL/kg/day in a recovering cardiac infant. What does the CCU guideline suggest for PN?', opts: ['Advance PN lipid', 'Stop PN', 'Double the dextrose', 'Switch to peripheral PN at full strength'], ans: 1, why: 'At about 120 mL/kg enteral, PN is typically stopped (and lipid is cut earlier, near 80 mL/kg).' },
    { id: 'q21', topic: 'Safety', q: 'A peripheral PN bag has K 50 mEq/L. What is the problem?', opts: ['The sodium is too low for age', 'Above the usual ~40 mEq/L peripheral limit', 'The lipid dose is too high', 'Nothing, potassium is always safe peripherally'], ans: 1, why: 'High potassium concentration injures peripheral veins and is unsafe through a small PIV (verify local limit).' },
    { id: 'q22', topic: 'Cardiac', q: 'Which infant most needs a fluid-concentrated PN design?', opts: ['Post-op infant, fluid-restricted, on diuretics', 'A healthy term newborn on full feeds', 'A toddler tolerating full feeds', 'A teenager eating a normal diet'], ans: 0, why: 'Restriction limits volume, so calories and electrolytes are delivered in a smaller volume.' },
    { id: 'q23', topic: 'Lipid', q: 'A cardiac infant has had no lipid for over 2 weeks. What risk is rising?', opts: ['Essential fatty acid deficiency', 'Hypoglycemia as the only concern', 'Vitamin C excess from the PN', 'Hypernatremia from the carrier fluid'], ans: 0, why: 'Without a minimum lipid dose, essential fatty acid deficiency can develop.' },
    { id: 'q24', topic: 'Calcium/Phos', q: 'Calcium is infusing through the same line as PN. What is the key concern?', opts: ['Precipitation with phosphate', 'Too much glucose delivered', 'Low sodium delivery', 'Lipid separation only, nothing else'], ans: 0, why: 'Calcium and phosphate can precipitate; check compatibility and use a dedicated, labeled line.' }
  ];

  // ---------- C. Order-building cases ----------
  const CASES = [
    {
      id: 'k1', title: 'Case 1 — Build the first PN order', patient: { wt: 5.2, age: 'infant' }, fluidGoal: 80, access: 'central', calciumInfusion: false,
      story: '5-month-old, 5.2 kg, POD 0 after AVSD repair. NPO, central line, urine output adequate. The ICU team restricts total fluids to <b>80 mL/kg/day</b>. No calcium infusion. Build the PN order for <b>PN day 1</b>.',
      labs: { na: 138, k: 4.3, cl: 104, co2: 22, bun: 11, cr: 0.4, glu: 110, ca: 9.0, ica: 1.2, phos: 5.4, mg: 2.0, alb: 3.2, tg: 55, dbili: 0.3, alt: 28, uop: 1.5 },
      start: ord({ access: 'central' }), prev: null,
      items: [
        { id: 'gir', label: 'Day-1 GIR 4–8 mg/kg/min', pts: 3, test: (c) => between(c.gir, 4, 8) ? 1 : (between(c.gir, 3, 4) || between(c.gir, 8, 10)) ? 0.5 : 0, why: 'Start conservatively; advance daily toward the 12–14 infant goal.' },
        { id: 'aa', label: 'Amino acids 1.5–3 g/kg/day', pts: 2, test: (c) => between(c.aa, 1.5, 3) ? 1 : 0, why: 'Start protein early; avoid delaying amino acids.' },
        { id: 'il', label: 'Lipid 0.5–1.5 g/kg/day', pts: 2, test: (c) => between(c.il, 0.5, 1.5) ? 1 : between(c.il, 1.5, 2) ? 0.5 : 0, why: 'Start ~1 g/kg/day and advance with TG.' },
        { id: 'cys', label: 'L-cysteine added (infant <1 yr)', pts: 2, test: (c, o) => o.cysteine ? 1 : 0, why: 'Cheat sheet: if <1 year, must add L-cysteine.' },
        { id: 'fluid', label: 'Total fluids ≤80 mL/kg/day (including lipid)', pts: 3, test: (c) => c.totalFluids <= 80 ? 1 : c.totalFluids <= 88 ? 0.5 : 0, why: 'Concentrate, don\'t add volume. Lipid volume counts.' },
        { id: 'kcal', label: 'Total 40–85 kcal/kg/day (partial day-1 provision)', pts: 2, test: (c) => between(c.totalKcalKg, 40, 85) ? 1 : (between(c.totalKcalKg, 30, 40) || between(c.totalKcalKg, 85, 95)) ? 0.5 : 0, why: 'Day 1 is a partial provision building toward goal (85–105).' },
        { id: 'na', label: 'Sodium 2–5 mEq/kg/day', pts: 2, test: (c) => between(c.tot.na, 2, 5) ? 1 : between(c.tot.na, 1, 2) ? 0.5 : 0, why: 'Cheat sheet range for infants.' },
        { id: 'k', label: 'Potassium ≤4 mEq/kg/day', pts: 1, test: (c) => c.tot.k <= 4 ? 1 : 0, why: 'Cheat sheet max 2–4 mEq/kg/day (UOP adequate, K 4.3).' },
        { id: 'ca', label: 'Calcium 0.5–2.5 mEq/kg/day', pts: 1, test: (c) => between(c.tot.ca, 0.5, 2.5) ? 1 : 0, why: 'Neonates/infants need Ca early; sheet range 0.5–4.' },
        { id: 'phos', label: 'Phosphate absent, or in range with Ca:Phos 0.6–1.6', pts: 2, test: (c) => c.tot.phos === 0 ? 0.5 : (between(c.tot.phos, 0.5, 2) && c.tot.ca > 0 && between(c.caPRatio || 0, 0.6, 1.6)) ? 1 : 0, why: 'Phos 0.5–2 mmol/kg/day with Ca:Phos balance; day-1 omission is only partial credit.' },
        { id: 'mg', label: 'Magnesium 0.3–0.5 mEq/kg/day', pts: 1, test: (c) => between(c.tot.mg, 0.3, 0.5) ? 1 : c.tot.mg === 0 ? 0.5 : 0, why: 'Cheat sheet range.' }
      ],
      crits: [
        { id: 'gir12', label: 'GIR >12 mg/kg/min on PN day 1', test: (c) => c.gir > 12 },
        { id: 'il3', label: 'Lipid >3 g/kg/day', test: (c) => c.il > 3 },
        { id: 'phos100', label: 'Phosphate ≥2 mmol/100 mL (precipitation)', test: (c) => c.phosPer100 >= 2 },
        { id: 'fluid120', label: 'Total fluids >20% over the restriction', test: (c) => c.totalFluids > 80 * 1.2 },
        { id: 'k4', label: 'Potassium above sheet maximum (4 mEq/kg/day)', test: (c) => c.tot.k > 4 }
      ],
      multis: [{
        id: 'monitor', prompt: 'Select <b>all</b> monitoring that belongs in the first-week PN plan:', pts: 4,
        options: [
          { t: 'BMP (Na, K, Cl, CO₂, BUN, Cr)', ok: true }, { t: 'Glucose', ok: true }, { t: 'Calcium / phosphorus / magnesium', ok: true },
          { t: 'Triglycerides', ok: true }, { t: 'Liver panel / direct bilirubin (periodic)', ok: true }, { t: 'Daily weight', ok: true },
          { t: 'Ammonia daily', ok: false }, { t: 'Blood culture daily', ok: false }
        ]
      }]
    },

    {
      id: 'k2', title: 'Case 2 — Advance PN day 3 from labs', patient: { wt: 14, age: 'child' }, fluidGoal: 90, access: 'central', calciumInfusion: false,
      story: '3-year-old, 14 kg, PN day 3. Yesterday\'s order is loaded. Feeds started today (8 × 40 mL of 20 kcal/oz). Fluid goal <b>90 mL/kg/day</b> (including lipid). Review the labs and write today\'s order.',
      labs: { na: 136, k: 3.1, cl: 100, co2: 24, bun: 18, cr: 0.4, glu: 168, ca: 8.9, ica: 1.15, phos: 2.7, mg: 1.5, alb: 3.2, tg: 240, dbili: 0.4, alt: 32, uop: 2.0 },
      prev: ord({ rate: 34, dex: 12.5, aa: 1.5, il: 1.5, cysteine: false, lytes: { naCl: 3, kCl: 1, naPhos: 0.25, ca: 1, mg: 0.3 }, feeds: { n: 0, vol: 0, kcalOz: 0 } }),
      start: ord({ rate: 34, dex: 12.5, aa: 1.5, il: 1.5, cysteine: false, lytes: { naCl: 3, kCl: 1, naPhos: 0.25, ca: 1, mg: 0.3 }, feeds: { n: 8, vol: 40, kcalOz: 20 } }),
      items: [
        { id: 'gir', label: 'GIR advanced ~1–2 mg/kg/min (glucose 168 acceptable)', pts: 3, test: (c, o, p) => { const d = c.gir - p.gir; return between(d, 0.7, 2.3) ? 1 : (between(d, 0.2, 0.7) || between(d, 2.3, 3)) ? 0.5 : 0; }, why: 'Glucose <180 → advance dextrose ~1–2 mg/kg/min.' },
        { id: 'il', label: 'Lipid NOT advanced (TG 240)', pts: 3, test: (c, o, p) => c.il <= p.il + 1e-9 ? 1 : 0, why: 'TG 200–300 → hold advancement.' },
        { id: 'aa', label: 'Amino acids held or advanced to ≤2 g/kg/day', pts: 2, test: (c, o, p) => between(c.aa, p.aa, 2) ? 1 : 0, why: 'BUN 18 → protein can advance toward the child goal.' },
        { id: 'k', label: 'Potassium increased ~1 mEq/kg/day (K 3.1)', pts: 3, test: (c, o, p) => { const d = c.tot.k - p.tot.k; return between(d, 0.7, 2) ? 1 : between(d, 0.3, 0.7) ? 0.5 : 0; }, why: 'K <3.5 → minor increase of +1 mEq/kg/day (sheet).' },
        { id: 'phos', label: 'Phosphate increased 0.2–0.6 mmol/kg/day (phos 2.7)', pts: 3, test: (c, o, p) => { const d = c.tot.phos - p.tot.phos; return between(d, 0.2, 0.6) ? 1 : (between(d, 0.1, 0.2) || between(d, 0.6, 0.9)) ? 0.5 : 0; }, why: 'Low phos → minor +0.25 or major +0.5 mmol/kg/day.' },
        { id: 'mg', label: 'Magnesium increased 0.2–0.5 mEq/kg/day (Mg 1.5)', pts: 2, test: (c, o, p) => between(c.tot.mg - p.tot.mg, 0.2, 0.5) ? 1 : 0, why: 'Low Mg → +0.3 (minor) or +0.5 (major).' },
        { id: 'cap', label: 'Ca:Phos kept 0.6–1.6 after raising phos', pts: 2, test: (c) => c.tot.phos > 0 && between(c.caPRatio || 0, 0.6, 1.6) ? 1 : 0, why: 'Raising phos without Ca skews the ratio and risks precipitation.' },
        { id: 'na', label: 'Sodium unchanged (±1 mEq/kg/day)', pts: 1, test: (c, o, p) => Math.abs(c.tot.na - p.tot.na) <= 1 ? 1 : 0, why: 'Na 136 is acceptable — no sodium change needed.' },
        { id: 'kcal', label: 'Total 60–90 kcal/kg/day (PN + feeds)', pts: 2, test: (c) => between(c.totalKcalKg, 60, 90) ? 1 : 0, why: 'Count enteral calories; avoid under- or overfeeding.' },
        { id: 'fluid', label: 'Total fluids ≤90 mL/kg/day (feeds + lipid included)', pts: 2, test: (c) => c.totalFluids <= 90 ? 1 : c.totalFluids <= 99 ? 0.5 : 0, why: 'Feeds started — PN volume must not stack on top.' }
      ],
      crits: [
        { id: 'ilAdv', label: 'Lipid advanced with TG 240', test: (c, o, p) => c.il > p.il + 1e-9 },
        { id: 'phos100', label: 'Phosphate ≥2 mmol/100 mL (precipitation)', test: (c) => c.phosPer100 >= 2 },
        { id: 'k4', label: 'Potassium above sheet maximum (4 mEq/kg/day)', test: (c) => c.tot.k > 4 },
        { id: 'girJump', label: 'GIR raised >4 mg/kg/min in one day (usual daily step 2–4)', test: (c, o, p) => c.gir - p.gir > 4 }
      ],
      multis: []
    },

    {
      id: 'k3', title: 'Case 3 — Rising TG, high glucose, early cholestasis', patient: { wt: 4.4, age: 'infant' }, fluidGoal: 130, access: 'central', calciumInfusion: false,
      story: '6-month-old, 4.4 kg, <b>PN day 18</b>. TG 410, glucose 236, direct bilirubin 3.1, ALT 96. Yesterday\'s PN is loaded: dextrose 22%, lipid 3 g/kg/day, AA 3 g/kg/day. Minimal trophic feeds. Fluid goal 130 mL/kg/day. Revise the PN order.',
      labs: { na: 137, k: 4.6, cl: 102, co2: 24, bun: 9, cr: 0.3, glu: 236, ca: 9.2, ica: 1.2, phos: 5.4, mg: 2.1, alb: 2.9, tg: 410, dbili: 3.1, alt: 96, uop: 2.6 },
      prev: ord({ rate: 18, dex: 22, aa: 3, il: 3, cysteine: true, carnitine: 0, lytes: { naCl: 3, kAc: 2, ca: 2, naPhos: 0.5, kPhos: 0.5, mg: 0.4 }, feeds: { n: 8, vol: 8, kcalOz: 20 } }),
      start: ord({ rate: 18, dex: 22, aa: 3, il: 3, cysteine: true, carnitine: 0, lytes: { naCl: 3, kAc: 2, ca: 2, naPhos: 0.5, kPhos: 0.5, mg: 0.4 }, feeds: { n: 8, vol: 8, kcalOz: 20 } }),
      items: [
        { id: 'il', label: 'Lipid held (0) — or minimized to ≤1 g/kg/day', pts: 4, test: (c) => c.il === 0 ? 1 : c.il <= 1 ? 0.75 : 0, why: 'TG >300 → hold lipid (sheet). Many protocols minimize to 0.5–1 g/kg/day to avoid EFAD — partial credit.' },
        { id: 'gir', label: 'GIR reduced by ≥1.5 and ≥8 (glucose 236, prior GIR above goal)', pts: 4, test: (c, o, p) => (c.gir <= p.gir - 1.5 && c.gir >= 8) ? 1 : (c.gir < p.gir && c.gir >= 6) ? 0.5 : 0, why: 'Hyperglycemia + overfeeding → lower GIR toward the 12–14 infant goal and below.' },
        { id: 'carn', label: 'L-carnitine 10–20 mg/kg/day', pts: 3, test: (c, o) => between(T.num(o.carnitine), 10, 20) ? 1 : 0, why: 'Cheat sheet: L-carnitine helps lower TG, 10 mg/kg/day up to 20 in infants.' },
        { id: 'aa', label: 'Amino acids preserved 2–3.5 g/kg/day', pts: 2, test: (c) => between(c.aa, 2, 3.5) ? 1 : 0, why: 'Protect protein while removing lipid calories.' },
        { id: 'kcal', label: 'Total 60–105 kcal/kg/day (no starving, no overfeeding)', pts: 2, test: (c) => between(c.totalKcalKg, 60, 105) ? 1 : 0, why: 'Overfeeding with dextrose worsens hyperglycemia and steatosis.' },
        { id: 'cys', label: 'L-cysteine retained (infant)', pts: 1, test: (c, o) => o.cysteine ? 1 : 0, why: 'Infant <1 yr must have cysteine.' },
        { id: 'fluid', label: 'Total fluids ≤130 mL/kg/day', pts: 2, test: (c) => c.totalFluids <= 130 ? 1 : 0, why: 'Stay within the goal.' }
      ],
      crits: [
        { id: 'ilKeep', label: 'Lipid >1 g/kg/day with TG 410', test: (c) => c.il > 1 },
        { id: 'girUp', label: 'GIR not reduced despite glucose 236', test: (c, o, p) => c.gir >= p.gir },
        { id: 'carn20', label: 'L-carnitine above 20 mg/kg/day', test: (c, o) => T.num(o.carnitine) > 20 }
      ],
      multis: [{
        id: 'ifald', prompt: 'Direct bilirubin is 3.1. Select <b>all</b> reasonable strategies:', pts: 4,
        options: [
          { t: 'Minimize soybean-oil lipid dose / discuss alternative (e.g., fish-oil-containing) emulsion with pharmacy & GI', ok: true },
          { t: 'Advance enteral feeds as tolerated', ok: true },
          { t: 'Evaluate for and prevent line infection / sepsis', ok: true },
          { t: 'Shorten or cycle PN when feasible', ok: true },
          { t: 'Increase lipid to give more calories', ok: false },
          { t: 'Stop amino acids', ok: false }
        ]
      }]
    }
  ];

  const PASS = { calc: 7 / 8, mcq: 0.8, cases: 0.8, noCritical: true };

  /** Score one order against a case rubric. Returns per-item results + critical errors. */
  function scoreCase(cs, order) {
    const c = T.calc(cs.patient, order), p = cs.prev ? T.calc(cs.patient, cs.prev) : null;
    let earned = 0, max = 0;
    const items = cs.items.map(it => {
      const f = it.test(c, order, p), got = f * it.pts; earned += got; max += it.pts;
      return { id: it.id, label: it.label, pts: it.pts, got, f, why: it.why };
    });
    const crits = cs.crits.filter(x => x.test(c, order, p)).map(x => ({ id: x.id, label: x.label }));
    return { earned, max, items, crits, calc: c };
  }
  /** Multi-select scoring: (correct picks − wrong picks) / #correct, floored at 0. */
  function scoreMulti(m, picked) {
    const nOk = m.options.filter(o => o.ok).length;
    let hits = 0, wrong = 0; m.options.forEach((o, i) => { if (picked.includes(i)) { if (o.ok) hits++; else wrong++; } });
    const frac = Math.max(0, (hits - wrong) / nOk);
    return { got: frac * m.pts, max: m.pts, hits, wrong, nOk };
  }
  /** Overall result from the three sections. */
  function summarize(parts) {
    const calcFrac = parts.calcMax ? parts.calcGot / parts.calcMax : 0;
    const mcqFrac = parts.mcqMax ? parts.mcqGot / parts.mcqMax : 0;
    const caseFrac = parts.caseMax ? parts.caseGot / parts.caseMax : 0;
    const crit = parts.crits.length;
    const pass = calcFrac >= PASS.calc - 1e-9 && mcqFrac >= PASS.mcq - 1e-9 && caseFrac >= PASS.cases - 1e-9 && crit === 0;
    return { calcFrac, mcqFrac, caseFrac, crit, pass };
  }

  root.TPNC = Object.assign(root.TPNC || {}, { CHECK: { CALC, MCQ, CASES, PASS, scoreCase, scoreMulti, summarize } });
})(typeof window !== 'undefined' ? window : globalThis);
