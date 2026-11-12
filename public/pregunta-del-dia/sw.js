// Pregunta del día moved to https://pregunta.cameronwillia.ms. This replaces the service worker it
// installed here: it clears the old offline cache, unregisters itself and reloads open tabs, which
// then follow the redirect to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await Promise.all((await caches.keys()).map((key) => caches.delete(key)));
      await self.registration.unregister();
      for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
    })(),
  );
});
