# DECISIONS: Multi-Doc Research Assistant

Corrections and decisions recorded after the fact, in order.
Frozen records (RESULTS.md, PREREGISTRATION.md) are not
edited; corrections live here.

- D1 (2026-11-17, corrections recorded during the paper
  claim-check): two statements in RESULTS.md are wrong. Both
  were found when the study was verified for the paper
  (preprint, 17 November 2026): every headline figure was
  recomputed from study/results.json with fresh code and the
  full study was re-executed, reproducing every committed
  outcome record field for field (the only difference was
  the H3 median timing, a timing draw). RESULTS.md is a
  frozen record and is not edited; these are the corrections
  of record, also stated in the paper (Sections 4.6 and 5).

  (1) Wrong sentence (RESULTS.md, "Score separation"):
  "In-corpus top-1 similarities: 0.397 to 0.762 (median
  about 0.63)." The value 0.63 is not the median. The median
  of the 30 committed in-corpus top-1 scores in
  study/results.json is 0.650; 0.63 matches the mean
  (0.625). Corrected statement: the in-corpus median top-1
  similarity is 0.650.

  (2) Wrong sentence (RESULTS.md, "Failure cases", on
  question IN-17): "The correct chunk was the top retrieval
  result; the threshold, not the ranking, refused it."
  Corrected statement: IN-17 was a joint failure of ranking
  and threshold, not a threshold refusal of a correct
  retrieval. Evidence: for the paper, IN-17 was re-run with
  the threshold disabled (the threshold is a constructor
  parameter; the search is unchanged). The top chunk at the
  same score of 0.3967 belongs to bloom-filters.md
  (chunk 3), not to the gold document lsm-trees.md. Had the
  threshold been lower, the tool would have answered from
  the wrong document; the abstention masked a
  wrong-document retrieval. No verdict changes: IN-17 is an
  H1 failure under either reading and the counts are
  untouched. The study's three failures are two threshold
  crossings and one joint failure of ranking and threshold,
  not two crossings and one near miss.
