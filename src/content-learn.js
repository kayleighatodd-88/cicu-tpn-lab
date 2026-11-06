/* Learn modules. Source tags:  S = TCPCHD cheat sheet · C = commonly cited (verify locally) · D = teaching default. */
(function (root) {
  'use strict';
  const T = root.TPN;
  const S = '<span class="tag tag-s" title="From the TCPCHD TPN &amp; TF cheat sheet">sheet</span>';
  const C = '<span class="tag tag-c" title="Commonly cited — verify against your institutional protocol">verify</span>';
  const D = '<span class="tag tag-d" title="Teaching default — replace with your institution\'s protocol">default</span>';

  const num = (c, k) => c[k];
  const ord = (o) => Object.assign(T.emptyOrder(), o || {});

  const MODULES = [
    {
      id: 'm1', title: 'TPN fundamentals', min: 10,
      objectives: ['List what is in a pediatric PN prescription and why each part is there.', 'Choose peripheral vs central access using dextrose % and osmolarity.', 'Name the main risks that drive monitoring.'],
      body: `
<h3>What PN is</h3>
<p>Parenteral nutrition supplies calories (dextrose and lipid), protein (amino acids), fluid, electrolytes/minerals, vitamins and trace elements when the gut cannot meet needs. In pediatric cardiac patients common reasons are post-operative feeding intolerance, low-output states, gut ischemia concerns, chylothorax and prolonged NPO periods.</p>
<h3>The building blocks (and how this lab models them)</h3>
<ul>
 <li><b>Dextrose</b> — 3.4 kcal/g ${S}. Ordered as a concentration (%); delivery is judged by the glucose infusion rate (GIR).</li>
 <li><b>Amino acids</b> — 4 kcal/g ${S}. Ordered in g/kg/day.</li>
 <li><b>Lipid</b> — 10 kcal/g (20% emulsion = 2 kcal/mL) ${S}. Ordered in g/kg/day; 5 mL per gram of 20%.</li>
 <li><b>Electrolytes</b> — Na, K, Cl/acetate, phosphate, Ca, Mg. Ordered per kg/day; the bag label shows mEq/L.</li>
 <li><b>Additives</b> — L-cysteine (infants), L-carnitine, vitamins and trace elements, insulin when needed. This lab models cysteine and carnitine.</li>
</ul>
<h3>Access and osmolarity</h3>
<p>Concentrated PN damages small peripheral veins. A commonly cited peripheral ceiling is about <b>12.5% dextrose</b> and <b>~900 mOsm/L</b> ${C}; anything more concentrated needs central access. The lab shows an <i>estimated</i> osmolarity — pharmacy's compounded value is the one that counts.</p>
<h3>Risks that drive monitoring</h3>
<p>Line infection, hyper-/hypoglycemia, hypertriglyceridemia, electrolyte and mineral shifts, refeeding, cholestasis/PN-associated liver disease, essential fatty acid deficiency (too little lipid), metabolic bone disease, and fluid overload — especially important in cardiac patients.</p>`,
      tasks: [{
        type: 'order', prompt: 'This 8 kg infant has only a <b>peripheral</b> IV. Build a PN at 20 mL/hr that is peripheral-safe: dextrose ≤12.5%, estimated osmolarity ≤900 mOsm/L, with amino acids included.',
        patient: { wt: 8, age: 'infant' }, start: ord({ rate: 20, access: 'peripheral' }),
        hint: 'Amino acids and sodium add a lot of osmolarity at a small rate. Try dextrose ~10%, AA 1.5 g/kg/day, modest sodium.',
        check: (c, o) => [
          { ok: o.access === 'peripheral' && c.dex <= 12.5 && c.dex > 0, msg: `Dextrose ${c.dex}% (≤12.5%)` },
          { ok: c.osm <= 900, msg: `Estimated osmolarity ${Math.round(c.osm)} mOsm/L (≤900)` },
          { ok: c.aa > 0, msg: `Amino acids ${c.aa} g/kg/day included` }]
      }],
      quiz: [
        { q: 'The main factor limiting peripheral PN is:', opts: ['Total calories', 'Osmolarity / dextrose concentration', 'Lipid dose', 'Weight'], ans: 1, why: 'Hyperosmolar solutions injure peripheral veins (phlebitis, infiltration). Concentrated PN needs central access.' },
        { q: 'Which complication is most tied to PN duration in infants?', opts: ['Hypoglycemia', 'Cholestasis / PN-associated liver disease', 'Hypernatremia', 'Alkalosis'], ans: 1, why: 'Cholestasis risk climbs with PN duration and soybean-oil lipid load, especially in infants — one reason to advance feeds and shorten PN.' },
        { q: 'Before any PN calculation you should first confirm:', opts: ['The lipid brand', 'The dosing weight', 'The line length', 'The feeding schedule'], ans: 1, why: 'Every dose is per kg; a wrong weight scales every number (GIR, kcal/kg, mEq/kg/day) wrongly.' }
      ]
    },

    {
      id: 'm2', title: 'Reading an order: volume & units', min: 8,
      objectives: ['Convert mL/hr ↔ mL/kg/day and L/day.', 'Explain why bag concentration (mEq/L) differs from dose (mEq/kg/day).'],
      body: `
<h3>Three ways to say the same volume</h3>
<p><b>TPN L/day = mL/hr × 24 ÷ 1000</b> ${S} and <b>mL/kg/day = mL/hr × 24 ÷ weight</b>. A 5 kg infant on 20 mL/hr gets 480 mL/day = 96 mL/kg/day.</p>
<h3>Dose vs concentration</h3>
<p>Electrolytes are dosed in <b>mEq/kg/day</b> but the pharmacy label shows <b>mEq/L</b>. Convert with TPN L/day: <b>mEq/kg/day = mEq/L × TPN L/day ÷ weight</b> and the reverse ${S}. If you hold the dose and change the rate, the concentration changes — and vice versa.</p>
<h3>Practice habit</h3>
<p>Always write the unit. Most calculation errors in PN are unit errors (mmol vs mEq, per day vs per kg, mL vs L).</p>`,
      tasks: [
        { type: 'numeric', prompt: 'A 6 kg infant needs 120 mL/kg/day of PN. What TPN rate (mL/hr) is that?', unit: 'mL/hr', answer: () => 120 * 6 / 24, tol: 0.03, explain: '120 × 6 ÷ 24 = 30 mL/hr.' },
        { type: 'numeric', prompt: 'PN is running at 18 mL/hr in a 7.2 kg child. How many mL/kg/day is that?', unit: 'mL/kg/day', answer: () => 18 * 24 / 7.2, tol: 0.03, explain: '18 × 24 ÷ 7.2 = 60 mL/kg/day.' }
      ],
      quiz: [
        { q: '5 kg infant, PN at 20 mL/hr. mL/kg/day?', opts: ['48', '96', '100', '480'], ans: 1, why: '20 × 24 = 480 mL/day ÷ 5 kg = 96 mL/kg/day.' },
        { q: 'If you keep Na at 3 mEq/kg/day but halve the TPN rate, the Na concentration (mEq/L) will:', opts: ['Halve', 'Stay the same', 'Double', 'Be zero'], ans: 2, why: 'mEq/L = dose × weight ÷ TPN L/day. Half the volume carrying the same dose doubles concentration.' },
        { q: 'Which unit is phosphate dosed in on the cheat sheet?', opts: ['mEq/kg/day', 'mmol/kg/day', 'mg/dL', 'mOsm/L'], ans: 1, why: 'Phosphate is mmol; calcium gluconate and magnesium are mEq. Mixing them causes ratio errors.' }
      ]
    },

    {
      id: 'm3', title: 'Dextrose & GIR', min: 10,
      objectives: ['Calculate GIR and set dextrose % to hit a target GIR.', 'Know age goals and when to hold or reduce.'],
      body: `
<h3>GIR</h3>
<p><b>GIR (mg/kg/min) = dextrose % × mL/hr ÷ weight ÷ 6</b> ${S}. The 6 converts % (g per 100 mL → 10 mg/mL) and mL/hr to mg/min.</p>
<h3>Goals by age</h3>
<p>Infants 12–14, children 8–10, adolescents 5–6 mg/kg/min ${S}. Those are <i>goals</i>: you start lower and advance (about 1–2 mg/kg/min/day ${D}) as glucose allows.</p>
<h3>When to hold or back off</h3>
<ul>
 <li>Glucose &gt;180 mg/dL: don't advance; consider lowering GIR/insulin ${D}.</li>
 <li>High dextrose loads raise CO₂ production — be careful in respiratory failure ${S}.</li>
 <li>Very low GIR (&lt;~2.5) risks hypoglycemia if no other glucose source ${D}.</li>
</ul>`,
      tasks: [
        { type: 'order', prompt: '4.0 kg infant running PN at 16 mL/hr. Set the dextrose % that delivers a <b>GIR of 8 mg/kg/min</b> (±0.4).', patient: { wt: 4, age: 'infant' }, start: ord({ rate: 16 }), hint: 'dextrose % = GIR × 6 × weight ÷ mL/hr.',
          check: (c) => [{ ok: Math.abs(c.gir - 8) <= 0.4, msg: `GIR ${T.r(c.gir)} (target 8 ± 0.4)` }] },
        { type: 'numeric', prompt: 'What GIR does D12.5 at 20 mL/hr give a 5 kg infant?', unit: 'mg/kg/min', answer: () => 12.5 * 20 / 5 / 6, tol: 0.03, explain: '12.5 × 20 ÷ 5 ÷ 6 = 8.33.' }
      ],
      quiz: [
        { q: 'GIR 9 mg/kg/min and glucose 220. Best action?', opts: ['Advance dextrose', 'Hold/reduce GIR and reassess (consider insulin)', 'Stop all amino acids', 'Add more lipid'], ans: 1, why: 'Hyperglycemia gates dextrose: don\'t advance, consider lowering, and look for contributors (steroids, sepsis, stress).' },
        { q: 'Why be cautious with high dextrose in respiratory failure?', opts: ['It lowers pH only', 'Glucose oxidation produces more CO₂', 'It causes hypocalcemia', 'It raises BUN'], ans: 1, why: 'Excess carbohydrate raises CO₂ production, increasing ventilatory demand.' },
        { q: 'The goal GIR for a child (1–10 yr) on the cheat sheet is:', opts: ['5–6', '8–10', '12–14', '16–18'], ans: 1, why: 'Infants 12–14, children 8–10, adolescents 5–6 mg/kg/min.' }
      ]
    },

    {
      id: 'm4', title: 'Amino acids & protein', min: 8,
      objectives: ['Dose protein per kg and calculate its kcal.', 'Apply the infant L-cysteine and BUN rules.'],
      body: `
<h3>Dose</h3>
<p>AA is ordered in <b>g/kg/day</b> and provides <b>4 kcal/g</b> ${S}. Commonly cited goals: infants ~2–3, children 1–10 yr ~1–2, adolescents ~0.8–1.5 g/kg/day ${C}. Start early and advance in ~0.5 g/kg/day steps ${D}.</p>
<h3>L-cysteine</h3>
<p><b>If &lt;1 year: must add L-cysteine</b> ${S}. Infants make cysteine poorly; it also acidifies the solution, which helps calcium–phosphate stay in solution.</p>
<h3>Renal and hepatic dysfunction</h3>
<p>Be conservative with protein; <b>when BUN ≥30, decrease protein by 0.5–1 g/kg/day</b> and monitor BUN closely ${S}.</p>`,
      tasks: [
        { type: 'order', prompt: '3.4 kg neonate at 14 mL/hr. Order amino acids between <b>2 and 3 g/kg/day</b> and include the required infant additive.', patient: { wt: 3.4, age: 'infant' }, start: ord({ rate: 14, dex: 10 }),
          check: (c, o) => [{ ok: c.aa >= 2 && c.aa <= 3, msg: `AA ${c.aa} g/kg/day (2–3)` }, { ok: !!o.cysteine, msg: 'L-cysteine added' }] },
        { type: 'numeric', prompt: 'A 6 kg infant is on 2.5 g/kg/day amino acids. How many kcal/day from protein?', unit: 'kcal/day', answer: () => 2.5 * 6 * 4, tol: 0.03, explain: '2.5 × 6 = 15 g × 4 kcal/g = 60 kcal.' }
      ],
      quiz: [
        { q: 'Protein provides how many kcal per gram?', opts: ['3.4', '4', '9', '10'], ans: 1, why: 'Amino acids 4, dextrose 3.4, lipid 10 kcal/g (as used on the sheet).' },
        { q: 'BUN is 34 on 2.5 g/kg/day AA. The cheat sheet says:', opts: ['Advance AA', 'Decrease protein by 0.5–1 g/kg/day', 'Stop dextrose', 'Double the lipid'], ans: 1, why: 'BUN ≥30 → reduce protein 0.5–1 g/kg/day and follow BUN closely.' },
        { q: 'Why add L-cysteine in infants?', opts: ['Raises glucose', 'Conditionally essential in infants and aids Ca/Phos solubility', 'Lowers TG', 'Replaces carnitine'], ans: 1, why: 'Infants have limited cysteine synthesis; cysteine also lowers pH, improving calcium–phosphate solubility.' }
      ]
    },

    {
      id: 'm5', title: 'Lipids, triglycerides & L-carnitine', min: 12,
      objectives: ['Dose lipid, count its calories and volume.', 'Apply the TG hold rules.', 'Know when and how to use L-carnitine.'],
      body: `
<h3>Dose, calories, volume</h3>
<p>Lipid in g/kg/day × weight × 10 kcal/g ${S}. 20% emulsion contains 0.2 g/mL, so <b>5 mL per gram</b>: 2 g/kg/day in a 5 kg infant is 10 g = 50 mL/day. The cheat sheet's total-fluid line does not include this volume — in fluid-restricted cardiac patients add it.</p>
<p>Usual practice: start ~1 g/kg/day, advance 0.5–1 g/kg/day, usual ceiling ~3 g/kg/day ${D}${C}.</p>
<h3>Triglyceride rules</h3>
<ul>
 <li><b>TG 200–300:</b> hold advancement ${S}.</li>
 <li><b>TG &gt;300:</b> hold lipid ${S} (some protocols reduce to 0.5–1 g/kg/day to avoid essential fatty acid deficiency — follow local policy).</li>
</ul>
<p>Look for modifiable contributors: excess dextrose, sepsis, steroids, other lipid sources (e.g., propofol), prolonged PN.</p>
<h3>L-carnitine</h3>
<p>L-carnitine <b>helps lower TG; 10 mg/kg/day for infants, up to 20 mg/kg/day</b> ${S}. Most relevant with prolonged PN or low carnitine stores.</p>
<h3>Lipid type</h3>
<p>Pharmacy/GI may choose soy-, mixed-oil (e.g., SMOF) or fish-oil emulsions, especially with cholestasis ${C}. The lab treats them as "lipid g/kg/day".</p>`,
      tasks: [
        { type: 'order', prompt: '5 kg infant on lipid 2 g/kg/day. <b>TG today is 260.</b> Revise the order: do not advance lipid, and add L-carnitine in the cheat-sheet range.', patient: { wt: 5, age: 'infant' }, ctx: { tg: 260 },
          start: ord({ rate: 18, dex: 12, aa: 2.5, il: 2, cysteine: true }), prev: ord({ rate: 18, dex: 12, aa: 2.5, il: 2, cysteine: true }),
          check: (c, o) => [{ ok: c.il <= 2, msg: `Lipid ${c.il} g/kg/day (not above 2)` }, { ok: T.num(o.carnitine) >= 10 && T.num(o.carnitine) <= 20, msg: `L-carnitine ${o.carnitine || 0} mg/kg/day (10–20)` }] },
        { type: 'numeric', prompt: 'A 3.8 kg infant is on lipid 2.5 g/kg/day (20% emulsion). How many mL/day of lipid is that?', unit: 'mL/day', answer: () => 2.5 * 3.8 * T.IL_ML_PER_G, tol: 0.03, explain: '2.5 × 3.8 = 9.5 g × 5 mL/g = 47.5 mL.' }
      ],
      quiz: [
        { q: 'TG is 250 and lipid is 1.5 g/kg/day. Best move?', opts: ['Advance to 2.5', 'Hold advancement and recheck', 'Double carnitine only', 'Stop amino acids'], ans: 1, why: 'TG 200–300 → hold advancement (not necessarily reduce); recheck, address contributors.' },
        { q: '2 g/kg/day lipid provides how many kcal/kg/day?', opts: ['8', '10', '20', '40'], ans: 2, why: '2 g × 10 kcal/g = 20 kcal/kg/day.' },
        { q: 'Cheat-sheet L-carnitine dosing for infants:', opts: ['1–2 mg/kg/day', '10 up to 20 mg/kg/day', '100 mg/kg/day', '2 mEq/kg/day'], ans: 1, why: '10 mg/kg/day for infants, up to 20 mg/kg/day.' }
      ]
    },

    {
      id: 'm6', title: 'Total calories, protein–energy & fluids', min: 12,
      objectives: ['Add PN and enteral calories to a total kcal/kg/day.', 'Check calories against goals and fluids against a restriction.'],
      body: `
<h3>Add everything</h3>
<p><b>Total kcal/kg/day = PN kcal/kg + enteral kcal/kg</b> ${S}. Enteral kcal/kg = feeds/day × volume ÷ 30 × (kcal per 30 mL) ÷ weight. Goals on the sheet: infants 85–105 (non-cardiac), adolescents 30–50 kcal/kg/day ${S}. The sheet lists no child goal — this lab uses ~60–90 ${C}; cardiac patients may differ, so set the goal with the team.</p>
<h3>Where the calories come from</h3>
<p>Look at the split among dextrose, protein and lipid. Protein should not be spent as fuel: enough non-protein calories (roughly 150–250 kcal per g of nitrogen, i.e. about 25–40 kcal per g of protein, is a usual teaching aim ${C}) spare protein for growth. The lab shows this as the NPC:N ratio.</p>
<h3>Fluids</h3>
<p><b>Total fluids = (TPN + IVF) × 24 ÷ wt + feeds mL/kg + lipid mL/kg.</b> In a fluid-restricted patient you get calories by <i>concentrating</i>, not by adding volume.</p>`,
      tasks: [
        { type: 'order', prompt: '5 kg infant already getting feeds (8 × 30 mL of 20 kcal/oz). Build PN so <b>total kcal is 85–105/kg/day</b>, <b>total fluids ≤120 mL/kg/day</b> (including lipid), GIR ≤14, and AA ≥2 g/kg/day.', patient: { wt: 5, age: 'infant' },
          start: ord({ rate: 12, cysteine: true, feeds: { n: 8, vol: 30, kcalOz: 20 } }), fluidGoal: 120,
          hint: 'Feeds supply ~32 kcal/kg and 48 mL/kg. Remaining PN volume is what is left under 120 minus lipid mL/kg.',
          check: (c) => [{ ok: c.totalKcalKg >= 85 && c.totalKcalKg <= 105, msg: `Total ${T.r(c.totalKcalKg, 0)} kcal/kg/day (85–105)` }, { ok: c.totalFluids <= 120, msg: `Total fluids ${T.r(c.totalFluids, 0)} mL/kg/day (≤120)` }, { ok: c.gir <= 14 && c.gir > 0, msg: `GIR ${T.r(c.gir)} (≤14)` }, { ok: c.aa >= 2, msg: `AA ${c.aa} g/kg/day (≥2)` }] }
      ],
      quiz: [
        { q: 'Enteral: 8 feeds × 30 mL of 20 kcal/oz in a 5 kg infant ≈ ?', opts: ['16 kcal/kg', '32 kcal/kg', '64 kcal/kg', '160 kcal/kg'], ans: 1, why: '240 mL ÷ 30 × 20 = 160 kcal ÷ 5 kg = 32 kcal/kg/day.' },
        { q: 'To raise calories in a fluid-restricted infant you should mainly:', opts: ['Increase the rate', 'Concentrate the PN', 'Stop lipid', 'Add IVF'], ans: 1, why: 'Concentrate dextrose (within GIR/access limits) rather than adding volume.' },
        { q: 'The cheat-sheet total fluid line omits:', opts: ['IVF', 'Feeds', 'Lipid volume', 'TPN'], ans: 2, why: 'Lipid is run as its own volume; add 5 mL per gram of 20% emulsion.' }
      ]
    },

    {
      id: 'm7', title: 'Electrolytes I: Na, K, Cl/acetate', min: 12,
      objectives: ['Convert between bag mEq/L and mEq/kg/day.', 'Count K from K-phos.', 'Choose chloride vs acetate from the acid–base picture.'],
      body: `
<h3>Ranges (cheat sheet ${S})</h3>
<p>Sodium 2–5 mEq/kg/day (infants/children), 1–2 (adolescents). Potassium 2–4 (infants/children), 1–2 (adolescents).</p>
<h3>Counting potassium</h3>
<p>K total = KCl + K-acetate + <b>1.5 × K-phos (mmol)</b> ${S}: each mmol of potassium phosphate carries 1.5 mEq K.</p>
<h3>Adjusting</h3>
<p>Sodium minor: ½NS → ¾NS → NS or +1–2 mEq/kg/day; major: ½NS → NS or +3–4. Potassium minor +1 mEq/kg/day (10 mEq/L), major +1.5–2 (20 mEq/L). Remember NS = 154, ½NS = 77, ¼NS = 38 mEq/L ${S}.</p>
<h3>Chloride vs acetate</h3>
<p>Acetate is converted to bicarbonate: useful in metabolic acidosis or hyperchloremia. With loop diuretics (hypochloremic alkalosis) favor chloride ${D}. Acetate steps: minor +1, major +2 mEq/kg/day ${S}.</p>
<h3>Safety</h3>
<p>In renal dysfunction or oliguria be conservative with K ${S}; hyperkalemia → remove K until it falls.</p>`,
      tasks: [
        { type: 'numeric', prompt: 'A bag contains K 30 mEq/L and runs at 20 mL/hr in a 7 kg child. What is the K dose in mEq/kg/day?', unit: 'mEq/kg/day', answer: () => 30 * (20 * 24 / 1000) / 7, tol: 0.03, explain: '30 × 0.48 L/day ÷ 7 kg = 2.06.' },
        { type: 'numeric', prompt: 'Orders: KCl 1.0 mEq/kg/day, K-acetate 0.5 mEq/kg/day, K-phos 0.4 mmol/kg/day. Total potassium (mEq/kg/day)?', unit: 'mEq/kg/day', answer: () => 1 + 0.5 + 0.4 * 1.5, tol: 0.02, explain: '1.0 + 0.5 + 1.5 × 0.4 = 2.1.' },
        { type: 'order', prompt: '6.8 kg infant on furosemide: Na 134, K 3.3, Cl 96, CO₂ 31 (alkalosis). Set total K <b>2–4 mEq/kg/day</b>, total Na ≥2, and make <b>chloride exceed acetate</b>.', patient: { wt: 6.8, age: 'infant' }, ctx: { na: 134, k: 3.3, cl: 96, co2: 31 },
          start: ord({ rate: 22, dex: 12, aa: 2.5, il: 1, cysteine: true, lytes: { naCl: 2, kAc: 1 } }),
          check: (c) => [{ ok: c.tot.k >= 2 && c.tot.k <= 4, msg: `K ${T.r(c.tot.k, 2)} mEq/kg/day (2–4)` }, { ok: c.tot.na >= 2, msg: `Na ${T.r(c.tot.na, 2)} mEq/kg/day (≥2)` }, { ok: c.tot.cl > c.tot.acetate, msg: `Chloride ${T.r(c.tot.cl, 2)} > acetate ${T.r(c.tot.acetate, 2)}` }] }
      ],
      quiz: [
        { q: '0.4 mmol/kg/day of K-phos contributes how much K?', opts: ['0.4', '0.6', '1.0', '1.5'], ans: 1, why: '1 mmol K-phos = 1.5 mEq K → 0.6 mEq/kg/day.' },
        { q: 'Loop diuretic, CO₂ 31, Cl 96. Prefer:', opts: ['More acetate', 'More chloride', 'Neither', 'Stop all sodium'], ans: 1, why: 'Chloride supplies the missing anion; acetate would add bicarbonate equivalents to an alkalotic patient.' },
        { q: 'Urine output 0.6 mL/kg/hr, K 5.3. In the TPN, K should be:', opts: ['Increased 1 mEq/kg/day', 'Held at current', 'Removed/minimized', 'Doubled'], ans: 2, why: 'Oliguria + high K → remove K until levels fall and urine output recovers.' }
      ]
    },

    {
      id: 'm8', title: 'Electrolytes II: Ca, Phos, Mg', min: 12,
      objectives: ['Convert Ca gluconate mEq to mmol and compute Ca:Phos.', 'Avoid precipitation and the CaCl-drip pitfall.', 'Use albumin and ionized calcium correctly.'],
      body: `
<h3>Ranges ${S}</h3>
<p>Phosphate 0.5–2 mmol/kg/day (adolescents 10–40 mmol/day). Magnesium 0.3–0.5 mEq/kg/day (adolescents 10–30 mEq/day). Calcium 0.5–4 mEq/kg/day (adolescents 10–20 mEq/day).</p>
<h3>Ca:Phos balance</h3>
<p>Try to match Ca and phos <b>1:1</b> if lytes allow, for bone mineralization ${S}. Units trap: <b>calcium gluconate is mEq (1 mmol = 2 mEq) while phosphate is mmol</b>. Convert first: Ca mmol = mEq ÷ 2. Ca and phos move inversely in serum.</p>
<h3>Solubility rules</h3>
<ul>
 <li>Keep phosphate &lt;2 mmol/100 mL — it can precipitate with calcium ${S}.</li>
 <li><b>DO NOT ADD PHOS IF ON A CaCl DRIP</b> ${S}.</li>
 <li>L-cysteine (lower pH) helps solubility in infant PN.</li>
</ul>
<h3>Interpreting calcium</h3>
<p>As albumin falls, free Ca rises ${S}. Albumin-corrected Ca ≈ measured + 0.8 × (4 − albumin). Ionized Ca is preferred in critically ill children.</p>
<h3>Adjusting</h3>
<p>Phos minor +0.25, major +0.5 mmol/kg/day. Mg minor +0.3, major +0.5 mEq/kg/day. Ca minor +1, major +2 mEq/kg/day ${S}.</p>`,
      tasks: [
        { type: 'numeric', prompt: 'Calcium gluconate 1.5 mEq/kg/day and phosphate 0.6 mmol/kg/day. What is the Ca:Phos molar ratio?', unit: ':1', answer: () => (1.5 / 2) / 0.6, tol: 0.04, explain: 'Ca 1.5 mEq ÷ 2 = 0.75 mmol; 0.75 ÷ 0.6 = 1.25 : 1.' },
        { type: 'order', prompt: '4 kg infant at 16 mL/hr: add both calcium and phosphate so the <b>Ca:Phos ratio is 0.7–1.4 : 1</b> and phosphate stays <b>&lt;2 mmol/100 mL</b>.', patient: { wt: 4, age: 'infant' }, start: ord({ rate: 16, dex: 12, aa: 2.5, il: 1, cysteine: true }),
          check: (c) => [{ ok: c.tot.ca > 0 && c.tot.phos > 0, msg: 'Both Ca and phosphate ordered' }, { ok: c.caPRatio != null && c.caPRatio >= 0.7 && c.caPRatio <= 1.4, msg: `Ca:Phos ${c.caPRatio == null ? '—' : T.r(c.caPRatio, 2)} : 1 (0.7–1.4)` }, { ok: c.phosPer100 < 2, msg: `Phos ${T.r(c.phosPer100, 2)} mmol/100 mL (<2)` }] }
      ],
      quiz: [
        { q: 'Calcium gluconate 2 mEq equals how many mmol?', opts: ['0.5', '1', '2', '4'], ans: 1, why: 'Calcium is divalent: 1 mmol = 2 mEq.' },
        { q: 'A patient is on a CaCl infusion. Adding phosphate to PN is:', opts: ['Fine', 'Contraindicated (precipitation risk)', 'Required', 'Only a problem >5 mmol'], ans: 1, why: 'Cheat sheet: do not add phos if on a CaCl drip.' },
        { q: 'Albumin 2.0 g/dL and total Ca 7.0 mg/dL. Corrected Ca ≈', opts: ['7.0', '8.0', '8.6', '9.6'], ans: 2, why: '7.0 + 0.8 × (4 − 2) = 8.6; ionized Ca is preferred when available.' }
      ]
    },

    {
      id: 'm9', title: 'Day-by-day advancement', min: 25, caseId: 't1',
      objectives: ['Advance PN one decision at a time against labs.', 'Spot when to hold, back off, or correct.', 'Fold in enteral feeds and begin the wean.'],
      body: `
<h3>The advancement loop</h3>
<ol>
 <li><b>Read yesterday's labs</b> — glucose, TG, BUN/Cr, lytes, Ca/Phos/Mg, albumin, UOP.</li>
 <li><b>Gate each macro:</b> glucose → dextrose, TG → lipid, BUN/renal function → protein.</li>
 <li><b>Correct electrolytes</b> using the minor/major steps ${S}.</li>
 <li><b>Re-check totals:</b> kcal/kg, fluids/kg (include lipid), Ca:Phos, phos/100 mL.</li>
 <li><b>Fold in feeds:</b> count enteral kcal; wean PN as feeds reach ~50% / ~75% ${C}.</li>
</ol>
<h3>Teaching defaults for step sizes ${D}</h3>
<p>Dextrose +1–2 mg/kg/min/day to goal; AA +0.5 g/kg/day to goal; lipid +0.5–1 g/kg/day to ~3. Hold when the gating lab is abnormal; back off when it is clearly worse. Replace with your institution's protocol.</p>
<h3>Your turn</h3>
<p>Run <b>Baby A</b> through five PN days below. Each day you set the order, commit it, and see tomorrow's labs react to what you did.</p>`,
      tasks: [],
      quiz: [
        { q: 'TG 240 on day 3. Lipid should:', opts: ['Be advanced', 'Hold at current dose', 'Be doubled', 'Be stopped permanently'], ans: 1, why: 'TG 200–300 → hold advancement [sheet].' },
        { q: 'Trophic feeds (4 mL q3h) just started. PN should:', opts: ['Be weaned immediately', 'Continue — trophic feeds provide very few calories', 'Be stopped', 'Switch to peripheral'], ans: 1, why: 'Trophic feeds prime the gut; calories still come from PN until feeds reach a meaningful share.' },
        { q: 'Which lab gates protein advancement?', opts: ['Glucose', 'Triglycerides', 'BUN / renal function', 'Albumin only'], ans: 2, why: 'BUN ≥30 → reduce protein [sheet]; renal and hepatic dysfunction call for caution.' }
      ]
    },

    {
      id: 'm10', title: 'Special considerations', min: 15,
      objectives: ['Adapt PN for cardiac fluid restriction, chylothorax, AKI, cholestasis and refeeding.', 'Plan the transition off PN.'],
      body: `
<h3>Cardiac fluid restriction</h3>
<p>Post-operative and low-output patients are often restricted. Build calories by concentrating dextrose and amino acids, keep lipid volume in the total, review every other fluid source (flushes, drips) ${D}.</p>
<h3>Chylothorax</h3>
<p>Enteral long-chain fat feeds chyle flow; fat-free / MCT-based feeds are usual. IV lipid bypasses the gut, so many programs continue it for energy and essential fatty acids — protocols differ ${C}. Protein losses can be significant; albumin is low (use ionized Ca).</p>
<h3>Renal dysfunction</h3>
<p>Be conservative with K, Phos and Mg; reduce protein when BUN ≥30 ${S}; reintroduce stepwise as UOP and labs recover.</p>
<h3>Prolonged PN and cholestasis</h3>
<p>Direct bilirubin rising: minimize PN duration, advance feeds, limit soybean-oil lipid dose, discuss alternative lipids with pharmacy/GI, treat line infection ${C}. Carnitine for TG ${S}.</p>
<h3>Refeeding</h3>
<p>After a prolonged low intake, glucose delivery triggers insulin and shifts phos, K and Mg into cells. Start lower on calories/dextrose, advance gradually and check phos/K/Mg frequently, replacing as needed ${C}.</p>
<h3>Respiratory failure</h3>
<p>Avoid overfeeding and very high dextrose loads — CO₂ production ${S}.</p>
<h3>Coming off PN</h3>
<p>Count enteral kcal; wean as feeds reach ~50% and stop around 75% of goal ${C}. Taper dextrose in step with falling rate to avoid rebound hypoglycemia ${D}.</p>`,
      tasks: [],
      quiz: [
        { q: 'A fluid-restricted infant is under-fed. The first strategy is to:', opts: ['Increase the PN rate', 'Concentrate the PN within GIR/access limits', 'Add IV fluids', 'Stop feeds'], ans: 1, why: 'Concentrate; volume is the constraint.' },
        { q: 'Phos 1.8 mg/dL on day 2 of re-starting nutrition in a malnourished child suggests:', opts: ['Contaminated sample', 'Refeeding-type intracellular shift', 'Over-hydration only', 'Normal'], ans: 1, why: 'Insulin-driven cellular uptake of phos/K/Mg — replete and slow the advancement.' },
        { q: 'Which is NOT a standard response to rising direct bilirubin on prolonged PN?', opts: ['Advance enteral feeds', 'Limit soybean-oil lipid dose', 'Raise lipid to boost calories', 'Evaluate for line infection'], ans: 2, why: 'Increasing soybean-oil lipid worsens cholestasis risk.' }
      ]
    }
  ];

  root.TPNC = Object.assign(root.TPNC || {}, { MODULES });
})(typeof window !== 'undefined' ? window : globalThis);
