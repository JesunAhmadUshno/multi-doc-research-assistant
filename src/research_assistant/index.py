"""The document index: chunks plus their embedding matrix."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from .chunking import chunk_text, iter_documents
from .embeddings import Embedder


@dataclass
class Chunk:
    document: str
    index: int
    text: str

    @property
    def citation(self) -> str:
        return f"{self.document} chunk {self.index}"


class DocumentIndex:
    def __init__(self, chunks: list[Chunk], embeddings: np.ndarray):
        self.chunks = chunks
        self.embeddings = embeddings

    def __len__(self) -> int:
        return len(self.chunks)

    @classmethod
    def build(cls, folder: str | Path, embedder: Embedder) -> "DocumentIndex":
        chunks: list[Chunk] = []
        for name, text in iter_documents(folder):
            for i, piece in enumerate(chunk_text(text)):
                chunks.append(Chunk(document=name, index=i, text=piece))
        if not chunks:
            raise ValueError(f"No readable documents found in {folder}")
        embeddings = embedder.encode([c.text for c in chunks])
        return cls(chunks, embeddings)

    def search(self, query_vector: np.ndarray, k: int = 1) -> list[tuple[Chunk, float]]:
        """Top-k chunks by cosine similarity (embeddings are normalized)."""
        scores = self.embeddings @ query_vector.reshape(-1)
        order = np.argsort(-scores)[:k]
        return [(self.chunks[i], float(scores[i])) for i in order]

    def save(self, folder: str | Path) -> None:
        folder = Path(folder)
        folder.mkdir(parents=True, exist_ok=True)
        np.save(folder / "embeddings.npy", self.embeddings)
        meta = [
            {"document": c.document, "index": c.index, "text": c.text}
            for c in self.chunks
        ]
        (folder / "chunks.json").write_text(json.dumps(meta), encoding="utf-8")

    @classmethod
    def load(cls, folder: str | Path) -> "DocumentIndex":
        folder = Path(folder)
        embeddings = np.load(folder / "embeddings.npy")
        meta = json.loads((folder / "chunks.json").read_text(encoding="utf-8"))
        chunks = [Chunk(m["document"], m["index"], m["text"]) for m in meta]
        return cls(chunks, embeddings)
