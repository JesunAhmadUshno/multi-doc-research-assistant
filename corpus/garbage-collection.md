# Garbage Collection

Garbage collection is the automatic reclamation of memory that a running program can no longer reach. Instead of programmers freeing memory by hand, a collector periodically finds objects that are unreachable from the program's roots, such as local variables and global state, and returns their space for reuse.

The classic algorithm is mark and sweep. In the marking phase the collector walks the object graph from the roots and marks every object it can reach. In the sweep phase it scans the heap and frees every unmarked object. The algorithm's weakness is that the whole heap is scanned and the application may be paused during collection, and freed space is left as scattered gaps that fragment the heap.

Copying collectors solve fragmentation by dividing the heap into two spaces. Live objects found during collection are copied into the empty space, compacted together, and the old space is discarded wholesale. Copying costs time proportional to the live data rather than the whole heap, which is excellent when most objects die young, but it needs extra memory headroom for the second space.

Generational collectors build on the observation that most objects die very young, while a few live for the whole run. The heap is split into a young generation, collected frequently with a fast copying algorithm, and an old generation, collected rarely with a more thorough algorithm. Objects that survive several young collections are promoted, or tenured, into the old generation. This focuses nearly all collection effort where nearly all garbage is.

Reference counting is a different strategy: each object counts its incoming references, and when the count reaches zero the object is freed immediately. It spreads the cost smoothly and frees memory promptly, but plain reference counting cannot collect cycles, where a ring of objects references each other but is unreachable from the roots. Languages that rely on it add a separate cycle detector or accept the limitation.
