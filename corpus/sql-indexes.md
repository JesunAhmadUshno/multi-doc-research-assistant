# SQL Indexes and B-Trees

A database index is a separate data structure that lets the engine find rows by a column value without scanning the whole table. Most relational databases implement indexes as B-trees, balanced search trees whose nodes hold many keys, so the tree stays shallow and each lookup touches only a handful of pages even in a table with hundreds of millions of rows.

A B-tree index stores its keys in sorted order. Sorted storage makes the index good at two kinds of query: equality lookups, such as finding one customer by email, and range scans, such as all orders placed between two dates. It also lets the engine return rows already sorted by the indexed columns, which can avoid a separate sort step for ORDER BY clauses that match the index.

A composite index covers several columns, and its column order matters. The index sorts by the first column, then by the second within equal first values, and so on. This means a composite index on (last_name, first_name) can serve a query filtering on last_name alone, or on both columns, but not a query filtering on first_name alone, because first names are not globally sorted in the index. This is called the leftmost prefix rule.

Indexes are not free. Every insert, update, or delete on the table must also update each index, so write-heavy tables suffer when they carry many indexes. Indexes also consume disk space and memory. A covering index, which includes every column a query needs, lets the engine answer the query from the index alone without visiting the table rows, at the price of a wider index.

Selectivity guides whether an index is worth using. An index on a column with very few distinct values, such as a boolean flag, rarely helps, because the engine would fetch a large fraction of the table through it anyway and will usually prefer a plain sequential scan.
