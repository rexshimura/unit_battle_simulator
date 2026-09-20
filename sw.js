const CACHE_NAME = 'battle-sim-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/config.js',
  './js/game.js',
  './js/main.js',
  './js/state.js',
  './js/ui.js',
  './js/utils.js',
  './js/entities/Effects.js',
  './js/entities/Projectiles.js',
  './js/entities/Unit.js',
  './js/sfx/arrow.mp3',
  './js/sfx/bite.mp3',
  './js/sfx/bullet.mp3',
  './js/sfx/freeze.mp3',
  './js/sfx/frostwave.mp3',
  './js/sfx/ice-shards.mp3',
  './js/sfx/push.mp3',
  './js/sfx/slash.mp3',
  './js/sfx/slice.mp3',
  './js/sfx/snipe.mp3',
  './js/sfx/thrust.mp3',
  './js/sfx/eagle-release.mp3',
  './js/sfx/eagle-bite.mp3',
  './js/sfx/rifle.mp3',
  './js/sfx/force-wall-deflect.mp3',
  './js/sfx/force-wall-hit.mp3',
  './js/sfx/force-wall-deflect-activation.mp3',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Fetch and cache individually so one missing file doesn't crash the whole worker
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn('SW failed to cache:', url, err);
          });
        })
      );
    })
  );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control of all open pages immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});