"use client";

import { Part, polar, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 120;
const VERTS = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R, a));

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const outline = VERTS.map((v) => v.join(",")).join(" ");
  return (
    <>
      <Part id="capsid" p={p}>
        <polygon points={outline} className={cut ? "stroke-capsid" : "fill-capsid-soft stroke-capsid"} fill={cut ? "none" : undefined} strokeWidth={cut ? 10 : 3} strokeLinejoin="round" />
        {!cut && VERTS.map(([x, y], i) => <line key={i} x1={C} y1={C} x2={x} y2={y} className="stroke-capsid" strokeWidth={1.5} opacity={0.5} />)}
        <polygon points={outline} className="part-hit" strokeWidth={6} />
      </Part>

      {cut && (
        <Part id="genome" p={p}>
          {/* single line = single-stranded; closed loop = circular */}
          <path d={`M ${C + 62} ${C} C ${C + 62} ${C - 50}, ${C + 10} ${C - 70}, ${C - 30} ${C - 52} S ${C - 80} ${C - 10}, ${C - 56} ${C + 34} S ${C + 30} ${C + 80}, ${C + 62} ${C} Z`} fill="none" className="stroke-genome" strokeWidth={2.5} />
          <circle cx={C} cy={C} r={74} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      <Part id="spikes" p={p}>
        {VERTS.map(([x, y], i) => {
          const a = i * 60;
          const [tx, ty] = polar(C, C, R + 16, a);
          return (
            <g key={i}>
              <polygon points={[0, 72, 144, 216, 288].map((k) => polar(tx, ty, 10, k + a).join(",")).join(" ")} className="fill-surface" />
              <line x1={x} y1={y} x2={tx} y2={ty} className="stroke-surface" strokeWidth={4} />
              <circle cx={tx} cy={ty} r={16} className="part-hit" strokeWidth={2} />
            </g>
          );
        })}
      </Part>
    </>
  );
}

export const microvirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["capsid", "spikes", "genome"],
  interior: ["genome"],
  markers: { capsid: polar(C, C, R * 0.6, 150), spikes: polar(C, C, R + 38, 30), genome: [C + 4, C] },
  Draw,
};
