const CACHE='woven-bracelet-v20';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=20',
  './data.js?v=20',
  './core.js?v=20',
  './calculator.js?v=20',
  './projects.js?v=20',
  './export.js?v=20',
  './app.js?v=20',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  // HTML and versioned modules are network-first so updates cannot mix old/new modules.
  e.respondWith(
    fetch(e.request,{cache:'no-store'})
      .then(r=>{
        const copy=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return r;
      })
      .catch(()=>caches.match(e.request))
  );
});
