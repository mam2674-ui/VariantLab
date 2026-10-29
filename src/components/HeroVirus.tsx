"use client";

import type { DiagramSpec } from "@/lib/schema";
import { renderers } from "./diagrams/registry";
import { Lazy3D } from "./three/Lazy3D";

const noop = () => {};

/** Slowly rotating 3D virus for the hero; the 2D exterior schematic is the no-WebGL fallback. */
export function HeroVirus({ spec, name }: { spec: DiagramSpec; name: string }) {
  const r = renderers[spec.renderer];
  const fallback = (
    <svg viewBox={r.viewBox} className="w-full h-full" role="img" aria-label={`${name}, exterior schematic`}>
      <r.Draw view="exterior" hidden={new Set()} selected={null} onSelect={noop} labelFor={(id) => id} numberFor={() => 0} />
    </svg>
  );
  return (
    <Lazy3D
      spec={spec}
      view="exterior"
      interactive={false}
      autoRotate
      onPage
      className="w-full h-full"
      label={`${name}: rotating 3D schematic, decorative.`}
      fallback={fallback}
    />
  );
}
