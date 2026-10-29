"use client";

import { Part, polar, RnaPath, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R = 130;
const VERTS = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R, a));

/** 60 protomers: 20 triangular faces × 3, drawn as the triangles of the projected outline. */
function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const outline = VERTS.map((v) => v.join(",")).join(" ");
  const inner = [30, 90, 150, 210, 270, 330].map((a) => polar(C, C, R * 0.5, a));
  return (
    <>
      <Part id="capsid" p={p}>
        {cut ? (
          <polygon points={outline} fill="none" className="stroke-capsid" strokeWidth={12} strokeLinejoin="round" />
        ) : (
          <>
            <polygon points={outline} className="fill-capsid-soft stroke-capsid" strokeWidth={3} strokeLinejoin="round" />
            {VERTS.map(([x, y], i) => {
              const [ix, iy] = inner[i];
              const [nx, ny] = VERTS[(i + 1) % 6];
              return (
                <g key={i} className="stroke-capsid" strokeWidth={1.5} opacity={0.7}>
                  <line x1={x} y1={y} x2={ix} y2={iy} />
                  <line x1={nx} y1={ny} x2={ix} y2={iy} />
                  <line x1={C} y1={C} x2={ix} y2={iy} />
                </g>
              );
            })}
            {inner.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={4} className="fill-capsid" />
            ))}
          </>
        )}
        <polygon points={outline} className="part-hit" strokeWidth={6} />
      </Part>

      {cut && (
        <Part id="genome" p={p}>
          <RnaPath
            d={`M ${C - 70} ${C - 20} C ${C - 40} ${C - 90}, ${C + 30} ${C - 70}, ${C + 20} ${C - 20} S ${C - 60} ${C + 10}, ${C - 30} ${C + 50} S ${C + 70} ${C + 70}, ${C + 70} ${C + 10}`}
            width={3}
          />
          <rect x={C - 78} y={C - 26} width={14} height={12} rx={3} className="fill-ink" />
          <circle cx={C} cy={C} r={84} className="part-hit" strokeWidth={2} />
        </Part>
      )}
    </>
  );
}

export const picornavirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["capsid", "genome"],
  interior: ["genome"],
  markers: { capsid: polar(C, C, R + 18, 30), genome: [C + 40, C + 40] },
  Draw,
};
