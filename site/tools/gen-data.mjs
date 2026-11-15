// Generates src/data.json from the committed study results, so the site
// can never drift from the measured record in study/results.json.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const results = JSON.parse(
  readFileSync(join(here, "..", "..", "study", "results.json"), "utf-8")
);

const inScores = results.in_corpus.map((r) => r.score);
const outScores = results.out_of_corpus.map((r) => r.score);

const data = {
  model: results.model,
  threshold: results.threshold,
  repetitions: results.repetitions,
  corpus: results.corpus,
  h1: results.h1,
  h2: results.h2,
  h3: results.h3,
  inScoreRange: [Math.min(...inScores), Math.max(...inScores)],
  outScoreRange: [Math.min(...outScores), Math.max(...outScores)],
  questions: [
    ...results.in_corpus.map((r) => ({ ...r, set: "in" })),
    ...results.out_of_corpus.map((r) => ({ ...r, set: "out" })),
  ],
  failures: [
    ...results.in_corpus
      .filter((r) => !r.correct_doc)
      .map((r) => ({
        id: r.id,
        kind: r.abstained ? "In-corpus, abstained" : "In-corpus, wrong document",
        question: r.question,
        score: r.score,
        cited: r.cited_doc,
      })),
    ...results.out_of_corpus
      .filter((r) => !r.abstained)
      .map((r) => ({
        id: r.id,
        kind: "Out-of-corpus, answered",
        question: r.question,
        score: r.score,
        cited: r.cited_doc,
      })),
  ],
};

writeFileSync(join(here, "..", "src", "data.json"), JSON.stringify(data, null, 2));
console.log("data.json written from study/results.json");
