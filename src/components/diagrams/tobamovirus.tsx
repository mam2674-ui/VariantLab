"use client";

import { Part, round, type Renderer, type RendererProps } from "./kit";

// A short stretch of rod, drawn horizontally. 18 nm diameter → 120 px; turns are illustrative.
const X0 = 30;
const X1 = 470;
const CY = 150;
const H = 120;
const PITCH = 22; // px per turn (illustrative)
const PER_TURN = 8; // subunits drawn per visible half-turn (illustrative)

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const turns = Math.floor((X1 - X0) / PITCH);
  const subunits = Array.from({ length: turns * PER_TURN }, (_, i) => {
    const t = i / PER_TURN; // turn index
    const phase = (i % PER_TURN) / PER_TURN; // 0..1 across the visible face
    const x = round(X0 + t * PITCH + phase * PITCH * 0.5);
    const y = round(CY - H / 2 + 8 + phase * (H - 16));
    return { x, y, i };
  });
  // RNA follows the helix at a smaller radius.
  const rna = Array.from({ length: turns * 12 + 1 }, (_, i) => {
    const t = i / 12;
    const x = round(X0 + t * PITCH);
    const y = round(CY + Math.sin(t * Math.PI * 2) * (H * 0.22));
    return `${i ? "L" : "M"} ${x} ${y}`;
  }).join(" ");

  return (
    <>
      <Part id="coat" p={p}>
        <rect x={X0} y={CY - H / 2} width={X1 - X0} height={H} rx={6} className="fill-capsid-soft stroke-capsid" strokeWidth={3} />
        {(cut ? subunits.filter((s) => s.y < CY - H * 0.25 || s.y > CY + H * 0.25) : subunits).map((s) => (
          <rect key={s.i} x={s.x - 4} y={s.y - 6} width={8} height={12} rx={2} className="fill-capsid" opacity={0.8} transform={`rotate(-18 ${s.x} ${s.y})`} />
        ))}
        {cut && <rect x={X0} y={CY - 8} width={X1 - X0} height={16} className="fill-canvas" />}
        <rect className="part-hit" x={X0} y={CY - H / 2} width={X1 - X0} height={H} strokeWidth={2} />
      </Part>
      {cut && (
        <Part id="genome" p={p}>
          <path d={rna} fill="none" className="stroke-genome" strokeWidth={2.5} strokeLinejoin="round" />
          <rect className="part-hit" x={X0} y={CY - H * 0.25} width={X1 - X0} height={H * 0.5} strokeWidth={2} />
        </Part>
      )}
      <text x={X0} y={CY + H / 2 + 26} className="fill-mute" style={{ font: "400 12px var(--font-text)" }}>
        {cut ? "Cut lengthwise: centre band = axial canal" : "Short section only; the whole rod is ~300 nm long"}
      </text>
    </>
  );
}

export const tobamovirusRenderer: Renderer = {
  viewBox: "0 0 500 260",
  parts: ["coat", "genome"],
  interior: ["genome"],
  markers: { coat: [X1 - 6, CY - H / 2 - 14], genome: [X0 + 110, CY - 34] },
  Draw,
};
