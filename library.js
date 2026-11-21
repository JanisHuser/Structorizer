'use strict';

/* =========================================================
   Libraries: collections of examples and exercises in a repository
   (folder of files at a URL). No DOM – also used by the library checker.

   repository.json  { format, id, title: {en, de, …}, chapters: [{ id, title, entries: ["basics/sum", …] }],
                      includes: [], submissions: null }
   <entry>/README.md, README.<lang>.md   front matter (title, kind: example | exercise) + Markdown
   <entry>/diagram.struct                example
   <entry>/starter.struct, solution.struct, tests.json   exercise
   ========================================================= */

const LIBRARY_FORMAT = 1;
const DEFAULT_LIBRARY = '../structorizer-library/repository.json';

class LibraryError extends Error {}

async function fetchTextDefault(url) {
  const res = await fetch(url);
  if (!res.ok) throw Object.assign(new LibraryError(`${res.status} ${url}`), { status: res.status });
  return res.text();
}

/** Text in the language, else English, else the first one there is. */
function pickLang(texts, l) {
  if (!texts || typeof texts === 'string') return texts || '';
  return texts[l] ?? texts.en ?? Object.values(texts)[0] ?? '';
}

/** "---\nkey: value\n---\nbody" → { meta, body }. Values are JSON when they parse, else text. */
function parseFrontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  m[1].split(/\r?\n/).forEach((line) => {
    const i = line.indexOf(':');
    if (i < 1) return;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    try { meta[k] = JSON.parse(v); } catch (e) { meta[k] = v; }
  });
  return { meta, body: text.slice(m[0].length) };
}

/* ---------------- Markdown (small subset, HTML is escaped) ---------------- */

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function inlineMarkdown(text) {
  const codes = [];
  let s = escapeHtml(text).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const u = url.replace(/&amp;/g, '&');
      if (!/^(https?:\/\/|\.{0,2}\/|#|[\w-]+(\.[\w-]+)*(\/|$))/i.test(u) || /^\s*javascript:/i.test(u)) return label;
      return `<a href="${escapeHtml(u)}" target="_blank" rel="noopener">${label}</a>`;
    });
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => `<code>${codes[i]}</code>`);
}

/** Markdown → HTML: headings, paragraphs, lists, code blocks, `code`, **bold**, *italic*, [links](url). */
function markdown(md) {
  const out = [];
  const src = String(md || '').replace(/\r/g, '').split('\n');
  let para = [];
  let list = null; // { tag, items }
  const flush = () => {
    if (para.length) { out.push(`<p>${inlineMarkdown(para.join(' '))}</p>`); para = []; }
    if (list) { out.push(`<${list.tag}>${list.items.map((x) => `<li>${inlineMarkdown(x)}</li>`).join('')}</${list.tag}>`); list = null; }
  };
  for (let i = 0; i < src.length; i++) {
    const line = src[i];
    if (/^```/.test(line)) {
      flush();
      const code = [];
      while (++i < src.length && !/^```/.test(src[i])) code.push(src[i]);
      out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    const li = /^\s*([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (h) { flush(); out.push(`<h${h[1].length + 2}>${inlineMarkdown(h[2])}</h${h[1].length + 2}>`); } else if (li) {
      const tag = /\d/.test(li[1]) ? 'ol' : 'ul';
      if (para.length || (list && list.tag !== tag)) flush();
      list ??= { tag, items: [] };
      list.items.push(li[2]);
    } else if (!line.trim()) flush();
    else if (list && /^\s+/.test(line)) list.items[list.items.length - 1] += ` ${line.trim()}`;
    else { if (list) flush(); para.push(line.trim()); }
  }
  flush();
  return out.join('\n');
}

/** First paragraph as plain text (the one-line summary in lists). */
function summaryOf(body) {
  const first = String(body || '').trim().split(/\n\s*\n/)[0] || '';
  return first.replace(/[*_`#]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
}

/* ---------------- loading ---------------- */

/** Load a library: repository.json plus every entry's README in the language l.
    Resolves to { url, id, title, chapters: [{ id, title, entries: [entry] }], entries: Map, includes, submissions }. */
async function loadLibrary(url, { lang: l = 'en', fetchText = fetchTextDefault } = {}) {
  const base = new URL(url, typeof location !== 'undefined' ? location.href : undefined).href;
  let repo;
  try { repo = JSON.parse(await fetchText(base)); } catch (e) {
    throw e instanceof LibraryError ? e : new LibraryError(`repository.json: ${e.message}`);
  }
  if (!repo || typeof repo !== 'object' || !Array.isArray(repo.chapters)) throw new LibraryError('repository.json: no chapters');
  if (repo.format > LIBRARY_FORMAT) throw Object.assign(new LibraryError('newer format'), { newer: true });
  const lib = {
    url: base, id: String(repo.id || base), title: pickLang(repo.title, l), titles: repo.title,
    includes: repo.includes || [], submissions: repo.submissions || null, chapters: [], entries: new Map(),
  };
  const fetchFile = (entry, name) => fetchText(new URL(`${entry.path}/${name}`, base).href);
  lib.file = fetchFile;
  await Promise.all(repo.chapters.map(async (c, ci) => {
    const chapter = { id: c.id, title: pickLang(c.title, l), entries: [] };
    lib.chapters[ci] = chapter;
    const entries = await Promise.all((c.entries || []).map(async (p) => {
      const path = String(p).replace(/^\/+|\/+$/g, '');
      const entry = { library: lib.id, path, key: `${lib.id}/${path}`, chapter: chapter.id };
      let text;
      try {
        text = l !== 'en' ? await fetchFile(entry, `README.${l}.md`).catch(() => fetchFile(entry, 'README.md')) : await fetchFile(entry, 'README.md');
      } catch (e) {
        return { ...entry, broken: true, kind: 'example', title: path, summary: e.message, body: '', meta: {} };
      }
      const { meta, body } = parseFrontMatter(text);
      return { ...entry, kind: meta.kind === 'exercise' ? 'exercise' : 'example', title: String(meta.title || path), summary: summaryOf(body), body, meta };
    }));
    chapter.entries = entries;
    entries.forEach((e) => lib.entries.set(e.path, e));
  }));
  return lib;
}

/** A .struct file of an entry as a project, or null if the entry has none. */
async function loadEntryProject(lib, entry, name) {
  let text;
  try { text = await lib.file(entry, name); } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
  const data = JSON.parse(text);
  const p = data.project || data;
  if (!Array.isArray(p.diagrams)) throw new LibraryError(`${entry.path}/${name}: no diagrams`);
  return p;
}

async function loadEntryTests(lib, entry) {
  return JSON.parse(await lib.file(entry, 'tests.json'));
}
