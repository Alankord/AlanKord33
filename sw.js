// Service Worker بۆ کاشێری زیرەک - Smart POS
// ئەم فایلە پرۆگرامەکە دەکات بە کاری offline و install-کردن لەسەر کۆمپیوتەر/مۆبایل

const CACHE_NAME = "smart-pos-cache-v1";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

// دامەزراندن: هەموو فایلە سەرەکییەکان cache دەکات
self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// چالاککردن: cache ـە کۆنەکان دەسڕێتەوە
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// وەرگرتنی داواکارییەکان: یەکەم جار لە cache دەگەڕێت، ئەگەر نەبوو لە ئینتەرنێت
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return (
                cached ||
                fetch(event.request)
                    .then((response) => {
                        // کۆپیایەک لە وەڵامی نوێ هەڵدەگرێت بۆ cache
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    })
                    .catch(() => cached)
            );
        })
    );
});
