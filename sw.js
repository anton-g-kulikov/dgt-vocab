const CACHE_NAME = "dgt-vocab-v1.1.0";
const urlsToCache = [
  "/",
  "/index.html",
  "/vocabulary-manager.html",
  "/src/ui/styles.css",
  "/src/ui/language-switcher.css",
  "/src/core/vocabulary.js",
  "/src/ui/icons.js",
  "/src/utils/analytics.js",
  "/src/core/core.js",
  "/src/features/flashcards/flashcard-mode.js",
  "/src/features/flashcards/quiz-mode.js",
  "/src/features/flashcards/category-manager.js",
  "/src/features/stats/stats-manager.js",
  "/src/ui/ui-helpers.js",
  "/src/ui/language-switcher.js",
  "/src/utils/script.js",
  "/src/features/vocabulary-manager/vocabulary-manager.js",
  "/src/features/vocabulary-manager/github-integration.js",
  "/manifest.json",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("Service Worker: All files cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Cache failed", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Check if we received a valid response
            if (
              !fetchResponse ||
              fetchResponse.status !== 200 ||
              fetchResponse.type !== "basic"
            ) {
              return fetchResponse;
            }

            // Clone the response as it can only be consumed once
            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return fetchResponse;
          })
        );
      })
      .catch(() => {
        // If both cache and network fail, return a fallback page for navigation requests
        if (event.request.destination === "document") {
          return caches.match("/index.html");
        }
      })
  );
});

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Here you can implement background sync logic
  // For example, sync user progress when back online
  return new Promise((resolve) => {
    console.log("Service Worker: Background sync triggered");
    resolve();
  });
}

// Push notifications (optional - can be implemented later)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
