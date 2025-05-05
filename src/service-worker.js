const CACHE_NAME = 'message50-cache-v1';
const urlsToCache = [
    '/',
    '/app',
    '/app/contacts',
    '/app/media',
    '/app/settings',
    '/manifest.json',
    '/favicon.ico',
    '/apple-touch-icon.png',
    'logo.svg',
    '/msg-bubble.png',
    '/logo.png',
    '/e2ee-placeholder.jpg',
    '/multidevice-gif.gif',
    '/instant-messaging.gif',
    '/attachment-menu.png'
    // Add other static assets here
];

// Install the Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch resources from the cache or network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Update the Service Worker and clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});