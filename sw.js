// Bunのパン工房 Service Worker
// 役割：ホーム画面アプリでも新しい版が自動で届くようにする。
// 方針：同一サイト内のGETは「ネットワーク優先」（取れたら表示して控えも更新、
//       取れなかったら控えを出す）。レシピデータ(GAS)や写真など外部の通信は素通し。
// 注意：このファイルのロジックを変えたら、下の CACHE の版数を上げること。
const CACHE = 'breadrecipe-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
