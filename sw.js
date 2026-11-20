'use strict';
/* Offline support: the app shell is cached on install; pages are fetched fresh
   when online (cache as fallback), other files are served from the cache and
   refreshed in the background. Bump VERSION whenever a precached file changes. */

const VERSION = 'v2';
const CACHE = `structorizer-${VERSION}`;
const SHELL = [
  './',
  'index.html',
  'style.css?v=7',
  'i18n.js?v=8',
  'app.js?v=9',
  'run.js?v=1',
  'favicon.svg',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
];
// Third-party hosts whose files may be cached (fonts, libraries) – never analytics
const CACHEABLE_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('structorizer-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  if (!sameOrigin && !CACHEABLE_HOSTS.includes(url.hostname)) return; // e.g. Google Analytics

  if (req.mode === 'navigate') {
    // network first, so a new version shows up right away when online
    e.respondWith(
      fetch(req)
        .then((res) => { put(req, res.clone()); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./'))),
    );
    return;
  }

  // stale-while-revalidate
  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => { put(req, res.clone()); return res; });
      if (cached) { e.waitUntil(fresh.catch(() => {})); return cached; }
      return fresh;
    }),
  );
});

function put(req, res) {
  if (res.ok || res.type === 'opaque') caches.open(CACHE).then((c) => c.put(req, res));
}
