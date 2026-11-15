from research_assistant.qa import ABSTAIN_TEXT, ResearchAssistant


def test_answer_carries_correct_citation(assistant):
    answer = assistant.ask("How many seconds may a cached response be considered fresh?")
    assert not answer.abstained
    assert answer.document == "caching.txt"
    assert answer.citation == "caching.txt chunk 0"
    assert "max-age" in answer.text


def test_answer_from_second_document(assistant):
    answer = assistant.ask("When is a raft log entry committed?")
    assert not answer.abstained
    assert answer.document == "raft.txt"
    assert "majority of servers" in answer.text


def test_out_of_scope_question_abstains(assistant):
    answer = assistant.ask("How do I bake a chocolate cake?")
    assert answer.abstained
    assert answer.text == ABSTAIN_TEXT
    assert answer.document is None
    assert answer.citation is None


def test_high_threshold_forces_abstention(assistant):
    strict = ResearchAssistant(assistant.index, assistant.embedder, threshold=0.999)
    answer = strict.ask("How many seconds may a cached response be considered fresh?")
    assert answer.abstained


def test_answer_dict_shape(assistant):
    record = assistant.ask("When is a raft log entry committed?").to_dict()
    assert set(record) == {
        "question", "abstained", "answer", "citation",
        "document", "chunk_index", "score",
    }
