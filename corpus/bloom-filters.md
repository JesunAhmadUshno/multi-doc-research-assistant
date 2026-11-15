# Bloom Filters

A Bloom filter is a compact probabilistic data structure that answers set-membership questions: is this element possibly in the set, or definitely not in it? It trades a small, tunable chance of false positives for a large saving in memory compared with storing the elements themselves.

The structure is a bit array of m bits, initially all zero, plus k independent hash functions. To insert an element, the filter hashes it with all k functions and sets the k resulting bit positions to one. To test an element, it hashes the element the same way and checks those positions. If any checked bit is zero, the element is definitely not in the set, because insertion would have set it. If all the bits are one, the element is probably in the set, but it might be a false positive: other inserted elements may have set those bits between them.

False negatives are impossible in a standard Bloom filter. Once an element is inserted its bits stay set, so a membership test for it always finds ones. This asymmetry is what makes the structure useful as a pre-filter: a negative answer can be trusted completely and saves an expensive lookup, while a positive answer is treated as a hint that must be verified against the real data.

The false positive rate depends on how full the filter is. For a filter holding n elements with m bits and the optimal number of hash functions, the error rate falls exponentially as bits per element grow. Roughly ten bits per element gives an error rate near one percent, which is why a Bloom filter can guard a dataset of millions of keys with a few megabytes.

A standard Bloom filter does not support deletion. Clearing an element's bits might clear bits shared with other elements and create false negatives for them. The counting Bloom filter variant replaces each bit with a small counter so insertions and deletions increment and decrement, at the cost of several times more memory.
