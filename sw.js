/* Intermediate Bible — service worker.

   Tugasnya cuma satu: membuat APLIKASINYA sendiri bisa dibuka tanpa
   jaringan. Teks Alkitab, catatan, foto, dan rekaman tetap diurus oleh
   IndexedDB di dalam index.html — service worker tidak menyentuh itu.

   Yang TIDAK pernah disimpan di sini:
   - api.esv.org & api.nlt.to  -> lisensinya tidak mengizinkan salinan teks
   - *.supabase.co             -> data akun, harus selalu segar

   Naikkan VERSION setiap kali index.html berubah, supaya salinan lama
   dibuang dan pengguna dapat versi baru.
*/
const VERSION = "intermediate-bible-v1";
const SHELL   = ["./", "./index.html"];

// Berkas dari domain lain yang boleh disimpan supaya aplikasi utuh saat
// offline. Sengaja pendek: hanya pustaka yang dimuat oleh <script>/<link>.
const CDN_OK = ["cdn.jsdelivr.net", "raw.githubusercontent.com"];
// Jangan pernah disentuh.
const NEVER  = ["api.esv.org", "api.nlt.to"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // addAll gagal total kalau satu URL meleset, jadi disimpan satu per satu
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for(const k of await caches.keys()) if(k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => { if(e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;

  let url;
  try{ url = new URL(req.url); }catch{ return; }
  if(!/^https?:$/.test(url.protocol)) return;
  if(NEVER.includes(url.hostname)) return;
  if(url.hostname.endsWith("supabase.co")) return;

  const sameOrigin = url.origin === self.location.origin;
  if(!sameOrigin && !CDN_OK.includes(url.hostname)) return;

  if(sameOrigin){
    // Jaringan dulu: pembaruan aplikasi selalu masuk kalau ada sinyal.
    // Cache jadi jaring pengaman waktu offline.
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try{
        const fresh = await fetch(req);
        if(fresh && fresh.ok && fresh.type === "basic") cache.put(req, fresh.clone());
        return fresh;
      }catch(err){
        const hit = await cache.match(req, {ignoreSearch:true}) || await cache.match("./");
        if(hit) return hit;
        throw err;
      }
    })());
    return;
  }

  // Pustaka dari CDN: cache dulu supaya cepat, lalu diperbarui diam-diam.
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req);
    const net = fetch(req).then(r => {
      if(r && (r.ok || r.type === "opaque")) cache.put(req, r.clone());
      return r;
    }).catch(() => null);
    return hit || (await net) || new Response("", {status:504});
  })());
});
