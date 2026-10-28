"use client";

import { DnaPath, Part, polar, round, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 112; // vertex radius of the hexagonal outline
const VERTS = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R, a));
const FIBRE = 62; // illustrative length in px

/** Small hexagon centres tiling each of the six triangular facets (illustrative density). */
function hexonCentres(): [number, number][] {
  const out: [number, number][] = [];
  for (let f = 0; f < 6; f++) {
    const [ax, ay] = VERTS[f];
    const [bx, by] = VERTS[(f + 1) % 6];
    const n = 5;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j <= n - i; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n) || (i === n && j === 0)) continue; // vertices hold pentons
        const u = i / n, v = j / n, w = 1 - u - v;
        out.push([round(C * w + ax * u + bx * v), round(C * w + ay * u + by * v)]);
      }
  }
  // de-duplicate shared edges
  const seen = new Set<string>();
  return out.filter(([x, y]) => {
    const k = `${Math.round(x)}:${Math.round(y)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
const HEXONS = hexonCentres();
const hexPts = (x: number, y: number, r: number) => [0, 60, 120, 180, 240, 300].map((a) => polar(x, y, r, a + 30).join(",")).join(" ");

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const outline = VERTS.map((v) => v.join(",")).join(" ");
  return (
    <>
      <Part id="fibre" p={p}>
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const [x1, y1] = polar(C, C, R + 8, a);
          const [x2, y2] = polar(C, C, R + FIBRE, a);
          return (
            <g key={a}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-fibre" strokeWidth={3.5} strokeLinecap="round" />
              <circle cx={x2} cy={y2} r={7} className="fill-fibre" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="part-hit" strokeWidth={16} />
            </g>
          );
        })}
      </Part>

      <Part id="hexon" p={p}>
        <polygon points={outline} className={cut ? "stroke-capsid" : "fill-capsid-soft stroke-capsid"} fill={cut ? "none" : undefined} strokeWidth={cut ? 6 : 2} strokeLinejoin="round" />
        {!cut && HEXONS.map(([x, y], i) => <polygon key={i} points={hexPts(x, y, 8)} className="fill-capsid" opacity={0.85} />)}
        {!cut && VERTS.map(([x, y], i) => <line key={i} x1={C} y1={C} x2={x} y2={y} className="stroke-canvas" strokeWidth={1.5} />)}
        <polygon points={outline} className="part-hit" strokeWidth={4} />
      </Part>

      {cut && (
        <Part id="genome" p={p}>
          <DnaPath
            d={`M ${C - 60} ${C - 30} C ${C - 20} ${C - 80}, ${C + 50} ${C - 70}, ${C + 60} ${C - 20} S ${C - 10} ${C + 10}, ${C - 50} ${C + 20} S ${C - 30} ${C + 80}, ${C + 30} ${C + 60} S ${C + 70} ${C + 10}, ${C + 20} ${C - 5}`}
            width={5}
          />
          <circle cx={C} cy={C} r={80} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      <Part id="penton" p={p}>
        {VERTS.map(([x, y], i) => (
          <polygon key={i} points={[0, 72, 144, 216, 288].map((a) => polar(x, y, 11, a + i * 60).join(",")).join(" ")} className="fill-capsid stroke-canvas" strokeWidth={2} />
        ))}
        {VERTS.map(([x, y], i) => (
          <circle key={`h${i}`} cx={x} cy={y} r={14} className="part-hit" strokeWidth={2} />
        ))}
      </Part>
    </>
  );
}

export const adenovirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["hexon", "penton", "fibre", "genome"],
  interior: ["genome"],
  markers: {
    hexon: polar(C, C, R * 0.55, 150),
    penton: polar(C, C, R - 24, 300),
    fibre: polar(C, C, R + 40, 30),
    genome: [C - 40, C - 50],
  },
  Draw,
};
