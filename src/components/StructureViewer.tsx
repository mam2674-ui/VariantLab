"use client";

import { useCallback, useMemo, useState } from "react";
import type { ComponentType, DiagramSpec, Source } from "@/lib/schema";
import { renderers } from "./diagrams/registry";
import { Badges, type View } from "./diagrams/kit";
import { SourceRefs, StatusMark } from "./Evidence";
import { Lazy3D, useWebGL } from "./three/Lazy3D";
import Link from "next/link";
import { proteinsForComponent } from "@/data/proteins";

const TYPE_LABEL: Record<ComponentType, string> = {
  envelope: "Envelope (lipid membrane)",
  "surface-protein": "Surface / membrane protein",
  matrix: "Matrix protein",
  tegument: "Tegument",
  capsid: "Capsid (protein shell)",
  nucleocapsid: "Nucleocapsid (protein + genome)",
  genome: "Genome",
  portal: "Portal / neck",
  tail: "Tail",
  fibre: "Fibre",
};
const TYPE_CLASS: Record<ComponentType, string> = {
  envelope: "bg-envelope",
  "surface-protein": "bg-surface",
  matrix: "bg-matrix",
  tegument: "bg-tegument",
  capsid: "bg-capsid",
  nucleocapsid: "bg-nucleocapsid",
  genome: "bg-genome",
  portal: "bg-portal",
  tail: "bg-tail",
  fibre: "bg-fibre",
};

export function Swatch({ type }: { type: ComponentType }) {
  return <span aria-hidden="true" className={`inline-block w-3 h-3 rounded-[3px] shrink-0 ${TYPE_CLASS[type]}`} />;
}

export function StructureViewer({ spec, sources, title }: { spec: DiagramSpec; sources: Source[]; title: string }) {
  const r = renderers[spec.renderer];
  const [view, setView] = useState<View>("cutaway");
  const [detail, setDetail] = useState<"simple" | "detailed">("simple");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [exploded, setExploded] = useState(false);
  const webgl = useWebGL();

  const byId = useMemo(() => new Map(spec.components.map((c) => [c.id, c])), [spec]);
  const numberFor = useCallback((id: string) => spec.components.findIndex((c) => c.id === id) + 1, [spec]);
  const labelFor = useCallback((id: string) => {
    const c = byId.get(id);
    return c ? (detail === "simple" ? c.labelSimple : c.labelDetailed) : id;
  }, [byId, detail]);

  if (!r) return <p className="panel p-6">This diagram is not available yet.</p>;

  const isInteriorHidden = (id: string) => view === "exterior" && byId.get(id)?.layer === "interior";
  const select = (id: string) => setSelected((cur) => (cur === id ? null : id));
  const toggle = (id: string) =>
    setHidden((h) => {
      const n = new Set(h);
      if (n.has(id)) n.delete(id);
      else {
        n.add(id);
        if (selected === id) setSelected(null);
      }
      return n;
    });

  const sel = selected ? byId.get(selected) : null;
  const props = { view, hidden, selected, onSelect: select, labelFor, numberFor };
  const svg2d = (
    <svg
      viewBox={r.viewBox}
      className="diagram w-full h-auto max-h-[620px] mt-6"
      data-has-selection={Boolean(selected)}
      role="group"
      aria-label={`${title}: ${view} schematic. Select a numbered component to read about it.`}
    >
      <r.Draw {...props} />
      <Badges r={r} p={props} />
    </svg>
  );

  return (
    <section aria-labelledby="viewer-title" className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" onKeyDown={(e) => e.key === "Escape" && setSelected(null)}>
      <figure className="min-w-0">
        <h2 id="viewer-title" className="sr-only">
          Structure viewer
        </h2>
        <div className="panel p-3 sm:p-6 relative">
          <span className="absolute top-3 left-3 text-[13px] text-mute">
            {mode === "3d" ? "3D schematic: drag to rotate, scroll or pinch to zoom" : "Schematic, not to scale internally"}
          </span>
          {mode === "3d" ? (
            <Lazy3D
              spec={spec}
              view={view}
              hidden={hidden}
              selected={selected}
              onSelect={select}
              exploded={exploded}
              autoRotate={!selected}
              className="w-full aspect-square max-h-[620px] mt-6 touch-none"
              label={`${title}: interactive 3D ${view} schematic. Use the component list to select parts with the keyboard.`}
              fallback={svg2d}
            />
          ) : (
            svg2d
          )}
        </div>
        <figcaption className="mt-3 text-[14px] text-mute measure">{spec.caption}</figcaption>
      </figure>

      <div className="min-w-0 flex flex-col gap-6">
        {/* One toolbar: what you look at (2D/3D), then three switches. */}
        <div className="toolbar self-start" role="toolbar" aria-label="Viewer options">
          <div role="radiogroup" aria-label="Model type" className="flex">
            <button className="tool" role="radio" aria-checked={mode === "2d"} onClick={() => setMode("2d")}>
              2D
            </button>
            <button className="tool" role="radio" aria-checked={mode === "3d"} onClick={() => setMode("3d")} disabled={!webgl} title={webgl ? undefined : "3D needs WebGL, which this browser does not provide"}>
              3D
            </button>
          </div>
          <span className="sep" aria-hidden="true" />
          <button className="tool" aria-pressed={view === "cutaway"} onClick={() => setView((v) => (v === "cutaway" ? "exterior" : "cutaway"))}>
            Show inside
          </button>
          <button className="tool" aria-pressed={detail === "detailed"} onClick={() => setDetail((d) => (d === "detailed" ? "simple" : "detailed"))}>
            Full names
          </button>
          {mode === "3d" && (
            <button className="tool" aria-pressed={exploded} onClick={() => setExploded((x) => !x)}>
              Pull apart
            </button>
          )}
        </div>

        <div>
          <h3 className="text-[15px] font-semibold mb-2">Components</h3>
          <ul className="flex flex-col gap-1" aria-label="Structural components">
            {spec.components.map((c) => {
              const interiorOff = isInteriorHidden(c.id);
              const off = hidden.has(c.id);
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <label className="flex items-center justify-center w-10 h-10 shrink-0 cursor-pointer" title={interiorOff ? "Interior layer: switch to cutaway to see it" : "Show or hide this layer"}>
                    <input
                      type="checkbox"
                      checked={!off}
                      disabled={interiorOff}
                      onChange={() => toggle(c.id)}
                      aria-label={`Show ${labelFor(c.id)}`}
                      className="w-4 h-4 accent-[var(--ink)]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => select(c.id)}
                    aria-pressed={selected === c.id}
                    disabled={off || interiorOff}
                    className="flex-1 min-h-10 flex items-center gap-3 text-left px-3 rounded-md text-[15px] text-ink hover:bg-sunk aria-pressed:bg-sunk aria-pressed:font-semibold disabled:text-mute disabled:cursor-not-allowed"
                  >
                    <span className="num w-5 text-mute">{numberFor(c.id)}</span>
                    <Swatch type={c.type} />
                    <span className="flex-1">{labelFor(c.id)}</span>
                    {interiorOff && <span className="text-[12px] text-mute">inside</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel p-5 min-h-[180px]" aria-live="polite">
          {sel ? (
            <div className="step-enter" key={sel.id}>
              <p className="text-[13px] text-mute flex items-center gap-2">
                <Swatch type={sel.type} /> {TYPE_LABEL[sel.type]}
              </p>
              <h3 className="text-[19px] font-semibold mt-1">{sel.labelDetailed}</h3>
              <p className="mt-2 text-[15px]">{sel.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <StatusMark status={sel.status} />
                <SourceRefs ids={sel.sourceIds} sources={sources} />
              </div>
              {proteinsForComponent(spec.virusId, sel.id).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {proteinsForComponent(spec.virusId, sel.id).map((prot) => (
                    <Link key={prot.pdbId} href={`/proteins/${prot.pdbId}`} className="btn">
                      Structure: {prot.name} (PDB {prot.pdbId})
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-[15px] text-mute">
              Select a numbered component in the diagram or the list to read what it is and where the information comes from. Press Escape to clear.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-[15px] font-semibold mb-2">What this diagram cannot tell you</h3>
          <ul className="list-disc pl-5 text-[15px] flex flex-col gap-1">
            {spec.cannotShow.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
