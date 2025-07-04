const CACHE_NAME = 'message50-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_VERSION = 1.0001;


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


self.addEventListener('fetch', (event) => {
    const { request } = event;
  
    event.respondWith((async () => {
      if (request.mode === 'navigate') {
        try {
          // Try to use navigation preload if available
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
  
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.warn('Navigation fetch failed, trying cache or offline page:', error);
  
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request);
          const offlineResponse = await cache.match(OFFLINE_URL);
  
          return cachedResponse || offlineResponse;
        }
      }
  
      // Cache First strategy for static assets
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
  
      try {
        // Only cache certain request types
        if (!['script', 'style', 'image', 'font'].includes(request.destination)) {
          return fetch(request);
        }
  
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;

      } catch (error) {
        console.error('Static asset fetch failed, returning offline fallback if possible:', error);
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_URL);
      }
    })());
  });


// Update the Service Worker and clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil( (async _ => {
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