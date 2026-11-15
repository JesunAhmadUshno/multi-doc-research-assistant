import data from "./data.json";

const REPO = "https://github.com/JesunAhmadUshno/multi-doc-research-assistant";

function VerdictCard({ title, result, children }) {
  const ok = result.verdict === "CONFIRMED";
  return (
    <section className="card">
      <div className="card-head">
        <h3>{title}</h3>
        <span className={ok ? "pill pill-ok" : "pill pill-bad"}>{result.verdict}</span>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  return (
    <main className="page">
      <header>
        <p className="kicker">Pre-registered abstention study</p>
        <h1>Multi-Doc Research Assistant</h1>
        <p className="lede">
          Can a local retrieval tool answer questions from a folder of
          documents with correct citations, and refuse the questions its
          documents cannot answer? Earlier studies in this portfolio found a
          reference system answering 10 of 12 out-of-corpus questions with
          extractive non-answers. This tool adds one frozen rule: below a
          similarity of {data.threshold}, it says the answer is not in the
          documents.
        </p>
        <p className="links">
          <a href={REPO}>GitHub repo</a>
          <a href={`${REPO}/blob/main/PREREGISTRATION.md`}>Pre-registration</a>
          <a href={`${REPO}/blob/main/RESULTS.md`}>Full results</a>
        </p>
      </header>

      <div className="grid">
        <VerdictCard title="H1: in-corpus accuracy" result={data.h1}>
          <p className="big">
            {data.h1.correct} of {data.h1.total}
          </p>
          <p>
            Questions answered with the correct document cited: rate{" "}
            {data.h1.rate.toFixed(3)} against the frozen line of{" "}
            {data.h1.line.toFixed(2)}.
          </p>
        </VerdictCard>

        <VerdictCard title="H2: abstention" result={data.h2}>
          <p className="big">
            {data.h2.abstained} of {data.h2.total}
          </p>
          <p>
            Out-of-corpus questions refused: rate {data.h2.rate.toFixed(3)}{" "}
            against the frozen line of {data.h2.line.toFixed(2)}. The
            reference failure that motivated the study abstained at{" "}
            {data.h2.reference_failure_abstention_rate}.
          </p>
        </VerdictCard>

        <VerdictCard title="H3: latency" result={data.h3}>
          <p className="big">{data.h3.median_seconds} s</p>
          <p>
            Median per-question latency over {data.h3.measurements}{" "}
            measurements ({data.repetitions} repetitions of the full
            battery), against the frozen line of {data.h3.line_seconds} s.
          </p>
        </VerdictCard>
      </div>

      <section className="card wide">
        <h3>The weak stage, stated plainly</h3>
        <p>
          The cited document is usually right, but the single extracted
          sentence contains the gold answer phrase in only{" "}
          {data.h1.secondary_phrase_hit_rate_among_answered.toFixed(3)} of
          answered questions. Treat the citation as the product and the
          sentence as a pointer. This number is a secondary measure from the
          pre-registration, reported here because it is the honest limit of
          the tool.
        </p>
      </section>

      <section className="card wide">
        <h3>Failure cases, all of them</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kind</th>
              <th>Question</th>
              <th>Score</th>
              <th>Cited</th>
            </tr>
          </thead>
          <tbody>
            {data.failures.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.kind}</td>
                <td>{f.question}</td>
                <td>{f.score.toFixed(4)}</td>
                <td>{f.cited ?? "none (abstained)"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          In-corpus top-1 similarities ran {data.inScoreRange[0].toFixed(3)}{" "}
          to {data.inScoreRange[1].toFixed(3)}. Out-of-corpus ran{" "}
          {data.outScoreRange[0].toFixed(3)} to{" "}
          {data.outScoreRange[1].toFixed(3)}. Every failure sits in the
          overlap band around the threshold.
        </p>
      </section>

      <section className="card wide">
        <h3>Setup</h3>
        <p>
          Corpus: {data.corpus.documents} self-written technical documents,{" "}
          {data.corpus.chunks} chunks of 120 words with a stride of 90.
          Embeddings: {data.model} via model2vec, cosine similarity,
          brute-force search. Answers are extractive sentences from the top
          chunk, cited by document and chunk. No external LLM API anywhere
          in the tool.
        </p>
      </section>

      <footer>
        <p>
          Study scope only: one small self-written corpus, one embedding
          model, one frozen threshold. This is a local tool and a study, not
          a hosted product and not production experience. Full protocol and
          failure analysis in RESULTS.md in the repo.
        </p>
      </footer>
    </main>
  );
}
