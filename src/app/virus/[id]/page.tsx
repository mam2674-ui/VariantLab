import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDiagram, getVirus, sources, viruses } from "@/lib/data";
import type { Fact } from "@/lib/schema";
import { genomeClass } from "@/lib/filter";
import { morphologyLabel } from "@/lib/compare";
import { formatDimension, formatKb, formatNt } from "@/lib/units";
import { StructureViewer } from "@/components/StructureViewer";
import { FactTable, type FactRowData } from "@/components/FactTable";
import { SourceRefs, StatusMark } from "@/components/Evidence";

export function generateStaticParams() {
  return viruses.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: PageProps<"/virus/[id]">): Promise<Metadata> {
  const v = getVirus((await params).id);
  return { title: v?.commonName ?? "Not found", description: v?.summary };
}

function row<T>(label: string, f: Fact<T>, show?: (v: T) => string): FactRowData {
  const value = f.status === "not_applicable" ? "Not applicable" : f.value === null ? "Not verified" : show ? show(f.value) : String(f.value);
  return { label, value, status: f.status, scope: f.scope, sourceIds: f.sourceIds, note: f.note };
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function VirusPage({ params }: PageProps<"/virus/[id]">) {
  return (
    <Suspense fallback={<div className="container-atlas pt-12 text-mute">Loading profile…</div>}>
      <VirusProfile params={params} />
    </Suspense>
  );
}

async function VirusProfile({ params }: { params: PageProps<"/virus/[id]">["params"] }) {
  const { id } = await params;
  const v = getVirus(id);
  if (!v) notFound();
  const spec = getDiagram(v.diagramId);
  const g = v.genome;
  const others = viruses.filter((x) => x.id !== v.id);
  const t = v.taxonomy;

  return (
    <article>
      <header className="container-atlas pt-12 pb-8">
        <nav aria-label="Breadcrumb" className="text-[14px] mb-6">
          <Link href="/#atlas">Atlas</Link> <span aria-hidden="true" className="text-mute">/</span> <span className="text-mute">{v.commonName}</span>
        </nav>
        <h1 className="display text-[42px] sm:text-[56px]">{v.commonName}</h1>
        <p className="mt-2 text-[17px]">
          Species <span className="species text-ink">{t.species}</span>, family {t.family}
        </p>
        <p className="mt-5 text-[18px] measure">{v.summary}</p>
        <p className="mt-2 text-[13px] text-mute">Simplified overview; the cited facts below carry the detail.</p>
        <p className="mt-4 text-[14px] text-mute measure">{v.representative}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href={`/compare?v=${v.id},${others[0]?.id ?? ""}`}>
            Compare with {others[0]?.commonName}
          </Link>
          <Link className="btn" href={`/sources?virus=${v.id}`}>
            Sources behind this profile
          </Link>
        </div>
      </header>

      <div className="container-atlas">
        {spec ? <StructureViewer spec={spec} sources={sources} title={v.commonName} /> : <p className="panel p-6">No diagram yet.</p>}
      </div>

      <div className="container-atlas mt-16 grid gap-12 lg:grid-cols-2">
        <FactTable
          title="Structure"
          sources={sources}
          rows={[
            row("Morphology", v.morphology, (m) => morphologyLabel(m)),
            row("Lipid envelope", v.envelope, (b) => (b ? "Yes" : "No")),
            row("Capsid / nucleocapsid", v.capsid),
          ]}
        />
        <FactTable
          title="Dimensions"
          sources={sources}
          rows={v.dimensions.map((d) => ({
            label: d.label,
            value: <span className="num">{formatDimension(d)}</span>,
            status: d.status,
            scope: d.scope,
            sourceIds: d.sourceIds,
            note: d.note,
          }))}
        />
        <FactTable
          title="Genome"
          sources={sources}
          rows={[
            { ...row("Genome class", g.nucleicAcid), value: genomeClass(v) ?? "Not verified" },
            row("Strandedness", g.strandedness, cap),
            row("Sense", g.sense, cap),
            row("Segments", g.segmentCount, (n) => (g.segmented.value ? `${n} segments` : "Unsegmented (one molecule)")),
            row("Topology", g.topology, cap),
            row("Approximate length", g.lengthKb, (r) => formatKb(r)),
            row("Reference sequence length", g.referenceLengthNt, (n) => `${formatNt(n)} ${g.strandedness.value === "double" ? "bp" : "nt"}`),
            row("Reference sequence", v.referenceSequence),
          ]}
        />
        <section className="min-w-0" aria-label="Classification">
          <h3 className="text-[17px] font-semibold mb-1">Classification</h3>
          <p className="text-[14px] text-mute mb-3 measure">
            ICTV taxon names are italicised by convention. Two different systems appear here. ICTV ranks express evolutionary relationship; the Baltimore class only describes how the genome is turned into
            mRNA.
          </p>
          <dl className="border-t border-hairline text-[15px]">
            {(
              [
                ["Realm", t.realm],
                ["Kingdom", t.kingdom],
                ["Phylum", t.phylum],
                ["Class", t.class],
                ["Order", t.order],
                ["Family", t.family],
                ["Subfamily", t.subfamily],
                ["Genus", t.genus],
                ["Subgenus", t.subgenus],
                ["Species", t.species],
              ] as const
            )
              .filter(([, val]) => val)
              .map(([k, val]) => (
                <div key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 py-1.5 border-b border-hairline">
                  <dt className="text-mute text-[14px]">{k}</dt>
                  <dd className="species text-ink">{val}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-2 text-[13px] text-mute flex flex-wrap gap-x-3 items-center">
            <StatusMark status="verified" /> {t.msl}; ICTV ID <span className="num">{t.ictvId}</span>
            {t.exemplar ? "; species exemplar" : "; not the species exemplar"} <SourceRefs ids={t.sourceIds} sources={sources} />
          </p>
          {t.note && <p className="mt-2 text-[13px] text-mute measure">{t.note}</p>}
          <div className="mt-6">
            <FactTable title="Baltimore class (separate system)" sources={sources} rows={[row("Class", v.baltimore, (b) => `Class ${b}`)]} />
          </div>
        </section>
        <FactTable title="Host" sources={sources} rows={[row("Host category", v.hostCategory, cap), row("Detail", v.hostDetail)]} />
        <section className="min-w-0" aria-label="Replication overview">
          <FactTable title="Replication overview" sources={sources} rows={[row("Where", v.replication.site), row("Route to mRNA", v.replication.mRNARoute)]} />
          <ol className="mt-4 flex flex-col gap-3">
            {v.replication.steps.map((s, i) => (
              <li key={s.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
                <span className="num text-mute pt-0.5">{i + 1}</span>
                <div>
                  <p className="text-[15px]">
                    <strong className="text-ink">{s.title}.</strong> {s.text}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 items-center">
                    <StatusMark status={s.status} />
                    <SourceRefs ids={s.sourceIds} sources={sources} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] text-mute measure">
            A high-level teaching sequence. Real infections overlap these stages, vary by cell type and strain, and include steps not shown.
            <Link href={`/genomes?v=${v.id}`} className="ml-1">
              Step through it in the genome explorer.
            </Link>
          </p>
        </section>
      </div>
    </article>
  );
}
