const CACHE_NAME = 'embryo-app-v3.0a（2025.12.29）
';

const ASSETS = [
  './',
  './index.html',
  './rescueICSI.html',
  './sperm.html',
  './transfer_message.html',
  './manifest.json',
  './icon-512.png',
  './favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // HTML 導覽：network-first，避免卡舊 index.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 其他資源：cache-first
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
