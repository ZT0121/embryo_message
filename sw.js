// 👇 修改 1：版本號改一下 (例如 v1 改 v2)，強迫瀏覽器更新
const CACHE_NAME = 'embryo-app-v2';

const ASSETS = [
  './',
  './index.html',
  './rescueICSI.html',
  './sperm.html',
  './transfer_message.html',
  './manifest.json', // 建議把 manifest 也加進來
  './icon-512.png'   // 👇 修改 2：這裡改成您的新圖示檔名 (原本是 favicon.png, sperm.png 等)
];

// 安裝 Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // 強制立即啟用新版 Service Worker
});

// 啟動時清除舊快取
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// 攔截請求
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
