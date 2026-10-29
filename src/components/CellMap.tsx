"use client";

import type { CellLocation, HostCategory } from "@/lib/schema";

/**
 * A schematic host cell showing where the current replication stage happens.
 * The marker moves between compartments; only locations our sources state are
 * shown. Bacteria are drawn without a nucleus, plant cells with a wall.
 */
type XY = [number, number];

const ANIMAL: Record<CellLocation, XY> = {
  outside: [40, 150],
  membrane: [96, 150],
  endosome: [150, 112],
  cytoplasm: [190, 200],
  "er-golgi": [410, 120],
  nucleus: [300, 150],
};
const BACTERIA: Partial<Record<CellLocation, XY>> = {
  outside: [40, 150],
  membrane: [92, 150],
  cytoplasm: [280, 150],
};

const LABEL: Record<CellLocation, string> = {
  outside: "Outside the cell",
  membrane: "Cell membrane",
  endosome: "Endosome",
  cytoplasm: "Cytoplasm",
  "er-golgi": "ER / Golgi membranes",
  nucleus: "Nucleus",
};

export function CellMap({ host, location, previous, stepKey }: { host: HostCategory; location?: CellLocation; previous?: CellLocation; stepKey: string }) {
  const bacterial = host === "bacteria";
  const plant = host === "plants";
  const pos = (l?: CellLocation): XY | undefined => (l ? (bacterial ? BACTERIA[l] : ANIMAL[l]) : undefined);
  const here = pos(location);
  const from = pos(previous);
  const regions: CellLocation[] = bacterial ? ["outside", "membrane", "cytoplasm"] : ["outside", "membrane", "endosome", "cytoplasm", "er-golgi", "nucleus"];
  const caption = location ? LABEL[location] : "Location not stated by our sources for this stage";

  return (
    <figure className="m-0">
      <svg viewBox="0 0 520 300" className="w-full h-auto" role="img" aria-label={`${bacterial ? "Bacterial" : plant ? "Plant" : "Animal"} host cell schematic. Current stage location: ${caption}.`}>
        {/* cell body */}
        {bacterial ? (
          <rect x={90} y={60} width={400} height={180} rx={90} className="fill-canvas stroke-ink" strokeWidth={2} />
        ) : plant ? (
          <>
            <rect x={78} y={22} width={432} height={256} rx={10} fill="none" className="stroke-mute" strokeWidth={6} />
            <rect x={92} y={34} width={404} height={232} rx={8} className="fill-canvas stroke-ink" strokeWidth={2} />
          </>
        ) : (
          <ellipse cx={300} cy={150} rx={210} ry={128} className="fill-canvas stroke-ink" strokeWidth={2} />
        )}
        {!bacterial && (
          <>
            <circle cx={300} cy={150} r={56} className="stroke-mute" fill="none" strokeWidth={2} strokeDasharray="5 3" />
            <path d="M 385 92 q 25 10 50 0 M 380 110 q 30 12 60 0 M 385 128 q 25 10 50 0 M 392 146 q 20 8 40 0" fill="none" className="stroke-mute" strokeWidth={2} strokeLinecap="round" />
            <circle cx={150} cy={112} r={16} fill="none" className="stroke-mute" strokeWidth={2} />
          </>
        )}
        {bacterial && <path d="M 200 130 q 30 -30 60 0 t 60 0 t 60 0" fill="none" className="stroke-mute" strokeWidth={2} strokeDasharray="3 3" />}

        {/* region labels; the current one is emphasised */}
        {regions.map((r) => {
          const p = pos(r)!;
          const active = r === location;
          return (
            <text
              key={r}
              x={p[0]}
              y={r === "outside" ? p[1] + 40 : r === "nucleus" ? p[1] + 34 : p[1] + 30}
              textAnchor="middle"
              className={active ? "fill-ink" : "fill-mute"}
              style={{ font: `${active ? 600 : 400} 12px var(--font-text)` }}
            >
              {r === "er-golgi" ? "ER/Golgi" : r}
            </text>
          );
        })}

        {/* trail from the previous stage's location */}
        {from && here && (from[0] !== here[0] || from[1] !== here[1]) && (
          <path
            key={`trail-${stepKey}`}
            d={`M ${from[0]} ${from[1]} Q ${(from[0] + here[0]) / 2} ${Math.min(from[1], here[1]) - 50} ${here[0]} ${here[1]}`}
            fill="none"
            style={{ stroke: "var(--accent)", ["--len" as string]: 400 }}
            strokeWidth={2}
            strokeDasharray="4 4"
            className="route-draw"
          />
        )}

        {/* the marker */}
        <g
          style={{
            transform: `translate(${(here ?? [260, 150])[0]}px, ${(here ?? [260, 150])[1]}px)`,
            transition: "transform 700ms var(--ease-out), opacity 300ms var(--ease-out)",
            opacity: here ? 1 : 0.15,
          }}
        >
          <polygon points="0,-11 9.5,-5.5 9.5,5.5 0,11 -9.5,5.5 -9.5,-5.5" style={{ fill: "var(--accent)" }} />
          <circle r={3} className="fill-canvas" />
        </g>
      </svg>
      <figcaption className="mt-2 index-label">
        {caption}
      </figcaption>
    </figure>
  );
}
