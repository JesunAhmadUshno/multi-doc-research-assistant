"""Shared fixtures: a deterministic bag-of-words embedder and a tiny corpus.

The stub keeps the unit tests fast and fully offline. The study itself runs
with the real model2vec embedder.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from research_assistant.embeddings import l2_normalize  # noqa: E402
from research_assistant.index import DocumentIndex  # noqa: E402
from research_assistant.qa import ResearchAssistant  # noqa: E402

STOPWORDS = {
    "a", "an", "the", "is", "are", "how", "does", "do", "what", "when",
    "why", "which", "i", "you", "it", "of", "to", "in", "on", "for",
}

CACHING_DOC = (
    "HTTP caching stores responses for reuse. The max-age directive states "
    "how many seconds a response may be considered fresh. While a response "
    "is fresh the cache serves it without contacting the origin server. "
    "Browsers keep a private cache for a single user."
)

RAFT_DOC = (
    "Raft elects one leader for each term. A log entry is committed once "
    "the leader has stored it on a majority of servers. Followers keep "
    "copies of the log and apply committed entries in order."
)


def tokenize(text: str) -> list[str]:
    return [
        w
        for w in re.findall(r"[a-z0-9]+", text.lower())
        if w not in STOPWORDS
    ]


class BagOfWordsEmbedder:
    def __init__(self, texts: list[str]):
        vocab = sorted({w for t in texts for w in tokenize(t)})
        self.vocab = {w: i for i, w in enumerate(vocab)}

    def encode(self, texts: list[str]) -> np.ndarray:
        rows = np.zeros((len(texts), len(self.vocab)))
        for r, text in enumerate(texts):
            for w in tokenize(text):
                if w in self.vocab:
                    rows[r, self.vocab[w]] += 1.0
        return l2_normalize(rows)


@pytest.fixture()
def docs_dir(tmp_path: Path) -> Path:
    (tmp_path / "caching.txt").write_text(CACHING_DOC, encoding="utf-8")
    (tmp_path / "raft.txt").write_text(RAFT_DOC, encoding="utf-8")
    (tmp_path / "notes.bin").write_bytes(b"\x00\x01")
    return tmp_path


@pytest.fixture()
def assistant(docs_dir: Path) -> ResearchAssistant:
    embedder = BagOfWordsEmbedder([CACHING_DOC, RAFT_DOC])
    index = DocumentIndex.build(docs_dir, embedder)
    return ResearchAssistant(index, embedder)
