self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch (error) {
      console.error('Failed to parse push payload', error);
      return {};
    }
  })();

  const title = data.title || 'Saving Challenge';
  const options = {
    body:
      data.body || 'Belum cek tantangan minggu ini? Saatnya setor tabunganmu!',
    data: data.data || {},
    icon: '/next.svg',
    badge: '/next.svg',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
        return undefined;
      })
  );
});
