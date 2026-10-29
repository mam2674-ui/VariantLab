import type { Metadata } from "next";
import Link from "next/link";
import { proteins } from "@/data/proteins";
import { viruses } from "@/lib/data";
import { SectionHead } from "@/components/SectionHead";

export const metadata: Metadata = { title: "Proteins" };

export default function ProteinsPage() {
  return (
    <div className="container-atlas pt-14">
      <SectionHead index="05 Proteins" title="Proteins, from measured structures" />
      <p className="mt-6 text-[18px] measure">
        {proteins.length} experimentally determined structures from the Protein Data Bank, one or more for each virus. Unlike the virus diagrams, these
        come from measured atomic coordinates. Each entry says what was actually solved: often one fragment or one subunit.
      </p>
      <div className="mt-12 flex flex-col">
        {viruses.map((v) => {
          const list = proteins.filter((p) => p.virusId === v.id);
          if (!list.length) return null;
          return (
            <section key={v.id} className="grid gap-3 md:grid-cols-[260px_minmax(0,1fr)] border-t border-hairline py-6">
              <h2 className="text-[17px] font-semibold text-ink">
                <Link href={`/virus/${v.id}`} className="text-ink no-underline hover:underline">
                  {v.commonName}
                </Link>
              </h2>
              <ul className="flex flex-col gap-3">
                {list.map((p) => (
                  <li key={p.pdbId} className="grid gap-x-6 sm:grid-cols-[110px_minmax(0,1fr)_auto] items-baseline">
                    <span className="num text-mute">PDB {p.pdbId}</span>
                    <Link href={`/proteins/${p.pdbId}`} className="text-[16px]">
                      {p.name}
                    </Link>
                    <span className="text-[13px] text-mute">
                      {p.method}
                      {p.resolutionA ? `, ${p.resolutionA} Å` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
