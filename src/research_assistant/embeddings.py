"""Embedding providers. The real one is model2vec; tests inject stubs."""

from __future__ import annotations

from typing import Protocol

import numpy as np

DEFAULT_MODEL = "minishlab/potion-base-8M"


def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    vectors = np.asarray(vectors, dtype=np.float64)
    if vectors.ndim == 1:
        vectors = vectors.reshape(1, -1)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0.0] = 1.0
    return vectors / norms


class Embedder(Protocol):
    def encode(self, texts: list[str]) -> np.ndarray:
        """Return one L2-normalized vector per text."""
        ...


class Model2VecEmbedder:
    """Static embeddings from model2vec. Runs fully offline after the
    one-time model download."""

    def __init__(self, model_name: str = DEFAULT_MODEL):
        self.model_name = model_name
        self._model = None

    def _load(self):
        if self._model is None:
            from model2vec import StaticModel

            self._model = StaticModel.from_pretrained(self.model_name)
        return self._model

    def encode(self, texts: list[str]) -> np.ndarray:
        model = self._load()
        return l2_normalize(np.array(model.encode(texts)))
