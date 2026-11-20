'use strict';

/* =========================================================
   Code export: complete programs that compile / run as they are.

   Java:   one class Main. Every variable is a static field (all diagrams share
           their variables, like the step-through run); its type is inferred
           from the values assigned to it. Each further diagram becomes a static
           method, e.g. a diagram named "max(a, b)" → static int max(int a, int b).
   Python: globals initialised at the top, one def per diagram, main() at the end.

   Element texts may be written Java/C-style or Python-style; common statements
   (output, input, operators, literals, ++) are translated to the target language.
   Also used by run.js: lines, isDefault, ident, parseFor, signature, splitTop.
   ========================================================= */

const lines = (t) => (t || '').split('\n').filter((l) => l.trim());
const isDefault = (c) => c.auto || /^(sonst|default|else|otherwise|sinon|altrimenti|_)$/i.test(c.label.trim());
const ident = (s) => s.replace(/\W+/g, '_').replace(/^(\d)/, '_$1') || 'f';

/* ---------------- small text helpers ---------------- */

const STRING_RE = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/;

/** Apply fn to the code outside string literals (and strFn to the literals). */
function mapCode(code, fn, strFn = (s) => s) {
  return code.split(STRING_RE).map((part, i) => (i % 2 ? strFn(part) : fn(part))).join('');
}

/** Split at a separator that is not inside brackets or strings. */
function splitTop(s, sep) {
  const out = [];
  let depth = 0;
  let cur = '';
  let quote = null;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      cur += ch;
      if (ch === '\\') cur += s[++i] ?? '';
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

const isStrLit = (s) => /^\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*$/.test(s);

/** Common clean-up: no trailing ";", Pascal-style assignment, math symbols. */
const norm = (s) => mapCode((s || '').trim().replace(/;\s*$/, ''), (t) => t
  .replace(/:=|←/g, '=').replace(/≠|<>/g, '!=').replace(/≤/g, '<=').replace(/≥/g, '>='));

/** Arguments of every call of `name(...)` in a text. */
function findCalls(text, name) {
  const calls = [];
  const re = new RegExp(`(^|[^.\\w])${name}\\s*\\(`, 'g');
  const code = mapCode(text, (t) => t, (s) => s.replace(/[()]/g, ' ')); // ignore brackets in strings
  let m;
  while ((m = re.exec(code))) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    for (; i < code.length && depth; i++) {
      if (code[i] === '(') depth++;
      else if (code[i] === ')') depth--;
    }
    if (!depth) calls.push(splitTop(text.slice(start, i - 1), ',').map((a) => a.trim()).filter(Boolean));
  }
  return calls;
}

/* ---------------- for loops & function signatures ---------------- */

/** Understand the text of a for loop.
 *  range: "i = 1 to 10" (also bis/à/a, optional "step 2") · c: "int i = 0; i < n; i++" · in: "x in list" */
function parseFor(text) {
  let t = (text || '').trim();
  if (t.startsWith('(') && t.endsWith(')') && splitTop(t.slice(1, -1), ')').length === 1) t = t.slice(1, -1).trim(); // "(…)" around it
  const parts = t.split(';');
  if (parts.length === 3) return { kind: 'c', init: parts[0].trim(), cond: parts[1].trim(), update: parts[2].trim() };
  const m = /^(?:(?:int|long|var|let)\s+)?([A-Za-z_]\w*)\s*(?:=|:=|←|\bvon\b|\bfrom\b|\bde\b|\bda\b)\s*(.+?)\s+(?:bis|to|à|a|until|fino a|jusqu'à)\s+(.+?)(?:\s+(?:step|schritt|schrittweite|pas|passo)\s+(.+))?$/i.exec(t);
  if (m) return { kind: 'range', v: m[1], from: m[2].trim(), to: m[3].trim(), step: (m[4] || '1').trim() };
  const f = /^(?:(?:var|let|const|int|String|double)\s+)?([A-Za-z_]\w*)\s*(?:\bin\b|:)\s*(.+)$/.exec(t);
  if (f) return { kind: 'in', v: f[1], iter: f[2].trim() };
  return null;
}

const isNegative = (step) => /^\s*-/.test(step);

/** Name and parameters of a diagram used as a function, e.g. "max(a, b)" or "int max(int a, int b)". */
function signature(d) {
  const m = /^\s*(?:[A-Za-z_]\w*\s+)?([A-Za-z_]\w*)\s*\((.*)\)\s*$/.exec(d.name);
  return m
    ? { name: m[1], params: m[2].split(',').map((p) => p.trim().split(/\s+/).pop()).filter(Boolean) }
    : { name: ident(d.name), params: [] };
}

/* ---------------- analysis: variables, types, functions ---------------- */

const TYPE_WORDS = 'int|long|short|byte|double|float|boolean|bool|char|String|string|var|let|const|auto|Integer|Double';
const DECL_RE = new RegExp(`^(?:final\\s+)?(${TYPE_WORDS})(?:\\s*\\[\\s*\\])?\\s+(?=[A-Za-z_]\\w*\\s*(?:=|$))`);
const ASSIGN_RE = /^([A-Za-z_]\w*)\s*([+\-*/%]?=)(?!=)\s*([\s\S]+)$/;
const JAVA_TYPE = { int: 'int', long: 'long', short: 'int', byte: 'int', double: 'double', float: 'double', boolean: 'boolean', bool: 'boolean', char: 'char', String: 'String', string: 'String', Integer: 'int', Double: 'double' };
const RANK = { boolean: 0, char: 0, int: 1, long: 2, double: 3, String: 4 };
const DEFAULT_VALUE = { java: { int: '0', long: '0', double: '0.0', boolean: 'false', char: "' '", String: '""' }, python: { int: '0', long: '0', double: '0.0', boolean: 'False', char: '""', String: '""' } };

/** Walk all elements of a list (depth first). */
function walkNodes(list, fn) {
  list.forEach((n) => { fn(n); childLists(n).forEach((l) => walkNodes(l, fn)); });
}

function analyze() {
  const funcs = new Map(); // name → { name, params, ret, paramTypes, diagram }
  project.diagrams.forEach((d, i) => {
    if (i === 0) return;
    const sig = signature(d);
    funcs.set(sig.name, { ...sig, ret: 'void', paramTypes: sig.params.map(() => null), diagram: d });
  });
  const ctx = { funcs, types: new Map(), declared: new Map(), imports: new Set() };

  // statements per diagram: { text, fn (function the diagram belongs to or null) }
  const assigns = []; // { name, expr | type, fn }
  const returns = []; // { expr, fn }
  const exprs = []; // every text, to find function calls
  project.diagrams.forEach((d, i) => {
    const fn = i === 0 ? null : funcs.get(signature(d).name);
    walkNodes(d.body, (n) => {
      if (n.auto && n.type !== 'for' && n.type !== 'jump') return; // placeholders are exported as comments
      exprs.push(n.text);
      if (n.type === 'instruction' || n.type === 'call') {
        lines(n.text).forEach((l) => collectAssign(norm(l), fn, assigns, ctx));
      } else if (n.type === 'for') {
        const f = parseFor(n.text);
        if (f?.kind === 'range') assigns.push({ name: f.v, expr: `${f.from} + ${f.step}`, fn });
        if (f?.kind === 'c') collectAssign(norm(f.init), fn, assigns, ctx);
      } else if (n.type === 'jump') {
        const m = /^return\b\s*(.+)$/.exec(norm(n.text));
        if (m && fn) returns.push({ expr: m[1], fn });
      }
    });
  });

  // a function's own parameters are local in Java / Python
  const isParam = (a) => a.fn && a.fn.params.includes(a.name);
  for (let pass = 0; pass < 5; pass++) {
    assigns.forEach((a) => {
      if (isParam(a)) return;
      if (ctx.declared.has(a.name)) return;
      mergeType(ctx.types, a.name, a.type || exprType(a.expr, ctx, a.fn));
    });
    returns.forEach((r) => {
      const t = exprType(r.expr, ctx, r.fn);
      r.fn.ret = r.fn.ret === 'void' ? t : wider(r.fn.ret, t);
    });
    funcs.forEach((f) => {
      exprs.forEach((text) => findCalls(text, f.name).forEach((args) => {
        args.forEach((a, i) => {
          if (i < f.params.length) f.paramTypes[i] = f.paramTypes[i] ? wider(f.paramTypes[i], exprType(a, ctx, null)) : exprType(a, ctx, null);
        });
      }));
    });
  }
  ctx.declared.forEach((t, k) => ctx.types.set(k, t));
  funcs.forEach((f) => { f.paramTypes = f.paramTypes.map((t) => t || 'int'); });
  return ctx;
}

function collectAssign(s, fn, out, ctx) {
  if (!s) return;
  const decl = DECL_RE.exec(s);
  const body = s.replace(DECL_RE, '');
  const a = ASSIGN_RE.exec(body);
  const name = a ? a[1] : (/^(?:\+\+|--)?([A-Za-z_]\w*)(?:\+\+|--)?$/.exec(body) || [])[1];
  if (!name) return;
  if (decl && JAVA_TYPE[decl[1]] && !(fn && fn.params.includes(name))) ctx.declared.set(name, JAVA_TYPE[decl[1]]);
  out.push(a && a[2] === '=' ? { name, expr: a[3], fn } : { name, type: a && a[2] === '+=' ? null : 'int', expr: a ? `${name} + ${a[3]}` : null, fn });
}

const wider = (a, b) => (RANK[b] > RANK[a] ? b : a);

function mergeType(types, name, t) {
  const old = types.get(name);
  if (!old || (old === 'boolean' && t !== 'boolean')) types.set(name, t);
  else if (t !== 'boolean') types.set(name, wider(old, t));
}

/** Guess the type of an expression from literals, functions and known variables. */
function exprType(e, ctx, fn) {
  const s = norm(e);
  if (!s) return 'int';
  const code = mapCode(s, (t) => t, () => ' S ');
  if (/^\s*!|==|!=|<=|>=|&&|\|\||(?<![<>-])[<>](?![<>=])|\b(and|or|not|true|false|True|False)\b/.test(code)) return 'boolean';
  if (/^(int|toInt|len|Integer\.parseInt)\s*\(|^[\w.]+\.next(Int|Long)\(\)$|\.length(\(\))?$/.test(s)) return 'int';
  if (/^(float|toDouble|Double\.parseDouble)\s*\(|^[\w.]+\.next(Double|Float)\(\)$/.test(s)) return 'double';
  if (/^(input|eingabe|lire|leggi|str|String\.valueOf)\s*\(|^[\w.]+\.next(Line)?\(\)$/.test(s)) return 'String';
  const call = /^([A-Za-z_]\w*)\s*\(.*\)$/.exec(s);
  if (call && ctx.funcs.has(call[1])) return ctx.funcs.get(call[1]).ret === 'void' ? 'int' : ctx.funcs.get(call[1]).ret;
  if (/["']/.test(s)) return 'String';
  let t = 'int';
  (code.match(/(?<![\w.])[A-Za-z_]\w*(?!\s*[(\w.])/g) || []).forEach((id) => {
    const p = fn?.params.indexOf(id) ?? -1;
    const v = p >= 0 ? fn.paramTypes[p] : ctx.types.get(id);
    if (v && v !== 'boolean' && v !== 'char') t = wider(t, v);
  });
  if (/\d\.\d|\bMath\.(sqrt|pow|random|log|exp|sin|cos|tan)\b|\bmath\.|\*\*|(^|[^.\w])(sqrt|pow|float|toDouble)\s*\(/.test(code)) t = wider(t, 'double');
  return t;
}

/* ---------------- statement & expression translation ---------------- */

const OUT_RE = /^(System\.out\.println|System\.out\.printf|System\.out\.format|System\.out\.print|printf|println|print|console\.log|ausgabe|output|writeln|write)\s*\(([\s\S]*)\)$/;

/** Java expression. */
function jx(e, ctx) {
  return mapCode(norm(e), (t) => {
    t = t.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\s+/g, '!')
      .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null')
      .replace(/\b[A-Za-z_]\w*\.next(?:Int|Long)\(\)/g, 'toInt(input())')
      .replace(/\b[A-Za-z_]\w*\.next(?:Double|Float)\(\)/g, 'toDouble(input())')
      .replace(/\b[A-Za-z_]\w*\.next(?:Line)?\(\)/g, 'input()')
      .replace(/(^|[^.\w])(?:eingabe|lire|leggi)\s*\(/g, '$1input(')
      .replace(/(^|[^.\w])int\s*\(/g, '$1toInt(').replace(/(^|[^.\w])float\s*\(/g, '$1toDouble(')
      .replace(/(^|[^.\w])str\s*\(/g, '$1String.valueOf(')
      .replace(/\s*\/\/\s*/g, ' / ')
      .replace(/([\w.]+|\))\s*\*\*\s*([\w.]+)/g, 'Math.pow($1, $2)')
      .replace(/(^|[^.\w])math\.pi\b/g, '$1Math.PI').replace(/(^|[^.\w])math\./g, '$1Math.')
      .replace(/(^|[^.\w])random\.random\(\)/g, '$1Math.random()');
    ['abs', 'sqrt', 'max', 'min', 'floor', 'ceil', 'pow'].forEach((f) => {
      if (!ctx.funcs.has(f)) t = t.replace(new RegExp(`(^|[^.\\w])${f}\\s*\\(`, 'g'), `$1Math.${f}(`);
    });
    if (!ctx.funcs.has('round')) t = t.replace(/(^|[^.\w])round\s*\(/g, '$1(int) Math.round(');
    return t;
  }, (s) => (s.startsWith("'") && s.length !== 3 ? `"${s.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : s));
}

/** Python expression. */
function px(e, ctx) {
  return mapCode(norm(e), (t) => {
    t = t.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!(?!=)\s*/g, 'not ')
      .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False').replace(/\bnull\b/g, 'None')
      .replace(/\b[A-Za-z_]\w*\.next(?:Int|Long)\(\)/g, 'int(input())')
      .replace(/\b[A-Za-z_]\w*\.next(?:Double|Float)\(\)/g, 'float(input())')
      .replace(/\b[A-Za-z_]\w*\.next(?:Line)?\(\)/g, 'input()')
      .replace(/(^|[^.\w])(?:eingabe|lire|leggi)\s*\(/g, '$1input(')
      .replace(/\bInteger\.parseInt\(/g, 'int(').replace(/\bDouble\.parseDouble\(/g, 'float(').replace(/\bString\.valueOf\(/g, 'str(')
      .replace(/\bMath\.(abs|max|min|round)\(/g, '$1(')
      .replace(/\bMath\.random\(\)/g, 'random.random()')
      .replace(/\bMath\.PI\b/g, 'math.pi').replace(/\bMath\.E\b/g, 'math.e')
      .replace(/\bMath\.(\w+)\(/g, 'math.$1(')
      .replace(/\bSystem\.exit\(/g, 'sys.exit(')
      .replace(/\(\s*(int|long)\s*\)\s*([\w.]+(?:\([^()]*\))?)/g, 'int($2)')
      .replace(/\(\s*(double|float)\s*\)\s*([\w.]+(?:\([^()]*\))?)/g, 'float($2)')
      .replace(/([A-Za-z_]\w*)\.length\(\)/g, 'len($1)').replace(/([A-Za-z_]\w*)\.length\b/g, 'len($1)');
    ['sqrt', 'pow', 'floor', 'ceil'].forEach((f) => {
      if (!ctx.funcs.has(f)) t = t.replace(new RegExp(`(^|[^.\\w])${f}\\s*\\(`, 'g'), `$1math.${f}(`);
    });
    return t.replace(/ {2,}/g, ' ');
  });
}

/** Python can't add numbers to strings: "a = " + x → "a = " + str(x). */
function pyConcat(e) {
  const ops = splitTop(e, '+');
  if (ops.length < 2 || !ops.some(isStrLit)) return e;
  const first = ops.findIndex(isStrLit);
  const out = first > 0 ? [`str(${ops.slice(0, first).join('+').trim()})`] : [];
  ops.slice(first).forEach((o) => out.push(isStrLit(o) || /^\s*str\(/.test(o) ? o.trim() : `str(${o.trim()})`));
  return out.join(' + ');
}

/** Output statements (println, print, printf, console.log, …) in the target language. */
function outputStmt(s, lang, ctx) {
  const m = OUT_RE.exec(s);
  if (!m) return null;
  let end = null;
  const args = splitTop(m[2], ',').map((a) => a.trim()).filter((a) => {
    const kw = /^(end|sep)\s*=\s*([\s\S]+)$/.exec(a);
    if (kw && kw[1] === 'end') end = kw[2];
    return a && !kw;
  });
  if (/printf|format/.test(m[1])) {
    if (lang === 'java') return `System.out.printf(${args.map((a) => jx(a, ctx)).join(', ')});`;
    const [f = '""', ...rest] = args;
    const fmt = mapCode(px(f, ctx), (t) => t, (lit) => lit.replace(/%n/g, '\\n'));
    return `print(${fmt}${rest.length ? ` % (${rest.map((a) => px(a, ctx)).join(', ')},)` : ''}, end="")`;
  }
  const noNewline = end !== null || /^(System\.out\.print|write)$/.test(m[1]);
  if (lang === 'java') {
    let expr = args.map((a) => jx(a, ctx)).join(' + " " + ');
    if (end !== null && !/^(""|'')$/.test(end)) expr = `${expr || '""'} + ${jx(end, ctx)}`;
    return `System.out.${noNewline ? 'print' : 'println'}(${expr});`;
  }
  const parts = args.map((a) => pyConcat(px(a, ctx)));
  if (noNewline) parts.push(`end=${end !== null ? px(end, ctx) : '""'}`);
  return `print(${parts.join(', ')})`;
}

/** One line of an instruction / call; null = leave out (imports, Scanner setup, bare declarations). */
function statement(line, lang, ctx) {
  const s = norm(line);
  if (!s || /^import\b/.test(s) || /\bnew\s+Scanner\b/.test(s)) return null;
  const out = outputStmt(s, lang, ctx);
  if (out) return out;
  if (DECL_RE.test(s) && !/=/.test(s.replace(DECL_RE, ''))) return null; // "int x;" – the variable already exists
  const body = s.replace(DECL_RE, '');
  const inc = /^(?:(\+\+|--)([A-Za-z_]\w*)|([A-Za-z_]\w*)(\+\+|--))$/.exec(body);
  if (inc) {
    const [name, op] = inc[2] ? [inc[2], inc[1]] : [inc[3], inc[4]];
    return lang === 'java' ? `${name}${op};` : `${name} ${op[0]}= 1`;
  }
  const a = ASSIGN_RE.exec(body);
  if (a) {
    if (lang === 'java') return `${a[1]} ${a[2]} ${jx(a[3], ctx)};`;
    return `${a[1]} ${a[2]} ${pyConcat(px(a[3], ctx))}`;
  }
  return lang === 'java' ? `${jx(body, ctx)};` : px(body, ctx);
}

/** A condition / value; placeholder texts become false / 0 so the program still runs. */
function cond(n, lang, ctx, fallback = 'false') {
  if (n.auto) return lang === 'java' ? `${fallback} /* ${n.text} */` : (/false/i.test(fallback) ? 'False' : fallback);
  return lang === 'java' ? jx(n.text, ctx) : px(n.text, ctx);
}

/** Case label as a constant: numbers and quoted text stay, plain words get quotes. */
function caseLabel(l, lang) {
  const s = l.trim();
  if (isStrLit(s)) return lang === 'java' && s.startsWith("'") && s.length !== 3 ? `"${s.slice(1, -1)}"` : s;
  if (/^-?\d+(\.\d+)?$/.test(s) || /^[A-Z_][A-Z0-9_]*$/.test(s) || s === 'true' || s === 'false') return s;
  return `"${s.replace(/"/g, '\\"')}"`;
}

/* ---------------- Java ---------------- */

/** Can execution continue after this element? (Java rejects unreachable code and missing returns.) */
function completes(n) {
  if (n.type === 'jump') return !/^(return|break|continue|exit|quit|halt)\b|^System\.exit/.test(norm(n.text));
  if (n.type === 'if') return n.no.length === 0 || listCompletes(n.yes) || listCompletes(n.no);
  if (n.type === 'switch') return !n.cases.some(isDefault) || n.cases.some((c) => listCompletes(c.body));
  return true;
}
const listCompletes = (list) => !list.length || completes(list[list.length - 1]);

function javaList(list, ind, ctx) {
  return list.map((n, i) => {
    const code = javaNode(n, ind, ctx);
    // a jump in the middle of a block would make the rest unreachable (compile error)
    if (i < list.length - 1 && !completes(n)) {
      const p = '    '.repeat(ind);
      return `${p}if (true) {\n${code.replace(/^(?=.)/gm, '    ')}${p}}\n`;
    }
    return code;
  }).join('');
}

function javaNode(n, ind, ctx) {
  const p = '    '.repeat(ind);
  const block = (list) => javaList(list, ind + 1, ctx);
  switch (n.type) {
    case 'instruction':
    case 'call':
      if (n.auto) return `${p}// ${n.text}\n`;
      return lines(n.text).map((l) => statement(l, 'java', ctx)).filter(Boolean).map((l) => `${p}${l}\n`).join('');
    case 'jump': {
      const s = norm(n.text);
      const r = /^return\b\s*(.*)$/.exec(s);
      if (r) return `${p}return${r[1] && ctx.fn && ctx.fn.ret !== 'void' ? ` ${jx(r[1], ctx)}` : ''};\n`;
      if (/^(break|continue)$/.test(s)) return `${p}${s};\n`;
      if (/^(exit|quit|halt)\b|^System\.exit/.test(s)) return `${p}System.exit(0);\n`;
      return `${p}${statement(s, 'java', ctx) || ';'}\n`;
    }
    // Java rejects "while (false)" (unreachable body), Boolean.FALSE is not a constant
    case 'while': return `${p}while (${cond(n, 'java', ctx, 'Boolean.FALSE')}) {\n${block(n.body)}${p}}\n`;
    case 'dowhile': return `${p}do {\n${block(n.body)}${p}} while (${cond(n, 'java', ctx)});\n`;
    case 'for': {
      const f = parseFor(n.text);
      if (f?.kind === 'range') {
        const neg = isNegative(f.step);
        const upd = f.step === '1' ? `${f.v}++` : f.step === '-1' ? `${f.v}--` : `${f.v} += ${jx(f.step, ctx)}`;
        return `${p}for (${f.v} = ${jx(f.from, ctx)}; ${f.v} ${neg ? '>=' : '<='} ${jx(f.to, ctx)}; ${upd}) {\n${block(n.body)}${p}}\n`;
      }
      if (f?.kind === 'c') {
        const init = statement(f.init, 'java', ctx)?.replace(/;$/, '') || '';
        const upd = f.update.split(',').map((u) => statement(u, 'java', ctx)?.replace(/;$/, '')).filter(Boolean).join(', ');
        return `${p}for (${init}; ${jx(f.cond, ctx)}; ${upd}) {\n${block(n.body)}${p}}\n`;
      }
      if (f?.kind === 'in') return `${p}for (var ${f.v} : ${jx(f.iter, ctx)}) {\n${block(n.body)}${p}}\n`;
      return `${p}// ${n.text}\n${p}{\n${block(n.body)}${p}}\n`;
    }
    case 'if': {
      let out = `${p}if (${cond(n, 'java', ctx)}) {\n${block(n.yes)}${p}}`;
      out += n.no.length ? ` else {\n${block(n.no)}${p}}\n` : '\n';
      return out;
    }
    case 'switch': {
      let out = `${p}switch (${cond(n, 'java', ctx, '0')}) {\n`;
      n.cases.forEach((c) => {
        out += isDefault(c)
          ? `${p}    default:\n`
          : c.label.split(',').map((l) => `${p}    case ${caseLabel(l, 'java')}:\n`).join('');
        out += javaList(c.body, ind + 2, ctx);
        if (listCompletes(c.body)) out += `${p}        break;\n`;
      });
      return `${out}${p}}\n`;
    }
    case 'parallel': {
      const ts = n.threads.map((t, i) => `t${ind}_${i + 1}`);
      let out = `${p}{ // ${n.text || 'parallel'}\n`;
      n.threads.forEach((t, i) => {
        out += `${p}    Thread ${ts[i]} = new Thread(() -> {\n${javaList(t, ind + 2, ctx)}${p}    });\n`;
      });
      out += `${p}    ${ts.map((t) => `${t}.start();`).join(' ')}\n`;
      out += `${p}    try { ${ts.map((t) => `${t}.join();`).join(' ')} } catch (InterruptedException e) { }\n`;
      return `${out}${p}}\n`;
    }
  }
  return '';
}

const JAVA_HELPERS = {
  input: [
    '    static String input() {\n        return scanner.hasNextLine() ? scanner.nextLine() : "";\n    }',
    '    static String input(Object prompt) {\n        System.out.print(prompt);\n        return input();\n    }',
  ],
  toInt: ['    static int toInt(Object o) {\n        return o instanceof Number n ? n.intValue() : (int) Double.parseDouble(o.toString().trim());\n    }'],
  toDouble: ['    static double toDouble(Object o) {\n        return o instanceof Number n ? n.doubleValue() : Double.parseDouble(o.toString().trim());\n    }'],
  len: ['    static int len(Object o) {\n        return o instanceof String s ? s.length() : ((java.util.Collection<?>) o).size();\n    }'],
  range: [
    '    static int[] range(int end) {\n        return range(0, end, 1);\n    }',
    '    static int[] range(int start, int end) {\n        return range(start, end, 1);\n    }',
    '    static int[] range(int start, int end, int step) {\n        return java.util.stream.IntStream.iterate(start, i -> step > 0 ? i < end : i > end, i -> i + step).toArray();\n    }',
  ],
};

function generateJava() {
  const ctx = analyze();
  const methods = project.diagrams.map((d, i) => {
    if (i === 0) {
      ctx.fn = null;
      return `    // ${d.name}\n    public static void main(String[] args) {\n${javaList(d.body, 2, ctx)}    }\n`;
    }
    const f = ctx.funcs.get(signature(d).name);
    ctx.fn = f;
    let body = javaList(d.body, 2, ctx);
    if (f.ret !== 'void' && listCompletes(d.body)) body += `        return ${DEFAULT_VALUE.java[f.ret]};\n`;
    const params = f.params.map((p, j) => `${f.paramTypes[j]} ${p}`).join(', ');
    return `    // ${d.name}\n    static ${f.ret} ${f.name}(${params}) {\n${body}    }\n`;
  });
  const code = methods.join('\n');
  const used = (name) => new RegExp(`(^|[^.\\w])${name}\\(`).test(code) && !ctx.funcs.has(name);
  const helpers = Object.keys(JAVA_HELPERS).filter(used).flatMap((k) => JAVA_HELPERS[k]);
  const fields = [...ctx.types].map(([k, t]) => `    static ${t} ${k}${t === 'String' ? ' = ""' : ''};\n`).join('');
  return `// ${project.title} – save as Main.java, then run: java Main.java\n`
    + (used('input') ? 'import java.util.Scanner;\n\n' : '\n')
    + 'public class Main {\n'
    + (used('input') ? '    static Scanner scanner = new Scanner(System.in);\n' : '')
    + fields
    + (fields || used('input') ? '\n' : '')
    + code
    + (helpers.length ? `\n${helpers.join('\n\n')}\n` : '')
    + '}\n';
}

/* ---------------- Python ---------------- */

function pyList(list, ind, ctx) {
  if (!list.length) return `${'    '.repeat(ind)}pass\n`;
  return list.map((n) => pyNode(n, ind, ctx)).join('');
}

function pyNode(n, ind, ctx) {
  const p = '    '.repeat(ind);
  const block = (list) => pyList(list, ind + 1, ctx);
  switch (n.type) {
    case 'instruction':
    case 'call': {
      if (n.auto) return `${p}pass  # ${n.text}\n`;
      const out = lines(n.text).map((l) => statement(l, 'python', ctx)).filter(Boolean);
      return out.length ? out.map((l) => `${p}${l}\n`).join('') : `${p}pass\n`;
    }
    case 'jump': {
      const s = norm(n.text);
      const r = /^return\b\s*(.*)$/.exec(s);
      if (r) return `${p}return${r[1] ? ` ${px(r[1], ctx)}` : ''}\n`;
      if (/^(break|continue)$/.test(s)) return `${p}${s}\n`;
      if (/^(exit|quit|halt)\b|^System\.exit/.test(s)) return `${p}sys.exit()\n`;
      return `${p}${statement(s, 'python', ctx) || 'pass'}\n`;
    }
    case 'while': return `${p}while ${cond(n, 'python', ctx)}:${n.auto ? `  # ${n.text}` : ''}\n${block(n.body)}`;
    case 'dowhile':
      return `${p}while True:\n${pyList(n.body, ind + 1, ctx)}${p}    if not (${cond(n, 'python', ctx)}):\n${p}        break\n`;
    case 'for': {
      const f = parseFor(n.text);
      if (f?.kind === 'range') {
        const neg = isNegative(f.step);
        const to = px(f.to, ctx);
        const end = /^-?\d+$/.test(f.to) ? String(Number(f.to) + (neg ? -1 : 1)) : `${to} ${neg ? '-' : '+'} 1`;
        return `${p}for ${f.v} in range(${px(f.from, ctx)}, ${end}${f.step === '1' ? '' : `, ${px(f.step, ctx)}`}):\n${block(n.body)}`;
      }
      if (f?.kind === 'c') { // init, then a while loop with the update at the end
        const init = statement(f.init, 'python', ctx);
        const upd = f.update.split(',').map((u) => statement(u, 'python', ctx)).filter(Boolean);
        return `${init ? `${p}${init}\n` : ''}${p}while ${px(f.cond, ctx)}:\n`
          + `${n.body.length ? pyList(n.body, ind + 1, ctx) : ''}${upd.map((u) => `${p}    ${u}\n`).join('') || `${p}    pass\n`}`;
      }
      if (f?.kind === 'in') return `${p}for ${f.v} in ${px(f.iter, ctx)}:\n${block(n.body)}`;
      return `${p}# ${n.text}\n${pyList(n.body, ind, ctx)}`;
    }
    case 'if': {
      let out = `${p}if ${cond(n, 'python', ctx)}:${n.auto ? `  # ${n.text}` : ''}\n${block(n.yes)}`;
      if (n.no.length) out += `${p}else:\n${block(n.no)}`;
      return out;
    }
    case 'switch': {
      let out = `${p}match ${cond(n, 'python', ctx, '0')}:\n`;
      n.cases.forEach((c) => {
        const label = isDefault(c) ? '_' : c.label.split(',').map((l) => caseLabel(l, 'python')).join(' | ');
        out += `${p}    case ${label}:\n${pyList(c.body, ind + 2, ctx)}`;
      });
      return out;
    }
    case 'parallel': {
      const fs = n.threads.map((t, i) => `thread_${ind}_${i + 1}`);
      let out = `${p}# ${n.text || 'parallel'}\n`;
      n.threads.forEach((t, i) => {
        out += `${p}def ${fs[i]}():\n${pyGlobals(ind + 1, ctx, [])}${pyList(t, ind + 1, ctx)}`;
      });
      out += `${p}threads = [threading.Thread(target=f) for f in (${fs.join(', ')})]\n`;
      out += `${p}for t in threads:\n${p}    t.start()\n${p}for t in threads:\n${p}    t.join()\n`;
      return out;
    }
  }
  return '';
}

/** "global a, b" so a function changes the shared variables instead of local copies. */
function pyGlobals(ind, ctx, params) {
  const names = [...ctx.types.keys()].filter((k) => !params.includes(k));
  return names.length ? `${'    '.repeat(ind)}global ${names.join(', ')}\n` : '';
}

function generatePython() {
  const ctx = analyze();
  const defs = project.diagrams.map((d, i) => {
    if (i === 0) return `# ${d.name}\ndef main():\n${pyGlobals(1, ctx, [])}${pyList(d.body, 1, ctx)}`;
    const f = ctx.funcs.get(signature(d).name);
    return `# ${d.name}\ndef ${f.name}(${f.params.join(', ')}):\n${pyGlobals(1, ctx, f.params)}${pyList(d.body, 1, ctx)}`;
  });
  // main first in the file is fine: functions are looked up when main() runs
  const code = defs.join('\n\n');
  const imports = ['math', 'random', 'sys', 'threading'].filter((m) => new RegExp(`\\b${m}\\.`).test(code));
  const globals = [...ctx.types].map(([k, t]) => `${k} = ${DEFAULT_VALUE.python[t]}\n`).join('');
  return `# ${project.title} – run: python3 ${ident(project.title || 'program')}.py\n`
    + (imports.length ? `${imports.map((m) => `import ${m}`).join('\n')}\n` : '')
    + (globals ? `\n${globals}` : '')
    + `\n\n${code}\n\nif __name__ == "__main__":\n    main()\n`;
}

function generate(lang) {
  return lang === 'java' ? generateJava() : generatePython();
}
