import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { proteins } from "@/data/proteins";
import { getDiagram, getSource, getVirus, sources } from "@/lib/data";
import { ProteinViewer } from "@/components/protein/ProteinViewer";
import { SourceRefs, StatusMark } from "@/components/Evidence";
import { SectionHead } from "@/components/SectionHead";

export function generateStaticParams() {
  return proteins.map((p) => ({ pdbId: p.pdbId }));
}

export async function generateMetadata({ params }: PageProps<"/proteins/[pdbId]">): Promise<Metadata> {
  const { pdbId } = await params;
  const p = proteins.find((x) => x.pdbId === pdbId);
  return { title: p ? `${p.name} (PDB ${p.pdbId})` : "Not found" };
}

export default function ProteinPage({ params }: PageProps<"/proteins/[pdbId]">) {
  return (
    <Suspense fallback={<div className="container-atlas pt-14 text-mute">Loading protein…</div>}>
      <ProteinBody params={params} />
    </Suspense>
  );
}

async function ProteinBody({ params }: { params: PageProps<"/proteins/[pdbId]">["params"] }) {
  const { pdbId } = await params;
  const p = proteins.find((x) => x.pdbId === pdbId);
  if (!p) notFound();
  const v = getVirus(p.virusId)!;
  const spec = getDiagram(v.diagramId);
  const comps = p.componentIds.map((id) => spec?.components.find((c) => c.id === id)).filter(Boolean);
  const src = getSource(`pdb-${p.pdbId.toLowerCase()}`);
  return (
    <article className="container-atlas pt-14">
      <nav aria-label="Breadcrumb" className="text-[14px] mb-6">
        <Link href="/proteins">Proteins</Link> <span aria-hidden="true" className="text-mute">/</span>{" "}
        <Link href={`/virus/${v.id}`}>{v.commonName}</Link>
      </nav>
      <SectionHead index={`PDB ${p.pdbId}`} title={p.name} />
      <p className="mt-6 text-[18px] measure">{p.role}</p>
      <p className="mt-2 flex flex-wrap gap-x-3 items-center">
        <StatusMark status="verified" />
        <SourceRefs ids={p.roleSourceIds} sources={sources} />
      </p>

      <div className="mt-10">
        <ProteinViewer pdbId={p.pdbId} chains={p.chains} title={p.name} />
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-[17px] font-semibold mb-2">About this structure</h2>
          <dl className="border-t border-hairline text-[15px]">
            {[
              ["Method", p.method],
              ["Resolution", p.resolutionA ? `${p.resolutionA} Å` : "Not applicable (NMR)"],
              ["Released", src?.note?.match(/Released (\d{4}-\d{2}-\d{2})/)?.[1] ?? "See PDB"],
              ["Virus", v.commonName],
              ["Shown in diagram as", comps.length ? comps.map((c) => c!.labelDetailed).join("; ") : "Not drawn in the particle diagram"],
            ].map(([k, val]) => (
              <div key={k} className="grid grid-cols-[170px_minmax(0,1fr)] gap-4 py-2 border-b border-hairline">
                <dt className="text-mute text-[14px]">{k}</dt>
                <dd className="text-ink">{val}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[14px]">
            {src && <SourceRefs ids={[src.id]} sources={sources} />}{" "}
            <a href={`https://www.rcsb.org/structure/${p.pdbId}`} target="_blank" rel="noreferrer">
              Open PDB {p.pdbId} at RCSB
            </a>
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-semibold mb-2">What this structure is not</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-[15px]">
            {p.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
            <li>Only one atom per residue is drawn; side chains and hydrogen atoms are omitted.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
