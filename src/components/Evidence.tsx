import Link from "next/link";
import type { EvidenceStatus, Source } from "@/lib/schema";

export const STATUS_META: Record<EvidenceStatus, { label: string; cls: string; help: string }> = {
  verified: { label: "Verified", cls: "text-[var(--s-verified)]", help: "Stated by the cited source at the scope shown." },
  simplified: { label: "Simplified", cls: "text-[var(--s-simplified)]", help: "A teaching simplification of cited material." },
  variable: { label: "Variable", cls: "text-[var(--s-variable)]", help: "Real biological variation; read the range, not a single number." },
  not_verified: { label: "Not verified", cls: "text-[var(--s-unverified)]", help: "We could not confirm this from our sources." },
  not_applicable: { label: "Not applicable", cls: "text-[var(--s-na)]", help: "The property does not exist for this virus." },
};

/** Plain-text evidence labels stay legible without relying on an icon or colour. */
export function StatusMark({ status }: { status: EvidenceStatus }) {
  const m = STATUS_META[status];
  return <span className={`text-[13px] font-medium ${m.cls}`} title={m.help}>{m.label}</span>;
}

export function shortCite(s: Source): string {
  if (s.id === "ictv-vmr-msl41") return "ICTV VMR MSL41";
  if (s.id.startsWith("viralzone")) return `ViralZone: ${s.title}`;
  if (s.id.startsWith("ncbi")) {
    const acc = s.title.match(/\b([A-Z]{1,2}_\d{6}|[A-Z]{1,2}\d{5,6})/);
    return `NCBI ${acc ? acc[1] : "Nucleotide"}`;
  }
  if (s.id.startsWith("ictv") && s.id.endsWith("-report")) return `ICTV Report: ${s.title.replace(/^Family: /, "").replace(/ \(.*$/, "")}`;
  if (s.id.startsWith("ictv")) return `ICTV profile ${s.year ?? ""}`.trim();
  const first = s.authors.split(/[ ,]/)[0];
  return `${first} ${s.year ?? ""}`.trim();
}

export function SourceRefs({ ids, sources, className = "" }: { ids: string[]; sources: Source[]; className?: string }) {
  if (!ids.length) return <span className={`text-[13px] text-mute ${className}`}>No source</span>;
  return (
    <span className={`inline-flex flex-wrap gap-x-2 gap-y-0.5 text-[13px] ${className}`}>
      {ids.map((id) => {
        const s = sources.find((x) => x.id === id);
        if (!s) return <span key={id} className="text-[var(--danger)]">Missing source {id}</span>;
        return (
          <Link key={id} href={`/sources#${id}`} title={s.title} className="whitespace-nowrap">
            {shortCite(s)}
          </Link>
        );
      })}
    </span>
  );
}

const SCOPE_LABEL: Record<string, string> = {
  family: "family-level",
  genus: "genus-level",
  species: "species-level",
  virus: "this virus",
  isolate: "reference isolate",
};
export const scopeLabel = (s: string) => SCOPE_LABEL[s] ?? s;
