const CACHE = "srpski-v23";
const ASSETS = ["index.html","a1.html","a2.html","slovar.html","rechnik.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    const hadOld = ks.some(k => k !== CACHE);
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    if (hadOld) {
      const cl = await self.clients.matchAll({type: "window"});
      cl.forEach(c => { try { c.navigate(c.url); } catch (err) {} });
    }
  })());
});
// Страницы и данные: сначала сеть (свежая версия), при отсутствии сети — кэш.
// Аудио, иконки и прочее: сначала кэш.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const fresh = e.request.mode === "navigate" || /\.(html|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (fresh) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(e.request).then(h => h || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{}); }
      return res;
    }))
  );
});
