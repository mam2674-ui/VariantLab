import type { ReactNode } from "react";
import type { EvidenceStatus, Source } from "@/lib/schema";
import { scopeLabel, SourceRefs, StatusMark } from "./Evidence";

export interface FactRowData {
  label: string;
  value: ReactNode;
  status: EvidenceStatus;
  scope: string;
  sourceIds: string[];
  note?: string;
}

/** A definition-list of facts: every value shows its status, scope and sources inline (no hover needed). */
export function FactTable({ title, rows, sources }: { title: string; rows: FactRowData[]; sources: Source[] }) {
  return (
    <section aria-label={title} className="min-w-0">
      <h3 className="text-[17px] font-semibold mb-1">{title}</h3>
      <dl className="border-t border-hairline">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-x-6 gap-y-1 py-3 border-b border-hairline sm:grid-cols-[180px_minmax(0,1fr)]">
            <dt className="text-[14px] text-mute pt-0.5">{r.label}</dt>
            <dd className="min-w-0">
              <div className="text-[15px] text-ink">{r.value}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusMark status={r.status} />
                <span className="text-[13px] text-mute">{scopeLabel(r.scope)}</span>
                <SourceRefs ids={r.sourceIds} sources={sources} />
              </div>
              {r.note && <p className="mt-1 text-[13px] text-mute measure">{r.note}</p>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
