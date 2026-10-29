import type { Metadata } from "next";
import { viruses, sources } from "@/lib/data";
import { TraitExplorer } from "@/components/TraitExplorer";
export const metadata: Metadata = { title: "Trait explorer" };
export default function ExplorePage() {
  return <div className="container-atlas pt-12 pb-16"><h1 className="display text-[24px] sm:text-[32px] text-ink">Trait explorer</h1>
    <p className="mt-3 max-w-2xl text-[18px]">Explore documented combinations in the atlas, then compose a fictional particle illustration.</p>
    <p className="mt-4"><a href="#visual-mixer">Jump to fictional mixer ↓</a></p>
    <TraitExplorer viruses={viruses} sources={sources}/></div>;
}
