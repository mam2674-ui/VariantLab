import type { Metadata } from "next";
import { diagrams, sources, viruses } from "@/lib/data";
import { SizeExplorer } from "@/components/SizeExplorer";

export const metadata: Metadata = { title: "Size" };

export default function SizePage() {
  return (
    <div className="container-atlas pt-12">
      <h1 className="display text-[42px] sm:text-[56px]">How big is a virus?</h1>
      <p className="mt-4 text-[18px] measure">
        Sizes are reported as diameters, lengths and widths, often as ranges. The linear view keeps true proportions; the logarithmic view spreads
        values across orders of magnitude; the illustrations label the numbers when proportions get in the way.
      </p>
      <div className="mt-10">
        <SizeExplorer viruses={viruses} sources={sources} diagrams={diagrams} />
      </div>
    </div>
  );
}
