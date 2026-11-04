'use strict';
/* Service worker: deja la app disponible sin conexión.
   Para publicar cambios, sube el número de VERSION: el iPad actualiza la copia la próxima vez que abra con red. */
const VERSION = 'trazos-v4';
const ARCHIVOS = ['./', './index.html', './p5.min.js', './NoSleep.min.js', './manifest.webmanifest',
                  './icono-180.png', './icono-192.png', './icono-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// La página y sw.js: primero la red (así siempre ves lo último); sin red, la copia guardada.
// El resto (p5, iconos…): primero la copia guardada.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const pagina = e.request.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(e.request.url).pathname);
  if (pagina) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then((r) => {
      const copia = r.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
