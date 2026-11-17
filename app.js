'use strict';

/* =========================================================
   Structorizer v2 – plain JS, no build step.
   Data model:
     project = { title, active, diagrams: [{ name, body: [node] }] }
     node    = { id, type, text, body? , yes?, no?, cases?: [{ label, body }] }
   ========================================================= */

const STORAGE_KEY = 'structorizer-v2';
const $ = (sel) => document.querySelector(sel);

const ELEMENTS = {
  while:       { name: 'While-Schleife',   text: 'Bedingung',      info: 'Eine While-Schleife wird so lange ausgeführt, wie die Bedingung zutrifft. Die Bedingung wird vor jedem Durchlauf geprüft.', example: 'while (a >= 1) {\n  …\n}' },
  dowhile:     { name: 'DoWhile-Schleife', text: 'Bedingung',      info: 'Eine DoWhile-Schleife wird mindestens einmal ausgeführt. Die Bedingung wird erst nach jedem Durchlauf geprüft.', example: 'do {\n  …\n} while (a >= 1);' },
  for:         { name: 'For-Schleife',     text: 'i = 1 bis 10',   info: 'Eine For-Schleife (Zählschleife) wird eine festgelegte Anzahl Male ausgeführt.', example: 'for (int i = 1; i <= 10; i++) {\n  …\n}' },
  if:          { name: 'If-Abfrage',       text: 'Bedingung',      info: 'Trifft die Bedingung zu, wird der linke (wahr) Zweig ausgeführt, sonst der rechte (falsch).', example: 'if (a > b) {\n  …\n} else {\n  …\n}' },
  switch:      { name: 'Mehrfachauswahl',  text: 'Variable',       info: 'Abhängig vom Wert einer Variable wird einer von mehreren Fällen ausgeführt. Der letzte Fall ist der Standardfall (sonst).', example: 'switch (x) {\n  case 1: …; break;\n  default: …\n}' },
  instruction: { name: 'Anweisung',        text: 'Anweisung',      info: 'Eine einfache Anweisung, z.B. eine Zuweisung, Eingabe oder Ausgabe.', example: 'a = a + 1;' },
  call:        { name: 'Funktion',         text: 'funktion()',     info: 'Ruft eine Funktion (Unterprogramm) auf. Weitere Struktogramme können über das "+" in der Tableiste erstellt werden.', example: 'funktion();' },
};

let project = null;
let selectedId = null;
let past = [];
let future = [];

/* ---------------- model helpers ---------------- */

const uid = () => Math.random().toString(36).slice(2, 10);

function createNode(type) {
  const n = { id: uid(), type, text: ELEMENTS[type].text };
  if (['while', 'dowhile', 'for'].includes(type)) n.body = [];
  if (type === 'if') { n.yes = []; n.no = []; }
  if (type === 'switch') n.cases = [{ label: '1', body: [] }, { label: '2', body: [] }, { label: 'sonst', body: [] }];
  return n;
}

function childLists(node) {
  if (node.body) return [node.body];
  if (node.type === 'if') return [node.yes, node.no];
  if (node.cases) return node.cases.map((c) => c.body);
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
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); } catch (e) { /* ignore */ }
  render();
}

function undo() {
  if (!past.length) return;
  future.push(JSON.stringify(project));
  project = JSON.parse(past.pop());
  selectedId = null;
  commit();
}

function redo() {
  if (!future.length) return;
  past.push(JSON.stringify(project));
  project = JSON.parse(future.pop());
  selectedId = null;
  commit();
}

function loadProject(p) {
  project = p;
  project.active = Math.min(project.active || 0, project.diagrams.length - 1);
  selectedId = null;
  past = []; future = [];
  document.title = `${project.title} – Structorizer`;
  commit();
}

function newProject(title) {
  loadProject({ title: title || 'Struktogramm', active: 0, diagrams: [{ name: title || 'Hauptstruktogramm', body: [] }] });
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
  title.title = 'Doppelklick zum Umbenennen';
  title.ondblclick = () => renameDiagram(project.active);
  const seq = renderSeq(d.body);
  root.append(title, seq);
  $('#diagram').replaceChildren(root);
  layoutDecisions();
  renderProps();
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
        decisionHead(node.text, ['wahr', 'falsch']),
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
    name.title = 'Doppelklick zum Umbenennen';
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
      x.title = `"${d.name}" löschen`;
      x.setAttribute('aria-label', x.title);
      x.onclick = async () => {
        if (!await ask(`"${d.name}" löschen?`, null, 'Löschen')) return;
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
  openInfo('Hinweis', p);
}

async function renameDiagram(i) {
  const name = await ask('Name des Struktogramms', project.diagrams[i].name);
  if (!name) return;
  snapshot();
  project.diagrams[i].name = name;
  commit();
}

/* ---------------- properties panel ---------------- */

function renderProps() {
  const hit = selectedId && find(selectedId);
  $('#props').hidden = !hit;
  $('#deleteBtn').disabled = !hit;
  if (!hit) return;
  const node = hit.node;
  $('#propTitle').textContent = ELEMENTS[node.type].name;
  $('#propLabel').textContent = FIELD_LABEL[node.type];
  const text = $('#propText');
  if (document.activeElement !== text) text.value = node.text;

  const caseBox = $('#caseProps');
  if (node.type !== 'switch') { caseBox.replaceChildren(); return; }
  if (caseBox.contains(document.activeElement)) return;
  caseBox.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'case-heading';
  heading.textContent = 'Fälle (der letzte ist der Standardfall)';
  caseBox.append(heading);
  node.cases.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'case-row';
    const inp = document.createElement('input');
    inp.value = c.label;
    inp.placeholder = i === node.cases.length - 1 ? 'sonst' : `Fall ${i + 1}`;
    inp.setAttribute('aria-label', inp.placeholder);
    const snap = snapshotOnce(inp);
    inp.oninput = () => { snap(); c.label = inp.value; commit(); };
    const rm = document.createElement('button');
    rm.textContent = '−';
    rm.title = 'Fall entfernen';
    rm.disabled = node.cases.length <= 2;
    rm.onclick = async () => {
      if (c.body.length && !await ask(`Fall "${c.label}" mit ${c.body.length} Element(en) entfernen?`, null, 'Entfernen')) return;
      snapshot();
      node.cases.splice(i, 1);
      commit();
    };
    row.append(inp, rm);
    caseBox.append(row);
  });
  const add = document.createElement('button');
  add.className = 'small';
  add.textContent = '+ Fall hinzufügen';
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

const FIELD_LABEL = {
  while: 'Bedingung', dowhile: 'Bedingung', for: 'Zählbereich', if: 'Bedingung',
  switch: 'Ausdruck', instruction: 'Anweisung', call: 'Funktionsaufruf',
};

const snapText = snapshotOnce($('#propText'));
$('#propText').addEventListener('input', (e) => {
  const hit = find(selectedId);
  if (hit) { snapText(); hit.node.text = e.target.value; commit(); }
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

/** Insert a new element after the selected one (or at the end) – used without drag & drop. */
function insertNode(type) {
  snapshot();
  const node = createNode(type);
  const hit = selectedId && find(selectedId);
  if (hit) hit.list.splice(hit.index + 1, 0, node);
  else diagram().body.push(node);
  selectedId = node.id;
  commit();
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
  $('#propText').focus();
  $('#propText').select();
});
$('#canvas').addEventListener('click', (e) => { if (e.target.id === 'canvas') select(null); });
$('#deleteBtn').onclick = deleteSelected;

/* ---------------- drag & drop ---------------- */

let dragData = null;      // { type } for new elements or { id } for moves
let dropTarget = null;    // { list, index }
let indicator = null;     // element currently showing the insertion marker

document.querySelectorAll('.tool').forEach((tool) => {
  tool.addEventListener('dragstart', (e) => {
    dragData = { type: tool.dataset.type };
    e.dataTransfer.setData('text/plain', tool.dataset.type);
    e.dataTransfer.effectAllowed = 'copy';
    document.body.classList.add('dragging');
  });
  tool.addEventListener('click', () => showElementInfo(tool.dataset.type));
});

$('#diagram').addEventListener('dragstart', (e) => {
  const el = e.target.closest('.el');
  if (!el) return;
  dragData = { id: el.dataset.id };
  e.dataTransfer.setData('text/plain', el.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => el.classList.add('dragged'));
  document.body.classList.add('dragging');
});

function clearIndicator() {
  if (indicator) {
    indicator.style.boxShadow = '';
    indicator.classList.remove('empty-over');
  }
  indicator = null;
}

$('#diagram').addEventListener('dragover', (e) => {
  if (!dragData) return;
  const empty = e.target.closest('.seq.empty');
  const el = e.target.closest('.el');
  let target = null;
  let mark = null;
  let after = false;
  if (empty) {
    target = targetOf.get(empty);
    mark = empty;
  } else if (el) {
    const t = targetOf.get(el);
    const r = el.getBoundingClientRect();
    after = e.clientY > r.top + r.height / 2;
    target = { list: t.list, index: t.index + (after ? 1 : 0) };
    mark = el;
  }
  if (!target) { clearIndicator(); dropTarget = null; return; }

  // a node can't be dropped into itself
  if (dragData.id) {
    const src = find(dragData.id);
    if (src.node === (el && find(el.dataset.id)?.node) || containsList(src.node, target.list)) {
      clearIndicator(); dropTarget = null; return;
    }
  }
  e.preventDefault();
  dropTarget = target;
  if (indicator !== mark) clearIndicator();
  indicator = mark;
  if (empty) mark.classList.add('empty-over');
  else mark.style.boxShadow = after ? 'inset 0 -4px 0 var(--accent)' : 'inset 0 4px 0 var(--accent)';
});

$('#diagram').addEventListener('drop', (e) => {
  e.preventDefault();
  if (!dragData || !dropTarget) return;
  snapshot();
  let { list, index } = dropTarget;
  let node;
  if (dragData.type) {
    node = createNode(dragData.type);
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
});

function endDrag() {
  clearIndicator();
  dragData = null;
  dropTarget = null;
  document.body.classList.remove('dragging');
  document.querySelectorAll('.dragged').forEach((d) => d.classList.remove('dragged'));
}
document.addEventListener('dragend', endDrag);

/* ---------------- code export ---------------- */

const lines = (t) => (t || '').split('\n').filter((l) => l.trim());
const isDefault = (l) => /^(sonst|default|else|_)$/i.test(l.trim());

function toJava(list, ind) {
  const p = '    '.repeat(ind);
  let out = '';
  for (const n of list) {
    switch (n.type) {
      case 'instruction':
      case 'call':
        lines(n.text).forEach((l) => { out += `${p}${l.replace(/;$/, '')};\n`; });
        break;
      case 'while': out += `${p}while (${n.text}) {\n${toJava(n.body, ind + 1)}${p}}\n`; break;
      case 'for': out += `${p}for (${n.text}) {\n${toJava(n.body, ind + 1)}${p}}\n`; break;
      case 'dowhile': out += `${p}do {\n${toJava(n.body, ind + 1)}${p}} while (${n.text});\n`; break;
      case 'if':
        out += `${p}if (${n.text}) {\n${toJava(n.yes, ind + 1)}${p}}`;
        out += n.no.length ? ` else {\n${toJava(n.no, ind + 1)}${p}}\n` : '\n';
        break;
      case 'switch':
        out += `${p}switch (${n.text}) {\n`;
        n.cases.forEach((c) => {
          out += isDefault(c.label) ? `${p}    default:\n` : `${p}    case ${c.label}:\n`;
          out += toJava(c.body, ind + 2);
          if (!isDefault(c.label)) out += `${p}        break;\n`;
        });
        out += `${p}}\n`;
        break;
    }
  }
  return out;
}

function toPython(list, ind) {
  const p = '    '.repeat(ind);
  if (!list.length) return `${p}pass\n`;
  let out = '';
  for (const n of list) {
    switch (n.type) {
      case 'instruction':
      case 'call':
        lines(n.text).forEach((l) => { out += `${p}${l.replace(/;$/, '')}\n`; });
        break;
      case 'while': out += `${p}while ${n.text}:\n${toPython(n.body, ind + 1)}`; break;
      case 'for': out += `${p}for ${n.text}:\n${toPython(n.body, ind + 1)}`; break;
      case 'dowhile':
        out += `${p}while True:\n${toPython(n.body, ind + 1)}${p}    if not (${n.text}):\n${p}        break\n`;
        break;
      case 'if':
        out += `${p}if ${n.text}:\n${toPython(n.yes, ind + 1)}`;
        if (n.no.length) out += `${p}else:\n${toPython(n.no, ind + 1)}`;
        break;
      case 'switch':
        out += `${p}match ${n.text}:\n`;
        n.cases.forEach((c) => {
          out += `${p}    case ${isDefault(c.label) ? '_' : c.label}:\n${toPython(c.body, ind + 2)}`;
        });
        break;
    }
  }
  return out;
}

const ident = (s) => s.replace(/\W+/g, '_').replace(/^(\d)/, '_$1') || 'f';

function generate(lang) {
  return project.diagrams.map((d, i) => {
    const name = i === 0 ? 'main' : ident(d.name);
    return lang === 'java'
      ? `// ${d.name}\nvoid ${name}() {\n${toJava(d.body, 1)}}\n`
      : `# ${d.name}\ndef ${name}():\n${toPython(d.body, 1)}`;
  }).join('\n');
}

function showCode() {
  const body = document.createElement('div');
  const tabs = document.createElement('div');
  tabs.className = 'code-tabs';
  const pre = document.createElement('pre');
  const langs = { java: 'Java / C', python: 'Python' };
  const show = (lang) => {
    pre.textContent = generate(lang);
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  };
  Object.entries(langs).forEach(([k, v]) => {
    const b = document.createElement('button');
    b.textContent = v;
    b.dataset.lang = k;
    b.onclick = () => show(k);
    tabs.append(b);
  });
  const copy = document.createElement('button');
  copy.textContent = 'Kopieren';
  copy.onclick = () => navigator.clipboard?.writeText(pre.textContent).then(() => { copy.textContent = 'Kopiert ✓'; });
  tabs.append(copy);
  body.append(tabs, pre);
  show('java');
  openInfo('Code exportieren', body);
}

/* ---------------- files & image ---------------- */

function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function saveFile() {
  const data = JSON.stringify({ app: 'structorizer', version: 2, project }, null, 2);
  download(new Blob([data], { type: 'application/json' }), `${project.title}.struct`);
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
  } catch (err) {
    message('Diese Datei konnte nicht gelesen werden.');
  }
});

async function exportImage() {
  if (!window.html2canvas) { message('Bildexport konnte nicht geladen werden.'); return; }
  const prev = selectedId;
  selectedId = null;
  render();
  $('#diagram').classList.add('export');
  try {
    const canvas = await html2canvas($('#diagram'), { backgroundColor: '#fff', scale: 2 });
    canvas.toBlob((b) => download(b, `${diagram().name}.png`));
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
  const t = ELEMENTS[type];
  const div = document.createElement('div');
  div.innerHTML = `<p><b></b></p><p></p><div>Code Beispiel:</div><pre></pre>
    <p class="hint">Tipp: Element in das Struktogramm ziehen – oder hier einfügen
    (nach dem ausgewählten Element, sonst am Ende).</p>
    <button class="insert-btn">Einfügen</button>`;
  div.querySelector('b').textContent = t.name + ':';
  div.querySelectorAll('p')[1].textContent = t.info;
  div.querySelector('pre').textContent = t.example;
  div.querySelector('.insert-btn').onclick = () => { $('#infoDialog').close(); insertNode(type); };
  openInfo('Information', div);
}

function showHelp() {
  const div = document.createElement('div');
  div.innerHTML = `
    <p><b>Structorizer v2</b> – Struktogramme (Nassi-Shneiderman-Diagramme) im Browser erstellen.</p>
    <ul>
      <li>Elemente aus der linken Leiste in das Struktogramm <b>ziehen</b>.</li>
      <li>Element anklicken zum Auswählen, <b>Doppelklick</b> zum Bearbeiten des Textes.</li>
      <li>Bestehende Elemente können per Drag &amp; Drop verschoben werden.</li>
      <li><kbd>Entf</kbd> löscht das ausgewählte Element, <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> für Rückgängig / Wiederholen.</li>
      <li>Mit <b>+</b> in der Tableiste weitere Struktogramme (Funktionen) anlegen.</li>
      <li>Das Projekt wird automatisch im Browser gespeichert. Über <i>Datei → Download</i> kann es als Datei gesichert werden.</li>
    </ul>
    <p><a href="https://janishuser.github.io/Structorizer/legacy/struct.html" target="_blank" rel="noopener">Alte Version öffnen</a></p>`;
  openInfo('Info', div);
}

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
$('#createBtn').onclick = () => { $('#startDialog').close(); newProject($('#newTitle').value.trim()); };
$('#openBtn').onclick = () => $('#fileInput').click();
$('#lastBtn').onclick = () => {
  try {
    loadProject(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    $('#startDialog').close();
  } catch (e) { message('Das letzte Projekt konnte nicht geladen werden.'); }
};
$('#startDialog').addEventListener('close', () => { if (!project) newProject('Hauptstruktogramm'); });

/* ---------------- menus, tabs & shortcuts ---------------- */

const actions = {
  new: showStart,
  open: () => $('#fileInput').click(),
  save: saveFile,
  code: showCode,
  image: exportImage,
  undo, redo,
  delete: deleteSelected,
  info: showHelp,
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
document.querySelectorAll('[data-action]').forEach((b) => { b.onclick = () => actions[b.dataset.action](); });

$('#addTab').onclick = async () => {
  const name = await ask('Name der Funktion', `Funktion ${project.diagrams.length}`);
  if (!name) return;
  snapshot();
  project.diagrams.push({ name, body: [] });
  project.active = project.diagrams.length - 1;
  selectedId = null;
  commit();
};

$('#collapseBtn').onclick = () => document.body.classList.toggle('collapsed');

document.addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  const dialogOpen = document.querySelector('dialog[open]');
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); if (project) saveFile(); return; }
  if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); $('#fileInput').click(); return; }
  if (typing || dialogOpen || !project) return;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
  else if (e.key === 'Escape') select(null);
});

/* ---------------- boot ---------------- */
showStart();
