'use strict';

/* =========================================================
   Run: step through a diagram and watch variables and output.

   Element texts are read as simple Java / C / Python / JavaScript,
   rewritten to JavaScript and evaluated with the program's variables
   as scope. All diagrams share one set of variables; a function call
   (call element) runs the diagram with that name and can pass values
   to its parameters, e.g. a diagram named "max(a, b)".
   Uses globals from app.js: project, runner, find, render, select, tr, ...
   ========================================================= */

const AsyncFunction = (async () => {}).constructor;
const MAX_STEPS = 100000;
const SPEEDS = [1200, 600, 250, 60, 0]; // ms between steps, slow → instant
const PLACEHOLDER_TYPES = new Set(['while', 'dowhile', 'if', 'switch', 'instruction', 'call']);

/** break / continue / return / exit travelling up to whoever handles it */
class Jump {
  constructor(kind, value) { this.kind = kind; this.value = value; }
}
class RunError extends Error {
  constructor(message, node) { super(message); this.node = node; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- text → JavaScript ---------------- */

const TYPES = 'int|long|short|byte|double|float|boolean|bool|char|String|string|var|let|const|final|auto|Integer|Double|Scanner';

/** Apply fn to the parts of code that are not inside string literals. */
function outsideStrings(code, fn) {
  return code.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/).map((part, i) => (i % 2 ? part : fn(part))).join('');
}

function toJs(code) {
  return outsideStrings(code.trim().replace(/;\s*$/, ''), (t) => t
    // declarations: "int a = 1" → "a = 1"
    .replace(new RegExp(`\\b(?:${TYPES})(?:\\s*\\[\\s*\\])?\\s+(?=[A-Za-z_]\\w*\\s*(?:=|;|,|$))`, 'g'), '')
    .replace(/:=|←/g, '=')
    .replace(/≠|<>/g, '!=').replace(/≤/g, '<=').replace(/≥/g, '>=')
    .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
    .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null')
    .replace(/\bmod\b/g, '%')
    // input waits for the user
    .replace(/\b(?:[A-Za-z_]\w*\.)*(?:nextLine|readLine|next)\s*\(/g, 'await inputText(')
    .replace(/\b(?:[A-Za-z_]\w*\.)*(?:nextInt|nextDouble|nextFloat|nextLong)\s*\(/g, 'await inputNumber(')
    .replace(/\b(input|eingabe|lire|leggi)\s*\(/gi, 'await $1('));
}

/** "%d / %s / %.2f" formatting for printf / String.format */
function format(f, args) {
  let i = 0;
  return String(f).replace(/%(-?\d*)(?:\.(\d+))?([dfsn%])/g, (m, w, prec, type) => {
    if (type === '%') return '%';
    if (type === 'n') return '\n';
    const v = args[i++];
    let s = type === 'f' ? Number(v).toFixed(prec ?? 6) : type === 'd' ? String(Math.trunc(v)) : show(v);
    const width = Math.abs(Number(w) || 0);
    if (s.length < width) s = w.startsWith('-') ? s.padEnd(width) : s.padStart(width);
    return s;
  });
}

/** Value as shown in output and the variable table. */
function show(v, quoted = false) {
  if (typeof v === 'string') return quoted ? JSON.stringify(v) : v;
  if (v === undefined) return '–';
  if (Array.isArray(v)) return `[${v.map((x) => show(x, true)).join(', ')}]`;
  if (v && typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { return String(v); } }
  return String(v);
}

/** Text typed by the user: numbers become numbers (for input()). */
const autoNumber = (s) => (s.trim() !== '' && Number.isFinite(Number(s)) ? Number(s) : s);

function makeScope(vars) {
  const println = (...a) => print(a.map((x) => show(x)).join(' ') + '\n');
  const out = {
    println,
    print: (...a) => print(a.map((x) => show(x)).join(' ')),
    printf: (f, ...a) => print(format(f, a)),
  };
  const ask = async (p, kind) => {
    const v = (await askInput(p)) ?? '';
    if (kind === 'number') {
      if (!Number.isFinite(Number(v)) || v.trim() === '') throw new RunError(tr('run.notNumber', { value: v }));
      return Number(v);
    }
    return kind === 'text' ? v : autoNumber(v);
  };
  const input = (p) => ask(p, 'auto');
  const builtins = {
    Math, Number, Boolean, Array, JSON, Object, parseInt, parseFloat, isNaN, isFinite,
    undefined, NaN, Infinity,
    String: Object.assign((x) => String(x), { valueOf: (x) => String(x), format: (f, ...a) => format(f, a) }),
    Integer: { parseInt: (s) => parseInt(s, 10), MAX_VALUE: 2147483647, MIN_VALUE: -2147483648 },
    Double: { parseDouble: parseFloat },
    System: { out, in: {}, exit: () => { throw new Jump('exit'); } },
    Scanner: class {},
    console: { log: println },
    print: println, println, printf: out.printf, ausgabe: println, output: println, write: out.print, writeln: println,
    input, eingabe: input, lire: input, leggi: input,
    inputText: (p) => ask(p, 'text'), inputNumber: (p) => ask(p, 'number'),
    len: (x) => x.length, str: (x) => show(x), int: (x) => Math.trunc(Number(x)), float: Number,
    abs: Math.abs, round: Math.round, min: Math.min, max: Math.max, sqrt: Math.sqrt, pow: Math.pow, random: Math.random,
    range: (a, b, s = 1) => {
      if (b === undefined) { b = a; a = 0; }
      const r = [];
      for (let i = a; s > 0 ? i < b : i > b; i += s) r.push(i);
      return r;
    },
  };
  return new Proxy(vars, {
    has: (t, k) => typeof k === 'string', // every name is looked up here, never on window
    get: (t, k) => {
      if (typeof k !== 'string') return undefined;
      if (Object.hasOwn(t, k)) return t[k];
      if (Object.hasOwn(builtins, k)) return builtins[k];
      throw new RunError(tr('run.undefinedVar', { name: k }));
    },
    set: (t, k, v) => { t[k] = v; return true; },
  });
}

/* ---------------- evaluation ---------------- */

const compiled = new Map();

function compile(src, node) {
  let fn = compiled.get(src);
  if (!fn) {
    try {
      fn = new AsyncFunction('__s', `with (__s) { ${src} }`);
    } catch (e) {
      throw new RunError(tr('run.syntax', { text: node.text.trim() }), node);
    }
    compiled.set(src, fn);
  }
  return fn;
}

async function callCompiled(fn, node) {
  try {
    return await fn(runner.scope);
  } catch (e) {
    if (e instanceof Jump) throw e;
    if (e instanceof RunError) { e.node ??= node; throw e; }
    throw new RunError(e.message, node);
  }
}

/** Run statements (one per line). */
function execText(text, node) {
  return callCompiled(compile(lines(text).map(toJs).join(';\n'), node), node);
}

/** Value of an expression (condition, switch value, …). */
function evalText(text, node) {
  return callCompiled(compile(`return (${toJs(text)});`, node), node);
}

/* ---------------- execution (async generators) ----------------
   Each element is yielded just before it runs; the runner shows it and
   waits for the next step. Loops yield again before every new check. */

async function* execList(list) {
  for (const n of list) yield* execNode(n);
}

/** Loop body: returns 'break' when the loop should end. */
async function* loopBody(list) {
  try {
    yield* execList(list);
  } catch (e) {
    if (e instanceof Jump && e.kind === 'break') return 'break';
    if (e instanceof Jump && e.kind === 'continue') return 'continue';
    throw e;
  }
  return null;
}

async function* execNode(n) {
  if (n.auto && PLACEHOLDER_TYPES.has(n.type)) {
    yield n;
    throw new RunError(tr('run.placeholder'), n);
  }
  switch (n.type) {
    case 'instruction':
      yield n;
      await execText(n.text, n);
      break;
    case 'call':
      yield n;
      yield* callNode(n);
      break;
    case 'jump':
      yield n;
      await jump(n);
      break;
    case 'while':
      for (;;) {
        yield n;
        if (!await evalText(n.text, n)) break;
        if ((yield* loopBody(n.body)) === 'break') break;
      }
      break;
    case 'dowhile':
      for (;;) {
        if ((yield* loopBody(n.body)) === 'break') break;
        yield n;
        if (!await evalText(n.text, n)) break;
      }
      break;
    case 'for':
      yield* forLoop(n);
      break;
    case 'if':
      yield n;
      yield* execList(await evalText(n.text, n) ? n.yes : n.no);
      break;
    case 'switch': {
      yield n;
      const v = await evalText(n.text, n);
      yield* execList(await pickCase(n, v));
      break;
    }
    case 'parallel':
      yield n;
      yield* parallel(n);
      break;
  }
}

async function* forLoop(n) {
  yield n;
  const f = parseFor(n.text);
  if (!f) throw new RunError(tr('run.badFor'), n);
  const vars = runner.vars;
  if (f.kind === 'c') {
    if (f.init) await execText(f.init, n);
    for (;;) {
      if (f.cond && !await evalText(f.cond, n)) break;
      if ((yield* loopBody(n.body)) === 'break') break;
      yield n;
      if (f.update) await execText(f.update, n);
    }
  } else if (f.kind === 'range') {
    const to = Number(await evalText(f.to, n));
    const step = Number(await evalText(f.step, n));
    if (!step) throw new RunError(tr('run.badFor'), n);
    vars[f.v] = Number(await evalText(f.from, n));
    while (step > 0 ? vars[f.v] <= to : vars[f.v] >= to) {
      if ((yield* loopBody(n.body)) === 'break') break;
      yield n;
      vars[f.v] += step;
    }
  } else {
    const items = await evalText(f.iter, n);
    if (items == null || typeof items[Symbol.iterator] !== 'function') throw new RunError(tr('run.badFor'), n);
    for (const x of [...items]) {
      vars[f.v] = x;
      if ((yield* loopBody(n.body)) === 'break') break;
      yield n;
    }
  }
}

/** Case whose label (or one of its comma-separated labels) equals the value, else the default case. */
async function pickCase(n, v) {
  for (const c of n.cases) {
    if (isDefault(c)) continue;
    for (const part of c.label.split(',')) {
      let x;
      try { x = await evalText(part, n); } catch (e) { x = part.trim(); } // plain words: compare as text
      // eslint-disable-next-line eqeqeq
      if (x == v) return c.body;
    }
  }
  return n.cases.find(isDefault)?.body || [];
}

/** Threads take turns, one element each, so their steps interleave. */
async function* parallel(n) {
  let gens = n.threads.map((t) => execList(t));
  while (gens.length) {
    for (const g of [...gens]) {
      const r = await g.next();
      if (r.done) gens = gens.filter((x) => x !== g);
      else yield r.value;
    }
  }
}

async function jump(n) {
  const t = n.text.trim().replace(/;$/, '');
  const m = /^(break|continue|return|exit|quit|halt)\b\s*(.*)$/i.exec(t);
  const kind = m ? m[1].toLowerCase() : /System\.exit/.test(t) ? 'exit' : 'return';
  if (kind === 'break' || kind === 'continue') throw new Jump(kind);
  if (kind === 'return') throw new Jump('return', m && m[2] ? await evalText(m[2], n) : undefined);
  throw new Jump('exit');
}

/** Name and parameters of a diagram called like a function, e.g. "max(a, b)". */
function signature(d) {
  const m = /^\s*([A-Za-z_]\w*)\s*\((.*)\)\s*$/.exec(d.name);
  return m
    ? { name: m[1], params: m[2].split(',').map((p) => p.trim().split(/\s+/).pop()).filter(Boolean) }
    : { name: ident(d.name), params: [] };
}

/** Split call arguments at top-level commas. */
function splitArgs(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of outsideStrings(s, (t) => t.replace(/,/g, '\u0000'))) {
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if (ch === '\u0000' && depth === 0) { out.push(cur); cur = ''; } else cur += ch === '\u0000' ? ',' : ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

async function* callNode(n) {
  const m = /^\s*(?:(?:[A-Za-z_]\w*\s+)?([A-Za-z_]\w*)\s*=\s*)?([A-Za-z_]\w*)\s*\((.*)\)\s*;?\s*$/.exec(n.text);
  const idx = m ? project.diagrams.findIndex((d, i) => i > 0 && signature(d).name === m[2]) : -1;
  if (idx < 0) { await execText(n.text, n); return; } // not one of our diagrams: plain code
  if (runner.depth > 200) throw new RunError(tr('run.tooDeep'), n);
  const { params } = signature(project.diagrams[idx]);
  const args = splitArgs(m[3]);
  const values = [];
  for (const a of args) values.push(await evalText(a, n));
  params.forEach((p, i) => { runner.vars[p] = values[i]; });
  runner.depth++;
  let value;
  try {
    yield* execList(project.diagrams[idx].body);
  } catch (e) {
    if (e instanceof Jump && e.kind === 'return') value = e.value;
    else throw e;
  } finally {
    runner.depth--;
  }
  if (m[1]) runner.vars[m[1]] = value;
}

async function* program(list) {
  try {
    yield* execList(list);
  } catch (e) {
    if (!(e instanceof Jump)) throw e; // return / exit / stray break end the program
  }
}

/* ---------------- runner ---------------- */

/** Input during a run uses the app's question dialog. */
function askInput(promptText) {
  return ask(promptText ? show(promptText) : tr('run.input'), '');
}

function print(text) {
  if (!runner) return;
  runner.out += text;
  const o = $('#runOutput');
  o.textContent = runner.out;
  o.scrollTop = o.scrollHeight;
}

function startRun() {
  stopRun();
  const home = project.active;
  const owner = new Map(); // element id → diagram index
  project.diagrams.forEach((d, i) => {
    const walk = (l) => l.forEach((n) => { owner.set(n.id, i); childLists(n).forEach(walk); });
    walk(d.body);
  });
  const vars = {};
  runner = {
    home, owner, vars, scope: makeScope(vars), gen: null, steps: 0, depth: 0,
    playing: false, busy: false, done: false, current: null, error: null, out: '', prev: {},
  };
  runner.gen = program(project.diagrams[home].body);
  select(null);
  document.body.classList.add('running');
  $('#runPanel').hidden = false;
  $('#runOutput').textContent = '';
  track('run_start');
  step();
}

/** Run one element. quiet: don't redraw (used when running at full speed). */
async function step(quiet = false) {
  const R = runner;
  if (!R || R.done || R.busy) return;
  R.busy = true;
  try {
    if (++R.steps > MAX_STEPS) throw new RunError(tr('run.tooMany', { n: MAX_STEPS }), R.current);
    const r = await R.gen.next();
    if (runner !== R) return; // stopped while waiting for input
    if (r.done) finishRun();
    else {
      R.current = r.value;
      if (!quiet) showStep();
    }
  } catch (e) {
    if (runner === R) failRun(e);
  } finally {
    R.busy = false;
  }
  if (!quiet && runner === R) renderRunState();
}

async function play() {
  const R = runner;
  if (!R || R.done) return;
  R.playing = !R.playing;
  renderRunState();
  while (runner === R && R.playing && !R.done) {
    const delay = SPEEDS[Number($('#runSpeed').value)];
    if (delay) {
      await step();
      await sleep(delay);
    } else {
      const until = performance.now() + 30;
      while (runner === R && R.playing && !R.done && !R.busy && performance.now() < until) await step(true);
      if (runner === R && !R.done) { showStep(); renderRunState(); }
      await sleep(0);
      while (runner === R && R.busy) await sleep(30); // waiting for input
    }
  }
}

function pause() {
  if (runner) runner.playing = false;
}

function finishRun() {
  runner.done = true;
  runner.playing = false;
  runner.current = null;
  document.body.classList.remove('running');
  backHome();
  renderRunState();
}

function failRun(e) {
  runner.done = true;
  runner.playing = false;
  runner.error = e instanceof RunError ? e.message : String(e?.message || e);
  runner.current = e?.node || runner.current;
  document.body.classList.remove('running');
  showStep();
  renderRunState();
  track('run_error');
}

function backHome() {
  if (project.active !== runner.home) {
    project.active = runner.home;
    render();
  } else highlightRun();
}

/** Stop the run (editing, Esc, close). Variables and output stay visible until the next run. */
function stopRun() {
  if (!runner) return;
  const R = runner;
  R.playing = false;
  R.gen?.return().catch(() => {});
  if (!R.done) {
    R.done = true;
    R.current = null;
    document.body.classList.remove('running');
    backHome();
  }
  runner = null;
  highlightRun();
}

function closeRun() {
  stopRun();
  $('#runPanel').hidden = true;
}

/** Show the current element: switch to its diagram, mark it and keep it in view. */
function showStep() {
  const node = runner?.current;
  if (node) {
    const idx = runner.owner.get(node.id);
    if (idx !== undefined && idx !== project.active) {
      project.active = idx;
      render(); // calls highlightRun
    } else highlightRun();
  } else highlightRun();
  renderVars();
}

/** Mark the running element (also called after every render). */
function highlightRun() {
  document.querySelectorAll('#diagram .run-current, #diagram .run-error')
    .forEach((e) => e.classList.remove('run-current', 'run-error'));
  const node = runner?.current;
  if (!node) return;
  const el = document.querySelector(`#diagram .el[data-id="${node.id}"]`);
  const part = el?.querySelector(':scope > .label, :scope > .head, :scope > .par') || el;
  if (!part) return;
  part.classList.add(runner.error ? 'run-error' : 'run-current');
  part.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function renderVars() {
  if (!runner) return;
  const table = $('#runVars');
  const names = Object.keys(runner.vars);
  table.replaceChildren();
  if (!names.length) {
    const empty = document.createElement('caption');
    empty.textContent = tr('run.noVars');
    table.append(empty);
  }
  names.forEach((k) => {
    const v = show(runner.vars[k], true);
    const tr_ = table.insertRow();
    if (runner.prev[k] !== v) tr_.className = 'changed';
    tr_.insertCell().textContent = k;
    tr_.insertCell().textContent = v;
  });
  runner.prev = Object.fromEntries(names.map((k) => [k, show(runner.vars[k], true)]));
}

function renderRunState() {
  const R = runner;
  const active = R && !R.done;
  $('#runStep').disabled = !active;
  $('#runPlay').disabled = !active;
  $('#runPlay').querySelector('span').textContent = tr(R?.playing ? 'run.pause' : 'run.play');
  $('#runPlay').querySelector('i').textContent = R?.playing ? '⏸' : '▶';
  const status = $('#runStatus');
  status.className = 'run-status';
  if (!R) {
    status.textContent = tr('run.stopped');
  } else if (R.error) {
    status.classList.add('error');
    status.textContent = R.error;
  } else if (R.done) {
    status.classList.add('done');
    status.textContent = tr('run.done', { n: R.steps - 1 });
  } else {
    status.textContent = tr('run.stepN', { n: R.steps });
  }
}

$('#runBtn').onclick = startRun;
$('#runStep').onclick = () => { if (runner?.playing) pause(); else step(); };
$('#runPlay').onclick = play;
$('#runRestart').onclick = startRun;
$('#runClose').onclick = closeRun;
$('#runSpeed').oninput = () => { try { localStorage.setItem('structorizer-run-speed', $('#runSpeed').value); } catch (e) { /* ignore */ } };
try { $('#runSpeed').value = localStorage.getItem('structorizer-run-speed') ?? '2'; } catch (e) { /* ignore */ }
