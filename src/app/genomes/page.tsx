import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { Suspense } from "react";
import { sources, viruses } from "@/lib/data";
import { baltimoreClasses } from "@/data/baltimore";
import { GenomeExplorer } from "@/components/GenomeExplorer";

export const metadata: Metadata = { title: "Genomes and replication" };

export default function GenomesPage() {
  return (
    <div className="container-atlas pt-14">
      <SectionHead index="04 Genomes" title="Genomes and replication" />
      <p className="mt-6 text-[18px] measure">
        DNA or RNA, one strand or two, one piece or several: these choices decide how a virus reaches mRNA and where in the cell it works.
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-mute">Loading genomes…</p>}>
          <GenomeExplorer viruses={viruses} sources={sources} classes={baltimoreClasses} />
        </Suspense>
      </div>
    </div>
  );
}
