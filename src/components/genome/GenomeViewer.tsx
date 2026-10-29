"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Source, Virus } from "@/lib/schema";
import { ANNOTATION_SOURCE, cdsLength, codingFraction, genomeMaps, packRows, type Cds, type Molecule } from "@/lib/genomes";
import { formatNt } from "@/lib/units";
import { useCssTokens } from "@/lib/clientEnv";
import { useWebGL } from "../three/Lazy3D";
import { SourceRefs } from "../Evidence";

const Genome3D = dynamic(() => import("./Genome3D"), { ssr: false, loading: () => <p className="p-6 text-mute">Loading 3D view…</p> });

const PAL = { p1: "--p1", p2: "--p2", p3: "--p3", p4: "--p4", p5: "--p5", p6: "--p6", mute: "--hairline-strong", ink: "--ink", bg: "--canvas-elevated" } as const;

export interface Selected {
  mol: number;
  cds: number;
}

function LinearTrack({ m, mi, maxLen, colors, selected, onSelect, width }: { m: Molecule; mi: number; maxLen: number; colors: string[]; selected: Selected | null; onSelect: (s: Selected) => void; width: number }) {
  const rows = packRows(m.cds);
  const nUp = Math.max(1, ...m.cds.map((c, i) => (c.strand === 1 ? rows[i] + 1 : 0)));
  const nDown = Math.max(0, ...m.cds.map((c, i) => (c.strand === -1 ? rows[i] + 1 : 0)));
  const rowH = 20;
  const axisY = 8 + nUp * rowH;
  const H = axisY + 10 + nDown * rowH + 18;
  const x = (bp: number) => 8 + ((bp - 1) / maxLen) * (width - 16);
  return (
    <svg viewBox={`0 0 ${width} ${H}`} className="w-full h-auto" role="group" aria-label={`${m.label}: ${formatNt(m.length)} long, ${m.cds.length} annotated coding sequences`}>
      <line x1={x(1)} x2={x(m.length)} y1={axisY} y2={axisY} className="stroke-ink" strokeWidth={2} />
      <text x={x(m.length) + 4 > width - 60 ? x(m.length) - 4 : x(m.length) + 4} y={axisY + 4} textAnchor={x(m.length) + 4 > width - 60 ? "end" : "start"} className="fill-mute" style={{ font: "400 11px var(--font-data)" }}>
        {formatNt(m.length)}
      </text>
      {m.cds.map((c, i) => {
        const up = c.strand === 1;
        const y = up ? axisY - 4 - (rows[i] + 1) * rowH + 3 : axisY + 6 + rows[i] * rowH;
        const sel = selected?.mol === mi && selected.cds === i;
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-pressed={sel}
            aria-label={`${c.name}, ${up ? "forward" : "reverse"} strand, ${formatNt(cdsLength(c))} nucleotides`}
            onClick={() => onSelect({ mol: mi, cds: i })}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect({ mol: mi, cds: i }))}
            className="cursor-pointer focus:outline-none [&:focus-visible>rect]:stroke-[var(--focus)]"
            opacity={selected && !sel ? 0.45 : 1}
          >
            {c.segs.map(([s, e], k) => {
              const x0 = x(s), w = Math.max(2, x(e) - x(s));
              return <rect key={k} x={x0} y={y} width={w} height={15} rx={1.5} style={{ fill: colors[i % colors.length] }} stroke={sel ? "var(--ink)" : "none"} strokeWidth={1.5} />;
            })}
            {c.segs.length > 1 && <line x1={x(c.segs[0][1])} x2={x(c.segs[c.segs.length - 1][0])} y1={y + 7.5} y2={y + 7.5} className="stroke-mute" strokeDasharray="2 2" />}
            {x(c.segs[c.segs.length - 1][1]) - x(c.segs[0][0]) > c.name.length * 6.6 + 8 && (
              <text x={x(c.segs[0][0]) + 4} y={y + 11} className="fill-canvas" style={{ font: "500 11px var(--font-data)", pointerEvents: "none" }}>
                {c.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CircularMap({ m, colors, selected, onSelect }: { m: Molecule; colors: string[]; selected: Selected | null; onSelect: (s: Selected) => void }) {
  const C = 160, R = 110;
  const rows = packRows(m.cds);
  const ang = (bp: number) => ((bp - 1) / m.length) * Math.PI * 2 - Math.PI / 2;
  const arc = (s: number, e: number, r: number) => {
    const a0 = ang(s), a1 = ang(e);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${(C + r * Math.cos(a0)).toFixed(2)} ${(C + r * Math.sin(a0)).toFixed(2)} A ${r} ${r} 0 ${large} 1 ${(C + r * Math.cos(a1)).toFixed(2)} ${(C + r * Math.sin(a1)).toFixed(2)}`;
  };
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[420px] h-auto mx-auto" role="group" aria-label={`Circular map of ${m.label}, ${formatNt(m.length)} long`}>
      <circle cx={C} cy={C} r={R} fill="none" className="stroke-ink" strokeWidth={2} />
      <line x1={C} x2={C} y1={C - R - 6} y2={C - R + 6} className="stroke-ink" strokeWidth={2} />
      <text x={C} y={C - R - 10} textAnchor="middle" className="fill-mute" style={{ font: "400 10px var(--font-data)" }}>
        1
      </text>
      <text x={C} y={C + 4} textAnchor="middle" className="fill-ink" style={{ font: "500 13px var(--font-data)" }}>
        {formatNt(m.length)}
      </text>
      {m.cds.map((c, i) => {
        const r = c.strand === 1 ? R + 10 + rows[i] * 9 : R - 10 - rows[i] * 9;
        const sel = selected?.cds === i;
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-pressed={sel}
            aria-label={`${c.name}, ${c.strand === 1 ? "forward" : "reverse"} strand, ${formatNt(cdsLength(c))} nucleotides`}
            onClick={() => onSelect({ mol: 0, cds: i })}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect({ mol: 0, cds: i }))}
            className="cursor-pointer focus:outline-none"
            opacity={selected && !sel ? 0.4 : 1}
          >
            {c.segs.map(([s, e], k) => (
              <path key={k} d={arc(s, e, r)} fill="none" style={{ stroke: colors[i % colors.length] }} strokeWidth={sel ? 8 : 6} strokeLinecap="butt" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function GenomeViewer({ virus, sources }: { virus: Virus; sources: Source[] }) {
  const mols = genomeMaps[virus.id] ?? [];
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [selected, setSelected] = useState<Selected | null>(null);
  const webgl = useWebGL();
  const t = useCssTokens(PAL);
  const colors = useMemo(() => (t ? [t.p1, t.p2, t.p3, t.p4, t.p5, t.p6] : ["gray"]), [t]);
  const maxLen = Math.max(1, ...mols.map((m) => m.length));
  const total = mols.reduce((a, m) => a + m.length, 0);
  const allCds = mols.reduce((a, m) => a + m.cds.length, 0);
  const sel: { m: Molecule; c: Cds } | null = selected ? { m: mols[selected.mol], c: mols[selected.mol].cds[selected.cds] } : null;
  const ds = virus.genome.strandedness.value !== "single";
  const unit = ds ? "bp" : "nt";

  if (!mols.length) return <p className="panel p-6">No annotation available.</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="panel p-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="segmented" role="radiogroup" aria-label="Genome view">
            <button role="radio" aria-checked={mode === "2d"} onClick={() => setMode("2d")}>
              2D map
            </button>
            <button role="radio" aria-checked={mode === "3d"} onClick={() => setMode("3d")} disabled={!webgl} title={webgl ? undefined : "3D needs WebGL"}>
              3D strand
            </button>
          </div>
          <span className="text-[13px] text-mute num">
            {mols.length > 1 ? `${mols.length} segments, ` : ""}
            {formatNt(total)} {unit}, {allCds} coding sequences
          </span>
        </div>
        {mode === "3d" && webgl && t ? (
          <Genome3D mols={mols} colors={colors} neutral={t.mute} background={t.bg} doubleStranded={ds} selected={selected} onSelect={setSelected} label={`${virus.commonName} genome as a 3D strand, coloured by annotated gene`} />
        ) : mols[0].topology === "circular" ? (
          <CircularMap m={mols[0]} colors={colors} selected={selected} onSelect={setSelected} />
        ) : (
          <div className="flex flex-col gap-3">
            {mols.map((m, i) => (
              <div key={m.accession}>
                {mols.length > 1 && (
                  <p className="index-label mb-1">
                    {m.label} <span className="normal-case">{m.accession}</span>
                  </p>
                )}
                <LinearTrack m={m} mi={i} maxLen={maxLen} colors={colors} selected={selected} onSelect={setSelected} width={640} />
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-[13px] text-mute measure">
          {mode === "3d"
            ? "Schematic strand: real genomes are packed far more tightly. Colour marks annotated coding regions; grey is everything else."
            : mols[0].topology === "circular"
              ? "Outer ring: forward-strand genes; inner ring: reverse strand. Position 1 is at the top."
              : "Above the line: forward-strand genes. Below: reverse strand. Segments share one scale. Dashed links join pieces of one gene."}{" "}
          Annotation as deposited in <SourceRefs ids={[ANNOTATION_SOURCE[virus.id]]} sources={sources} />.
        </p>
      </div>

      <div className="min-w-0 flex flex-col gap-4">
        <div className="panel p-5 min-h-[160px]" aria-live="polite">
          {sel ? (
            <>
              <p className="index-label">{sel.m.label}</p>
              <h3 className="text-[19px] font-semibold text-ink mt-1">{sel.c.name}</h3>
              {sel.c.product && sel.c.product !== sel.c.name && <p className="text-[15px] mt-1">{sel.c.product}</p>}
              <dl className="mt-3 text-[14px] grid grid-cols-[110px_minmax(0,1fr)] gap-y-1">
                <dt className="text-mute">Position</dt>
                <dd className="num text-ink">{sel.c.segs.map(([s, e]) => `${formatNt(s)}–${formatNt(e)}`).join(", ")}</dd>
                <dt className="text-mute">Strand</dt>
                <dd className="text-ink">{sel.c.strand === 1 ? "Forward" : "Reverse"}</dd>
                <dt className="text-mute">Coding length</dt>
                <dd className="num text-ink">
                  {formatNt(cdsLength(sel.c))} nt (≈{formatNt(Math.floor(cdsLength(sel.c) / 3) - 1)} amino acids)
                </dd>
              </dl>
              <p className="mt-2 text-[12px] text-mute">Amino-acid count is length ÷ 3 minus the stop codon; ribosomal frameshifts and RNA editing are not modelled.</p>
            </>
          ) : (
            <p className="text-[15px] text-mute">Select a gene on the map to see its position, strand and length.</p>
          )}
        </div>
        <dl className="text-[14px] border-t border-hairline">
          {mols.length === 1 && (
            <div className="grid grid-cols-[150px_minmax(0,1fr)] py-2 border-b border-hairline">
              <dt className="text-mute">Annotated coding share</dt>
              <dd className="num text-ink">{Math.round(codingFraction(mols[0]) * 100)}%</dd>
            </div>
          )}
          <div className="grid grid-cols-[150px_minmax(0,1fr)] py-2 border-b border-hairline">
            <dt className="text-mute">Record{mols.length > 1 ? "s" : ""}</dt>
            <dd className="num text-ink break-words">{mols.map((m) => m.accession).join(", ")}</dd>
          </div>
        </dl>
        <ul className="text-[14px] max-h-[260px] overflow-auto border-t border-hairline" aria-label="All annotated genes">
          {mols.flatMap((m, mi) =>
            m.cds.map((c, ci) => (
              <li key={`${mi}-${ci}`}>
                <button
                  type="button"
                  onClick={() => setSelected({ mol: mi, cds: ci })}
                  aria-pressed={selected?.mol === mi && selected.cds === ci}
                  className="w-full text-left grid grid-cols-[14px_minmax(0,1fr)_auto] gap-3 items-center py-1.5 px-1 hover:bg-sunk aria-pressed:bg-sunk"
                >
                  <span aria-hidden="true" className="w-3 h-3 rounded-[2px]" style={{ background: colors[ci % colors.length] }} />
                  <span className="truncate text-ink">
                    {c.name}
                    {mols.length > 1 ? <span className="text-mute"> · {m.label}</span> : null}
                  </span>
                  <span className="num text-mute">{formatNt(cdsLength(c))}</span>
                </button>
              </li>
            )),
          )}
        </ul>
      </div>
    </div>
  );
}
