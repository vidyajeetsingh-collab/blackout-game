/* =========================================
   PROJECT: BLACKOUT
   Service Worker
========================================= */

const CACHE_NAME = "blackout-cache-v4";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/images/blackout-icon.svg",
  "./css/game.css",

  // Core game
  "./js/main.js",
  "./js/engine.js",
  "./js/renderer.js",
  "./js/player.js",
  "./js/camera.js",

  // Gameplay systems
  "./js/weapons.js",
  "./js/enemies.js",
  "./js/vehicles.js",
  "./js/missions.js",
  "./js/inventory.js",
  "./js/world.js",

  // Interface and saving
  "./js/ui.js",
  "./js/menu.js",
  "./js/settings.js",
  "./js/save.js"
];


/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});


/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(name =>
            name.startsWith("blackout-cache-") &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});


/* FETCH */
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Handle page navigation.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache =>
                cache.put("./index.html", copy)
              );
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match("./index.html")
          ) || Response.error();
        })
    );

    return;
  }

  // Handle game files and other resources.
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {
            if (response.ok) {
              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache =>
                  cache.put(request, copy)
                );
            }

            return response;
          });
      })
  );
});