'use strict';

/* =========================================================
   Learning: examples and exercises from a library (library.js),
   graded with grader.js.
   - Examples… lists the library's examples; opening one loads it as a project.
   - Learning… lists all entries by chapter with the progress made.
   - An exercise is a project with project.task set; the task panel shows
     the description and grades the project with "Check".
   Uses globals from app.js: project, runner, loadProject, ask, openInfo, message, track, uid, $.
   ========================================================= */

const PROGRESS_KEY = 'structorizer-learning';
const params = new URLSearchParams(location.search);
const libraryCache = new Map(); // url + language → Promise of the library
let taskPanelClosed = false; // closed by the user for this exercise (the Exercise button opens it again)
let lastResult = null; // { key, result } of the last check

/* ---------------- loading ---------------- */

function defaultLibraryUrl() {
  return new URL(params.get('library') || DEFAULT_LIBRARY, location.href).href;
}

function getLibrary(url = defaultLibraryUrl()) {
  const key = `${url} ${lang}`;
  if (!libraryCache.has(key)) {
    const p = loadLibrary(url, { lang });
    libraryCache.set(key, p);
    p.then(warmLibrary, () => libraryCache.delete(key)); // a failed load is tried again next time
  }
  return libraryCache.get(key);
}

/** Fetch every file of the library once, so the service worker has it for offline use. */
function warmLibrary(lib) {
  if (!navigator.serviceWorker?.controller) return;
  for (const e of lib.entries.values()) {
    const files = e.kind === 'exercise' ? ['tests.json', 'starter.struct', 'solution.struct'] : ['diagram.struct'];
    files.forEach((f) => lib.file(e, f).catch(() => {}));
  }
}

/** The library, or null after telling the user why it could not be loaded. */
async function libraryOrMessage(url) {
  try {
    return await getLibrary(url);
  } catch (e) {
    message(e.newer ? tr('learn.newer') : tr('learn.loadFailed', { error: e.message }));
    return null;
  }
}

/* ---------------- progress (this browser only) ---------------- */

function readProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch (e) { return {}; }
}

function saveProgress(key, result) {
  const all = readProgress();
  const old = all[key] || {};
  all[key] = {
    best: Math.max(old.best || 0, result.score), max: result.max,
    passed: !!old.passed || result.passed, at: Date.now(),
  };
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
}

/* ---------------- opening entries ---------------- */

/** New element ids (the files may share them) and no left-over run or task state. */
function freshProject(p, title) {
  const renew = (list) => list.forEach((n) => { n.id = uid(); childLists(n).forEach(renew); });
  p.diagrams.forEach((d) => renew(d.body));
  p.title = title;
  p.auto = false;
  p.active = 0;
  if (p.diagrams[0]) { p.diagrams[0].name = title; p.diagrams[0].auto = false; }
  delete p.task;
  return p;
}

/** The browser keeps only one project: ask before replacing one that has content. */
async function mayReplace(text = tr('samples.replace', { title: project?.title })) {
  const hasContent = project && project.diagrams.some((d) => d.body.length);
  if (hasContent && !await ask(text, null, tr('samples.open'))) return false;
  if (runner) closeRun();
  return true;
}

function closeDialogs() {
  if ($('#infoDialog').open) $('#infoDialog').close();
  if ($('#startDialog').open) $('#startDialog').close();
}

async function openEntry(lib, entry) {
  if (entry.kind === 'exercise') return openExercise(lib, entry);
  closeDialogs();
  if (!await mayReplace()) { if (!project) showStart(); return; }
  try {
    const p = await loadEntryProject(lib, entry, 'diagram.struct');
    if (!p) throw new Error('diagram.struct');
    loadProject(freshProject(p, entry.title));
    track('sample_open', { sample: entry.path });
  } catch (e) {
    message(tr('learn.loadFailed', { error: e.message }));
  }
}

async function openExercise(lib, entry) {
  closeDialogs();
  if (project?.task?.key === entry.key) { // already working on it: carry on
    taskPanelClosed = false;
    renderTaskPanel();
    return;
  }
  if (!await mayReplace()) { if (!project) showStart(); return; }
  try {
    const starter = await loadEntryProject(lib, entry, 'starter.struct');
    const p = freshProject(starter || { diagrams: [{ name: '', body: [] }] }, entry.title);
    p.task = { library: lib.url, entry: entry.path, key: entry.key };
    taskPanelClosed = false;
    lastResult = null;
    loadProject(p);
    track('learn_open', { entry: entry.key });
  } catch (e) {
    message(tr('learn.loadFailed', { error: e.message }));
  }
}

/* ---------------- dialogs ---------------- */

function entryButton(lib, entry, progress) {
  const b = document.createElement('button');
  b.className = `sample ${entry.kind}`;
  const head = document.createElement('div');
  head.className = 'entry-head';
  const kind = document.createElement('span');
  kind.className = `kind ${entry.kind}`;
  kind.textContent = tr(`learn.${entry.kind}`);
  head.append(kind);
  const p = progress[entry.key];
  if (entry.kind === 'exercise' && p) {
    const status = document.createElement('span');
    status.className = `status${p.passed ? ' passed' : ''}`;
    status.textContent = p.passed ? `✓ ${tr('learn.done')}` : tr('task.points', { score: p.best, max: p.max });
    head.append(status);
  }
  const title = document.createElement('b');
  title.textContent = entry.title;
  const info = document.createElement('span');
  info.textContent = entry.summary;
  b.append(head, title, info);
  b.disabled = !!entry.broken;
  b.onclick = () => openEntry(lib, entry);
  return b;
}

/** Placeholder while the library loads (usually from the cache, so this is short). */
function loadingDialog(title) {
  const p = document.createElement('p');
  p.className = 'hint';
  p.textContent = tr('learn.loading');
  closeDialogs();
  openInfo(title, p);
}

/** Examples…: the library's examples. */
async function showSamples() {
  loadingDialog(tr('samples.title'));
  const lib = await libraryOrMessage();
  if (!lib || !$('#infoDialog').open) return;
  const list = document.createElement('div');
  list.className = 'sample-list';
  lib.chapters.forEach((c) => c.entries.filter((e) => e.kind === 'example').forEach((e) => list.append(entryButton(lib, e, {}))));
  list.querySelectorAll('.kind').forEach((k) => k.remove());
  list.querySelectorAll('.entry-head:empty').forEach((h) => h.remove());
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = tr('samples.hint');
  const div = document.createElement('div');
  div.append(list, hint);
  openInfo(tr('samples.title'), div);
}

/** Learning…: all chapters with examples and exercises. */
async function showLearning() {
  loadingDialog(tr('learn.title'));
  const lib = await libraryOrMessage();
  if (!lib || !$('#infoDialog').open) return;
  const progress = readProgress();
  const div = document.createElement('div');
  div.className = 'learn';
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = tr('learn.hint');
  div.append(hint);
  lib.chapters.forEach((c) => {
    if (!c.entries.length) return;
    const h = document.createElement('h3');
    h.textContent = c.title;
    const list = document.createElement('div');
    list.className = 'sample-list';
    c.entries.forEach((e) => list.append(entryButton(lib, e, progress)));
    div.append(h, list);
  });
  openInfo(`${tr('learn.title')} – ${lib.title}`, div);
}

/* ---------------- task panel ---------------- */

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

const typeName = (type) => (type === 'loop' ? tr('learn.type.loop') : tr(`el.${type}.name`));

function ruleText(b) {
  return tr(`rule.${b.rule}`, { type: typeName(b.value), value: b.value });
}

/** Requirements of tests.json as rules (for the description). */
function rulesOf(structure) {
  const rules = [];
  for (const v of structure.requires || []) rules.push({ rule: 'requires', value: v });
  for (const v of structure.forbids || []) rules.push({ rule: 'forbids', value: v });
  for (const k of ['maxDepth', 'maxElements', 'maxCyclomatic']) if (structure[k] != null) rules.push({ rule: k, value: structure[k] });
  for (const v of structure.functions || []) rules.push({ rule: 'functions', value: v });
  return rules;
}

const showValue = (v) => (typeof v === 'string' ? v : show(v, true));

/** "Input 3, 7, 5 → 7" or "maximum(3, 5) → 5" */
function testLine(t) {
  const li = el('li');
  const code = el('code', null, t.call ? t.call : (t.input?.length ? t.input.join(', ') : tr('task.noInput')));
  if (!t.call) li.append(`${tr('task.input')}: `);
  li.append(code, ' → ');
  li.append(el('code', null, 'returns' in t ? show(t.returns, true) : String(t.output)));
  return li;
}

function renderDescription(entry, tests) {
  const box = $('#taskBody');
  box.replaceChildren();
  const text = el('div', 'task-text');
  text.innerHTML = markdown(entry.body);
  box.append(text);
  const visible = (tests.tests || []).filter((t) => !t.hidden);
  const hidden = (tests.tests || []).length - visible.length;
  if (visible.length || hidden) {
    box.append(el('h3', null, tr('task.tests')));
    const ul = el('ul', 'task-tests');
    visible.forEach((t) => ul.append(testLine(t)));
    if (hidden) ul.append(el('li', 'muted', tr('task.hiddenCount', { n: hidden })));
    box.append(ul);
  }
  const rules = [];
  if (tests.complexity) rules.push(tr('task.complexity', { max: tests.complexity.max }));
  if (tests.structure) rulesOf(tests.structure).forEach((r) => rules.push(ruleText(r)));
  if (rules.length) {
    box.append(el('h3', null, tr('task.rules')));
    const ul = el('ul', 'task-rules');
    rules.forEach((r) => ul.append(el('li', null, r)));
    box.append(ul);
  }
}

function category(name, cat, details) {
  const row = el('div', `task-cat ${cat.passed ? 'ok' : 'fail'}`);
  const head = el('div', 'cat-head');
  head.append(el('span', 'mark', cat.passed ? '✓' : '✗'), el('b', null, tr(`task.cat.${name}`)), el('span', 'pts', `${cat.points} / ${cat.max}`));
  row.append(head, ...details);
  return row;
}

function renderResult(result) {
  const box = $('#taskResult');
  box.replaceChildren();
  if (!result) return;
  const summary = el('div', `task-summary ${result.passed ? 'ok' : 'fail'}`);
  summary.append(el('b', null, result.passed ? tr('task.passed') : tr('task.notYet')), el('span', null, tr('task.points', { score: result.score, max: result.max })));
  box.append(summary);

  if (result.tests) {
    const t = result.tests;
    const d = [el('p', null, tr('task.testsPassed', { ok: t.ok, total: t.total }))];
    t.visible.filter((x) => !x.passed).forEach((x) => {
      const f = el('div', 'task-fail');
      f.append(el('div', null, x.call ? x.call : `${tr('task.input')}: ${x.input?.length ? x.input.join(', ') : tr('task.noInput')}`));
      if (x.error) f.append(el('div', 'err', x.error));
      else {
        f.append(el('div', 'cmp', `${tr('task.expected')}:`), el('pre', null, showValue(x.expected)));
        f.append(el('div', 'cmp', `${tr('task.got')}:`), el('pre', null, x.expects === 'returns' ? show(x.actual, true) : (x.actual || '–')));
      }
      d.push(f);
    });
    if (t.hidden.total) d.push(el('p', 'muted', tr('task.hiddenPassed', t.hidden)));
    box.append(category('tests', t, d));
  }
  if (result.complexity) {
    const c = result.complexity;
    const d = [];
    if (c.error) d.push(el('p', 'err', tr('task.complexityError', { n: c.size, error: c.error })));
    else {
      d.push(el('p', null, tr('task.measured', { measured: c.measured, max: c.target })));
      d.push(el('p', 'muted', tr('task.steps', { sizes: c.sizes.join(' / '), steps: c.steps.join(' / ') })));
    }
    box.append(category('complexity', c, d));
  }
  if (result.structure) {
    const s = result.structure;
    const d = s.passed ? [el('p', null, tr('task.structureOk'))] : s.broken.map((b) => el('p', null, ruleText(b) + (b.actual != null ? ` (${tr('task.yours', { actual: b.actual })})` : '')));
    box.append(category('structure', s, d));
  }
}

/** Show or hide the task panel for the current project (after loading a project or changing the language). */
async function renderTaskPanel() {
  const task = project?.task;
  $('#taskBtn').hidden = !task;
  const panel = $('#taskPanel');
  if (!task) { panel.hidden = true; return; }
  panel.hidden = taskPanelClosed;
  $('#taskBtn').classList.toggle('active', !taskPanelClosed);
  $('#taskCheck').disabled = true;
  $('#taskSolution').hidden = true;
  let lib;
  let entry;
  let tests;
  try {
    lib = await getLibrary(task.library);
    entry = lib.entries.get(task.entry);
    if (entry) tests = await loadEntryTests(lib, entry);
  } catch (e) {
    $('#taskTitle').textContent = tr('task.button');
    $('#taskBody').replaceChildren(el('p', 'err', e.newer ? tr('learn.newer') : tr('learn.loadFailed', { error: e.message })));
    return;
  }
  if (project?.task?.key !== task.key) return; // another project was loaded meanwhile
  if (!entry || !tests) {
    $('#taskTitle').textContent = tr('task.button');
    $('#taskBody').replaceChildren(el('p', 'err', tr('learn.notFound')));
    return;
  }
  $('#taskTitle').textContent = entry.title;
  renderDescription(entry, tests);
  renderResult(lastResult?.key === task.key ? lastResult.result : null);
  $('#taskCheck').disabled = false;
  $('#taskCheck').onclick = () => checkTask(lib, entry, tests);
  $('#taskSolution').hidden = !readProgress()[task.key]?.passed;
  $('#taskSolution').onclick = () => openSolution(lib, entry);
}

async function checkTask(lib, entry, tests) {
  if (runner && !runner.done) stopRun();
  const btn = $('#taskCheck');
  btn.disabled = true;
  btn.textContent = tr('task.checking');
  const task = project.task;
  try {
    const result = await grade(JSON.parse(JSON.stringify(project)), tests); // a copy: editing goes on meanwhile
    if (project?.task?.key !== task.key) return;
    lastResult = { key: task.key, result };
    saveProgress(task.key, result);
    renderResult(result);
    $('#taskSolution').hidden = !readProgress()[task.key]?.passed;
    track('learn_check', { entry: task.key, passed: result.passed });
  } finally {
    btn.disabled = false;
    btn.textContent = tr('task.check');
  }
}

async function openSolution(lib, entry) {
  if (!await mayReplace(tr('task.solutionReplace', { title: project.title }))) return;
  try {
    const p = await loadEntryProject(lib, entry, 'solution.struct');
    if (!p) throw new Error('solution.struct');
    loadProject(freshProject(p, tr('task.solutionTitle', { title: entry.title })));
    track('learn_solution', { entry: entry.key });
  } catch (e) {
    message(tr('learn.loadFailed', { error: e.message }));
  }
}

$('#taskClose').onclick = () => { taskPanelClosed = true; renderTaskPanel(); };
$('#taskBtn').onclick = () => { taskPanelClosed = !taskPanelClosed; renderTaskPanel(); };
$('#learnBtn').onclick = () => showLearning();
renderTaskPanel();

/* ---------------- links: ?open=<entry path> (and ?library=<repository.json>) ---------------- */

async function openFromLink() {
  const path = params.get('open');
  if (!path) return;
  const lib = await libraryOrMessage();
  const url = new URL(location.href);
  url.searchParams.delete('open');
  history.replaceState(null, '', url);
  const entry = lib?.entries.get(path);
  if (entry) openEntry(lib, entry);
  else if (lib) message(tr('learn.notFound'));
}
if (params.get('open')) {
  // after the cookie question, if it is shown
  if ($('#consentDialog').open) $('#consentDialog').addEventListener('close', openFromLink, { once: true });
  else openFromLink();
}
