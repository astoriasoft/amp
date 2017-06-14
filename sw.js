/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

var dataCacheName = 'pwaTestData-v1';
var cacheName = 'pwaTestfinal-1';
var filesToCache = [
    'https://astoriasoft.github.io/amp/',
    'https://astoriasoft.github.io/amp/index.html',
    'https://astoriasoft.github.io/amp/scripts/main.js',
    'https://astoriasoft.github.io/amp/styles/index.css',    
    'https://astoriasoft.github.io/amp/images/icon.png',
    'https://astoriasoft.github.io/amp/images/badge.png',
    'https://astoriasoft.github.io/amp/images/static/48.png',
    'https://astoriasoft.github.io/amp/images/static/72.png',
    'https://astoriasoft.github.io/amp/images/static/96.png',
    'https://astoriasoft.github.io/amp/images/static/144.png',
    'https://astoriasoft.github.io/amp/images/static/168.png',
    'https://astoriasoft.github.io/amp/images/static/192.png',
    'https://astoriasoft.github.io/amp/images/static/any.svg'
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.addEventListener('fetch', function (event) {
        if (event.request.mode == 'navigate') {
            console.log('Handling fetch event for', event.request.url);
            console.log(event.request);
            event.respondWith(
                fetch(event.request).catch(function (exception) {
                    // The `catch` is only triggered if `fetch()` throws an exception,
                    // which most likely happens due to the server being unreachable.
                    console.error(
                        'Fetch failed; returning offline page instead.',
                        exception
                    );
                    return caches.open(OFFLINE_CACHE).then(function (cache) {
                        return cache.match('/');
                    });
                })
            );
        } else {
            // It’s not a request for an HTML document, but rather for a CSS or SVG
            // file or whatever…
            event.respondWith(
                caches.match(event.request).then(function (response) {
                    return response || fetch(event.request);
                })
            );
        }

    });

    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Push Codelab';
    const options = {
        body: 'Yay it works.',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
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

