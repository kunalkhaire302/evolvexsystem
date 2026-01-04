const CACHE_NAME = 'evolvex-system-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/css/style.css',
    '/css/landing-layout.css',
    '/js/dashboard.js',
    '/js/api.js'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
