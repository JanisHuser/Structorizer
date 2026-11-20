'use strict';

/* =========================================================
   Structorizer v2 – plain JS, no build step.
   Data model:
     project = { title, active, diagrams: [{ name, body: [node] }] }
     node    = { id, type, text, body? , yes?, no?, cases?: [{ label, body }] }
   ========================================================= */

const STORAGE_KEY = 'structorizer-v2';
const $ = (sel) => document.querySelector(sel);
const IS_TOUCH = navigator.maxTouchPoints > 0;
// iPadOS reports itself as a Mac
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

/* ---------------- analytics & consent ----------------
   Google Analytics is only downloaded once the visitor accepts (gtag + consent
   defaults are set up in index.html). Until then nothing is sent or stored. */

const GA_ID = 'G-J8R18F1LH0';
const CONSENT_KEY = 'structorizer-consent'; // 'granted' | 'denied' (also read by the legacy pages)
const CONSENT_AT_KEY = 'structorizer-consent-at'; // when the choice was made (ms since 1970)

// Ask again after a while, but never on every visit (EU guidance: respect a refusal ~6 months)
const DAY = 24 * 60 * 60 * 1000;
const CONSENT_MAX_AGE = { granted: 395 * DAY, denied: 182 * DAY }; // ~13 months / ~6 months

let consent = null; // 'granted' | 'denied' | null (ask)
try {
  consent = localStorage.getItem(CONSENT_KEY);
  if (consent !== 'granted' && consent !== 'denied') {
    consent = null;
  } else {
    let at = Number(localStorage.getItem(CONSENT_AT_KEY));
    if (!at) { // choice made before dates were stored: count from now
      at = Date.now();
      localStorage.setItem(CONSENT_AT_KEY, String(at));
    }
    if (Date.now() - at > CONSENT_MAX_AGE[consent]) { // expired: forget it and ask again
      if (consent === 'granted') deleteGaCookies();
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_AT_KEY);
      consent = null;
    }
  }
} catch (e) { consent = null; /* storage blocked */ }

let gaLoaded = false;

function applyConsent() {
  const granted = consent === 'granted';
  gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  if (granted && !gaLoaded) {
    gaLoaded = true;
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.append(s);
  }
}

/** Remove Google Analytics cookies after consent is withdrawn. */
function deleteGaCookies() {
  document.cookie.split('; ').map((c) => c.split('=')[0]).filter((n) => n.startsWith('_ga')).forEach((name) => {
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = expired;
    document.cookie = `${expired}; domain=${location.hostname}`;
    document.cookie = `${expired}; domain=.${location.hostname}`;
  });
}

function setConsent(granted) {
  consent = granted ? 'granted' : 'denied';
  try {
    localStorage.setItem(CONSENT_KEY, consent);
    localStorage.setItem(CONSENT_AT_KEY, String(Date.now()));
  } catch (e) { /* ignore */ }
  applyConsent();
  if (!granted) deleteGaCookies();
}

/** Send a usage event (only with consent). */
function track(name, params = {}) {
  if (consent === 'granted') gtag('event', name, params);
}

// Code examples are language-neutral; names and descriptions live in i18n.js
const EXAMPLES = {
  while: 'while (a >= 1) {\n  …\n}',
  dowhile: 'do {\n  …\n} while (a >= 1);',
  for: 'for (int i = 1; i <= 10; i++) {\n  …\n}',
  if: 'if (a > b) {\n  …\n} else {\n  …\n}',
  switch: 'switch (x) {\n  case 1: …; break;\n  default: …\n}',
  instruction: 'a = a + 1;',
  jump: 'while (true) {\n  …\n  if (a > 10) break;\n}\nreturn a;',
  parallel: 'Thread t1 = new Thread(() -> { … });\nThread t2 = new Thread(() -> { … });\nt1.start(); t2.start();',
};

let project = null;
let selectedId = null;
let past = [];
let future = [];
let runner = null; // step-through run in progress (run.js)

/* ---------------- model helpers ---------------- */

const uid = () => Math.random().toString(36).slice(2, 10);

function createNode(type) {
  // auto = still the default text, so it follows the selected language
  const n = { id: uid(), type, text: tr(`el.${type}.text`), auto: true };
  if (['while', 'dowhile', 'for'].includes(type)) n.body = [];
  if (type === 'if') { n.yes = []; n.no = []; }
  if (type === 'switch') n.cases = [{ label: '1', body: [] }, { label: '2', body: [] }, { label: tr('case.default'), auto: true, body: [] }];
  if (type === 'parallel') n.threads = [[], []];
  return n;
}

function childLists(node) {
  if (node.body) return [node.body];
  if (node.type === 'if') return [node.yes, node.no];
  if (node.cases) return node.cases.map((c) => c.body);
  if (node.threads) return node.threads;
  return [];
}

/** Find node by id -> { node, list, index } */
function find(id, list = diagram().body) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return { node: list[i], list, index: i };
    for (const l of childLists(list[i])) {
      const r = find(id, l);
      if (r) return r;
    }
  }
  return null;
}

function containsList(node, list) {
  return childLists(node).some((l) => l === list || l.some((n) => containsList(n, list)));
}

const diagram = () => project.diagrams[project.active];

/* ---------------- history & persistence ---------------- */

function snapshot() {
  past.push(JSON.stringify(project));
  if (past.length > 100) past.shift();
  future = [];
}

/** For text fields: take one snapshot on the first change after focusing. */
function snapshotOnce(input) {
  let taken = false;
  input.addEventListener('focus', () => { taken = false; });
  return () => { if (!taken) { snapshot(); taken = true; } };
}

function commit() {
  document.title = `${project.title} – Structorizer`;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch (e) { /* ignore */ }
  render();
}

function undo() {
  if (!past.length) return;
  future.push(JSON.stringify(project));
  project = JSON.parse(past.pop());
  localizeProject(project);
  selectedId = null;
  commit();
}

function redo() {
  if (!future.length) return;
  past.push(JSON.stringify(project));
  project = JSON.parse(future.pop());
  localizeProject(project);
  selectedId = null;
  commit();
}

function loadProject(p) {
  localizeProject(p);
  project = p;
  project.active = Math.min(project.active || 0, project.diagrams.length - 1);
  selectedId = null;
  past = []; future = [];
  commit();
}

function newProject(title) {
  loadProject({
    title: title || '', auto: !title, active: 0,
    diagrams: [{ name: title || '', auto: !title, body: [] }],
  });
}

/** Put all text the user has not changed into the current language.
 *  Projects saved before translations existed were German and have no auto flags. */
function localizeProject(p) {
  const de = I18N.de;
  p.auto ??= p.title === de['project.default'];
  if (p.auto) p.title = tr('project.default');
  const walk = (list) => list.forEach((n) => {
    n.auto ??= n.text === de[`el.${n.type}.text`];
    if (n.auto) n.text = tr(`el.${n.type}.text`);
    (n.cases || []).forEach((c) => {
      c.auto ??= c.label === de['case.default'];
      if (c.auto) c.label = tr('case.default');
    });
    childLists(n).forEach(walk);
  });
  p.diagrams.forEach((d) => {
    if (d.auto === undefined) {
      const fn = /^Funktion (\d+)$/.exec(d.name);
      d.auto = d.name === de['diagram.main'] || !!fn;
      if (fn) d.n = Number(fn[1]);
    }
    if (d.auto) d.name = d.n ? tr('diagram.function', { n: d.n }) : tr('diagram.main');
    walk(d.body);
  });
}

function setLanguage(code) {
  if (code !== lang) track('language_change', { ui_language: code });
  lang = code;
  saveLanguage();
  applyLanguage();
  if (project) {
    localizeProject(project);
    commit();
  }
}

function applyLanguage() {
  translatePage();
  $('#langSelect').value = lang;
  document.querySelectorAll('#langPicker button').forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active);
  });
}

/* ---------------- rendering ---------------- */

const targetOf = new WeakMap(); // DOM element -> { list, index } (element or empty sequence)

function render() {
  renderTabs();
  const d = diagram();
  const root = document.createElement('div');
  root.className = 'struct';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = d.name;
  title.title = tr('tab.rename');
  title.ondblclick = () => renameDiagram(project.active);
  const seq = renderSeq(d.body);
  root.append(title, seq);
  $('#diagram').replaceChildren(root);
  layoutDecisions();
  renderProps();
  if (typeof highlightRun === 'function') highlightRun();
}

function renderSeq(list, extraClass = '') {
  const seq = document.createElement('div');
  seq.className = 'seq ' + extraClass;
  if (!list.length) {
    seq.classList.add('empty');
    targetOf.set(seq, { list, index: 0 });
  }
  list.forEach((node, i) => {
    const el = renderNode(node);
    if (i > 0) el.style.borderTop = '1px solid var(--line)';
    targetOf.set(el, { list, index: i });
    seq.append(el);
  });
  return seq;
}

function label(text, cls = 'label') {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = text || ' ';
  return d;
}

function renderNode(node) {
  const el = document.createElement('div');
  el.className = `el ${node.type}`;
  el.dataset.id = node.id;
  el.draggable = true;
  if (node.id === selectedId) el.classList.add('selected');

  switch (node.type) {
    case 'instruction':
    case 'call':
      el.append(label(node.text));
      break;
    case 'jump': {
      // arrow-shaped left edge: the jump leaves the current block
      const l = label(node.text);
      l.insertAdjacentHTML('afterbegin', '<svg class="jump-mark" viewBox="0 0 10 10" preserveAspectRatio="none"><path d="M10 0L0 5L10 10"/></svg>');
      el.append(l);
      break;
    }
    case 'parallel':
      el.append(parallelBar(node.text, 'top'), cols(node.threads), parallelBar('', 'bottom'));
      break;
    case 'while':
    case 'for': {
      const head = label(node.text, 'label head');
      const body = renderSeq(node.body, 'body');
      el.append(head, body);
      break;
    }
    case 'dowhile': {
      const body = renderSeq(node.body, 'body');
      el.append(body, label(node.text, 'label foot'));
      break;
    }
    case 'if':
      el.append(
        decisionHead(node.text, [tr('branch.true'), tr('branch.false')]),
        cols([node.yes, node.no]),
      );
      break;
    case 'switch':
      el.append(
        decisionHead(node.text, node.cases.map((c) => c.label)),
        cols(node.cases.map((c) => c.body)),
      );
      break;
  }
  return el;
}

/** Top / bottom bar of a parallel block: diagonals in both corners (one bar per thread split). */
function parallelBar(text, pos) {
  const bar = label(text, `par ${pos}`);
  const d = pos === 'top' ? ['M0 0L10 10', 'M10 0L0 10'] : ['M0 10L10 0', 'M0 0L10 10'];
  bar.insertAdjacentHTML('beforeend',
    `<svg class="l" viewBox="0 0 10 10" preserveAspectRatio="none"><path d="${d[0]}"/></svg>`
    + `<svg class="r" viewBox="0 0 10 10" preserveAspectRatio="none"><path d="${d[1]}"/></svg>`);
  return bar;
}

function decisionHead(text, labels) {
  const head = document.createElement('div');
  head.className = 'head';
  head.innerHTML = '<svg><line/><line/><path/></svg>';
  head.append(label(text, 'cond'));
  labels.forEach((l) => head.append(label(l, 'branch')));
  return head;
}

/** Columns size to their content, so the diagonals and branch labels are placed
 *  after layout using the real column boundaries.
 *  If:     two diagonals meeting at the bottom between "wahr" and "falsch".
 *  Switch: the diagonals meet at the start of the default (last) column, on top of a
 *          row of case labels; every column divider continues up to the diagonal. */
function layoutDecisions() {
  document.querySelectorAll('#diagram .if > .head, #diagram .switch > .head').forEach((head) => {
    const isSwitch = head.parentElement.classList.contains('switch');
    const cols = [...head.nextElementSibling.children];
    const branches = [...head.querySelectorAll('.branch')];

    // Switch: each case column is at least as wide as its label
    if (isSwitch) {
      branches.forEach((b) => { b.style.width = ''; }); // measure natural label width
      cols.forEach((c, i) => { c.style.minWidth = `${Math.min(branches[i].scrollWidth + 14, 240)}px`; });
    }

    const base = head.getBoundingClientRect();
    const w = base.width;
    const h = base.height;
    const edges = cols.map((c) => {
      const r = c.getBoundingClientRect();
      return { left: r.left - base.left, right: r.right - base.left };
    });
    const split = edges[edges.length - 1].left;
    const band = isSwitch ? Math.max(...branches.map((b) => b.offsetHeight)) + 6 : 0;
    const yMeet = h - band;
    const lineY = (x) => (x <= split ? (yMeet * x) / split : yMeet * (1 - (x - split) / (w - split)));

    const [l1, l2, dividers] = head.querySelectorAll('line, path');
    l1.setAttribute('x1', 0); l1.setAttribute('y1', 0); l1.setAttribute('x2', split); l1.setAttribute('y2', yMeet);
    l2.setAttribute('x1', split); l2.setAttribute('y1', yMeet); l2.setAttribute('x2', w); l2.setAttribute('y2', 0);
    dividers.setAttribute('d', isSwitch
      ? edges.slice(1).map((e) => `M${e.left} ${lineY(e.left)}V${h}`).join('')
      : '');

    branches.forEach((b, i) => {
      if (isSwitch) {
        // centered in its own cell of the label row
        b.style.left = `${edges[i].left}px`;
        b.style.width = `${edges[i].right - edges[i].left}px`;
        b.style.right = '';
      } else {
        b.style.left = i === 0 ? '0' : '';
        b.style.right = i === 1 ? '0' : '';
      }
    });
  });
}
// Re-measure whenever the diagram's size changes (web font loaded, sidebar toggled, window resized)
new ResizeObserver(() => layoutDecisions()).observe(document.querySelector('#diagram'));
document.fonts?.ready.then(layoutDecisions);

function cols(lists) {
  const c = document.createElement('div');
  c.className = 'cols';
  lists.forEach((l) => c.append(renderSeq(l)));
  return c;
}

function renderTabs() {
  const tabs = $('#tabs');
  tabs.replaceChildren();
  project.diagrams.forEach((d, i) => {
    // A tab is a container with two real buttons (name + close); buttons can't be nested.
    const t = document.createElement('div');
    t.className = 'tab' + (i === project.active ? ' active' : '');
    const name = document.createElement('button');
    name.className = 'tab-name';
    name.textContent = d.name;
    name.title = tr('tab.rename');
    name.onclick = () => {
      if (i === project.active) return; // keep the element so a double click can rename
      project.active = i;
      selectedId = null;
      commit();
    };
    name.ondblclick = () => renameDiagram(i);
    t.append(name);
    if (i > 0) {
      const x = document.createElement('button');
      x.className = 'x';
      x.textContent = '×';
      x.title = tr('tab.delete', { name: d.name });
      x.setAttribute('aria-label', x.title);
      x.onclick = async () => {
        if (!await ask(tr('ask.deleteDiagram', { name: d.name }), null, tr('common.delete'))) return;
        snapshot();
        project.diagrams.splice(i, 1);
        if (project.active >= i) project.active = Math.max(0, project.active - 1);
        selectedId = null;
        commit();
      };
      t.append(x);
    }
    tabs.append(t);
  });
}

/** In-app replacement for prompt()/confirm(). Resolves with the text (or true), or null when cancelled. */
function ask(title, value = null, okLabel = 'OK') {
  const dlg = $('#askDialog');
  const input = $('#askInput');
  $('#askTitle').textContent = title;
  $('#askOk').textContent = okLabel;
  input.hidden = value === null;
  input.value = value ?? '';
  dlg.returnValue = '';
  dlg.showModal();
  if (!input.hidden) input.select();
  return new Promise((resolve) => {
    dlg.addEventListener('close', () => {
      if (dlg.returnValue !== 'ok') resolve(null);
      else resolve(input.hidden ? true : input.value.trim() || null);
    }, { once: true });
  });
}

function message(text) {
  const p = document.createElement('p');
  p.textContent = text;
  openInfo(tr('msg.title'), p);
}

async function renameDiagram(i) {
  const d = project.diagrams[i];
  const name = await ask(tr('ask.diagramName'), d.name);
  if (!name || name === d.name) return;
  snapshot();
  d.name = name;
  d.auto = false;
  commit();
}

/* ---------------- properties panel ---------------- */

function renderProps() {
  updateEditActions();
  const hit = selectedId && find(selectedId);
  $('#props').hidden = !hit;
  $('#deleteBtn').disabled = !hit;
  if (!hit) return;
  const node = hit.node;
  $('#propTitle').textContent = tr(`el.${node.type}.name`);
  $('#propLabel').textContent = tr(`field.${node.type}`);
  const text = $('#propText');
  if (document.activeElement !== text) text.value = node.text;

  const caseBox = $('#caseProps');
  if (node.type === 'parallel') { renderThreadProps(node, caseBox); return; }
  if (node.type !== 'switch') { caseBox.replaceChildren(); return; }
  if (caseBox.contains(document.activeElement)) return;
  caseBox.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'case-heading';
  heading.textContent = tr('case.heading');
  caseBox.append(heading);
  node.cases.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'case-row';
    const inp = document.createElement('input');
    inp.setAttribute('autocapitalize', 'off');
    inp.setAttribute('autocorrect', 'off');
    inp.spellcheck = false;
    inp.value = c.label;
    inp.placeholder = i === node.cases.length - 1 ? tr('case.default') : tr('case.placeholder', { n: i + 1 });
    inp.setAttribute('aria-label', inp.placeholder);
    const snap = snapshotOnce(inp);
    inp.oninput = () => { snap(); c.label = inp.value; c.auto = false; commit(); };
    const rm = document.createElement('button');
    rm.textContent = '−';
    rm.title = tr('case.remove');
    rm.disabled = node.cases.length <= 2;
    rm.onclick = async () => {
      if (c.body.length && !await ask(tr('case.removeAsk', { label: c.label, n: c.body.length }), null, tr('common.remove'))) return;
      snapshot();
      node.cases.splice(i, 1);
      commit();
    };
    row.append(inp, rm);
    caseBox.append(row);
  });
  const add = document.createElement('button');
  add.className = 'small';
  add.textContent = tr('case.add');
  add.onclick = () => {
    snapshot();
    // next free number, inserted before the default case
    const used = node.cases.map((c) => Number(c.label)).filter(Number.isFinite);
    const next = used.length ? Math.max(...used) + 1 : node.cases.length;
    node.cases.splice(node.cases.length - 1, 0, { label: String(next), body: [] });
    commit();
  };
  caseBox.append(add);
}

/** Parallel block: list of threads with remove buttons and "add thread". */
function renderThreadProps(node, box) {
  box.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'case-heading';
  heading.textContent = tr('thread.heading');
  box.append(heading);
  node.threads.forEach((t, i) => {
    const row = document.createElement('div');
    row.className = 'case-row thread-row';
    const name = document.createElement('span');
    name.textContent = tr('thread.label', { n: i + 1 });
    const count = document.createElement('small');
    count.textContent = t.length ? `(${t.length})` : '';
    const rm = document.createElement('button');
    rm.textContent = '−';
    rm.title = tr('thread.remove');
    rm.disabled = node.threads.length <= 2;
    rm.onclick = async () => {
      if (t.length && !await ask(tr('thread.removeAsk', { n: i + 1, count: t.length }), null, tr('common.remove'))) return;
      snapshot();
      node.threads.splice(i, 1);
      commit();
    };
    row.append(name, count, rm);
    box.append(row);
  });
  const add = document.createElement('button');
  add.className = 'small';
  add.textContent = tr('thread.add');
  add.onclick = () => { snapshot(); node.threads.push([]); commit(); };
  box.append(add);
}

const snapText = snapshotOnce($('#propText'));
$('#propText').addEventListener('input', (e) => {
  const hit = find(selectedId);
  if (hit) { snapText(); hit.node.text = e.target.value; hit.node.auto = false; commit(); }
});

/* ---------------- selection & deletion ---------------- */

/** Selection only toggles a class – no re-render, so double clicks keep their target. */
function select(id) {
  if (id === selectedId) return;
  selectedId = id;
  document.querySelectorAll('#diagram .el.selected').forEach((el) => el.classList.remove('selected'));
  if (id) document.querySelector(`#diagram .el[data-id="${id}"]`)?.classList.add('selected');
  $('#propText').blur();
  renderProps();
  if (id) $('#props').scrollIntoView({ block: 'nearest' });
}

/** Put a node after the selected one (or at the end of the diagram) and select it. */
function placeNode(node) {
  const hit = selectedId && find(selectedId);
  if (hit) hit.list.splice(hit.index + 1, 0, node);
  else diagram().body.push(node);
  selectedId = node.id;
}

/** Insert a new element after the selected one (or at the end) – used without drag & drop. */
function insertNode(type) {
  snapshot();
  placeNode(createNode(type));
  commit();
  track('element_add', { element_type: type, method: 'button' });
}

/* ---------------- copy & paste ----------------
   The clipboard holds one element (with everything inside it). It is kept in
   localStorage so it also works across browser tabs and after a reload. */

const CLIP_KEY = 'structorizer-clipboard';
let clipboard = null; // JSON of the copied node
try { clipboard = localStorage.getItem(CLIP_KEY); } catch (e) { /* ignore */ }
window.addEventListener('storage', (e) => { if (e.key === CLIP_KEY) { clipboard = e.newValue; updateEditActions(); } });

/** Deep copy of a node with fresh ids, so the copy is independent of the original. */
function cloneNode(node) {
  const copy = JSON.parse(JSON.stringify(node));
  const renew = (n) => { n.id = uid(); childLists(n).forEach((l) => l.forEach(renew)); };
  renew(copy);
  return copy;
}

function copySelected() {
  const hit = selectedId && find(selectedId);
  if (!hit) return false;
  clipboard = JSON.stringify(hit.node);
  try { localStorage.setItem(CLIP_KEY, clipboard); } catch (e) { /* ignore */ }
  updateEditActions();
  return true;
}

function cutSelected() {
  if (copySelected()) deleteSelected();
}

function pasteClipboard() {
  if (!clipboard) return;
  let node;
  try { node = cloneNode(JSON.parse(clipboard)); } catch (e) { return; }
  snapshot();
  placeNode(node);
  commit();
  track('element_paste');
}

function duplicateSelected() {
  const hit = selectedId && find(selectedId);
  if (!hit) return;
  snapshot();
  const copy = cloneNode(hit.node);
  hit.list.splice(hit.index + 1, 0, copy);
  selectedId = copy.id;
  commit();
  track('element_duplicate');
}

/** Enable / disable the edit commands that need a selection or a clipboard. */
function updateEditActions() {
  const sel = !!(project && selectedId && find(selectedId));
  document.querySelectorAll('[data-action="copy"], [data-action="cut"], [data-action="duplicate"], [data-action="delete"]')
    .forEach((b) => { b.disabled = !sel; });
  document.querySelectorAll('[data-action="paste"]').forEach((b) => { b.disabled = !clipboard; });
}

function deleteSelected() {
  const hit = selectedId && find(selectedId);
  if (!hit) return;
  snapshot();
  hit.list.splice(hit.index, 1);
  selectedId = null;
  commit();
}

$('#diagram').addEventListener('click', (e) => {
  const el = e.target.closest('.el');
  select(el ? el.dataset.id : null);
});
$('#diagram').addEventListener('dblclick', (e) => {
  const el = e.target.closest('.el');
  if (!el) return;
  select(el.dataset.id);
  if (IS_TOUCH) { editText(el.dataset.id); return; }
  $('#propText').focus();
  $('#propText').select();
});

/* ---------------- edit dialog (touch) ----------------
   On iPad the small field in the sidebar is awkward (keyboard, zoom), so the text
   is edited in a dialog near the top of the screen instead. */

const MULTILINE = new Set(['instruction', 'call']); // Enter adds a line; elsewhere Enter saves

function editText(id) {
  const hit = id && find(id);
  if (!hit) return;
  const node = hit.node;
  const dlg = $('#editDialog');
  const ta = $('#editText');
  $('#editTitle').textContent = tr(`el.${node.type}.name`);
  $('#editLabel').textContent = tr(`field.${node.type}`);
  ta.value = node.text;
  ta.rows = MULTILINE.has(node.type) ? 4 : 2;
  ta.dataset.multiline = MULTILINE.has(node.type);
  dlg.returnValue = '';
  dlg.showModal();
  ta.focus();
  ta.select();
  dlg.addEventListener('close', () => {
    if (dlg.returnValue !== 'ok') return;
    const text = ta.value.replace(/\s+$/, '');
    if (text === node.text) return;
    snapshot();
    node.text = text;
    node.auto = false;
    commit();
  }, { once: true });
}

$('#editText').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.target.dataset.multiline !== 'true') && !e.shiftKey) {
    e.preventDefault();
    $('#editDialog').close('ok');
  }
});

// Touch: the sidebar field only shows the text; tapping it opens the dialog
if (IS_TOUCH) {
  $('#propText').readOnly = true;
  $('#propText').addEventListener('click', () => editText(selectedId));
}
$('#canvas').addEventListener('click', (e) => { if (e.target.id === 'canvas') select(null); });
$('#deleteBtn').onclick = deleteSelected;

/* ---------------- drag & drop ---------------- */

let dragData = null;      // { type } for new elements or { id } for moves
let dropTarget = null;    // { list, index }
let indicator = null;     // element currently showing the insertion marker

document.querySelectorAll('.tool').forEach((tool) => {
  tool.addEventListener('dragstart', (e) => {
    if (touch) { e.preventDefault(); return; }
    dragData = { type: tool.dataset.type };
    e.dataTransfer.setData('text/plain', tool.dataset.type);
    e.dataTransfer.effectAllowed = 'copy';
    document.body.classList.add('dragging');
  });
  tool.addEventListener('click', () => showElementInfo(tool.dataset.type));
});

$('#diagram').addEventListener('dragstart', (e) => {
  const el = e.target.closest('.el');
  if (!el || touch) { e.preventDefault(); return; }
  dragData = { id: el.dataset.id };
  e.dataTransfer.setData('text/plain', el.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => el.classList.add('dragged'));
  document.body.classList.add('dragging');
});

function clearIndicator() {
  if (indicator) {
    indicator.style.boxShadow = '';
    indicator.classList.remove('empty-over', 'end-over');
  }
  indicator = null;
}

/** Work out where the dragged item would land for the element under the pointer.
 *  Shows the insertion marker and returns true when dropping there is allowed. */
function updateDrop(under, clientY) {
  if (!dragData) return false;
  const empty = under.closest('.seq.empty');
  // free space below the last element of the (stretched) main sequence: append at the end
  const end = !empty && under.matches('.struct > .seq') ? under : null;
  const el = !end && under.closest('.el');
  let target = null;
  let mark = null;
  let after = false;
  if (empty) {
    target = targetOf.get(empty);
    mark = empty;
  } else if (end) {
    target = { list: diagram().body, index: diagram().body.length };
    mark = end;
  } else if (el) {
    const t = targetOf.get(el);
    const r = el.getBoundingClientRect();
    after = clientY > r.top + r.height / 2;
    target = { list: t.list, index: t.index + (after ? 1 : 0) };
    mark = el;
  }
  if (!target) { clearIndicator(); dropTarget = null; return false; }

  // a node can't be dropped into itself
  if (dragData.id) {
    const src = find(dragData.id);
    if (src.node === (el && find(el.dataset.id)?.node) || containsList(src.node, target.list)) {
      clearIndicator(); dropTarget = null; return false;
    }
  }
  dropTarget = target;
  if (indicator !== mark) clearIndicator();
  indicator = mark;
  if (empty) mark.classList.add('empty-over');
  else if (end) mark.classList.add('end-over');
  else mark.style.boxShadow = after ? 'inset 0 -4px 0 var(--accent)' : 'inset 0 4px 0 var(--accent)';
  return true;
}

$('#diagram').addEventListener('dragover', (e) => {
  if (updateDrop(e.target, e.clientY)) e.preventDefault();
});

$('#diagram').addEventListener('drop', (e) => {
  e.preventDefault();
  performDrop('drag');
});

function performDrop(method) {
  if (!dragData || !dropTarget) { endDrag(); return; }
  snapshot();
  let { list, index } = dropTarget;
  let node;
  if (dragData.type) {
    node = createNode(dragData.type);
    track('element_add', { element_type: dragData.type, method });
  } else {
    const src = find(dragData.id);
    node = src.node;
    src.list.splice(src.index, 1);
    if (src.list === list && src.index < index) index--;
  }
  list.splice(index, 0, node);
  selectedId = node.id;
  endDrag();
  commit();
}

function endDrag() {
  clearIndicator();
  dragData = null;
  dropTarget = null;
  document.body.classList.remove('dragging');
  document.querySelectorAll('.dragged').forEach((d) => d.classList.remove('dragged'));
}
document.addEventListener('dragend', endDrag);

/* ---------------- touch: drag & drop and double tap (iPad, phones) ----------------
   Native HTML drag & drop is unreliable with fingers, so touches are handled here:
   - diagram elements: press and hold briefly, then drag
   - palette elements: hold, or slide sideways towards the diagram (vertical = scroll)
   A floating copy follows the finger; the drop logic is shared with the mouse. */

const LONG_PRESS = 300; // ms
let touch = null; // { data, source, slide, x0, y0, x, y, timer, started, ghost }

function touchPick(e, data, source, slide) {
  if (e.touches.length !== 1 || touch) return;
  const t = e.touches[0];
  touch = { data, source, slide, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY, started: false };
  // stop iOS from starting its own drag on the same press
  touch.wasDraggable = source.draggable;
  source.draggable = false;
  touch.timer = setTimeout(beginTouchDrag, LONG_PRESS);
}

function beginTouchDrag() {
  clearTimeout(touch.timer);
  touch.started = true;
  dragData = touch.data;
  document.body.classList.add('dragging');
  const r = touch.source.getBoundingClientRect();
  const ghost = touch.source.cloneNode(true);
  ghost.classList.remove('selected');
  ghost.classList.add('touch-ghost');
  ghost.style.width = `${Math.min(r.width, 320)}px`;
  document.body.append(ghost);
  touch.ghost = ghost;
  if (touch.data.id) touch.source.classList.add('dragged');
  navigator.vibrate?.(10);
  moveTouchDrag();
  requestAnimationFrame(autoScroll);
}

function moveTouchDrag() {
  const { x, y, ghost } = touch;
  // above the finger, so the finger doesn't hide it
  ghost.style.left = `${x - 24}px`;
  ghost.style.top = `${y - ghost.offsetHeight - 18}px`;
  const under = document.elementFromPoint(x, y);
  if (under && $('#diagram').contains(under)) updateDrop(under, y);
  else { clearIndicator(); dropTarget = null; }
}

/** Scroll the canvas while the finger rests near its edge. */
function autoScroll() {
  if (!touch?.started) return;
  const c = $('#canvas');
  const r = c.getBoundingClientRect();
  const edge = 56;
  const step = (d) => Math.round(Math.max(0, edge - d) / 4);
  const inside = touch.x > r.left && touch.x < r.right && touch.y > r.top - edge && touch.y < r.bottom + edge;
  if (inside) {
    const dx = step(r.right - touch.x) - step(touch.x - r.left);
    const dy = step(r.bottom - touch.y) - step(touch.y - r.top);
    if (dx || dy) { c.scrollBy(dx, dy); moveTouchDrag(); }
  }
  requestAnimationFrame(autoScroll);
}

function releaseTouch() {
  if (!touch) return;
  clearTimeout(touch.timer);
  touch.ghost?.remove();
  touch.source.draggable = touch.wasDraggable;
  touch = null;
}

document.querySelectorAll('.tool').forEach((tool) => {
  tool.addEventListener('touchstart', (e) => touchPick(e, { type: tool.dataset.type }, tool, true), { passive: true });
});
$('#diagram').addEventListener('touchstart', (e) => {
  const el = e.target.closest('.el');
  if (el) touchPick(e, { id: el.dataset.id }, el, false);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!touch) return;
  const t = e.touches[0];
  touch.x = t.clientX;
  touch.y = t.clientY;
  if (!touch.started) {
    const dx = touch.x - touch.x0;
    const dy = touch.y - touch.y0;
    if (Math.hypot(dx, dy) < 10) return;
    if (touch.slide && Math.abs(dx) > Math.abs(dy) * 1.5) beginTouchDrag();
    else { releaseTouch(); return; } // the finger is scrolling
  }
  if (e.cancelable) e.preventDefault();
  moveTouchDrag();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (!touch) return;
  const started = touch.started;
  releaseTouch();
  if (started) {
    e.preventDefault(); // no click after a drag
    performDrop('touch');
  }
}, { passive: false });

document.addEventListener('touchcancel', () => {
  if (touch?.started) endDrag();
  releaseTouch();
});

// iOS Safari only shows :active (the tap feedback in style.css) when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true });

// No long-press menu / text magnifier on elements that can be dragged
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest?.('#diagram .el, .tool')) e.preventDefault();
});

/* Double tap acts as double click (edit element text, rename tab). It is dispatched
   right in touchend so the on-screen keyboard can open for the focused field. */
let lastTap = null;
let syntheticDblAt = 0;
document.addEventListener('touchend', (e) => {
  if (e.defaultPrevented || e.changedTouches.length !== 1) { lastTap = null; return; }
  const t = e.changedTouches[0];
  const now = Date.now();
  if (lastTap && lastTap.target === e.target && now - lastTap.time < 400
      && Math.hypot(t.clientX - lastTap.x, t.clientY - lastTap.y) < 30) {
    lastTap = null;
    if (!e.target.closest('#diagram, .tab-name, .struct')) return;
    e.preventDefault(); // keep the focus where the double click puts it
    syntheticDblAt = now;
    e.target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY }));
  } else {
    lastTap = { target: e.target, time: now, x: t.clientX, y: t.clientY };
  }
}, { passive: false });
// If the browser also sends its own double click, handle it only once
document.addEventListener('dblclick', (e) => {
  if (e.isTrusted && Date.now() - syntheticDblAt < 800) e.stopImmediatePropagation();
}, true);

/* ---------------- code export (generators in codegen.js) ---------------- */

function showCode() {
  const body = document.createElement('div');
  const tabs = document.createElement('div');
  tabs.className = 'code-tabs';
  // code block with the copy button in its top right corner
  const box = document.createElement('div');
  box.className = 'code-box';
  const pre = document.createElement('pre');
  const langs = { java: 'Java', python: 'Python' };
  let current = 'java';
  const show = (lang) => {
    current = lang;
    track('code_export', { code_language: lang });
    try {
      pre.textContent = generate(lang);
    } catch (e) {
      pre.textContent = `// ${e.message}`;
    }
    copy.textContent = tr('code.copy');
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  };
  const copy = document.createElement('button');
  copy.className = 'copy-btn';
  Object.entries(langs).forEach(([k, v]) => {
    const b = document.createElement('button');
    b.textContent = v;
    b.dataset.lang = k;
    b.onclick = () => show(k);
    tabs.append(b);
  });
  copy.onclick = () => {
    track('code_copy', { code_language: current });
    navigator.clipboard?.writeText(pre.textContent).then(() => { copy.textContent = tr('code.copied'); });
  };
  box.append(pre, copy);
  body.append(tabs, box);
  show('java');
  openInfo(tr('action.code'), body);
}

/* ---------------- files & image ---------------- */

function download(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.standalone && navigator.canShare?.({ files: [file] })) {
    navigator.share({ files: [file] }).catch(() => {});
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function saveFile() {
  const data = JSON.stringify({ app: 'structorizer', version: 2, project }, null, 2);
  download(new Blob([data], { type: 'application/json' }), `${project.title}.struct`);
  track('project_save');
}

$('#fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const p = data.project || data;
    if (!Array.isArray(p.diagrams)) throw new Error('format');
    $('#startDialog').close();
    loadProject(p);
    track('project_open', { source: 'file' });
  } catch (err) {
    message(tr('msg.badFile'));
  }
});

async function exportImage() {
  if (!window.html2canvas) { message(tr('msg.imageFailed')); return; }
  const prev = selectedId;
  selectedId = null;
  render();
  $('#diagram').classList.add('export');
  try {
    const canvas = await html2canvas($('#diagram'), { backgroundColor: '#fff', scale: 2 });
    canvas.toBlob((b) => download(b, `${diagram().name}.png`));
    track('image_export');
  } finally {
    $('#diagram').classList.remove('export');
  }
  selectedId = prev;
  render();
}

/* ---------------- dialogs ---------------- */

function openInfo(title, content) {
  $('#infoTitle').textContent = title;
  $('#infoBody').replaceChildren(content);
  $('#infoDialog').showModal();
}
$('#infoDialog [data-close]').onclick = () => $('#infoDialog').close();
$('#infoDialog').addEventListener('click', (e) => { if (e.target.id === 'infoDialog') e.target.close(); });

function showElementInfo(type) {
  const div = document.createElement('div');
  div.innerHTML = `<p><b></b></p><p></p><div></div><pre></pre>
    <p class="hint"></p><button class="insert-btn"></button>`;
  const [name, info, hint] = div.querySelectorAll('b, p:nth-of-type(2), .hint');
  name.textContent = `${tr(`el.${type}.name`)}:`;
  info.textContent = tr(`el.${type}.info`);
  hint.textContent = tr('info.tip');
  div.querySelector('div').textContent = tr('info.example');
  div.querySelector('pre').textContent = EXAMPLES[type] || `${tr('el.call.text')};`;
  const insert = div.querySelector('.insert-btn');
  insert.textContent = tr('info.insert');
  insert.onclick = () => { $('#infoDialog').close(); insertNode(type); };
  openInfo(tr('info.title'), div);
}

function showHelp() {
  const div = document.createElement('div');
  const keys = ['drag', 'select', 'move', 'keys', 'copy', 'tabs', 'run', 'save'];
  if (IS_TOUCH) keys.splice(3, 0, 'touch');
  const items = keys.map((k) => `<li>${tr(`help.${k}`)}</li>`).join('');
  div.innerHTML = `
    <p>${tr('help.intro')}</p>
    <ul>${items}</ul>
    <p><a href="https://janishuser.github.io/Structorizer/legacy/struct.html" target="_blank" rel="noopener">${tr('help.old')}</a></p>`;
  openInfo(tr('help.title'), div);
  track('help_open');
}

// Operator of the site (legal notice / data controller), same in every language
const OPERATOR = {
  company: 'J.Huser IT Services',
  owner: 'Janis Huser',
  street: 'Abläschstrasse 66',
  city: '8750 Glarus, Schweiz',
  uid: 'CHE-299.352.957',
  email: 'info@jhuser-it-services.ch',
  website: 'https://jhuser-it-services.ch',
};

function showPrivacy() {
  const o = OPERATOR;
  const div = document.createElement('div');
  div.innerHTML = `
    <p><b>${tr('privacy.responsible')}:</b><br>
      ${o.company}<br>
      ${tr('privacy.owner')}: ${o.owner}<br>
      ${o.street}<br>
      ${o.city}<br>
      UID: ${o.uid}<br>
      <a href="mailto:${o.email}">${o.email}</a> · <a href="${o.website}" target="_blank" rel="noopener">${o.website.replace('https://', '')}</a></p>
    <p>${tr('privacy.rights')}</p>
    <p>${tr('privacy.local')}</p>
    <p>${tr('privacy.ga')}</p>
    <p>${tr('privacy.third')}</p>
    <p class="hint">${tr(consent === 'granted' ? 'privacy.status.granted' : 'privacy.status.denied')}</p>
    <button class="insert-btn"></button>`;
  const toggle = div.querySelector('button');
  toggle.textContent = tr(consent === 'granted' ? 'privacy.disable' : 'privacy.enable');
  toggle.onclick = () => {
    const grant = consent !== 'granted';
    $('#infoDialog').close();
    chooseConsent(grant);
  };
  openInfo(tr('privacy.title'), div);
}

/* consent dialog: asked once, before the start dialog */
function chooseConsent(granted) {
  setConsent(granted);
  if ($('#consentDialog').open) $('#consentDialog').close();
}
$('#consentAccept').onclick = () => chooseConsent(true);
$('#consentDecline').onclick = () => chooseConsent(false);
$('#consentMore').onclick = (e) => { e.preventDefault(); showPrivacy(); };
// Esc should not skip the choice (closedby="none" in index.html; preventDefault for older browsers).
// If a browser closes it anyway, nothing is loaded or stored and the question comes back next visit.
$('#consentDialog').addEventListener('cancel', (e) => e.preventDefault());
$('#consentDialog').addEventListener('close', () => {
  if (!project && !$('#startDialog').open) showStart();
});

/* start dialog */
function showStart() {
  let last = null;
  try { last = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  $('#lastBtn').disabled = !last;
  $('#newTitle').value = '';
  $('#createBtn').disabled = true;
  $('#startDialog').showModal();
}
$('#newTitle').addEventListener('input', (e) => { $('#createBtn').disabled = !e.target.value.trim(); });
$('#newTitle').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.value.trim()) $('#createBtn').click(); });
$('#createBtn').onclick = () => {
  $('#startDialog').close();
  newProject($('#newTitle').value.trim());
  track('project_create');
};
$('#openBtn').onclick = () => $('#fileInput').click();
$('#lastBtn').onclick = () => {
  try {
    loadProject(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    $('#startDialog').close();
    track('project_open', { source: 'last' });
  } catch (e) { message(tr('msg.lastFailed')); }
};
$('#startDialog').addEventListener('close', () => {
  saveLanguage(); // the language shown when starting is the chosen one
  if (!project) newProject();
});

/* language choice: buttons in the start dialog, dropdown in the menu bar */
Object.entries(LANGS).forEach(([code, name]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = name;
  b.dataset.lang = code;
  b.onclick = () => setLanguage(code);
  $('#langPicker').append(b);
  $('#langSelect').add(new Option(name, code));
});
$('#langSelect').onchange = (e) => setLanguage(e.target.value);

/* ---------------- menus, tabs & shortcuts ---------------- */

const actions = {
  new: showStart,
  open: () => $('#fileInput').click(),
  save: saveFile,
  code: showCode,
  image: exportImage,
  undo, redo,
  delete: deleteSelected,
  copy: copySelected,
  cut: cutSelected,
  paste: pasteClipboard,
  duplicate: duplicateSelected,
  info: showHelp,
  privacy: showPrivacy,
};

document.querySelectorAll('.menu').forEach((menu) => {
  menu.querySelector('.menu-title').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.contains('open');
    document.querySelectorAll('.menu.open').forEach((m) => m.classList.remove('open'));
    if (!open) menu.classList.add('open');
  });
  menu.addEventListener('mouseenter', () => {
    if (document.querySelector('.menu.open') && !menu.classList.contains('open')) {
      document.querySelectorAll('.menu.open').forEach((m) => m.classList.remove('open'));
      menu.classList.add('open');
    }
  });
});
document.addEventListener('click', () => document.querySelectorAll('.menu.open').forEach((m) => m.classList.remove('open')));
// Commands that don't change the diagram can be used during a run; anything else ends it first
const RUN_SAFE_ACTIONS = new Set(['save', 'code', 'image', 'info', 'privacy', 'copy']);
document.querySelectorAll('[data-action]').forEach((b) => {
  b.onclick = () => {
    if (runner && !runner.done && !RUN_SAFE_ACTIONS.has(b.dataset.action)) stopRun();
    actions[b.dataset.action]();
  };
});

$('#addTab').onclick = async () => {
  const n = project.diagrams.length;
  const suggested = tr('diagram.function', { n });
  const name = await ask(tr('ask.functionName'), suggested);
  if (!name) return;
  snapshot();
  project.diagrams.push(name === suggested ? { name, auto: true, n, body: [] } : { name, auto: false, body: [] });
  project.active = project.diagrams.length - 1;
  selectedId = null;
  commit();
  track('diagram_add');
};

$('#collapseBtn').onclick = () => document.body.classList.toggle('collapsed');

// Text selected on the page (e.g. in a dialog) keeps the browser's own copy
const hasTextSelection = () => !!window.getSelection()?.toString();

document.addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  const dialogOpen = document.querySelector('dialog[open]');
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); if (project) saveFile(); return; }
  if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); $('#fileInput').click(); return; }
  if (typing || dialogOpen || !project) return;
  if (runner && !runner.done) { // while running: step, stop – no editing
    if (e.key === 'Escape') stopRun();
    else if (e.key === 'F10' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); $('#runStep').click(); }
    return;
  }
  if (mod && e.key === 'Enter') { e.preventDefault(); startRun(); return; }
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  else if (mod && e.key.toLowerCase() === 'c' && !hasTextSelection()) { if (copySelected()) e.preventDefault(); }
  else if (mod && e.key.toLowerCase() === 'x' && !hasTextSelection()) { e.preventDefault(); cutSelected(); }
  else if (mod && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteClipboard(); }
  else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateSelected(); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
  else if (e.key === 'Escape') select(null);
});

/* ---------------- boot ---------------- */
// iOS zooms into a text field when it gets focus; maximum-scale stops that
// (pinch-zoom still works – iOS ignores it for the user's own zooming)
if (IS_IOS) {
  const vp = document.querySelector('meta[name="viewport"]');
  vp.content += ', maximum-scale=1';
}
// Code fields: no auto-capitalising ("While") or autocorrect on iPad
document.querySelectorAll('#propText, #askInput, #newTitle, #editText').forEach((f) => {
  f.setAttribute('autocapitalize', 'off');
  f.setAttribute('autocorrect', 'off');
  f.spellcheck = false;
});
// iOS greys out files whose type it doesn't know (.struct), so allow picking any file there
if (IS_IOS) $('#fileInput').removeAttribute('accept');
// Offline support / installable web app
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable */ });
}
applyLanguage();
if (consent === 'granted') applyConsent();
if (consent) showStart();
else $('#consentDialog').showModal();
