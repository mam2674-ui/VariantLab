"use client";

import { Part, polar, type Renderer, type RendererProps } from "./kit";

const C = 200;
const R_ENV = 140; // ~46 nm envelope
const R_CAP = 104; // ~36 nm nucleocapsid on the same internal scale
const SURFACE = Array.from({ length: 36 }, (_, i) => i * 10);
const capPts = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R_CAP, a + 30).join(",")).join(" ");

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const r = 52;
  // Relaxed circle: one strand complete, the other with a gap (drawn as a ~70° break).
  const [gx1, gy1] = polar(C, C, r - 7, 20);
  const [gx2, gy2] = polar(C, C, r - 7, 290);
  return (
    <>
      <Part id="envelope" p={p}>
        {cut ? (
          <>
            <circle cx={C} cy={C} r={R_ENV} fill="none" className="stroke-envelope" strokeWidth={3} />
            <circle cx={C} cy={C} r={R_ENV - 6} fill="none" className="stroke-envelope" strokeWidth={3} />
          </>
        ) : (
          <circle cx={C} cy={C} r={R_ENV - 3} className="fill-envelope-soft stroke-envelope" strokeWidth={6} />
        )}
        <circle className="part-hit" cx={C} cy={C} r={R_ENV - 3} strokeWidth={12} fill="none" />
      </Part>

      {cut && (
        <Part id="capsid" p={p}>
          <polygon points={capPts} className="fill-canvas stroke-capsid" strokeWidth={8} strokeLinejoin="round" />
          <polygon points={capPts} className="part-hit" strokeWidth={10} />
        </Part>
      )}

      {cut && (
        <Part id="genome" p={p}>
          <circle cx={C} cy={C} r={r} fill="none" className="stroke-genome" strokeWidth={3} />
          <path d={`M ${gx1} ${gy1} A ${r - 7} ${r - 7} 0 1 1 ${gx2} ${gy2}`} fill="none" className="stroke-genome" strokeWidth={3} strokeLinecap="round" />
          <circle cx={C} cy={C} r={r + 4} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      <Part id="surface" p={p}>
        {SURFACE.map((a) => {
          const [x, y] = polar(C, C, R_ENV - 3, a);
          return <rect key={a} x={x - 4} y={y - 8} width={8} height={16} rx={2} transform={`rotate(${a} ${x} ${y})`} className="fill-surface" />;
        })}
        <circle className="part-hit" cx={C} cy={C} r={R_ENV} strokeWidth={18} fill="none" />
      </Part>
    </>
  );
}

export const hepadnavirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["envelope", "surface", "capsid", "genome"],
  interior: ["capsid", "genome"],
  markers: { envelope: polar(C, C, R_ENV + 2, 225), surface: polar(C, C, R_ENV + 22, 20), capsid: polar(C, C, R_CAP, 150), genome: [C, C] },
  Draw,
};
