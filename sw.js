// 轻言 PWA Service Worker
var CACHE = 'qingyan-v1.5';

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // 跳过 API 请求和统计
  if (e.request.url.indexOf('api.deepseek.com') > -1) return;
  if (e.request.url.indexOf('workers.dev') > -1) return;
  if (e.request.url.indexOf('hm.baidu.com') > -1) return;

  // 网络优先，失败时回退缓存
  e.respondWith(
    fetch(e.request).then(function(resp) {
      if (resp.status === 200 && e.request.method === 'GET') {
        var clone = resp.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return resp;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
