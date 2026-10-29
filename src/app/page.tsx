import Link from "next/link";
import { Suspense } from "react";
import { getDiagram, sources, viruses } from "@/lib/data";
import { proteins } from "@/data/proteins";
import type { Virus } from "@/lib/schema";
import { toNm, formatNt } from "@/lib/units";
import { Lineup } from "@/components/Lineup";
import { AtlasExplorer } from "@/components/AtlasExplorer";
import { HeroVirus } from "@/components/HeroVirus";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/Reveal";
import { SourceRefs } from "@/components/Evidence";

/** Headline numbers computed from the dataset, never typed in by hand. */
function stats(vs: Virus[]) {
  const withLen = vs.filter((v) => v.genome.referenceLengthNt.value);
  const byLen = [...withLen].sort((a, b) => a.genome.referenceLengthNt.value! - b.genome.referenceLengthNt.value!);
  const smallG = byLen[0], bigG = byLen[byLen.length - 1];
  const unit = (v: Virus) => (v.genome.strandedness.value === "single" ? "nt" : "bp");
  const dims = vs.flatMap((v) => v.dimensions.map((d) => ({ v, d, max: toNm(d.max, d.unit) })));
  const body = dims.filter((x) => ["virion", "capsid", "head"].includes(x.d.part));
  const tiny = [...body].sort((a, b) => a.max - b.max)[0];
  const longest = [...dims].sort((a, b) => b.max - a.max)[0];
  const segs = [...vs].sort((a, b) => (b.genome.segmentCount.value ?? 0) - (a.genome.segmentCount.value ?? 0))[0];
  return [
    { value: formatNt(smallG.genome.referenceLengthNt.value!), unit: unit(smallG), label: `Smallest genome here: ${smallG.commonName}`, src: smallG.genome.referenceLengthNt.sourceIds },
    { value: formatNt(bigG.genome.referenceLengthNt.value!), unit: unit(bigG), label: `Largest genome here: ${bigG.commonName}`, src: bigG.genome.referenceLengthNt.sourceIds },
    { value: String(tiny.max), unit: "nm", label: `Smallest particle: ${tiny.v.commonName} (${tiny.d.label.toLowerCase()})`, src: tiny.d.sourceIds },
    { value: String(longest.max), unit: "nm", label: `Longest particle: ${longest.v.commonName} (${longest.d.label.toLowerCase()})`, src: longest.d.sourceIds },
    { value: String(segs.genome.segmentCount.value), unit: "segments", label: `Most genome pieces: ${segs.commonName}`, src: segs.genome.segmentCount.sourceIds },
  ];
}

export default function Home() {
  const hero = getDiagram("human-adenovirus-5")!;
  const classes = new Set(viruses.map((v) => v.baltimore.value)).size;
  const st = stats(viruses);
  return (
    <div className="slides">
      <section className="slide relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[6vw] pointer-events-none" aria-hidden="true">
          <div className="w-[min(78vw,640px)] aspect-square opacity-35 lg:opacity-95 translate-y-[6vh] lg:translate-y-0">
            <HeroVirus spec={hero} name="Human adenovirus 5" />
          </div>
        </div>
        <div className="relative container-atlas pt-[14vh] flex-1 w-full">
          <p className="text-[20px] text-ink max-w-[28ch] leading-snug">{viruses.length} viruses, drawn and measured from the evidence.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#atlas" className="btn btn-primary">
              Enter the atlas
            </a>
            <Link href="/compare?v=influenza-a,sars-cov-2" className="btn">
              Compare two viruses
            </Link>
          </div>
        </div>
        <h1 className="relative display text-ink whitespace-nowrap text-[15.5vw] leading-[0.82] px-3 sm:px-6 pb-3 select-none">Virus Atlas</h1>
      </section>

      <section className="slide container-atlas py-24 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-end !grid">
        <Reveal>
          <SectionHead as="h2" index="01 Structure" title={`${viruses.length} viruses. ${classes} ways to make mRNA.`} size="xl" />
        </Reveal>
        <Reveal className="text-[17px] measure">
          <p>
            An envelope is a lipid membrane; a capsid is a protein shell. Some viruses have both, some only one. ICTV taxonomy groups viruses by
            ancestry; the Baltimore scheme groups them by how they reach mRNA. The atlas keeps both apart and cites every value it shows.
          </p>
          <p className="mt-6">
            <Link href="/genomes" className="index-label !text-ink no-underline hover:!text-accent-strong">
              Follow the routes to mRNA
            </Link>
          </p>
        </Reveal>
      </section>

      <section className="slide bg-accent-deep text-[var(--on-accent)] py-20" aria-labelledby="numbers-title">
        <div className="container-atlas slide-in w-full">
          <p className="index-label !text-[var(--on-accent)]/80 mb-4">02 Numbers</p>
          <h2 id="numbers-title" className="display text-[34px] sm:text-[48px] mb-12">
            From {st[2].value} to {st[3].value} nanometres,
            <br /> {st[0].value} {st[0].unit} to {st[1].value} {st[1].unit}
          </h2>
          <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {st.map((s) => (
              <li key={s.label} className="border-t border-[var(--on-accent)]/25 pt-5">
                <p className="display text-[56px] sm:text-[72px] leading-none">
                  {s.value}
                  <span className="text-[20px] ml-2 align-top">{s.unit}</span>
                </p>
                <p className="mt-3 text-[15px] text-[var(--on-accent)]/85">{s.label}</p>
                <div className="mt-1 [&_a]:!text-[var(--on-accent)] [&_a]:underline">
                  <SourceRefs ids={s.src} sources={sources} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="slide container-atlas py-24">
        <Reveal className="slide-in">
          <SectionHead as="h2" index="03 Scale" title="Every particle, one ruler" />
        </Reveal>
        <Reveal className="mt-12">
          <Lineup viruses={viruses} />
        </Reveal>
      </section>

      <section id="atlas" aria-labelledby="atlas-title" className="container-atlas pt-12 scroll-mt-16">
        <SectionHead as="h2" id="atlas-title" index="04 Atlas" title="Search and filter" />
        <div className="mt-12">
          <Suspense fallback={<p className="text-mute">Loading the atlas…</p>}>
            <AtlasExplorer viruses={viruses} />
          </Suspense>
        </div>
      </section>

      <section className="slide container-atlas pt-28">
        <Reveal className="slide-in grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-end">
          <SectionHead as="h2" index="05 Proteins" title="Down to the measured atoms" />
          <div className="text-[17px] measure">
            <p>
              {proteins.length} structures from the Protein Data Bank, one or more per virus, shown as 2D traces and 3D backbones with what each
              experiment did and did not capture.
            </p>
            <p className="mt-6">
              <Link href="/proteins" className="btn btn-primary">
                Explore proteins
              </Link>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
