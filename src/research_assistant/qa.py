"""Question answering with citations and threshold abstention."""

from __future__ import annotations

from dataclasses import dataclass

from .chunking import split_sentences
from .embeddings import Embedder
from .index import DocumentIndex

# Frozen in PREREGISTRATION.md (2026-11-15). Do not retune against the
# study question sets.
ABSTAIN_THRESHOLD = 0.40

ABSTAIN_TEXT = "Not in the documents."


@dataclass
class Answer:
    question: str
    abstained: bool
    text: str | None
    document: str | None
    chunk_index: int | None
    score: float

    @property
    def citation(self) -> str | None:
        if self.document is None:
            return None
        return f"{self.document} chunk {self.chunk_index}"

    def to_dict(self) -> dict:
        return {
            "question": self.question,
            "abstained": self.abstained,
            "answer": self.text,
            "citation": self.citation,
            "document": self.document,
            "chunk_index": self.chunk_index,
            "score": round(self.score, 4),
        }


class ResearchAssistant:
    def __init__(
        self,
        index: DocumentIndex,
        embedder: Embedder,
        threshold: float = ABSTAIN_THRESHOLD,
    ):
        self.index = index
        self.embedder = embedder
        self.threshold = threshold

    def ask(self, question: str) -> Answer:
        query_vector = self.embedder.encode([question])[0]
        chunk, score = self.index.search(query_vector, k=1)[0]
        if score < self.threshold:
            return Answer(
                question=question,
                abstained=True,
                text=ABSTAIN_TEXT,
                document=None,
                chunk_index=None,
                score=score,
            )
        sentences = split_sentences(chunk.text)
        if not sentences:
            sentences = [chunk.text]
        sentence_vectors = self.embedder.encode(sentences)
        sims = sentence_vectors @ query_vector
        best = sentences[int(sims.argmax())]
        return Answer(
            question=question,
            abstained=False,
            text=best,
            document=chunk.document,
            chunk_index=chunk.index,
            score=score,
        )
