import { emptyFilters, GENOME_CLASSES, type AtlasFilters, type GenomeClass, type SizeBand } from "./filter";
import { MAX_COMPARE } from "./compare";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function get(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}

const list = (s: string | undefined) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);

/** Parse ?v=a,b,c into a deduplicated list of known virus ids (max 3, order kept). */
export function parseCompareIds(p: Params, knownIds: string[]): string[] {
  const known = new Set(knownIds);
  const out: string[] = [];
  for (const id of list(get(p, "v"))) if (known.has(id) && !out.includes(id)) out.push(id);
  return out.slice(0, MAX_COMPARE);
}

export function compareHref(ids: string[]) {
  return ids.length ? `/compare?v=${ids.map(encodeURIComponent).join(",")}` : "/compare";
}

const GENOME: GenomeClass[] = GENOME_CLASSES;
const SIZE: SizeBand[] = ["small", "medium", "large"];
const ENVELOPE = ["enveloped", "non-enveloped"] as const;

/** Atlas filters <-> URL query. Unknown tokens are dropped rather than trusted. */
export function parseFilters(p: Params, allowed: { host: string[]; morphology: string[] }): AtlasFilters {
  return {
    q: (get(p, "q") ?? "").slice(0, 100),
    genome: list(get(p, "genome")).filter((g): g is GenomeClass => GENOME.includes(g as GenomeClass)),
    envelope: list(get(p, "envelope")).filter((e): e is (typeof ENVELOPE)[number] => (ENVELOPE as readonly string[]).includes(e)),
    host: list(get(p, "host")).filter((h) => allowed.host.includes(h)),
    morphology: list(get(p, "morphology")).filter((m) => allowed.morphology.includes(m)),
    size: list(get(p, "size")).filter((s): s is SizeBand => SIZE.includes(s as SizeBand)),
  };
}

export function serializeFilters(f: AtlasFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  for (const key of ["genome", "envelope", "host", "morphology", "size"] as const) if (f[key].length) p.set(key, f[key].join(","));
  return p.toString();
}

export { emptyFilters };
