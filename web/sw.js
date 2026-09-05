const CACHE="leo-1.1.0-shell-v1";
const ASSETS=["/","/manifest.webmanifest","/assets/leo-wolf.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{const u=new URL(event.request.url);if(event.request.method!=="GET"||u.pathname.startsWith("/api/"))return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||caches.match("/"))));});
