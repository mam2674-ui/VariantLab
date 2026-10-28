"use client";

import { DnaPath, Part, type Renderer, type RendererProps } from "./kit";

// Scale: 1.7 px per nm. Head 120 × 86 nm, tail ~140 nm (Fokine 2004; Rao 2023).
const S = 1.7;
const X = 260;
const HEAD_TOP = 24;
const HEAD_L = 120 * S; // 204
const HEAD_W = 86 * S; // 146
const HEAD_BOTTOM = HEAD_TOP + HEAD_L;
const NECK = 14;
const TAIL_TOP = HEAD_BOTTOM + NECK;
const TAIL_L = 140 * S - NECK - 18; // tail incl. neck & baseplate ≈ 140 nm
const BASE_Y = TAIL_TOP + TAIL_L;
const BASE_H = 18;
const hw = HEAD_W / 2;
const cap = hw * 0.62; // height of the pyramidal end caps

const headPoints = [
  [X, HEAD_TOP], [X + hw, HEAD_TOP + cap], [X + hw, HEAD_BOTTOM - cap], [X, HEAD_BOTTOM], [X - hw, HEAD_BOTTOM - cap], [X - hw, HEAD_TOP + cap],
].map((q) => q.join(",")).join(" ");

// Kinked long tail fibres: baseplate → knee → foot. Proximal + distal ≈ 160 nm.
const FIBRES = [-1, 1].flatMap((side) =>
  [0, 1, 2].map((k) => {
    const sx = X + side * (22 + k * 6);
    const sy = BASE_Y + BASE_H - 4;
    const kx = X + side * (120 + k * 26);
    const ky = BASE_Y - 70 + k * 22;
    const fx = X + side * (150 + k * 30);
    const fy = BASE_Y + 130 + k * 10;
    return `M ${sx} ${sy} L ${kx} ${ky} L ${fx} ${fy}`;
  }),
);

function Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const sheathX = X - 15;
  return (
    <>
      <Part id="fibres" p={p}>
        {FIBRES.map((d, i) => (
          <path key={i} d={d} fill="none" className="stroke-fibre" strokeWidth={i % 3 === 0 ? 4 : 3} strokeLinejoin="round" strokeLinecap="round" opacity={i % 3 === 2 ? 0.6 : 1} />
        ))}
        {FIBRES.map((d, i) => (
          <path key={`h${i}`} d={d} fill="none" className="part-hit" strokeWidth={16} />
        ))}
      </Part>

      <Part id="head" p={p}>
        <polygon points={headPoints} className={cut ? "stroke-capsid" : "fill-capsid-soft stroke-capsid"} fill={cut ? "none" : undefined} strokeWidth={5} strokeLinejoin="round" />
        {!cut && (
          <g className="stroke-capsid" strokeWidth={1} opacity={0.45}>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={X - hw} x2={X + hw} y1={HEAD_TOP + cap + f * (HEAD_L - 2 * cap)} y2={HEAD_TOP + cap + f * (HEAD_L - 2 * cap)} />
            ))}
            <line x1={X} y1={HEAD_TOP} x2={X} y2={HEAD_BOTTOM} />
            <line x1={X - hw} y1={HEAD_TOP + cap} x2={X} y2={HEAD_TOP + 2 * cap} />
            <line x1={X + hw} y1={HEAD_TOP + cap} x2={X} y2={HEAD_TOP + 2 * cap} />
            <line x1={X - hw} y1={HEAD_BOTTOM - cap} x2={X} y2={HEAD_BOTTOM - 2 * cap} />
            <line x1={X + hw} y1={HEAD_BOTTOM - cap} x2={X} y2={HEAD_BOTTOM - 2 * cap} />
          </g>
        )}
        <polygon points={headPoints} className="part-hit" strokeWidth={10} />
      </Part>

      {cut && (
        <Part id="dna" p={p}>
          <DnaPath
            d={Array.from({ length: 9 }, (_, i) => {
              const y = HEAD_TOP + 42 + i * 15;
              const w = hw - 18 - Math.abs(4 - i) * 4;
              return `${i === 0 ? "M" : "L"} ${X - w} ${y} C ${X - w / 2} ${y - 10}, ${X + w / 2} ${y + 10}, ${X + w} ${y}`;
            }).join(" ") + ` L ${X} ${HEAD_BOTTOM - 6} L ${X} ${TAIL_TOP + 6}`}
            width={4.5}
          />
          <rect className="part-hit" x={X - hw + 10} y={HEAD_TOP + 30} width={HEAD_W - 20} height={HEAD_L - 50} strokeWidth={2} />
        </Part>
      )}

      <Part id="portal" p={p}>
        <rect x={X - 18} y={HEAD_BOTTOM - 4} width={36} height={NECK + 4} rx={3} className="fill-portal" />
        <rect x={X - 28} y={HEAD_BOTTOM + NECK - 6} width={56} height={6} rx={2} className="fill-portal" />
        <rect className="part-hit" x={X - 30} y={HEAD_BOTTOM - 6} width={60} height={NECK + 10} strokeWidth={2} />
      </Part>

      <Part id="sheath" p={p}>
        {cut ? (
          <>
            <rect x={sheathX} y={TAIL_TOP} width={8} height={TAIL_L} className="fill-tail" />
            <rect x={X + 7} y={TAIL_TOP} width={8} height={TAIL_L} className="fill-tail" />
          </>
        ) : (
          <>
            <rect x={sheathX} y={TAIL_TOP} width={30} height={TAIL_L} rx={3} className="fill-tail" />
            {Array.from({ length: Math.floor(TAIL_L / 9) }, (_, i) => (
              <line key={i} x1={sheathX} x2={sheathX + 30} y1={TAIL_TOP + 5 + i * 9} y2={TAIL_TOP + 5 + i * 9} className="stroke-canvas" strokeWidth={1.5} opacity={0.6} />
            ))}
          </>
        )}
        <rect className="part-hit" x={sheathX - 4} y={TAIL_TOP} width={38} height={TAIL_L} strokeWidth={2} />
      </Part>

      {cut && (
        <Part id="tube" p={p}>
          <rect x={X - 5} y={TAIL_TOP} width={10} height={TAIL_L + 6} className="fill-portal" />
          <line x1={X} x2={X} y1={TAIL_TOP} y2={TAIL_TOP + TAIL_L + 6} className="stroke-canvas" strokeWidth={2} />
          <rect className="part-hit" x={X - 8} y={TAIL_TOP} width={16} height={TAIL_L} strokeWidth={2} />
        </Part>
      )}

      <Part id="baseplate" p={p}>
        <polygon
          points={`${X - 40},${BASE_Y} ${X + 40},${BASE_Y} ${X + 52},${BASE_Y + BASE_H / 2} ${X + 40},${BASE_Y + BASE_H} ${X - 40},${BASE_Y + BASE_H} ${X - 52},${BASE_Y + BASE_H / 2}`}
          className="fill-tail"
        />
        <rect className="part-hit" x={X - 54} y={BASE_Y - 2} width={108} height={BASE_H + 4} strokeWidth={2} />
      </Part>
    </>
  );
}

export const phageT4Renderer: Renderer = {
  viewBox: "0 0 520 600",
  parts: ["head", "dna", "portal", "sheath", "tube", "baseplate", "fibres"],
  interior: ["dna", "tube"],
  markers: {
    head: [X + hw + 22, HEAD_TOP + cap + 20],
    dna: [X - 30, HEAD_TOP + 100],
    portal: [X + 44, HEAD_BOTTOM + 6],
    sheath: [X + 32, TAIL_TOP + 60],
    tube: [X - 30, TAIL_TOP + 120],
    baseplate: [X + 68, BASE_Y + 8],
    fibres: [X - 150, BASE_Y + 40],
  },
  Draw,
};
