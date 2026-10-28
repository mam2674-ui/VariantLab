"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const NAV_LINKS = [
  { href: "/", label: "Atlas" },
  { href: "/compare", label: "Compare" },
  { href: "/size", label: "Size" },
  { href: "/genomes", label: "Genomes" },
  { href: "/sources", label: "Sources" },
  { href: "/tutor", label: "Tutor" },
  { href: "/methods", label: "Methods" },
];

export function SiteNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/virus") : pathname.startsWith(href));

  useEffect(() => {
    if (menuRef.current) menuRef.current.open = false;
  }, [pathname]);

  return (
    <header className="border-b border-hairline bg-canvas/95 sticky top-0 z-40">
      <div className="container-atlas flex items-center justify-between h-14 gap-4">
        <Link href="/" className="display text-[22px] text-ink no-underline" aria-label="Virus Atlas, home">
          Virus Atlas
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="px-3 py-2 rounded-full text-[14px] no-underline text-body hover:text-ink aria-[current=page]:text-ink aria-[current=page]:bg-sunk"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <details ref={menuRef} className="md:hidden relative">
          <summary className="btn list-none [&::-webkit-details-marker]:hidden" aria-label="Open menu">
            Menu
          </summary>
          <nav aria-label="Primary mobile" className="absolute right-0 mt-2 w-56 panel p-2 shadow-float">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="block px-3 py-3 rounded-md no-underline text-body aria-[current=page]:text-ink aria-[current=page]:bg-sunk"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
