// ============================================================
//  Arcus M Checkliste — Service Worker v1
//  Strategy: Cache-first for all app shell assets,
//            stale-while-revalidate for everything else.
// ============================================================

const CACHE_NAME = 'arcus-checkliste-v19';

// All files that make up the app shell (adjust if you rename files)
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './Config.csv',
  './icons/icon-192.png',
  './icons/icon-512.png'
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
    })
  );
  // Skip waiting only on first-ever install (no previous controller).
  // On updates, we wait for the user to tap "Jetzt laden".
  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
      .then(clients => {
        // If no clients are controlled by a SW yet, this is a fresh install
        const isFirstInstall = clients.every(c => !c.url.includes('sw.js'));
        if (isFirstInstall) self.skipWaiting();
      })
  );
});

// ── Activate: delete old caches and claim clients ───────────
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
     .then(async () => {
       // Broadcast to all open windows/tabs that a new version is active.
       // This allows the app to show the update banner even on mobile PWAs
       // where updatefound / controllerchange may not fire reliably.
       const allClients = await self.clients.matchAll({ type: 'window' });
       allClients.forEach(client => {
         client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
       });
     })
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
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Client is asking if there's a newer SW waiting — respond
    event.source?.postMessage({ type: 'UPDATE_STATUS', waiting: !!self.registration.waiting });
  }
});
