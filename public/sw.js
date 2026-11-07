'use strict';

// Lets the installed app open with no connection. App files are fetched network-first
// so updates show up straight away; /api is never cached (the app has its own outbox).
const CACHE = 'budget-shell-v1';
const SHELL = ['/', '/styles.css', '/app.js', '/manifest.webmanifest', '/icon.svg', '/icon-512.png'];
const CACHE_FIRST_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'flagcdn.com'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request).then(hit => hit || caches.match('/'))),
    );
  } else if (CACHE_FIRST_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(request).then(hit => hit || fetch(request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
        return res;
      })),
    );
  }
});
