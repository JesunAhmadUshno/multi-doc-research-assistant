# Token Bucket Rate Limiting

Rate limiting controls how many requests a client may make in a given period, protecting a service from overload and keeping usage fair between clients. The token bucket is one of the most widely used algorithms for it, because it enforces an average rate while still permitting short bursts.

Imagine a bucket that holds tokens. Tokens are added at a fixed refill rate, for example ten tokens per second, up to a maximum capacity. Each request must take one token out of the bucket before it is served. If the bucket is empty, the request is rejected, typically with HTTP status 429 Too Many Requests, or queued until a token is available.

The two parameters give the algorithm its character. The refill rate sets the sustained average rate a client may use. The bucket capacity sets the burst size: a client that has been idle accumulates a full bucket and may spend it all at once, so capacity is how large a sudden burst can be. A large capacity with a low refill rate means rare but big bursts; a small capacity forces traffic to be smooth.

A common implementation stores, per client, just the current token count and the timestamp of the last update. On each request it computes how many tokens the elapsed time has added, caps the result at capacity, and then tries to spend one. This lazy refill avoids any background timer. In a distributed system the per-client state usually lives in a shared store such as Redis, and the refill-and-spend step is done atomically, often with a small Lua script, so concurrent requests from many servers cannot overspend the same bucket.

The leaky bucket is a close relative. Requests enter a queue and are processed at a perfectly steady rate, like water draining from a hole in a bucket. It smooths output completely but, unlike the token bucket, it does not allow bursts at all once the queue is full.
