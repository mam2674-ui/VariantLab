import type { DiagramSpec, EvidenceStatus, Virus } from "./schema";
import type { GlossaryEntry } from "@/data/glossary";
import { formatDimension, formatKb, formatNt } from "./units";
import { genomeClass } from "./filter";

/** A unit of curated text that search and the tutor can cite. */
export interface Passage {
  id: string;
  title: string;
  text: string;
  virusId?: string;
  status: EvidenceStatus;
  sourceIds: string[];
  kind: "glossary" | "fact" | "diagram" | "replication";
}

const uniq = (xs: string[]) => [...new Set(xs)];

export function buildPassages(viruses: Virus[], diagrams: DiagramSpec[], glossary: GlossaryEntry[]): Passage[] {
  const out: Passage[] = glossary.map((g) => ({
    id: g.id,
    title: g.term,
    text: `${g.term} (${g.aliases.join(", ")}). ${g.text}`,
    status: g.status,
    sourceIds: g.sourceIds,
    kind: "glossary",
  }));
  for (const v of viruses) {
    const n = v.commonName;
    const g = v.genome;
    out.push({
      id: `${v.id}-genome`,
      title: `${n}: genome`,
      text: `${n} (${v.abbreviation}) has a ${genomeClass(v)} genome: ${g.strandedness.value}-stranded ${g.nucleicAcid.value}, ${g.sense.value ? `${g.sense.value}-sense, ` : ""}${g.topology.value}, ${g.segmented.value ? `segmented into ${g.segmentCount.value} segments` : "unsegmented"}, about ${g.lengthKb.value ? formatKb(g.lengthKb.value) : "unknown length"} (reference ${g.referenceLengthNt.value ? formatNt(g.referenceLengthNt.value) : "?"} ${g.strandedness.value === "double" ? "bp" : "nt"}). Baltimore class ${v.baltimore.value}.`,
      virusId: v.id,
      status: "verified",
      sourceIds: uniq([...g.nucleicAcid.sourceIds, ...g.lengthKb.sourceIds, ...g.referenceLengthNt.sourceIds, ...v.baltimore.sourceIds]),
      kind: "fact",
    });
    out.push({
      id: `${v.id}-structure`,
      title: `${n}: structure`,
      text: `${n} is ${v.envelope.value ? "enveloped" : "non-enveloped"}. Capsid: ${v.capsid.value} Morphology: ${v.morphology.value}${v.morphology.note ? ` (${v.morphology.note})` : ""}.`,
      virusId: v.id,
      status: v.morphology.status === "variable" ? "variable" : "verified",
      sourceIds: uniq([...v.envelope.sourceIds, ...v.capsid.sourceIds, ...v.morphology.sourceIds]),
      kind: "fact",
    });
    out.push({
      id: `${v.id}-size`,
      title: `${n}: size`,
      text: `${n} dimensions: ${v.dimensions.map((d) => `${d.label} ${formatDimension(d)} (${d.scope}-level${d.note ? `; ${d.note}` : ""})`).join("; ")}.`,
      virusId: v.id,
      status: v.dimensions.some((d) => d.status === "variable") ? "variable" : "verified",
      sourceIds: uniq(v.dimensions.flatMap((d) => d.sourceIds)),
      kind: "fact",
    });
    out.push({
      id: `${v.id}-taxonomy`,
      title: `${n}: classification and host`,
      text: `${n} belongs to ICTV species ${v.taxonomy.species}, genus ${v.taxonomy.genus}, family ${v.taxonomy.family}, order ${v.taxonomy.order}, realm ${v.taxonomy.realm} (${v.taxonomy.msl}). Host category: ${v.hostDetail.value}.`,
      virusId: v.id,
      status: "verified",
      sourceIds: uniq([...v.taxonomy.sourceIds, ...v.hostDetail.sourceIds]),
      kind: "fact",
    });
    out.push({
      id: `${v.id}-replication`,
      title: `${n}: replication overview`,
      text: `${n} replicates in: ${v.replication.site.value}. Route to mRNA: ${v.replication.mRNARoute.value} Stages: ${v.replication.steps.map((s) => `${s.title}: ${s.text}${s.status === "not_verified" ? " [not verified]" : ""}`).join(" ")}`,
      virusId: v.id,
      status: v.replication.site.status === "not_verified" ? "not_verified" : "verified",
      sourceIds: uniq([...v.replication.site.sourceIds, ...v.replication.mRNARoute.sourceIds, ...v.replication.steps.flatMap((s) => s.sourceIds)]),
      kind: "replication",
    });
  }
  for (const d of diagrams) {
    const v = viruses.find((x) => x.id === d.virusId);
    if (!v) continue;
    out.push({
      id: `${d.id}-diagram`,
      title: `${v.commonName}: diagram components and limits`,
      text: `The ${v.commonName} schematic shows: ${d.components.map((c) => `${c.labelDetailed} (${c.description})`).join(" ")} What it cannot show: ${d.cannotShow.join(" ")}`,
      virusId: v.id,
      status: "simplified",
      sourceIds: uniq(d.components.flatMap((c) => c.sourceIds)),
      kind: "diagram",
    });
  }
  return out;
}

const STOP = new Set(
  "a an the and or of to in on for is are be what how why does do did this that these those with as by it its from can cannot me my i you your about between vs versus two which there their than".split(" "),
);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[−–]/g, "-")
    .replace(/[^a-z0-9+\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

const ALIASES: Record<string, string[]> = {
  "influenza-a": ["influenza", "flu"],
  "sars-cov-2": ["sars", "covid", "coronavirus"],
  "hsv-1": ["herpes", "hsv"],
  "human-adenovirus-5": ["adenovirus", "hadv"],
  "hpv-16": ["papilloma", "papillomavirus", "hpv"],
  "phage-t4": ["t4", "phage", "bacteriophage"],
};

export function namedViruses(query: string, viruses: Virus[]): string[] {
  const q = query.toLowerCase();
  return viruses
    .filter((v) => q.includes(v.commonName.toLowerCase()) || q.includes(v.abbreviation.toLowerCase()) || (ALIASES[v.id] ?? []).some((a) => new RegExp(`\\b${a}`).test(q)))
    .map((v) => v.id);
}

/** Small BM25-style ranking with a boost when a virus is named in the query. */
export function search(passages: Passage[], query: string, viruses: Virus[], k = 6): Passage[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const docs = passages.map((p) => tokenize(`${p.title} ${p.text}`));
  const avg = docs.reduce((a, d) => a + d.length, 0) / docs.length;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const named = namedViruses(query, viruses);

  return passages
    .map((p, i) => {
      const d = docs[i];
      let s = 0;
      for (const t of q) {
        const tf = d.filter((x) => x === t).length;
        if (!tf) continue;
        const n = df.get(t) ?? 0;
        const idf = Math.log(1 + (passages.length - n + 0.5) / (n + 0.5));
        s += (idf * tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (d.length / avg)));
      }
      if (p.virusId && named.includes(p.virusId)) s *= 1.8;
      if (p.virusId && named.length && !named.includes(p.virusId)) s *= 0.4;
      return { p, s };
    })
    .filter((x) => x.s > 0.5)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.p);
}
