"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ProteinChain } from "@/data/proteins";
import { parseStructure, points, principalProjection, segmentsByGap, ssRuns, type StructureFile } from "@/lib/structure";
import { useWebGL } from "../three/Lazy3D";
import { useCssTokens, useReducedMotion } from "@/lib/clientEnv";

const Protein3D = dynamic(() => import("./Protein3D"), { ssr: false, loading: () => <p className="p-6 text-mute">Loading 3D view…</p> });
type ProteinStyle = "cartoon" | "surface" | "trace";
const STYLE_LABEL: Record<ProteinStyle, string> = { cartoon: "Cartoon", surface: "Surface", trace: "Trace" };

/** Chain colours come from tokens: blue first, then contrasting hues; host chains stay neutral. */

const TOKEN_MAP = { p1: "--p1", p2: "--p2", p3: "--p3", p4: "--p4", p5: "--p5", p6: "--p6", mute: "--mute", genome: "--c-genome", canvas: "--canvas-elevated" } as const;

function useChainColors(chains: ProteinChain[]) {
  const t = useCssTokens(TOKEN_MAP);
  return useMemo(() => {
    const map: Record<string, string> = {};
    if (!t) return map;
    map.__bg = t.canvas;
    const cycle = [t.p1, t.p2, t.p3, t.p4, t.p5, t.p6];
    // One colour per chain, as molecular viewers do by default; host and nucleic-acid chains stay neutral.
    let k = 0;
    for (const c of chains) {
      if (c.host) map[c.id] = t.mute;
      else if (c.nucleic) map[c.id] = t.genome;
      else map[c.id] = cycle[k++ % cycle.length];
    }
    return map;
  }, [t, chains]);
}

function Trace2D({ data, colors, focus, label }: { data: StructureFile; colors: Record<string, string>; focus: string | null; label: string }) {
  const { paths, box } = useMemo(() => {
    const all = data.chains.flatMap(points);
    const proj = principalProjection(all);
    const pts2 = all.map(proj);
    const xs = pts2.map((p) => p[0]), ys = pts2.map((p) => p[1]);
    const box = { x0: Math.min(...xs) - 4, y0: Math.min(...ys) - 4, x1: Math.max(...xs) + 4, y1: Math.max(...ys) + 4 };
    const paths = data.chains.flatMap((c) => {
      const p = points(c).map(proj);
      return segmentsByGap(points(c), c.kind === "nucleic" ? 8 : 4.6).map((s) => ({
        chain: c.id,
        nucleic: c.kind === "nucleic",
        d: p.slice(s.start, s.end + 1).map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" "),
        helix: c.ss
          ? ssRuns(c.ss.slice(s.start, s.end + 1))
              .filter((r) => r.code !== "C" && r.end > r.start)
              .map((r) => ({ code: r.code, d: p.slice(s.start + r.start, s.start + r.end + 1).map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ") }))
          : [],
      }));
    });
    return { paths, box };
  }, [data]);
  return (
    <svg viewBox={`${box.x0} ${box.y0} ${box.x1 - box.x0} ${box.y1 - box.y0}`} className="w-full h-auto max-h-[560px]" role="img" aria-label={label}>
      {paths.map((p, i) => {
        const dim = focus && focus !== p.chain;
        return (
          <g key={i} opacity={dim ? 0.12 : 1} style={{ stroke: colors[p.chain] }} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={p.d} strokeWidth={p.nucleic ? 2.4 : 0.6} />
            {p.helix.map((h, j) => (
              <path key={j} d={h.d} strokeWidth={h.code === "H" ? 2.2 : 1.5} strokeDasharray={h.code === "E" ? "2.5 1" : undefined} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function SequenceMap({ data, chains, colors, focus, onFocus }: { data: StructureFile; chains: ProteinChain[]; colors: Record<string, string>; focus: string | null; onFocus: (id: string | null) => void }) {
  const max = Math.max(...data.chains.map((c) => c.seq.length));
  return (
    <ul className="flex flex-col gap-3">
      {data.chains.map((c) => {
        const meta = chains.find((x) => x.id === c.id);
        const W = 100;
        return (
          <li key={c.id}>
            <button
              type="button"
              aria-pressed={focus === c.id}
              onClick={() => onFocus(focus === c.id ? null : c.id)}
              className="w-full text-left rounded-md px-2 py-2 hover:bg-sunk aria-pressed:bg-sunk"
            >
              <span className="flex flex-wrap items-baseline gap-x-3 text-[14px]">
                <span className="text-ink font-medium">
                  Chain {c.id}: {meta?.label ?? c.entity}
                </span>
                <span className="num text-mute">
                  {c.seq.length} {c.kind === "nucleic" ? "nucleotides" : "residues"} modelled
                </span>
              </span>
              <svg viewBox={`0 0 ${W} 6`} preserveAspectRatio="none" className="w-full h-3 mt-1" aria-hidden="true">
                <rect x={0} y={2.6} width={(c.seq.length / max) * W} height={0.8} style={{ fill: colors[c.id] }} opacity={0.5} />
                {c.ss &&
                  ssRuns(c.ss)
                    .filter((r) => r.code !== "C")
                    .map((r, i) => (
                      <rect
                        key={i}
                        x={(r.start / max) * W}
                        y={r.code === "H" ? 0.5 : 1.5}
                        width={Math.max(0.2, ((r.end - r.start + 1) / max) * W)}
                        height={r.code === "H" ? 5 : 3}
                        style={{ fill: colors[c.id] }}
                        opacity={r.code === "E" ? 0.65 : 1}
                      />
                    ))}
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ProteinViewer({ pdbId, chains, title }: { pdbId: string; chains: ProteinChain[]; title: string }) {
  const [data, setData] = useState<StructureFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [focus, setFocus] = useState<string | null>(null);
  const [style, setStyle] = useState<ProteinStyle>("cartoon");
  const webgl = useWebGL();
  const colors = useChainColors(chains);
  const reduced = useReducedMotion();

  useEffect(() => {
    let live = true;
    fetch(`/structures/${pdbId}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => live && setData(parseStructure(j)))
      .catch((e) => live && setError(`Could not load the structure file (${e.message}). Reload the page to try again.`));
    return () => {
      live = false;
    };
  }, [pdbId]);

  const label = `${title}: backbone trace of PDB ${pdbId}${focus ? `, chain ${focus} highlighted` : ""}.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="panel p-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="segmented" role="radiogroup" aria-label="Protein view">
            <button role="radio" aria-checked={mode === "2d"} onClick={() => setMode("2d")}>
              2D trace
            </button>
            <button role="radio" aria-checked={mode === "3d"} onClick={() => setMode("3d")} disabled={!webgl} title={webgl ? undefined : "3D needs WebGL"}>
              3D backbone
            </button>
          </div>
          {mode === "3d" ? (
            <div className="segmented" role="radiogroup" aria-label="3D style">
              {(Object.keys(STYLE_LABEL) as ProteinStyle[]).map((k) => (
                <button key={k} role="radio" aria-checked={style === k} onClick={() => setStyle(k)}>
                  {STYLE_LABEL[k]}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-[13px] text-mute">Flattened onto its widest plane</span>
          )}
        </div>
        {error ? (
          <p className="p-6 text-[var(--danger)]">{error}</p>
        ) : !data ? (
          <p className="p-6 text-mute">Loading structure…</p>
        ) : mode === "3d" && webgl ? (
          <Protein3D data={data} colors={colors} focus={focus} reduced={reduced} label={label} style={style} background={colors.__bg ?? "black"} />
        ) : (
          <Trace2D data={data} colors={colors} focus={focus} label={label} />
        )}
        <p className="mt-3 text-[13px] text-mute measure">
          {mode === "3d" && style === "surface"
            ? "Approximate surface: one 3.4 Å sphere per residue, centred on the deposited Cα (or P) atom. Not a computed molecular surface."
            : mode === "3d" && style === "cartoon"
              ? "Cartoon: helices and strands as flat ribbons along the Cα path, as assigned in the PDB file; other residues as a thin tube. Side chains are not shown."
              : "Each line passes through one atom per residue (Cα for protein, P for nucleic acid) from the deposited coordinates. Thick: helix. Dashed: strand. Thin: other. Breaks are unmodelled stretches."}
        </p>
      </div>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold mb-2">Chains and secondary structure</h3>
        <p className="text-[13px] text-mute mb-3">Select a chain to highlight it. Tall marks are helices, short marks strands, as assigned in the PDB file.</p>
        {data && <SequenceMap data={data} chains={chains} colors={colors} focus={focus} onFocus={setFocus} />}
      </div>
    </div>
  );
}
