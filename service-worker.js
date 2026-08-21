const CACHE='woven-bracelet-v18-update-fix';
const ASSETS=[
  './',
  './index.html',
  './styles.css',
  './data.js',
  './core.js',
  './calculator.js',
  './projects.js',
  './export.js',
  './app.js',
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

self.addEventListener('fetch',e=>e.respondWith(
  fetch(e.request)
    .then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return r;
    })
    .catch(()=>caches.match(e.request))
));
