import Link from "next/link";
import type { EvidenceStatus, Source } from "@/lib/schema";

export const STATUS_META: Record<EvidenceStatus, { label: string; cls: string; shape: "circle" | "square" | "diamond" | "triangle" | "ring"; help: string }> = {
  verified: { label: "Verified", cls: "text-[var(--s-verified)]", shape: "circle", help: "Stated by the cited source at the scope shown." },
  simplified: { label: "Simplified", cls: "text-[var(--s-simplified)]", shape: "square", help: "A teaching simplification of cited material." },
  variable: { label: "Variable", cls: "text-[var(--s-variable)]", shape: "diamond", help: "Real biological variation; read the range, not a single number." },
  not_verified: { label: "Not verified", cls: "text-[var(--s-unverified)]", shape: "triangle", help: "We could not confirm this from our sources." },
  not_applicable: { label: "Not applicable", cls: "text-[var(--s-na)]", shape: "ring", help: "The property does not exist for this virus." },
};

/** Shape + word, so status never depends on colour alone. */
export function StatusMark({ status, compact = false }: { status: EvidenceStatus; compact?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${m.cls}`} title={m.help}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className="shrink-0">
        {m.shape === "circle" && <circle cx="5" cy="5" r="4.5" fill="currentColor" />}
        {m.shape === "square" && <rect x="1" y="1" width="8" height="8" fill="currentColor" />}
        {m.shape === "diamond" && <rect x="1.8" y="1.8" width="6.4" height="6.4" transform="rotate(45 5 5)" fill="currentColor" />}
        {m.shape === "triangle" && <polygon points="5,0.5 9.6,9.3 0.4,9.3" fill="currentColor" />}
        {m.shape === "ring" && <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />}
      </svg>
      {compact ? <span className="sr-only">{m.label}</span> : m.label}
    </span>
  );
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
