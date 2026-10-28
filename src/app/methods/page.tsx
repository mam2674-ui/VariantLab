import type { Metadata } from "next";
import Link from "next/link";
import { sources, viruses, datasetAccessed } from "@/lib/data";
import { unverifiedFacts } from "@/lib/citations";

export const metadata: Metadata = { title: "Methods and limitations" };

export default function MethodsPage() {
  const gaps = unverifiedFacts(viruses);
  return (
    <article className="container-atlas pt-12">
      <h1 className="display text-[42px] sm:text-[56px]">Methods and limitations</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 text-[16px]">
        <section className="measure">
          <h2 className="text-[21px] font-semibold mb-2">How the data were assembled</h2>
          <p>
            Six viruses were chosen to contrast genome type, envelope, capsid architecture and host. Taxonomy was read directly from the ICTV Virus
            Metadata Resource for Master Species List 41 (VMR, 29 July 2026). Genome lengths come from NCBI reference sequences. Structure and size
            come from ICTV taxonomy profiles and report chapters, ViralZone, and primary cryo-EM or cryo-ET papers. All {sources.length} sources were
            accessed on {datasetAccessed}.
          </p>
          <p className="mt-3">
            Each fact stores its value, an evidence status, the taxonomic scope it was reported at (family, genus, species, virus or isolate) and the
            sources behind it. A schema check rejects any verified fact without a source, any range whose minimum exceeds its maximum, and any
            diagram that draws an envelope for a virus recorded as non-enveloped (or omits one that exists).
          </p>
        </section>
        <section className="measure">
          <h2 className="text-[21px] font-semibold mb-2">What the visuals are</h2>
          <p>
            Structure diagrams are original, code-drawn schematics. Component identities are cited; shapes, counts and positions are illustrative.
            Size outlines use one uniform linear scale derived only from recorded dimensions and are never stretched. The logarithmic view is labelled
            as such because equal distances there mean equal ratios. No third-party illustrations are reproduced; ViralZone and ICTV are cited for
            text facts only.
          </p>
          <p className="mt-3">
            Baltimore classes and ICTV ranks are shown side by side but never merged: the first describes how mRNA is made, the second evolutionary
            relationship. Neither view is a phylogenetic tree.
          </p>
        </section>
        <section className="measure">
          <h2 className="text-[21px] font-semibold mb-2">The tutor</h2>
          <p>
            The tutor retrieves curated passages with a keyword ranking. If an API key is configured on the server, a Claude model writes an answer
            that must return structured JSON citing passage ids; the server re-validates the structure and rejects any citation to a passage it did
            not supply. Personal medical questions are declined before any model call. Without a key, or if validation fails, users see the curated
            passages, labelled as such. Generated answers have not yet been evaluated; see the evaluation question set in the repository.
          </p>
        </section>
        <section className="measure">
          <h2 className="text-[21px] font-semibold mb-2">Limitations</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Six viruses is a teaching sample, not a survey; no Baltimore class II, III, VI or VII example is included yet.</li>
            <li>Several sizes are family-level ranges (HSV-1 envelope, adenovirus, HPV); the atlas labels them but cannot replace virus-specific measurements.</li>
            <li>Replication sequences are simplified and omit regulation, host variation and many steps.</li>
            <li>
              {gaps.length} displayed {gaps.length === 1 ? "item is" : "items are"} not verified against our sources; they are listed on the{" "}
              <Link href="/sources">sources page</Link>.
            </li>
            <li>No expert review or user testing has been carried out yet. The atlas makes no claims about learning outcomes.</li>
            <li>Not medical advice; no laboratory methods are included or intended.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
