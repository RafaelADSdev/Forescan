const CACHE_NAME = "forescan-next-cache-v4";
const APP_SHELL = [
  "/",
  "/login",
  "/dashboard",
  "/casos/novo",
  "/ml",
  "/usuarios",
  "/manifest.json",
  "/images/Logo.png",
  "/images/logo48.png",
  "/images/logo72.png",
  "/images/logo87.png",
  "/images/logo192.png",
  "/images/logo512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const passthroughHosts = ["tile.openstreetmap.org", "openstreetmap.org", "cartocdn.com", "basemaps.cartocdn.com"];
  if (passthroughHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === "navigate") {
            return caches.match("/dashboard").then((fallback) => fallback || caches.match("/"));
          }
          return null;
        })
      )
  );
});
