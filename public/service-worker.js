self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('static-cache-v1').then(function(cache) {
      return cache.addAll([
        '.',
        'index.html',
        'css/main.css',
        'css/reset.min.css',
        'css/font-awesome.min.css'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('static-cache-v1').then(function(cache) {
      return cache.match(event.request).then(function(response) {
        //console.log("cache request: " + event.request.url);
        var fetchPromise = fetch(event.request).then(
          function(networkResponse) {
            // if we got a response from the cache, update the cache
            //console.log("fetch completed: " + event.request.url, networkResponse);
            if (networkResponse) {
              //console.debug("updated cached page: " + event.request.url, networkResponse);
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          },
          function(e) {
            // rejected promise - just ignore it, we're offline
            //console.log("Error in fetch()", e);
          }
        );

        // respond from the cache, or the network
        return response || fetchPromise;
      });
    })
  );
});
