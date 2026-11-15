"""Document loading, chunking, and sentence splitting."""

from __future__ import annotations

import re
from pathlib import Path

SUPPORTED_SUFFIXES = {".txt", ".md", ".pdf"}

CHUNK_WORDS = 120
CHUNK_STRIDE = 90


def load_document(path: Path) -> str:
    """Read one document to plain text. PDF support uses pypdf."""
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md"}:
        text = path.read_text(encoding="utf-8", errors="replace")
        if suffix == ".md":
            text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
        return text
    if suffix == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    raise ValueError(f"Unsupported document type: {path.name}")


def iter_documents(folder: str | Path) -> list[tuple[str, str]]:
    """Return (name, text) pairs for every supported document, name-sorted."""
    folder = Path(folder)
    docs = []
    for path in sorted(folder.iterdir()):
        if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES:
            docs.append((path.name, load_document(path)))
    return docs


def chunk_text(text: str, size: int = CHUNK_WORDS, stride: int = CHUNK_STRIDE) -> list[str]:
    """Sliding word windows. A short document yields exactly one chunk."""
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while True:
        chunks.append(" ".join(words[start : start + size]))
        if start + size >= len(words):
            break
        start += stride
    return chunks


_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def split_sentences(text: str) -> list[str]:
    """Split chunk text into sentences, dropping fragments under 3 words."""
    flat = re.sub(r"\s+", " ", text).strip()
    if not flat:
        return []
    parts = _SENTENCE_SPLIT.split(flat)
    return [p.strip() for p in parts if len(p.split()) >= 3]
