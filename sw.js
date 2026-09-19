// Offline support. Network first: when online the newest version always loads
// and refreshes the cache; the cache is only used when the network fails.
const CACHE = "lawquiz-v1.1.0";
const CORE = [
  "./",
  "index.html",
  "assets/style.css",
  "assets/app.js",
  "assets/questions.js",
  "favicon.svg",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("lawquiz-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks for this when offline mode is (re)enabled, so the core files are
// cached even if the worker was revived without a fresh install.
self.addEventListener("message", (e) => {
  if (e.data !== "precache") return;
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE))
      .then(() => e.ports[0] && e.ports[0].postMessage("done"))
      .catch(() => e.ports[0] && e.ports[0].postMessage("error"))
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((hit) =>
            hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())
          )
        )
    );
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
      )
    );
  }
});
