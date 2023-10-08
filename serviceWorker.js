const cacheVersion = "$$VERSION$$"

const urlsToCache = ["."];

self.addEventListener('install', (event) => {
    event.waitUntil(
        // キャッシュを開く
        caches.open(cacheVersion)
            .then((cache) => {
                // 指定されたファイルをキャッシュに追加する
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.filter((cacheName) => {
                return cacheName !== cacheVersion;
            }).map((cacheName) => {
                // いらないキャッシュを削除する
                return caches.delete(cacheName);
            }));
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュ内に該当レスポンスがあれば、それを返す
                if (response) {
                    return response;
                }

                // 重要：リクエストを clone する。リクエストは Stream なので
                // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
                // 必要なので、リクエストは clone しないといけない
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            // キャッシュする必要のないタイプのレスポンスならそのまま返す
                            return response;
                        }

                        // 重要：レスポンスを clone する。レスポンスは Stream で
                        // ブラウザ用とキャッシュ用の2回必要。なので clone して
                        // 2つの Stream があるようにする
                        const responseToCache = response.clone();

                        caches.open(cacheVersion)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});