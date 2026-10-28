"use client";

import { Part, polar, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 118;
// PR8 segment lengths (nt), segments 1–8 (NCBI RefSeq), mapped to rod length.
const SEGMENTS = [2341, 2341, 2233, 1778, 1565, 1413, 1027, 890];
const NA_ANGLES = [20, 95, 160, 215, 280, 335];
const M2_ANGLES = [55, 190, 305];
const HA_ANGLES = Array.from({ length: 30 }, (_, i) => i * 12).filter(
  (a) => !NA_ANGLES.some((n) => Math.abs(n - a) < 6) && !M2_ANGLES.some((m) => Math.abs(m - a) < 5),
);

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
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
        <Part id="matrix" p={p}>
          <circle cx={C} cy={C} r={R - 13} fill="none" className="stroke-matrix" strokeWidth={5} strokeDasharray="3 2" />
          <circle className="part-hit" cx={C} cy={C} r={R - 13} strokeWidth={10} fill="none" />
        </Part>
      )}

      {cut && (
        <Part id="rnp" p={p}>
          {SEGMENTS.map((nt, i) => {
            const len = 40 + (nt / 2341) * 80;
            const x = C - 84 + i * 24;
            const y = C - len / 2 + (i % 2 ? 8 : -8);
            const rot = (i - 3.5) * 4;
            return (
              <g key={i} transform={`rotate(${rot} ${x + 7} ${C})`}>
                <rect x={x} y={y} width={14} height={len} rx={7} className="fill-nucleocapsid" />
                {Array.from({ length: Math.floor(len / 8) }, (_, k) => (
                  <line key={k} x1={x + 2} x2={x + 12} y1={y + 6 + k * 8} y2={y + 2 + k * 8} className="stroke-canvas" strokeWidth={1.2} opacity={0.7} />
                ))}
                <circle cx={x + 7} cy={y + 5} r={4} className="fill-ink" />
              </g>
            );
          })}
          <rect className="part-hit" x={C - 90} y={C - 72} width={200} height={144} rx={12} strokeWidth={2} />
        </Part>
      )}

      <Part id="ha" p={p}>
        {HA_ANGLES.map((a) => {
          const [x1, y1] = polar(C, C, R, a);
          const [x2, y2] = polar(C, C, R + 16, a);
          const [hx, hy] = polar(C, C, R + 21, a);
          return (
            <g key={a}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-surface" strokeWidth={4} strokeLinecap="round" />
              <ellipse cx={hx} cy={hy} rx={5} ry={7} transform={`rotate(${a} ${hx} ${hy})`} className="fill-surface" />
            </g>
          );
        })}
        <circle className="part-hit" cx={C} cy={C} r={R + 18} strokeWidth={14} fill="none" />
      </Part>

      <Part id="na" p={p}>
        {NA_ANGLES.map((a) => {
          const [x1, y1] = polar(C, C, R, a);
          const [x2, y2] = polar(C, C, R + 14, a);
          const [hx, hy] = polar(C, C, R + 20, a);
          return (
            <g key={a}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-surface" strokeWidth={2} />
              <rect x={hx - 6} y={hy - 6} width={12} height={12} rx={2} transform={`rotate(${a} ${hx} ${hy})`} className="fill-canvas stroke-surface" strokeWidth={2.5} />
            </g>
          );
        })}
      </Part>

      <Part id="m2" p={p}>
        {M2_ANGLES.map((a) => {
          const [x, y] = polar(C, C, R - 3, a);
          return <rect key={a} x={x - 3} y={y - 7} width={6} height={14} transform={`rotate(${a} ${x} ${y})`} className="fill-surface stroke-canvas" strokeWidth={1.5} />;
        })}
      </Part>
    </>
  );
}

export const influenzaRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["envelope", "ha", "na", "m2", "matrix", "rnp"],
  interior: ["matrix", "rnp"],
  markers: {
    envelope: polar(C, C, R - 3, 245),
    ha: polar(C, C, R + 34, 0),
    na: polar(C, C, R + 36, 95),
    m2: polar(C, C, R - 24, 55),
    matrix: polar(C, C, R - 13, 215),
    rnp: [C + 44, C + 86],
  },
  Draw,
};
