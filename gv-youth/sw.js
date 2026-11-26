/* GV청소년선교회 홈페이지 전용 서비스 워커
   같은 저장소(/)에 있는 운동일지 앱의 서비스 워커가 이 폴더의 화면을 대신 보여 주던 문제를 끊기 위해
   gv-youth 폴더 범위(scope: /Church/gv-youth/)만 담당한다.
   화면은 항상 네트워크에서 먼저 받아 오고, 네트워크가 없을 때만 최근에 받아 둔 사본을 쓴다. */

const CACHE = 'gv-youth-shell-v6';
const SHELL = [
  './index.html',
  './assets/styles.css',
  './assets/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // 외부(지도·유튜브 등)는 그대로 둔다

  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then(
          (hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});
