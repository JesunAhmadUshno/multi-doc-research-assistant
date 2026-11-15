from fastapi.testclient import TestClient

from research_assistant.api import create_app


def test_health(assistant):
    client = TestClient(create_app(assistant))
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["chunks"] == len(assistant.index)


def test_ask_endpoint_answers_with_citation(assistant):
    client = TestClient(create_app(assistant))
    response = client.post(
        "/ask", json={"question": "When is a raft log entry committed?"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["abstained"] is False
    assert body["document"] == "raft.txt"


def test_ask_endpoint_abstains(assistant):
    client = TestClient(create_app(assistant))
    response = client.post("/ask", json={"question": "How do I bake a chocolate cake?"})
    assert response.status_code == 200
    body = response.json()
    assert body["abstained"] is True
    assert body["citation"] is None
