# Multi-Doc Research Assistant

A local research assistant that answers questions from your own documents,
with citations, and refuses when the answer is not there.

Point it at a folder of documents (`.txt`, `.md`, `.pdf`). It chunks and
embeds them locally, builds a small index on disk, and answers questions
from the command line or through a minimal FastAPI endpoint. Every answer
is an extractive sentence from your documents with a citation naming the
document and chunk. When the retrieved evidence falls below a stated
similarity threshold, the tool abstains with a plain "Not in the
documents." instead of guessing.

No external LLM API, no API keys, no account. After the one-time embedding
model download, everything runs offline on your machine.

## Install

Requires Python 3.11 or newer.

    pip install -e .
    pip install -e ".[api]"   # only if you want the HTTP endpoint

## Quick start

    mdra index --docs ./corpus --index-dir ./.mdra-index
    mdra ask --index-dir ./.mdra-index "How many round trips does the TLS 1.3 handshake take?"

Real output, from the bundled corpus:

    Sending the key share immediately is what lets TLS 1.3 finish the handshake in a single round trip.
    [tls-handshake.md chunk 0, score 0.530]

Ask something the documents do not cover:

    mdra ask --index-dir ./.mdra-index "What safety gear do you need for whitewater rafting?"

    Not in the documents.

You can skip the index step and pass `--docs` to `ask` directly; the index
is built and saved on first use. Add `--json` for the full answer record
(score, document, chunk index, abstention flag).

## HTTP endpoint

    mdra serve --index-dir ./.mdra-index --port 8000
    curl -X POST localhost:8000/ask -H "Content-Type: application/json" \
         -d '{"question": "Where do new writes go first in an LSM-tree storage engine?"}'

## How it works

- Chunking: sliding windows of 120 words, stride 90, per document.
- Embeddings: minishlab/potion-base-8M static embeddings via model2vec,
  L2-normalized, cosine similarity, brute-force search (the index is meant
  to stay small and local).
- Answering: the top chunk is retrieved; the sentence inside it most
  similar to the question is returned with its citation.
- Abstention: if the top chunk scores below 0.40 cosine similarity, the
  tool abstains. The threshold is a design constant, frozen by the study
  below, not a per-user setting we tuned quietly.

## The study

This repo carries a pre-registered study of its own abstention behaviour,
run because earlier studies in this portfolio found a reference retrieval
system answering 10 of 12 out-of-corpus questions with extractive
non-answers. Hypotheses, threshold, corpus, and question sets were frozen
in PREREGISTRATION.md before the tool was measured.

Headline results (full detail, including every failure case, in
RESULTS.md):

- H1, in-corpus accuracy: 29 of 30 questions answered with the correct
  document cited (0.967 against a frozen 0.80 line). CONFIRMED.
- H2, abstention: 18 of 20 out-of-corpus questions refused (0.900 against
  a frozen 0.80 line). CONFIRMED. Both failures were vocabulary traps.
- H3, latency: median 0.0013 s per question over 250 measurements on the
  study machine. CONFIRMED.
- The honest weakness: the cited document is usually right, but the single
  extracted sentence contains the gold answer phrase in only 0.414 of
  answered questions. Treat the citation as the product and the sentence
  as a pointer.

The corpus in `corpus/` is 16 self-written technical documents (5,124
words). Bring your own folder and the same commands work unchanged.

## Development

    pip install -e ".[api,dev]"
    python -m pytest
    python study/run_study.py   # reruns the frozen battery

The test suite uses a deterministic stub embedder, so it runs fast and
offline; the study uses the real model.

## Claims ceiling

This is a local tool and a single-corpus study, not a hosted product and
not a production retrieval service. It supports claims about this tool on
corpora of this size. It does not support claims about retrieval systems
in general.

## License

Apache-2.0. See LICENSE.
