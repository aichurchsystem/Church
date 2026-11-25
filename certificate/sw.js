/* 소속증명서 발급 앱 전용 서비스 워커
   이 폴더(certificate/) 범위만 담당한다. 같은 저장소의 다른 페이지는 건드리지 않는다.
   네트워크가 있으면 새 파일을 먼저 받아 두고, 없으면 받아 둔 사본으로 연다. */

const CACHE = 'certificate-app-v12';
const SHELL = [
  './',
  './index.html',
  './assets/app.css',
  './assets/app.js',
  './assets/emblem-navy.png',
  './assets/emblem-slate.png',
  './assets/emblem-ink.png',
  './assets/seals/seal-chair-round.png',
  './assets/seals/seal-secretary-round.png',
  './assets/seals/seal-presbytery-square.png',
  './assets/band.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon-180.png',
  './data/people.json',
  './data/types.json',
  './data/config.json',
  './manifest.webmanifest',
  './vendor/html2canvas.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) =>
        c.add(new Request(u, { cache: 'reload' })).catch(() => {})
      )))
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
  if (url.origin !== self.location.origin) return;

  const scopePath = new URL(self.registration.scope).pathname;   // 예: /Church/certificate/
  if (!url.pathname.startsWith(scopePath)) return;                // 폴더 밖 요청은 그대로 둔다

  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(
        (hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
      ))
  );
});
