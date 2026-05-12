"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: "▦" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { href: "/portfolio", label: "Posiciones", icon: "▤" },
      { href: "/portfolio/transactions", label: "Operaciones", icon: "↔" },
      { href: "/portfolio/performance", label: "Performance", icon: "↗" },
      { href: "/portfolio/exposures", label: "Exposiciones", icon: "◉" },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/companies", label: "Empresas", icon: "▢" },
      { href: "/research", label: "Ideas y Watchlist", icon: "✦" },
      { href: "/research/sectors", label: "Sectores", icon: "❒" },
    ],
  },
  {
    label: "Calendar & Risk",
    items: [
      { href: "/calendar", label: "Calendario", icon: "▦" },
      { href: "/control", label: "Control Room", icon: "⚠" },
    ],
  },
  {
    label: "Output",
    items: [
      { href: "/reporting", label: "Reporting", icon: "✦" },
      { href: "/agents", label: "Claude Agents", icon: "✸" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-bg-elevated">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-accent text-bg flex items-center justify-center font-bold">L</div>
          <div>
            <div className="text-sm font-semibold leading-none">Lynx Capital</div>
            <div className="text-2xs text-fg-muted mt-0.5">Portfolio Terminal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-2 mb-1 text-2xs uppercase tracking-wide text-fg-subtle">{section.label}</div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                        active
                          ? "bg-accent/10 text-accent"
                          : "text-fg-muted hover:bg-bg-hover hover:text-fg",
                      )}
                    >
                      <span className="w-4 text-center text-2xs">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border px-3 py-3 text-2xs text-fg-subtle">
        <div className="flex items-center justify-between">
          <span>MVP · v0.1</span>
          <span className="font-mono">demo</span>
        </div>
      </div>
    </aside>
  );
}
