const CACHE='mj-v1';
const FILES=['./','./index.html','./styles.css','./core.js','./icons.js','./seed.js',
  './view-home.js','./view-journal.js','./view-schedule.js','./view-counsel.js',
  './view-calendar.js','./view-notes.js','./view-sermons.js','./view-vehicle.js','./view-food.js',
  './seed-restaurants.js','./manifest.json',
  './assets/carnival.jpg',
  './icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  const base=new URL(self.registration.scope).pathname;
  if(!url.pathname.startsWith(base))return;
  e.respondWith(
    fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html')))
  );
});
