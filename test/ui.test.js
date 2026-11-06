// Run: node test/ui.test.js  (needs Playwright + Chromium; run `python3 build.py` first)
const { chromium } = require('playwright'); const path = require('path'); const assert = require('assert');
const url = (p) => 'file://' + path.resolve(__dirname, '..', p);
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const pg = await b.newPage({ viewport: vp }); pg.on('dialog', d => d.accept());
    pg.on('pageerror', e => errs.push(vp.width + ' pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(vp.width + ' console: ' + m.text()); });
    // Teach sandbox
    await pg.goto(url('teach.html'));
    await pg.fill('[data-k="o.rate"]', '16'); await pg.fill('[data-k="o.dex"]', '12.5'); await pg.fill('[data-k="o.aa"]', '2.5'); await pg.fill('[data-k="o.il"]', '2');
    const gir = await pg.locator('.tile .v').first().innerText(); console.log(vp.width, 'sandbox GIR', gir);
    assert.ok(Math.abs(parseFloat(gir) - 12.5 * 16 / 3.4 / 6) < 0.06, 'GIR expected ' + (12.5 * 16 / 3.4 / 6));
    await pg.click('[data-unit="L"]'); await pg.click('[data-unit="kg"]');
    await pg.click('[data-tab="cases"]'); await pg.fill('[data-k="o.rate"]', '14'); await pg.fill('[data-k="o.dex"]', '10'); await pg.click('[data-act="commit"]');
    assert.ok(await pg.locator('text=Feedback on your Day 1 order').count() === 1);
    await pg.click('[data-tab="ref"]');
    // Learn
    await pg.goto(url('learn.html'));
    assert.ok(await pg.locator('#list button').count() === 11);
    await pg.click('#list button >> nth=2'); await pg.fill('[data-k="o.dex"]', '12'); await pg.click('button.primary:has-text("Check my order")');
    for (const i of [0, 3, 4, 5, 6, 7, 8, 9, 10]) { await pg.click(`#list button >> nth=${i}`); }
    await pg.click('#list button >> nth=8'); await pg.fill('[data-k="o.rate"]', '14'); await pg.click('[data-act="commit"]'); await pg.click('[data-act="next"]'); await pg.waitForSelector('text=Day 2');
    // Check-off full run
    await pg.goto(url('check.html')); await pg.fill('#nm', 'Test'); await pg.click('#go');
    await pg.click('#nx');
    for (let i = 0; i < 3; i++) { assert.ok(await pg.locator('.flag').count() === 0 && await pg.locator('.sug').count() === 0, 'blind case must show no flags/suggestions'); await pg.click('#nx'); const dlg = pg.locator('text=blank'); }
    await pg.click('#nx'); await pg.waitForSelector('text=Report');
    console.log(vp.width, 'check report', (await pg.locator('.score').innerText()));
    await pg.screenshot({ path: `/tmp/tpn-check-${vp.width}.png` });
    await pg.close();
  }
  await b.close(); if (errs.length) { console.log(errs.join('\n')); process.exit(1); } console.log('ui tests passed, no console errors');
})().catch(e => { console.error(e); process.exit(1); });
