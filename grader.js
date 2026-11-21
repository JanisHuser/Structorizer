'use strict';

/* =========================================================
   Grader: checks a project against an exercise's tests.json. No DOM –
   also runs in Node (the library checker).

   tests.json:
   {
     "tests": [
       { "input": ["5"], "output": "120" },            // program: inputs → expected output
       { "input": ["0"], "output": "1", "hidden": true }, // hidden: only counted, never shown
       { "call": "max(3, 5)", "returns": 5 }             // function diagram: call → return value
     ],
     "complexity": { "input": ["{n}"], "sizes": [16, 64, 256, 1024], "max": "O(n)" },
                    // or "call": "search(range(0, {n}), {n} - 1)" instead of "input"
     "structure": { "requires": ["for"], "forbids": ["while"], "maxDepth": 2,
                    "maxElements": 8, "maxCyclomatic": 3, "functions": ["max(a, b)"] },
     "points": { "tests": 6, "complexity": 2, "structure": 2 },
     "stepLimit": 200000                                  // optional, per run
   }
   Results contain codes and values, not sentences: the UI words them.
   ========================================================= */

const GRADE_STEP_LIMIT = 200000; // per run; tests.json may set "stepLimit"
const DEFAULT_POINTS = { tests: 6, complexity: 2, structure: 2 };

/* ---------------- running without the screen ---------------- */

/** Run the main diagram (or evaluate `call`) to the end with fixed inputs.
    Resolves to { output, returned, steps, error } – never rejects. */
async function runHeadless(project, { input = [], call = null, randoms = [], stepLimit = GRADE_STEP_LIMIT } = {}) {
  let output = '';
  let pos = 0;
  const R = createRun({
    diagrams: project.diagrams,
    home: 0,
    randoms: [...randoms],
    maxInner: stepLimit,
    input: () => {
      if (pos < input.length) return String(input[pos++]);
      throw new RunError(tr('grade.noInput'));
    },
    write: (text) => {
      output += text;
      if (output.length > 200000) throw new RunError(tr('grade.tooMuchOutput'));
    },
  });
  const steps = () => R.steps + R.inner;
  let returned;
  let error = null;
  try {
    if (call) {
      returned = await evalText(call, { text: call }, R);
      R.steps = 1;
    } else {
      for (;;) {
        if (steps() > stepLimit) throw new RunError(tr('run.tooMany', { n: stepLimit }));
        if (++R.steps % 5000 === 0) await new Promise((r) => setTimeout(r, 0)); // keep the page responsive
        if ((await R.gen.next()).done) break;
      }
    }
  } catch (e) {
    if (e instanceof Jump) {
      if (e.kind === 'return') returned = e.value;
    } else {
      error = e instanceof RunError ? e.message : String(e?.message || e);
    }
  }
  return { output, returned, steps: steps(), error };
}

/* ---------------- comparing ---------------- */

/** Output as compared: lines trimmed, runs of spaces squeezed, numbers as numbers (5.0 = 5),
    empty lines at the end dropped. */
function normalizeOutput(s) {
  const out = String(s ?? '').replace(/\r/g, '').split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' ').replace(/-?\d+(?:\.\d+)?/g, (m) => String(Number(m))));
  while (out.length && !out[out.length - 1]) out.pop();
  return out.join('\n');
}

function sameOutput(actual, expected, test) {
  let a = normalizeOutput(actual);
  let e = normalizeOutput(expected);
  if (test.ignoreCase) { a = a.toLowerCase(); e = e.toLowerCase(); }
  return test.contains ? a.includes(e) : a === e;
}

/** Return value equal to the expected one (numbers with a little tolerance, arrays element-wise). */
function sameValue(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => sameValue(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => sameValue(a[k], b[k]));
  }
  return a === b;
}

/* ---------------- tests ---------------- */

async function gradeTests(project, tests, stepLimit) {
  const items = [];
  for (const [i, t] of tests.entries()) {
    const r = await runHeadless(project, { input: t.input || [], call: t.call || null, randoms: t.randoms || [], stepLimit });
    let passed = !r.error;
    if (passed && 'output' in t) passed = sameOutput(r.output, t.output, t);
    if (passed && 'returns' in t) passed = sameValue(r.returned, t.returns);
    items.push({
      index: i, hidden: !!t.hidden, passed,
      input: t.input, call: t.call, expected: 'returns' in t ? t.returns : t.output,
      expects: 'returns' in t ? 'returns' : 'output',
      actual: 'returns' in t ? r.returned : r.output, error: r.error,
    });
  }
  return items;
}

/* ---------------- complexity ---------------- */

const COMPLEXITY = [
  ['O(1)', () => 1],
  ['O(log n)', (n) => Math.log2(n)],
  ['O(n)', (n) => n],
  ['O(n log n)', (n) => n * Math.log2(n)],
  ['O(n²)', (n) => n * n],
  ['O(n³)', (n) => n ** 3],
  ['O(2ⁿ)', (n) => 2 ** n],
];

/** Index in COMPLEXITY of a class written e.g. "O(n^2)", "O(n2)", "O(n*log(n))". */
function complexityRank(text) {
  const t = String(text).replace(/\s|\*|·/g, '').replace(/\^2|2(?=\)$)/, '²').replace(/\^3|3(?=\)$)/, '³')
    .replace(/log\(n\)|log2n|log_2n|lgn/i, 'logn').replace(/\^n/, 'ⁿ').toLowerCase();
  return COMPLEXITY.findIndex(([name]) => name.replace(/\s/g, '').toLowerCase() === t);
}

/** Growth class that fits the step counts best: least squares on steps ≈ a·f(n) + b (a ≥ 0),
    compared by relative error; on (near) ties the slower-growing class wins. */
function fitComplexity(sizes, steps) {
  let best = null;
  COMPLEXITY.forEach(([name, f], rank) => {
    const xs = sizes.map(f);
    if (xs.some((x) => !Number.isFinite(x))) return;
    const k = xs.length;
    const mx = xs.reduce((s, x) => s + x, 0) / k;
    const my = steps.reduce((s, y) => s + y, 0) / k;
    const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    let a = sxx ? xs.reduce((s, x, i) => s + (x - mx) * (steps[i] - my), 0) / sxx : 0;
    if (a < 0) a = 0;
    const b = my - a * mx;
    const err = steps.reduce((s, y, i) => s + ((a * xs[i] + b - y) / Math.max(1, y)) ** 2, 0) / k;
    if (!best || err < best.err - 1e-6) best = { name, rank, err };
  });
  return best;
}

async function gradeComplexity(project, spec, stepLimit) {
  const sizes = spec.sizes || [16, 64, 256, 1024];
  const target = complexityRank(spec.max);
  const fill = (s, n) => String(s).replace(/\{n\}/g, String(n));
  const steps = [];
  for (const n of sizes) {
    const r = await runHeadless(project, {
      input: (spec.input || []).map((x) => fill(x, n)),
      call: spec.call ? fill(spec.call, n) : null,
      stepLimit,
    });
    if (r.error) return { passed: false, target: spec.max, sizes, steps, error: r.error, size: n };
    steps.push(r.steps);
  }
  const fit = fitComplexity(sizes, steps);
  return { passed: !!fit && target >= 0 && fit.rank <= target, measured: fit?.name, target: spec.max, sizes, steps };
}

/* ---------------- structure ---------------- */

const LOOP_TYPES = new Set(['while', 'dowhile', 'for']);

/** Element counts, nesting depth, cyclomatic complexity and function signatures of a project. */
function structureMetrics(project) {
  const counts = {};
  let elements = 0;
  let maxDepth = 0;
  let decisions = 0;
  const walk = (list, depth) => list.forEach((n) => {
    elements++;
    counts[n.type] = (counts[n.type] || 0) + 1;
    if (LOOP_TYPES.has(n.type) || n.type === 'if') decisions++;
    if (n.type === 'switch') decisions += Math.max(0, n.cases.length - 1);
    const kids = childLists(n);
    if (kids.length) maxDepth = Math.max(maxDepth, depth + 1);
    kids.forEach((l) => walk(l, depth + 1));
  });
  project.diagrams.forEach((d) => walk(d.body, 0));
  counts.loop = (counts.while || 0) + (counts.dowhile || 0) + (counts.for || 0);
  const functions = project.diagrams.slice(1).map((d) => signature(d));
  return { counts, elements, maxDepth, cyclomatic: 1 + decisions, functions };
}

function gradeStructure(project, rules) {
  const m = structureMetrics(project);
  const broken = [];
  for (const type of rules.requires || []) if (!m.counts[type]) broken.push({ rule: 'requires', value: type });
  for (const type of rules.forbids || []) if (m.counts[type]) broken.push({ rule: 'forbids', value: type });
  if (rules.maxDepth != null && m.maxDepth > rules.maxDepth) broken.push({ rule: 'maxDepth', value: rules.maxDepth, actual: m.maxDepth });
  if (rules.maxElements != null && m.elements > rules.maxElements) broken.push({ rule: 'maxElements', value: rules.maxElements, actual: m.elements });
  if (rules.maxCyclomatic != null && m.cyclomatic > rules.maxCyclomatic) broken.push({ rule: 'maxCyclomatic', value: rules.maxCyclomatic, actual: m.cyclomatic });
  for (const f of rules.functions || []) {
    const want = signature({ name: f });
    if (!m.functions.some((s) => s.name === want.name && s.params.length === want.params.length)) broken.push({ rule: 'functions', value: f });
  }
  return { passed: !broken.length, broken, metrics: m };
}

/* ---------------- all together ---------------- */

/** Grade a project: { passed, score, max, tests?, complexity?, structure? }.
    Tests give points in proportion to the tests passed; complexity and structure all or nothing. */
async function grade(project, spec) {
  const points = { ...DEFAULT_POINTS, ...(spec.points || {}) };
  const stepLimit = spec.stepLimit || GRADE_STEP_LIMIT;
  const result = { passed: true, score: 0, max: 0 };
  if (spec.tests?.length) {
    const items = await gradeTests(project, spec.tests, stepLimit);
    const ok = items.filter((t) => t.passed).length;
    const passed = ok === items.length;
    result.tests = {
      passed, max: points.tests, points: Math.round((points.tests * ok * 2) / items.length) / 2,
      ok, total: items.length,
      visible: items.filter((t) => !t.hidden),
      hidden: { ok: items.filter((t) => t.hidden && t.passed).length, total: items.filter((t) => t.hidden).length },
    };
  }
  if (spec.complexity) {
    const c = await gradeComplexity(project, spec.complexity, stepLimit);
    result.complexity = { ...c, max: points.complexity, points: c.passed ? points.complexity : 0 };
  }
  if (spec.structure) {
    const s = gradeStructure(project, spec.structure);
    result.structure = { ...s, max: points.structure, points: s.passed ? points.structure : 0 };
  }
  for (const k of ['tests', 'complexity', 'structure']) {
    if (!result[k]) continue;
    result.score += result[k].points;
    result.max += result[k].max;
    if (!result[k].passed) result.passed = false;
  }
  return result;
}
