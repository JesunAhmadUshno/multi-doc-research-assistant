"""Command line interface.

Examples:
    mdra index --docs ./corpus --index-dir ./.mdra-index
    mdra ask --index-dir ./.mdra-index "How many round trips does TLS 1.3 take?"
    mdra ask --docs ./corpus "What is a tombstone in an LSM tree?"
    mdra serve --index-dir ./.mdra-index --port 8000
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .embeddings import Model2VecEmbedder
from .index import DocumentIndex
from .qa import ResearchAssistant


def _assistant(args) -> ResearchAssistant:
    embedder = Model2VecEmbedder()
    index_dir = Path(args.index_dir)
    if index_dir.exists():
        index = DocumentIndex.load(index_dir)
    elif args.docs:
        index = DocumentIndex.build(args.docs, embedder)
        index.save(index_dir)
    else:
        raise SystemExit("No index found and no --docs folder given to build one.")
    return ResearchAssistant(index, embedder)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="mdra", description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p_index = sub.add_parser("index", help="Build an index from a folder of documents")
    p_index.add_argument("--docs", required=True)
    p_index.add_argument("--index-dir", default=".mdra-index")

    p_ask = sub.add_parser("ask", help="Ask one question")
    p_ask.add_argument("question")
    p_ask.add_argument("--docs", default=None)
    p_ask.add_argument("--index-dir", default=".mdra-index")
    p_ask.add_argument("--json", action="store_true", help="Print the full answer record")

    p_serve = sub.add_parser("serve", help="Serve the FastAPI endpoint")
    p_serve.add_argument("--docs", default=None)
    p_serve.add_argument("--index-dir", default=".mdra-index")
    p_serve.add_argument("--host", default="127.0.0.1")
    p_serve.add_argument("--port", type=int, default=8000)

    args = parser.parse_args(argv)

    if args.command == "index":
        embedder = Model2VecEmbedder()
        index = DocumentIndex.build(args.docs, embedder)
        index.save(args.index_dir)
        print(f"Indexed {len(index)} chunks into {args.index_dir}")
        return 0

    assistant = _assistant(args)

    if args.command == "ask":
        answer = assistant.ask(args.question)
        if args.json:
            print(json.dumps(answer.to_dict(), indent=2))
        elif answer.abstained:
            print(answer.text)
        else:
            print(f"{answer.text}\n[{answer.citation}, score {answer.score:.3f}]")
        return 0

    if args.command == "serve":
        import uvicorn

        from .api import create_app

        uvicorn.run(create_app(assistant), host=args.host, port=args.port)
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
