/* Page chrome: header nav + disclaimer footer. */
(function (root) {
  'use strict';
  const PAGES = [['index.html', 'Home', 'home'], ['teach.html', 'Teach', 'teach'], ['learn.html', 'Learn', 'learn'], ['check.html', 'Check-off', 'check']];
  function mount(active) {
    const top = document.createElement('header'); top.className = 'top';
    top.innerHTML = `<div class="in"><span class="paa-slot"></span><!--paa-home--><a class="paa-home" href="https://kayleighatodd-88.github.io/pediatric-app-academy/" aria-label="Pediatric APP Academy home"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 42 L24 6 L40 42" fill="none" stroke="#F4F5F6" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M12.5 30 H19.5 L21.75 24 L25 36 L27.25 30 H35.5" fill="none" stroke="#F2C230" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="t"><small>The Pediatric</small><b>APP Academy</b></span></a><!--/paa-home--><a class="brand" href="index.html">TPN Lab</a><nav aria-label="Primary">${PAGES.map(p => `<a href="${p[0]}" ${p[2] === active ? 'aria-current="page"' : ''}>${p[1]}</a>`).join('')}</nav></div>`;
    document.body.insertBefore(top, document.body.firstChild);
    const ft = document.createElement('footer'); ft.className = 'disclaimer';
    ft.innerHTML = '<b>Educational simulator — not for patient care.</b> All patients are fictional. Formulas and ranges are drawn from the TCPCHD TPN &amp; TF cheat sheet (6/30/23) where tagged <span class="tag tag-s">sheet</span>; items tagged <span class="tag tag-c">verify</span> are commonly cited and must be checked against your institutional protocol; <span class="tag tag-d">default</span> items are teaching defaults. Always follow your institution\'s PN protocol, pharmacy and attending/RD guidance. Check-off pass criteria are provisional and not validated.';
    document.body.appendChild(ft);
  }
  root.TPNShell = { mount };
})(window);
