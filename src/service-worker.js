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
        '/',
        '/index.html',
        '/login.html',
        '/register.html',
        '/app.html',
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
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    const {request} = event;
    
    event.respondWith((async () => {
        if (request.mode === 'navigate') {
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
                const cachedResponse = await caches.match(request);
                const offlineView = await cache.match(OFFLINE_URL);

                return cachedResponse ?? offlineView;
            }
        }
        
        // If no fetch handlers call event.respondWith(), 
        // the request will be handled by the browser as if there
        // were no service worker involvement.
        
        // Cache First for static assets (JS, CSS, images, etc.)
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
            return response;

        } catch (error) {
            console.error('Fetch failed; returning offline page instead.', error);
            const cache = await caches.open(CACHE_NAME);
            return cache.match(OFFLINE_URL);
        }

    })())
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