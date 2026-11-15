"""Run the pre-registered abstention study.

Builds the index over corpus/ with the real model2vec embedder, runs the
frozen 50-question battery 5 times, scores H1, H2, and H3 exactly as frozen
in PREREGISTRATION.md, and writes study/results.json.

Usage: python study/run_study.py
"""

from __future__ import annotations

import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from research_assistant.embeddings import DEFAULT_MODEL, Model2VecEmbedder  # noqa: E402
from research_assistant.index import DocumentIndex  # noqa: E402
from research_assistant.qa import ABSTAIN_THRESHOLD, ResearchAssistant  # noqa: E402

REPETITIONS = 5
H1_LINE = 0.80
H2_LINE = 0.80
H3_LINE_SECONDS = 2.0


def main() -> int:
    embedder = Model2VecEmbedder()
    index = DocumentIndex.build(ROOT / "corpus", embedder)
    assistant = ResearchAssistant(index, embedder, threshold=ABSTAIN_THRESHOLD)

    in_questions = json.loads((ROOT / "study" / "questions_in_corpus.json").read_text())
    out_questions = json.loads((ROOT / "study" / "questions_out_of_corpus.json").read_text())

    in_records: dict[str, dict] = {}
    out_records: dict[str, dict] = {}
    latencies: list[float] = []
    outcomes_stable = True

    for rep in range(REPETITIONS):
        for q in in_questions:
            start = time.perf_counter()
            ans = assistant.ask(q["question"])
            latencies.append(time.perf_counter() - start)
            record = {
                "id": q["id"],
                "question": q["question"],
                "gold_doc": q["gold_doc"],
                "gold_phrase": q["gold_phrase"],
                "abstained": ans.abstained,
                "cited_doc": ans.document,
                "chunk_index": ans.chunk_index,
                "score": round(ans.score, 4),
                "answer": ans.text,
                "correct_doc": (not ans.abstained) and ans.document == q["gold_doc"],
                "phrase_hit": bool(
                    ans.text and q["gold_phrase"].lower() in ans.text.lower()
                ),
            }
            if rep == 0:
                in_records[q["id"]] = record
            elif in_records[q["id"]] != record:
                outcomes_stable = False
        for q in out_questions:
            start = time.perf_counter()
            ans = assistant.ask(q["question"])
            latencies.append(time.perf_counter() - start)
            record = {
                "id": q["id"],
                "question": q["question"],
                "abstained": ans.abstained,
                "cited_doc": ans.document,
                "chunk_index": ans.chunk_index,
                "score": round(ans.score, 4),
                "answer": ans.text,
            }
            if rep == 0:
                out_records[q["id"]] = record
            elif out_records[q["id"]] != record:
                outcomes_stable = False

    in_list = [in_records[q["id"]] for q in in_questions]
    out_list = [out_records[q["id"]] for q in out_questions]

    h1_rate = sum(r["correct_doc"] for r in in_list) / len(in_list)
    answered = [r for r in in_list if not r["abstained"]]
    phrase_rate = (
        sum(r["phrase_hit"] for r in answered) / len(answered) if answered else 0.0
    )
    h2_rate = sum(r["abstained"] for r in out_list) / len(out_list)
    median_latency = statistics.median(latencies)

    results = {
        "model": DEFAULT_MODEL,
        "threshold": ABSTAIN_THRESHOLD,
        "repetitions": REPETITIONS,
        "outcomes_stable_across_repetitions": outcomes_stable,
        "corpus": {
            "documents": len({c.document for c in index.chunks}),
            "chunks": len(index.chunks),
        },
        "h1": {
            "line": H1_LINE,
            "rate": round(h1_rate, 4),
            "correct": sum(r["correct_doc"] for r in in_list),
            "total": len(in_list),
            "verdict": "CONFIRMED" if h1_rate >= H1_LINE else "REFUTED",
            "secondary_phrase_hit_rate_among_answered": round(phrase_rate, 4),
        },
        "h2": {
            "line": H2_LINE,
            "rate": round(h2_rate, 4),
            "abstained": sum(r["abstained"] for r in out_list),
            "total": len(out_list),
            "verdict": "CONFIRMED" if h2_rate >= H2_LINE else "REFUTED",
            "reference_failure_abstention_rate": 0.167,
        },
        "h3": {
            "line_seconds": H3_LINE_SECONDS,
            "median_seconds": round(median_latency, 4),
            "measurements": len(latencies),
            "verdict": "CONFIRMED" if median_latency <= H3_LINE_SECONDS else "REFUTED",
        },
        "in_corpus": in_list,
        "out_of_corpus": out_list,
    }

    out_path = ROOT / "study" / "results.json"
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"H1 {results['h1']['verdict']}: {h1_rate:.3f} (line {H1_LINE})")
    print(f"H2 {results['h2']['verdict']}: {h2_rate:.3f} (line {H2_LINE})")
    print(f"H3 {results['h3']['verdict']}: median {median_latency:.4f}s (line {H3_LINE_SECONDS})")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
