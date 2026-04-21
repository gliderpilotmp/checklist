// ============================================================
//  Arcus M Checkliste — Service Worker v1
//  Strategy: Cache-first for all app shell assets,
//            stale-while-revalidate for everything else.
// ============================================================

const CACHE_NAME = 'arcus-checkliste-v1';

// All files that make up the app shell (adjust if you rename files)
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

// ── Install: pre-cache app shell ────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll throws if any request fails; use individual adds
      // so a single 404 doesn't break the whole install.
      return Promise.allSettled(
        APP_SHELL.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Could not cache', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ─────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first with network fallback ─────────────────
self.addEventListener('fetch', event => {
  // Only handle GET requests for our own origin
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve from cache, update in background (stale-while-revalidate)
        const networkFetch = fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {}); // ignore network errors in background
        // Suppress unused promise lint warning
        void networkFetch;
        return cached;
      }

      // Not in cache → fetch from network and cache it
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback: for navigation requests return cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── Message: force update on demand ─────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
