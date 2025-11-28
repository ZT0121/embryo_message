const CACHE_NAME = 'embryo-app-v1';
const ASSETS = [
  './',
  './index.html',
  './rescueICSI.html',
  './sperm.html',
  './transfer_message.html',
  './favicon.png',
  './sperm.png',
  './rescueICSI.png'
];

// 安裝 Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 攔截請求 (離線優先)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
