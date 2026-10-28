import type { Metadata } from "next";
import { Suspense } from "react";
import { sources, viruses } from "@/lib/data";
import { baltimoreClasses } from "@/data/baltimore";
import { GenomeExplorer } from "@/components/GenomeExplorer";

export const metadata: Metadata = { title: "Genomes and replication" };

export default function GenomesPage() {
  return (
    <div className="container-atlas pt-12">
      <h1 className="display text-[42px] sm:text-[56px]">Genomes and replication</h1>
      <p className="mt-4 text-[18px] measure">
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
