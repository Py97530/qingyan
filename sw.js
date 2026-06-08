// 轻言 PWA Service Worker
var CACHE = 'qingyan-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Skip API requests
  if (e.request.url.indexOf('api.deepseek.com') > -1) return;
  if (e.request.url.indexOf('workers.dev') > -1) return;

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
