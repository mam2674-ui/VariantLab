"use client";

import { Part, polar, RnaPath, seeded, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 112;
const rand = seeded(7);
// ~24 spikes: the measured mean (Ke et al. 2020), with irregular spacing.
const SPIKES = Array.from({ length: 24 }, (_, i) => i * 15 + (rand() - 0.5) * 8);
const M_ANGLES = Array.from({ length: 36 }, (_, i) => i * 10 + 5).filter((a) => !SPIKES.some((s) => Math.abs(s - a) < 3));
const E_ANGLES = [42, 168, 262];
// Short helical nucleocapsid units, loosely arranged (illustrative positions).
const UNITS: [number, number, number][] = [
  [-50, -42, 20], [10, -60, -15], [55, -20, 60], [-62, 18, -40], [-8, 4, 30], [44, 40, -10], [-30, 58, 15], [20, 70, 70],
];

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  return (
    <>
      <Part id="envelope" p={p}>
        {cut ? (
          <>
            <circle cx={C} cy={C} r={R} fill="none" className="stroke-envelope" strokeWidth={3.5} />
            <circle cx={C} cy={C} r={R - 7} fill="none" className="stroke-envelope" strokeWidth={3.5} />
          </>
        ) : (
          <circle cx={C} cy={C} r={R - 3} className="fill-envelope-soft stroke-envelope" strokeWidth={7} />
        )}
        <circle className="part-hit" cx={C} cy={C} r={R - 3} strokeWidth={12} fill="none" />
      </Part>

      {cut && (
        <Part id="nucleocapsid" p={p}>
          {UNITS.map(([dx, dy, rot], i) => {
            const x = C + dx, y = C + dy;
            const beads = [-16, -8, 0, 8, 16];
            return (
              <g key={i} transform={`rotate(${rot} ${x} ${y})`}>
                {beads.map((b, k) => (
                  <circle key={k} cx={x + b} cy={y + (k % 2 ? 3 : -3)} r={5} className="fill-nucleocapsid" />
                ))}
                <RnaPath d={`M${x - 22} ${y} Q ${x - 12} ${y - 8} ${x - 4} ${y} T ${x + 12} ${y} T ${x + 24} ${y}`} width={1.6} />
              </g>
            );
          })}
          {/* the single genome threads between units */}
          <RnaPath d={`M${C - 70} ${C - 42} C ${C - 40} ${C - 90}, ${C + 40} ${C - 80}, ${C + 52} ${C - 22} S ${C - 80} ${C + 10}, ${C - 8} ${C + 6} S ${C + 50} ${C + 60}, ${C + 20} ${C + 72}`} width={1.2} />
          <circle className="part-hit" cx={C} cy={C} r={84} strokeWidth={2} />
        </Part>
      )}

      <Part id="spike" p={p}>
        {SPIKES.map((a, i) => {
          const [x1, y1] = polar(C, C, R, a);
          const [x2, y2] = polar(C, C, R + 12, a);
          const [hx, hy] = polar(C, C, R + 22, a);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-surface" strokeWidth={3} strokeLinecap="round" />
              <path
                d={`M ${hx} ${hy + 10} C ${hx - 12} ${hy + 4}, ${hx - 10} ${hy - 10}, ${hx} ${hy - 11} C ${hx + 10} ${hy - 10}, ${hx + 12} ${hy + 4}, ${hx} ${hy + 10} Z`}
                transform={`rotate(${a} ${hx} ${hy})`}
                className="fill-surface"
              />
            </g>
          );
        })}
        <circle className="part-hit" cx={C} cy={C} r={R + 20} strokeWidth={16} fill="none" />
      </Part>

      <Part id="m-protein" p={p}>
        {M_ANGLES.map((a) => {
          const [x, y] = polar(C, C, R - 3, a);
          return <circle key={a} cx={x} cy={y} r={3} className="fill-surface stroke-canvas" strokeWidth={1.2} />;
        })}
      </Part>

      <Part id="e-protein" p={p}>
        {E_ANGLES.map((a) => {
          const [x, y] = polar(C, C, R - 3, a);
          const pts = Array.from({ length: 5 }, (_, k) => polar(x, y, 7, k * 72)).map((q) => q.join(",")).join(" ");
          return <polygon key={a} points={pts} className="fill-canvas stroke-surface" strokeWidth={2} />;
        })}
      </Part>
    </>
  );
}

export const coronavirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["envelope", "spike", "m-protein", "e-protein", "nucleocapsid"],
  interior: ["nucleocapsid"],
  markers: {
    envelope: polar(C, C, R - 3, 222),
    spike: polar(C, C, R + 40, 0),
    "m-protein": polar(C, C, R - 20, 112),
    "e-protein": polar(C, C, R - 22, 168),
    nucleocapsid: [C - 30, C - 4],
  },
  Draw,
};
