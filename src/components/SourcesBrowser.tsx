"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EvidenceStatus, Source, Virus } from "@/lib/schema";
import type { Citation } from "@/lib/citations";
import { STATUS_META, StatusMark, shortCite } from "./Evidence";

const KIND_LABEL: Record<Source["kind"], string> = {
  taxonomy: "ICTV taxonomy and reports",
  database: "Databases",
  primary: "Primary research",
  review: "Reviews",
};

export function SourcesBrowser({
  sources,
  viruses,
  index,
  unverified,
}: {
  sources: Source[];
  viruses: Virus[];
  index: Record<string, Citation[]>;
  unverified: (Citation & { sourceIds: string[] })[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const virusId = viruses.some((v) => v.id === params.get("virus")) ? params.get("virus")! : "";
  const status = (Object.keys(STATUS_META) as EvidenceStatus[]).includes(params.get("status") as EvidenceStatus) ? (params.get("status") as EvidenceStatus) : "";
  const name = (id: string) => viruses.find((v) => v.id === id)?.commonName ?? id;

  const set = (k: string, val: string) => {
    const p = new URLSearchParams(params.toString());
    if (val) p.set(k, val);
    else p.delete(k);
    router.replace(p.toString() ? `${pathname}?${p}` : pathname, { scroll: false });
  };

  const citesFor = (id: string) => (index[id] ?? []).filter((c) => (!virusId || c.virusId === virusId) && (!status || c.status === status));
  const shown = sources.filter((s) => citesFor(s.id).length > 0 || (!virusId && !status));

  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="legend-title">
        <h2 id="legend-title" className="display text-[30px] mb-4">
          How to read the evidence
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-[15px]">
          {(Object.keys(STATUS_META) as EvidenceStatus[]).map((s) => (
            <li key={s} className="border-t border-hairline pt-3">
              <StatusMark status={s} />
              <p className="mt-1">{STATUS_META[s].help}</p>
            </li>
          ))}
          <li className="border-t border-hairline pt-3">
            <span className="text-[13px] font-medium text-ink">Schematic representation</span>
            <p className="mt-1">
              Every structure diagram is a code-drawn schematic. Component identities are cited; shapes, counts and positions are illustrative unless
              a caption says otherwise.
            </p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="src-title">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <h2 id="src-title" className="display text-[30px]">
            Sources <span className="num text-mute text-[18px]">({shown.length})</span>
          </h2>
          <div className="flex flex-wrap gap-4">
            <label className="text-[14px] flex flex-col gap-1">
              <span className="font-semibold text-ink">Virus</span>
              <select className="input !min-h-10 !py-1" value={virusId} onChange={(e) => set("virus", e.target.value)}>
                <option value="">All viruses</option>
                {viruses.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.commonName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[14px] flex flex-col gap-1">
              <span className="font-semibold text-ink">Evidence status</span>
              <select className="input !min-h-10 !py-1" value={status} onChange={(e) => set("status", e.target.value)}>
                <option value="">Any status</option>
                {(Object.keys(STATUS_META) as EvidenceStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {shown.length === 0 && <p className="panel p-6">No source matches these filters. Status “not verified” items have no source by definition; see the list below.</p>}

        {(Object.keys(KIND_LABEL) as Source["kind"][]).map((kind) => {
          const list = shown.filter((s) => s.kind === kind);
          if (!list.length) return null;
          return (
            <div key={kind} className="mb-10">
              <h3 className="text-[17px] font-semibold mb-2">{KIND_LABEL[kind]}</h3>
              <ul className="border-t border-hairline">
                {list.map((s) => {
                  const cites = citesFor(s.id);
                  return (
                    <li key={s.id} id={s.id} className="py-4 border-b border-hairline scroll-mt-20 target:bg-sunk">
                      <p className="text-[13px] text-mute">{shortCite(s)}</p>
                      <p className="text-[16px] text-ink font-medium">{s.title}</p>
                      <p className="text-[14px]">
                        {s.authors}
                        {s.year ? ` (${s.year})` : ""}. {s.container}.{" "}
                        {s.doi && (
                          <>
                            DOI{" "}
                            <a href={`https://doi.org/${s.doi}`} rel="noreferrer" target="_blank">
                              {s.doi}
                            </a>
                            .{" "}
                          </>
                        )}
                        <a href={s.url} rel="noreferrer" target="_blank">
                          Open source
                        </a>
                        . Accessed {s.accessed}.
                      </p>
                      {s.license && <p className="text-[13px] text-mute">Licence: {s.license}</p>}
                      {s.note && <p className="text-[13px] text-mute measure mt-1">{s.note}</p>}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-[14px] text-link">
                          Supports {cites.length} {cites.length === 1 ? "item" : "items"}
                        </summary>
                        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
                          {cites.map((c, i) => (
                            <li key={i} className="flex flex-wrap gap-x-3 items-center">
                              <Link href={`/virus/${c.virusId}`}>{name(c.virusId)}</Link>
                              <span>{c.where}</span>
                              <StatusMark status={c.status} />
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="gaps-title">
        <h2 id="gaps-title" className="display text-[30px] mb-2">
          Known gaps
        </h2>
        <p className="text-[15px] text-mute measure mb-4">Items shown in the atlas that we could not verify from the sources above. They are labelled wherever they appear.</p>
        <ul className="border-t border-hairline">
          {unverified
            .filter((u) => !virusId || u.virusId === virusId)
            .map((u, i) => (
              <li key={i} className="py-3 border-b border-hairline flex flex-wrap gap-x-4 items-center text-[15px]">
                <Link href={`/virus/${u.virusId}`}>{name(u.virusId)}</Link>
                <span>{u.where}</span>
                <StatusMark status="not_verified" />
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
