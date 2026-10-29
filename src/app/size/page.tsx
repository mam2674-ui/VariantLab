import type { Metadata } from "next";
import { SectionHead } from "@/components/SectionHead";
import { diagrams, sources, viruses } from "@/lib/data";
import { SizeExplorer } from "@/components/SizeExplorer";

export const metadata: Metadata = { title: "Size" };

export default function SizePage() {
  return (
    <div className="container-atlas pt-14">
      <SectionHead index="03 Size" title="How big is a virus?" />
      <p className="mt-6 text-[18px] measure">
        Sizes are reported as diameters, lengths and widths, often as ranges. The linear view keeps true proportions; the logarithmic view spreads
        values across orders of magnitude; the illustrations label the numbers when proportions get in the way.
      </p>
      <div className="mt-10">
        <SizeExplorer viruses={viruses} sources={sources} diagrams={diagrams} />
      </div>
    </div>
  );
}
