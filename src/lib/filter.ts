import type { Virus } from "./schema";
import { toNm } from "./units";

export type GenomeClass = "dsDNA" | "ssDNA" | "dsRNA" | "+ssRNA" | "-ssRNA" | "ssRNA-RT" | "dsDNA-RT";
export const GENOME_CLASSES: GenomeClass[] = ["dsDNA", "ssDNA", "dsRNA", "+ssRNA", "-ssRNA", "ssRNA-RT", "dsDNA-RT"];
export type SizeBand = "small" | "medium" | "large";

export interface AtlasFilters {
  q: string;
  genome: GenomeClass[];
  envelope: ("enveloped" | "non-enveloped")[];
  host: string[];
  morphology: string[];
  size: SizeBand[];
}

export const emptyFilters: AtlasFilters = { q: "", genome: [], envelope: [], host: [], morphology: [], size: [] };

const ICTV_TO_CLASS: Record<string, GenomeClass> = {
  dsDNA: "dsDNA",
  "ssDNA(+)": "ssDNA",
  "ssDNA(-)": "ssDNA",
  "ssDNA(+/-)": "ssDNA",
  ssDNA: "ssDNA",
  dsRNA: "dsRNA",
  "ssRNA(+)": "+ssRNA",
  "ssRNA(-)": "-ssRNA",
  "ssRNA-RT": "ssRNA-RT",
  "dsDNA-RT": "dsDNA-RT",
};

/** Genome class from the ICTV VMR genome label, so reverse-transcribing viruses keep their own classes. */
export function genomeClass(v: Virus): GenomeClass | null {
  const label = v.genome.ictvLabel.value;
  return label ? ICTV_TO_CLASS[label] ?? null : null;
}

/**
 * Size band from the largest *body* dimension (virion, capsid or head), not
 * appendages like fibres or tails, so a phage is not ranked by its tail.
 * Bands: small < 70 nm, medium 70–130 nm, large > 130 nm (by max of range).
 */
export function sizeBand(v: Virus): SizeBand | null {
  const isBody = (p: string) => p === "virion" || p === "head" || p === "capsid";
  const body = v.dimensions.filter((d) => isBody(d.part) && d.scope !== "family");
  const pool = body.length ? body : v.dimensions.filter((d) => isBody(d.part) || d.part === "rod");
  if (!pool.length) return null;
  const max = Math.max(...pool.map((d) => toNm(d.max, d.unit)));
  return max < 70 ? "small" : max <= 130 ? "medium" : "large";
}

export function searchableText(v: Virus): string {
  const t = v.taxonomy;
  return [v.commonName, v.abbreviation, t.species, t.family, t.genus, t.order, t.subfamily, v.summary, v.capsid.value, genomeClass(v)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterViruses(list: Virus[], f: AtlasFilters): Virus[] {
  const terms = f.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((v) => {
    if (terms.length && !terms.every((term) => searchableText(v).includes(term))) return false;
    if (f.genome.length && !f.genome.includes(genomeClass(v) as GenomeClass)) return false;
    if (f.envelope.length) {
      if (v.envelope.value === null) return false;
      if (!f.envelope.includes(v.envelope.value ? "enveloped" : "non-enveloped")) return false;
    }
    if (f.host.length && !f.host.includes(v.hostCategory.value ?? "")) return false;
    if (f.morphology.length && !f.morphology.includes(v.morphology.value ?? "")) return false;
    if (f.size.length && !f.size.includes(sizeBand(v) as SizeBand)) return false;
    return true;
  });
}

export function isFiltered(f: AtlasFilters) {
  return Boolean(f.q.trim()) || f.genome.length + f.envelope.length + f.host.length + f.morphology.length + f.size.length > 0;
}
