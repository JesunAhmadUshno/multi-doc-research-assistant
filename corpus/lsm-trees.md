# LSM-Tree Storage Engines

The log-structured merge tree, or LSM-tree, is a storage design used by engines such as RocksDB, Cassandra, and LevelDB. It is built for write-heavy workloads. Instead of updating data in place on disk, an LSM engine turns every write into an append and defers the work of organizing data into background processes.

New writes go first into an in-memory sorted structure called the memtable, and at the same time they are appended to a write-ahead log on disk so a crash cannot lose acknowledged writes. When the memtable fills up, the engine flushes it to disk as an immutable sorted file called an SSTable. Reads must check the memtable and then the SSTables, newest to oldest, because the most recent version of a key wins.

Over time many SSTables accumulate, and checking all of them would make reads slow. A background process called compaction merges SSTables together, discarding overwritten versions and deleted keys, and produces fewer, larger sorted files. Compaction is the price the design pays for cheap writes: it consumes disk bandwidth and temporarily needs extra disk space, an effect called write amplification when data is rewritten many times across levels.

Deletes are handled with tombstones. Deleting a key writes a special marker rather than removing anything immediately. The marker shadows older versions during reads, and the key and its tombstone are physically dropped only when compaction reaches the oldest level holding them.

Many LSM engines attach a Bloom filter to each SSTable. Before reading a file, the engine asks the filter whether the key might be present in that file. A negative answer is certain and lets the engine skip the file entirely, which keeps point lookups fast even with many files on disk.
