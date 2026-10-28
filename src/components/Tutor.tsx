"use client";

import { useState, type FormEvent } from "react";
import type { Source } from "@/lib/schema";
import type { Passage } from "@/lib/retrieval";
import type { TutorResponse } from "@/lib/tutor";
import { SourceRefs, StatusMark } from "./Evidence";

const EXAMPLES = [
  "What does negative-sense RNA mean?",
  "How do influenza A and SARS-CoV-2 differ?",
  "Why is an envelope different from a capsid?",
  "What can't the T4 diagram tell me?",
  "Do all viruses have an envelope and a capsid?",
];

const CURATED_REASON: Record<string, string> = {
  no_key: "No AI key is configured, so these are curated passages matched by search. Nothing below is AI-generated.",
  invalid_output: "The AI answer failed citation checks and was discarded. Showing the curated passages instead.",
  model_error: "The AI service could not be reached. Showing the curated passages instead.",
  refusal: "The AI declined this question. Showing the curated passages instead.",
};

function PassageCard({ p, sources }: { p: Passage; sources: Source[] }) {
  return (
    <li className="border-t border-hairline pt-3">
      <p className="text-[15px] font-semibold text-ink">{p.title}</p>
      <p className="text-[15px] mt-1 measure">{p.text}</p>
      <p className="mt-1 flex flex-wrap gap-x-3 items-center">
        <StatusMark status={p.status} />
        <SourceRefs ids={p.sourceIds} sources={sources} />
      </p>
    </li>
  );
}

export function Tutor({ sources }: { sources: Source[] }) {
  const [q, setQ] = useState("");
  const [simple, setSimple] = useState(false);
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; error?: string; data?: TutorResponse }>({ status: "idle" });

  const ask = async (question: string) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/tutor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, simple }) });
      const json = await res.json();
      if (!res.ok) return setState({ status: "error", error: json.error ?? "Something went wrong." });
      setState({ status: "idle", data: json as TutorResponse });
    } catch {
      setState({ status: "error", error: "Could not reach the tutor. Check that the dev server is running, then try again." });
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim().length >= 3) ask(q.trim());
  };

  const d = state.data;
  const byId = (id: string) => d?.passages.find((p) => p.id === id);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label htmlFor="tutor-q" className="text-[15px] font-semibold text-ink">
            Your question
          </label>
          <textarea id="tutor-q" className="input min-h-[96px]" maxLength={500} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about structure, size, genomes, classification or replication" />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary" disabled={state.status === "loading" || q.trim().length < 3}>
              {state.status === "loading" ? "Thinking…" : "Ask"}
            </button>
            <label className="flex items-center gap-2 text-[15px] cursor-pointer">
              <input type="checkbox" checked={simple} onChange={(e) => setSimple(e.target.checked)} className="w-4 h-4 accent-[var(--ink)]" />
              Simpler explanation
            </label>
          </div>
        </form>

        <div className="mt-8" aria-live="polite">
          {state.status === "error" && <p className="panel p-5 text-[var(--danger)]">{state.error}</p>}
          {d?.mode === "declined" && (
            <div className="panel p-6">
              <p className="text-[13px] text-mute">Not answered</p>
              <p className="mt-1 text-[16px] text-ink">{d.message}</p>
            </div>
          )}
          {d?.mode === "curated" && (
            <div>
              <p className="panel p-4 text-[14px]">{CURATED_REASON[d.reason]}</p>
              {d.passages.length ? (
                <ul className="mt-6 flex flex-col gap-4">
                  {d.passages.map((p) => (
                    <PassageCard key={p.id} p={p} sources={sources} />
                  ))}
                </ul>
              ) : (
                <p className="mt-4">No curated passage matches this question. Try naming a virus or a term such as capsid, envelope or segmented.</p>
              )}
            </div>
          )}
          {d?.mode === "generated" && (
            <div className="panel p-6">
              <p className="text-[13px] text-mute">AI-generated from the curated passages below. Check the citations.</p>
              {d.output.premise_correction && (
                <p className="mt-3 text-[16px] text-ink border-l border-hairline pl-3">
                  <strong>A correction first.</strong> {d.output.premise_correction}
                </p>
              )}
              {d.output.paragraphs.map((p, i) => (
                <div key={i} className="mt-3">
                  <p className="text-[16px] text-ink measure">{p.text}</p>
                  <p className="text-[13px] text-mute mt-1">
                    Based on:{" "}
                    {p.passage_ids.map((id, j) => (
                      <span key={id}>
                        {j ? "; " : ""}
                        {byId(id)?.title}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
              {d.output.limitations && <p className="mt-4 text-[14px] text-mute measure">Limits: {d.output.limitations}</p>}
              <details className="mt-5">
                <summary className="cursor-pointer text-[14px] text-link">Show the {d.passages.length} retrieved passages and sources</summary>
                <ul className="mt-3 flex flex-col gap-4">
                  {d.passages.map((p) => (
                    <PassageCard key={p.id} p={p} sources={sources} />
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
      </div>

      <aside>
        <h2 className="text-[15px] font-semibold text-ink mb-2">Try asking</h2>
        <ul className="flex flex-col gap-1">
          {EXAMPLES.map((e) => (
            <li key={e}>
              <button
                type="button"
                className="text-left w-full min-h-10 px-3 rounded-md hover:bg-sunk text-[15px] text-link"
                onClick={() => {
                  setQ(e);
                  ask(e);
                }}
              >
                {e}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
