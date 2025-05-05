const CACHE_NAME = 'message50-cache-v1';

const staticAssets = Object.keys(
    import.meta.glob([
      '/index.html',
      '/offlne.html',
      '/app/index.html',
      '/login/index.html',
      '/register/index.html',
      '/assets/**/*.js',
      '/assets/**/*.css',
      '/assets/**/*.{woff2,png,jpg,svg,ico}',
    ], { as: 'url' })
  );

  
// Install the Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(staticAssets);
        })
    );
});


self.addEventListener('fetch', (event) => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.

    if (event.request.mode === 'navigate') {
      event.respondWith((async () => {
        try {
            // First, try to use the navigation preload response if it's supported.
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) {
                return preloadResponse;
            }
            
            const networkResponse = await fetch(request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;

        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
  
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await caches.match(event.request);
          const offlineView = await cache.match(OFFLINE_URL);

          return cachedResponse ?? offlineView;
        }
      })());
    }

    // If no fetch handlers call event.respondWith(), 
    // the request will be handled by the browser as if there
    // were no service worker involvement.
    
    // Cache First for static assets (JS, CSS, images, etc.)
    event.respondWith(
        caches.match(request).then((cached) => {
        return (
            cached ||
            fetch(request).then((response) => {
            return caches.open(CACHE_NAME).then(async (cache) => {
                cache.put(request, response.clone());
                return response;
            });
            })
        );
        })
    );
});

// Update the Service Worker and clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil( async _ => {
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
        }
    );
});