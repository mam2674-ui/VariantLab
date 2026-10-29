import type { Dimension, Virus } from "./schema";
import { toNm } from "./units";

/**
 * True-proportion silhouette geometry in nanometres, derived only from the
 * dataset's dimensions. Nothing is stretched: callers apply one uniform scale.
 */
export type Shape =
  | { kind: "circle"; cx: number; cy: number; r: number; style: "solid" | "range-max" | "range-min" }
  | { kind: "hexagon"; cx: number; cy: number; w: number; h: number; cap: number; style: "solid" }
  | { kind: "rect"; x: number; y: number; w: number; h: number; style: "solid" | "rod" }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; style: "illustrative" | "range-max" }
  | { kind: "path"; d: string; w: number; style: "outline" | "band" };

export interface Silhouette {
  width: number;
  height: number;
  shapes: Shape[];
  notes: string[];
}

const nm = (d: Dimension, which: "min" | "max") => toNm(d[which], d.unit);
const pick = (v: Virus, part: Dimension["part"], measure?: Dimension["measure"]) => {
  const ds = v.dimensions.filter((d) => d.part === part && (!measure || d.measure === measure));
  // Prefer the most specific scope available.
  const order = ["isolate", "virus", "species", "genus", "family"];
  return ds.sort((a, b) => order.indexOf(a.scope) - order.indexOf(b.scope))[0];
};

export function silhouette(v: Virus): Silhouette | null {
  const notes: string[] = [];
  if (v.morphology.value === "lemon" || v.morphology.value === "geminate") {
    const len=pick(v,"virion","length"),wid=pick(v,"virion","width");
    if(!len || !wid) return null;
    const L=nm(len,"max"), W=nm(wid,"max");
    const d=v.morphology.value === "lemon"
      ? `M ${W/2} 0 Q ${W*1.5} ${L/2} ${W/2} ${L} Q ${-W/2} ${L/2} ${W/2} 0 Z`
      : `M ${W/2} 0 L ${W} ${L*.15} L ${W} ${L*.35} L ${W*.8} ${L*.5} L ${W} ${L*.65} L ${W} ${L*.85} L ${W/2} ${L} L 0 ${L*.85} L 0 ${L*.65} L ${W*.2} ${L*.5} L 0 ${L*.35} L 0 ${L*.15} Z`;
    notes.push("Schematic outline at the recorded dimensions; surface detail omitted.");
    return {width:W,height:L,shapes:[{kind:"path",d,w:1,style:"outline"}],notes};
  }
  if(v.morphology.value === "filamentous-nonenveloped") {
    const len=pick(v,"filament","length"),dia=pick(v,"virion","diameter");
    if(!len || !dia) return null;
    const L=nm(len,"max"),D=nm(dia,"max");
    notes.push("Straight filament at the maximum reported length and diameter.");
    return {width:D,height:L,shapes:[{kind:"rect",x:0,y:0,w:D,h:L,style:"rod"}],notes};
  }
  if(v.morphology.value === "icosahedral-fibred") {
    const cap=pick(v,"capsid","diameter"),outer=pick(v,"virion","diameter");
    if(!cap || !outer) return null;
    const D=nm(cap,"max"),O=nm(outer,"max"),c=O/2;
    notes.push("Capsid inside the outer fibre-layer diameter; individual fibres omitted.");
    return {width:O,height:O,shapes:[{kind:"circle",cx:c,cy:c,r:O/2,style:"range-max"},{kind:"hexagon",cx:c,cy:c,w:D*.866,h:D,cap:D/4,style:"solid"}],notes};
  }
  if (v.morphology.value === "head-tail") {
    const hl = pick(v, "head", "length"), hw = pick(v, "head", "width"), tl = pick(v, "tail", "length"), fl = pick(v, "tail-fibre", "length");
    if (!hl || !hw || !tl) return null;
    const L = nm(hl, "max"), W = nm(hw, "max"), T = nm(tl, "max");
    const F = fl ? nm(fl, "max") : 0;
    const spread = F ? F * 0.55 : W / 2; // fibres drawn in one illustrative pose
    const width = Math.max(W, spread * 2);
    const cx = width / 2;
    const shapes: Shape[] = [
      { kind: "hexagon", cx, cy: L / 2, w: W, h: L, cap: (W / 2) * 0.62, style: "solid" },
      { kind: "rect", x: cx - 10, y: L, w: 20, h: T, style: "solid" },
    ];
    if (F) {
      for (const side of [-1, 1]) {
        const kx = cx + side * spread * 0.8, ky = L + T - F * 0.35;
        const fx = cx + side * spread, fy = L + T + F * 0.45;
        shapes.push({ kind: "line", x1: cx, y1: L + T, x2: kx, y2: ky, style: "illustrative" });
        shapes.push({ kind: "line", x1: kx, y1: ky, x2: fx, y2: fy, style: "illustrative" });
      }
      notes.push("Tail fibres drawn in one illustrative pose; their angle varies.");
    }
    return { width, height: L + T + (F ? F * 0.45 : 0), shapes, notes };
  }

  if (v.morphology.value === "filamentous-enveloped") {
    // A U-bent filament whose centre-line length equals the recorded length (true diameter and length).
    const dia = pick(v, "virion", "diameter"), len = pick(v, "filament", "length");
    if (!dia || !len) return null;
    const D = nm(dia, "max"), Lt = nm(len, "max");
    const r = D * 1.1; // bend radius
    const leg = (Lt - Math.PI * r) / 2;
    const x0 = D / 2, x1 = D / 2 + 2 * r;
    const d = `M ${x0} 0 L ${x0} ${leg} A ${r} ${r} 0 0 0 ${x1} ${leg} L ${x1} 0`;
    notes.push(`Filament drawn ${Math.round(Lt)} nm long and bent into a U; real lengths vary beyond 20 µm.`);
    return { width: x1 + D / 2, height: leg + r + D / 2, shapes: [{ kind: "path", d, w: D, style: "band" }], notes };
  }

  if (v.morphology.value === "bullet-enveloped" || v.morphology.value === "brick-complex") {
    const len = pick(v, "virion", "length"), wid = pick(v, "virion", "width");
    if (!len || !wid) return null;
    const L = nm(len, "max"), W = nm(wid, "max");
    const d =
      v.morphology.value === "bullet-enveloped"
        ? `M 0 ${W} L 0 ${W / 2} A ${W / 2} ${W / 2} 0 0 1 ${W} ${W / 2} L ${W} ${L} Z`
        : `M ${W * 0.18} 0 L ${W * 0.82} 0 Q ${W} 0 ${W} ${W * 0.18} L ${W} ${L - W * 0.18} Q ${W} ${L} ${W * 0.82} ${L} L ${W * 0.18} ${L} Q 0 ${L} 0 ${L - W * 0.18} L 0 ${W * 0.18} Q 0 0 ${W * 0.18} 0 Z`;
    notes.push("Drawn at the top of the reported length and width ranges.");
    return { width: W, height: L, shapes: [{ kind: "path", d, w: 1.5, style: "outline" }], notes };
  }

  if (v.morphology.value === "helical-rod") {
    const len = pick(v, "rod", "length"), dia = pick(v, "rod", "diameter");
    if (!len || !dia) return null;
    const L = nm(len, "max"), D = nm(dia, "max");
    notes.push("Rod drawn lying flat; length and diameter use the same scale.");
    return { width: L, height: D, shapes: [{ kind: "rect", x: 0, y: 0, w: L, h: D, style: "rod" }], notes };
  }

  if (v.morphology.value === "icosahedral-nonenveloped") {
    const cap = pick(v, "capsid", "diameter") ?? pick(v, "virion", "diameter");
    if (!cap) return null;
    const D = nm(cap, "max");
    const fibre = pick(v, "fibre", "length");
    const F = fibre ? nm(fibre, "max") : 0;
    const size = D + 2 * F;
    const c = size / 2;
    const shapes: Shape[] = [{ kind: "hexagon", cx: c, cy: c, w: D * 0.866, h: D, cap: D / 4, style: "solid" }];
    if (F) {
      for (const deg of [0, 60, 120, 180, 240, 300]) {
        const a = (deg - 90) * (Math.PI / 180);
        const r3 = (n: number) => Math.round(n * 1000) / 1000;
        shapes.push({ kind: "line", x1: r3(c + (D / 2) * Math.cos(a)), y1: r3(c + (D / 2) * Math.sin(a)), x2: r3(c + (D / 2 + F) * Math.cos(a)), y2: r3(c + (D / 2 + F) * Math.sin(a)), style: "range-max" });
      }
      notes.push("Fibres drawn at the maximum of the reported range.");
    }
    return { width: size, height: size, shapes, notes };
  }

  // Enveloped, roughly spherical particles: show the reported range as two outlines.
  const env = pick(v, "virion", "diameter");
  if (!env) return null;
  const max = nm(env, "max"), min = nm(env, "min");
  const c = max / 2;
  const shapes: Shape[] = [];
  if (min !== max) {
    shapes.push({ kind: "circle", cx: c, cy: c, r: max / 2, style: "range-max" });
    shapes.push({ kind: "circle", cx: c, cy: c, r: min / 2, style: "range-min" });
  } else shapes.push({ kind: "circle", cx: c, cy: c, r: max / 2, style: "solid" });
  const inner = pick(v, "capsid", "diameter");
  if (inner) {
    const D = nm(inner, "max");
    shapes.push({ kind: "hexagon", cx: c, cy: c, w: D * 0.866, h: D, cap: D / 4, style: "solid" });
  }
  if (v.morphology.status === "variable") notes.push("Pleomorphic: spherical particles shown; other shapes occur.");
  return { width: max, height: max, shapes, notes };
}

export function hexPoints(s: Extract<Shape, { kind: "hexagon" }>, k = 1) {
  const { cx, cy, w, h, cap } = s;
  const top = cy - h / 2, bot = cy + h / 2, l = cx - w / 2, r = cx + w / 2;
  return [
    [cx, top], [r, top + cap], [r, bot - cap], [cx, bot], [l, bot - cap], [l, top + cap],
  ].map(([x, y]) => `${x * k},${y * k}`).join(" ");
}
