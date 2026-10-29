"use client";

import { Part, polar, round, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R7 = 128; // outer VP7
const R6 = 108; // VP6
const R2 = 86; // VP2
const hex = (r: number, rot = 30) => [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, r, a + rot).join(",")).join(" ");
const SPIKES = Array.from({ length: 18 }, (_, i) => i * 20 + 10);
// SA11 segment lengths (bp), drawn as 11 arcs of proportional length.
const SEGS = [3302, 2693, 2591, 2362, 1614, 1356, 1105, 1059, 1062, 751, 667];

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  return (
    <>
      <Part id="vp7" p={p}>
        <polygon points={hex(R7)} className={cut ? "stroke-capsid" : "fill-capsid-soft stroke-capsid"} fill={cut ? "none" : undefined} strokeWidth={cut ? 9 : 3} strokeLinejoin="round" />
        {!cut &&
          Array.from({ length: 5 }, (_, ring) => ring).flatMap((ring) =>
            Array.from({ length: (ring + 1) * 6 }, (_, k) => {
              const [x, y] = polar(C, C, 18 + ring * 22, (k * 360) / ((ring + 1) * 6));
              return <circle key={`${ring}-${k}`} cx={x} cy={y} r={5.5} className="fill-capsid" opacity={0.75} />;
            }),
          )}
        <polygon points={hex(R7)} className="part-hit" strokeWidth={6} />
      </Part>

      {cut && (
        <Part id="vp6" p={p}>
          <polygon points={hex(R6)} fill="none" className="stroke-capsid" strokeWidth={8} strokeDasharray="10 4" strokeLinejoin="round" opacity={0.7} />
          <polygon points={hex(R6)} className="part-hit" strokeWidth={10} />
        </Part>
      )}

      {cut && (
        <Part id="vp2" p={p}>
          <polygon points={hex(R2)} fill="none" className="stroke-capsid" strokeWidth={5} strokeLinejoin="round" opacity={0.5} />
          <polygon points={hex(R2)} className="part-hit" strokeWidth={10} />
        </Part>
      )}

      {cut && (
        <Part id="genome" p={p}>
          {SEGS.map((bp, i) => {
            const r = 18 + (i % 4) * 14;
            const start = i * 33;
            const sweep = 30 + (bp / 3302) * 110;
            const [x1, y1] = polar(C, C, r, start);
            const [x2, y2] = polar(C, C, r, start + sweep);
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${round(x2)} ${round(y2)}`;
            return (
              <g key={i}>
                <path d={d} fill="none" className="stroke-genome" strokeWidth={4.5} strokeLinecap="round" />
                <path d={d} fill="none" className="stroke-canvas" strokeWidth={1.4} strokeLinecap="round" />
              </g>
            );
          })}
          <circle cx={C} cy={C} r={66} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      <Part id="vp4" p={p}>
        {SPIKES.map((a) => {
          const [x1, y1] = polar(C, C, R7 - 6, a);
          const [x2, y2] = polar(C, C, R7 + 14, a);
          const [hx, hy] = polar(C, C, R7 + 19, a);
          return (
            <g key={a}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-surface" strokeWidth={3.5} strokeLinecap="round" />
              <circle cx={hx} cy={hy} r={5.5} className="fill-surface" />
            </g>
          );
        })}
        <circle className="part-hit" cx={C} cy={C} r={R7 + 10} strokeWidth={18} fill="none" />
      </Part>
    </>
  );
}

export const rotavirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["vp4", "vp7", "vp6", "vp2", "genome"],
  interior: ["vp6", "vp2", "genome"],
  markers: { vp4: polar(C, C, R7 + 36, 0), vp7: polar(C, C, R7, 210), vp6: polar(C, C, R6, 150), vp2: polar(C, C, R2, 90), genome: [C, C] },
  Draw,
};
