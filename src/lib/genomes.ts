import raw from "@/data/genomes.json";

/**
 * Coding sequences (CDS) as annotated in the NCBI reference records, fetched
 * as feature tables. Coordinates are 1-based, inclusive; a CDS can have
 * several intervals (spliced, or wrapping a circular origin).
 */
export interface Cds {
  name: string;
  product: string;
  strand: 1 | -1;
  segs: [number, number][];
}
export interface Molecule {
  accession: string;
  length: number;
  topology: "linear" | "circular";
  label: string;
  title: string;
  cds: Cds[];
}

export const genomeMaps = raw as unknown as Record<string, Molecule[]>;

/** Which source record each annotation came from (all are in sources.json). */
export const ANNOTATION_SOURCE: Record<string, string> = {
  "influenza-a": "ncbi-pr8-segments",
  "sars-cov-2": "ncbi-nc045512",
  "hiv-1": "ncbi-af033819",
  "hepatitis-b": "ncbi-nc003977",
  "hsv-1": "ncbi-jn555585",
  "human-adenovirus-5": "ncbi-ac000008",
  "hpv-16": "ncbi-k02718",
  "poliovirus-1": "ncbi-v01149",
  "rotavirus-a": "ncbi-rva-sa11",
  tmv: "ncbi-nc001367",
  "phage-t4": "ncbi-af158101",
  phix174: "ncbi-j02482",
  ebola: "ncbi-af086833",
  rabies: "ncbi-m13215",
  vaccinia: "ncbi-ay243312",
  zika: "ncbi-ay632535",
  norwalk: "ncbi-m87661",
  ms2: "ncbi-v00642",
  ssv1: "ncbi-x07234",
  mimivirus: "ncbi-hq336222",
  tylcv: "ncbi-aj489258",
  m13: "ncbi-v00604",
  hdv: "ncbi-af104263",
  "scv-la": "ncbi-j04692",
};

/** Coding length in nucleotides, summed over intervals. */
export const cdsLength = (c: Cds) => c.segs.reduce((a, [s, e]) => a + (e - s + 1), 0);

/** Fraction of a molecule covered by at least one annotated CDS. */
export function codingFraction(m: Molecule): number {
  const covered = new Uint8Array(m.length + 1);
  for (const c of m.cds) for (const [s, e] of c.segs) for (let i = Math.max(1, s); i <= Math.min(m.length, e); i++) covered[i] = 1;
  let n = 0;
  for (let i = 1; i <= m.length; i++) n += covered[i];
  return n / m.length;
}

/**
 * Assign CDS to rows so overlapping genes don't collide (greedy interval packing),
 * separately per strand. Returns row index per CDS.
 */
export function packRows(cds: Cds[]): number[] {
  const ends: Record<string, number[]> = { "1": [], "-1": [] };
  return cds.map((c) => {
    const start = Math.min(...c.segs.map((s) => s[0]));
    const end = Math.max(...c.segs.map((s) => s[1]));
    const rows = ends[String(c.strand)];
    let r = rows.findIndex((e) => e < start);
    if (r === -1) {
      rows.push(end);
      r = rows.length - 1;
    } else rows[r] = end;
    return r;
  });
}
