/* Learn mode: modules with guided tasks, quizzes, and practice cases. Progress is stored locally in this browser. */
(function () {
  'use strict';
  const T = TPN, C = TPNC, U = TPNUI, $ = U.$, esc = U.esc;
  TPNShell.mount('learn');
  const KEY = 'tpnlab.learn.v1';
  let prog = {};
  try { prog = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { prog = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { /* storage unavailable */ } };
  const items = C.MODULES.map(m => ({ id: m.id, title: m.title, min: m.min, mod: m })).concat([{ id: 'prac', title: 'Practice cases (t2–t4)', min: 40, practice: true }]);
  const app = $('#app');
  app.innerHTML = `<div class="learn"><nav class="side card" aria-label="Modules"><b>Modules</b><div class="prog"><i id="pbar"></i></div><ol id="list"></ol><button id="reset" class="ghost small">Reset my progress</button></nav><section id="body"></section></div>`;
  let cur = 0;
  function side() {
    const done = items.filter(i => prog[i.id] && prog[i.id].done).length;
    $('#pbar').style.width = (done / items.length * 100) + '%';
    $('#list').innerHTML = items.map((m, i) => `<li><button data-i="${i}" ${i === cur ? 'aria-current="true"' : ''}><span>${i < C.MODULES.length ? (i + 1) + '. ' : ''}${esc(m.title)}</span><span>${prog[m.id] && prog[m.id].done ? '✓' : m.min + 'm'}</span></button></li>`).join('');
  }
  function mark(id, patch) { prog[id] = Object.assign(prog[id] || {}, patch); save(); side(); }

  function show(i) {
    cur = i; side(); const it = items[i], b = $('#body'); b.innerHTML = '';
    window.scrollTo(0, 0);
    if (it.practice) return practice(b);
    const m = it.mod;
    b.innerHTML = `<div class="card"><h1>${esc(m.title)}</h1><div class="small muted">About ${m.min} min</div><h3>Objectives</h3><ul>${m.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
      <div class="card">${m.body}</div><div id="tasks"></div><div id="case"></div><div id="quiz"></div><div class="actions" id="fin"></div>`;
    m.tasks.forEach((t, k) => task(t, k, m));
    if (m.caseId) U.CaseRunner($('#case', b), C.CASES[m.caseId], { mode: 'learn', onDone: () => mark(m.id, { caseDone: true }) });
    quiz(m);
    const nxt = i + 1 < items.length;
    $('#fin', b).innerHTML = `<button class="primary" id="done">${prog[m.id] && prog[m.id].done ? 'Completed ✓' : 'Mark module complete'}</button>${nxt ? '<button class="ghost" id="nx">Next module →</button>' : ''}`;
    $('#done', b).onclick = () => { mark(m.id, { done: true }); $('#done', b).textContent = 'Completed ✓'; };
    if (nxt) $('#nx', b).onclick = () => show(i + 1);
  }

  function task(t, k, m) {
    const host = document.createElement('div'); host.className = 'card'; $('#tasks').appendChild(host);
    if (t.type === 'numeric') {
      host.innerHTML = `<h3>Try it ${k + 1}</h3><p>${t.prompt}</p><div class="row two"><div><label for="n${m.id}${k}">Your answer <span class="unit">${esc(t.unit || '')}</span></label><input id="n${m.id}${k}" type="number" inputmode="decimal" step="any"></div><div><label>&nbsp;</label><button class="primary">Check</button></div></div><div class="fb"></div>`;
      $('button', host).onclick = () => {
        const v = parseFloat($('input', host).value), a = t.answer(); if (!isFinite(v)) return;
        const ok = Math.abs(v - a) <= Math.abs(a) * (t.tol || 0.03);
        $('.fb', host).innerHTML = `<div class="callout ${ok ? 'good' : 'bad'}"><b>${ok ? 'Correct.' : 'Not quite.'}</b> Answer ≈ ${T.r(a, 2)} ${esc(t.unit || '')}. ${esc(t.explain || '')}</div>`;
        if (ok) mark(m.id, { ['t' + k]: true });
      };
    } else {
      host.innerHTML = `<h3>Try it ${k + 1}</h3><p>${t.prompt}</p><div class="ws-host"></div><div class="actions"><button class="primary">Check my order</button>${t.hint ? '<button class="ghost" data-h>Hint</button>' : ''}</div><div class="fb"></div>`;
      const ws = U.Workspace($('.ws-host', host), { math: true, flags: true, targets: true, lockPatient: true });
      ws.setCase({ pt: t.patient, o: t.start, ctx: t.ctx || {}, extra: { fluidGoal: t.fluidGoal, prevOrder: t.prev || null } });
      host.querySelector('button.primary').onclick = () => {
        const s = ws.getState(), c = T.calc(t.patient, s.o), res = t.check(c, s.o), ok = res.every(x => x.ok);
        $('.fb', host).innerHTML = `<div class="callout ${ok ? 'good' : 'bad'}"><b>${ok ? 'All criteria met.' : 'Keep going.'}</b><ul class="res">${res.map(x => `<li class="${x.ok ? 'ok' : 'no'}">${esc(x.msg)}</li>`).join('')}</ul></div>`;
        if (ok) mark(m.id, { ['t' + k]: true });
      };
      const h = $('[data-h]', host); if (h) h.onclick = () => { $('.fb', host).innerHTML = `<div class="callout"><b>Hint:</b> ${esc(t.hint)}</div>`; };
    }
  }

  function quiz(m) {
    const host = $('#quiz'); let ans = {};
    host.innerHTML = `<div class="card"><h3 style="margin-top:0">Quick quiz</h3>${m.quiz.map((q, qi) => `<div data-q="${qi}" style="margin-bottom:14px"><p><b>${qi + 1}.</b> ${esc(q.q)}</p>${q.opts.map((o, oi) => `<label class="opt"><input type="radio" name="q${qi}" value="${oi}"><span>${esc(o)}</span></label>`).join('')}<div class="why small"></div></div>`).join('')}<button class="primary" id="qs">Score quiz</button><span id="qr" style="margin-left:10px"></span></div>`;
    $('#qs', host).onclick = () => {
      let got = 0;
      m.quiz.forEach((q, qi) => {
        const box = $(`[data-q="${qi}"]`, host), sel = box.querySelector('input:checked');
        box.querySelectorAll('.opt').forEach((l, oi) => { l.classList.remove('right', 'wrong'); if (oi === q.ans) l.classList.add('right'); else if (sel && +sel.value === oi) l.classList.add('wrong'); });
        if (sel && +sel.value === q.ans) got++;
        $('.why', box).textContent = sel ? q.why : 'Pick an answer — ' + q.why;
      });
      $('#qr').innerHTML = `<b class="${got === m.quiz.length ? 'pass' : ''}">${got}/${m.quiz.length}</b>`;
      mark(m.id, { quiz: got + '/' + m.quiz.length });
    };
  }

  function practice(b) {
    const ids = ['t2', 't3', 't4'];
    b.innerHTML = `<div class="card"><h1>Practice cases</h1><p class="lede">Apply everything. Each case has hidden tolerances: over-delivering today shows up in tomorrow's labs. Learn mode gives feedback after each day.</p><label for="pc">Case</label><select id="pc">${ids.map(id => `<option value="${id}">${esc(C.CASES[id].title)}</option>`).join('')}</select></div><div id="run"></div>`;
    const go = () => { $('#run', b).innerHTML = ''; U.CaseRunner($('#run', b), C.CASES[$('#pc', b).value], { mode: 'learn', onDone: () => mark('prac', { done: true }) }); };
    $('#pc', b).onchange = go; go();
  }

  $('#list').addEventListener('click', (e) => { const x = e.target.closest('button'); if (x) show(+x.dataset.i); });
  $('#reset').onclick = () => { if (confirm('Clear your saved Learn progress in this browser?')) { prog = {}; save(); show(0); } };
  show(0);
})();
