/* 목회 일지 서비스워커 — 앱 셸 캐시 + 새 버전 자동 반영
   2026-11-26: 네비게이션·앱 셸은 HTTP 캐시를 건너뛰고 늘 새로 받는다.
   (옛 화면이 남거나 304가 섞여 빈 화면이 되던 문제를 막는다) */
const V='20261126g1';
const CACHE='mj-v11';
const FILES=['./','./index.html','./styles.css?v='+V,'./core.js?v='+V,
  './text.js?v='+V,
  './icons.js?v='+V,'./gcal.js?v='+V,'./seed.js?v='+V,'./seed-restaurants.js?v='+V,
  './view-cover.js?v='+V,'./view-home.js?v='+V,'./view-journal.js?v='+V,'./view-schedule.js?v='+V,
  './view-counsel.js?v='+V,'./view-calendar.js?v='+V,'./view-notes.js?v='+V,
  './view-sermons.js?v='+V,'./view-vehicle.js?v='+V,'./view-food.js?v='+V,'./view-report.js?v='+V,
  './view-admin.js?v='+V,
  './manifest.json','./calendar.json',
  './assets/carnival.jpg','./assets/cover-stand.jpg','./assets/cover-desk.jpg','./assets/gvch-logo.png',
  './icons/icon-192.png','./icons/icon-512.png','./icons/maskable-192.png','./icons/maskable-512.png',
  './icons/apple-180.png','./icons/favicon-32.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    const old=ks.filter(k=>k!==CACHE);
    await Promise.all(old.map(k=>caches.delete(k)));
    await self.clients.claim();
    const cs=await self.clients.matchAll({type:'window'});
    cs.forEach(c=>{try{c.postMessage({type:'mj-updated',cache:CACHE})}catch(err){}});
    /* 업그레이드로 새 버전이 자리 잡았을 때: 옛 화면이 떠 있는 창을 새 화면으로 한 번 바꾼다 */
    if(old.length){
      cs.forEach(c=>{try{c.navigate(c.url)}catch(err){}});
    }
  })());
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  const base=new URL(self.registration.scope).pathname;
  if(!url.pathname.startsWith(base))return;
  const isNav=e.request.mode==='navigate';
  const isData=url.pathname.endsWith('/calendar.json');
  e.respondWith((async()=>{
    try{
      /* 늘 네트워크가 먼저. 브라우저 HTTP 캐시(옛 파일)는 쓰지 않는다. */
      const res=await fetch(e.request,{cache:'no-store'});
      if(res&&res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        return res;
      }
      /* 304 등이 오면 캐시본으로 대신한다 (빈 응답을 화면에 넘기지 않는다) */
      const hit=await caches.match(e.request,{ignoreSearch:true});
      if(hit)return hit;
      if(isData)return new Response('{"events":[]}',{headers:{'Content-Type':'application/json'}});
      if(isNav)return caches.match('./index.html',{ignoreSearch:true})||res;
      return res;
    }catch(err){
      if(isNav)return (await caches.match('./index.html',{ignoreSearch:true}))||(await caches.match('./',{ignoreSearch:true}));
      const hit=await caches.match(e.request,{ignoreSearch:true});
      if(hit)return hit;
      if(isData)return new Response('{"events":[]}',{headers:{'Content-Type':'application/json'}});
      return new Response('',{status:504,statusText:'offline'});
    }
  })());
});
self.addEventListener('message',e=>{
  if(e.data==='skip-waiting')self.skipWaiting();
});
