const CACHE='woven-bracelet-v26-border-fix';
const ASSETS=[
  './','./index.html','./styles.css?v=26','./data.js?v=26','./core.js?v=26',
  './calculator.js?v=26','./projects.js?v=26','./export.js?v=26','./app.js?v=26',
  './manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>e.respondWith(
  fetch(e.request,{cache:'no-store'}).then(r=>{
    const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;
  }).catch(()=>caches.match(e.request))
));
