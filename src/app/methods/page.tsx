import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import Link from "next/link";
import { sources, viruses, datasetAccessed } from "@/lib/data";
import { unverifiedFacts } from "@/lib/citations";

export const metadata: Metadata = { title: "Methods and limitations" };

export default function MethodsPage() {
  const gaps = unverifiedFacts(viruses);
  return (
    <article className="container-atlas pt-14">
      <SectionHead index="08 Methods" title="Methods and limitations" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 text-[16px]">
        <section className="measure">
          <h2 className="text-[21px] font-semibold mb-2">How the data were assembled</h2>
          <p>
            Twelve viruses were chosen to contrast genome type, envelope, capsid architecture and host, and to cover all seven Baltimore classes. Taxonomy was read directly from the ICTV Virus
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
            Structure diagrams and 3D virus models are original, code-drawn schematics. Protein structures are drawn from deposited PDB coordinates
            (one atom per residue). Genome maps use the coding sequences annotated in the NCBI reference records. Component identities are cited; shapes, counts and positions are illustrative.
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
            <li>Twelve viruses is a teaching sample, not a survey; each Baltimore class has only one to four examples.</li>
            <li>3D virus models are procedural schematics in a molecular-graphics style. Capsomer counts match the cited architecture for HSV-1 (162), adenovirus (252) and HPV16 (72); other counts, shapes and positions are illustrative.</li>
            <li>Protein structures are real experimental models from the PDB, but most are fragments, single subunits or related strains; each page lists what was actually solved. Surfaces are approximated from one sphere per residue.</li>
            <li>Genome maps show coding sequences exactly as annotated in the NCBI records; frameshifts, RNA editing and non-coding features are not modelled.</li>
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
