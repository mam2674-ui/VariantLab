import type { Virus } from "@/lib/schema";
import { hexPoints, silhouette } from "@/lib/silhouette";

const CLASS: Record<string, string> = {
  "head-tail": "stroke-capsid",
  "icosahedral-nonenveloped": "stroke-capsid",
  "pleomorphic-enveloped": "stroke-envelope",
  "enveloped-icosahedral-core": "stroke-envelope",
};

/**
 * Draws a virus outline at `k` px per nm. One uniform scale, never stretched.
 * Range-max outlines are dashed; illustrative parts are dotted.
 */
export function SilhouetteShapes({ v, k, x = 0, y = 0 }: { v: Virus; k: number; x?: number; y?: number }) {
  const s = silhouette(v);
  if (!s) return null;
  const main = CLASS[v.morphology.value ?? ""] ?? "stroke-ink";
  return (
    <g transform={`translate(${x} ${y})`}>
      {s.shapes.map((sh, i) => {
        if (sh.kind === "circle")
          return (
            <circle
              key={i}
              cx={sh.cx * k}
              cy={sh.cy * k}
              r={sh.r * k}
              fill="none"
              className={main}
              strokeWidth={sh.style === "range-min" ? 2 : 1.5}
              strokeDasharray={sh.style === "range-max" ? "4 3" : undefined}
            />
          );
        if (sh.kind === "hexagon") return <polygon key={i} points={hexPoints(sh, k)} fill="none" className="stroke-capsid" strokeWidth={2} strokeLinejoin="round" />;
        if (sh.kind === "rect") return <rect key={i} x={sh.x * k} y={sh.y * k} width={Math.max(sh.w * k, 2)} height={sh.h * k} className="fill-tail" />;
        return (
          <line
            key={i}
            x1={sh.x1 * k}
            y1={sh.y1 * k}
            x2={sh.x2 * k}
            y2={sh.y2 * k}
            className="stroke-fibre"
            strokeWidth={1.5}
            strokeDasharray={sh.style === "illustrative" ? "1 3" : "4 3"}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

export function SilhouetteThumb({ v, size = 64 }: { v: Virus; size?: number }) {
  const s = silhouette(v);
  if (!s) return null;
  const k = (size - 4) / Math.max(s.width, s.height);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <SilhouetteShapes v={v} k={k} x={(size - s.width * k) / 2} y={(size - s.height * k) / 2} />
    </svg>
  );
}
