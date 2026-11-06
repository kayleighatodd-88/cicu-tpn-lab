/* Learn modules. Source tags:  S = TCPCHD cheat sheet · C = commonly cited (verify locally) · D = teaching default. */
(function (root) {
  'use strict';
  const T = root.TPN;
  const S = '<span class="tag tag-s" title="From the TCPCHD TPN &amp; TF cheat sheet">sheet</span>';
  const C = '<span class="tag tag-c" title="Commonly cited — verify against your institutional protocol">verify</span>';
  const L = '<span class="tag tag-s" title="From the CCU feeding guideline, Neo-Pedia guideline or Dell Children\'s pharmacy slides provided">local</span>';
  const D = '<span class="tag tag-d" title="Teaching default — replace with your institution\'s protocol">default</span>';


  const GLOSSARY = {
    'PN': 'parenteral nutrition: nutrition given through a vein', 'TPN': 'total parenteral nutrition (older term for PN)',
    'GIR': 'glucose infusion rate, in mg of glucose per kg per minute', 'TG': 'triglycerides: the blood fat level used to gate lipid',
    'BUN': 'blood urea nitrogen: rises with protein excess and kidney problems', 'AKI': 'acute kidney injury',
    'NPO': 'nothing by mouth', 'POD': 'post-operative day', 'IVF': 'intravenous fluids other than PN',
    'EFAD': 'essential fatty acid deficiency: develops when no lipid is given for a long time', 'NPC:N': 'non-protein calories per gram of nitrogen',
    'CaCl': 'calcium chloride', 'NEC': 'necrotizing enterocolitis: serious bowel injury in infants', 'HLHS': 'hypoplastic left heart syndrome',
    'MCT': 'medium-chain triglycerides: a fat absorbed without the lymphatics', 'SMOF': 'SMOFlipid: a mixed-oil lipid emulsion',
    'UOP': 'urine output', 'RD': 'registered dietitian', 'iCa': 'ionized (active) calcium', 'CCU': 'cardiac care unit',
    'IFALD': 'intestinal failure-associated liver disease (liver injury from long PN)', 'EBM': 'expressed breast milk', 'DEBM': 'donor expressed breast milk'
  };

  const num = (c, k) => c[k];
  const ord = (o) => Object.assign(T.emptyOrder(), o || {});

  const MODULES = [
    {
      id: 'm1', simple: true, title: 'TPN fundamentals', min: 10,
      objectives: ['Name what is in a pediatric PN bag and what each part does.', 'Explain why every dose is per kg and why weight comes first.', 'Pick peripheral or central access from the dextrose %, potassium, calcium and osmolarity limits.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Many heart surgery patients cannot eat for days. Parenteral nutrition (PN, sometimes called TPN) feeds them through a vein so they can heal and grow. You will adjust it every day, so the goal here is to understand what is in the bag and what each part does.</p></div>
<h3>What is in the bag</h3>
<ul>
 <li><b>Dextrose</b> (sugar): the main fuel. We order it as a percent, like D12.5.</li>
 <li><b>Amino acids</b> (protein): building blocks for healing and growth.</li>
 <li><b>Lipid</b> (fat): dense calories and essential fats. Often runs as a separate bag.</li>
 <li><b>Electrolytes and minerals</b>: sodium, potassium, chloride or acetate, phosphate, calcium, magnesium. You will meet these later (modules 7 and 8).</li>
 <li><b>Vitamins, trace elements and other additives</b>: added by pharmacy. This lab models L-cysteine and L-carnitine only.</li>
</ul>
<h3>The one idea to start with</h3>
<p>Almost every PN number is <b>per kg per day</b>. Three inputs drive everything: the patient's <b>weight</b>, the <b>rate</b> in mL/hr, and the <b>concentrations</b> in the bag. Confirm the dosing weight before you do anything else.</p>
<h3>Where it can run</h3>
<p>Small peripheral veins are easily injured by concentrated PN. The limits in the Dell Children's pharmacy slides ${L} are dextrose <b>12.5%</b> or less, potassium <b>40 mEq/L</b> or less, calcium <b>13.5 mEq/L</b> or less, and about <b>1100 mOsm/L</b> (some centers use about 900). Anything stronger needs a central line. The lab's osmolarity number is a rough estimate; pharmacy's number is the one that counts.</p>
<h3>What can go wrong (so we monitor)</h3>
<p>High or low glucose, high triglycerides, electrolyte shifts, line infection, liver injury with long PN courses, and too much fluid in a fragile heart.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>PN is dextrose + amino acids + lipid + electrolytes.</li><li>Doses are per kg; check the weight.</li><li>Concentrated PN needs a central line.</li></ul></div>
<p class="small muted">Tags you will see: ${S} from your cheat sheet · ${L} from your center's CCU guideline or pharmacy slides · ${C} commonly cited, check your protocol · ${D} teaching default.</p>`,
      tasks: [{
        type: 'order', prompt: 'This 8 kg infant has only a <b>peripheral</b> IV. Build a PN at 20 mL/hr that is peripheral-safe: dextrose ≤12.5%, estimated osmolarity ≤1100 mOsm/L, with amino acids included.',
        patient: { wt: 8, age: 'infant' }, start: ord({ rate: 20, access: 'peripheral' }),
        hint: 'Amino acids and sodium add a lot of osmolarity at a small rate. Try dextrose ~10%, AA 1.5 g/kg/day, modest sodium.',
        check: (c, o) => [
          { ok: o.access === 'peripheral' && c.dex <= 12.5 && c.dex > 0, msg: `Dextrose ${c.dex}% (≤12.5%)` },
          { ok: c.osm <= 1100, msg: `Estimated osmolarity ${Math.round(c.osm)} mOsm/L (≤1100)` },
          { ok: c.aa > 0, msg: `Amino acids ${c.aa} g/kg/day included` }]
      }],
      quiz: [
        { q: 'The main factor limiting peripheral PN is:', opts: ['Total calories per kilogram', 'Osmolarity / dextrose concentration', 'The lipid dose in the bag', 'The weight of the patient'], ans: 1, why: 'Hyperosmolar solutions injure peripheral veins (phlebitis, infiltration). Concentrated PN needs central access.' },
        { q: 'Which complication is most tied to PN duration in infants?', opts: ['Hypoglycemia from stopping PN', 'Cholestasis / PN-associated liver disease', 'Hypernatremia from sodium load', 'Metabolic alkalosis from chloride'], ans: 1, why: 'Cholestasis risk climbs with PN duration and soybean-oil lipid load, especially in infants — one reason to advance feeds and shorten PN.' },
        { q: 'Before any PN calculation you should first confirm:', opts: ['The lipid brand', 'The dosing weight', 'The line length', 'The feeding schedule'], ans: 1, why: 'Every dose is per kg; a wrong weight scales every number (GIR, kcal/kg, mEq/kg/day) wrongly.' }
      ]
    },

    {
      id: 'm2', simple: true, title: 'Reading an order: volume & units', min: 8,
      objectives: ['Convert between mL/hr, mL/kg/day, mEq/kg/day and mEq/L.', 'Explain why changing the rate changes the bag concentration.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Orders arrive in several unit systems: mL per hour on the pump, mL per kg per day for fluids, mEq per kg per day for doses, and mEq per liter on the bag label. Most PN errors are unit errors. Practice moving between them.</p></div>
<h3>Rate to volume</h3>
<p><b>mL/kg/day = mL/hr × 24 ÷ weight.</b> At 20 mL/hr, a 5 kg infant gets 480 mL/day, which is 96 mL/kg/day.</p>
<h3>Dose to bag concentration</h3>
<p>The pharmacy bag is labeled in mEq per liter, but you order a dose per kg. To convert, first find the liters per day: <b>L/day = mL/hr × 24 ÷ 1000</b>.</p>
<ul><li>Dose to bag: <b>mEq/L = mEq/kg/day × weight ÷ L/day</b></li><li>Bag to dose: <b>mEq/kg/day = mEq/L × L/day ÷ weight</b></li></ul>
<div class="callout"><b>Why the same dose changes the label</b><p>If you halve the PN rate but keep the same dose, the same salt rides in half the water, so the concentration per liter doubles. This is why a rate change can push a bag over a limit.</p></div>
<h3>Phosphate has its own unit</h3>
<p>Phosphate is in <b>mmol</b>. Calcium gluconate and magnesium are in <b>mEq</b>. Keep them straight; you will need to convert for the calcium to phosphate ratio (module 8).</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>mL/kg/day = mL/hr × 24 ÷ kg.</li><li>Dose and bag label are linked by the daily volume.</li><li>Phosphate is mmol; calcium and magnesium are mEq.</li></ul></div>`,
      tasks: [
        { type: 'numeric', prompt: 'A 6 kg infant needs 120 mL/kg/day of PN. What TPN rate (mL/hr) is that?', unit: 'mL/hr', answer: () => 120 * 6 / 24, tol: 0.03, explain: '120 × 6 ÷ 24 = 30 mL/hr.' },
        { type: 'numeric', prompt: 'PN is running at 18 mL/hr in a 7.2 kg child. How many mL/kg/day is that?', unit: 'mL/kg/day', answer: () => 18 * 24 / 7.2, tol: 0.03, explain: '18 × 24 ÷ 7.2 = 60 mL/kg/day.' }
      ],
      quiz: [
        { q: '5 kg infant, PN at 20 mL/hr. mL/kg/day?', opts: ['48', '96', '100', '480'], ans: 1, why: '20 × 24 = 480 mL/day ÷ 5 kg = 96 mL/kg/day.' },
        { q: 'If you keep Na at 3 mEq/kg/day but halve the TPN rate, the Na concentration (mEq/L) will:', opts: ['Halve', 'Stay the same', 'Double', 'Be zero'], ans: 2, why: 'mEq/L = dose × weight ÷ TPN L/day. Half the volume carrying the same dose doubles concentration.' },
        { q: 'Which unit is phosphate dosed in on the cheat sheet?', opts: ['mEq/kg/day, like potassium', 'mmol/kg/day', 'mg/dL, the lab unit only', 'mOsm/L, the osmolarity unit'], ans: 1, why: 'Phosphate is mmol; calcium gluconate and magnesium are mEq. Mixing them causes ratio errors.' }
      ]
    },

    {
      id: 'm3', simple: true, title: 'Dextrose & GIR', min: 10,
      objectives: ['Calculate GIR from a rate and dextrose %.', 'Choose the dextrose % that gives a target GIR.', 'State the GIR goals by age and the usual daily advance.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Dextrose is the main calorie source, and too much of it is the most common cause of high glucose on PN. The glucose infusion rate (GIR) tells you how fast sugar is going in, whatever the bag percent is.</p></div>
<h3>The formula</h3>
<p><b>GIR (mg/kg/min) = dextrose % × mL/hr ÷ weight ÷ 6.</b> The 6 is just a unit conversion (percent and mL per hour into milligrams per minute). The calculator shows this with your numbers.</p>
<h3>Goals by age ${S}</h3>
<ul><li>Infants: <b>12–14</b> mg/kg/min</li><li>Children: <b>8–10</b></li><li>Adolescents: <b>5–6</b></li></ul>
<h3>Starting and advancing ${L}</h3>
<p>Infants and children start at about <b>4–6</b> mg/kg/min and advance <b>2–4</b> per day (neonates 1–2). Adolescents start at 2–3 and advance 1–2. You may not reach goal for 2–4 days. Start conservative, but do not go below D10 in the bag.</p>
<h3>When glucose is high</h3>
<p>If glucose is above 180, do not advance. Look for causes (steroids, infection, stress) and consider lowering the GIR or starting insulin per your protocol. Extra sugar beyond what the body burns turns into fat, raises liver tests, and makes more CO₂, which matters in a patient who is hard to ventilate ${S}.</p>
<h3>Stopping PN safely ${L}</h3>
<p>Never just switch PN off. Halve the rate for 30 minutes first (twice for children under 2 years), or hang a bag with matching dextrose, to avoid low glucose.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>GIR = % × mL/hr ÷ kg ÷ 6.</li><li>Infant goal 12–14; advance about 2 per day.</li><li>High glucose means hold or back off, never advance.</li></ul></div>`,
      tasks: [
        { type: 'order', prompt: '4.0 kg infant running PN at 16 mL/hr. Set the dextrose % that delivers a <b>GIR of 8 mg/kg/min</b> (±0.4).', patient: { wt: 4, age: 'infant' }, start: ord({ rate: 16 }), hint: 'dextrose % = GIR × 6 × weight ÷ mL/hr.',
          check: (c) => [{ ok: Math.abs(c.gir - 8) <= 0.4, msg: `GIR ${T.r(c.gir)} (target 8 ± 0.4)` }] },
        { type: 'numeric', prompt: 'What GIR does D12.5 at 20 mL/hr give a 5 kg infant?', unit: 'mg/kg/min', answer: () => 12.5 * 20 / 5 / 6, tol: 0.03, explain: '12.5 × 20 ÷ 5 ÷ 6 = 8.33.' }
      ],
      quiz: [
        { q: 'GIR 9 mg/kg/min and glucose 220. Best action?', opts: ['Advance dextrose as scheduled', 'Hold or cut GIR and reassess', 'Stop all amino acids at once', 'Add more lipid to offset it'], ans: 1, why: 'Hyperglycemia gates dextrose: don\'t advance, consider lowering, and look for contributors (steroids, sepsis, stress).' },
        { q: 'Why be cautious with high dextrose in respiratory failure?', opts: ['It lowers pH but nothing else', 'Glucose oxidation produces more CO₂', 'It causes hypocalcemia directly', 'It raises BUN through protein loss'], ans: 1, why: 'Excess carbohydrate raises CO₂ production, increasing ventilatory demand.' },
        { q: 'The goal GIR for a child (1–10 yr) on the cheat sheet is:', opts: ['5–6', '8–10', '12–14', '16–18'], ans: 1, why: 'Infants 12–14, children 8–10, adolescents 5–6 mg/kg/min.' }
      ]
    },

    {
      id: 'm4', simple: true, title: 'Amino acids & protein', min: 8,
      objectives: ['Calculate protein dose and calories.', 'Know when L-cysteine is needed and how it is dosed.', 'Recognize when to hold or reduce protein.'],
      body: `
<div class="callout"><b>Why this matters</b><p>After surgery the body breaks down its own protein. Giving enough amino acids is one of the most important nutrition steps for healing and wound closure ${L}.</p></div>
<h3>Dose and calories</h3>
<p>Protein gives <b>4 kcal/g</b>. Ordered in <b>g/kg/day</b>. A 6 kg infant on 2.5 g/kg/day gets 15 g of protein, which is 60 kcal.</p>
<h3>How much</h3>
<ul><li>Infants start at about 1.5–3 g/kg/day and advance 1 g/kg/day ${L}. For infants with heart disease the CCU guideline lists a PN goal of <b>3–4</b> g/kg/day ${L}. Do not exceed 4.</li><li>Children start at about 1–2; adolescents 0.8–1.5 ${L}.</li></ul>
<h3>L-cysteine</h3>
<p>Infants cannot make enough cysteine, so it is added for infants under 1 year ${S}. The slides give <b>40 mg per gram of amino acid</b> ${L}; it also helps calcium and phosphate stay dissolved. The calculator shows the mg per day when you tick the box.</p>
<h3>When to back off</h3>
<p>If BUN is 30 or higher, <b>decrease protein by 0.5–1 g/kg/day</b> and watch closely ${S}. In kidney or liver injury be conservative. In stress, dialysis or wound healing, needs are higher.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>Protein is 4 kcal/g, ordered per kg.</li><li>Infants need L-cysteine.</li><li>BUN of 30 or more means reduce protein.</li></ul></div>`,
      tasks: [
        { type: 'order', prompt: '3.4 kg neonate at 14 mL/hr. Order amino acids between <b>2 and 3 g/kg/day</b> and include the required infant additive.', patient: { wt: 3.4, age: 'infant' }, start: ord({ rate: 14, dex: 10 }),
          check: (c, o) => [{ ok: c.aa >= 2 && c.aa <= 3, msg: `AA ${c.aa} g/kg/day (2–3)` }, { ok: !!o.cysteine, msg: 'L-cysteine added' }] },
        { type: 'numeric', prompt: 'A 6 kg infant is on 2.5 g/kg/day amino acids. How many kcal/day from protein?', unit: 'kcal/day', answer: () => 2.5 * 6 * 4, tol: 0.03, explain: '2.5 × 6 = 15 g × 4 kcal/g = 60 kcal.' }
      ],
      quiz: [
        { q: 'Protein provides how many kcal per gram?', opts: ['3.4', '4', '9', '10'], ans: 1, why: 'Amino acids 4, dextrose 3.4, lipid 10 kcal/g (as used on the sheet).' },
        { q: 'BUN is 34 on 2.5 g/kg/day AA. The cheat sheet says:', opts: ['Advance AA as planned', 'Decrease protein by 0.5–1 g/kg/day', 'Stop dextrose for the day', 'Double the lipid to compensate'], ans: 1, why: 'BUN ≥30 → reduce protein 0.5–1 g/kg/day and follow BUN closely.' },
        { q: 'Why add L-cysteine in infants?', opts: ['Raises glucose tolerance in neonates', 'Conditionally essential in infants; aids Ca/Phos solubility', 'Lowers TG in all patients', 'Replaces carnitine in the bag'], ans: 1, why: 'Infants have limited cysteine synthesis; cysteine also lowers pH, improving calcium–phosphate solubility.' }
      ]
    },

    {
      id: 'm5', simple: true, title: 'Lipids, triglycerides & L-carnitine', min: 12,
      objectives: ['Calculate lipid grams, mL and calories.', 'Use TG to decide whether to advance, hold or reduce lipid.', 'Explain why a minimum lipid dose is kept and when carnitine is considered.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Lipid is the most calorie-dense part of PN and it supplies essential fats. It is also the part most likely to cause trouble (high triglycerides, liver injury), so you will check a lab before you advance it.</p></div>
<h3>Dose, calories, volume</h3>
<p>Lipid gives <b>10 kcal/g</b>. The 20% emulsion is 0.2 g/mL, so <b>5 mL per gram</b>. Example: 2 g/kg/day in a 5 kg infant is 10 g, which is 50 mL a day. This volume counts toward fluids; the cheat sheet's total does not include it, but the lab does.</p>
<h3>How much ${L}</h3>
<p>Start about 1 g/kg/day and advance 0.5–1 g/kg/day. Infant goal is <b>3–3.5</b> g/kg/day, children 2–3, adolescents 1–2.5 (max 500 mL/day). A new cardiac infant on the CCU guideline starts at 1–2 and advances by 1 to 3. Use SMOFlipid when PN is expected to run longer than 14 days ${L}.</p>
<h3>Triglyceride (TG) rules</h3>
<ul>
 <li>Your cheat sheet: TG 200–300 means <b>hold advancement</b>; above 300 means <b>hold lipid</b> ${S}.</li>
 <li>CCU guideline ladder: 150 or less advance by 1; 151–250 stay; 251–399 decrease by 1 (stop if on 1); 400 or more stop, then restart at 0.5–1 g/kg/day and recheck in the morning ${L}.</li>
</ul>
<p>Look for causes first: too much dextrose, sepsis, steroids, propofol (count its calories), and long PN courses. Heparin 0.5 unit/mL in the bag can help clear fat when TG stays high ${L}.</p>
<h3>Do not hold lipid forever</h3>
<p>About <b>0.5 g/kg/day</b> (or 8–10% of PN calories) prevents essential fatty acid deficiency (EFAD) ${L}. If lipid is held, plan the lowest safe restart.</p>
<h3>L-carnitine</h3>
<p>PN contains no carnitine, yet the body needs it to move long fat chains into energy. Sheet: 10 mg/kg/day for infants, up to 20 ${S}. CCU guideline: consider 10 mg/kg/day if TG is 250 or more, or the infant has been NPO more than 14 days ${L}.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>Lipid is 10 kcal/g and 5 mL per gram.</li><li>Check TG before advancing; hold lipid at TG above 300.</li><li>Keep a minimum (about 0.5 g/kg/day) so essential fats do not run out.</li></ul></div>`,
      tasks: [
        { type: 'order', prompt: '5 kg infant on lipid 2 g/kg/day. <b>TG today is 260.</b> Revise the order: do not advance lipid, and add L-carnitine in the cheat-sheet range.', patient: { wt: 5, age: 'infant' }, ctx: { tg: 260 },
          start: ord({ rate: 18, dex: 12, aa: 2.5, il: 2, cysteine: true }), prev: ord({ rate: 18, dex: 12, aa: 2.5, il: 2, cysteine: true }),
          check: (c, o) => [{ ok: c.il <= 2, msg: `Lipid ${c.il} g/kg/day (not above 2)` }, { ok: T.num(o.carnitine) >= 10 && T.num(o.carnitine) <= 20, msg: `L-carnitine ${o.carnitine || 0} mg/kg/day (10–20)` }] },
        { type: 'numeric', prompt: 'A 3.8 kg infant is on lipid 2.5 g/kg/day (20% emulsion). How many mL/day of lipid is that?', unit: 'mL/day', answer: () => 2.5 * 3.8 * T.IL_ML_PER_G, tol: 0.03, explain: '2.5 × 3.8 = 9.5 g × 5 mL/g = 47.5 mL.' }
      ],
      quiz: [
        { q: 'TG is 250 and lipid is 1.5 g/kg/day. Best move?', opts: ['Advance to 2.5 g/kg/day', 'Hold advancement and recheck', 'Double the carnitine dose only', 'Stop amino acids for now'], ans: 1, why: 'TG 200–300 → hold advancement (not necessarily reduce); recheck, address contributors.' },
        { q: '2 g/kg/day lipid provides how many kcal/kg/day?', opts: ['8', '10', '20', '40'], ans: 2, why: '2 g × 10 kcal/g = 20 kcal/kg/day.' },
        { q: 'Cheat-sheet L-carnitine dosing for infants:', opts: ['1–2 mg/kg/day for infants', '10 up to 20 mg/kg/day', '100 mg/kg/day for infants', '2 mEq/kg/day by mouth'], ans: 1, why: '10 mg/kg/day for infants, up to 20 mg/kg/day.' }
      ]
    },

    {
      id: 'm6', simple: true, title: 'Total calories, protein–energy & fluids', min: 12,
      objectives: ['Compare total kcal/kg with the age goal.', 'Count total fluids including lipid and other sources.', 'Build calories by concentrating, not adding volume.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Calories and fluids pull in opposite directions in a cardiac patient: the heart needs calories to heal, and the lungs and heart cannot tolerate extra water. You will make calories by <b>concentrating</b> the PN, not by adding volume.</p></div>
<h3>Calorie goals (kcal/kg/day) ${L}</h3>
<ul><li>Infants (under 1 year): PN <b>90–110</b>; if fed enterally, 120–150 (your cheat sheet lists 85–105)</li><li>1–7 years: 75–90 · 7–12 years: 50–75 · over 12 years: 30–50</li></ul>
<p>PN needs run about 10% below enteral because the gut spends no energy on digestion ${L}. The lab blends the infant goal toward the enteral range as feeds provide more of the calories.</p>
<h3>Adding it up</h3>
<p>Total kcal/kg = dextrose + protein + lipid + enteral. Dextrose is 3.4 kcal/g, protein 4, lipid 10. Typical split: carbohydrate about 50–60%, protein 15–20%, fat 30–35% ${L}. Whether to count protein as calories is debated; critically ill patients burn some for energy, so this lab counts it. The lab also shows NPC:N (non-protein calories per gram of nitrogen) so you can see the balance.</p>
<h3>Fluids</h3>
<p>Total fluids = PN + IVF + feeds + <b>lipid volume</b>. Add every other source in real life: drips, flushes, medicines and blood products. Post-bypass patients are often held to <b>50–80% of maintenance</b> ${L}. Standard maintenance by weight: 100 mL/kg up to 10 kg; 1000 mL + 50 mL/kg for each kg over 10; 1500 mL + 20 mL/kg for each kg over 20 ${L}.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>Infant PN goal about 90–110 kcal/kg.</li><li>Count lipid volume and all other fluids.</li><li>Fluid-restricted? Concentrate the PN, do not raise the rate.</li></ul></div>`,
      tasks: [
        { type: 'order', prompt: '5 kg infant already getting feeds (8 × 30 mL of 20 kcal/oz). Build PN so <b>total kcal is 90–125/kg/day</b>, <b>total fluids ≤120 mL/kg/day</b> (including lipid), GIR ≤14, and AA ≥2 g/kg/day.', patient: { wt: 5, age: 'infant' },
          start: ord({ rate: 12, cysteine: true, feeds: { n: 8, vol: 30, kcalOz: 20 } }), fluidGoal: 120,
          hint: 'Feeds supply ~32 kcal/kg and 48 mL/kg. Remaining PN volume is what is left under 120 minus lipid mL/kg.',
          check: (c) => [{ ok: c.totalKcalKg >= 90 && c.totalKcalKg <= 125, msg: `Total ${T.r(c.totalKcalKg, 0)} kcal/kg/day (90–125)` }, { ok: c.totalFluids <= 120, msg: `Total fluids ${T.r(c.totalFluids, 0)} mL/kg/day (≤120)` }, { ok: c.gir <= 14 && c.gir > 0, msg: `GIR ${T.r(c.gir)} (≤14)` }, { ok: c.aa >= 2, msg: `AA ${c.aa} g/kg/day (≥2)` }] }
      ],
      quiz: [
        { q: 'Enteral: 8 feeds × 30 mL of 20 kcal/oz in a 5 kg infant ≈ ?', opts: ['16 kcal/kg', '32 kcal/kg', '64 kcal/kg', '160 kcal/kg'], ans: 1, why: '240 mL ÷ 30 × 20 = 160 kcal ÷ 5 kg = 32 kcal/kg/day.' },
        { q: 'To raise calories in a fluid-restricted infant you should mainly:', opts: ['Increase the rate by 30%', 'Concentrate the PN', 'Stop lipid to save volume', 'Add IV fluids for calories'], ans: 1, why: 'Concentrate dextrose (within GIR/access limits) rather than adding volume.' },
        { q: 'The cheat-sheet total fluid line omits:', opts: ['Other IV fluids and drips', 'Enteral feeds given', 'Lipid volume', 'The TPN bag volume'], ans: 2, why: 'Lipid is run as its own volume; add 5 mL per gram of 20% emulsion.' }
      ]
    },

    {
      id: 'm7', title: 'Electrolytes I: Na, K, Cl/acetate', min: 12,
      objectives: ['Convert between bag mEq/L and mEq/kg/day.', 'Count K from K-phos.', 'Choose chloride vs acetate from the acid–base picture.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Electrolytes are where cardiac patients differ most: diuretics waste potassium, chloride and magnesium, low potassium or magnesium can trigger rhythm problems, and kidney injury makes potassium dangerous. This is also where most PN adjustments happen.</p></div>
<h3>Usual ranges ${S}</h3>
<p>Sodium 2–5 mEq/kg/day (infants and children), 1–2 (adolescents). Potassium 2–4 (infants and children), 1–2 (adolescents).</p>
<h3>Counting potassium</h3>
<p>Total K = KCl + K-acetate + <b>1.5 × K-phos (mmol)</b> ${S}. Each mmol of potassium phosphate carries 1.5 mEq of potassium, so count it.</p>
<h3>Adjusting</h3>
<ul><li>Sodium minor: ½NS → ¾NS → NS, or +1–2 mEq/kg/day; major: ½NS → NS, or +3–4 ${S}. Normal saline 154 mEq/L, ½NS 77, ¼NS 38.</li><li>Potassium minor +1 mEq/kg/day (10 mEq/L); major +1.5–2 (20 mEq/L) ${S}. Be conservative: you can always add more, but a bag with too much potassium has to be stopped.</li></ul>
<h3>Chloride or acetate?</h3>
<p>Acetate turns into bicarbonate, so use it for acidosis or high chloride. Amino acid solutions already contain some acetate. Patients on <b>furosemide waste chloride</b>, so their PN should be <b>all chloride</b> ${L}. Giving potassium to prevent diuretic losses is usually 1–2 mEq/kg/day ${L}.</p>
<h3>Safety</h3>
<ul><li>Kidney injury or low urine output: reduce or remove potassium, phosphate and magnesium (slides: cut by 50% or remove) ${S}${L}.</li><li>Acute problems are corrected with a <b>separate infusion</b>, not by changing the PN. Hypokalemia is replaced as 0.5–1 mEq/kg/dose <b>infused</b> at 0.3–0.5 mEq/kg/hr (max 1), never pushed ${L}. Follow your policy.</li><li>If both potassium and magnesium are low, replace magnesium first ${L}.</li></ul>
<div class="callout good"><b>If you remember nothing else</b><ul><li>K total counts K-phos at 1.5 per mmol.</li><li>Diuretic means chloride, not acetate.</li><li>Potassium is never pushed.</li></ul></div>`,
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
<div class="callout"><b>Why this matters</b><p>Calcium supports heart muscle contraction, and in neonates it matters even more. Calcium and phosphate can also clump together in the bag and in the line, which is dangerous. This module is about getting both in without that happening.</p></div>
<h3>Usual ranges ${S}</h3>
<p>Phosphate 0.5–2 mmol/kg/day. Magnesium 0.3–0.5 mEq/kg/day. Calcium 0.5–4 mEq/kg/day. Adolescents: phosphate 10–40 mmol/day, magnesium 10–30 mEq/day, calcium 10–20 mEq/day.</p>
<h3>Units trap</h3>
<p>Calcium gluconate is in mEq (<b>2 mEq = 1 mmol</b>), phosphate is in mmol. Convert first: Ca mmol = mEq ÷ 2. Then match them about <b>1:1</b> ${S}. Example: Ca 2 mEq (1 mmol) with phosphate 0.8 mmol gives a ratio of 1.25 : 1.</p>
<div class="callout"><b>Units trap II (doses of the salt)</b><p>Calcium gluconate and magnesium sulfate rescue doses are written as <b>mg of the salt</b> (for example calcium gluconate 50–200 mg/kg/day divided, magnesium sulfate 25–50 mg/kg/dose ${L}). PN doses are <b>mEq of the element</b>. Do not mix them.</p></div>
<h3>Keeping them dissolved</h3>
<ul><li>Keep phosphate under <b>2 mmol/100 mL</b> ${S}. This is a rule of thumb; pharmacy's compounding software makes the final call, since solubility also depends on amino acids, cysteine and pH.</li><li><b>Never add phosphate if a calcium chloride drip is running</b> on the same line ${S}.</li><li>L-cysteine lowers pH and helps solubility.</li></ul>
<h3>Low levels ${L}</h3>
<ul><li>Phosphate 2.5–4 mg/dL: raise PN phosphate by 0.25 mmol/kg/day. Below 2.5: replace as a separate dose (about 0.16–0.64 mmol/kg/dose by level).</li><li>Magnesium 1.5–1.8: raise by 20–30%. Below 1.5: give a rider of 0.2–0.4 mEq/kg.</li><li>Mild low calcium: raise PN calcium 10–20%; moderate: check ionized calcium and replace.</li></ul>
<h3>Reading calcium</h3>
<p>Low albumin lowers <b>total</b> calcium without necessarily lowering the active, <b>ionized</b> calcium. Corrected Ca ≈ measured + 0.8 × (4 − albumin) ${L}. In a sick child, ionized calcium is the better test.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>Convert calcium to mmol, then match phosphate about 1:1.</li><li>No phosphate with a calcium chloride drip.</li><li>Check ionized calcium when albumin is low.</li></ul></div>`,
      tasks: [
        { type: 'numeric', prompt: 'Calcium gluconate 1.5 mEq/kg/day and phosphate 0.6 mmol/kg/day. What is the Ca:Phos molar ratio?', unit: ':1', answer: () => (1.5 / 2) / 0.6, tol: 0.04, explain: 'Ca 1.5 mEq ÷ 2 = 0.75 mmol; 0.75 ÷ 0.6 = 1.25 : 1.' },
        { type: 'order', prompt: '4 kg infant at 16 mL/hr: add both calcium and phosphate so the <b>Ca:Phos ratio is 0.7–1.4 : 1</b> and phosphate stays <b>&lt;2 mmol/100 mL</b>.', patient: { wt: 4, age: 'infant' }, start: ord({ rate: 16, dex: 12, aa: 2.5, il: 1, cysteine: true }),
          check: (c) => [{ ok: c.tot.ca > 0 && c.tot.phos > 0, msg: 'Both Ca and phosphate ordered' }, { ok: c.caPRatio != null && c.caPRatio >= 0.7 && c.caPRatio <= 1.4, msg: `Ca:Phos ${c.caPRatio == null ? '—' : T.r(c.caPRatio, 2)} : 1 (0.7–1.4)` }, { ok: c.phosPer100 < 2, msg: `Phos ${T.r(c.phosPer100, 2)} mmol/100 mL (<2)` }] }
      ],
      quiz: [
        { q: 'Calcium gluconate 2 mEq equals how many mmol?', opts: ['0.5', '1', '2', '4'], ans: 1, why: 'Calcium is divalent: 1 mmol = 2 mEq.' },
        { q: 'A patient is on a CaCl infusion. Adding phosphate to PN is:', opts: ['Fine, they are compatible', 'Contraindicated (precipitation risk)', 'Required in every infant bag', 'Only a problem above 5 mmol'], ans: 1, why: 'Cheat sheet: do not add phos if on a CaCl drip.' },
        { q: 'Albumin 2.0 g/dL and total Ca 7.0 mg/dL. Corrected Ca ≈', opts: ['7.0', '8.0', '8.6', '9.6'], ans: 2, why: '7.0 + 0.8 × (4 − 2) = 8.6; ionized Ca is preferred when available.' }
      ]
    },

    {
      id: 'm9', title: 'Day-by-day advancement', min: 25, caseId: 't1',
      objectives: ['Advance PN one decision at a time against labs.', 'Spot when to hold, back off, or correct.', 'Fold in enteral feeds and begin the wean.'],
      body: `
<div class="callout"><b>Why this matters</b><p>This is the daily job: look at labs, decide what to change, and make sure the totals still make sense. The cases below let you do it five days in a row, and the labs react to your choices.</p></div>
<h3>The advancement loop</h3>
<ol>
 <li><b>Read yesterday's labs:</b> glucose, TG, BUN and creatinine, electrolytes, Ca/Phos/Mg, albumin, urine output.</li>
 <li><b>Gate each macro:</b> glucose gates dextrose, TG gates lipid, BUN and kidney function gate protein.</li>
 <li><b>Correct electrolytes</b> with the minor and major steps (module 7 and 8).</li>
 <li><b>Re-check totals:</b> kcal/kg, fluids/kg including lipid, Ca:Phos, phos/100 mL.</li>
 <li><b>Fold in feeds</b> and start the wean.</li>
</ol>
<h3>Usual step sizes ${L}</h3>
<p>GIR +2–4 per day (infants 1–2 if a neonate); protein +1 g/kg/day (or +0.5 to goal); lipid +0.5–1 g/kg/day. Hold when the gating lab is abnormal; back off when it is clearly worse.</p>
<h3>A real cardiac example: the CCU post-bypass infant table ${L}</h3>
<div class="scroll"><table><tr><th></th><th>Post-op day 1</th><th>Day 2</th><th>Day 3</th></tr>
<tr><td>TPN volume</td><td>45 mL/kg</td><td>65 mL/kg</td><td>85 mL/kg</td></tr><tr><td>Lipid</td><td>1 g/kg</td><td>2 g/kg</td><td>3 g/kg</td></tr>
<tr><td>Dextrose</td><td>22–25%</td><td>18–22%</td><td>17–20%</td></tr><tr><td>GIR goal</td><td>6–8</td><td>8–10</td><td>10–12</td></tr>
<tr><td>Amino acids</td><td>2.5 g/kg</td><td>3 g/kg</td><td>3–4 g/kg</td></tr><tr><td>Total volume</td><td>50 mL/kg + other IVF</td><td>75 mL/kg + other IVF</td><td>100 mL/kg + other IVF</td></tr></table></div>
<p class="small muted">Notice the total volume equals the PN volume plus the lipid volume (for example day 2: 65 + 10 mL/kg of lipid = 75).</p>
<h3>The wean as feeds advance ${L}</h3>
<div class="scroll"><table><tr><th>Feeds</th><th>20</th><th>40</th><th>60</th><th>80</th><th>100</th><th>120 mL/kg</th></tr><tr><td>TPN volume</td><td>85</td><td>65</td><td>45</td><td>35</td><td>15</td><td>stop</td></tr><tr><td>Lipid</td><td>3</td><td>3</td><td>3</td><td>1</td><td>1</td><td>stop</td></tr><tr><td>GIR goal</td><td>12</td><td>10</td><td>8</td><td>6</td><td>3</td><td></td></tr><tr><td>Amino acids</td><td>3.5</td><td>3</td><td>3</td><td>2.5</td><td>2</td><td></td></tr></table></div>
<p><b>Your turn.</b> Run <b>Baby A</b> through five PN days below. Each day you set the order, commit it, and see tomorrow's labs react to what you did.</p>`,
      tasks: [],
      quiz: [
        { q: 'TG 240 on day 3. Lipid should:', opts: ['Be advanced', 'Hold at current dose', 'Be doubled', 'Be stopped permanently'], ans: 1, why: 'TG 200–300 → hold advancement [sheet].' },
        { q: 'Trophic feeds (4 mL q3h) just started. PN should:', opts: ['Be weaned off immediately', 'Continue; trophic feeds give few calories', 'Be stopped today', 'Switch to peripheral PN'], ans: 1, why: 'Trophic feeds prime the gut; calories still come from PN until feeds reach a meaningful share.' },
        { q: 'Which lab gates protein advancement?', opts: ['Glucose on the morning lab', 'Triglycerides on the same panel', 'BUN / renal function', 'Albumin alone'], ans: 2, why: 'BUN ≥30 → reduce protein [sheet]; renal and hepatic dysfunction call for caution.' }
      ]
    },

    {
      id: 'm10', title: 'Special considerations', min: 15,
      objectives: ['Adapt PN for cardiac fluid restriction, chylothorax, AKI, cholestasis and refeeding.', 'Plan the transition off PN.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Real patients rarely fit the standard table. These are the situations where you change the plan.</p></div>
<h3>Renal dysfunction</h3>
<p>Reduce or remove potassium, phosphate and magnesium (acute onset: cut by 50% or remove and replace separately until creatinine settles). Reduce protein when BUN is 30 or more ${S}${L}. Reintroduce step by step as urine output and labs recover.</p>
<h3>Prolonged PN and cholestasis</h3>
<p>Direct bilirubin rising: shorten PN, advance feeds, limit soybean-oil lipid (some centers use about 1 g/kg/day when conjugated bilirubin is 1.5 or more), ask pharmacy and GI about fish-oil lipid, treat line infection, and review trace elements: copper and manganese are usually reduced and zinc continued ${C}. Baylor's neonatal guideline gives trace minerals three times a week in cholestasis and monitors copper and zinc every 4 weeks ${L}.</p>
<h3>Refeeding</h3>
<p>After a long low intake, glucose triggers insulin and pushes phosphate, potassium and magnesium into cells. Start lower, advance gradually, and check those electrolytes often ${C}. Slides note phosphate falls with glucose and insulin, refeeding, and calcium given without phosphate ${L}.</p>
<h3>Respiratory failure</h3>
<p>Avoid overfeeding and very high dextrose loads because glucose burning makes CO₂ ${S}.</p>
<h3>Stopping or weaning</h3>
<p>Count enteral calories as feeds rise. Slides: PN until enteral reaches about 75% of needs ${L}. CCU guideline: at 80–100 mL/kg/day of feeds drop lipid to 1 g/kg/day; at about 120 mL/kg/day stop PN. Taper the rate (halve for 30 minutes, twice if under 2 years) so glucose does not fall ${L}.</p>
<h3>Other safety points ${L}</h3>
<ul><li>Count propofol (a 10% lipid, 1.1 kcal/mL) before adding lipid.</li><li>Severe egg allergy is a lipid precaution.</li><li>PN is never a fluid bolus.</li></ul>
<div class="callout good"><b>If you remember nothing else</b><ul><li>Kidney problem: less K, phos, Mg and protein.</li><li>Long PN: protect the liver and plan the wean early.</li><li>Always taper; never switch PN off abruptly.</li></ul></div>`,
      tasks: [],
      quiz: [
        { q: 'A fluid-restricted infant is under-fed. The first strategy is to:', opts: ['Increase the PN rate', 'Concentrate PN within GIR/access limits', 'Add IV fluids to the line', 'Stop feeds to rest the gut'], ans: 1, why: 'Concentrate; volume is the constraint.' },
        { q: 'Phos 1.8 mg/dL on day 2 of re-starting nutrition in a malnourished child suggests:', opts: ['A contaminated lab sample', 'Refeeding-type intracellular shift', 'Over-hydration alone', 'A normal value for this age'], ans: 1, why: 'Insulin-driven cellular uptake of phos/K/Mg — replete and slow the advancement.' },
        { q: 'Which is NOT a standard response to rising direct bilirubin on prolonged PN?', opts: ['Advance enteral feeds', 'Limit the soybean-oil lipid dose', 'Raise lipid to boost calories', 'Evaluate for line infection'], ans: 2, why: 'Increasing soybean-oil lipid worsens cholestasis risk.' }
      ]
    }
    ,
    {
      id: 'm11', title: 'Cardiac considerations', min: 25,
      objectives: ['Apply the CCU post-bypass PN table and wean table to an order.', 'Explain how diuretics, fluid limits, lesion physiology and calcium drips change PN decisions.', 'Know which cardiac targets must come from your own CICU protocol.'],
      body: `
<div class="callout"><b>Why this matters</b><p>Cardiac patients have unique constraints on the same PN rules: tight fluid limits, calorie needs that rise as they recover, gut perfusion problems, diuretics, and lesion-specific risks. Your pharmacy and CICU protocols come first. This module summarizes the cardiac points in the CCU feeding guideline and the Neo-Pedia congenital heart nutrition guideline you provided ${L}.</p></div>
<h3>Calories ramp up</h3>
<ul><li>Right after surgery energy needs are lower (sedation, ventilation): start near <b>55–60 kcal/kg/day</b>, then advance toward <b>90–100</b> as the infant recovers.</li><li>Infants with heart disease grow poorly and need more: enteral 120–150 (130–150 for single ventricle), PN 90–110 kcal/kg/day.</li><li>PN is run about 10% lower than enteral.</li></ul>
<h3>Fluids are the limit</h3>
<ul><li>Post-bypass intake is often 50–80% of maintenance because of capillary leak and edema.</li><li>Neo-Pedia: hold PN until it can supply about <b>30–40 mL/kg</b> or more of total fluid.</li><li>As drips come off and fluid is liberalized, increase PN volume toward maintenance.</li><li>Every drip, flush and medicine counts. A drip may also carry sodium or potassium.</li></ul>
<h3>Protein first</h3>
<p>Protein is the most important single nutrient for post-operative healing and sternal wound closure. Open chests and delayed closure raise needs further. Zinc and vitamin C also support wound healing ${L}.</p>
<h3>Diuretics</h3>
<p>Furosemide wastes chloride, potassium, magnesium and calcium. Keep PN all chloride, expect to replace potassium (1–2 mEq/kg/day) and magnesium, and de-escalate the extra electrolytes when the diuretic is reduced. Low potassium and magnesium raise arrhythmia risk, so ask your CICU for its target levels ${C}.</p>
<h3>Gut and feeding risks by lesion</h3>
<ul><li><b>Ductal-dependent systemic flow</b> (HLHS, Norwood, interrupted arch, coarctation, truncus, BT shunt): poor gut blood flow before surgery raises NEC risk. Trophic feeds (15–20 mL/kg/day) and donor milk bridging are used in some programs ${L}.</li><li><b>After coarctation or arch repair:</b> watch for abdominal pain, ileus and bowel injury, and vocal cord paresis that affects feeding.</li><li>Single ventricle: start PN pre-operatively and as soon as feasible after surgery ${L}.</li></ul>
<h3>Chylothorax</h3>
<p>Fat in the gut feeds lymph flow, so enteral fat-free or MCT-based feeds are used first; if that fails, bowel rest with PN, then octreotide, then surgery. Improvement is drainage under about 10 mL/kg/day ${L}. Lipid in PN is run intravenously and does not pass through the gut; programs differ on how much to give, so follow your protocol ${C}. Protein, albumin and electrolytes are lost in chyle, so use ionized calcium and watch protein.</p>
<h3>Blood products and calcium</h3>
<p>Large volumes of citrated blood can lower ionized calcium, and calcium chloride drips are common. Remember: <b>no phosphate in PN while a calcium chloride drip runs.</b> Always check ionized calcium before changing PN calcium.</p>
<div class="callout good"><b>If you remember nothing else</b><ul><li>Start low, ramp to 90–110 (PN), count every fluid source.</li><li>Protein first; concentrate PN.</li><li>Diuretic: chloride, replace K and Mg, and ask for your CICU's target levels.</li></ul></div>`,
      tasks: [
        { type: 'order', prompt: 'Post-bypass <b>day 2</b> for a 3.5 kg infant, using the CCU table: TPN about <b>65 mL/kg</b>, GIR <b>8–10</b>, amino acids <b>2.5–3.5 g/kg</b>, lipid <b>1.5–2.5 g/kg</b>, with L-cysteine. Total fluids should land near <b>75 mL/kg</b> (PN plus lipid volume).', patient: { wt: 3.5, age: 'infant' }, start: ord({}), fluidGoal: 77,
          hint: 'TPN rate = 65 mL/kg × 3.5 kg ÷ 24 ≈ 9.5 mL/hr. Then dextrose % = GIR × 6 × kg ÷ rate. Lipid 2 g/kg adds 10 mL/kg.',
          check: (c, o) => [{ ok: c.tpnMlKg >= 60 && c.tpnMlKg <= 70, msg: `TPN ${T.r(c.tpnMlKg, 0)} mL/kg/day (60–70)` }, { ok: c.gir >= 8 && c.gir <= 10, msg: `GIR ${T.r(c.gir)} (8–10)` }, { ok: c.aa >= 2.5 && c.aa <= 3.5, msg: `Amino acids ${T.r(c.aa, 2)} g/kg/day (2.5–3.5)` }, { ok: c.il >= 1.5 && c.il <= 2.5, msg: `Lipid ${T.r(c.il, 2)} g/kg/day (1.5–2.5)` }, { ok: c.totalFluids <= 77, msg: `Total fluids ${T.r(c.totalFluids, 0)} mL/kg/day (≤77)` }, { ok: !!o.cysteine, msg: 'L-cysteine added' }] },
        { type: 'order', prompt: 'The same infant (3.4 kg) is now on <b>feeds at 80 mL/kg/day</b> (8 feeds of 34 mL, 24 kcal/oz). Using the CCU wean table, set PN to about <b>35 mL/kg</b>, <b>lipid 1 g/kg</b>, <b>GIR 5–7</b> and amino acids <b>2–3 g/kg</b>.', patient: { wt: 3.4, age: 'infant' }, start: ord({ cysteine: true, feeds: { n: 8, vol: 34, kcalOz: 24 } }), fluidGoal: 125,
          hint: 'Rate = 35 × 3.4 ÷ 24 ≈ 5 mL/hr. At 25% dextrose that is a GIR near 6.',
          check: (c, o) => [{ ok: c.tpnMlKg >= 30 && c.tpnMlKg <= 40, msg: `TPN ${T.r(c.tpnMlKg, 0)} mL/kg/day (30–40)` }, { ok: c.il >= 0.5 && c.il <= 1.1, msg: `Lipid ${T.r(c.il, 2)} g/kg/day (about 1)` }, { ok: c.gir >= 5 && c.gir <= 7, msg: `GIR ${T.r(c.gir)} (5–7)` }, { ok: c.aa >= 2 && c.aa <= 3, msg: `Amino acids ${T.r(c.aa, 2)} g/kg/day (2–3)` }] },
        { type: 'numeric', prompt: 'A 3.5 kg infant on CCU post-bypass day 2 has TPN 65 mL/kg and lipid 2 g/kg. What are the total fluids (PN + lipid) in mL/kg/day?', unit: 'mL/kg/day', answer: () => 65 + 2 * 5, tol: 0.03, explain: 'Lipid 2 g/kg × 5 mL/g = 10 mL/kg. 65 + 10 = 75 mL/kg/day, matching the CCU table.' }
      ],
      quiz: [
        { q: 'A 4 kg infant is two days after bypass and on furosemide. Chloride 96, CO₂ 31. For the PN electrolytes you should:', opts: ['Use mostly acetate', 'Keep it all chloride; replace K and Mg as needed', 'Remove all sodium', 'Add more lipid'], ans: 1, why: 'Furosemide wastes chloride; hypochloremic alkalosis calls for chloride, not acetate.' },
        { q: 'On post-bypass day 1 an infant is allowed 50 mL/kg total fluid. Which PN is closest to the CCU table?', opts: ['PN 45 mL/kg, lipid 1 g/kg, GIR 6–8', 'PN 85 mL/kg, lipid 3 g/kg, GIR 10–12', 'PN 120 mL/kg, lipid 0, GIR 14', 'No amino acids until day 3'], ans: 0, why: 'Day 1: PN 45 mL/kg (+ lipid 5 mL/kg = 50 total), lipid 1, GIR 6–8, protein 2.5.' },
        { q: 'Feeds have reached 80 mL/kg/day in an infant on lipid 3 g/kg. Per the CCU guideline you:', opts: ['Keep lipid at 3 g/kg while weaning', 'Cut lipid to 1 g/kg; keep weaning', 'Stop all PN today', 'Double the dextrose today'], ans: 1, why: 'At 80–100 mL/kg/day of feeds, drop lipid to 1; stop PN around 120.' },
        { q: 'Which statement about a patient with a calcium chloride drip is correct?', opts: ['Add extra phosphate to the PN', 'Leave phosphate out; check ionized calcium', 'Stop all amino acids', 'Switch to acetate'], ans: 1, why: 'Calcium and phosphate can precipitate in the line; no phosphate while a CaCl drip runs.' }
      ]
    }
  ];

  root.TPNC = Object.assign(root.TPNC || {}, { MODULES, GLOSSARY });
})(typeof window !== 'undefined' ? window : globalThis);
