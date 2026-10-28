"use client";

import type { KeyboardEvent, ReactNode } from "react";

export type View = "exterior" | "cutaway";

export interface RendererProps {
  view: View;
  hidden: Set<string>;
  selected: string | null;
  onSelect: (id: string) => void;
  labelFor: (id: string) => string;
  numberFor: (id: string) => number;
}

export interface Renderer {
  viewBox: string;
  /** Component ids this renderer can draw; tests check they match the spec. */
  parts: readonly string[];
  /** Parts that only exist inside the particle (drawn in cutaway only). */
  interior: readonly string[];
  markers: Record<string, [number, number]>;
  Draw: (p: RendererProps) => ReactNode;
}

/** Wraps one structural component: focusable, selectable, labelled. */
export function Part({ id, p, children }: { id: string; p: RendererProps; children: ReactNode }) {
  if (p.hidden.has(id)) return null;
  const selected = p.selected === id;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      p.onSelect(id);
    }
  };
  return (
    <g
      className="part"
      data-part={id}
      data-selected={selected}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${p.numberFor(id)}. ${p.labelFor(id)}`}
      onClick={() => p.onSelect(id)}
      onKeyDown={onKey}
    >
      {children}
    </g>
  );
}

export function Badges({ r, p }: { r: Renderer; p: RendererProps }) {
  return (
    <g aria-hidden="true">
      {r.parts.map((id) => {
        if (p.hidden.has(id)) return null;
        if (p.view === "exterior" && r.interior.includes(id)) return null;
        const m = r.markers[id];
        if (!m) return null;
        return (
          <g key={id} className="marker-badge" transform={`translate(${m[0]} ${m[1]})`} style={{ pointerEvents: "none" }}>
            <circle r={11} />
            <text textAnchor="middle" dy="4.5">
              {p.numberFor(id)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Deterministic pseudo-random in [0,1) so server and client render identically. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export const round = (n: number) => Math.round(n * 1000) / 1000;

export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  // Rounded so server and browser produce identical attribute strings (avoids hydration mismatches).
  return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))];
};

/** Double-stranded DNA convention: a wide stroke with a thin canvas line inside reads as two strands. */
export function DnaPath({ d, width = 5 }: { d: string; width?: number }) {
  return (
    <>
      <path d={d} fill="none" className="stroke-genome" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" className="stroke-canvas" strokeWidth={width * 0.34} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** Single-stranded RNA convention: one thin line. */
export function RnaPath({ d, width = 2 }: { d: string; width?: number }) {
  return <path d={d} fill="none" className="stroke-genome" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
}
