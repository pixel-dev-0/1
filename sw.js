/* Service worker للوحة الإدارة: الهيكل يتفتح فوراً حتى بنت ضعيف، والـ API مش بيتكاشّى أبداً */
const V = 'aliraqi-admin-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './logo.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return; // API: شبكة فقط
  if (u.origin === location.origin) {
    // الصفحة: الشبكة أولاً (عشان التحديثات توصل) وبعدين الكاش
    if (r.mode === 'navigate') {
      e.respondWith(fetch(r).then((x) => { caches.open(V).then((c) => c.put('./index.html', x.clone())); return x; }).catch(() => caches.match('./index.html')));
      return;
    }
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then((x) => { const cp = x.clone(); caches.open(V).then((c) => c.put(r, cp)); return x; })));
    return;
  }
  if (u.hostname.includes('fonts.g')) { // الخطوط: كاش مع تحديث بالخلفية
    e.respondWith(caches.open(V).then((c) => c.match(r).then((m) => { const f = fetch(r).then((x) => { c.put(r, x.clone()); return x; }).catch(() => m); return m || f; })));
  }
});
