"""Minimal FastAPI endpoint for the research assistant."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from .qa import ResearchAssistant


class AskRequest(BaseModel):
    question: str


def create_app(assistant: ResearchAssistant) -> FastAPI:
    app = FastAPI(title="Multi-Doc Research Assistant")

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok", "chunks": len(assistant.index)}

    @app.post("/ask")
    def ask(request: AskRequest) -> dict:
        return assistant.ask(request.question).to_dict()

    return app
