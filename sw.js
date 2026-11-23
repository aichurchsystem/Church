const CACHE='workoutlog-v10';
const IMGS=['barbell','dumbbell','bench','incline','rack','cable','latpull','row','legpress','legcurl','dip','pullup','machine','treadmill','bike','rower','bodyweight'];
const FILES=['./','./index.html','./manifest.json','./icon.svg'].concat(IMGS.map(k=>'./images/'+k+'.png'));

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // 이 앱(운동일지) 경로 밖의 요청은 손대지 않는다.
  // 같은 저장소의 다른 페이지(/Church/gv-youth/ 등)를 이 앱 화면으로 대신 보여 주지 않기 위해서다.
  if(url.origin!==self.location.origin)return;
  const base=new URL(self.registration.scope).pathname;      // 예: /Church/
  if(!url.pathname.startsWith(base))return;
  const outside=url.pathname.slice(base.length);              // 예: gv-youth/index.html
  if(outside && !/^(index\.html)?$/.test(outside) && !outside.startsWith('images/') && !/^(manifest\.json|icon\.svg)$/.test(outside)){
    return;                                                   // 다른 하위 앱·페이지는 브라우저 기본 동작에 맡긴다
  }
  e.respondWith(
    fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html')))
  );
});
