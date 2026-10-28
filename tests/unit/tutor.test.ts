import { describe, expect, it } from "vitest";
import { diagrams, sources, viruses } from "@/lib/data";
import { glossary } from "@/data/glossary";
import { buildPassages, namedViruses, search } from "@/lib/retrieval";
import { scopeCheck, TutorOutput, userPrompt, validateCitations } from "@/lib/tutor";

const passages = buildPassages(viruses, diagrams, glossary);

describe("retrieval", () => {
  it("every passage cites real sources", () => {
    const ids = new Set(sources.map((s) => s.id));
    for (const p of passages) {
      if (p.status !== "not_verified") expect(p.sourceIds.length, p.id).toBeGreaterThan(0);
      for (const id of p.sourceIds) expect(ids).toContain(id);
    }
  });
  it("finds the glossary entry for negative-sense RNA", () => {
    expect(search(passages, "What does negative-sense RNA mean?", viruses)[0].id).toBe("g-negative-sense");
  });
  it("finds envelope vs capsid", () => {
    expect(search(passages, "Why is an envelope different from a capsid?", viruses).map((p) => p.id)).toContain("g-envelope-capsid");
  });
  it("focuses on named viruses", () => {
    expect(namedViruses("how do flu and covid differ", viruses).sort()).toEqual(["influenza-a", "sars-cov-2"]);
    const hits = search(passages, "How does phage T4 deliver its genome?", viruses);
    expect(hits[0].virusId).toBe("phage-t4");
  });
  it("returns nothing for off-topic questions", () => {
    expect(search(passages, "best pizza recipe", viruses)).toEqual([]);
  });
});

describe("tutor guardrails", () => {
  it("declines personal medical questions", () => {
    expect(scopeCheck("I have a fever, do I have influenza?")).not.toBeNull();
    expect(scopeCheck("Should I take antivirals?")).not.toBeNull();
    expect(scopeCheck("What does negative-sense RNA mean?")).toBeNull();
  });
  it("wraps passages as data, separate from the question", () => {
    const prompt = userPrompt("q?", passages.slice(0, 1), true);
    expect(prompt).toMatch(/^<passages>/);
    expect(prompt).toMatch(/introductory/);
  });
  it("rejects malformed model output", () => {
    expect(TutorOutput.safeParse({ outcome: "answer", paragraphs: "x" }).success).toBe(false);
  });
  it("rejects uncited paragraphs and citations to passages that were not retrieved", () => {
    const base = { outcome: "answer" as const, premise_correction: null, limitations: "" };
    expect(validateCitations({ ...base, paragraphs: [{ text: "a", passage_ids: ["p1"] }] }, ["p1"]).ok).toBe(true);
    expect(validateCitations({ ...base, paragraphs: [{ text: "a", passage_ids: [] }] }, ["p1"]).ok).toBe(false);
    expect(validateCitations({ ...base, paragraphs: [{ text: "a", passage_ids: ["invented"] }] }, ["p1"]).ok).toBe(false);
    expect(validateCitations({ ...base, paragraphs: [] }, ["p1"]).ok).toBe(false);
    expect(validateCitations({ ...base, outcome: "decline", paragraphs: [] }, []).ok).toBe(true);
  });
});
