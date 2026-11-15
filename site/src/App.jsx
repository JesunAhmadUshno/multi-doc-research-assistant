import { useMemo, useState } from "react";
import data from "./data.json";

const REPO = "https://github.com/JesunAhmadUshno/multi-doc-research-assistant";

function isFailure(q) {
  return q.set === "in" ? !q.correct_doc : !q.abstained;
}

function outcomeOf(q) {
  if (q.set === "in") {
    return q.abstained ? "Abstained" : "Answered, correct document";
  }
  return q.abstained ? "Abstained" : "Answered";
}

function Diagram() {
  return (
    <figure className="diagram-wrap">
      <svg
        className="system-diagram"
        viewBox="0 0 1160 408"
        role="img"
        aria-label="System diagram: documents are chunked, embedded, and indexed; a question retrieves the top chunk, a threshold gate at 0.40 decides between an answer with a citation and an abstention"
      >
        <defs>
          <marker
            id="dg-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="dg-arrowhead" />
          </marker>
        </defs>

        <g>
          <rect className="dg-box" x="8" y="24" width="196" height="92" rx="10" />
          <text className="dg-title" x="28" y="62">Documents</text>
          <text className="dg-measured" x="28" y="90">16 files</text>
        </g>
        <line className="dg-link" x1="204" y1="70" x2="238" y2="70" markerEnd="url(#dg-arrow)" />
        <g>
          <rect className="dg-box" x="246" y="24" width="196" height="92" rx="10" />
          <text className="dg-title" x="266" y="62">Chunk</text>
          <text className="dg-measured" x="266" y="90">120 words, stride 90</text>
        </g>
        <line className="dg-link" x1="442" y1="70" x2="476" y2="70" markerEnd="url(#dg-arrow)" />
        <g>
          <rect className="dg-box" x="484" y="24" width="196" height="92" rx="10" />
          <text className="dg-title" x="504" y="62">Embed</text>
          <text className="dg-measured" x="504" y="90">potion-base-8M</text>
        </g>
        <line className="dg-link" x1="680" y1="70" x2="714" y2="70" markerEnd="url(#dg-arrow)" />
        <g>
          <rect className="dg-box" x="722" y="24" width="196" height="92" rx="10" />
          <text className="dg-title" x="742" y="62">Index</text>
          <text className="dg-measured" x="742" y="90">62 chunks, cosine</text>
        </g>
        <line className="dg-link" x1="918" y1="70" x2="952" y2="70" markerEnd="url(#dg-arrow)" />
        <g>
          <rect className="dg-box" x="960" y="24" width="192" height="92" rx="10" />
          <text className="dg-title" x="980" y="62">Retrieve</text>
          <text className="dg-measured" x="980" y="90">top chunk wins</text>
        </g>

        <line className="dg-link" x1="1056" y1="116" x2="1056" y2="152" markerEnd="url(#dg-arrow)" />
        <g>
          <polygon
            className="dg-gate"
            points="1056,160 1152,222 1056,284 960,222"
          />
          <text className="dg-title dg-centre" x="1056" y="216">Threshold gate</text>
          <text className="dg-measured dg-centre" x="1056" y="242">score at least 0.40</text>
        </g>

        <line className="dg-link" x1="1000" y1="262" x2="760" y2="318" markerEnd="url(#dg-arrow)" />
        <line className="dg-link" x1="1112" y1="262" x2="1112" y2="310" markerEnd="url(#dg-arrow)" />
        <text className="dg-note" x="806" y="286">yes</text>
        <text className="dg-note" x="1120" y="292">no</text>

        <g>
          <rect className="dg-box" x="470" y="322" width="300" height="72" rx="10" />
          <text className="dg-title" x="490" y="352">Answer with citation</text>
          <text className="dg-measured" x="490" y="378">document and chunk named</text>
        </g>
        <g>
          <rect className="dg-box dg-box-abstain" x="962" y="322" width="190" height="72" rx="10" />
          <text className="dg-title" x="982" y="352">Abstain</text>
          <text className="dg-quote" x="982" y="378">Not in the documents.</text>
        </g>
      </svg>
      <figcaption>
        The pipeline the study froze. Every question in the study passed
        through the gate at 0.40, the threshold set before any measurement.
      </figcaption>
    </figure>
  );
}

function VerdictPanel({ title, result, reading, children }) {
  return (
    <article className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        <span className="verdict" role="status">{result.verdict}</span>
      </div>
      <p className="reading">{reading}</p>
      <p className="panel-body">{children}</p>
    </article>
  );
}

function Explorer() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("id");
  const [openId, setOpenId] = useState(null);

  const counts = useMemo(() => {
    const all = data.questions.length;
    const inc = data.questions.filter((q) => q.set === "in").length;
    const out = all - inc;
    const fails = data.questions.filter(isFailure).length;
    return { all, inc, out, fails };
  }, []);

  const rows = useMemo(() => {
    let list = data.questions.slice();
    if (filter === "in") list = list.filter((q) => q.set === "in");
    if (filter === "out") list = list.filter((q) => q.set === "out");
    if (filter === "failures") list = list.filter(isFailure);
    const needle = query.trim().toLowerCase();
    if (needle) {
      list = list.filter((q) =>
        [q.id, q.question, q.cited_doc || "", q.gold_doc || ""]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
    if (sort === "score-desc") list.sort((a, b) => b.score - a.score);
    if (sort === "score-asc") list.sort((a, b) => a.score - b.score);
    if (sort === "id") list.sort((a, b) => a.id.localeCompare(b.id));
    return list;
  }, [filter, query, sort]);

  const filters = [
    ["all", `All questions (${counts.all})`],
    ["in", `In-corpus (${counts.inc})`],
    ["out", `Out-of-corpus (${counts.out})`],
    ["failures", `Failures only (${counts.fails})`],
  ];

  return (
    <div>
      <div className="controls">
        <div className="chip-row" role="group" aria-label="Filter questions">
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="control-fields">
          <div className="field">
            <label htmlFor="q-search">Search the questions</label>
            <input
              id="q-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try queue, TLS, or a document name"
            />
          </div>
          <div className="field">
            <label htmlFor="q-sort">Sort by</label>
            <select
              id="q-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="id">Question id</option>
              <option value="score-desc">Score, high to low</option>
              <option value="score-asc">Score, low to high</option>
            </select>
          </div>
        </div>
      </div>

      <p className="count-line" role="status">
        Showing {rows.length} of {counts.all} questions. The threshold is{" "}
        {data.threshold.toFixed(2)}: a score below it abstains.
      </p>

      <div className="table-scroll">
        <table className="qtable">
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Question</th>
              <th scope="col">Score</th>
              <th scope="col">Outcome</th>
              <th scope="col">Cited document</th>
              <th scope="col">
                <span className="visually-hidden">Row detail</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => {
              const fail = isFailure(q);
              const open = openId === q.id;
              return [
                <tr key={q.id} className={fail ? "row row-fail" : "row"}>
                  <td className="measured">{q.id}</td>
                  <td>{q.question}</td>
                  <td>
                    <span className="measured">{q.score.toFixed(4)}</span>
                    <span
                      className={fail ? "meter meter-fail" : "meter"}
                      aria-hidden="true"
                    >
                      <span style={{ width: `${Math.round(q.score * 100)}%` }} />
                    </span>
                  </td>
                  <td>
                    {outcomeOf(q)}
                    {fail ? <span className="fail-tag">failure</span> : null}
                  </td>
                  <td className="measured">{q.cited_doc ?? "none"}</td>
                  <td>
                    <button
                      type="button"
                      className="detail-btn"
                      aria-expanded={open}
                      aria-controls={`detail-${q.id}`}
                      onClick={() => setOpenId(open ? null : q.id)}
                    >
                      {open ? "Hide" : "Detail"}
                    </button>
                  </td>
                </tr>,
                open ? (
                  <tr key={`${q.id}-detail`} className="detail-row">
                    <td colSpan="6" id={`detail-${q.id}`}>
                      <p className="detail-answer">{q.answer}</p>
                      <dl className="detail-facts">
                        {q.set === "in" ? (
                          <>
                            <div>
                              <dt>Gold document</dt>
                              <dd className="measured">{q.gold_doc}</dd>
                            </div>
                            <div>
                              <dt>Gold phrase</dt>
                              <dd>{q.gold_phrase}</dd>
                            </div>
                            <div>
                              <dt>Phrase in the extracted sentence</dt>
                              <dd>{q.phrase_hit ? "yes" : "no"}</dd>
                            </div>
                            <div>
                              <dt>Chunk cited</dt>
                              <dd className="measured">
                                {q.chunk_index ?? "none"}
                              </dd>
                            </div>
                          </>
                        ) : (
                          <div>
                            <dt>Expected behaviour</dt>
                            <dd>Abstain, the documents cannot answer this</dd>
                          </div>
                        )}
                      </dl>
                    </td>
                  </tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="empty-line">
          No question matches that search. Clear the search or pick another
          filter.
        </p>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <div className="page">
      <header className="site-head">
        <div className="container head-inner">
          <a className="wordmark" href="#top" aria-label="Multi-doc research assistant, back to top">
            Multi-doc research assistant
          </a>
          <nav className="head-nav" aria-label="Sections">
            <a href="#system">System</a>
            <a href="#verdicts">Verdicts</a>
            <a href="#questions">Questions</a>
            <a href="#failures">Failures</a>
            <a href={REPO}>GitHub repo</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container">
            <h1>Multi-Doc Research Assistant</h1>
            <p className="lead">
              Answers from a folder of documents, with citations, and refuses
              the rest.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={`${REPO}/blob/main/RESULTS.md`}>
                Full results
              </a>
              <a className="btn" href={`${REPO}/blob/main/PREREGISTRATION.md`}>
                Pre-registration
              </a>
              <a className="text-link" href={REPO}>
                GitHub repo
              </a>
            </div>
            <dl className="hero-facts">
              <div>
                <dt>Threshold</dt>
                <dd className="measured">{data.threshold.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Documents</dt>
                <dd className="measured">{data.corpus.documents}</dd>
              </div>
              <div>
                <dt>Chunks</dt>
                <dd className="measured">{data.corpus.chunks}</dd>
              </div>
              <div>
                <dt>Repetitions</dt>
                <dd className="measured">{data.repetitions}</dd>
              </div>
              <div>
                <dt>Embedding model</dt>
                <dd className="measured">{data.model}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section">
          <div className="container split-head">
            <h2>What the study asked</h2>
            <p className="section-body">
              Can a local retrieval tool answer questions from a folder of
              documents with correct citations, and refuse the questions its
              documents cannot answer? Earlier studies in this portfolio found
              a reference system answering 10 of 12 out-of-corpus questions
              with extractive non-answers. This tool adds one frozen rule:
              below a similarity of {data.threshold}, it says the answer is
              not in the documents.
            </p>
          </div>
        </section>

        <section className="section band" id="system">
          <div className="container">
            <h2>How the tool works</h2>
            <Diagram />
          </div>
        </section>

        <section className="section" id="verdicts">
          <div className="container">
            <h2>Verdicts on the frozen lines</h2>
            <div className="panels">
              <VerdictPanel
                title="H1: in-corpus accuracy"
                result={data.h1}
                reading={`${data.h1.correct} of ${data.h1.total}`}
              >
                Questions answered with the correct document cited: rate{" "}
                {data.h1.rate.toFixed(3)} against the frozen line of{" "}
                {data.h1.line.toFixed(2)}.
              </VerdictPanel>
              <VerdictPanel
                title="H2: abstention"
                result={data.h2}
                reading={`${data.h2.abstained} of ${data.h2.total}`}
              >
                Out-of-corpus questions refused: rate{" "}
                {data.h2.rate.toFixed(3)} against the frozen line of{" "}
                {data.h2.line.toFixed(2)}. The reference failure that
                motivated the study abstained at{" "}
                {data.h2.reference_failure_abstention_rate}.
              </VerdictPanel>
              <VerdictPanel
                title="H3: latency"
                result={data.h3}
                reading={`${data.h3.median_seconds} s`}
              >
                Median per-question latency over {data.h3.measurements}{" "}
                measurements ({data.repetitions} repetitions of the full
                battery), against the frozen line of {data.h3.line_seconds}{" "}
                s.
              </VerdictPanel>
            </div>
          </div>
        </section>

        <section className="section band">
          <div className="container split-head">
            <h2>The weak stage, stated plainly</h2>
            <p className="section-body">
              The cited document is usually right, but the single extracted
              sentence contains the gold answer phrase in only{" "}
              {data.h1.secondary_phrase_hit_rate_among_answered.toFixed(3)}{" "}
              of answered questions. Treat the citation as the product and
              the sentence as a pointer. This number is a secondary measure
              from the pre-registration, reported here because it is the
              honest limit of the tool.
            </p>
          </div>
        </section>

        <section className="section" id="questions">
          <div className="container">
            <h2>Every question, explorable</h2>
            <p className="section-line">
              All {data.questions.length} frozen questions with their measured
              scores. Open a row to see the sentence the tool returned.
            </p>
            <Explorer />
          </div>
        </section>

        <section className="section band" id="failures">
          <div className="container">
            <h2>Failure cases, all of them</h2>
            <div className="table-scroll">
              <table className="qtable">
                <thead>
                  <tr>
                    <th scope="col">Id</th>
                    <th scope="col">Kind</th>
                    <th scope="col">Question</th>
                    <th scope="col">Score</th>
                    <th scope="col">Cited</th>
                  </tr>
                </thead>
                <tbody>
                  {data.failures.map((f) => (
                    <tr key={f.id} className="row row-fail">
                      <td className="measured">{f.id}</td>
                      <td>{f.kind}</td>
                      <td>{f.question}</td>
                      <td className="measured">{f.score.toFixed(4)}</td>
                      <td className="measured">{f.cited ?? "none (abstained)"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="section-body">
              In-corpus top-1 similarities ran{" "}
              {data.inScoreRange[0].toFixed(3)} to{" "}
              {data.inScoreRange[1].toFixed(3)}. Out-of-corpus ran{" "}
              {data.outScoreRange[0].toFixed(3)} to{" "}
              {data.outScoreRange[1].toFixed(3)}. Every failure sits in the
              overlap band around the threshold.
            </p>
          </div>
        </section>

        <section className="section" id="setup">
          <div className="container split-head">
            <h2>Setup</h2>
            <p className="section-body">
              Corpus: {data.corpus.documents} self-written technical
              documents, {data.corpus.chunks} chunks of 120 words with a
              stride of 90. Embeddings: {data.model} via model2vec, cosine
              similarity, brute-force search. Answers are extractive
              sentences from the top chunk, cited by document and chunk. No
              external LLM API anywhere in the tool.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="container">
          <p className="foot-claim">
            Study scope only: one small self-written corpus, one embedding
            model, one frozen threshold. This is a local tool and a study,
            not a hosted product and not production experience. Full protocol
            and failure analysis in RESULTS.md in the repo.
          </p>
          <p className="foot-line">
            Every figure on this page is generated at build time from
            study/results.json in the repo, so the page cannot drift from
            the measured record.
          </p>
          <p className="foot-links">
            <a href={REPO}>GitHub repo</a>
            <a href={`${REPO}/blob/main/PREREGISTRATION.md`}>Pre-registration</a>
            <a href={`${REPO}/blob/main/RESULTS.md`}>Full results</a>
          </p>
          <p className="support">
            <a href="https://github.com/sponsors/JesunAhmadUshno">Sponsor this work</a>
            <a href="https://calendly.com/jesunahmadushno/30min">Work with me</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
