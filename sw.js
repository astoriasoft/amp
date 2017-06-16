'use strict';

var dataCacheName = 'pwaTestData-v1';
var CACHE_NAME = 'pwaTestfinal-1';
var resourcesToCache = [    
    '/amp/',    
    '/amp/scripts/main.js',    
    '/amp/styles/index.css',    
    '/amp/images/icon.png',
    '/amp/images/badge.png',
    '/amp/images/static/48.png',
    '/amp/images/static/72.png',
    '/amp/images/static/96.png',
    '/amp/images/static/144.png',
    '/amp/images/static/168.png',
    '/amp/images/static/192.png',
    '/amp/images/static/any.svg'
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(resourcesToCache);
        })
    );
});

//self.addEventListener('activate', function (e) {
//    console.log('[ServiceWorker] Activate');
//    e.waitUntil(
//        caches.keys().then(function (keyList) {
//            return Promise.all(keyList.map(function (key) {
//                if (key !== cacheName && key !== dataCacheName) {
//                    console.log('[ServiceWorker] Removing old cache', key);
//                    return caches.delete(key);
//                }
//            }));
//        })
//    );

    self.addEventListener('fetch', function (event) {
        event.respondWith(
            // try to find corresponding response in the cache
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        // cache hit: return cached result
                        return response;
                    }

                    // not found: fetch resource from the server
                    return fetch(event.request);
                })
        );
    });

self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: 'Yay it works.',
        icon: '/amp/images/icon.png',
        badge: '/amp/images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});

