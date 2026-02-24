// Barnes Lake Fishing — Service Worker
// Production-quality offline-first PWA support

const CACHE_NAME = 'barnes-lake-v4';
const TILE_CACHE = 'barnes-lake-tiles-v2';
const MAX_TILES = 500;

// App shell resources to pre-cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.svg'
];

// CDN resources — stale-while-revalidate
const CDN_HOSTS = [
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com'
];

// API hosts — network-first
const API_HOSTS = [
  'api.open-meteo.com',
  'open-meteo.com'
];

// Tile hosts — cache with LRU eviction
const TILE_HOSTS = [
  'tile.openstreetmap.org',
  'tiles.stadiamaps.com',
  'basemaps.cartocdn.com',
  'a.tile.',
  'b.tile.',
  'c.tile.',
  'demotiles.maplibre.org'
];

// ─── Install ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Pre-cache app shell; don't fail install if individual resources 404
        return Promise.allSettled(
          APP_SHELL.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to pre-cache: ${url}`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] App shell cached, skipping waiting');
        return self.skipWaiting();
      })
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const keepCaches = new Set([CACHE_NAME, TILE_CACHE]);

  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => !keepCaches.has(name))
            .map((name) => {
              console.log(`[SW] Evicting old cache: ${name}`);
              return caches.delete(name);
            })
        )
      )
      .then(() => {
        console.log('[SW] Activated, claiming clients');
        return self.clients.claim();
      })
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Route to appropriate strategy
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request, CACHE_NAME));
  } else if (isTileRequest(url)) {
    event.respondWith(tileStrategy(event.request));
  } else if (isCdnRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
  } else if (event.request.mode === 'navigate') {
    event.respondWith(navigationStrategy(event.request));
  } else {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
  }
});

// ─── URL Classification ────────────────────────────────────────────────────

function isApiRequest(url) {
  return API_HOSTS.some((host) => url.hostname.includes(host));
}

function isTileRequest(url) {
  return TILE_HOSTS.some((host) => url.hostname.includes(host)) ||
    /\/\d+\/\d+\/\d+\.(png|jpg|jpeg|webp|pbf|mvt)/.test(url.pathname);
}

function isCdnRequest(url) {
  return CDN_HOSTS.some((host) => url.hostname.includes(host));
}

// ─── Strategies ─────────────────────────────────────────────────────────────

// Network-first: try network, fall back to cache
async function networkFirst(request, cacheName) {
  try {
    const response = await fetchWithTimeout(request, 8000);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) {
      console.log(`[SW] Network failed, serving cached: ${request.url}`);
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache-first: serve from cache, fall back to network
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(request, 10000);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

// Stale-while-revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetchWithTimeout(request, 10000)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  return cached || await networkPromise || new Response('', { status: 504 });
}

// Navigation: network-first, offline fallback to cached index.html
async function navigationStrategy(request) {
  try {
    const response = await fetchWithTimeout(request, 8000);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await caches.match('/index.html');
    if (cached) {
      console.log('[SW] Offline — serving cached index.html');
      return cached;
    }
    return new Response(
      '<!DOCTYPE html><html><body style="background:#0c1220;color:#e0e0e0;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1>Barnes Lake Fishing</h1><p>You are offline and the app has not been cached yet.</p><p>Please connect to the internet and reload.</p></div></body></html>',
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Tile strategy: cache-first with LRU eviction at MAX_TILES
async function tileStrategy(request) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetchWithTimeout(request, 15000);
    if (response.ok) {
      // Evict old tiles if over limit
      enforceTileLimit(cache).catch(() => {});
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    // Transparent 1x1 PNG for missing tiles (prevents broken images)
    return new Response(
      Uint8Array.from(atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB' +
        'Nl7BcQAAAABJRU5ErkJggg=='
      ), (c) => c.charCodeAt(0)),
      { status: 200, headers: { 'Content-Type': 'image/png' } }
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Fetch with timeout
function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error('Fetch timeout'));
    }, ms);

    fetch(request, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Enforce tile cache limit with LRU eviction
async function enforceTileLimit(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) {
    // Evict oldest 20% when limit exceeded
    const evictCount = Math.floor(MAX_TILES * 0.2);
    const toEvict = keys.slice(0, evictCount);
    await Promise.all(toEvict.map((key) => cache.delete(key)));
    console.log(`[SW] Evicted ${toEvict.length} tiles (${keys.length} → ${keys.length - toEvict.length})`);
  }
}
