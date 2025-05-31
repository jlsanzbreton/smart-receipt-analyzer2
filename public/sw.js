const CACHE_NAME = "smart-receipt-analyzer-v2"; // Incremented cache version
const DEXIE_CDN_URL = "https://esm.sh/dexie@^4.0.7"; // Matches importmap

const APP_SHELL_FILES = [
  "/smart-receipt-analyzer2/",
  "/smart-receipt-analyzer2/index.html",
  "/smart-receipt-analyzer2/pwa-check.html",
  // '/index.tsx', // We cache the page that loads it, not the .tsx itself
  // Add paths to your main JS/CSS bundles if they are static and known
  // For this setup, esm.sh/* handles react, heroicons etc.
  "/smart-receipt-analyzer2/manifest.json",
  "/smart-receipt-analyzer2/icons/icon-192x192.svg",
  "/smart-receipt-analyzer2/icons/icon-512x512.svg",
  DEXIE_CDN_URL, // Cache Dexie
];

// We also want to cache the main script loaded by index.html
// For esm.sh it might be complex if URLs are too dynamic.
// The browser will cache these based on HTTP headers from esm.sh if not explicitly listed.

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("ServiceWorker: Caching app shell and Dexie");
        // Create a new array for addAll with unique URLs
        const uniqueAppShellFiles = [...new Set(APP_SHELL_FILES)];
        return cache.addAll(uniqueAppShellFiles);
      })
      .catch((error) => {
        console.error("ServiceWorker: Failed to cache app shell:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("ServiceWorker: Clearing old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("ServiceWorker: Activated and old caches cleared.");
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache-First strategy for app shell files and CDNs we trust (like Dexie from esm.sh)
  if (
    APP_SHELL_FILES.includes(url.href) ||
    url.origin === "https://esm.sh" ||
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com" ||
    url.href.endsWith(".png") ||
    url.href.endsWith(".jpg") ||
    url.href.endsWith(".jpeg")
  ) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            // Optional: Cache new versions if fetched successfully
            // Be careful with dynamic content or frequently changing bundles.
            // For CDNs, their own caching headers are usually sufficient.
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              (APP_SHELL_FILES.includes(url.href) || url.href === DEXIE_CDN_URL)
            ) {
              // Only cache app shell and dexie explicitly this way
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
        .catch((error) => {
          console.error(
            "ServiceWorker: Error fetching from cache or network:",
            error,
            event.request.url
          );
          // For an offline app, you might return a fallback page or resource here
          // For example, if (event.request.mode === 'navigate') return caches.match('/offline.html');
        })
    );
  } else if (event.request.method === "GET") {
    // For other GET requests, try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Optionally cache other successful GET requests for offline use
            // const responseToCache = networkResponse.clone();
            // caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || Response.error(); // Return error if not in cache either
          });
        })
    );
  } else {
    // For non-GET requests (POST, PUT, DELETE), just fetch (no caching)
    // These are typically API calls that modify server state
    // Gemini API calls fall here.
    event.respondWith(fetch(event.request));
  }
});
