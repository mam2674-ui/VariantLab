"use client";

import Link from "next/link";
import { useState } from "react";
import type { DiagramSpec, Source, Virus } from "@/lib/schema";
import { silhouette } from "@/lib/silhouette";
import { convert, formatDimension, logPosition, rowLayout, toNm } from "@/lib/units";
import { SilhouetteShapes } from "./Silhouette";
import { SourceRefs, StatusMark, scopeLabel } from "./Evidence";
import { renderers } from "./diagrams/registry";

type Mode = "linear" | "log" | "illustration";
const MODES: { id: Mode; label: string }[] = [
  { id: "linear", label: "Linear, to scale" },
  { id: "log", label: "Logarithmic axis" },
  { id: "illustration", label: "Labelled illustrations" },
];
const noop = () => {};

function Linear({ viruses }: { viruses: Virus[] }) {
  const k = 1.4; // px per nm, uniform for every outline
  const items = viruses
    .map((v) => ({ v, s: silhouette(v)! }))
    .filter((x) => x.s)
    .sort((a, b) => a.s.height - b.s.height);
  const gap = 36;
  const maxH = Math.max(...items.map((x) => x.s.height)) * k;
  const { xs, end } = rowLayout(items.map((it) => it.s.width * k), gap, 48);
  const placed = items.map((it, i) => ({ ...it, x: xs[i] }));
  const width = end;
  const base = maxH + 20;
  const height = base + 40;
  const ticks = Array.from({ length: Math.floor(maxH / k / 50) + 1 }, (_, i) => i * 50);
  return (
    <figure>
      <div className="overflow-x-auto panel p-4" tabIndex={0} aria-label="Scrollable to-scale figure">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[760px] h-auto" role="img" aria-labelledby="lin-desc">
          <desc id="lin-desc">All virus outlines drawn on one linear scale of {k} pixels per nanometre with gridlines every 50 nm.</desc>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={40} x2={width} y1={base - t * k} y2={base - t * k} className="stroke-hairline" strokeWidth={1} strokeDasharray={t ? "2 4" : undefined} />
              <text x={34} y={base - t * k + 4} textAnchor="end" className="fill-mute" style={{ font: "400 11px var(--font-data)" }}>
                {t}
              </text>
            </g>
          ))}
          <text x={34} y={14} textAnchor="end" className="fill-mute" style={{ font: "400 11px var(--font-data)" }}>
            nm
          </text>
          {placed.map(({ v, s, x }) => (
            <g key={v.id}>
              <SilhouetteShapes v={v} k={k} x={x} y={base - s.height * k} />
              <text x={x + (s.width * k) / 2} y={base + 24} textAnchor="middle" className="fill-ink" style={{ font: "500 13px var(--font-text)" }}>
                {v.abbreviation}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-3 text-[14px] text-mute measure">
        One uniform scale (1.4 px per nm); outlines are never stretched to fit. Dashed outlines are the top of a reported range, the solid inner
        circle its bottom. Fibres are drawn at the maximum reported length or in one illustrative pose (dotted). Long influenza filaments, which
        can reach micrometres, would not fit and are omitted.
      </figcaption>
    </figure>
  );
}

const LO = 5;
const HI = 20000;
const LOG_TICKS = [10, 100, 1000, 10000];
const tickLabel = (nm: number) => (nm >= 1000 ? `${convert(nm, "nm", "um")} µm` : `${nm} nm`);

function Log({ viruses }: { viruses: Virus[] }) {
  const W = 760, left = 150, right = 20, rowH = 30;
  const rows = viruses.flatMap((v) => [
    { v, head: true as const },
    ...v.dimensions.map((d) => ({ v, d, head: false as const })),
    ...(v.morphology.note?.includes("filament") ? [{ v, filament: true as const, head: false as const }] : []),
  ]);
  const H = rows.length * rowH + 50;
  const px = (nm: number) => left + logPosition(nm, LO, HI, W - left - right);
  return (
    <figure>
      <div className="overflow-x-auto panel p-4" tabIndex={0} aria-label="Scrollable logarithmic chart">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[680px] h-auto" role="img" aria-labelledby="log-desc">
          <desc id="log-desc">Every reported dimension placed on a logarithmic axis from 5 nanometres to 20 micrometres. Bar lengths are not proportional to size.</desc>
          {LOG_TICKS.map((t) => (
            <g key={t}>
              <line x1={px(t)} x2={px(t)} y1={10} y2={H - 30} className="stroke-hairline" strokeWidth={1} />
              <text x={px(t)} y={H - 12} textAnchor="middle" className="fill-mute" style={{ font: "400 11px var(--font-data)" }}>
                {tickLabel(t)}
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y = 20 + i * rowH;
            if (r.head)
              return (
                <text key={i} x={0} y={y + 4} className="fill-ink" style={{ font: "600 13px var(--font-text)" }}>
                  {r.v.commonName}
                </text>
              );
            if ("filament" in r)
              return (
                <g key={i}>
                  <text x={12} y={y + 4} className="fill-mute" style={{ font: "400 12px var(--font-text)" }}>
                    Filaments
                  </text>
                  <text x={px(1000)} y={y + 4} className="fill-mute" style={{ font: "italic 400 12px var(--font-text)" }}>
                    up to several µm; no single verified value
                  </text>
                </g>
              );
            const d = r.d;
            const a = px(toNm(d.min, d.unit)), b = px(toNm(d.max, d.unit));
            const famCls = d.scope === "family" ? "stroke-mute" : "stroke-ink";
            return (
              <g key={i}>
                <text x={12} y={y + 4} className="fill-body" style={{ font: "400 12px var(--font-text)" }}>
                  {d.part === "virion" ? d.measure : `${d.part} ${d.measure}`}
                  {d.scope === "family" ? " (family)" : ""}
                </text>
                {a === b ? (
                  <circle cx={a} cy={y} r={4.5} className={d.scope === "family" ? "fill-mute" : "fill-ink"} />
                ) : (
                  <>
                    <line x1={a} x2={b} y1={y} y2={y} className={famCls} strokeWidth={6} strokeLinecap="round" />
                    {d.central && <line x1={px(d.central.value)} x2={px(d.central.value)} y1={y - 7} y2={y + 7} className="stroke-surface" strokeWidth={2} />}
                  </>
                )}
                <text x={Math.max(a, b) + 10} y={y + 4} className="fill-mute" style={{ font: "400 11px var(--font-data)" }}>
                  {formatDimension(d)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-[14px] text-mute measure">
        Positions are logarithmic: each gridline is ten times the last, so equal distances mean equal ratios, not equal lengths. Use this view to
        place values across orders of magnitude; use the linear view to judge size. Grey bars are family-level ranges; dark bars are specific to
        the virus or isolate; a cross-tick marks a reported mean.
      </figcaption>
    </figure>
  );
}

function Illustration({ viruses, diagrams }: { viruses: Virus[]; diagrams: DiagramSpec[] }) {
  return (
    <div>
      <p className="mb-4 text-[15px] measure">
        <strong className="text-ink">Not to scale between panels.</strong> Each schematic fills its panel; the labels carry the numbers.
      </p>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {viruses.map((v) => {
          const spec = diagrams.find((d) => d.id === v.diagramId)!;
          const r = renderers[spec.renderer];
          const props = { view: "exterior" as const, hidden: new Set<string>(), selected: null, onSelect: noop, labelFor: (id: string) => id, numberFor: () => 0 };
          return (
            <li key={v.id} className="panel p-5 min-w-0">
              <h3 className="text-[17px] font-semibold">
                <Link href={`/virus/${v.id}`} className="text-ink no-underline hover:underline">
                  {v.commonName}
                </Link>
              </h3>
              <div inert>
                <svg viewBox={r.viewBox} className="w-full h-auto max-h-[200px] my-3" role="img" aria-label={`${v.commonName} exterior schematic, not to scale`}>
                  <r.Draw {...props} />
                </svg>
              </div>
              <dl className="text-[14px] flex flex-col gap-1">
                {v.dimensions.map((d) => (
                  <div key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                    <dt className="text-mute">{d.label}</dt>
                    <dd className="num text-ink">{formatDimension(d)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SizeExplorer({ viruses, sources, diagrams }: { viruses: Virus[]; sources: Source[]; diagrams: DiagramSpec[] }) {
  const [mode, setMode] = useState<Mode>("linear");
  return (
    <div className="flex flex-col gap-10">
      <div className="segmented self-start" role="tablist" aria-label="Size view">
        {MODES.map((m) => (
          <button key={m.id} role="tab" id={`tab-${m.id}`} aria-controls="size-panel" aria-selected={mode === m.id} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <div id="size-panel" role="tabpanel" aria-labelledby={`tab-${mode}`}>
        {mode === "linear" && <Linear viruses={viruses} />}
        {mode === "log" && <Log viruses={viruses} />}
        {mode === "illustration" && <Illustration viruses={viruses} diagrams={diagrams} />}
      </div>

      <section aria-labelledby="dims-title">
        <h2 id="dims-title" className="display text-[30px] mb-4">
          Every dimension, with units
        </h2>
        <table className="compare-table">
          <caption className="sr-only">All reported dimensions in nanometres and micrometres</caption>
          <thead>
            <tr>
              <th scope="col">Virus and measure</th>
              <th scope="col">Nanometres</th>
              <th scope="col">Micrometres</th>
              <th scope="col">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {viruses.flatMap((v) =>
              v.dimensions.map((d) => (
                <tr key={`${v.id}-${d.id}`}>
                  <th scope="row">
                    <span className="text-ink">{v.commonName}</span>
                    <span className="block font-normal">{d.label}</span>
                  </th>
                  <td data-virus="Nanometres" className="num">
                    {formatDimension({ ...d, unit: "nm", min: toNm(d.min, d.unit), max: toNm(d.max, d.unit) })}
                  </td>
                  <td data-virus="Micrometres" className="num">
                    {formatUm(toNm(d.min, d.unit), toNm(d.max, d.unit), d.approximate)}
                  </td>
                  <td data-virus="Evidence">
                    <span className="flex flex-wrap gap-x-3 items-center">
                      <StatusMark status={d.status} />
                      <span className="text-[12px] text-mute">{scopeLabel(d.scope)}</span>
                      <SourceRefs ids={d.sourceIds} sources={sources} />
                    </span>
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
        <p className="mt-3 text-[13px] text-mute">1 µm = 1,000 nm. Means with a standard deviation are shown as mean ± SD in the nanometre column.</p>
      </section>
    </div>
  );
}

function formatUm(minNm: number, maxNm: number, approx: boolean) {
  const f = (n: number) => String(Number(convert(n, "nm", "um").toFixed(4)));
  return `${approx ? "~" : ""}${minNm === maxNm ? f(minNm) : `${f(minNm)}–${f(maxNm)}`} µm`;
}
