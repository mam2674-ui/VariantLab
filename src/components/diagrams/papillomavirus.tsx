"use client";

import { DnaPath, Part, polar, round, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 120;
const VERTS = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R, a));

/** Pentamer centres on a triangular grid inside the hexagonal outline (illustrative, not a true T=7 lattice). */
function capsomerCentres(): [number, number][] {
  const out: [number, number][] = [];
  const step = 34;
  for (let row = -4; row <= 4; row++)
    for (let col = -4; col <= 4; col++) {
      const x = C + col * step + (row % 2 ? step / 2 : 0);
      const y = C + row * step * 0.866;
      // inside the hexagon (pointy-top), with margin
      const dx = Math.abs(x - C), dy = Math.abs(y - C);
      const r = R - 16;
      if (dy <= r && dx <= r * 0.866 && dx * 0.5 + dy * 0.866 <= r * 0.866) out.push([round(x), round(y)]);
    }
  return out;
}
const CAPSOMERS = capsomerCentres();
const L2 = [polar(C, C, R - 30, 30), polar(C, C, R - 30, 150), polar(C, C, R - 30, 270)];

function Pentamer({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => {
        const [px, py] = polar(x, y, 6.5, a);
        return <circle key={a} cx={px} cy={py} r={5} className="fill-capsid" />;
      })}
      <circle cx={x} cy={y} r={2.6} className="fill-canvas" />
    </g>
  );
}

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const outline = VERTS.map((v) => v.join(",")).join(" ");
  return (
    <>
      <Part id="l1" p={p}>
        {cut ? (
          <polygon points={outline} fill="none" className="stroke-capsid" strokeWidth={10} strokeLinejoin="round" />
        ) : (
          <>
            <polygon points={outline} className="fill-capsid-soft stroke-capsid" strokeWidth={2} strokeLinejoin="round" />
            {CAPSOMERS.map(([x, y], i) => (
              <Pentamer key={i} x={x} y={y} />
            ))}
          </>
        )}
        <polygon points={outline} className="part-hit" strokeWidth={4} />
      </Part>

      {cut && (
        <Part id="genome" p={p}>
          <DnaPath d={`M ${C + 70} ${C} A 70 62 0 1 1 ${C + 70} ${C - 0.01} Z`} width={5} />
          <circle cx={C} cy={C} r={74} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      {cut && (
        <Part id="l2" p={p}>
          {L2.map(([x, y], i) => (
            <rect key={i} x={x - 5} y={y - 5} width={10} height={10} transform={`rotate(45 ${x} ${y})`} className="fill-canvas stroke-capsid" strokeWidth={2.5} />
          ))}
          {L2.map(([x, y], i) => (
            <circle key={`h${i}`} cx={x} cy={y} r={12} className="part-hit" strokeWidth={2} />
          ))}
        </Part>
      )}
    </>
  );
}

export const papillomavirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["l1", "l2", "genome"],
  interior: ["l2", "genome"],
  markers: {
    l1: polar(C, C, R + 18, 330),
    l2: [L2[0][0] + 20, L2[0][1] - 4],
    genome: [C, C],
  },
  Draw,
};
