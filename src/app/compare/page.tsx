import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { Suspense } from "react";
import { diagrams, sources, viruses } from "@/lib/data";
import { CompareView } from "@/components/CompareView";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <div className="container-atlas pt-14">
      <SectionHead index="02 Compare" title="Compare viruses" />
      <p className="mt-6 text-[18px] measure">
        Line up two or three viruses. The selection lives in the page address, so a comparison can be shared and reopened exactly.
      </p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-mute">Loading comparison…</p>}>
          <CompareView viruses={viruses} sources={sources} diagrams={diagrams} />
        </Suspense>
      </div>
    </div>
  );
}
