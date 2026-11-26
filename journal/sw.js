/* 목회 일지 서비스워커 — 앱 셸 캐시 + 새 버전 자동 반영 */
const CACHE='mj-v3';
const FILES=['./','./index.html','./styles.css?v=20261126c1','./core.js?v=20261126c1',
  './icons.js?v=20261126c1','./gcal.js?v=20261126c1','./seed.js?v=20261126c1','./seed-restaurants.js?v=20261126c1',
  './view-home.js?v=20261126c1','./view-journal.js?v=20261126c1','./view-schedule.js?v=20261126c1',
  './view-counsel.js?v=20261126c1','./view-calendar.js?v=20261126c1','./view-notes.js?v=20261126c1',
  './view-sermons.js?v=20261126c1','./view-vehicle.js?v=20261126c1','./view-food.js?v=20261126c1',
  './manifest.json','./calendar.json',
  './assets/carnival.jpg',
  './icons/icon-192.png','./icons/icon-512.png','./icons/maskable-192.png','./icons/maskable-512.png',
  './icons/apple-180.png','./icons/favicon-32.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
    .then(()=>self.clients.matchAll({type:'window'}))
    .then(cs=>cs.forEach(c=>c.postMessage({type:'mj-updated',cache:CACHE}))));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  const base=new URL(self.registration.scope).pathname;
  if(!url.pathname.startsWith(base))return;
  const isData=url.pathname.endsWith('/calendar.json');
  e.respondWith((async()=>{
    try{
      // 캘린더 데이터는 늘 새것을 먼저 시도 (오프라인이면 캐시)
      const res=await fetch(e.request,isData?{cache:'no-store'}:undefined);
      if(res&&res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return res;
    }catch(err){
      const hit=await caches.match(e.request,{ignoreSearch:true});
      if(hit)return hit;
      if(isData)return new Response('{"events":[]}',{headers:{'Content-Type':'application/json'}});
      return caches.match('./index.html',{ignoreSearch:true});
    }
  })());
});
self.addEventListener('message',e=>{
  if(e.data==='skip-waiting')self.skipWaiting();
});
