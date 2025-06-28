/* Jyotish Shastra Enhanced Service Worker v3.0
 * Advanced PWA features for optimal offline experience and performance
 */

const CACHE_NAME = 'jyotish-shastra-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const API_CACHE = 'api-v1.0.0';
const IMAGES_CACHE = 'jyotish-images-v3.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-144x144.png',
  // Essential fonts for offline viewing
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap',
  // Core application routes
  '/chart',
  '/analysis',
  '/report'
];

// Dynamic content patterns with enhanced classification
const CACHE_PATTERNS = {
  api: /^https?:\/\/.*\/api\/.*/,
  charts: /^https?:\/\/.*\/(chart|analysis|report)/,
  images: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  fonts: /\.(?:woff|woff2|ttf|eot)$/,
  styles: /\.css$/,
  scripts: /\.js$/,
  static: /\.(html|css|js|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/
};

// Enhanced cache strategies with TTL
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Cache TTL configurations (in milliseconds)
const CACHE_TTL = {
  API: 5 * 60 * 1000,      // 5 minutes
  IMAGES: 24 * 60 * 60 * 1000, // 24 hours
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  DYNAMIC: 60 * 60 * 1000   // 1 hour
};

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/chart',
  '/api/analysis',
  '/api/geocoding',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate strategies
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isAPIRequest(url)) {
      event.respondWith(networkFirst(request, API_CACHE));
    } else if (isNavigationRequest(request)) {
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    } else {
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
  }
});

// Caching Strategies

// Cache First - for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return getOfflineFallback(request);
  }
}

// Network First - for API requests
async function networkFirst(request, cacheName) {
  try {
    console.log('[SW] Network first for:', request.url);
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return getOfflineFallback(request);
  }
}

// Stale While Revalidate - for dynamic content
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise || getOfflineFallback(request);
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.includes('/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.webp');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Offline fallback
function getOfflineFallback(request) {
  if (isNavigationRequest(request)) {
    return caches.match('/') || new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Jyotish Shastra</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #FF9933 0%, #800000 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
          }
          .offline-container {
            max-width: 400px;
            padding: 2rem;
          }
          .om-symbol {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.8;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          p {
            font-size: 1.1rem;
            line-height: 1.6;
            opacity: 0.9;
          }
          .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 1.5rem;
            transition: all 0.3s ease;
          }
          .retry-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="om-symbol">ॐ</div>
          <h1>You're Offline</h1>
          <p>The cosmic connection has been temporarily disrupted. Please check your internet connection and try again.</p>
          <button class="retry-btn" onclick="window.location.reload()">
            Reconnect to the Universe
          </button>
        </div>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  return new Response('Offline', { status: 503 });
}

// Background Sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'birth-data-sync') {
    event.waitUntil(syncBirthData());
  } else if (event.tag === 'analysis-request-sync') {
    event.waitUntil(syncAnalysisRequests());
  }
});

// Background sync functions
async function syncBirthData() {
  try {
    const db = await openDB();
    const tx = db.transaction(['pending-birth-data'], 'readonly');
    const store = tx.objectStore('pending-birth-data');
    const pendingData = await store.getAll();

    for (const data of pendingData) {
      try {
        const response = await fetch('/api/chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.payload)
        });

        if (response.ok) {
          // Remove from pending queue
          const deleteTx = db.transaction(['pending-birth-data'], 'readwrite');
          const deleteStore = deleteTx.objectStore('pending-birth-data');
          await deleteStore.delete(data.id);

                     // Notify client of successful sync
           const responseData = await response.json();
           self.clients.matchAll().then(clients => {
             clients.forEach(client => {
               client.postMessage({
                 type: 'SYNC_SUCCESS',
                 data: { id: data.id, response: responseData }
               });
             });
           });
        }
      } catch (error) {
        console.error('[SW] Failed to sync birth data:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncAnalysisRequests() {
  // Similar implementation for analysis requests
  console.log('[SW] Syncing analysis requests...');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: 'Your daily cosmic insights are ready!',
    icon: '/icons/icon-144x144.png',
    badge: '/icons/icon-144x144.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Insights',
        icon: '/icons/icon-144x144.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-144x144.png'
      }
    ],
    requireInteraction: true,
    tag: 'daily-insights'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.body || options.body;
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.error('[SW] Failed to parse push payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Jyotish Shastra', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Cache management utilities
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name =>
    !name.includes('v1.0.0') &&
    (name.includes('jyotish-shastra') || name.includes('static') || name.includes('dynamic') || name.includes('api'))
  );

  return Promise.all(oldCaches.map(name => caches.delete(name)));
}

// IndexedDB helper for background sync
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('jyotish-shastra-sync', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('pending-birth-data')) {
        db.createObjectStore('pending-birth-data', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('pending-analysis')) {
        db.createObjectStore('pending-analysis', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  } else if (event.data && event.data.type === 'CLEANUP_CACHES') {
    event.waitUntil(cleanupOldCaches());
  }
});

// Periodic cache cleanup (when supported)
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  // Schedule periodic cleanup
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
      event.waitUntil(cleanupOldCaches());
    }
  });
}

console.log('[SW] Service worker script loaded successfully');
