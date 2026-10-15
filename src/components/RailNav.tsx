"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MeResponse = {
  authenticated: boolean;
  profileId: string | null;
  user?: { isAdmin?: boolean } | null;
};

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  members: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  links: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
};

export default function RailNav() {
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setMe(d);
      })
      .catch(() => {
        if (alive) setMe(null);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  const items = [
    { href: "/", label: "home", icon: "home" },
    { href: "/members", label: "members", icon: "members" },
    { href: "/affiliations", label: "affiliates", icon: "links" },
    me?.authenticated ? { href: "/me", label: "profile", icon: "user" } : { href: "/login", label: "login", icon: "user" }
  ];
  if (me?.user?.isAdmin) items.push({ href: "/admin", label: "admin", icon: "shield" });

  return (
    <div>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 z-40 flex-col items-center border-r border-line bg-black/95 backdrop-blur py-5 gap-2">
        <Link href="/" className="mb-6 block" aria-label="Lonestar home">
          <img src="/lonestar-emblem.png" alt="Lonestar" className="w-11 h-11 rounded-full object-cover border border-line hover:border-white transition-colors" />
        </Link>
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href + it.label}
              href={it.href}
              className={
                "w-14 flex flex-col items-center gap-1 py-2.5 border transition-colors " +
                (active ? "text-black bg-white border-white" : "text-fog border-transparent hover:text-white hover:border-line")
              }
            >
              <Icon d={ICONS[it.icon]} />
              <span className="mono text-[8px] tracking-[0.2em]">{it.label.toUpperCase()}</span>
            </Link>
          );
        })}
        <div className="mt-auto mono text-[8px] tracking-[0.25em] text-mist" style={{ writingMode: "vertical-rl" }}>
          LONESTAR ON TOP
        </div>
      </aside>
      <header className="md:hidden sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-line">
        <div className="px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/lonestar-emblem.png" alt="Lonestar" className="w-7 h-7 rounded-full object-cover border border-line" />
            <span className="mono text-xs tracking-[0.35em]">LONESTAR</span>
          </Link>
          <nav className="flex items-center gap-4 mono text-[10px] tracking-[0.2em] text-fog">
            <Link href="/members" className="hover:text-white">MEMBERS</Link>
            <Link href="/affiliations" className="hover:text-white">LINKS</Link>
            {me?.authenticated ? (
              <Link href="/me" className="text-white">ME</Link>
            ) : (
              <Link href="/login" className="text-white">LOGIN</Link>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
}
