"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { DiagramSpec, Source, Virus } from "@/lib/schema";
import { compareInsights, compareRows, MAX_COMPARE, MIN_COMPARE, type Insight } from "@/lib/compare";
import { parseCompareIds } from "@/lib/urlState";
import { silhouette } from "@/lib/silhouette";
import { SilhouetteShapes } from "./Silhouette";
import { SourceRefs, StatusMark, scopeLabel } from "./Evidence";
import { renderers } from "./diagrams/registry";

const INSIGHT_LABEL: Record<Insight["kind"], string> = {
  similarity: "Shared",
  difference: "Different",
  classification: "Classification, not ancestry",
  uncertainty: "Uncertain or variable",
};
const noop = () => {};

function MiniDiagram({ spec, name }: { spec: DiagramSpec; name: string }) {
  const r = renderers[spec.renderer];
  if (!r) return null;
  const props = { view: "cutaway" as const, hidden: new Set<string>(), selected: null, onSelect: noop, labelFor: (id: string) => id, numberFor: () => 0 };
  return (
    <div inert>
      <svg viewBox={r.viewBox} className="w-full h-auto max-h-[220px]" role="img" aria-label={`${name}, cutaway schematic`}>
        <r.Draw {...props} />
      </svg>
    </div>
  );
}

export function CompareView({ viruses, sources, diagrams }: { viruses: Virus[]; sources: Source[]; diagrams: DiagramSpec[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ids = parseCompareIds(params, viruses.map((v) => v.id));
  const chosen = ids.map((id) => viruses.find((v) => v.id === id)!);
  const [copied, setCopied] = useState(false);

  const setIds = (next: string[]) => router.replace(next.length ? `${pathname}?v=${next.join(",")}` : pathname, { scroll: false });
  const toggle = (id: string) => setIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(0, MAX_COMPARE));

  const ready = chosen.length >= MIN_COMPARE;
  const rows = ready ? compareRows(chosen) : [];
  const insights = ready ? compareInsights(chosen) : [];
  const groups = [...new Set(rows.map((r) => r.group))];

  // One shared linear scale for all silhouettes in the comparison.
  const sils = chosen.map((v) => silhouette(v));
  const maxDim = Math.max(1, ...sils.map((s) => (s ? Math.max(s.width, s.height) : 0)));
  const k = 200 / maxDim;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <fieldset>
        <legend className="text-[15px] font-semibold text-ink mb-3">
          Choose 2–3 viruses <span className="font-normal text-mute">({ids.length} selected)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {viruses.map((v) => {
            const on = ids.includes(v.id);
            return (
              <label key={v.id} className="chip relative">
                <input type="checkbox" checked={on} disabled={!on && ids.length >= MAX_COMPARE} onChange={() => toggle(v.id)} />
                {v.commonName}
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn" onClick={copy} disabled={!ready}>
            {copied ? "Link copied" : "Copy link to this comparison"}
          </button>
          {ids.length > 0 && (
            <button type="button" className="btn" onClick={() => setIds([])}>
              Clear selection
            </button>
          )}
        </div>
      </fieldset>

      {!ready ? (
        <div className="panel p-8">
          <h2 className="text-[19px] font-semibold">Pick at least two viruses</h2>
          <p className="mt-2 measure">
            A comparison needs two or three viruses. Try{" "}
            <Link href="/compare?v=influenza-a,sars-cov-2">influenza A and SARS-CoV-2</Link>, two enveloped RNA viruses with opposite genome sense,
            or <Link href="/compare?v=sars-cov-2,phage-t4">SARS-CoV-2 and phage T4</Link>, which share almost nothing.
          </p>
        </div>
      ) : (
        <>
          <section aria-labelledby="cmp-structure">
            <h2 id="cmp-structure" className="display text-[30px] mb-4">
              Side by side
            </h2>
            <div className={`grid gap-6 ${chosen.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {chosen.map((v, i) => {
                const spec = diagrams.find((d) => d.id === v.diagramId);
                const s = sils[i];
                return (
                  <div key={v.id} className="panel p-5 min-w-0 flex flex-col gap-4">
                    <h3 className="text-[19px] font-semibold">
                      <Link href={`/virus/${v.id}`} className="text-ink no-underline hover:underline">
                        {v.commonName}
                      </Link>
                    </h3>
                    {spec && <MiniDiagram spec={spec} name={v.commonName} />}
                    <div>
                      <p className="text-[13px] text-mute mb-1">Outline on the shared scale</p>
                      <svg viewBox="0 0 210 210" className="w-full max-w-[210px] h-auto" role="img" aria-label={`${v.commonName} outline at shared scale`}>
                        {s && <SilhouetteShapes v={v} k={k} x={(210 - s.width * k) / 2} y={(210 - s.height * k) / 2} />}
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] text-mute measure">
              Top: schematic cutaways, each drawn to fill its panel, so their sizes are not comparable. Bottom: outlines on one shared linear scale (
              {Math.round(maxDim)} nm across the largest).
            </p>
          </section>

          <section aria-labelledby="cmp-insights">
            <h2 id="cmp-insights" className="display text-[30px] mb-4">
              What the comparison shows
            </h2>
            <ul className="flex flex-col gap-4 measure">
              {insights.map((ins, i) => (
                <li key={i} className="border-l border-hairline pl-4">
                  <p className="text-[13px] text-mute">{INSIGHT_LABEL[ins.kind]}</p>
                  <p className="text-[16px] text-ink">{ins.text}</p>
                  <SourceRefs ids={ins.sourceIds} sources={sources} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-mute measure">These statements are generated by fixed rules from the cited dataset, not by an AI model.</p>
          </section>

          <section aria-labelledby="cmp-table">
            <h2 id="cmp-table" className="display text-[30px] mb-4">
              Property by property
            </h2>
            <table className="compare-table">
              <caption className="sr-only">Comparison of {chosen.map((v) => v.commonName).join(", ")}</caption>
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  {chosen.map((v) => (
                    <th key={v.id} scope="col">
                      {v.commonName}
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g}>
                  <tr>
                    <th colSpan={chosen.length + 1} scope="colgroup" className="!text-ink !font-semibold !pt-6">
                      {g}
                    </th>
                  </tr>
                  {rows
                    .filter((r) => r.group === g)
                    .map((r) => (
                      <tr key={r.id}>
                        <th scope="row">
                          {r.label}
                          {r.same && <span className="block text-[12px] text-mute font-normal">same for all</span>}
                        </th>
                        {r.cells.map((c, i) => (
                          <td key={i} data-virus={chosen[i].commonName}>
                            <span className="text-ink">{c.text}</span>
                            <span className="mt-1 flex flex-wrap gap-x-3 items-center">
                              <StatusMark status={c.status} />
                              <span className="text-[12px] text-mute">{scopeLabel(c.scope)}</span>
                              <SourceRefs ids={c.sourceIds} sources={sources} />
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              ))}
            </table>
          </section>
        </>
      )}
    </div>
  );
}
