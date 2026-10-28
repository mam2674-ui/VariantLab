"use client";

import { DnaPath, Part, polar, seeded, type Renderer, type RendererProps } from "./kit";

const C = 210;
const R_ENV = 160; // envelope ~175 nm (mid of 150–200 family range)
const R_CAP = 114; // capsid 125 nm on the same internal scale
const rand = seeded(11);
const SPIKES = Array.from({ length: 40 }, (_, i) => i * 9 + (rand() - 0.5) * 5);
// Irregular tegument outline: thicker on one side, signalling no icosahedral symmetry.
const TEG = Array.from({ length: 24 }, (_, i) => {
  const a = i * 15;
  const r = R_CAP + 14 + 22 * (0.5 + 0.5 * Math.cos(((a - 40) * Math.PI) / 180)) + rand() * 6;
  return polar(C, C, Math.min(r, R_ENV - 10), a);
});
const tegPath = TEG.map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1]}`).join(" ") + " Z";
// Archimedean spiral: a tidy stand-in for densely packed DNA (packing geometry is not modelled).
const SPIRAL = Array.from({ length: 4 * 24 + 1 }, (_, i) => {
  const [x, y] = polar(C, C, 8 + (i / 96) * 74, i * 15);
  return `${i ? "L" : "M"} ${x} ${y}`;
}).join(" ");
const capPts = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R_CAP, a + 30).join(",")).join(" ");

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
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
        <circle cx={C} cy={C} r={R_ENV - 3} className="part-hit" strokeWidth={12} fill="none" />
      </Part>

      {cut && (
        <Part id="tegument" p={p}>
          <path d={tegPath} className="fill-tegument" opacity={0.45} strokeLinejoin="round" />
          <path d={tegPath} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      {cut && (
        <Part id="capsid" p={p}>
          <polygon points={capPts} className="fill-canvas stroke-capsid" strokeWidth={6} strokeLinejoin="round" />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const [x, y] = polar(C, C, R_CAP, a + 30);
            return <circle key={a} cx={x} cy={y} r={6} className="fill-capsid" />;
          })}
          <polygon points={capPts} className="part-hit" strokeWidth={10} />
        </Part>
      )}

      {cut && (
        <Part id="genome" p={p}>
          <DnaPath d={SPIRAL} width={4.5} />
          <circle cx={C} cy={C} r={84} className="part-hit" strokeWidth={2} />
        </Part>
      )}

      <Part id="glycoproteins" p={p}>
        {SPIKES.map((a, i) => {
          const [x1, y1] = polar(C, C, R_ENV, a);
          const [x2, y2] = polar(C, C, R_ENV + (i % 3 === 0 ? 16 : 11), a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-surface" strokeWidth={i % 3 === 0 ? 4 : 2.5} strokeLinecap="round" />;
        })}
        <circle cx={C} cy={C} r={R_ENV + 9} className="part-hit" strokeWidth={14} fill="none" />
      </Part>
    </>
  );
}

export const herpesvirusRenderer: Renderer = {
  viewBox: "0 0 420 420",
  parts: ["envelope", "glycoproteins", "tegument", "capsid", "genome"],
  interior: ["tegument", "capsid", "genome"],
  markers: {
    envelope: polar(C, C, R_ENV - 3, 225),
    glycoproteins: polar(C, C, R_ENV + 30, 0),
    tegument: polar(C, C, R_CAP + 28, 40),
    capsid: polar(C, C, R_CAP, 210),
    genome: [C + 4, C + 4],
  },
  Draw,
};
