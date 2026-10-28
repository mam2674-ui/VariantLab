import Link from "next/link";
import type { Virus } from "@/lib/schema";
import { silhouette } from "@/lib/silhouette";
import { SilhouetteShapes } from "./Silhouette";
import { rowLayout } from "@/lib/units";

/** Every virus on one shared linear scale, sitting on a common baseline. */
export function Lineup({ viruses, pxPerNm = 1 }: { viruses: Virus[]; pxPerNm?: number }) {
  const items = viruses.map((v) => ({ v, s: silhouette(v) })).filter((x) => x.s);
  const gap = 28;
  const maxH = Math.max(...items.map((x) => x.s!.height)) * pxPerNm;
  const { xs, end } = rowLayout(items.map(({ s }) => s!.width * pxPerNm), gap, 8);
  const placed = items.map(({ v, s }, i) => ({ v, x: xs[i], w: s!.width * pxPerNm, h: s!.height * pxPerNm }));
  const width = end + 8;
  const base = maxH + 16;
  const height = base + 64;
  const bar = 100 * pxPerNm;

  return (
    <figure className="min-w-0">
      <div className="overflow-x-auto" tabIndex={0} aria-label="Line-up of all viruses at one scale">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="lineup-desc" className="w-full min-w-[640px] h-auto">
          <desc id="lineup-desc">
            {`Outlines of ${placed.map((p) => p.v.commonName).join(", ")} drawn on one shared linear scale; a 100 nanometre scale bar is shown.`}
          </desc>
          <line x1={0} x2={width} y1={base} y2={base} className="stroke-hairline" strokeWidth={1} />
          {placed.map(({ v, x, w, h }) => (
            <g key={v.id}>
              <SilhouetteShapes v={v} k={pxPerNm} x={x} y={base - h} />
              <Link href={`/virus/${v.id}`}>
                <text x={x + w / 2} y={base + 22} textAnchor="middle" className="fill-ink" style={{ font: "500 13px var(--font-text)" }}>
                  {v.abbreviation}
                </text>
              </Link>
            </g>
          ))}
          <g transform={`translate(8 ${base + 44})`}>
            <line x1={0} x2={bar} y1={0} y2={0} className="stroke-ink" strokeWidth={2} />
            <line x1={0} x2={0} y1={-4} y2={4} className="stroke-ink" strokeWidth={2} />
            <line x1={bar} x2={bar} y1={-4} y2={4} className="stroke-ink" strokeWidth={2} />
            <text x={bar + 8} y={4} className="fill-mute" style={{ font: "400 12px var(--font-data)" }}>
              100 nm
            </text>
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-[13px] text-mute measure">
        To scale on one linear axis (the figure resizes uniformly; the 100 nm bar scales with it). Dashed outlines mark the top of a reported range; dotted fibres are an illustrative pose. Influenza filaments,
        which can reach micrometres, are not drawn.
      </figcaption>
    </figure>
  );
}
