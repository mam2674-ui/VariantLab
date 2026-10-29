"use client";

import { Part, polar, RnaPath, seeded, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 120;
const rand = seeded(23);
// Irregularly spaced Env spikes (ICTV: "irregularly spaced").
const SPIKES = Array.from({ length: 14 }, (_, i) => i * (360 / 14) + (rand() - 0.5) * 14);
// Truncated cone core; its tilt and proportions are illustrative.
const CORE = { w1: 30, w2: 92, len: 170, tilt: -28 };

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const half = CORE.len / 2;
  const cone = `M ${C - CORE.w1 / 2} ${C - half} L ${C + CORE.w1 / 2} ${C - half} L ${C + CORE.w2 / 2} ${C + half} Q ${C} ${C + half + 18} ${C - CORE.w2 / 2} ${C + half} Z`;
  return (
    <>
      <Part id="envelope" p={p}>
        {cut ? (
          <>
            <circle cx={C} cy={C} r={R} fill="none" className="stroke-envelope" strokeWidth={3} />
            <circle cx={C} cy={C} r={R - 6} fill="none" className="stroke-envelope" strokeWidth={3} />
          </>
        ) : (
          <circle cx={C} cy={C} r={R - 3} className="fill-envelope-soft stroke-envelope" strokeWidth={6} />
        )}
        <circle className="part-hit" cx={C} cy={C} r={R - 3} strokeWidth={12} fill="none" />
      </Part>

      {cut && (
        <Part id="core" p={p}>
          <g transform={`rotate(${CORE.tilt} ${C} ${C})`}>
            <path d={cone} className="fill-capsid-soft stroke-capsid" strokeWidth={5} strokeLinejoin="round" />
            <path d={cone} className="part-hit" strokeWidth={8} />
          </g>
        </Part>
      )}

      {cut && (
        <Part id="genome" p={p}>
          <g transform={`rotate(${CORE.tilt} ${C} ${C})`}>
            <RnaPath d={`M ${C - 8} ${C - 60} C ${C - 30} ${C - 20}, ${C + 20} ${C}, ${C - 20} ${C + 40} S ${C + 10} ${C + 70}, ${C - 12} ${C + 80}`} width={2.5} />
            <RnaPath d={`M ${C + 6} ${C - 60} C ${C + 26} ${C - 20}, ${C - 18} ${C + 4}, ${C + 22} ${C + 40} S ${C - 4} ${C + 72}, ${C + 18} ${C + 80}`} width={2.5} />
            <rect className="part-hit" x={C - 30} y={C - 64} width={60} height={150} strokeWidth={2} />
          </g>
        </Part>
      )}

      <Part id="env" p={p}>
        {SPIKES.map((a, i) => {
          const [x1, y1] = polar(C, C, R, a);
          const [x2, y2] = polar(C, C, R + 12, a);
          const [hx, hy] = polar(C, C, R + 17, a);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-surface" strokeWidth={3} strokeLinecap="round" />
              <polygon points={[0, 120, 240].map((k) => polar(hx, hy, 7, a + k).join(",")).join(" ")} className="fill-surface" />
            </g>
          );
        })}
        <circle className="part-hit" cx={C} cy={C} r={R + 14} strokeWidth={16} fill="none" />
      </Part>
    </>
  );
}

export const retrovirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["envelope", "env", "core", "genome"],
  interior: ["core", "genome"],
  markers: { envelope: polar(C, C, R - 3, 230), env: polar(C, C, R + 34, 10), core: polar(C, C, 70, 120), genome: [C - 22, C - 6] },
  Draw,
};
