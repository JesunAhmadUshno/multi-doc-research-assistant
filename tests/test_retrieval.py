from conftest import BagOfWordsEmbedder, CACHING_DOC, RAFT_DOC

from research_assistant.index import DocumentIndex


def _index(docs_dir):
    embedder = BagOfWordsEmbedder([CACHING_DOC, RAFT_DOC])
    return DocumentIndex.build(docs_dir, embedder), embedder


def test_index_covers_both_documents(docs_dir):
    index, _ = _index(docs_dir)
    assert {c.document for c in index.chunks} == {"caching.txt", "raft.txt"}


def test_retrieval_finds_caching_chunk(docs_dir):
    index, embedder = _index(docs_dir)
    q = embedder.encode(["how long does a cached response stay fresh"])[0]
    chunk, score = index.search(q, k=1)[0]
    assert chunk.document == "caching.txt"
    assert score > 0.4


def test_retrieval_finds_raft_chunk(docs_dir):
    index, embedder = _index(docs_dir)
    q = embedder.encode(["when is a log entry committed by the leader"])[0]
    chunk, score = index.search(q, k=1)[0]
    assert chunk.document == "raft.txt"
    assert score > 0.4


def test_save_and_load_roundtrip(docs_dir, tmp_path):
    index, _ = _index(docs_dir)
    index.save(tmp_path / "idx")
    loaded = DocumentIndex.load(tmp_path / "idx")
    assert [c.text for c in loaded.chunks] == [c.text for c in index.chunks]
    assert loaded.embeddings.shape == index.embeddings.shape
