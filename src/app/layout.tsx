import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { datasetAccessed } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "Virus Atlas", template: "%s · Virus Atlas" },
  description: "An interactive, source-cited atlas for comparing virus structure, size, genomes and replication strategies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn">
          Skip to content
        </a>
        <SiteNav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-hairline mt-24">
          <div className="container-atlas py-10 grid gap-6 md:grid-cols-[1fr_auto] text-[14px] text-mute">
            <p className="measure">
              Virus Atlas is an educational project. Diagrams are schematic, facts are cited individually, and nothing here is medical
              advice. Sources accessed {datasetAccessed}; taxonomy from ICTV MSL41.
            </p>
            <nav aria-label="Footer" className="flex gap-4">
              <Link href="/methods">Methods and limitations</Link>
              <Link href="/sources">Sources</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
