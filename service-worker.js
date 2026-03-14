const CACHE = 'fishbone-pwa-v6';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (e)=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (e)=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE?null:caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (e)=>{ const req = e.request; if(req.mode==='navigate'){ e.respondWith(fetch(req).catch(()=>caches.match('./index.html')));} else { e.respondWith(caches.match(req).then(r=>r || fetch(req))); }});
