import Link from "next/link";
import { Suspense } from "react";
import { viruses } from "@/lib/data";
import { Lineup } from "@/components/Lineup";
import { AtlasExplorer } from "@/components/AtlasExplorer";

export default function Home() {
  return (
    <>
      <section className="container-atlas pt-14 pb-12 md:pt-20">
        <div>
          <h1 className="display text-[44px] sm:text-[60px] lg:text-[76px] max-w-[14ch]">Viruses, drawn from the evidence.</h1>
          <p className="mt-5 text-[19px] text-body measure">Compare structure, size and genomes, with every fact traced to its source.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#atlas" className="btn btn-primary">
              Explore the atlas
            </a>
            <Link href="/compare?v=influenza-a,sars-cov-2" className="btn">
              Compare two RNA viruses
            </Link>
          </div>
        </div>
        <div className="mt-12">
          <Lineup viruses={viruses} />
        </div>
      </section>

      <section className="container-atlas py-10 border-t border-hairline">
        <div className="grid gap-6 md:grid-cols-3 text-[15px]">
          <p>
            <strong className="text-ink">Structure.</strong> An envelope is a lipid membrane; a capsid is a protein shell. Some viruses have both,
            some only one, and the diagrams never draw a part a virus lacks.
          </p>
          <p>
            <strong className="text-ink">Classification.</strong> ICTV taxonomy groups viruses by evolutionary relationship; the Baltimore scheme groups
            them by how they make mRNA. The atlas keeps the two apart.
          </p>
          <p>
            <strong className="text-ink">Evidence.</strong> Each value carries its source, its scope (family, species or one isolate) and a status:
            verified, simplified, variable or not verified.
          </p>
        </div>
      </section>

      <section id="atlas" aria-labelledby="atlas-title" className="container-atlas pt-12 scroll-mt-16">
        <h2 id="atlas-title" className="display text-[36px] sm:text-[44px] mb-8">
          The atlas
        </h2>
        <Suspense fallback={<p className="text-mute">Loading the atlas…</p>}>
          <AtlasExplorer viruses={viruses} />
        </Suspense>
      </section>
    </>
  );
}
