import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { Suspense } from "react";
import { diagrams, sources, viruses, datasetAccessed } from "@/lib/data";
import { citationIndex, unverifiedFacts } from "@/lib/citations";
import { SourcesBrowser } from "@/components/SourcesBrowser";

export const metadata: Metadata = { title: "Sources" };

export default function SourcesPage() {
  const index = citationIndex(viruses, diagrams);
  return (
    <div className="container-atlas pt-14">
      <SectionHead index="06 Sources" title="Sources" />
      <p className="mt-6 text-[18px] measure">
        Every fact in the atlas points to one of these {sources.length} sources, accessed {datasetAccessed}. Filter by virus to see what stands behind
        a single profile, or by status to find what is simplified, variable or unverified.
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-mute">Loading sources…</p>}>
          <SourcesBrowser sources={sources} viruses={viruses} index={index} unverified={unverifiedFacts(viruses)} />
        </Suspense>
      </div>
    </div>
  );
}
