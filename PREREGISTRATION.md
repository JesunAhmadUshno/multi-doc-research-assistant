# Pre-Registration: Multi-Doc Research Assistant Abstention Study

Date frozen: 2026-11-15.
Status: this document, the corpus, and the two question sets are committed
together before the tool's measurement code is written and before any study
run. The verdicts in RESULTS.md are computed against the lines frozen here,
and a refuted hypothesis is published as refuted.

## The product under test

A local research assistant. It indexes a folder of documents (txt, md, and
pdf), chunks and embeds them locally, and answers questions from the command
line and through a small FastAPI endpoint. Answers are extractive: the tool
returns a sentence from the retrieved chunk, with a citation naming the
document and chunk. When the retrieved evidence is weak, the tool abstains
with a plain statement that the answer is not in the documents. No external
LLM API is used at any point.

## Why this study exists

Two earlier studies in this portfolio measured a reference retrieval system
answering questions it should have refused. In one, the system answered 10
of 12 adversarial, out-of-corpus questions with extractive non-answers
(abstention rate 0.167). In another, spurious retrieval fired on 0.75 of
out-of-corpus questions. This study tests whether an explicit similarity
threshold, frozen in advance, fixes that failure mode without destroying
in-corpus accuracy.

## Frozen design

- Corpus: the 16 self-written technical documents in `corpus/`, 5,124 words
  in total at freeze time. No document may be edited after this commit; a
  changed corpus voids the run.
- Chunking: sliding word windows of 120 words with a stride of 90 words,
  computed per document, never crossing a document boundary.
- Embeddings: minishlab/potion-base-8M through model2vec (StaticModel),
  L2-normalized, cosine similarity.
- Retrieval: the single top chunk by cosine similarity to the question.
- Answer extraction: within the top chunk, the sentence with the highest
  cosine similarity to the question is returned as the answer, cited as
  document name plus chunk index.
- Abstention: if the top chunk similarity is below the frozen threshold
  T = 0.40, the tool abstains and returns no answer.
- Threshold calibration, disclosed: T was chosen from a calibration probe
  run before this freeze on 12 ad-hoc questions (6 in-corpus, 6
  out-of-corpus) that are disjoint from both frozen question sets. In that
  probe, correctly retrieved in-corpus questions scored 0.474 to 0.715,
  out-of-corpus questions scored at most 0.339, and one in-corpus probe
  question was mis-retrieved at 0.325. T = 0.40 sits between the two bands.
  The probe questions and scores are not part of the study data.

## Frozen question sets

- `study/questions_in_corpus.json`: 30 questions, each with a gold document
  and a gold phrase that the correct answer sentence contains.
- `study/questions_out_of_corpus.json`: 20 questions whose answers are not
  in the corpus, including deliberate vocabulary traps (rafting, tulip
  bloom, dock workers, electrical sockets, British queues).

## Frozen hypotheses

- H1 (in-corpus accuracy): at least 0.80 of the 30 in-corpus questions are
  answered (not abstained) with the cited document equal to the gold
  document. Secondary measure, reported but not gated: the fraction of
  answered questions whose extracted sentence contains the gold phrase.
- H2 (abstention): at least 0.80 of the 20 out-of-corpus questions are
  abstained. For scale, the reference failure abstained on 0.167.
- H3 (latency): the median per-question latency across the full 50-question
  battery, measured over 5 repetitions and excluding index construction and
  model load, is at most 2.0 seconds per question on the study machine.

## Run protocol

The study runner builds the index once, then runs the full battery 5 times.
Answer outcomes are deterministic under a fixed model, so H1 and H2 are
scored on the first pass and confirmed identical on the rest; H3 uses the
median of per-question times across all 5 passes. Every failure case (wrong
document, abstention on an in-corpus question, answered out-of-corpus
question) is listed by id in RESULTS.md with its similarity score. The raw
output is committed as `study/results.json`.

## Claims ceiling

This is a local tool and a single-corpus study. It supports claims about
this tool, this corpus, and this threshold. It does not support claims
about retrieval systems in general, other corpora, or production readiness.
