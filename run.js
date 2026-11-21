'use strict';

/* =========================================================
   Run: step through a diagram and watch variables and output.
   The execution itself is in engine.js; this file drives it step by
   step and shows it.
   Uses globals from app.js: project, runner, find, render, select, tr, ...
   ========================================================= */

const SPEEDS = [1200, 600, 250, 60, 0]; // ms between steps, slow → instant

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Input during a run uses the app's question dialog – unless the answer was recorded
    earlier in this run (replay after stepping back), then it is given again without asking. */
async function askInput(promptText, R) {
  if (R.inputPos < R.inputs.length) return R.inputs[R.inputPos++];
  const v = await ask(promptText ? show(promptText) : tr('run.input'), '');
  if (runner === R) R.inputs[R.inputPos++] = v;
  return v;
}

function print(text, R) {
  R.out += text;
  if (runner !== R || R.replaying) return; // written once when the replay is done
  showOutput();
}

function showOutput() {
  const o = $('#runOutput');
  o.textContent = runner.out;
  o.scrollTop = o.scrollHeight;
}

/** Fresh run state at step 0. rec: earlier runner whose recorded inputs / random numbers are
    shared (stepping back), so going forward again replays them before asking for new ones. */
function newRunner(home, owner, source, rec) {
  const R = createRun({
    diagrams: project.diagrams, home, input: askInput, write: print,
    inputs: rec ? rec.inputs : [], randoms: rec ? rec.randoms : [],
  });
  return Object.assign(R, {
    owner, source, playing: false, busy: false, done: false, replaying: false,
    current: null, error: null, out: '', prev: {},
  });
}

function startRun() {
  stopRun();
  const home = project.active;
  const owner = new Map(); // element id → diagram index
  project.diagrams.forEach((d, i) => {
    const walk = (l) => l.forEach((n) => { owner.set(n.id, i); childLists(n).forEach(walk); });
    walk(d.body);
  });
  // the diagrams as they were run: stepping back after the end is only possible while unchanged
  runner = newRunner(home, owner, JSON.stringify(project.diagrams), null);
  select(null);
  document.body.classList.add('running');
  $('#runPanel').hidden = false;
  $('#runOutput').textContent = '';
  track('run_start');
  step();
}

/** Can the run go back one step? (Also after it finished or failed, if nothing was edited since.) */
function canStepBack() {
  const R = runner;
  if (!R || R.busy || R.steps < 2) return false;
  return !R.done || JSON.stringify(project.diagrams) === R.source;
}

/* Step back: async generators can't be rewound, so the run is replayed from the start up to the
   step before, quietly (no drawing, no delays), with the recorded inputs and random numbers. */
async function stepBack() {
  const old = runner;
  if (!old) return;
  if (old.playing) {
    pause();
    renderRunState();
    while (runner === old && old.busy) await sleep(20); // let the step that is running finish
    if (runner !== old) return;
  }
  if (!canStepBack()) { renderRunState(); return; }
  const target = old.steps - 1;
  old.busy = true;
  // let the old generator finish first (its finally blocks still pop its frames)
  await old.gen.return().catch(() => {});
  if (runner !== old) return; // stopped or restarted meanwhile
  const R = newRunner(old.home, old.owner, old.source, old);
  R.busy = R.replaying = true;
  runner = R;
  let error = null;
  try {
    while (R.steps < target) {
      // variables before the last step: "changed" marks what that step changed
      if (R.steps === target - 1) R.prev = varSnapshot(visibleVars(R));
      R.steps++;
      const r = await R.gen.next();
      if (runner !== R) return; // stopped during the replay
      if (r.done) { R.current = null; break; } // can't happen with the same diagram and inputs
      R.current = r.value;
    }
  } catch (e) {
    error = e;
  }
  if (runner !== R) return;
  R.busy = R.replaying = false;
  select(null);
  document.body.classList.add('running');
  showOutput();
  if (error) failRun(error);
  else if (!R.current) finishRun();
  else { showStep(); renderRunState(); }
}

/** Run one element. quiet: don't redraw (used when running at full speed). */
async function step(quiet = false) {
  const R = runner;
  if (!R || R.done || R.busy) return;
  R.busy = true;
  const inputsBefore = R.inputPos;
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
    if (runner === R) {
      // an answer given in the failing step (e.g. not a number) is asked again after stepping back
      R.inputs.length = Math.min(R.inputs.length, inputsBefore);
      failRun(e);
    }
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
  $('#runBack').disabled = true;
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
  const vars = visibleVars(runner);
  const names = Object.keys(vars);
  table.replaceChildren();
  if (!names.length) {
    const empty = document.createElement('caption');
    empty.textContent = tr('run.noVars');
    table.append(empty);
  }
  names.forEach((k) => {
    const v = show(vars[k], true);
    const tr_ = table.insertRow();
    if (runner.prev[k] !== v) tr_.className = 'changed';
    tr_.insertCell().textContent = k;
    tr_.insertCell().textContent = v;
  });
  runner.prev = varSnapshot(vars);
}

/** Variables shown: the global ones plus the parameters of the function that is running. */
function visibleVars(R) {
  return { ...R.vars, ...R.frames[R.frames.length - 1] };
}

/** Variables as shown, to find the ones that changed. */
function varSnapshot(vars) {
  return Object.fromEntries(Object.keys(vars).map((k) => [k, show(vars[k], true)]));
}

function renderRunState() {
  const R = runner;
  const active = R && !R.done;
  $('#runStep').disabled = !active;
  $('#runPlay').disabled = !active;
  $('#runBack').disabled = !canStepBack();
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
$('#runBack').onclick = stepBack;
$('#runStep').onclick = () => { if (runner?.playing) pause(); else step(); };
$('#runPlay').onclick = play;
$('#runRestart').onclick = startRun;
$('#runClose').onclick = closeRun;
$('#runSpeed').oninput = () => { try { localStorage.setItem('structorizer-run-speed', $('#runSpeed').value); } catch (e) { /* ignore */ } };
try { $('#runSpeed').value = localStorage.getItem('structorizer-run-speed') ?? '2'; } catch (e) { /* ignore */ }
