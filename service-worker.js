/**
 * SERVICE-WORKER.JS - Service Worker pour le fonctionnement offline (PWA)
 */

const CACHE_NAME = 'habitflow-v1.0.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/themes.css',
  './css/icons.css',
  './css/main.css',
  './css/animations.css',
  './css/responsive.css',
  './js/icons.js',
  './js/utils.js',
  './js/habit.js',
  './js/storage.js',
  './js/habitManager.js',
  './js/notifications.js',
  './js/stats.js',
  './js/charts.js',
  './js/ui.js',
  './js/app.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Installé avec succès');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[Service Worker] Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activé avec succès');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ne pas mettre en cache les requêtes POST ou autres méthodes
  if (event.request.method !== 'GET') {
    return;
  }

  // Stratégie Cache First (pour les assets statiques)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // console.log('[Service Worker] Cache hit:', event.request.url);
          return cachedResponse;
        }

        // console.log('[Service Worker] Fetch depuis le réseau:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cloner la réponse car elle ne peut être consommée qu'une fois
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Ne mettre en cache que les requêtes de notre domaine
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Erreur de fetch:', error);

            // Si c'est une page HTML, on peut retourner une page offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Forcer la mise à jour du cache
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        console.log('[Service Worker] Cache supprimé, rechargement...');
        return self.registration.update();
      });
  }
});

// Synchronisation en arrière-plan (optionnel)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event.tag);

  if (event.tag === 'sync-habits') {
    event.waitUntil(
      // Ici on pourrait synchroniser les données avec un serveur si on en avait un
      Promise.resolve()
    );
  }
});

// Notifications push (si on voulait ajouter des notifications serveur plus tard)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event');

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nouveau message',
      icon: './assets/icons/icon-192.png',
      badge: './assets/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'HabitFlow', options)
    );
  }
});

// Click sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('./')
  );
});
