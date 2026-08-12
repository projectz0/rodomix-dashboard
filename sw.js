// Service Worker do Rodomix DRE — estratégia network-first
// v2: corrige o bug em que o app instalado no celular não atualizava sozinho.
// Antes (v1): cache-first — sempre servia a versão salva no cache, mesmo com dado novo publicado.
// v3: fetch com {cache:'no-store'} pra ignorar também o cache HTTP do navegador/iOS,
// não só o cache do service worker. Isso evita que o iOS sirva uma cópia "quase fresca"
// que ainda está desatualizada. O reload automático em si (quando o app já está aberto
// e não foi fechado) é feito pela verificação de versão dentro do index.html, não aqui.
const CACHE_NAME = 'rodomix-dre-v3';
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
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
