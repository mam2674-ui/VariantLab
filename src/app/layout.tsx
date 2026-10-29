import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { ViewTransition } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { viruses } from "@/lib/data";
import { genomeClass } from "@/lib/filter";
import { datasetAccessed } from "@/lib/data";
import "./globals.css";

const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], axes: ["wdth"] });
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Virus Atlas", template: "%s · Virus Atlas" },
  description: "An interactive, source-cited atlas for comparing virus structure, size, genomes and replication strategies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plex.variable} ${plexMono.variable} ${serif.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn">
          Skip to content
        </a>
        <SiteNav index={viruses.map((v, i) => ({ id: v.id, code: `No. ${String(i + 1).padStart(2, "0")}`, name: v.commonName, genome: genomeClass(v) ?? "", family: v.taxonomy.family }))} />
        <ViewTransition default="page">
          <main id="main" className="flex-1">
            {children}
          </main>
        </ViewTransition>
        <footer className="border-t border-hairline mt-28">
          <div className="container-atlas py-12 grid gap-8 md:grid-cols-[1fr_auto]">
            <p className="measure text-[15px] text-mute">
              Virus Atlas is an educational project. Virus diagrams are schematic; protein structures come from the Protein Data Bank. Facts are cited
              individually, and nothing here is medical advice. Sources accessed {datasetAccessed}; taxonomy from ICTV MSL41.
            </p>
            <p className="text-[14px] text-mute md:col-span-2 italic">
              Set in Source Serif 4 and IBM Plex. Diagrams drawn in code; protein coordinates from the PDB; gene maps from NCBI.
            </p>
            <nav aria-label="Footer" className="flex gap-6 text-[14px]">
              <Link href="/methods">Methods and limitations</Link>
              <Link href="/sources">Sources</Link>
            </nav>
          </div>
          <p aria-hidden="true" className="display text-ink/10 text-[15.5vw] leading-[0.82] whitespace-nowrap overflow-hidden select-none px-4">
            Virus Atlas
          </p>
        </footer>
      </body>
    </html>
  );
}
