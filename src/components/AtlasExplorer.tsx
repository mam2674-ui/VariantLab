"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Virus } from "@/lib/schema";
import { emptyFilters, filterViruses, genomeClass, isFiltered, sizeBand, type AtlasFilters } from "@/lib/filter";
import { morphologyLabel, MAX_COMPARE } from "@/lib/compare";
import { compareHref, parseFilters, serializeFilters } from "@/lib/urlState";
import { SilhouetteThumb } from "./Silhouette";

const GENOME_OPTS = [
  { v: "dsDNA", l: "dsDNA" },
  { v: "+ssRNA", l: "+ssRNA" },
  { v: "-ssRNA", l: "−ssRNA" },
  { v: "ssDNA", l: "ssDNA" },
  { v: "dsRNA", l: "dsRNA" },
  { v: "ssRNA-RT", l: "ssRNA-RT" },
  { v: "dsDNA-RT", l: "dsDNA-RT" },
] as const;
const SIZE_OPTS = [
  { v: "small", l: "Under 70 nm" },
  { v: "medium", l: "70–130 nm" },
  { v: "large", l: "Over 130 nm" },
] as const;
const HOST_LABEL: Record<string, string> = { vertebrates: "Vertebrates", bacteria: "Bacteria", plants: "Plants" };

export function AtlasExplorer({ viruses }: { viruses: Virus[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hosts = useMemo(() => [...new Set(viruses.map((v) => v.hostCategory.value).filter(Boolean))] as string[], [viruses]);
  const morphs = useMemo(() => [...new Set(viruses.map((v) => v.morphology.value).filter(Boolean))] as string[], [viruses]);
  const filters = parseFilters(params, { host: hosts, morphology: morphs });
  const [picked, setPicked] = useState<string[]>([]);
  const [q, setQ] = useState(filters.q);

  const update = (f: AtlasFilters) => {
    const qs = serializeFilters(f);
    router.replace(qs ? `${pathname}?${qs}#atlas` : `${pathname}#atlas`, { scroll: false });
  };
  const toggle = <K extends Exclude<keyof AtlasFilters, "q">>(key: K, value: string) => {
    const cur = filters[key] as string[];
    update({ ...filters, [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] });
  };
  const results = filterViruses(viruses, filters);
  const counts = (key: Exclude<keyof AtlasFilters, "q">, value: string) =>
    filterViruses(viruses, { ...filters, [key]: [value] }).length;

  const pick = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_COMPARE ? p : [...p, id]));

  // Called as a function (not <Group/>) so React keeps the inputs mounted and focus survives a toggle.
  const group = (legend: string, k: Exclude<keyof AtlasFilters, "q">, opts: readonly { v: string; l: string }[]) => (
    <fieldset className="min-w-0" key={k}>
      <legend className="text-[14px] font-semibold text-ink mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const n = counts(k, o.v);
          const on = (filters[k] as string[]).includes(o.v);
          return (
            <label key={o.v} className="chip relative">
              <input type="checkbox" checked={on} onChange={() => toggle(k, o.v)} />
              {o.l}
              <span className="num opacity-70" aria-label={`${n} matching`}>
                {n}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="flex flex-col gap-6" role="search" aria-label="Filter the atlas">
        <div>
          <label htmlFor="atlas-q" className="text-[14px] font-semibold text-ink block mb-2">
            Search
          </label>
          <input
            id="atlas-q"
            className="input"
            type="search"
            placeholder="Name, family, genus…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              update({ ...filters, q: e.target.value });
            }}
          />
        </div>
        {group("Genome class", "genome", GENOME_OPTS)}
        {group("Envelope", "envelope", [{ v: "enveloped", l: "Enveloped" }, { v: "non-enveloped", l: "Non-enveloped" }])}
        {group("Host category", "host", hosts.map((h) => ({ v: h, l: HOST_LABEL[h] ?? h })))}
        {group("Morphology", "morphology", morphs.map((m) => ({ v: m, l: morphologyLabel(m) })))}
        {group("Main body size", "size", SIZE_OPTS)}
        <button type="button" className="btn self-start" onClick={() => {
            setQ("");
            update(emptyFilters);
          }} disabled={!isFiltered(filters)}>
          Reset filters
        </button>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-[15px]" aria-live="polite">
            <span className="num">{results.length}</span> of <span className="num">{viruses.length}</span> viruses
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-mute">{picked.length ? `${picked.length} selected` : "Select 2–3 to compare"}</span>
            <Link
              href={compareHref(picked)}
              className="btn btn-primary"
              aria-disabled={picked.length < 2}
              onClick={(e) => picked.length < 2 && e.preventDefault()}
            >
              Compare selected
            </Link>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="panel p-8">
            <h3 className="text-[19px] font-semibold">No virus matches all of these filters</h3>
            <p className="mt-2 measure">
              Filters combine with AND across groups. This atlas holds {viruses.length} representative viruses, so many combinations are empty; for
              example no virus here has a dsRNA genome yet. Remove a filter or reset them all.
            </p>
            <button type="button" className="btn mt-4" onClick={() => {
              setQ("");
              update(emptyFilters);
            }}>
              Reset filters
            </button>
          </div>
        ) : (
          <ul className="border-t border-hairline">
            {results.map((v) => {
              const chosen = picked.includes(v.id);
              const full = !chosen && picked.length >= MAX_COMPARE;
              return (
                <li key={v.id} className="border-b border-hairline py-5 grid grid-cols-[64px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)_auto] gap-x-5 gap-y-3 items-center">
                  <SilhouetteThumb v={v} size={64} />
                  <div className="min-w-0">
                    <h3 className="text-[19px] font-semibold leading-tight">
                      <Link href={`/virus/${v.id}`} className="text-ink no-underline hover:underline">
                        {v.commonName}
                      </Link>
                    </h3>
                    <p className="text-[14px] text-mute mt-0.5">
                      <span className="species">{v.taxonomy.species}</span>, {v.taxonomy.family}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]" aria-label="Key traits">
                      <li>
                        <span className="text-mute">Genome </span>
                        {genomeClass(v)}
                        {v.genome.segmented.value ? `, ${v.genome.segmentCount.value} segments` : ""}
                      </li>
                      <li>
                        <span className="text-mute">Envelope </span>
                        {v.envelope.value ? "yes" : "no"}
                      </li>
                      <li>
                        <span className="text-mute">Shape </span>
                        {morphologyLabel(v.morphology.value).toLowerCase()}
                      </li>
                      <li>
                        <span className="text-mute">Size band </span>
                        {SIZE_OPTS.find((s) => s.v === sizeBand(v))?.l.toLowerCase() ?? "not verified"}
                      </li>
                    </ul>
                  </div>
                  <label className="col-start-2 sm:col-start-3 chip relative justify-self-start" title={full ? "Up to three viruses" : undefined}>
                    <input type="checkbox" checked={chosen} disabled={full} onChange={() => pick(v.id)} />
                    {chosen ? "Selected" : "Compare"}
                    <span className="sr-only"> {v.commonName}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
