// Service Worker do Rodomix DRE — estratégia network-first
// v2: corrige o bug em que o app instalado no celular não atualizava sozinho.
// Antes (v1): cache-first — sempre servia a versão salva no cache, mesmo com dado novo publicado.
// Agora (v2): tenta a rede primeiro; só usa o cache se estiver offline.
const CACHE_NAME = 'rodomix-dre-v2';
const OFFLINE_URLS = ['index.html', 'manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
