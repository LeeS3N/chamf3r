const CACHE = "chamf3r-3.7.4-d338f8d208";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/Academy-LT30oXMf.js",
  "./assets/fraunces-latin-500-italic-Bp1RWfBU.woff",
  "./assets/fraunces-latin-500-italic-CjxnbVsv.woff2",
  "./assets/fraunces-latin-500-normal-BTR4KCeb.woff",
  "./assets/fraunces-latin-500-normal-DnGCNyPD.woff2",
  "./assets/fraunces-latin-600-normal-BFCDtZfi.woff2",
  "./assets/fraunces-latin-600-normal-DL5QCzvS.woff",
  "./assets/fraunces-latin-700-normal-CEOla-zY.woff2",
  "./assets/fraunces-latin-700-normal-DTjk5d1Q.woff",
  "./assets/fraunces-latin-ext-500-italic-CzWJT2mH.woff",
  "./assets/fraunces-latin-ext-500-italic-D-eTYFHX.woff2",
  "./assets/fraunces-latin-ext-500-normal-BMcFk1Xs.woff",
  "./assets/fraunces-latin-ext-500-normal-Z5DV8IzT.woff2",
  "./assets/fraunces-latin-ext-600-normal-B0Dy4lqi.woff",
  "./assets/fraunces-latin-ext-600-normal-BtzmzP0X.woff2",
  "./assets/fraunces-latin-ext-700-normal-CanUGppC.woff2",
  "./assets/fraunces-latin-ext-700-normal-DuBstVeD.woff",
  "./assets/index-AuBTofYU.js",
  "./assets/inter-latin-400-normal-C38fXH4l.woff2",
  "./assets/inter-latin-400-normal-CyCys3Eg.woff",
  "./assets/inter-latin-500-normal-BL9OpVg8.woff",
  "./assets/inter-latin-500-normal-Cerq10X2.woff2",
  "./assets/inter-latin-600-normal-CiBQ2DWP.woff",
  "./assets/inter-latin-600-normal-LgqL8muc.woff2",
  "./assets/inter-latin-700-normal-BLAVimhd.woff",
  "./assets/inter-latin-700-normal-Yt3aPRUw.woff2",
  "./assets/inter-latin-ext-400-normal-77YHD8bZ.woff",
  "./assets/inter-latin-ext-400-normal-C1nco2VV.woff2",
  "./assets/inter-latin-ext-500-normal-BxGbmqWO.woff",
  "./assets/inter-latin-ext-500-normal-CV4jyFjo.woff2",
  "./assets/inter-latin-ext-600-normal-CIVaiw4L.woff",
  "./assets/inter-latin-ext-600-normal-D2bJ5OIk.woff2",
  "./assets/inter-latin-ext-700-normal-Ca8adRJv.woff2",
  "./assets/inter-latin-ext-700-normal-TidjK2hL.woff",
  "./assets/scene-DryexKqK.js",
  "./assets/scene-fTvKsHzH.js",
  "./assets/style-dIVnVKuy.css",
  "./assets/three.module-C9aLZRkb.js",
  "./covers/close-to-the-chest.jpg",
  "./covers/morning-window.jpg",
  "./covers/play-it-low.jpg",
  "./data/COPYING",
  "./data/NOTICE",
  "./data/eng-tur.min.json",
  "./data/examples.min.json",
  "./data/freq.min.json",
  "./data/ipa.min.json",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./sounds/done.wav",
  "./sounds/flip.wav",
  "./sounds/miss.wav",
  "./sounds/ok.wav",
  "./sounds/tick.wav",
  "./splash/splash-portrait.png",
  "./splash/splash-square.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith(self.location.origin)) return;
  // v3.4: pages are network-first (a deploy shows up on the next visit), cached copy when offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      if (res.ok) caches.open(CACHE).then((c) => c.put("./index.html", copy));
      return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        const copy = res.clone();
        if (res.ok && req.url.startsWith(self.location.origin)) {
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});

// v3.5: tapping a reminder focuses/opens Chamf3r and starts the lesson
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const action = (e.notification.data && e.notification.data.action) || "lesson";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) { c.postMessage({ chamf3rAction: action }); return c.focus(); } }
    return self.clients.openWindow("./?go=" + action);
  }));
});
