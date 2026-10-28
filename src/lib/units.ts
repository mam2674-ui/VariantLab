import type { Dimension, Unit } from "./schema";

const NM_PER: Record<Unit, number> = { nm: 1, um: 1000 };

/** Convert a length between nanometres and micrometres. */
export function convert(value: number, from: Unit, to: Unit): number {
  return (value * NM_PER[from]) / NM_PER[to];
}

export const toNm = (value: number, unit: Unit) => convert(value, unit, "nm");

/** Ångström → nm, used when transcribing structural papers (1 nm = 10 Å). */
export const angstromToNm = (a: number) => a / 10;

/** Format a dimension as a readable range, e.g. "80–120 nm", "~140 nm", "91 ± 11 nm". */
export function formatDimension(d: Pick<Dimension, "min" | "max" | "unit" | "approximate" | "central">): string {
  const u = d.unit === "um" ? "µm" : "nm";
  if (d.central?.sd !== undefined) return `${fmt(d.central.value)} ± ${fmt(d.central.sd)} ${u}`;
  const prefix = d.approximate ? "~" : "";
  if (d.min === d.max) return `${prefix}${fmt(d.min)} ${u}`;
  return `${prefix}${fmt(d.min)}–${fmt(d.max)} ${u}`;
}

export function formatKb(r: { min: number; max: number }): string {
  return r.min === r.max ? `${fmt(r.min)} kb` : `${fmt(r.min)}–${fmt(r.max)} kb`;
}

export function formatNt(n: number): string {
  return n.toLocaleString("en-US");
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}

/** Linear scale: nm → px. */
export function linearScale(maxNm: number, maxPx: number) {
  return (nm: number) => (nm / maxNm) * maxPx;
}

/**
 * Log scale for the overview: positions on a log10 axis between lo and hi.
 * Lengths drawn on this axis are NOT proportional; the UI labels it as such.
 */
export function logPosition(nm: number, loNm: number, hiNm: number, px: number) {
  if (nm <= 0 || loNm <= 0) throw new Error("log scale requires positive values");
  return ((Math.log10(nm) - Math.log10(loNm)) / (Math.log10(hiNm) - Math.log10(loNm))) * px;
}

/** Place items left to right with a fixed gap; returns each start x and the total end. Pure, so safe in render. */
export function rowLayout(widths: number[], gap: number, start = 0): { xs: number[]; end: number } {
  const xs = widths.map((_, i) => start + widths.slice(0, i).reduce((a, w) => a + w + gap, 0));
  const end = widths.length ? xs[xs.length - 1] + widths[widths.length - 1] + gap : start;
  return { xs, end };
}
