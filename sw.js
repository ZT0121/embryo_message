// sw.js
// 目標：避免同事「卡舊版」
// - HTML 導覽：network-first
// - JS/CSS：stale-while-revalidate（先回快取、背景更新）
// - 其他檔案：cache-first

const CACHE_NAME = 'embryo-app-v3.1.2-2026-02-06';

const ASSETS = [
  './',
  './index.html',
  './rescueICSI.html',
  './sperm.html',
  './transfer_message.html',
  './manifest.json',
  './icon-512.png',
  './favicon.png',
  './js/ui_common_v4.js',
  './js/templates_v4.js',
  './js/app_v4.js',
  './css/style.css',
].filter(Boolean);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  // 不在 install 階段強制接管，避免使用中突兀刷新
  // 手動更新按鈕會送 SKIP_WAITING，再由 waiting worker 接管
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

// 接收「手動更新」指令，讓 waiting worker 立即接管
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const networkFetch = fetch(req)
    .then((res) => {
      // 只有成功回應才更新快取
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || (await networkFetch) || new Response('', { status: 504 });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // HTML 導覽：network-first，避免卡舊 index.html
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // 同源 JS/CSS：stale-while-revalidate（使用者不會卡住，但會默默更新到新版本）
  if (url.origin === self.location.origin && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 其他資源：cache-first
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
