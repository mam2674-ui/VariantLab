import { genomeClass, type GenomeClass } from "./filter";
import type { Virus } from "./schema";

export interface TraitSelection {
  genome: GenomeClass | "";
  envelope: "" | "yes" | "no";
  host: string;
}
export const initialTraits: TraitSelection = { genome: "", envelope: "", host: "" };
/** Match documented records only. Absence is never interpreted as impossibility. */
export function matchTraits(viruses: Virus[], traits: TraitSelection) {
  return viruses.filter(v => (!traits.genome || genomeClass(v) === traits.genome)
    && (!traits.envelope || v.envelope.value === (traits.envelope === "yes"))
    && (!traits.host || v.hostCategory.value === traits.host));
}
export function observedClasses(viruses: Virus[], genome: TraitSelection["genome"]) {
  const records = viruses.filter(v => !genome || genomeClass(v) === genome);
  return [...new Set(records.map(v => v.baltimore.value).filter(Boolean))];
}
