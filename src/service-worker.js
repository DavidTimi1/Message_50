const CACHE_NAME = 'message50-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_VERSION = 1.0003;
const BACKEND_API_PREFIX = '/api';


// Fetch the manifest and cache the assets
async function cacheAssets() {
  const cache = await caches.open(CACHE_NAME);

  // Fetch the manifest.json file
  const response = await fetch('/.vite/manifest.json');
  const manifest = await response.json();

  // Extract the asset URLs from the manifest
  const assetsToCache = Object.values(manifest).map(entry => entry.file);

  // Add additional static assets (e.g., HTML files)
  const staticAssets = [
    '/index.html',
    '/login',
    '/register',
    '/app',
    '/offline.html', // included offline file
    '/favicon.ico',
    '/apple-touch-icon.png',
    'logo.svg',
    '/logo.png',
    '/msg-bubble.png',
    '/user-icon.svg',
    '/manifest.json'
  ];

  // Cache all assets
  return cache.addAll([...staticAssets, ...assetsToCache]);
}


// Install the Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    cacheAssets().catch((error) => {
      console.error('Failed to cache assets:', error);
    })
  );
});


// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // Bypass the service worker for all API requests
  if (requestUrl.pathname.startsWith(BACKEND_API_PREFIX)) {
    event.respondWith(fetch(request));
    return;
  }

  // Always fetch navigation requests from the network first
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          return await fetch(request);
        } catch (error) {
          // If network fails for navigation, serve offline page from cache
          console.error('Navigation fetch failed, serving offline page:', error);
          return caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // Cache-first strategy for all other resources (scripts, styles, images)
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);
        // Don't cache opaque responses or POST requests
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache the new resource
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());

        return networkResponse;
      } catch (error) {
        // Return a generic fallback if a static asset fetch fails
        console.error('Static asset fetch failed, returning offline fallback:', error);
        return caches.match('/offline.html');
      }
    })()
  );
});

// Update the Service Worker and clear old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil((async _ => {
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    };

    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  })());
});