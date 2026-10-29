import { DiagramSpec, SourceRegistry, Virus, type Source } from "./schema";
import sourcesJson from "@/data/sources.json";
import influenzaA from "@/data/viruses/influenza-a.json";
import sarsCov2 from "@/data/viruses/sars-cov-2.json";
import phageT4 from "@/data/viruses/phage-t4.json";
import adenovirus5 from "@/data/viruses/human-adenovirus-5.json";
import hsv1 from "@/data/viruses/hsv-1.json";
import hpv16 from "@/data/viruses/hpv-16.json";
import hiv1 from "@/data/viruses/hiv-1.json";
import hepatitisB from "@/data/viruses/hepatitis-b.json";
import rotavirusA from "@/data/viruses/rotavirus-a.json";
import poliovirus1 from "@/data/viruses/poliovirus-1.json";
import tmv from "@/data/viruses/tmv.json";
import phix174 from "@/data/viruses/phix174.json";
import { diagramSpecs } from "@/data/diagrams";

/** Raw records in display order. Adding a virus = add its JSON here + a diagram spec. */
export const rawViruses: unknown[] = [
  influenzaA,
  sarsCov2,
  hiv1,
  hepatitisB,
  hsv1,
  adenovirus5,
  hpv16,
  poliovirus1,
  rotavirusA,
  tmv,
  phageT4,
  phix174,
];

/**
 * Parse and cross-check the whole dataset. Throws on any schema violation or
 * dangling reference, so a bad record fails the build and the tests instead of
 * rendering silently wrong science.
 */
export function loadDataset(raw: unknown[] = rawViruses, rawSources: unknown = sourcesJson, rawDiagrams: unknown[] = diagramSpecs) {
  const registry = SourceRegistry.parse(rawSources);
  const sourceIds = new Set(registry.sources.map((s) => s.id));
  if (sourceIds.size !== registry.sources.length) throw new Error("Duplicate source id in registry");

  const viruses = raw.map((r) => Virus.parse(r));
  const diagrams = rawDiagrams.map((d) => DiagramSpec.parse(d));

  const problems: string[] = [];
  for (const v of viruses) {
    for (const id of collectSourceIds(v)) if (!sourceIds.has(id)) problems.push(`${v.id}: unknown source "${id}"`);
    const d = diagrams.find((x) => x.id === v.diagramId);
    if (!d) problems.push(`${v.id}: missing diagram "${v.diagramId}"`);
    else {
      const hasEnvelope = d.components.some((c) => c.type === "envelope");
      if (hasEnvelope !== Boolean(v.envelope.value)) problems.push(`${v.id}: diagram envelope does not match envelope fact`);
    }
  }
  for (const d of diagrams) {
    if (!viruses.some((v) => v.id === d.virusId)) continue; // spec for a virus not yet published
    for (const c of d.components) for (const id of c.sourceIds) if (!sourceIds.has(id)) problems.push(`diagram ${d.id}: unknown source "${id}"`);
  }
  if (new Set(viruses.map((v) => v.id)).size !== viruses.length) problems.push("Duplicate virus id");
  if (problems.length) throw new Error("Dataset integrity errors:\n" + problems.join("\n"));

  return { viruses, sources: registry.sources, diagrams, accessed: registry.accessed };
}

/** Every source id referenced anywhere inside a virus record. */
export function collectSourceIds(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => collectSourceIds(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "sourceIds" && Array.isArray(v)) v.forEach((id) => out.add(String(id)));
      else collectSourceIds(v, out);
    }
  }
  return out;
}

const dataset = loadDataset();
export const viruses: Virus[] = dataset.viruses;
export const sources: Source[] = dataset.sources;
export const diagrams = dataset.diagrams;
export const datasetAccessed = dataset.accessed;

export const getVirus = (id: string) => viruses.find((v) => v.id === id);
export const getSource = (id: string) => sources.find((s) => s.id === id);
export const getDiagram = (id: string) => diagrams.find((d) => d.id === id);
