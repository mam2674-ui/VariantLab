import type { Baltimore, EvidenceStatus } from "@/lib/schema";

/**
 * Baltimore classes: a functional grouping by the route from genome to mRNA.
 * It is NOT a phylogeny; unrelated viruses share classes. Routes are
 * simplified teaching summaries of the cited sources.
 */
export interface BaltimoreClass {
  id: Baltimore;
  genome: string;
  route: { from: string; to: string; via: string }[];
  summary: string;
  status: EvidenceStatus;
  sourceIds: string[];
}

const src = ["viralzone-baltimore", "baltimore1971"];

export const baltimoreClasses: BaltimoreClass[] = [
  { id: "I", genome: "dsDNA", route: [{ from: "dsDNA", to: "mRNA", via: "transcription" }], summary: "The genome is transcribed into mRNA, as cellular DNA is.", status: "simplified", sourceIds: src },
  { id: "II", genome: "ssDNA", route: [{ from: "ssDNA", to: "dsDNA", via: "second-strand synthesis" }, { from: "dsDNA", to: "mRNA", via: "transcription" }], summary: "The single strand is made double-stranded before transcription.", status: "simplified", sourceIds: src },
  { id: "III", genome: "dsRNA", route: [{ from: "dsRNA", to: "mRNA", via: "viral RdRp" }], summary: "A viral RNA-dependent RNA polymerase (RdRp) transcribes mRNA from the double-stranded RNA.", status: "simplified", sourceIds: src },
  { id: "IV", genome: "+ssRNA", route: [{ from: "+RNA", to: "protein", via: "translated directly" }, { from: "+RNA", to: "−RNA", via: "viral RdRp" }, { from: "−RNA", to: "+RNA / mRNA", via: "viral RdRp" }], summary: "The genome has the same sense as mRNA, so ribosomes can translate it directly; RdRp makes negative-sense copies as templates.", status: "simplified", sourceIds: src },
  { id: "V", genome: "−ssRNA", route: [{ from: "−RNA", to: "+mRNA", via: "viral RdRp carried in the particle" }], summary: "The genome is complementary to mRNA and cannot be translated; the particle must bring its own RdRp to make mRNA.", status: "simplified", sourceIds: src },
  { id: "VI", genome: "ssRNA-RT", route: [{ from: "+RNA", to: "DNA", via: "reverse transcriptase" }, { from: "DNA", to: "mRNA", via: "transcription" }], summary: "The RNA genome is reverse-transcribed into DNA, which is then transcribed.", status: "simplified", sourceIds: src },
  { id: "VII", genome: "dsDNA-RT", route: [{ from: "dsDNA", to: "mRNA / pregenomic RNA", via: "transcription" }, { from: "RNA", to: "dsDNA", via: "reverse transcriptase" }], summary: "A DNA genome replicated through an RNA intermediate by reverse transcriptase.", status: "simplified", sourceIds: src },
];
