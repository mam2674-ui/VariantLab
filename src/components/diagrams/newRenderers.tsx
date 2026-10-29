"use client";

import { DnaPath, Part, polar, RnaPath, round, type Renderer, type RendererProps } from "./kit";

/* ---------- Ebola: U-bent filament ---------- */
const FR = 34; // half-width of filament in px (~97 nm)
const U = { x0: 110, x1: 410, y0: 70, y1: 250 }; // legs from y0 down to y1, joined by a bend at the bottom
const uPath = (r: number) =>
  `M ${U.x0 - r} ${U.y0} L ${U.x0 - r} ${U.y1} A ${(U.x1 - U.x0) / 2 + r} ${(U.x1 - U.x0) / 2 + r} 0 0 0 ${U.x1 + r} ${U.y1} L ${U.x1 + r} ${U.y0}`;
const uCenter = `M ${U.x0} ${U.y0} L ${U.x0} ${U.y1} A ${(U.x1 - U.x0) / 2} ${(U.x1 - U.x0) / 2} 0 0 0 ${U.x1} ${U.y1} L ${U.x1} ${U.y0}`;

function uSamples(n: number, r: number): [number, number, number][] {
  // points along the outer edge with outward angle (deg)
  const out: [number, number, number][] = [];
  const legL = U.y1 - U.y0;
  const R = (U.x1 - U.x0) / 2;
  const total = 2 * legL + Math.PI * R;
  for (let i = 0; i < n; i++) {
    const d = (i / (n - 1)) * total;
    if (d < legL) out.push([U.x0 - r, U.y0 + d, 270]);
    else if (d < legL + Math.PI * R) {
      const t = (d - legL) / R; // 0..π
      const cx = (U.x0 + U.x1) / 2;
      const a = Math.PI - t;
      out.push([round(cx + Math.cos(a) * (R + r)), round(U.y1 + Math.sin(a) * (R + r)), round((a * 180) / Math.PI + 90)]);
    } else out.push([U.x1 + r, U.y1 - (d - legL - Math.PI * R), 90]);
  }
  return out;
}

function EbolaDraw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const spikes = [...uSamples(46, FR), ...uSamples(46, -FR).map(([x, y, a]) => [x, y, a + 180] as [number, number, number])];
  return (
    <>
      <Part id="envelope" p={p}>
        <path d={uPath(0)} fill="none" className={cut ? "stroke-envelope" : "stroke-envelope"} strokeWidth={cut ? 3 : FR * 2} strokeLinecap="round" opacity={cut ? 1 : 0.35} />
        {cut && (
          <>
            <path d={uPath(FR)} fill="none" className="stroke-envelope" strokeWidth={4} />
            <path d={uPath(-FR)} fill="none" className="stroke-envelope" strokeWidth={4} />
          </>
        )}
        <path d={uCenter} fill="none" className="part-hit" strokeWidth={FR * 2} />
      </Part>
      {cut && (
        <Part id="rnp" p={p}>
          <path d={uCenter} fill="none" className="stroke-nucleocapsid" strokeWidth={22} strokeLinecap="round" />
          <path d={uCenter} fill="none" className="stroke-canvas" strokeWidth={2} strokeDasharray="3 5" />
          <path d={uCenter} fill="none" className="part-hit" strokeWidth={24} />
        </Part>
      )}
      <Part id="gp" p={p}>
        {spikes.map(([x, y, a], i) => {
          const [hx, hy] = polar(x, y, 8, a + 90);
          return <circle key={i} cx={hx} cy={hy} r={4} className="fill-surface" />;
        })}
        <path d={uPath(FR + 8)} fill="none" className="part-hit" strokeWidth={14} />
        <path d={uPath(-FR - 8)} fill="none" className="part-hit" strokeWidth={14} />
      </Part>
    </>
  );
}

export const filovirusRenderer: Renderer = {
  viewBox: "0 0 520 460",
  parts: ["envelope", "gp", "rnp"],
  interior: ["rnp"],
  markers: { envelope: [U.x0 + FR + 20, U.y0 + 40], gp: [U.x1 + FR + 26, U.y0 + 20], rnp: [U.x0, U.y0 + 110] },
  Draw: EbolaDraw,
};

/* ---------- Rabies: bullet ---------- */
const BX0 = 70, BX1 = 430, BY = 170, BH = 78; // flat base at left, dome at right
const bullet = (k: number) => `M ${BX0} ${BY - BH * k} L ${BX1 - BH * k} ${BY - BH * k} A ${BH * k} ${BH * k} 0 0 1 ${BX1 - BH * k} ${BY + BH * k} L ${BX0} ${BY + BH * k} Z`;

function RabiesDraw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const spikes: [number, number, number][] = [];
  for (let x = BX0 + 8; x < BX1 - BH; x += 18) {
    spikes.push([x, BY - BH, 0], [x, BY + BH, 180]);
  }
  for (let a = -80; a <= 80; a += 20) {
    const [x, y] = polar(BX1 - BH, BY, BH, a + 90);
    spikes.push([x, y, a + 90]);
  }
  return (
    <>
      <Part id="envelope" p={p}>
        <path d={bullet(1)} className={cut ? "stroke-envelope" : "fill-envelope-soft stroke-envelope"} fill={cut ? "none" : undefined} strokeWidth={cut ? 3 : 6} />
        {cut && <path d={bullet(0.93)} fill="none" className="stroke-envelope" strokeWidth={3} />}
        <path d={bullet(1)} className="part-hit" strokeWidth={10} />
      </Part>
      {cut && (
        <Part id="matrix" p={p}>
          <path d={bullet(0.84)} fill="none" className="stroke-matrix" strokeWidth={5} strokeDasharray="3 2" />
          <path d={bullet(0.84)} className="part-hit" strokeWidth={10} fill="none" />
        </Part>
      )}
      {cut && (
        <Part id="nucleocapsid" p={p}>
          {Array.from({ length: 15 }, (_, i) => {
            const x = BX0 + 22 + i * 19;
            const h = x > BX1 - BH ? Math.sqrt(Math.max(0, (BH * 0.7) ** 2 - (x - (BX1 - BH)) ** 2)) : BH * 0.7;
            return h > 6 ? <line key={i} x1={x} x2={x + 10} y1={BY - h} y2={BY + h} className="stroke-nucleocapsid" strokeWidth={8} strokeLinecap="round" /> : null;
          })}
          <rect className="part-hit" x={BX0 + 10} y={BY - BH * 0.7} width={BX1 - BX0 - 30} height={BH * 1.4} strokeWidth={2} />
        </Part>
      )}
      <Part id="g" p={p}>
        {spikes.map(([x, y, a], i) => {
          const [x2, y2] = polar(x, y, 10, a);
          const [hx, hy] = polar(x, y, 14, a);
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x2} y2={y2} className="stroke-surface" strokeWidth={3} />
              <circle cx={hx} cy={hy} r={5} className="fill-surface" />
            </g>
          );
        })}
        <path d={bullet(1.2)} fill="none" className="part-hit" strokeWidth={14} />
      </Part>
    </>
  );
}

export const rhabdovirusRenderer: Renderer = {
  viewBox: "0 0 520 340",
  parts: ["envelope", "g", "matrix", "nucleocapsid"],
  interior: ["matrix", "nucleocapsid"],
  markers: { envelope: [BX0 - 14, BY - 40], g: [BX1 + 20, BY - 60], matrix: [BX0 + 30, BY + BH * 0.84 - 2], nucleocapsid: [BX0 + 160, BY - 2] },
  Draw: RabiesDraw,
};

/* ---------- Vaccinia: brick with biconcave core ---------- */
function VacciniaDraw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const X = 60, Y = 50, W = 400, H = 260;
  const core = `M 150 120 Q 260 165 370 120 L 370 240 Q 260 195 150 240 Z`;
  return (
    <>
      <Part id="membrane" p={p}>
        <rect x={X} y={Y} width={W} height={H} rx={48} className={cut ? "stroke-envelope" : "fill-envelope-soft stroke-envelope"} fill={cut ? "none" : undefined} strokeWidth={cut ? 4 : 6} />
        <rect x={X} y={Y} width={W} height={H} rx={48} className="part-hit" strokeWidth={10} />
      </Part>
      {!cut && (
        <Part id="tubules" p={p}>
          {Array.from({ length: 9 }, (_, r) =>
            Array.from({ length: 13 }, (_, c) => {
              const x = X + 40 + c * 27 + (r % 2) * 8;
              const y = Y + 30 + r * 25;
              return <path key={`${r}-${c}`} d={`M ${x} ${y} q 8 -6 16 0`} fill="none" className="stroke-surface" strokeWidth={3} strokeLinecap="round" />;
            }),
          )}
          <rect x={X + 20} y={Y + 15} width={W - 40} height={H - 30} className="part-hit" strokeWidth={2} />
        </Part>
      )}
      {cut && (
        <Part id="lateral" p={p}>
          <ellipse cx={260} cy={92} rx={70} ry={22} className="fill-matrix" opacity={0.85} />
          <ellipse cx={260} cy={268} rx={70} ry={22} className="fill-matrix" opacity={0.85} />
        </Part>
      )}
      {cut && (
        <Part id="core" p={p}>
          <path d={core} className="fill-capsid-soft stroke-capsid" strokeWidth={6} strokeLinejoin="round" />
          <path d={core} className="part-hit" strokeWidth={8} />
        </Part>
      )}
      {cut && (
        <Part id="genome" p={p}>
          <DnaPath d="M 175 175 C 210 150, 240 205, 270 178 S 330 150, 345 185 S 300 215, 260 200 S 190 210, 185 190" width={5} />
          <rect className="part-hit" x={170} y={150} width={180} height={65} strokeWidth={2} />
        </Part>
      )}
    </>
  );
}

export const poxvirusRenderer: Renderer = {
  viewBox: "0 0 520 360",
  parts: ["membrane", "tubules", "lateral", "core", "genome"],
  interior: ["lateral", "core", "genome"],
  markers: { membrane: [52, 80], tubules: [460, 60], lateral: [345, 92], core: [380, 180], genome: [190, 160] },
  Draw: VacciniaDraw,
};

/* ---------- Zika: smooth sphere ---------- */
function ZikaDraw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const C = 200, R = 130;
  return (
    <>
      <Part id="envelope" p={p}>
        {cut ? (
          <>
            <circle cx={C} cy={C} r={R} fill="none" className="stroke-envelope" strokeWidth={4} />
            <circle cx={C} cy={C} r={R - 8} fill="none" className="stroke-envelope" strokeWidth={4} />
          </>
        ) : (
          <circle cx={C} cy={C} r={R} className="fill-envelope-soft stroke-envelope" strokeWidth={4} />
        )}
        <circle cx={C} cy={C} r={R} className="part-hit" strokeWidth={12} fill="none" />
      </Part>
      <Part id="eprot" p={p}>
        {(cut ? Array.from({ length: 30 }, (_, i) => i * 12) : []).map((a) => {
          const [x, y] = polar(C, C, R + 4, a);
          return <rect key={a} x={x - 9} y={y - 3} width={18} height={6} rx={3} transform={`rotate(${a} ${x} ${y})`} className="fill-surface" />;
        })}
        {!cut &&
          Array.from({ length: 5 }, (_, ring) =>
            Array.from({ length: Math.max(1, ring * 6) }, (_, k) => {
              const [x, y] = polar(C, C, ring * 26, (k * 360) / Math.max(1, ring * 6) + ring * 9);
              return <rect key={`${ring}-${k}`} x={x - 10} y={y - 4} width={20} height={8} rx={4} transform={`rotate(${(k * 60 + ring * 30) % 180} ${x} ${y})`} className="fill-surface" opacity={0.85} />;
            }),
          )}
        <circle cx={C} cy={C} r={R + 4} className="part-hit" strokeWidth={14} fill="none" />
      </Part>
      {cut && (
        <Part id="capsid" p={p}>
          <circle cx={C} cy={C} r={74} className="fill-nucleocapsid" opacity={0.35} />
          <circle cx={C} cy={C} r={74} className="part-hit" strokeWidth={6} fill="none" />
        </Part>
      )}
      {cut && (
        <Part id="genome" p={p}>
          <RnaPath d={`M ${C - 50} ${C - 10} C ${C - 30} ${C - 60}, ${C + 40} ${C - 50}, ${C + 40} ${C} S ${C - 20} ${C + 40}, ${C - 40} ${C + 20} S ${C + 20} ${C + 60}, ${C + 50} ${C + 30}`} width={3} />
          <circle cx={C} cy={C} r={60} className="part-hit" strokeWidth={2} />
        </Part>
      )}
    </>
  );
}

export const flavivirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["envelope", "eprot", "capsid", "genome"],
  interior: ["capsid", "genome"],
  markers: { envelope: polar(200, 200, 130, 230), eprot: polar(200, 200, 156, 30), capsid: polar(200, 200, 74, 130), genome: [200, 200] },
  Draw: ZikaDraw,
};

/* ---------- Norwalk: VP1 shell with cup-shaped depressions ---------- */
function NorwalkDraw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const C = 200, R = 130;
  const outline = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R, a).join(",")).join(" ");
  const cups = [[C, C] as [number, number], ...[0, 60, 120, 180, 240, 300].map((a) => polar(C, C, 70, a + 30)), ...[0, 60, 120, 180, 240, 300].map((a) => polar(C, C, 108, a))];
  return (
    <>
      <Part id="vp1" p={p}>
        <polygon points={outline} className={cut ? "stroke-capsid" : "fill-capsid-soft stroke-capsid"} fill={cut ? "none" : undefined} strokeWidth={cut ? 12 : 3} strokeLinejoin="round" />
        {!cut &&
          cups.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={22} className="fill-capsid" opacity={0.85} />
              <circle cx={x} cy={y} r={11} className="fill-canvas" />
            </g>
          ))}
        <polygon points={outline} className="part-hit" strokeWidth={6} />
      </Part>
      {cut && (
        <Part id="vp2" p={p}>
          <rect x={C + 50} y={C - 70} width={12} height={12} transform={`rotate(45 ${C + 56} ${C - 64})`} className="fill-canvas stroke-capsid" strokeWidth={2.5} />
          <circle cx={C + 56} cy={C - 64} r={14} className="part-hit" strokeWidth={2} />
        </Part>
      )}
      {cut && (
        <Part id="genome" p={p}>
          <RnaPath d={`M ${C - 60} ${C} C ${C - 40} ${C - 60}, ${C + 20} ${C - 50}, ${C + 30} ${C} S ${C - 30} ${C + 50}, ${C + 60} ${C + 40}`} width={3} />
          <circle cx={C} cy={C} r={70} className="part-hit" strokeWidth={2} />
        </Part>
      )}
    </>
  );
}

export const calicivirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["vp1", "vp2", "genome"],
  interior: ["vp2", "genome"],
  markers: { vp1: polar(200, 200, 150, 330), vp2: [276, 120], genome: [200, 210] },
  Draw: NorwalkDraw,
};

/* ---------- MS2: small T=3 shell ---------- */
function Ms2Draw(p: RendererProps) {
  const cut = p.view === "cutaway";
  const C = 200, R = 120;
  const outline = [0, 60, 120, 180, 240, 300].map((a) => polar(C, C, R, a).join(",")).join(" ");
  const subs = Array.from({ length: 4 }, (_, ring) => ring).flatMap((ring) =>
    Array.from({ length: Math.max(1, ring * 6) }, (_, k) => polar(C, C, ring * 30, (k * 360) / Math.max(1, ring * 6))),
  );
  const [ax, ay] = polar(C, C, R + 4, 150);
  return (
    <>
      <Part id="coat" p={p}>
        <polygon points={outline} className={cut ? "stroke-capsid" : "fill-capsid-soft stroke-capsid"} fill={cut ? "none" : undefined} strokeWidth={cut ? 10 : 3} strokeLinejoin="round" />
        {!cut && subs.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={13} className="fill-capsid" opacity={0.8} />)}
        <polygon points={outline} className="part-hit" strokeWidth={6} />
      </Part>
      {cut && (
        <Part id="genome" p={p}>
          <RnaPath d={`M ${C - 60} ${C - 20} C ${C - 30} ${C - 70}, ${C + 40} ${C - 50}, ${C + 30} ${C} S ${C - 50} ${C + 30}, ${C - 10} ${C + 50} S ${C + 60} ${C + 40}, ${C + 60} ${C + 10}`} width={3} />
          <circle cx={C} cy={C} r={74} className="part-hit" strokeWidth={2} />
        </Part>
      )}
      <Part id="aprotein" p={p}>
        <rect x={ax - 9} y={ay - 9} width={18} height={18} rx={4} className="fill-surface" />
        <circle cx={ax} cy={ay} r={16} className="part-hit" strokeWidth={2} />
      </Part>
    </>
  );
}

export const levivirusRenderer: Renderer = {
  viewBox: "0 0 400 400",
  parts: ["coat", "aprotein", "genome"],
  interior: ["genome"],
  markers: { coat: polar(200, 200, 140, 30), aprotein: polar(200, 200, 146, 150), genome: [200, 200] },
  Draw: Ms2Draw,
};
