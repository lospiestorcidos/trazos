'use strict';
/* Service worker: deja la app disponible sin conexión.
   Para publicar cambios, sube el número de VERSION: el iPad actualiza la copia la próxima vez que abra con red. */
const VERSION = 'trazos-v2';
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

// Primero la copia guardada (rápido y sin red); si no está, red.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
