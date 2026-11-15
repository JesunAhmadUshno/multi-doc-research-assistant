# HTTP Caching

HTTP caching lets clients and intermediate proxies store responses and reuse them for later requests, which cuts latency and reduces load on the origin server. A cache may be private, such as the cache inside a single browser, or shared, such as a proxy cache operated by a company or a content delivery network.

The Cache-Control response header is the main mechanism for declaring caching policy. The max-age directive states how many seconds a response may be considered fresh. While a response is fresh, the cache may serve it without contacting the origin at all. The no-store directive forbids storing any part of the request or response, and it is the correct choice for sensitive data such as banking pages.

When a stored response becomes stale, the cache can revalidate it with the origin before serving it again. Revalidation uses conditional requests. If the stored response carries an ETag, the cache sends it back in an If-None-Match header. If the content has not changed, the origin replies with a 304 Not Modified status and no body, which is much cheaper than resending the full response. A Last-Modified timestamp supports the same pattern through the If-Modified-Since header, but ETags are preferred because clocks and one-second timestamp resolution can mislead the comparison.

Some responses should never be reused for a different user. A shared cache must not serve a response to an authenticated request unless the response explicitly allows it with the public directive or a shared max-age. The Vary header tells caches which request headers, such as Accept-Language, must match before a stored response may be reused, because the origin may return different content for different values.

Cache invalidation is famously the hard part. The practical approach is to give static assets long freshness lifetimes and fingerprint their URLs with a content hash, so a changed file gets a new URL and the old cached copy is simply abandoned. HTML documents, which tie the fingerprints together, get short lifetimes or revalidation on every load.
