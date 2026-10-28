import type { DiagramSpec, EvidenceStatus, Virus } from "./schema";

export interface Citation {
  virusId: string;
  where: string; // human-readable location of the fact
  status: EvidenceStatus;
  kind: "fact" | "diagram" | "replication";
}

const FIELD_LABEL: Record<string, string> = {
  referenceSequence: "Reference sequence",
  hostCategory: "Host category",
  hostDetail: "Host detail",
  nucleicAcid: "Genome: nucleic acid",
  strandedness: "Genome: strandedness",
  sense: "Genome: sense",
  segmented: "Genome: segmentation",
  segmentCount: "Genome: segment count",
  topology: "Genome: topology",
  lengthKb: "Genome: approximate length",
  referenceLengthNt: "Genome: reference length",
  baltimore: "Baltimore class",
  envelope: "Envelope",
  capsid: "Capsid / nucleocapsid",
  morphology: "Morphology",
  site: "Replication site",
  mRNARoute: "Route to mRNA",
  taxonomy: "ICTV taxonomy",
};

/** Every place a fact carries an evidence status, flattened for browsing and auditing. */
export function flattenFacts(v: Virus): (Citation & { sourceIds: string[] })[] {
  const out: (Citation & { sourceIds: string[] })[] = [];
  const visit = (node: unknown, key: string) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach((n) => visit(n, key));
    const o = node as Record<string, unknown>;
    if (Array.isArray(o.sourceIds) && typeof o.status === "string") {
      const label = typeof o.label === "string" ? `Dimension: ${o.label}` : typeof o.title === "string" ? `Replication: ${o.title}` : FIELD_LABEL[key] ?? key;
      out.push({ virusId: v.id, where: label, status: o.status as EvidenceStatus, kind: key === "steps" ? "replication" : "fact", sourceIds: o.sourceIds as string[] });
      return;
    }
    for (const [k, val] of Object.entries(o)) visit(val, k);
  };
  for (const [k, val] of Object.entries(v)) visit(val, k);
  out.push({ virusId: v.id, where: "ICTV taxonomy", status: "verified", kind: "fact", sourceIds: v.taxonomy.sourceIds });
  return out;
}

export function citationIndex(viruses: Virus[], diagrams: DiagramSpec[]): Record<string, Citation[]> {
  const idx: Record<string, Citation[]> = {};
  const add = (id: string, c: Citation) => (idx[id] ??= []).push(c);
  for (const v of viruses) for (const f of flattenFacts(v)) for (const id of f.sourceIds) add(id, f);
  for (const d of diagrams)
    for (const c of d.components)
      for (const id of c.sourceIds) add(id, { virusId: d.virusId, where: `Diagram: ${c.labelDetailed}`, status: c.status, kind: "diagram" });
  return idx;
}

/** Facts flagged as not verified, so the gaps are visible rather than hidden. */
export function unverifiedFacts(viruses: Virus[]) {
  return viruses.flatMap((v) => flattenFacts(v).filter((f) => f.status === "not_verified"));
}
