"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const NAV_GROUPS = [
  [
    { n: "01", href: "/", label: "Atlas" },
    { n: "02", href: "/compare", label: "Compare" },
  ],
  [
    { n: "03", href: "/size", label: "Size" },
    { n: "04", href: "/genomes", label: "Genomes" },
  ],
  [
    { n: "05", href: "/proteins", label: "Proteins" },
    { n: "06", href: "/sources", label: "Sources" },
  ],
  [
    { n: "07", href: "/tutor", label: "Tutor" },
    { n: "08", href: "/methods", label: "Methods" },
  ],
];
export const NAV_LINKS = NAV_GROUPS.flat();

export interface IndexEntry {
  id: string;
  code: string;
  name: string;
  genome: string;
  family: string;
}

export function SiteNav({ index }: { index: IndexEntry[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/virus") : pathname.startsWith(href));

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const opener = openerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      opener?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <div className="flex items-stretch h-14">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 sm:px-6 border-r border-hairline no-underline text-ink" aria-label="Virus Atlas, home">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <polygon points="11,1 20,6 20,16 11,21 2,16 2,6" fill="none" className="stroke-ink" strokeWidth="1.6" />
            <circle cx="11" cy="11" r="3" style={{ fill: "var(--accent)" }} />
          </svg>
          <span className="text-[13px] leading-tight">
            Virus Atlas
            <span className="block text-mute">Structure, size, genomes</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden lg:flex flex-1">
          {NAV_GROUPS.map((g, i) => (
            <ul key={i} className="flex flex-col justify-center px-6 border-r border-hairline">
              {g.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="index-label !text-body no-underline hover:!text-ink aria-[current=page]:!text-ink"
                  >
                    <span className="text-mute mr-2">{l.n}</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </nav>
        <button
          ref={openerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-index"
          className="ml-auto flex items-center gap-3 px-5 sm:px-6 border-l border-hairline index-label !text-ink cursor-pointer hover:bg-sunk"
        >
          Index <span aria-hidden="true" className="inline-flex w-5 h-5 items-center justify-center border border-hairline-strong">+</span>
        </button>
      </div>

      {open && (
        <div id="site-index" role="dialog" aria-modal="true" aria-label="Site index" className="fixed inset-0 z-50 bg-canvas overflow-y-auto">
          <div className="flex items-stretch h-14 border-b border-hairline">
            <span className="flex items-center px-4 sm:px-6 index-label">Index</span>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="ml-auto px-6 border-l border-hairline index-label !text-ink hover:bg-sunk">
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="container-atlas py-10 grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
            <nav aria-label="Pages">
              <p className="index-label mb-4">Pages</p>
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="display text-[32px] text-ink no-underline hover:text-accent">
                      <span className="index-label align-middle mr-3">{l.n}</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Viruses">
              <p className="index-label mb-4">Viruses ({index.length})</p>
              <ul className="border-t border-hairline">
                {index.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/virus/${v.id}`}
                      onClick={() => setOpen(false)}
                      className="grid grid-cols-[70px_minmax(0,1fr)] sm:grid-cols-[80px_minmax(0,1fr)_110px_minmax(0,180px)] gap-x-4 py-3 border-b border-hairline no-underline text-body hover:bg-sunk items-baseline"
                    >
                      <span className="index-label">{v.code}</span>
                      <span className="text-[17px] text-ink">{v.name}</span>
                      <span className="hidden sm:block num text-mute">{v.genome}</span>
                      <span className="hidden sm:block species text-mute text-[14px] truncate">{v.family}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
