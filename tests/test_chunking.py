from pathlib import Path

from research_assistant.chunking import chunk_text, iter_documents, split_sentences


def test_short_text_is_one_chunk():
    assert chunk_text("one two three four five") == ["one two three four five"]


def test_empty_text_has_no_chunks():
    assert chunk_text("   ") == []


def test_long_text_windows_overlap_by_stride():
    words = [f"w{i}" for i in range(300)]
    chunks = chunk_text(" ".join(words), size=120, stride=90)
    assert len(chunks) == 3
    assert chunks[0].split()[0] == "w0"
    assert chunks[1].split()[0] == "w90"
    assert chunks[2].split()[0] == "w180"
    assert len(chunks[0].split()) == 120
    assert len(chunks[2].split()) == 120


def test_iter_documents_reads_supported_only(docs_dir: Path):
    docs = dict(iter_documents(docs_dir))
    assert set(docs) == {"caching.txt", "raft.txt"}
    assert "max-age" in docs["caching.txt"]


def test_markdown_headings_are_stripped(tmp_path: Path):
    (tmp_path / "doc.md").write_text("# Big Title\n\nBody text here.", encoding="utf-8")
    docs = dict(iter_documents(tmp_path))
    assert "#" not in docs["doc.md"]
    assert "Big Title" in docs["doc.md"]


def test_split_sentences_drops_fragments():
    text = "First real sentence here. Tiny. Second real sentence follows now."
    sentences = split_sentences(text)
    assert sentences == ["First real sentence here.", "Second real sentence follows now."]
