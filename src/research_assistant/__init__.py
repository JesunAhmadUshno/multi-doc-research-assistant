"""Local multi-document research assistant.

Indexes a folder of documents, embeds chunks locally with model2vec, and
answers questions with extractive, cited answers. When the retrieved
evidence is below a frozen similarity threshold, the assistant abstains.
"""

__version__ = "0.1.0"
