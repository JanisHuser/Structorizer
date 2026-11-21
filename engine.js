'use strict';

/* =========================================================
   Engine: executes diagrams. No DOM – used by Run (run.js), by the
   grader (grader.js) and by the library checker in Node.

   Element texts are read as simple Java / C / Python / JavaScript,
   rewritten to JavaScript and evaluated with the program's variables
   as scope. All diagrams share one set of variables; a function call
   (call element) runs the diagram with that name and can pass values
   to its parameters, e.g. a diagram named "max(a, b)".

   A run R (see createRun) is passed to every function explicitly, so
   several runs can exist at once. Output goes to R.write(text, R), input
   comes from await R.input(prompt, R).
   Uses globals from codegen.js (lines, isDefault, parseFor, signature,
   splitTop, childLists) and i18n.js (tr).
   ========================================================= */

const AsyncFunction = (async () => {}).constructor;
const MAX_STEPS = 100000;
const PLACEHOLDER_TYPES = new Set(['while', 'dowhile', 'if', 'switch', 'instruction', 'call']);

/** break / continue / return / exit travelling up to whoever handles it */
class Jump {
  constructor(kind, value) { this.kind = kind; this.value = value; }
}
class RunError extends Error {
  constructor(message, node) { super(message); this.node = node; }
}

/* ---------------- text → JavaScript ---------------- */

const TYPES = 'int|long|short|byte|double|float|boolean|bool|char|String|string|var|let|const|final|auto|Integer|Double|Scanner';

/** Apply fn to the parts of code that are not inside string literals. */
function outsideStrings(code, fn) {
  return code.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/).map((part, i) => (i % 2 ? part : fn(part))).join('');
}

function toJs(code, diagrams) {
  // function diagrams called inside an expression (e.g. "k * fact(k - 1)") are awaited
  const fns = diagrams.slice(1).map((d) => signature(d).name);
  const fnCall = fns.length ? new RegExp(`(^|[^.\\w])(${fns.join('|')})\\s*\\(`, 'g') : null;
  return outsideStrings(code.trim().replace(/;\s*$/, ''), (t) => (fnCall ? t.replace(fnCall, '$1await $2(') : t)
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

/** Recorded value for replay, or a new one from make() that is recorded for the next replay. */
function recorded(list, pos, make) {
  return pos < list.length ? list[pos] : (list[pos] = make());
}

/* Inputs and random numbers are recorded on the run so that stepping back (which replays
   the run from the start) gets exactly the same values again. */
function makeScope(vars, R) {
  const print = (text) => R.write(text, R);
  const println = (...a) => print(a.map((x) => show(x)).join(' ') + '\n');
  const out = {
    println,
    print: (...a) => print(a.map((x) => show(x)).join(' ')),
    printf: (f, ...a) => print(format(f, a)),
  };
  const ask = async (p, kind) => {
    const v = String((await R.input(p, R)) ?? '');
    if (kind === 'number') {
      if (!Number.isFinite(Number(v)) || v.trim() === '') throw new RunError(tr('run.notNumber', { value: v }));
      return Number(v);
    }
    return kind === 'text' ? v : autoNumber(v);
  };
  const input = (p) => ask(p, 'auto');
  const random = () => recorded(R.randoms, R.randomPos++, Math.random);
  // Math with a recorded random(); the other functions don't use `this`, so inheriting works
  const math = Object.create(Math, { random: { value: random } });
  const builtins = {
    Math: math, Number, Boolean, Array, JSON, Object, parseInt, parseFloat, isNaN, isFinite,
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
    abs: Math.abs, round: Math.round, min: Math.min, max: Math.max, sqrt: Math.sqrt, pow: Math.pow, random,
    range: (a, b, s = 1) => {
      if (b === undefined) { b = a; a = 0; }
      const r = [];
      for (let i = a; s > 0 ? i < b : i > b; i += s) r.push(i);
      return r;
    },
  };
  // parameters of the function that is running live in its own frame (so recursion works)
  const frame = () => R.frames[R.frames.length - 1];
  return new Proxy(vars, {
    has: (t, k) => typeof k === 'string', // every name is looked up here, never on window
    get: (t, k) => {
      if (typeof k !== 'string') return undefined;
      const f = frame();
      if (f && Object.hasOwn(f, k)) return f[k];
      if (Object.hasOwn(t, k)) return t[k];
      const idx = functionIndex(R.diagrams, k);
      if (idx > 0) return (...args) => callFunction(R, idx, args);
      if (Object.hasOwn(builtins, k)) return builtins[k];
      throw new RunError(tr('run.undefinedVar', { name: k }));
    },
    set: (t, k, v) => {
      const f = frame();
      if (f && Object.hasOwn(f, k)) f[k] = v;
      else t[k] = v;
      return true;
    },
  });
}

/* ---------------- evaluation ---------------- */

const compiled = new Map(); // shared by all runs: compiled code gets the scope as its argument

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

async function callCompiled(fn, node, R) {
  try {
    return await fn(R.scope);
  } catch (e) {
    if (e instanceof Jump) throw e;
    if (e instanceof RunError) { e.node ??= node; throw e; }
    throw new RunError(e.message, node);
  }
}

/** Run statements (one per line). */
function execText(text, node, R) {
  return callCompiled(compile(lines(text).map((l) => toJs(l, R.diagrams)).join(';\n'), node), node, R);
}

/** Value of an expression (condition, switch value, …). */
function evalText(text, node, R) {
  return callCompiled(compile(`return (${toJs(text, R.diagrams)});`, node), node, R);
}

/* ---------------- execution (async generators) ----------------
   Each element is yielded just before it runs; the runner shows it and
   waits for the next step. Loops yield again before every new check. */

async function* execList(list, R) {
  for (const n of list) yield* execNode(n, R);
}

/** Loop body: returns 'break' when the loop should end. */
async function* loopBody(list, R) {
  try {
    yield* execList(list, R);
  } catch (e) {
    if (e instanceof Jump && e.kind === 'break') return 'break';
    if (e instanceof Jump && e.kind === 'continue') return 'continue';
    throw e;
  }
  return null;
}

async function* execNode(n, R) {
  if (n.auto && PLACEHOLDER_TYPES.has(n.type)) {
    yield n;
    throw new RunError(tr('run.placeholder'), n);
  }
  switch (n.type) {
    case 'instruction':
      yield n;
      await execText(n.text, n, R);
      break;
    case 'call':
      yield n;
      yield* callNode(n, R);
      break;
    case 'jump':
      yield n;
      await jump(n, R);
      break;
    case 'while':
      for (;;) {
        yield n;
        if (!await evalText(n.text, n, R)) break;
        if ((yield* loopBody(n.body, R)) === 'break') break;
      }
      break;
    case 'dowhile':
      for (;;) {
        if ((yield* loopBody(n.body, R)) === 'break') break;
        yield n;
        if (!await evalText(n.text, n, R)) break;
      }
      break;
    case 'for':
      yield* forLoop(n, R);
      break;
    case 'if':
      yield n;
      yield* execList(await evalText(n.text, n, R) ? n.yes : n.no, R);
      break;
    case 'switch': {
      yield n;
      const v = await evalText(n.text, n, R);
      yield* execList(await pickCase(n, v, R), R);
      break;
    }
    case 'parallel':
      yield n;
      yield* parallel(n, R);
      break;
  }
}

async function* forLoop(n, R) {
  yield n;
  const f = parseFor(n.text);
  if (!f) throw new RunError(tr('run.badFor'), n);
  const vars = R.vars;
  if (f.kind === 'c') {
    if (f.init) await execText(f.init, n, R);
    for (;;) {
      if (f.cond && !await evalText(f.cond, n, R)) break;
      if ((yield* loopBody(n.body, R)) === 'break') break;
      yield n;
      if (f.update) await execText(f.update, n, R);
    }
  } else if (f.kind === 'range') {
    const to = Number(await evalText(f.to, n, R));
    const step = Number(await evalText(f.step, n, R));
    if (!step) throw new RunError(tr('run.badFor'), n);
    vars[f.v] = Number(await evalText(f.from, n, R));
    while (step > 0 ? vars[f.v] <= to : vars[f.v] >= to) {
      if ((yield* loopBody(n.body, R)) === 'break') break;
      yield n;
      vars[f.v] += step;
    }
  } else {
    const items = await evalText(f.iter, n, R);
    if (items == null || typeof items[Symbol.iterator] !== 'function') throw new RunError(tr('run.badFor'), n);
    for (const x of [...items]) {
      vars[f.v] = x;
      if ((yield* loopBody(n.body, R)) === 'break') break;
      yield n;
    }
  }
}

/** Case whose label (or one of its comma-separated labels) equals the value, else the default case. */
async function pickCase(n, v, R) {
  for (const c of n.cases) {
    if (isDefault(c)) continue;
    for (const part of c.label.split(',')) {
      let x;
      try { x = await evalText(part, n, R); } catch (e) { x = part.trim(); } // plain words: compare as text
      // eslint-disable-next-line eqeqeq
      if (x == v) return c.body;
    }
  }
  return n.cases.find(isDefault)?.body || [];
}

/** Threads take turns, one element each, so their steps interleave. */
async function* parallel(n, R) {
  let gens = n.threads.map((t) => execList(t, R));
  while (gens.length) {
    for (const g of [...gens]) {
      const r = await g.next();
      if (r.done) gens = gens.filter((x) => x !== g);
      else yield r.value;
    }
  }
}

async function jump(n, R) {
  const t = n.text.trim().replace(/;$/, '');
  const m = /^(break|continue|return|exit|quit|halt)\b\s*(.*)$/i.exec(t);
  const kind = m ? m[1].toLowerCase() : /System\.exit/.test(t) ? 'exit' : 'return';
  if (kind === 'break' || kind === 'continue') throw new Jump(kind);
  if (kind === 'return') throw new Jump('return', m && m[2] ? await evalText(m[2], n, R) : undefined);
  throw new Jump('exit');
}

/** Index of the function diagram with this name (> 0), or -1. */
function functionIndex(diagrams, name) {
  return diagrams.findIndex((d, i) => i > 0 && signature(d).name === name);
}

/** A new frame with the function's parameters set to the argument values. */
function pushFrame(R, idx, values) {
  if (R.depth > 200) throw new RunError(tr('run.tooDeep'));
  const { params } = signature(R.diagrams[idx]);
  R.frames.push(Object.fromEntries(params.map((p, i) => [p, values[i]])));
  R.depth++;
}

function popFrame(R) {
  R.depth--;
  R.frames.pop();
}

/** Call element: steps into the function diagram (shown step by step). */
async function* callNode(n, R) {
  const m = /^\s*(?:(?:[A-Za-z_]\w*\s+)?([A-Za-z_]\w*)\s*=\s*)?([A-Za-z_]\w*)\s*\((.*)\)\s*;?\s*$/.exec(n.text);
  const idx = m ? functionIndex(R.diagrams, m[2]) : -1;
  if (idx < 0) { await execText(n.text, n, R); return; } // not one of our diagrams: plain code
  const values = [];
  for (const a of splitTop(m[3], ',').filter((x) => x.trim())) values.push(await evalText(a, n, R));
  try { pushFrame(R, idx, values); } catch (e) { e.node = n; throw e; }
  let value;
  try {
    yield* execList(R.diagrams[idx].body, R);
  } catch (e) {
    if (e instanceof Jump && e.kind === 'return') value = e.value;
    else throw e;
  } finally {
    popFrame(R);
  }
  if (m[1]) R.scope[m[1]] = value; // assigned like any other variable (local if it is a parameter)
}

/** Function called inside an expression, e.g. "k * fact(k - 1)": runs to the end within the
    current step (its elements are not shown one by one). */
async function callFunction(R, idx, values) {
  pushFrame(R, idx, values);
  try {
    const g = execList(R.diagrams[idx].body, R);
    for (;;) {
      if (++R.inner > R.maxInner) throw new RunError(tr('run.tooMany', { n: R.maxInner }));
      if ((await g.next()).done) break;
    }
  } catch (e) {
    if (e instanceof Jump && e.kind === 'return') return e.value;
    throw e;
  } finally {
    popFrame(R);
  }
  return undefined;
}

async function* program(list, R) {
  try {
    yield* execList(list, R);
  } catch (e) {
    if (!(e instanceof Jump)) throw e; // return / exit / stray break end the program
  }
}

/** A new run at step 0 of diagram `home`. R.gen yields each element just before it runs.
    inputs / randoms: recorded values to replay first (shared with an earlier run when stepping back). */
function createRun({ diagrams, home = 0, input, write, inputs = [], randoms = [], maxInner = MAX_STEPS }) {
  const vars = {};
  const R = {
    diagrams, home, vars, scope: null, gen: null, steps: 0, depth: 0,
    inputs, randoms, inputPos: 0, randomPos: 0,
    frames: [], inner: 0, maxInner, // parameters of running functions; steps inside expression calls
    input, write,
  };
  R.scope = makeScope(vars, R);
  R.gen = program(diagrams[home].body, R);
  return R;
}
