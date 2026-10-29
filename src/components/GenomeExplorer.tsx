"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Source, Virus } from "@/lib/schema";
import type { BaltimoreClass } from "@/data/baltimore";
import { genomeClass } from "@/lib/filter";
import { formatNt, rowLayout } from "@/lib/units";
import { SourceRefs, StatusMark } from "./Evidence";
import { CellMap } from "./CellMap";
import { useReducedMotion } from "@/lib/clientEnv";

// Influenza A/PR/8/34 segment lengths (NCBI RefSeq), used only for the segmented glyph.
const PR8_SEGMENTS = [2341, 2341, 2233, 1778, 1565, 1413, 1027, 890];

/** Genome glyph: double line = double-stranded, single line = single-stranded; ring = circular; arrows mark 5'→3'. */
function GenomeGlyph({ v, maxNt }: { v: Virus; maxNt: number }) {
  const g = v.genome;
  const ds = g.strandedness.value === "double";
  const W = 560;
  const total = g.referenceLengthNt.value ?? 0;
  const sense = g.sense.value;

  if (g.topology.value === "circular") {
    const r = 26;
    return (
      <svg viewBox={`0 0 ${W + 20} 70`} className="w-full h-auto" role="img" aria-label={`${v.commonName}: circular double-stranded DNA, ${formatNt(total)} base pairs`}>
        <circle cx={40} cy={35} r={r} fill="none" className="stroke-genome" strokeWidth={6} />
        <circle cx={40} cy={35} r={r} fill="none" className="stroke-canvas" strokeWidth={2} />
        <text x={84} y={40} className="fill-mute" style={{ font: "400 12px var(--font-text)" }}>
          circular; drawn as a ring, not to length scale
        </text>
      </svg>
    );
  }

  const segs = g.segmented.value && v.id === "influenza-a" ? PR8_SEGMENTS : [total];
  const segGap = segs.length > 1 ? 4 : 0;
  const widths = segs.map((n) => Math.max(3, (n / maxNt) * W));
  const { xs, end } = rowLayout(widths, segGap, 10);
  const x = end;
  return (
    <svg viewBox={`0 0 ${W + 20} 70`} className="w-full h-auto" role="img" aria-label={`${v.commonName}: ${genomeClass(v)}, ${segs.length > 1 ? `${segs.length} segments, ` : ""}${formatNt(total)} ${ds ? "base pairs" : "nucleotides"} in total`}>
      {segs.map((n, i) => {
        const w = widths[i];
        const x0 = xs[i];
        return (
          <g key={i}>
            {ds ? (
              <>
                <line x1={x0} x2={x0 + w} y1={30} y2={30} className="stroke-genome" strokeWidth={3} />
                <line x1={x0} x2={x0 + w} y1={40} y2={40} className="stroke-genome" strokeWidth={3} />
              </>
            ) : (
              <line x1={x0} x2={x0 + w} y1={35} y2={35} className="stroke-genome" strokeWidth={3} />
            )}
          </g>
        );
      })}
      <text x={Math.min(x + 8, W - 120)} y={39} className="fill-mute" style={{ font: "400 12px var(--font-data)" }}>
        {sense === "positive" ? "+ sense (5′→3′ like mRNA)" : sense === "negative" ? "− sense (complementary to mRNA)" : ds ? "two strands" : ""}
      </text>
      <text x={10} y={62} className="fill-mute" style={{ font: "400 11px var(--font-text)" }}>
        {g.nucleicAcid.value}, {formatNt(total)} {ds ? "bp" : "nt"}, shared linear scale
      </text>
    </svg>
  );
}

function RouteDiagram({ b, animKey }: { b: BaltimoreClass; animKey: string }) {
  const boxW = 150, gap = 70, h = 54;
  const nodes = [b.route[0].from, ...b.route.map((r) => r.to)];
  const W = nodes.length * boxW + (nodes.length - 1) * gap;
  return (
    <svg key={animKey} viewBox={`0 0 ${W} 110`} className="h-auto max-w-full" style={{ width: W * 0.75 }} role="img" aria-label={`Route to mRNA for Baltimore class ${b.id}: ${b.route.map((r) => `${r.from} to ${r.to} by ${r.via}`).join("; ")}`}>
      {nodes.map((n, i) => {
        const x = i * (boxW + gap);
        return (
          <g key={i}>
            <rect x={x} y={10} width={boxW} height={h} rx={6} className="fill-canvas stroke-ink" strokeWidth={1.5} />
            <text x={x + boxW / 2} y={10 + h / 2 + 5} textAnchor="middle" className="fill-ink" style={{ font: "600 14px var(--font-text)" }}>
              {n}
            </text>
            {i < nodes.length - 1 && (
              <>
                <path
                  d={`M ${x + boxW + 4} ${10 + h / 2} L ${x + boxW + gap - 8} ${10 + h / 2}`}
                  className="stroke-ink route-draw"
                  strokeWidth={2}
                  style={{ ["--len" as string]: gap, animationDelay: `${i * 350}ms` }}
                  markerEnd="url(#arrow)"
                />
                <text x={x + boxW + gap / 2} y={10 + h + 26} textAnchor="middle" className="fill-mute" style={{ font: "400 11px var(--font-text)" }}>
                  {b.route[i].via}
                </text>
              </>
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-ink" />
        </marker>
      </defs>
    </svg>
  );
}

function classIStatement(viruses: Virus[]) {
  const c1 = viruses.filter((v) => v.baltimore.value === "I");
  const realms = new Set(c1.map((v) => v.taxonomy.realm));
  return `${c1.length} of the ${viruses.length} viruses here are class I, yet they sit in ${realms.size} different ICTV realms.`;
}

export function GenomeExplorer({ viruses, sources, classes }: { viruses: Virus[]; sources: Source[]; classes: BaltimoreClass[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = params.get("v");
  const current = viruses.find((v) => v.id === fromUrl) ?? viruses[0];
  const [step, setStep] = useState(0);
  const maxNt = Math.max(...viruses.map((v) => v.genome.referenceLengthNt.value ?? 0));
  const b = classes.find((c) => c.id === current.baltimore.value);
  const steps = current.replication.steps;
  const s = steps[Math.min(step, steps.length - 1)];
  const prev = step > 0 ? steps[step - 1] : undefined;
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();

  // Autoplay advances one stage every 2.4 s and stops at the end.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (step >= steps.length - 1) setPlaying(false);
      else setStep((n) => n + 1);
    }, 2400);
    return () => clearTimeout(t);
  }, [playing, step, steps.length]);

  const choose = (id: string) => {
    setStep(0);
    setPlaying(false);
    router.replace(`${pathname}?v=${id}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="g-compare">
        <h2 id="g-compare" className="subhead text-[30px] mb-2">
          {viruses.length} genomes, one scale
        </h2>
        <p className="text-[15px] text-mute measure mb-6">
          Double line: double-stranded. Single line: single-stranded. Separate pieces: a segmented genome. Lengths share one linear scale, from the
          reference sequences.
        </p>
        <ul className="flex flex-col">
          {viruses.map((v) => (
            <li key={v.id} className="grid gap-x-6 gap-y-1 py-4 border-t border-hairline md:grid-cols-[220px_minmax(0,1fr)] items-center">
              <div>
                <p className="text-[16px] font-semibold text-ink">{v.commonName}</p>
                <p className="text-[14px]">
                  {genomeClass(v)}, {v.genome.topology.value}
                  {v.genome.segmented.value ? `, ${v.genome.segmentCount.value} segments` : ""}; Baltimore {v.baltimore.value}
                </p>
              </div>
              <GenomeGlyph v={v} maxNt={maxNt} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="g-route">
        <h2 id="g-route" className="subhead text-[30px] mb-2">
          From genome to mRNA, step by step
        </h2>
        <p className="text-[15px] text-mute measure mb-6">
          A high-level teaching sequence for one virus at a time. Stages overlap in real cells and vary by strain and cell type. No laboratory
          methods are described here.
        </p>
        <div className="flex flex-wrap gap-2 mb-6" role="radiogroup" aria-label="Virus">
          {viruses.map((v) => (
            <button key={v.id} type="button" role="radio" aria-checked={v.id === current.id} className="chip" onClick={() => choose(v.id)}>
              {v.commonName}
            </button>
          ))}
        </div>

        {b && (
          <div className="panel p-6 mb-6">
            <p className="text-[14px] text-mute">
              Baltimore class {b.id} ({b.genome}): {b.summary}
            </p>
            <div className="mt-4">
              <RouteDiagram b={b} animKey={current.id} />
            </div>
            <p className="mt-3 text-[15px]">{current.replication.mRNARoute.value}</p>
            <p className="mt-2 flex flex-wrap gap-x-3 items-center">
              <StatusMark status={current.replication.mRNARoute.status} />
              <SourceRefs ids={current.replication.mRNARoute.sourceIds} sources={sources} />
            </p>
          </div>
        )}

        <div className="panel p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="index-label">
              Where it happens in the {current.hostCategory.value === "bacteria" ? "bacterial" : current.hostCategory.value === "plants" ? "plant" : "host"} cell
            </p>
            <button
              type="button"
              className="btn"
              aria-pressed={playing}
              onClick={() => {
                if (!playing && step >= steps.length - 1) setStep(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "Pause" : reduced ? "Step through automatically" : "Play the sequence"}
            </button>
          </div>
          <CellMap host={current.hostCategory.value ?? "vertebrates"} location={s.location} previous={prev?.location} stepKey={`${current.id}-${step}`} />
          <p className="mt-3 text-[13px] text-mute measure">
            A schematic cell, not to scale. Compartments are only marked where a cited source places the stage; the marker dims when it does not.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <ol className="flex flex-col gap-1" aria-label={`${current.commonName} replication stages`}>
            {steps.map((st, i) => (
              <li key={st.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setStep(i);
                  }}
                  aria-current={i === step ? "step" : undefined}
                  className="w-full min-h-10 text-left px-3 rounded-md flex gap-3 items-center text-[15px] text-body hover:bg-sunk aria-[current=step]:bg-sunk aria-[current=step]:text-ink aria-[current=step]:font-semibold"
                >
                  <span className="num text-mute w-5">{i + 1}</span>
                  {st.title}
                </button>
              </li>
            ))}
          </ol>
          <div className="panel p-6" aria-live="polite">
            <div key={`${current.id}-${step}`} className="step-enter">
              <p className="text-[13px] text-mute">
                Stage <span className="num">{step + 1}</span> of <span className="num">{steps.length}</span>. Main replication site: {current.replication.site.value?.toLowerCase()}
              </p>
              <h3 className="text-[21px] font-semibold mt-1">{s.title}</h3>
              <p className="mt-2 text-[16px]">{s.text}</p>
              <p className="mt-3 flex flex-wrap gap-x-3 items-center">
                <StatusMark status={s.status} />
                <SourceRefs ids={s.sourceIds} sources={sources} />
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" className="btn" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}>
                Previous stage
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep((n) => Math.min(steps.length - 1, n + 1))} disabled={step >= steps.length - 1}>
                Next stage
              </button>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="g-classes">
        <h2 id="g-classes" className="subhead text-[30px] mb-2">
          All seven Baltimore classes
        </h2>
        <p className="text-[15px] text-mute measure mb-6">
          The Baltimore scheme sorts viruses by how they make mRNA. It is not a family tree: {classIStatement(viruses)} Classes without an atlas
          example are shown for context.
        </p>
        <ul className="grid gap-4 md:grid-cols-2">
          {classes.map((c) => {
            const members = viruses.filter((v) => v.baltimore.value === c.id);
            return (
              <li key={c.id} className="border-t border-hairline pt-4">
                <h3 className="text-[17px] font-semibold">
                  Class {c.id}: {c.genome}
                </h3>
                <p className="mt-1 text-[15px]">{c.summary}</p>
                <p className="mt-1 text-[14px] text-mute">
                  {members.length ? `In this atlas: ${members.map((m) => m.commonName).join(", ")}` : "No atlas example yet"}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 items-center">
                  <StatusMark status={c.status} />
                  <SourceRefs ids={c.sourceIds} sources={sources} />
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
