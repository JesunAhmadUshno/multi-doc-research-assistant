# Results: Multi-Doc Research Assistant Abstention Study

Run date: 2026-11-15. Protocol: PREREGISTRATION.md, frozen in commit
f7d22e46ffbc47d14d6b70433a4d6b08bb9b5668 before the tool code existed.
Tool and runner: commit 78b0b95. Raw output: study/results.json.
Machine: Linux VM, 4 vCPUs, about 8 GiB RAM, Python 3.12, model2vec
0.10.0, embeddings minishlab/potion-base-8M.
Corpus as frozen: 16 documents, 5,124 words, 62 chunks.
Battery: 30 in-corpus and 20 out-of-corpus questions, 5 repetitions.
Answer outcomes were identical across all 5 repetitions.

## Verdicts

| Hypothesis | Frozen line | Measured | Verdict |
| --- | --- | --- | --- |
| H1 in-corpus accuracy | at least 0.80 answered with the correct document cited | 0.967 (29 of 30) | CONFIRMED |
| H2 abstention | at least 0.80 of out-of-corpus questions abstained | 0.900 (18 of 20) | CONFIRMED |
| H3 latency | median per-question latency at most 2.0 s | 0.0013 s median over 250 measurements | CONFIRMED |

For scale on H2: the reference failure that motivated this study abstained
on 0.167 of adversarial questions. This tool abstained on 0.900.

## Failure cases, all of them

H1 failure (1):
- IN-17, "How are deletions represented in an LSM-tree before compaction
  runs?" Abstained at similarity 0.3967, just under the frozen 0.40
  threshold. The correct chunk was the top retrieval result; the threshold,
  not the ranking, refused it.

H2 failures (2), both deliberate vocabulary traps:
- OUT-07, "What equipment do dock workers use to load containers onto a
  ship?" Answered from docker-images.md at 0.4162. The words dock and
  container pulled it over the threshold.
- OUT-20, "Why do people in Britain call a line of waiting people a
  queue?" Answered from message-queue-delivery.md at 0.5071, the highest
  out-of-corpus score in the battery. The word queue is used heavily in
  that document in its technical sense.

## The weak stage: sentence extraction

H1 gates on the cited document, and document-level retrieval is strong:
in-corpus top scores ran 0.397 to 0.762, and 29 of 30 questions cited the
right document. The frozen secondary measure tells a different story about
the answer sentence itself. Of the 29 answered in-corpus questions, only
12 (0.414) returned the sentence containing the gold phrase. The tool
usually points at the right document and a relevant passage, but its
single best sentence is often a neighbouring sentence rather than the one
that states the answer. Anyone using this tool should treat the citation
as the product and the extracted sentence as a pointer, not as a verified
answer. Improving sentence selection is the clear next step and was not
attempted here, because retuning after seeing study outcomes would break
the pre-registration.

A smaller defect is visible in some extracts: for Markdown documents the
heading line merges into the first extracted sentence, so a few answers
begin with the document title. Citations are unaffected.

## Score separation

In-corpus top-1 similarities: 0.397 to 0.762 (median about 0.63).
Out-of-corpus top-1 similarities: 0.090 to 0.507. The two bands overlap
only in the 0.40 to 0.51 region, which is exactly where all three failures
sit. A threshold is a trade, not a wall: at 0.40 the trade cost one
in-corpus abstention and two trap answers on this battery.

## Limitations

- One corpus, self-written, 16 documents on neighbouring technical topics.
  Nothing here measures behaviour on large, messy, or adversarially written
  corpora.
- The corpus and the questions were written by the same author, which
  likely flatters retrieval. An independently written question set would
  be a harder test.
- Latency is measured on a small index (62 chunks) with brute-force cosine
  search. It says nothing about latency at corpus scale.
- Abstention quality is threshold behaviour on one embedding model. A
  different model moves both bands.

## Reproduce

    pip install -e ".[api,dev]"
    python study/run_study.py

This rewrites study/results.json. The committed copy is the run reported
above; rerunning on different hardware changes H3 timings only.
